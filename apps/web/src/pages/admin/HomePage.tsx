import { DashboardLayout } from '@/components/DashboardLayout'
import { useTranslation } from '@/hooks/useTranslation'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div>{t('dashboard_content')}</div>
    </DashboardLayout>
  )
}
