import { cn } from '@/lib/utils'

interface RuleBadgeProps {
  value: string
  type: 'minutes' | 'hours' | 'days'
  variant: 'blue' | 'green'
}

const variantStyles = {
  blue: 'bg-cyan-500 text-white',
  green: 'bg-green-500 text-white'
} as const

const typeLabels = {
  minutes: 'Min',
  hours: 'Stunden',
  days: 'Tag'
} as const

export function RuleBadge({ value, type, variant }: RuleBadgeProps) {
  const displayText = `${value} ${typeLabels[type]}`

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantStyles[variant]
      )}
    >
      {displayText}
    </span>
  )
}
