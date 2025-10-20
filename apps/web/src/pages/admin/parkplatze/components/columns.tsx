import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { ParkingSpot } from '../types'
import { RuleBadge } from './RuleBadge'
import { TextHighlighter } from './TextHighlighter'

export const getColumns = (
  searchQuery: string,
  onEdit?: (parkingSpot: ParkingSpot) => void,
  onViewDetails?: (parkingSpot: ParkingSpot) => void,
  onDelete?: (parkingSpot: ParkingSpot) => void
): ColumnDef<ParkingSpot>[] => [
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
    accessorKey: 'address',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Adresse
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="pl-5">
        <TextHighlighter
          text={row.getValue('address')}
          searchQuery={searchQuery}
        />
      </div>
    )
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Kapazität
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="pl-5">
        <TextHighlighter
          text={row.getValue('capacity')}
          searchQuery={searchQuery}
        />
      </div>
    )
  },
  {
    accessorKey: 'violations',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Verstöße
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="pl-5">
        <TextHighlighter
          text={row.getValue('violations')}
          searchQuery={searchQuery}
        />
      </div>
    )
  },
  {
    accessorKey: 'rule',
    header: () => <p className="text-base">Regeln</p>,
    cell: ({ row }) => {
      const rule = row.getValue('rule') as ParkingSpot['rule']
      return (
        <RuleBadge
          value={rule?.value ?? ''}
          type={rule?.type ?? 'minutes'}
          variant={rule?.variant ?? 'blue'}
        />
      )
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
            <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
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
