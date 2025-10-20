import { useQuery } from '@tanstack/react-query'
import { getCustomer, validateRegistrationToken } from '@/api/customer'
import { useAuth } from '@/stores/sessionStore'

/**
 * Query hook for fetching customer information
 * - Retries: 2 attempts with exponential backoff (network errors only)
 * - Stale time: 1 hour (data considered fresh)
 * - Cache time: 1 hour (data kept in cache)
 * - Refetch: On window focus and reconnect
 * - Only enabled for Customer role (not Admin)
 */
export const useGetCustomer = () => {
  const { user, isAuthenticated } = useAuth()
  const isCustomer = user?.role === 'Customer'
  return useQuery({
    queryKey: ['customer', user?.email],
    queryFn: getCustomer,
    enabled: isAuthenticated && !!user?.email && isCustomer,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors like NotFound, Unauthorized)
      if (error instanceof Error && error.message.includes('4')) return false
      // Retry up to 2 times for network/server errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, max 30s
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: false
  })
}

/**
 * Query hook for validating registration token
 * - Retries: None (validation is deterministic)
 * - Stale time: Infinity (token validity doesn't change)
 * - Cache time: Infinity (keep result for session)
 * - Refetch: Disabled (one-time validation)
 */
export const useValidateRegistrationToken = ({
  registrationToken
}: {
  registrationToken: string
}) => {
  return useQuery({
    queryKey: ['validateRegistration', registrationToken],
    queryFn: () => {
      if (!registrationToken) return { valid: false, email: '', name: '' }
      return validateRegistrationToken(registrationToken)
    },
    enabled: !!registrationToken,
    retry: false, // No retries - token is either valid or not
    staleTime: Infinity, // Never refetch - validation result is immutable
    gcTime: Infinity, // Never invalidate
    refetchOnWindowFocus: false, // Don't revalidate on focus
    refetchOnReconnect: false, // Don't revalidate on reconnect
    throwOnError: false
  })
}
