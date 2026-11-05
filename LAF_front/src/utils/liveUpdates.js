import axios from "axios";

const listeners = new Set();
export const emitUpdates = (topics) => {
  if (!Array.isArray(topics) || topics.length === 0) return;
  for (const listener of listeners) listener(topics);
};

export const subscribeUpdates = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// One pending request per visible tab. Tomcat answers immediately on a mutation;
// the 25-second server timeout is an idle heartbeat, not a data-refresh interval.
export function startLiveUpdates() {
  let stopped = false;
  let controller = null;
  let timer = null;
  let cursor = "";
  let failures = 0;
  let lastFallback = 0;
  let lastSync = Date.now();

  const active = () => !stopped && document.visibilityState !== "hidden" && navigator.onLine !== false;
  const schedule = (delay) => {
    clearTimeout(timer);
    if (active()) timer = setTimeout(poll, delay);
  };
  const poll = async () => {
    if (!active() || controller) return;
    const request = new AbortController();
    controller = request;
    let delay = 100;
    try {
      const response = await axios.get("/api/updates", {
        params: cursor ? { cursor } : {},
        signal: request.signal,
        timeout: 32000,
        silent: true,
      });
      if (request.signal.aborted || stopped) return;
      if (typeof response.data?.cursor !== "string" || !Array.isArray(response.data.topics)) {
        throw new Error("Invalid update response");
      }
      cursor = response.data.cursor;
      failures = 0;
      emitUpdates(response.data.topics);
      // Reconcile occasionally even if a data request failed or SQL was edited directly.
      if (Date.now() - lastSync >= 60000) {
        emitUpdates(["*"]);
        lastSync = Date.now();
      }
    } catch (error) {
      if (request.signal.aborted || axios.isCancel(error) || stopped) return;
      failures += 1;
      delay = Math.min(30000, 1000 * 2 ** Math.min(failures, 5));
      if (Date.now() - lastFallback >= 30000) {
        emitUpdates(["*"]);
        lastFallback = Date.now();
      }
    } finally {
      if (controller === request) controller = null;
      schedule(delay);
    }
  };
  const resume = () => {
    clearTimeout(timer);
    if (!active()) {
      controller?.abort();
      return;
    }
    emitUpdates(["*"]);
    lastSync = Date.now();
    schedule(0);
  };
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("online", resume);
  window.addEventListener("offline", resume);
  schedule(0);
  return () => {
    stopped = true;
    clearTimeout(timer);
    controller?.abort();
    document.removeEventListener("visibilitychange", resume);
    window.removeEventListener("online", resume);
    window.removeEventListener("offline", resume);
  };
}
