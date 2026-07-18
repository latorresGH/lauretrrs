'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'es' | 'en';

/** Un texto localizado tal como viene del JSON. */
export type Localized = { es: string; en: string };

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  /** Resuelve un objeto { es, en } al idioma activo. */
  t: (value: Localized) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');

  const toggle = useCallback(
    () => setLang((l) => (l === 'es' ? 'en' : 'es')),
    [],
  );

  const t = useCallback((value: Localized) => value[lang], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage debe usarse dentro de <LanguageProvider>');
  }
  return ctx;
}

/** Devuelve solo la función de traducción `t`. */
export function useLang() {
  return useLanguage().t;
}
