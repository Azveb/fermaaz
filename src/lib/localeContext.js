"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LocaleContext = createContext({ locale: "az", setLocale: () => {} });

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState("az");

  useEffect(() => {
    const saved = localStorage.getItem("fmk_locale");
    if (saved && ["az", "en", "ru"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(lang) {
    setLocaleState(lang);
    localStorage.setItem("fmk_locale", lang);
    document.documentElement.lang = lang;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
