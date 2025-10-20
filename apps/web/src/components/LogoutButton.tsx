import { Loader2, LogOut } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import { useAdminLogout } from '@/mutations/auth'
import { useCustomerLogout } from '@/mutations/customer'
import { useUserRoles } from '@/stores/sessionStore'
import { Button } from './ui/button'

export const LogoutButton = ({
  placement = 'sidebar'
}: {
  placement?: 'nav' | 'sidebar'
}) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const { getUserRole } = useUserRoles()
  const userRole = getUserRole()

  const {
    mutateAsync: handleCustomerLogout,
    isPending: isCustomerLogoutPending
  } = useCustomerLogout()

  const { mutateAsync: handleAdminLogout, isPending: isAdminLogoutPending } =
    useAdminLogout()

  const handleLogout = async () => {
    if (userRole === 'Customer') {
      // Customer logout - API call clears session
      await handleCustomerLogout()
    } else {
      // Admin logout - API call clears ServiceStack session
      await handleAdminLogout()
    }
  }

  const isLoading =
    userRole === 'Customer' ? isCustomerLogoutPending : isAdminLogoutPending

  return (
    <Button
      variant={isMobile ? 'link' : 'ghost'}
      className={cn(
        !isMobile &&
          'w-full !px-10 justify-start gap-3 h-12 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0',
        isMobile && 'flex items-center gap-2 !p-0',
        placement === 'nav' && 'w-full !p-0 hover:bg-transparent'
      )}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut size={20} />
      <span className="font-medium text-sm group-data-[collapsible=icon]:hidden">
        {t('log_out')}
      </span>
      {isLoading && <Loader2 size={20} className="animate-spin" />}
    </Button>
  )
}
