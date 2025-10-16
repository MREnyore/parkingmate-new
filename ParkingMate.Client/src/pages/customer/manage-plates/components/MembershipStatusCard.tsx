import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { formatDateTime } from '@/utils/dateUtils'

interface MembershipStatusCardProps {
  membershipInfo: {
    membershipStatus: string
    membershipExpiryDate: string
  }
}

export const MembershipStatusCard = ({
  membershipInfo
}: MembershipStatusCardProps) => {
  const { t } = useTranslation()

  // Check if membership is active
  const isActive = membershipInfo.membershipStatus === 'active'

  return (
    <motion.div
      className="bg-white rounded-lg p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
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
            {formatDateTime(membershipInfo.membershipExpiryDate)}
          </>
        ) : (
          <>
            {t('expired_on', { defaultValue: 'Abgelaufen am' })}{' '}
            {formatDateTime(membershipInfo.membershipExpiryDate)}
          </>
        )}
      </p>
    </motion.div>
  )
}
