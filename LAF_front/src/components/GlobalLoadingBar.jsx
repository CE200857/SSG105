import { useEffect, useState } from "react";
import axios from "axios";

let pending = 0;
let timer = null;
const listeners = new Set();
const notify = (value) => listeners.forEach((fn) => fn(value));

const start = (config) => {
  if (config && config.silent) return;
  pending += 1;
  if (pending === 1) timer = setTimeout(() => notify(true), 150);
};

const done = (config) => {
  if (config && config.silent) return;
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    clearTimeout(timer);
    notify(false);
  }
};

axios.interceptors.request.use(
  (config) => {
    start(config);
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => {
    done(response.config);
    return response;
  },
  (error) => {
    done(error.config);
    return Promise.reject(error);
  },
);

export default function GlobalLoadingBar() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    listeners.add(setActive);
    return () => listeners.delete(setActive);
  }, []);

  return (
    <div className={`lf-loadbar ${active ? "on" : ""}`} aria-hidden="true">
      <span></span>
    </div>
  );
}