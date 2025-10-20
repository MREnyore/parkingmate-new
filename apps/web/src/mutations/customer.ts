import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { triggerCustomerLoginOtp, triggerCustomerLogout } from '@/api/auth'
import {
  addCarInfo,
  deleteCarInfo,
  updateCarInfo,
  updateCustomerInfo
} from '@/api/customer'
import { useAuth, useAuthActions } from '@/stores/sessionStore'

// Mutation hook for customer login OTP
export const useCustomerLoginOtp = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  return useMutation({
    mutationFn: triggerCustomerLoginOtp,
    onSuccess: (data) => {
      if (data.success && onSuccess) {
        onSuccess(data)
      }
    },
    throwOnError: false
  })
}

export const useCustomerLogout = () => {
  const { clearAuth } = useAuthActions()
  return useMutation({
    mutationFn: triggerCustomerLogout,
    onSuccess: (data) => {
      if (data.success) {
        clearAuth()
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Something went wrong')
      }
    },
    throwOnError: false
  })
}

export const useUpdateCustomerInfo = (
  onSuccess?: (data: { success: boolean; error?: string }) => void
) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: updateCustomerInfo,
    onSuccess: (data) => {
      // Only invalidate if the API call was actually successful
      if (data.success && onSuccess) {
        onSuccess(data)
        queryClient.invalidateQueries({
          queryKey: ['customer', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

export const useAddCarInfo = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: addCarInfo,
    onSuccess: (data) => {
      // Only invalidate if the API call was actually successful
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['customer', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

export const useUpdateCarInfo = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: updateCarInfo,
    onSuccess: (data) => {
      // Only invalidate if the API call was actually successful
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['customer', user?.email]
        })
      }
    },
    throwOnError: false
  })
}

export const useDeleteCarInfo = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: deleteCarInfo,
    onSuccess: (data) => {
      // Only invalidate if the API call was actually successful
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ['customer', user?.email]
        })
      }
    },
    throwOnError: false
  })
}
