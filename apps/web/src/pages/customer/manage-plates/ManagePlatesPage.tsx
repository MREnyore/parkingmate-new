import { useState } from 'react'
import { ErrorPlaceholder } from '@/components/common/ErrorPage'
import { LoadingPlaceholder } from '@/components/common/LoadingPlaceholder'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useGetCustomer } from '@/queries/customer'
import type { Car } from '@/types/api'
import { ManagePlatesContent } from './ManagePlatesContent'

export const ManagePlatesPage = () => {
  const isMobile = useIsMobile()

  // Fetch customer info using React Query
  const { data: customer, isLoading, isError } = useGetCustomer()

  const {
    isOpen: isPlateSheetOpen,
    open: openPlateSheet,
    close: closePlateSheet
  } = useDisclosure()
  const {
    isOpen: isPersonalInfoSheetOpen,
    open: openPersonalInfoSheet,
    close: closePersonalInfoSheet
  } = useDisclosure()

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)

  const startEdit = (car: Car) => {
    setSelectedCarId(car.id ?? '')
    openPlateSheet()
  }

  const startAdd = () => {
    setSelectedCarId(null) // Clear any selected car
    openPlateSheet()
  }

  const resetForm = () => {
    setSelectedCarId(null)
    closePlateSheet()
  }

  // Render mobile version (component handles its own wrapper)
  if (isMobile) {
    if (isLoading) {
      return <LoadingPlaceholder />
    }
    if (isError) {
      return <ErrorPlaceholder />
    }
    return customer ? (
      <ManagePlatesContent
        customer={customer}
        selectedCarId={selectedCarId}
        isPlateSheetOpen={isPlateSheetOpen}
        isPersonalInfoSheetOpen={isPersonalInfoSheetOpen}
        onCancel={resetForm}
        onEdit={startEdit}
        onAddPlate={startAdd}
        onEditPersonalInfo={openPersonalInfoSheet}
        onCancelEditPersonalInfo={closePersonalInfoSheet}
      />
    ) : null
  }

  // Render desktop version wrapped in DashboardLayout
  // DashboardLayout handles loading/error states internally
  return (
    <DashboardLayout isContentError={isError} isContentLoading={isLoading}>
      {customer && (
        <ManagePlatesContent
          customer={customer}
          selectedCarId={selectedCarId}
          isPlateSheetOpen={isPlateSheetOpen}
          isPersonalInfoSheetOpen={isPersonalInfoSheetOpen}
          onCancel={resetForm}
          onEdit={startEdit}
          onAddPlate={startAdd}
          onEditPersonalInfo={openPersonalInfoSheet}
          onCancelEditPersonalInfo={closePersonalInfoSheet}
        />
      )}
    </DashboardLayout>
  )
}
