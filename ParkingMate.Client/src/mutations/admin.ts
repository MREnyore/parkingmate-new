import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changeAdminUserPassword, updateAdminUserProfile } from '@/api/admin'
import { useAuth } from '@/stores/sessionStore'

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
          queryKey: ['adminUserInfo', user?.sessionId]
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
          queryKey: ['adminUserInfo', user?.sessionId]
        })
      }
    },
    throwOnError: false
  })
}
