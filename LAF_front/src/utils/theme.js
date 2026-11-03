export const THEME_KEY = "laf_theme";

// Ưu tiên lựa chọn đã lưu; chưa chọn thì theo cài đặt sáng/tối của hệ điều hành
export const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* trình duyệt chặn localStorage: bỏ qua */
  }
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-bs-theme", theme);
};