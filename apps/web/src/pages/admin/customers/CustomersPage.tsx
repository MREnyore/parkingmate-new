import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useTranslation } from '@/hooks/useTranslation'
import { useCustomers } from '@/queries/admin'
import type { CustomerWithCars } from '@/types/api'
import { CustomerSheet } from './components/CustomerSheet'
import { CustomersTable } from './components/CustomersTable'

export const CustomersPage = () => {
  const { t } = useTranslation()
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomerWithCars | undefined
  >()
  const [isReadOnly, setIsReadOnly] = useState(false)
  const {
    isOpen: isDialogOpen,
    open: openDialog,
    close: closeDialog
  } = useDisclosure()

  // Fetch customers
  const { data: response, isLoading, isError } = useCustomers()

  const customers = response?.customers ?? []

  const handleAddClick = () => {
    setSelectedCustomer(undefined)
    setIsReadOnly(false)
    openDialog()
  }

  const handleViewClick = (customer: CustomerWithCars) => {
    setSelectedCustomer(customer)
    setIsReadOnly(true)
    openDialog()
  }

  const handleEditClick = (customer: CustomerWithCars) => {
    setSelectedCustomer(customer)
    setIsReadOnly(false)
    openDialog()
  }

  const handleEnableEdit = () => {
    setIsReadOnly(false)
  }

  const handleSheetClose = () => {
    setSelectedCustomer(undefined)
    closeDialog()

    setTimeout(() => {
      setIsReadOnly(false)
    }, 300)
  }

  return (
    <DashboardLayout isContentError={isError} isContentLoading={isLoading}>
      <Card className="p-6 rounded-sm">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {t('customers')}
                </h1>
                <p className="text-muted-foreground">
                  {t('customers_description')}
                </p>
              </div>
              <Button onClick={handleAddClick}>
                <Plus />
                {t('create_customer')}
              </Button>
            </div>
          </div>

          {/* Customers Table */}
          <CustomersTable
            data={customers}
            onView={handleViewClick}
            onEdit={handleEditClick}
          />
        </div>
      </Card>

      {/* Sheet */}
      <CustomerSheet
        customer={selectedCustomer}
        isOpen={isDialogOpen}
        onCancel={handleSheetClose}
        readOnly={isReadOnly}
        onEnableEdit={handleEnableEdit}
      />
    </DashboardLayout>
  )
}
