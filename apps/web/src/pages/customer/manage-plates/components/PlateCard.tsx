import { Edit3, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import type { Car } from '@/lib/api-client'
import { LicensePlate } from './LicensePlate'

interface PlateCardProps {
  car: Car
  index: number
  canDelete: boolean
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
}

export const PlateCard = ({
  car,
  index,
  canDelete,
  onEdit,
  onDelete
}: PlateCardProps) => {
  const { t } = useTranslation()

  const handleDeleteClick = () => {
    onDelete(car)
  }

  return (
    <motion.div
      className="border border-gray-200 rounded-lg p-4 flex flex-col gap-4 min-w-fit"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex flex-col gap-4">
        <LicensePlate plateNumber={car.licensePlate} />
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-medium text-gray-900 truncate">
            {car.label}
          </h2>
          <p className="font-medium text-gray-900 truncate">{car.brand}</p>
          <p className="text-sm text-gray-600 truncate">
            {car.brand} {car.model}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(car)}
          className="flex-1"
        >
          <Edit3 className="mr-1 size-4" />
          {t('edit', { defaultValue: 'BEARBEITEN' })}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          disabled={!canDelete}
          className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300 disabled:text-gray-400"
        >
          <Trash2 className="mr-1 size-4" />
          {t('delete', { defaultValue: 'LÖSCHEN' })}
        </Button>
      </div>
    </motion.div>
  )
}
