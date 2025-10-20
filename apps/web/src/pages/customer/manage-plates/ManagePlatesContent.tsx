import { LogoutButton } from '@/components/LogoutButton'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Car, Customer } from '@/types/api'
import {
  AddPlateButton,
  Footer,
  Header,
  MembershipStatusCard,
  PersonalInfoCard,
  PlatesSection
} from './components'

// Unified content component that handles both mobile and desktop
export const ManagePlatesContent = ({
  customer,
  selectedCarId,
  isPlateSheetOpen,
  isPersonalInfoSheetOpen,
  onCancel,
  onEdit,
  onAddPlate,
  onEditPersonalInfo,
  onCancelEditPersonalInfo
}: {
  customer: Customer
  selectedCarId: string | null
  isPlateSheetOpen: boolean
  isPersonalInfoSheetOpen: boolean
  onCancel: () => void
  onEdit: (plate: Car) => void
  onAddPlate: () => void
  onEditPersonalInfo: () => void
  onCancelEditPersonalInfo: () => void
}) => {
  const isMobile = useIsMobile()

  // Shared content that renders once for both mobile and desktop
  const sharedContent = (
    <>
      <MembershipStatusCard customer={customer} />

      <PersonalInfoCard
        customer={customer}
        isEditing={isPersonalInfoSheetOpen}
        onEdit={onEditPersonalInfo}
        onCancel={onCancelEditPersonalInfo}
      />

      <PlatesSection
        cars={customer?.cars}
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
            <h1 className="font-bold truncate">Willkommen, {customer.name}!</h1>
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
