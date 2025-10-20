import { Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import type { Customer } from '@/types/api'
import { EditCustomerInfo } from './EditCustomerInfo'

interface PersonalInfoCardProps {
  customer: Customer
  isEditing?: boolean
  onEdit?: () => void
  onCancel?: () => void
}

export const PersonalInfoCard = ({
  customer,
  isEditing = false,
  onEdit,
  onCancel
}: PersonalInfoCardProps) => {
  const { t } = useTranslation()

  return (
    <>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t('personal_info', { defaultValue: 'Persönliche Angaben' })}
          </h2>
        </div>

        <div key="display" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
              <p className="text-sm text-gray-600">{customer?.phoneNumber}</p>
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
        </div>
      </div>

      {/* Always render sheet for both mobile and desktop, control via isOpen prop */}
      {customer && onCancel && (
        <EditCustomerInfo
          isOpen={isEditing}
          customerPersonalInfo={customer}
          onCancel={onCancel}
        />
      )}
    </>
  )
}
