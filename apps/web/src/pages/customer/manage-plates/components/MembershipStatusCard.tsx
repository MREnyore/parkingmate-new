import { useTranslation } from '@/hooks/useTranslation'
import type { Customer } from '@/types/api'
import { formatDateTime } from '@/utils/dateUtils'

interface MembershipStatusCardProps {
  customer: Customer
}

export const MembershipStatusCard = ({
  customer
}: MembershipStatusCardProps) => {
  const { t } = useTranslation()

  // Check if membership is active
  const isActive = customer.membershipStatus === 'active'

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">
          {t('membership_status', { defaultValue: 'Mitgliedsstatus' })}
        </h2>
        <div
          className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
      </div>
      <p className="text-sm text-gray-600">
        {isActive ? (
          <>
            {t('valid_until', { defaultValue: 'Gültig bis zum' })}{' '}
            {formatDateTime(customer?.membershipExpiryDate ?? '')}
          </>
        ) : (
          <>
            {t('expired_on', { defaultValue: 'Abgelaufen am' })}{' '}
            {formatDateTime(customer?.membershipExpiryDate ?? '')}
          </>
        )}
      </p>
    </div>
  )
}
