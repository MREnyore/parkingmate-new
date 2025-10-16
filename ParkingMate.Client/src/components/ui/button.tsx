import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 active:bg-primary/70 transition-colors',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/80 active:bg-destructive/70 focus-visible:ring-destructive/20',
        outline:
          'border border-input bg-background shadow-sm hover:bg-muted hover:text-muted-foreground active:bg-muted/80 transition-colors',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70 active:bg-secondary/60 transition-colors',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/80 transition-colors',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors',
        soft: 'bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20 transition-colors'
      },
      size: {
        default: 'h-12 px-6 py-3 has-[>svg]:px-5',
        sm: 'h-10 rounded-lg gap-1.5 px-4 py-2 text-sm has-[>svg]:px-3',
        lg: 'h-14 rounded-lg px-8 py-4 text-lg has-[>svg]:px-6',
        icon: 'size-12'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
