import { motion } from 'motion/react'
import { useState } from 'react'
import type { CustomerCarInfo } from '@/api/customer'
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useTranslation } from '@/hooks/useTranslation'
import { useDeleteCarInfo } from '@/mutations/customer'
import { AddPlateButton } from './AddPlateButton'
import { EditPlateInfo } from './EditPlateInfo'
import { PlatesList } from './PlatesList'

interface PlatesSectionProps {
  cars: CustomerCarInfo[]
  selectedCarId: string | null
  isPlateSheetOpen: boolean
  onCancel: () => void
  onEdit: (plate: CustomerCarInfo) => void
  onAddPlate?: () => void
}

export const PlatesSection = ({
  cars,
  selectedCarId,
  isPlateSheetOpen,
  onCancel,
  onEdit,
  onAddPlate
}: PlatesSectionProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  // Delete mutation - use the mutation's isPending instead of local state
  const { mutateAsync: deleteCarInfo, isPending: isPendingDeletion } =
    useDeleteCarInfo()

  // Delete dialog state
  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog
  } = useDisclosure()
  const [carToDelete, setCarToDelete] = useState<CustomerCarInfo | null>(null)

  // Find the selected car data from the cars array
  const selectedCarData = selectedCarId
    ? cars.find((car) => car.carId === selectedCarId)
    : undefined

  // Handle delete flow
  const handleDeleteRequest = (car: CustomerCarInfo) => {
    setCarToDelete(car)
    openDeleteDialog()
  }
  const handleDeleteConfirm = async () => {
    if (!carToDelete?.carId) return

    await deleteCarInfo({ carId: carToDelete.carId })
    closeDeleteDialog()
    setCarToDelete(null)
  }
  return (
    <>
      <motion.div
        className="bg-white rounded-lg p-4 shadow-sm"
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t('registered_plates', {
              defaultValue: 'Registrierte Kennzeichen'
            })}
          </h2>

          {/* Show AddPlateButton in header */}
          {onAddPlate && !isMobile && (
            <AddPlateButton onAddPlate={onAddPlate} />
          )}
        </div>

        <PlatesList
          cars={cars}
          onEdit={onEdit}
          onDelete={handleDeleteRequest}
        />
      </motion.div>

      {/* Always render sheet for both mobile and desktop, control via isOpen prop */}
      <EditPlateInfo
        isOpen={isPlateSheetOpen}
        carData={selectedCarData}
        isEditing={Boolean(selectedCarId)}
        onCancel={onCancel}
      />

      {/* Single delete confirmation dialog for all plate cards */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isPendingDeletion={isPendingDeletion}
        itemName={
          carToDelete
            ? `${carToDelete.brand} ${carToDelete.model} (${carToDelete.licensePlate})`
            : ''
        }
        title={t('delete_plate_title', {
          defaultValue: 'Kennzeichen löschen?'
        })}
        description={t('delete_plate_description', {
          defaultValue:
            'Sind Sie sicher, dass Sie dieses Kennzeichen löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
        })}
        confirmText={t('delete', { defaultValue: 'Löschen' })}
        cancelText={t('cancel', { defaultValue: 'Abbrechen' })}
      />
    </>
  )
}
