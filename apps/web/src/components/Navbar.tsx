import { LayoutDashboard, Loader2, Settings, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'

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
import { useTranslation } from '@/hooks/useTranslation'
import { useAdminUserInfo } from '@/queries/admin'
import { useGetCustomer } from '@/queries/customer'
import { useUserRoles } from '@/stores/sessionStore'
import { ROUTES } from '@/types/routes'
import { getUserData } from '@/utils/auth'
import { LogoutButton } from './LogoutButton'

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { userName } = getUserData()
  const { getUserRole } = useUserRoles()
  const userRole = getUserRole()

  // Fetch customer info ONLY for customers (not admins)
  // Query is automatically disabled for admins via role check in useGetCustomerInfo
  const { data: customerInfo, isLoading: isLoadingCustomer } = useGetCustomer()

  // Fetch admin info ONLY for admins
  const { data: adminData, isLoading: isLoadingAdmin } = useAdminUserInfo()
  const adminInfo = adminData?.user

  // Loading component for name
  const LoadingName = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="flex items-center space-x-1"
    >
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </motion.div>
  )

  // Get display name based on user role
  const getDisplayName = () => {
    if (userRole === 'Customer') {
      if (customerInfo?.name) {
        return customerInfo.name
      }
    }
    return userName ?? 'User'
  }

  // Get current page name based on route
  const getCurrentPageName = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return t('dashboard')
      case '/account':
        return t('account').toUpperCase()
      default:
        return t('dashboard')
    }
  }

  // Get current page icon based on route
  const getCurrentPageIcon = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return <LayoutDashboard size={20} />
      case '/account':
        return <User size={20} />
      default:
        return <LayoutDashboard size={20} />
    }
  }

  return (
    <header className="flex py-4 px-12 shrink-0 items-center justify-between gap-2 border-b bg-white h-[100px]">
      <div className="flex items-center gap-12">
        {/* Breadcrumb or Welcome Message */}
        <div className="flex items-center gap-3">
          {userRole === 'Customer' ? (
            // User: Show welcome message with person icon
            <div className="flex items-center gap-2">
              <span className="text-blue-600">
                <User size={20} />
              </span>
              <span className="text-xl font-bold text-blue-600 flex items-center min-h-[28px]">
                <AnimatePresence mode="wait">
                  {userRole === 'Customer' && isLoadingCustomer ? (
                    <LoadingName key="loading" />
                  ) : (
                    <motion.span
                      key="welcome"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {t('welcome_user', {
                        defaultValue: `Willkommen, ${getDisplayName()}!`
                      })}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </div>
          ) : (
            // Admin: Show current page info
            <div className="flex items-center gap-2">
              <span className="text-blue-600">{getCurrentPageIcon()}</span>
              <span className="text-xl font-bold text-blue-600">
                {getCurrentPageName()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User Display - Different for user vs admin */}
      {userRole === 'Customer' ? null : (
        // Admin dropdown (existing functionality)
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild={true} className="py-8 px-8">
              <DropdownMenuTrigger asChild={true}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-10 px-3 hover:bg-gray-100"
                >
                  {isLoadingAdmin ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      <span className="font-medium text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <Avatar className="size-10">
                        <AvatarImage
                          src={
                            'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                          }
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {`${adminInfo?.firstName?.charAt(0)}${adminInfo?.lastName?.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">
                          {`${adminInfo?.firstName} ${adminInfo?.lastName}`.trim() ??
                            'Admin'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {adminInfo?.email}
                        </span>
                      </div>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t('account')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="bottom" align="end" className="w-64 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                    }
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {`${adminInfo?.firstName?.charAt(0)}${adminInfo?.lastName?.charAt(0)}`}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {`${adminInfo?.firstName} ${adminInfo?.lastName}`.trim() ??
                      'Admin'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {adminInfo?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate(ROUTES.ACCOUNT)}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('my_account')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-0">
              <LogoutButton placement="nav" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
