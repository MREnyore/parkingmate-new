import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changeAdminUserPassword, updateAdminUserProfile } from '@/api/admin'
import {
  createCustomer,
  deleteCustomer,
  updateCustomer
} from '@/api/admin-customer'
import { useAuth } from '@/stores/sessionStore'
import type { CreateCustomerRequest, UpdateCustomerRequest } from '@/types/api'

// Mutation hook for updating user profile
export const useUpdateUserProfile = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: { firstName?: string; lastName?: string }) =>
      updateAdminUserProfile(payload),
    onSuccess: (data) => {
      // Only proceed if the API call was actually successful
      if (data.success && onSuccess) {
        onSuccess(data)
        queryClient.invalidateQueries({
          queryKey: ['adminUserInfo', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

// Mutation hook for changing user password
export const useChangeUserPassword = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      changeAdminUserPassword(payload),
    onSuccess: (data) => {
      // Only proceed if the API call was actually successful
      if (data.success && onSuccess) {
        onSuccess(data)
        queryClient.invalidateQueries({
          queryKey: ['adminUserInfo', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

// Mutation hook for creating a new customer
export const useCreateCustomer = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: CreateCustomerRequest) => createCustomer(payload),
    onSuccess: (data) => {
      // Only proceed if the API call was actually successful
      if (data.success && onSuccess) {
        onSuccess(data)
        // Invalidate customers list to refetch with new customer
        queryClient.invalidateQueries({
          queryKey: ['customers', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

// Mutation hook for updating an existing customer
export const useUpdateCustomer = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      customerId,
      payload
    }: {
      customerId: string
      payload: UpdateCustomerRequest
    }) => updateCustomer(customerId, payload),
    onSuccess: (data) => {
      // Only proceed if the API call was actually successful
      if (data.success && onSuccess) {
        onSuccess(data)
        // Invalidate customers list to refetch with updated customer
        queryClient.invalidateQueries({
          queryKey: ['customers', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

// Mutation hook for deleting a customer
export const useDeleteCustomer = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId),
    onSuccess: (data) => {
      // Only proceed if the API call was actually successful
      if (data.success && onSuccess) {
        onSuccess(data)
        // Invalidate customers list to refetch without deleted customer
        queryClient.invalidateQueries({
          queryKey: ['customers', user?.email]
        })
      }
    },
    throwOnError: false
  })
}
