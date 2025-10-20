import type { ParkingSpot } from '../../types'
import { AddParking } from './AddParking'
import { EditParking } from './EditParking'

interface ParkingSheetProps {
  isOpen: boolean
  parkingSpot?: ParkingSpot // undefined for "add" action
  onCancel: () => void
  onSave: (data: any) => Promise<void>
  readOnly?: boolean
  onEnableEdit?: () => void
}

export const ParkingSheet = ({
  isOpen,
  parkingSpot,
  onCancel,
  onSave,
  readOnly = false,
  onEnableEdit
}: ParkingSheetProps) => {
  const isAddMode = !parkingSpot

  return (
    <>
      <AddParking
        isOpen={isOpen && isAddMode}
        onCancel={onCancel}
        onSave={onSave}
      />

      <EditParking
        isOpen={isOpen && !isAddMode}
        parkingSpot={parkingSpot as ParkingSpot}
        onCancel={onCancel}
        onSave={onSave}
        readOnly={readOnly}
        onEnableEdit={onEnableEdit}
      />
    </>
  )
}
