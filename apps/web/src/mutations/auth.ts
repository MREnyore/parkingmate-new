import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminLogin,
  adminLogout,
  triggerOtpCode,
  verifyOtpCode
} from '@/api/auth'
import type { AuthTokens } from '@/lib/api-client'
import { useSessionStore } from '@/stores/sessionStore'

// Mutation hook for triggering OTP code
export const useTriggerOtpCode = (
  onSuccess?: (data: {
    success: boolean
    tokens?: AuthTokens
    email?: string
    error?: string
  }) => void
) => {
  return useMutation({
    throwOnError: false,
    mutationFn: triggerOtpCode,
    onSuccess: (data) => {
      if (data.success && onSuccess) {
        onSuccess(data)
      }
    }
  })
}

// Mutation hook for verifying OTP code
export const useVerifyOtpCode = (
  onSuccess?: (data: {
    success: boolean
    tokens?: AuthTokens
    email?: string
    name?: string
    isRegisteredCustomer?: boolean
    error?: string
  }) => void
) => {
  return useMutation({
    throwOnError: false,
    mutationFn: verifyOtpCode,
    onSuccess: (data) => {
      if (data.success && onSuccess) {
        onSuccess(data)
      }
    }
  })
}

// Mutation hook for admin login
export const useAdminLogin = (
  onSuccess?: (data: {
    success: boolean
    error?: string
    tokens?: AuthTokens
    user?: {
      id: string
      email: string
      role: string
      firstName?: string
      lastName?: string
    }
  }) => void
) => {
  return useMutation({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      if (data.success && onSuccess) {
        onSuccess(data)
      }
    }
  })
}

// Mutation hook for admin logout
export const useAdminLogout = () => {
  const clearAuth = useSessionStore((state) => state.clearAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminLogout,
    onSuccess: (data) => {
      if (data.success) {
        clearAuth()
        localStorage.removeItem('bearerToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('isAuthenticated')

        // Clear all React Query cache to prevent stale data on next login
        queryClient.clear()
      }
    }
  })
}
