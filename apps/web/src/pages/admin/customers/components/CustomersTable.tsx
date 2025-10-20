import type { SortingState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { X } from 'lucide-react'
import { useState } from 'react'
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useDeleteCustomer } from '@/mutations/admin'
import type { CustomerWithCars } from '@/types/api'
import { getCustomerColumns } from './columns'

interface CustomersTableProps {
  data: CustomerWithCars[]
  onView: (customer: CustomerWithCars) => void
  onEdit: (customer: CustomerWithCars) => void
}

export const CustomersTable = ({
  data,
  onView,
  onEdit
}: CustomersTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [customerToDelete, setCustomerToDelete] = useState<
    CustomerWithCars | undefined
  >()
  const {
    isOpen: isDeleteDialogOpen,
    open: openDeleteDialog,
    close: closeDeleteDialog
  } = useDisclosure()

  const handleDeleteClick = (customer: CustomerWithCars) => {
    setCustomerToDelete(customer)
    openDeleteDialog()
  }

  const deleteCustomerMutation = useDeleteCustomer(() => {
    closeDeleteDialog()
    setCustomerToDelete(undefined)
  })

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomerMutation.mutateAsync(customerToDelete.id)
    }
  }

  const handleCancelDelete = () => {
    closeDeleteDialog()
    setCustomerToDelete(undefined)
  }

  const columns = getCustomerColumns(
    globalFilter,
    onView,
    onEdit,
    handleDeleteClick
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      globalFilter
    }
  })

  return (
    <>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Input
            placeholder="Kunden filtern..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pr-8"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setGlobalFilter('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Keine Kunden gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Kunde löschen"
        description={`Möchten Sie den Kunden "${customerToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </>
  )
}
