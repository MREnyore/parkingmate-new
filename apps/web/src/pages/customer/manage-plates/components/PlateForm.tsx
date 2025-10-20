import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/useTranslation'
import type { PlateFormData } from '../types'
import { LicensePlate } from './LicensePlate'

interface PlateFormProps {
  formData: PlateFormData
  isEditing: boolean
  onFormChange: (data: PlateFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

export const PlateForm = ({
  formData,
  isEditing,
  onFormChange,
  onSubmit,
  onCancel
}: PlateFormProps) => {
  const { t } = useTranslation()

  const isFormValid =
    formData.number && formData.vehicle && formData.brand && formData.model

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* German License Plate Preview */}
      <div className="text-center">
        <LicensePlate plateNumber={formData.number ?? 'M-AB 1234'} />
      </div>

      {/* Plate Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('plate_number', { defaultValue: 'Kennzeichen' })}
        </label>
        <Input
          value={formData.number}
          onChange={(e) =>
            onFormChange({
              ...formData,
              number: e.target.value.toUpperCase()
            })
          }
          placeholder="M-AB 1234"
          className="text-center font-mono text-lg"
        />
      </div>

      {/* Auto Information Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {t('auto_information', { defaultValue: 'Auto Information' })}
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auto_name', { defaultValue: 'Auto Name' })}
          </label>
          <Input
            value={formData.vehicle}
            onChange={(e) =>
              onFormChange({ ...formData, vehicle: e.target.value })
            }
            placeholder={t('auto_name_placeholder', {
              defaultValue: 'z.B. Mamas Auto'
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auto_brand', { defaultValue: 'Automarke' })}
          </label>
          <Input
            value={formData.brand}
            onChange={(e) =>
              onFormChange({ ...formData, brand: e.target.value })
            }
            placeholder={t('auto_brand_placeholder', {
              defaultValue: 'z.B. BMW, Audi'
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auto_model', { defaultValue: 'Automodell' })}
          </label>
          <Input
            value={formData.model}
            onChange={(e) =>
              onFormChange({ ...formData, model: e.target.value })
            }
            placeholder={t('auto_model_placeholder', {
              defaultValue: 'z.B. A3, Golf'
            })}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t('cancel', { defaultValue: 'Abbrechen' })}
        </Button>
        <Button onClick={onSubmit} disabled={!isFormValid} className="flex-1">
          <Plus size={16} className="mr-1" />
          {isEditing
            ? t('save_changes', { defaultValue: 'Änderungen speichern' })
            : t('add_plate_action', { defaultValue: 'KENNZEICHEN HINZUFÜGEN' })}
        </Button>
      </div>
    </motion.div>
  )
}
