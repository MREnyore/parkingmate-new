import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { CustomerWithCars } from '@/types/api'

const TextHighlighter = ({
  text,
  searchQuery
}: {
  text: string | number
  searchQuery: string
}) => {
  const textString = String(text)
  if (!searchQuery) return <span>{textString}</span>

  const regex = new RegExp(`(${searchQuery})`, 'gi')
  const parts = textString.split(regex)

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  )
}

export const getCustomerColumns = (
  searchQuery: string,
  onView?: (customer: CustomerWithCars) => void,
  onEdit?: (customer: CustomerWithCars) => void,
  onDelete?: (customer: CustomerWithCars) => void
): ColumnDef<CustomerWithCars>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="pl-5">
        <TextHighlighter
          text={row.getValue('name')}
          searchQuery={searchQuery}
        />
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          E-Mail
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="pl-5">
        <TextHighlighter
          text={row.getValue('email')}
          searchQuery={searchQuery}
        />
      </div>
    )
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Telefon
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const phoneNumber = row.getValue('phoneNumber') as string | null
      return (
        <div className="pl-5">
          <TextHighlighter
            text={phoneNumber ?? '-'}
            searchQuery={searchQuery}
          />
        </div>
      )
    }
  },
  {
    accessorKey: 'cars',
    header: () => <p className="text-base">Fahrzeuge</p>,
    cell: ({ row }) => {
      const cars = row.getValue('cars') as CustomerWithCars['cars']
      return (
        <div>
          {cars.length > 0 ? (
            <div className="flex flex-col gap-1">
              {cars.map((car) => (
                <span key={car.id} className="text-sm">
                  <TextHighlighter
                    text={car.licensePlate}
                    searchQuery={searchQuery}
                  />
                  {car.label && ` (${car.label})`}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'membershipStatus',
    header: () => <p className="text-base">Status</p>,
    cell: ({ row }) => {
      const status = row.getValue('membershipStatus') as
        | 'active'
        | 'expired'
        | 'cancelled'
      const variants = {
        active: 'default' as const,
        expired: 'destructive' as const,
        cancelled: 'secondary' as const
      }

      const labels = {
        active: 'Aktiv',
        expired: 'Abgelaufen',
        cancelled: 'Gekündigt'
      }

      return <Badge variant={variants[status]}>{labels[status]}</Badge>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView?.(row.original)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
