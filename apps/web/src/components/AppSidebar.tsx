import { Link, useLocation } from 'react-router-dom'
import { LanguageSelector } from '@/components/LanguageSelector'
import { NavigationItem } from '@/components/NavigationItem'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import {
  getNavigationItems,
  type NavigationItem as NavigationItemType
} from '@/config/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import { useUserRoles } from '@/stores/sessionStore'
import { LogoutButton } from './LogoutButton'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

// Custom NavigationItem that can force active state
interface UserNavigationItemProps {
  item: NavigationItemType
  variant?: 'sidebar' | 'navbar'
  className?: string
  forceActive?: boolean
  nonClickable?: boolean
}

function UserNavigationItem({
  item,
  variant = 'sidebar',
  className,
  forceActive = false,
  nonClickable = false
}: UserNavigationItemProps) {
  const location = useLocation()
  const isActive = forceActive || location.pathname === item.path
  const Icon = item.icon

  // Only handle sidebar variant since that's what we need
  if (variant === 'sidebar') {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <SidebarMenuButton
              asChild={!nonClickable}
              className={cn(
                'px-10 h-12 justify-start gap-3 rounded-xl group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                isActive && !nonClickable
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : !nonClickable
                    ? 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    : '',
                nonClickable &&
                  'cursor-default bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                className
              )}
            >
              {nonClickable ? (
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span
                    className={cn(
                      'text-sm group-data-[collapsible=icon]:hidden',
                      isActive ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
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
              )}
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    )
  }

  // Fallback to regular NavigationItem for other variants
  return <NavigationItem item={item} variant={variant} className={className} />
}

export const AppSidebar = () => {
  const { t } = useTranslation()
  const { getUserRole } = useUserRoles()
  const userRole = getUserRole()

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    const allItems = getNavigationItems()

    if (userRole === 'Customer') {
      // For users, only show dashboard and make it always active
      const dashboardItem = allItems.find((item) => item.id === 'dashboard')
      if (dashboardItem) {
        // Create a modified dashboard item that's always active for users
        return [
          {
            ...dashboardItem
            // We'll handle the active state in a custom NavigationItem wrapper
          }
        ]
      }
      return []
    }
    // For admins, show all items
    return allItems
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="p-6 group-data-[collapsible=icon]:p-3">
        <div className="flex items-center justify-center">
          {/* Expanded Logo - Black box with PARK-MATE */}
          <div className="bg-black text-white px-6 py-3 rounded-lg group-data-[collapsible=icon]:hidden">
            <div className="text-lg font-bold leading-tight tracking-wide">
              PARK
              <br />
              <span className="relative">
                <span className="absolute left-0 top-0">—</span>
                <span className="ml-4">MATE</span>
              </span>
            </div>
          </div>

          {/* Collapsed Logo - Just P */}
          <div className="hidden group-data-[collapsible=icon]:block bg-black text-white p-3 rounded-lg">
            <div className="text-lg font-bold leading-tight">P</div>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-2 mt-[35%]">
        <SidebarMenu className="space-y-3 group-data-[collapsible=icon]:space-y-2 mt-[100px]">
          {getFilteredNavigationItems().map((item) => (
            <UserNavigationItem
              key={item.id}
              item={item}
              variant="sidebar"
              forceActive={userRole === 'Customer' && item.id === 'dashboard'}
              nonClickable={userRole === 'Customer' && item.id === 'dashboard'}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 space-y-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:space-y-2 group-data-[collapsible=icon]:items-center mb-[50px]">
        <Separator className="group-data-[collapsible=icon]:hidden" />

        {/* User Account Dropdown */}
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <LogoutButton />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t('log_out')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator className="group-data-[collapsible=icon]:hidden" />

        {/* Language Selector */}
        <LanguageSelector
          variant="default"
          className="group-data-[collapsible=icon]:hidden"
        />

        {/* Version */}
        <div className="text-center text-sm text-sidebar-foreground/60 font-medium group-data-[collapsible=icon]:hidden">
          {t('version')}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
