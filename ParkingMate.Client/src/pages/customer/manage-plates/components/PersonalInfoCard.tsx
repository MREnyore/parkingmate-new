import { Edit3 } from 'lucide-react'
import { motion } from 'motion/react'
import type { CustomerType } from '@/api/customer'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { EditCustomerInfo } from './EditCustomerInfo'

interface PersonalInfoCardProps {
  customerPersonalInfo: CustomerType
  isEditing?: boolean
  onEdit?: () => void
  onCancel?: () => void
}

export const PersonalInfoCard = ({
  customerPersonalInfo,
  isEditing = false,
  onEdit,
  onCancel
}: PersonalInfoCardProps) => {
  const { t } = useTranslation()

  return (
    <>
      <motion.div
        className="bg-white rounded-lg p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t('personal_info', { defaultValue: 'Persönliche Angaben' })}
          </h2>
        </div>

        <motion.div
          key="display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {customerPersonalInfo.name}
              </p>
              <p className="text-sm text-gray-600">
                {customerPersonalInfo.email}
              </p>
              <p className="text-sm text-gray-600">
                {customerPersonalInfo?.phoneNumber}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="self-end"
            >
              <Edit3 className="mr-1 size-4" />
              {t('edit', { defaultValue: 'BEARBEITEN' })}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Always render sheet for both mobile and desktop, control via isOpen prop */}
      {customerPersonalInfo && onCancel && (
        <EditCustomerInfo
          isOpen={isEditing}
          customerPersonalInfo={customerPersonalInfo}
          onCancel={onCancel}
        />
      )}
    </>
  )
}
