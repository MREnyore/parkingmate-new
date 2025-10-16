import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'de' : 'en'
    i18n.changeLanguage(newLanguage)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="min-w-[60px]"
    >
      {i18n.language === 'en' ? 'DE' : 'EN'}
    </Button>
  )
}
