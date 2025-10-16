import { useTranslation as useI18nTranslation } from 'react-i18next'

// Re-export the useTranslation hook with better typing
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation()

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage
  }
}
