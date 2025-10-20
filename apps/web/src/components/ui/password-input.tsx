import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  showPasswordToggle?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPasswordToggle = true, onKeyDown, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent space key
      if (e.key === ' ') {
        e.preventDefault()
        return
      }
      // Call original onKeyDown if provided
      onKeyDown?.(e)
    }

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn(showPasswordToggle && 'pr-10', className)}
          ref={ref}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-4 py-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={props.disabled}
          >
            {showPassword ? (
              <Eye className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
