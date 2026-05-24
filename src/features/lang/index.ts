import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { resources } from './locales'

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  ns: ['common', 'auth', 'menu'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },

  detection: {
    order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
    caches: ['localStorage'],
  },
})

export default i18n
