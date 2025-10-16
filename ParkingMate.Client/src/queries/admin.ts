import { useQuery } from '@tanstack/react-query'
import { getAdminUserInfo } from '@/api/admin'
import { useAuth } from '@/stores/sessionStore'

/**
 * Query hook for fetching admin user info
 * Only enabled for Admin role (uses ServiceStack session cookies)
 */
export const useAdminUserInfo = () => {
  const { user, isAuthenticated } = useAuth()
  const isAdmin = user?.roles?.includes('Admin') ?? false

  // would be nice to have the sessionId in the hook
  return useQuery({
    queryKey: ['adminUserInfo', user?.sessionId],
    queryFn: () => getAdminUserInfo(),
    enabled: isAuthenticated && isAdmin, // Only fetch for authenticated admins
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
