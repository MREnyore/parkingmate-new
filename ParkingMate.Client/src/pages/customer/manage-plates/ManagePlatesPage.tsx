import { useState } from 'react'
import type { CustomerCarInfo, GetCustomerInfoResponse } from '@/api/customer'
import { ErrorPage } from '@/components/common'
import { DashboardLayout } from '@/components/DashboardLayout'
import { LogoutButton } from '@/components/LogoutButton'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useGetCustomerInfo } from '@/queries/customer'
import {
  AddPlateButton,
  Footer,
  Header,
  MembershipStatusCard,
  PersonalInfoCard,
  PlatesSection
} from './components'

// Loading component
const LoadingPage = () => {
  const isMobile = useIsMobile()

  const LoadingContent = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading data...</p>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 px-4 py-6">
          <LoadingContent />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <LoadingContent />
    </DashboardLayout>
  )
}

// Unified content component that handles both mobile and desktop
const ManagePlatesContent = ({
  rawCustomerInfo,
  selectedCarId,
  isPlateSheetOpen,
  isPersonalInfoSheetOpen,
  onCancel,
  onEdit,
  onAddPlate,
  onEditPersonalInfo,
  onCancelEditPersonalInfo
}: {
  rawCustomerInfo: GetCustomerInfoResponse
  selectedCarId: string | null
  isPlateSheetOpen: boolean
  isPersonalInfoSheetOpen: boolean
  onCancel: () => void
  onEdit: (plate: CustomerCarInfo) => void
  onAddPlate: () => void
  onEditPersonalInfo: () => void
  onCancelEditPersonalInfo: () => void
}) => {
  const isMobile = useIsMobile()

  // Shared content that renders once for both mobile and desktop
  const sharedContent = (
    <>
      <MembershipStatusCard membershipInfo={rawCustomerInfo} />

      <PersonalInfoCard
        customerPersonalInfo={{
          name: rawCustomerInfo.name,
          email: rawCustomerInfo.email,
          phoneNumber: rawCustomerInfo?.phoneNumber,
          address: rawCustomerInfo?.address,
          postalCode: rawCustomerInfo?.postalCode,
          city: rawCustomerInfo?.city
        }}
        isEditing={isPersonalInfoSheetOpen}
        onEdit={onEditPersonalInfo}
        onCancel={onCancelEditPersonalInfo}
      />

      <PlatesSection
        cars={rawCustomerInfo.cars}
        selectedCarId={selectedCarId}
        isPlateSheetOpen={isPlateSheetOpen}
        onCancel={onCancel}
        onEdit={onEdit}
        onAddPlate={onAddPlate}
      />
    </>
  )

  // Mobile wrapper with Header/Footer
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="flex-1 px-4 py-6 pb-8 space-y-6">
          {/* Mobile-specific welcome header */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-bold truncate">
              Willkommen, {rawCustomerInfo.name}!
            </h1>
            <LogoutButton />
          </div>

          {/* Shared content */}
          {sharedContent}

          {/* Mobile-specific AddPlateButton below section */}
          <AddPlateButton onAddPlate={onAddPlate} />
        </div>

        <Footer />
      </div>
    )
  }

  // Desktop content (no wrapper - DashboardLayout provides it)
  return <div className="space-y-6">{sharedContent}</div>
}

export const ManagePlatesPage = () => {
  const isMobile = useIsMobile()

  // Fetch customer info using React Query
  const { data: rawCustomerInfo, isLoading, error } = useGetCustomerInfo()

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

  const startEdit = (car: CustomerCarInfo) => {
    setSelectedCarId(car.carId)
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

  // Common props for both mobile and desktop components
  const commonProps = {
    rawCustomerInfo: rawCustomerInfo as GetCustomerInfoResponse,
    selectedCarId,
    isPlateSheetOpen,
    isPersonalInfoSheetOpen,
    onCancel: resetForm,
    onEdit: startEdit,
    onAddPlate: startAdd,
    onEditPersonalInfo: openPersonalInfoSheet,
    onCancelEditPersonalInfo: closePersonalInfoSheet
  }

  // Show loading state while fetching customer info
  if (isLoading) {
    return <LoadingPage />
  }

  // Handle error state
  if (error) {
    return <ErrorPage />
  }

  // Render mobile version (component handles its own wrapper)
  if (isMobile) {
    return <ManagePlatesContent {...commonProps} />
  }

  // Render desktop version wrapped in DashboardLayout
  return (
    <DashboardLayout>
      <ManagePlatesContent {...commonProps} />
    </DashboardLayout>
  )
}
