import { useEffect, useState } from "react";
import { THEME_KEY, applyTheme, getInitialTheme } from "../utils/theme";

// Nút đổi giao diện sáng/tối: giao diện sáng hiện mặt trăng, giao diện tối hiện mặt trời
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const current = document.documentElement.getAttribute("data-bs-theme");
    return current === "dark" || current === "light"
      ? current
      : getInitialTheme();
  });
  const isDark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-anim"); // đổi màu mượt trong ~0,5 giây
    setTimeout(() => root.classList.remove("theme-anim"), 500);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* bỏ qua */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? "is-dark" : ""}`}
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Giao diện sáng" : "Giao diện tối"}
    >
      <i className="bi bi-moon-stars-fill theme-icon moon"></i>
      <i className="bi bi-sun-fill theme-icon sun"></i>
    </button>
  );
}