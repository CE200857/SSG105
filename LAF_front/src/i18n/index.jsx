/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import vi from "./vi";
import en from "./en";
import ja from "./ja";
import "./lang.css";

export const LANG_KEY = "laf_lang";
export const DEFAULT_LANG = "vi";

// Tên ngôn ngữ luôn viết bằng chính ngôn ngữ đó để người dùng dễ nhận ra
// (short: mã ngắn hiển thị trên nút, vì Windows không hiện được emoji lá cờ)
export const LANGUAGES = [
  { code: "vi", name: "Tiếng Việt", short: "VI" },
  { code: "en", name: "English", short: "EN" },
  { code: "ja", name: "日本語", short: "JA" },
];

const DICTS = { vi, en, ja };

export const getSavedLang = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch {
    /* trình duyệt chặn localStorage: bỏ qua */
  }
  return DEFAULT_LANG;
};

// Thay {tên} trong chuỗi bằng giá trị truyền vào: t("key", { tên: "An" })
const format = (text, params) =>
  params
    ? text.replace(/\{(\w+)\}/g, (match, k) =>
        params[k] !== undefined ? String(params[k]) : match,
      )
    : text;

// Thiếu chuỗi ở ngôn ngữ đang chọn -> dùng tiếng Việt; thiếu luôn -> hiện chính khóa
export const translate = (lang, key, params) => {
  const text = DICTS[lang]?.[key] ?? DICTS[DEFAULT_LANG][key] ?? key;
  return format(text, params);
};

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key, params) => translate(DEFAULT_LANG, key, params),
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(getSavedLang);

  const setLang = useCallback((code) => {
    if (!DICTS[code]) return;
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch {
      /* bỏ qua */
    }
    setLangState(code);
  }, []);

  // Cập nhật thuộc tính lang của trang (để trình duyệt chọn đúng font) và tiêu đề tab
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate(lang, "app.title");
  }, [lang]);

  // Đổi ngôn ngữ ở tab khác thì tab này đồng bộ theo
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LANG_KEY) setLangState(getSavedLang());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Dùng trong component: const { t, lang, setLang } = useI18n();
export const useI18n = () => useContext(LanguageContext);
