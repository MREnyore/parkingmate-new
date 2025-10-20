import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type {
  ChangeAdminPasswordRequest,
  UpdateAdminProfileRequest,
  User
} from '@/types/api'

/**
 * Get current admin user profile
 * Endpoint: GET /admin/profile
 */
export const getAdminUserInfo = async (): Promise<{
  success: boolean
  user?: User
  error?: string
}> => {
  try {
    const response = await apiClient.getAdminProfile()

    if (response.success && response.data) {
      // TODO: ExtractData helper doesn't fully resolve allOf intersection types yet
      return {
        success: true,
        user: response.data as User
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to fetch user info'
    toast.error('Failed to Load User Info', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to fetch user information.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}
/**
 * Update admin user profile
 * Endpoint: PUT /admin/profile
 */
export const updateAdminUserProfile = async (
  payload: UpdateAdminProfileRequest
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const response = await apiClient.updateAdminProfile(payload)

    if (response.success) {
      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully'
      })

      return {
        success: true
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to update profile'
    toast.error('Update Failed', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to update profile. Please try again.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}

/**
 * Change admin user password
 * Endpoint: POST /admin/profile/change-password
 */
export const changeAdminUserPassword = async (
  payload: ChangeAdminPasswordRequest
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const response = await apiClient.changeAdminPassword(payload)

    if (response.success) {
      toast.success('Password Changed', {
        description: 'Your password has been changed successfully'
      })
      return {
        success: true
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to change password'
    toast.error('Password Change Failed', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to change password. Please try again.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}
