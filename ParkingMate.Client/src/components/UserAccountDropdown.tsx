import { ChevronUp, Settings } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LogoutButton } from './LogoutButton'

interface UserAccountDropdownProps {
  variant?: 'navbar' | 'sidebar'
  user?: {
    name: string
    email: string
    initials: string
    avatar?: string
  }
  className?: string
}

const DEFAULT_USER = {
  name: 'John Doe',
  email: 'john@example.com',
  initials: 'JD'
}

export function UserAccountDropdown({
  variant = 'navbar',
  user = DEFAULT_USER,
  className
}: UserAccountDropdownProps) {
  const isSidebar = variant === 'sidebar'
  const dropdownSide = isSidebar ? 'top' : 'bottom'
  const dropdownAlign = isSidebar ? 'start' : 'end'
  const marginClass = isSidebar ? 'mb-2 ml-2' : 'mt-2'

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <DropdownMenuTrigger asChild={true}>
            <Button
              variant="ghost"
              className={cn(
                isSidebar
                  ? 'w-full !px-10 justify-start gap-3 h-14 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:gap-0'
                  : 'flex items-center gap-2 h-10 px-3 hover:bg-gray-100',
                className
              )}
            >
              <Avatar
                className={cn(
                  isSidebar
                    ? 'h-6 w-6 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6'
                    : 'h-7 w-7'
                )}
              >
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'flex flex-col items-start',
                  isSidebar ? 'group-data-[collapsible=icon]:hidden' : ''
                )}
              >
                <span className="font-medium text-sm">{user.name}</span>
                <span
                  className={cn(
                    'text-xs',
                    isSidebar
                      ? 'text-sidebar-foreground/60'
                      : 'text-muted-foreground'
                  )}
                >
                  {user.email}
                </span>
              </div>
              <ChevronUp
                className={cn(
                  'h-4 w-4',
                  isSidebar
                    ? 'ml-auto group-data-[collapsible=icon]:hidden'
                    : ''
                )}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent
          side={isSidebar ? 'right' : 'bottom'}
          className={isSidebar ? 'group-data-[state=expanded]:hidden' : ''}
        >
          <p>Account</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        side={dropdownSide}
        align={dropdownAlign}
        className={cn('w-64', marginClass)}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>My Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild={true}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
