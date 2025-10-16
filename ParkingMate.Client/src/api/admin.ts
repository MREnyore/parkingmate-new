import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'

interface GetAdminUserInfoResponse {
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  roles?: string[]
  permissions?: string[]
  createdAt?: string
  responseStatus?: {
    errorCode?: string
    message?: string
    stackTrace?: string
    errors?: Array<{
      propertyName?: string
      errorMessage?: string
      attemptedValue?: unknown
    }>
    meta?: Record<string, string>
  }
}

/**
 * Get current admin user info
 * Endpoint: GET /api/user/profile
 * Uses ServiceStack session cookies for authentication
 */
export const getAdminUserInfo = async (): Promise<{
  success: boolean
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  roles?: string[]
  permissions?: string[]
  createdAt?: string
  error?: string
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      credentials: 'include' // Send cookies for ServiceStack session
    })

    const data: GetAdminUserInfoResponse = await response.json()

    // Handle successful response
    if (response.ok && data.userId) {
      return {
        success: true,
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePictureUrl: data.profilePictureUrl,
        roles: data.roles,
        permissions: data.permissions,
        createdAt: data.createdAt
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.responseStatus?.errorCode ||
      `Failed to fetch user info: ${response.status} ${response.statusText}`

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
 * Update user profile (first name, last name)
 * Endpoint: PUT /api/user/profile
 */
export const updateAdminUserProfile = async (payload: {
  firstName?: string
  lastName?: string
}): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully'
      })

      return {
        success: true
      }
    }

    const errorMessage =
      data.responseStatus?.message ||
      data.responseStatus?.errorCode ||
      `Failed to update profile: ${response.status} ${response.statusText}`

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
 * Change user password
 * Endpoint: PUT /api/user/password
 */
export const changeAdminUserPassword = async (payload: {
  currentPassword: string
  newPassword: string
}): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const response = await fetch(`${API_BASE_URL}/api/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return {
        success: true
      }
    }

    const errorMessage =
      data.responseStatus?.message ||
      data.responseStatus?.errorCode ||
      `Failed to change password: ${response.status} ${response.statusText}`

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
