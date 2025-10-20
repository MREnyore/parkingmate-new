import { useQuery } from '@tanstack/react-query'
import { getAdminUserInfo } from '@/api/admin'
import { getAllCustomers } from '@/api/admin-customer'
import { useAuth } from '@/stores/sessionStore'

/**
 * Query hook for fetching admin user info
 * Only enabled for Admin role
 */
export const useAdminUserInfo = () => {
  const { user, isAuthenticated } = useAuth()
  const isAdmin = user?.role === 'Admin'

  return useQuery({
    queryKey: ['adminUserInfo', user?.email],
    queryFn: () => getAdminUserInfo(),
    enabled: isAuthenticated && isAdmin, // Only fetch for authenticated admins
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

/**
 * Query hook for fetching all customers
 * Only enabled for Admin role
 */
export const useCustomers = () => {
  const { user, isAuthenticated } = useAuth()
  const isAdmin = user?.role === 'Admin'

  return useQuery({
    queryKey: ['customers', user?.email],
    queryFn: getAllCustomers,
    enabled: isAuthenticated && isAdmin, // Only fetch for authenticated admins
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
