import { useTranslation } from '@/hooks/useTranslation'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-6 mt-auto">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{t('impressum', { defaultValue: 'Impressum' })}</span>
        <span>©ticketmate2025</span>
        <span>{t('datenschutz', { defaultValue: 'Datenschutz' })}</span>
      </div>
    </footer>
  )
}
