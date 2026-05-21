type Language = 'en' | 'zh' | 'ja' | 'fr' | 'de' | 'es' | 'ru' | 'ko' | 'it' | 'pt'

interface LanguageRecord {
  code: Language
  name: string
}

export const DEFAULT_LANGUAGE: Language = 'en'

export const LANGUAGE_RECORDS: LanguageRecord[] = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
]
