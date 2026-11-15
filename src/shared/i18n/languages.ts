import { en, type Messages } from './locales/en'
import { es } from './locales/es'

/**
 * Registered languages. To add one: create locales/<id>.ts typed as `Messages`
 * and add an entry here. `locale` is used for Intl date/number formatting.
 */
export const LANGUAGES = {
  en: { label: 'English', locale: 'en', messages: en },
  es: { label: 'Español', locale: 'es', messages: es },
} satisfies Record<string, { label: string; locale: string; messages: Messages }>

export type Language = keyof typeof LANGUAGES

export const DEFAULT_LANGUAGE: Language = 'en'

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.hasOwn(LANGUAGES, value)
}

/** First supported language among the browser preferences, e.g. ["es-AR", "en"] -> "es". */
export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if (isLanguage(base)) return base
  }
  return DEFAULT_LANGUAGE
}
