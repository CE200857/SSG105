/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import axios from "axios";
import { subscribeUpdates } from "../utils/liveUpdates";

// Cancels stale filters/accounts, coalesces bursts, and keeps loading indicators
// under the caller's control. load must check isCurrent() before updating state.
export default function useLiveQuery(topics, load, dependencies = []) {
  const loader = useRef(load);
  const request = useRef(null);
  const mounted = useRef(false);
  const dirty = useRef(false);
  const timer = useRef(null);
  useLayoutEffect(() => { loader.current = load; });

  const refresh = useCallback(async function refreshQuery(options = {}) {
    if (!mounted.current) return;
    const background = options.background === true;
    if (background && request.current) {
      dirty.current = true;
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const isCurrent = () => mounted.current && !controller.signal.aborted && request.current === controller;
    try {
      await loader.current({ ...options, background, signal: controller.signal, isCurrent });
    } catch (error) {
      if (!axios.isCancel(error) && isCurrent()) console.error("Không thể cập nhật dữ liệu:", error);
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (dirty.current && mounted.current) {
          dirty.current = false;
          clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            timer.current = null;
            refreshQuery({ background: true });
          }, 150);
        }
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
      dirty.current = false;
      clearTimeout(timer.current);
      timer.current = null;
      request.current?.abort();
      request.current = null;
    };
  }, dependencies);

  const topicKey = topics.join(",");
  useEffect(() => subscribeUpdates((changed) => {
    if (!changed.includes("*") && !changed.some((topic) => topicKey.split(",").includes(topic))) return;
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      refresh({ background: true });
    }, 150);
  }), [topicKey, refresh]);

  return refresh;
}
