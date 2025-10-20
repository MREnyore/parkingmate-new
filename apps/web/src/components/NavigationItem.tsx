import { Link, useLocation } from 'react-router-dom'

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import type { NavigationItem as NavigationItemType } from '@/config/navigation'
import { cn } from '@/lib/utils'

interface NavigationItemProps {
  item: NavigationItemType
  variant?: 'sidebar' | 'navbar'
  className?: string
}

export function NavigationItem({
  item,
  variant = 'sidebar',
  className
}: NavigationItemProps) {
  const location = useLocation()
  const isActive = location.pathname === item.path
  const Icon = item.icon

  if (variant === 'navbar') {
    // Navbar version - simple button
    return (
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <Link
            to={item.path}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
              isActive &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
              className
            )}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{item.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Sidebar version - using SidebarMenuItem
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <SidebarMenuButton
            asChild={true}
            className={cn(
              'px-10 h-12 justify-start gap-3 rounded-xl group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              className
            )}
          >
            <Link to={item.path}>
              <Icon size={20} />
              <span
                className={cn(
                  'text-sm group-data-[collapsible=icon]:hidden',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {item.label}
              </span>
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}
