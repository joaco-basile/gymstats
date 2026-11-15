import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext } from './context'
import { LANGUAGES, detectLanguage, isLanguage, type Language } from './languages'

const STORAGE_KEY = 'gymstats.language'

// The language is a per-device preference, so localStorage is enough (and it may be unavailable).
function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    /* storage blocked: fall back to browser preference */
  }
  return detectLanguage(navigator.languages ?? [navigator.language])
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      t: LANGUAGES[language].messages,
      locale: LANGUAGES[language].locale,
      setLanguage: (next: Language) => {
        setLanguageState(next)
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {
          /* ignore: the choice still applies for this session */
        }
      },
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
