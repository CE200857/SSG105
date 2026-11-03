import { THEME_KEY, applyTheme, getInitialTheme } from "./theme";

export const SETTINGS_EVENT = "laf-settings-changed";
export const THEME_EVENT = "laf-theme-changed";

const DISPLAY_KEY = "laf_display";
const NOTIF_PREFIX = "laf_notif_prefs_";

/* ---------------- Giao diện sáng / tối / theo hệ thống ---------------- */
export const getThemeMode = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* bỏ qua */
  }
  return "system";
};

export const setThemeMode = (mode) => {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  setTimeout(() => root.classList.remove("theme-anim"), 500);
  try {
    if (mode === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* bỏ qua */
  }
  applyTheme(mode === "system" ? getInitialTheme() : mode);
  window.dispatchEvent(new Event(THEME_EVENT));
};

/* ---------------- Cỡ chữ & hiệu ứng ---------------- */
export const FONT_SIZES = {
  small: { label: "Nhỏ", labelKey: "settings.font.small", px: 14.5 },
  normal: { label: "Vừa", labelKey: "settings.font.normal", px: 16 },
  large: { label: "Lớn", labelKey: "settings.font.large", px: 18 },
};

const DEFAULT_DISPLAY = { fontSize: "normal", reduceMotion: false };

export const getDisplaySettings = () => {
  try {
    return {
      ...DEFAULT_DISPLAY,
      ...(JSON.parse(localStorage.getItem(DISPLAY_KEY)) || {}),
    };
  } catch {
    return { ...DEFAULT_DISPLAY };
  }
};

export const applyDisplaySettings = (d = getDisplaySettings()) => {
  const root = document.documentElement;
  const size = FONT_SIZES[d.fontSize] || FONT_SIZES.normal;
  root.style.fontSize = `${size.px}px`;
  root.classList.toggle("reduce-motion", !!d.reduceMotion);
};

export const saveDisplaySettings = (patch) => {
  const next = { ...getDisplaySettings(), ...patch };
  try {
    localStorage.setItem(DISPLAY_KEY, JSON.stringify(next));
  } catch {
    /* bỏ qua */
  }
  applyDisplaySettings(next);
  window.dispatchEvent(new Event(SETTINGS_EVENT));
  return next;
};

// Gọi một lần khi mở web: áp cỡ chữ/hiệu ứng đã lưu và theo dõi chế độ sáng/tối của hệ thống
export const initDisplaySettings = () => {
  applyDisplaySettings();
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (getThemeMode() === "system") {
          applyTheme(getInitialTheme());
          window.dispatchEvent(new Event(THEME_EVENT));
        }
      });
  }
};

/* ---------------- Thông báo (theo từng tài khoản) ---------------- */
const DEFAULT_NOTIF = { likes: true, comments: true, shares: true };

export const getNotifPrefs = (email) => {
  if (!email) return { ...DEFAULT_NOTIF };
  try {
    return {
      ...DEFAULT_NOTIF,
      ...(JSON.parse(localStorage.getItem(NOTIF_PREFIX + email)) || {}),
    };
  } catch {
    return { ...DEFAULT_NOTIF };
  }
};

export const saveNotifPrefs = (email, patch) => {
  const next = { ...getNotifPrefs(email), ...patch };
  try {
    localStorage.setItem(NOTIF_PREFIX + email, JSON.stringify(next));
  } catch {
    /* bỏ qua */
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
  return next;
};

// Thông báo hệ thống (duyệt bài, xóa bài, đổi trạng thái...) luôn hiện
export const isNotifVisible = (type, prefs) => {
  if (type === "LIKE_POST" || type === "LIKE_COMMENT") return prefs.likes;
  if (type === "COMMENT" || type === "REPLY_COMMENT") return prefs.comments;
  if (type === "SHARE") return prefs.shares;
  return true;
};
