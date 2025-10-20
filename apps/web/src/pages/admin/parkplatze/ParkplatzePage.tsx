import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useTranslation } from '@/hooks/useTranslation'
import { ParkingTable } from './components/ParkingTable'
import { ParkingSheet } from './components/parking-spot-sheet/ParkingSheet'
import type { ParkingSpot } from './types'

// Extended mock data with full rule configurations
const mockParkingSpotsWithRules: ParkingSpot[] = [
  {
    id: '1',
    name: 'Studio Nord',
    address: 'Hauptstraße 12, München',
    capacity: 22,
    violations: 4,
    rule: { value: '90', type: 'minutes' as const, variant: 'blue' as const },
    ruleConfig: {
      maxParkingDuration: {
        enabled: true,
        value: '90',
        unit: 'minutes' as const
      },
      validTimes: {
        enabled: true,
        days: 'Mo - Fr',
        timeRange: '[08:00] bis [18:00]'
      },
      accessControl: { enabled: true, type: 'registered' as const },
      maxVehiclesPerUser: { enabled: false, value: '1' },
      penaltyFee: { enabled: true, value: '40' }
    }
  },
  {
    id: '2',
    name: 'Tiefgarage West',
    address: 'Lindwurmstraße 88, München',
    capacity: 35,
    violations: 12,
    rule: { value: '2', type: 'hours' as const, variant: 'green' as const },
    ruleConfig: {
      maxParkingDuration: { enabled: true, value: '2', unit: 'hours' as const },
      validTimes: {
        enabled: false,
        days: 'Mo - Fr',
        timeRange: '[08:00] bis [18:00]'
      },
      accessControl: { enabled: true, type: 'registered_and_guests' as const },
      maxVehiclesPerUser: { enabled: true, value: '2' },
      penaltyFee: { enabled: true, value: '50' }
    }
  },
  {
    id: '3',
    name: 'Parkhaus Zentrum',
    address: 'Marienplatz 5, München',
    capacity: 150,
    violations: 8,
    rule: { value: '3', type: 'days' as const, variant: 'blue' as const },
    ruleConfig: {
      maxParkingDuration: { enabled: true, value: '3', unit: 'hours' as const },
      validTimes: {
        enabled: true,
        days: 'Mo - So',
        timeRange: '[06:00] bis [22:00]'
      },
      accessControl: { enabled: false, type: 'registered' as const },
      maxVehiclesPerUser: { enabled: false, value: '1' },
      penaltyFee: { enabled: false, value: '40' }
    }
  },
  {
    id: '4',
    name: 'Außenparkplatz Süd',
    address: 'Sonnenstraße 45, München',
    capacity: 18,
    violations: 2,
    rule: { value: '180', type: 'minutes' as const, variant: 'green' as const },
    ruleConfig: {
      maxParkingDuration: {
        enabled: true,
        value: '180',
        unit: 'minutes' as const
      },
      validTimes: {
        enabled: false,
        days: 'Mo - Fr',
        timeRange: '[08:00] bis [18:00]'
      },
      accessControl: { enabled: true, type: 'registered' as const },
      maxVehiclesPerUser: { enabled: true, value: '3' },
      penaltyFee: { enabled: true, value: '60' }
    }
  },
  {
    id: '5',
    name: 'Mitarbeiter Parkdeck',
    address: 'Leopoldstraße 120, München',
    capacity: 45,
    violations: 1,
    rule: { value: '24', type: 'hours' as const, variant: 'blue' as const },
    ruleConfig: {
      maxParkingDuration: {
        enabled: false,
        value: '90',
        unit: 'minutes' as const
      },
      validTimes: {
        enabled: false,
        days: 'Mo - Fr',
        timeRange: '[08:00] bis [18:00]'
      },
      accessControl: { enabled: true, type: 'registered' as const },
      maxVehiclesPerUser: { enabled: true, value: '1' },
      penaltyFee: { enabled: false, value: '40' }
    }
  }
]

// Extract just the ParkingSpot data for the table
const mockParkingSpots: ParkingSpot[] = mockParkingSpotsWithRules.map(
  ({ ruleConfig, ...spot }) => spot
)

export const ParkplatzePage = () => {
  const { t } = useTranslation()
  const [selectedParkingSpot, setSelectedParkingSpot] = useState<
    ParkingSpot | undefined
  >()
  const [parkingSpotToDelete, setParkingSpotToDelete] = useState<
    ParkingSpot | undefined
  >()
  const [isReadOnly, setIsReadOnly] = useState(false)
  const {
    isOpen: isSheetOpen,
    open: openSheet,
    close: closeSheet
  } = useDisclosure()
  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog
  } = useDisclosure()

  const handleAddClick = () => {
    setSelectedParkingSpot(undefined) // undefined = add mode
    setIsReadOnly(false)
    openSheet()
  }

  const handleEditClick = (parkingSpot: ParkingSpot) => {
    // Find the full parking spot data with ruleConfig
    const fullParkingSpot = mockParkingSpotsWithRules.find(
      (p) => p.id === parkingSpot.id
    )
    setSelectedParkingSpot(fullParkingSpot) // set parking spot = edit mode
    setIsReadOnly(false)
    openSheet()
  }

  const handleViewDetails = (parkingSpot: ParkingSpot) => {
    // Find the full parking spot data with ruleConfig
    const fullParkingSpot = mockParkingSpotsWithRules.find(
      (p) => p.id === parkingSpot.id
    )
    setSelectedParkingSpot(fullParkingSpot) // set parking spot for view
    setIsReadOnly(true)
    openSheet()
  }

  const handleEnableEdit = () => {
    setIsReadOnly(false) // switch from view to edit mode
  }

  const handleDeleteClick = (parkingSpot: ParkingSpot) => {
    setParkingSpotToDelete(parkingSpot)
    openDeleteDialog()
  }

  const handleConfirmDelete = () => {
    if (parkingSpotToDelete) {
      console.log('Deleting parking spot:', parkingSpotToDelete)
      // TODO: Implement actual delete logic
      closeDeleteDialog()
      setParkingSpotToDelete(undefined)
    }
  }

  const handleCancelDelete = () => {
    closeDeleteDialog()
    setParkingSpotToDelete(undefined)
  }

  const handleSave = async (data: {
    name: string
    address: string
    capacity: string
  }) => {
    console.log('Saving parking spot:', {
      ...data,
      capacity: parseInt(data.capacity, 10)
    })
    // TODO: Implement API call to save parking spot
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
  }

  const handleCloseSheet = () => {
    closeSheet()
    setSelectedParkingSpot(undefined)
    setIsReadOnly(false)
  }

  return (
    <DashboardLayout>
      <Card className="p-6 rounded-sm">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {t('parkplatze')}
                </h1>
                <p className="text-muted-foreground">
                  Manage parking spaces and their configurations
                </p>
              </div>
              <Button onClick={handleAddClick}>
                <Plus />
                NEUEN PARKPLATZ ERSTELLEN
              </Button>
            </div>
          </div>

          {/* Parking Table */}
          <ParkingTable
            data={mockParkingSpots}
            onEdit={handleEditClick}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteClick}
          />
        </div>
      </Card>

      {/* Add/Edit/View Sheet - ParkingSheet handles all modes */}
      <ParkingSheet
        isOpen={isSheetOpen}
        parkingSpot={selectedParkingSpot}
        onCancel={handleCloseSheet}
        onSave={handleSave}
        readOnly={isReadOnly}
        onEnableEdit={handleEnableEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Parkplatz löschen"
        description={`Sind Sie sicher, dass Sie den Parkplatz "${parkingSpotToDelete?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </DashboardLayout>
  )
}
