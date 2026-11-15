import { describe, expect, it } from 'vitest'
import { DEFAULT_LANGUAGE, LANGUAGES, detectLanguage, isLanguage } from './languages'

function collectKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? collectKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('detectLanguage', () => {
  it('picks the first supported language from the browser preferences', () => {
    expect(detectLanguage(['es-AR', 'en-US'])).toBe('es')
    expect(detectLanguage(['fr-FR', 'en-GB'])).toBe('en')
  })

  it('falls back to the default language when nothing matches', () => {
    expect(detectLanguage(['fr-FR', 'de'])).toBe(DEFAULT_LANGUAGE)
    expect(detectLanguage([])).toBe(DEFAULT_LANGUAGE)
  })
})

describe('isLanguage', () => {
  it('accepts only registered languages', () => {
    expect(isLanguage('es')).toBe(true)
    expect(isLanguage('en')).toBe(true)
    expect(isLanguage('fr')).toBe(false)
    expect(isLanguage(null)).toBe(false)
  })
})

describe('translations', () => {
  it('every language defines exactly the same keys as English', () => {
    const reference = collectKeys(LANGUAGES.en.messages).sort()
    for (const [id, lang] of Object.entries(LANGUAGES)) {
      expect(collectKeys(lang.messages).sort(), `language "${id}"`).toEqual(reference)
    }
  })

  it('interpolates values in Spanish', () => {
    const es = LANGUAGES.es.messages
    expect(es.today.ofTarget(2633)).toBe('de 2633 kcal')
    expect(es.today.units(1)).toBe('1 unidad')
    expect(es.today.units(3)).toBe('3 unidades')
  })
})
