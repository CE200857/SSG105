/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from "react";
import vi from "./vi";

// Website chỉ dùng tiếng Việt (không còn chuyển đổi ngôn ngữ)
export const DEFAULT_LANG = "vi";

// Thay {tên} trong chuỗi bằng giá trị truyền vào: t("key", { tên: "An" })
const format = (text, params) =>
  params
    ? text.replace(/\{(\w+)\}/g, (match, k) =>
        params[k] !== undefined ? String(params[k]) : match,
      )
    : text;

// Thiếu chuỗi -> hiện chính khóa
export const translate = (lang, key, params) => format(vi[key] ?? key, params);

const t = (key, params) => translate(DEFAULT_LANG, key, params);

const LanguageContext = createContext({ lang: DEFAULT_LANG, t });

export const LanguageProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.lang = DEFAULT_LANG;
    document.title = t("app.title");
    // Dọn lựa chọn ngôn ngữ cũ (nếu trước đây từng chọn EN/JA)
    try {
      localStorage.removeItem("laf_lang");
    } catch {
      /* bỏ qua */
    }
  }, []);

  const value = useMemo(() => ({ lang: DEFAULT_LANG, t }), []);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Dùng trong component: const { t } = useI18n();
export const useI18n = () => useContext(LanguageContext);
