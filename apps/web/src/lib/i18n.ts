import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import deTranslations from '../locales/de/translations.json'
import enTranslations from '../locales/en/translations.json'

const resources = {
  en: {
    translation: enTranslations
  },
  de: {
    translation: deTranslations
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // default language
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false // React already escapes values
  },

  // Enable keySeparator: false for flat translations
  keySeparator: false,
  nsSeparator: false
})

export default i18n
