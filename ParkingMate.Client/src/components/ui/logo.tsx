import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'default' | 'compact' | 'auth' | 'branding'
  className?: string
}

export function Logo({ variant = 'default', className }: LogoProps) {
  const variants = {
    // Default logo for sidebar
    default: {
      container: 'bg-primary text-primary-foreground p-3 rounded-xl',
      icon: 'text-xl font-bold leading-tight',
      text: 'text-2xl font-bold text-sidebar-foreground tracking-wide'
    },
    // Compact logo for collapsed sidebar
    compact: {
      container: 'bg-primary text-primary-foreground p-2 rounded-xl',
      icon: 'text-lg font-bold leading-tight',
      text: 'hidden'
    },
    // Auth pages logo
    auth: {
      container:
        'bg-primary text-primary-foreground p-4 rounded-lg inline-block',
      icon: 'text-xl font-bold leading-tight',
      text: 'hidden'
    },
    // Branding logo for auth right side
    branding: {
      container:
        'bg-blue-600 text-white p-8 rounded-2xl inline-block relative z-20 shadow-lg',
      icon: 'text-4xl font-bold leading-tight',
      text: 'hidden'
    }
  }

  const config = variants[variant]

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className={config.container}>
        <div className={config.icon}>
          {variant === 'branding' || variant === 'auth' ? (
            <>
              PARKING
              <br />
              -MATE
            </>
          ) : (
            'P'
          )}
        </div>
      </div>
      {variant === 'default' && <div className={config.text}>PARKMATE</div>}
    </div>
  )
}
