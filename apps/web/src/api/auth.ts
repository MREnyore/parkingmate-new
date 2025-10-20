import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'
import { apiClient, clearAuthToken, setAuthToken } from '@/lib/api-client'
import { useSessionStore } from '@/stores/sessionStore'
import type { AuthTokens } from '@/types/api'
import type { AuthUser } from '@/types/auth'
import { decodeJWT } from '@/utils/jwt'

// API call to send OTP for customer login (existing customers)
export const triggerCustomerLoginOtp = async (
  email: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await apiClient.customerSignin({ email })

    if (response.success) {
      toast.success('Verification Code Sent', {
        description: 'Please check your email for the verification code'
      })
      return {
        success: true
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to send code'
    toast.error('Failed to Send Code', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    console.error('Customer login OTP error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    toast.error('Connection Error', {
      description: networkError
    })
    return {
      success: false,
      error: networkError
    }
  }
}

export const triggerCustomerLogout = async () => {
  try {
    // Get refresh token from session store
    const refreshToken = useSessionStore.getState().refreshToken

    // Only pass body if refresh token exists, otherwise don't pass anything
    const response = refreshToken
      ? await apiClient.customerLogout({ refreshToken })
      : await apiClient.customerLogout()

    if (response.success) {
      clearAuthToken()
      toast.success('Logout successful', {
        description: 'You have been logged out'
      })
      return {
        success: true
      }
    }

    const errorMessage = response.error?.message ?? 'Logout failed'
    toast.error('Logout failed', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    console.error('Logout error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    toast.error('Connection Error', {
      description: networkError
    })
    return {
      success: false,
      error: networkError
    }
  }
}

// API call to register customer and send OTP
export const triggerOtpCode = async (payload: {
  registrationToken: string
}): Promise<{
  success: boolean
  email?: string
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await apiClient.registerCustomer({
      registrationToken: payload.registrationToken
    })

    if (response.success && response.data) {
      toast.success('Verification Code Sent', {
        description: 'Please check your email for the verification code'
      })
      return {
        success: true,
        email: response.data.email
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to send code'
    toast.error('Failed to Send Code', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    console.error('Customer registration error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    toast.error('Connection Error', {
      description: networkError
    })
    return {
      success: false,
      error: networkError
    }
  }
}

// API call to verify OTP code
export const verifyOtpCode = async (payload: {
  email: string
  otpCode: string
}): Promise<{
  success: boolean
  accessToken?: string
  refreshToken?: string
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await apiClient.verifyOtp({
      email: payload.email,
      otpCode: payload.otpCode
    })

    if (response.success) {
      // Response is returned as-is by API client (not wrapped in data field)
      const data = response as unknown as Record<string, unknown>
      const accessToken = data.accessToken as string | undefined
      const refreshToken = data.refreshToken as string | undefined

      // Validate that we have the required tokens
      if (accessToken && refreshToken) {
        const decodedToken = decodeJWT(accessToken)
        // Check role field (singular) - backend sets role: 'Customer' or role: 'Admin'
        const role = decodedToken?.role as string | undefined

        // If user has Admin role, reject the login for customer flow
        if (role === 'Admin') {
          toast.error('Access Denied', {
            description: 'Please use the admin login page'
          })
          return {
            success: false,
            error: 'User does not have customer access'
          }
        }

        // Set auth token for subsequent requests
        setAuthToken(accessToken)

        toast.success('Code Verified', {
          description: 'Your verification code is correct'
        })

        // Store auth tokens and user data in session store
        const user = {
          email: payload.email,
          name: data.name as string | undefined,
          isRegisteredCustomer: data.isRegisteredCustomer as boolean
        }
        useSessionStore.getState().setTokens(accessToken, refreshToken, user)

        return {
          success: true,
          accessToken,
          refreshToken
        }
      }
    }

    const errorMessage = response.error?.message ?? 'Invalid code'
    toast.error('Invalid Code', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    toast.error('Connection Error', {
      description: networkError
    })
    return {
      success: false,
      error: networkError
    }
  }
}

// API function to validate auth token using new endpoint
export const validateAuthToken = async (
  token: string
): Promise<{
  isValid: boolean
  user?: AuthUser
  expiresAt?: number
  error?: string
}> => {
  // // TEMPORARY: Bypass auth validation for debugging
  // console.log('🚧 BYPASSING AUTH VALIDATION - Token always valid for debugging')
  // return {
  //   isValid: true,
  //   user: undefined, // Keep existing user data
  //   expiresAt: Date.now() + 24 * 60 * 60 * 1000 // Valid for 24 hours
  // }
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/auth/validate-auth-token`,
      {
        method: 'POST',
        body: JSON.stringify({ token })
      }
    )

    const data = await response.json()

    // Handle successful response
    if (response.ok && data.isValid) {
      return {
        isValid: true,
        user: data.user,
        expiresAt: data.expiresAt
      }
    }

    // Handle validation failure (token invalid/expired)
    if (response.ok && !data.isValid) {
      const errorMessage =
        data.errorMessage ?? 'Authentication token is invalid or expired'
      return {
        isValid: false,
        error: errorMessage
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.errorMessage ||
      `API error: ${response.status} ${response.statusText}`

    return {
      isValid: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Token validation error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    return {
      isValid: false,
      error: networkError
    }
  }
}

// API function to refresh auth token
export const refreshAuthToken = async (
  refreshToken: string
): Promise<{
  success: boolean
  accessToken?: string
  refreshToken?: string
  error?: string
}> => {
  try {
    const response = await apiClient.refreshToken({ refreshToken })

    if (response.success && response.data) {
      // TODO: ExtractData helper doesn't fully resolve allOf intersection types yet
      const tokens = response.data as AuthTokens

      // Update auth token
      if (tokens.accessToken) {
        setAuthToken(tokens.accessToken)
      }

      return {
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    }

    return {
      success: false,
      error: response.error?.message ?? 'Failed to refresh token'
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    return {
      success: false,
      error: networkError
    }
  }
}

// Helper function to make authenticated API requests
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = useSessionStore.getState().accessToken

  if (!token) {
    throw new Error('No authentication token available')
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers
  }

  return fetch(url, {
    ...options,
    headers
  })
}

/**
 * Admin login with email and password
 * Endpoint: POST /auth/login
 */
export const adminLogin = async (payload: {
  email: string
  password: string
}): Promise<{
  success: boolean
  tokens?: AuthTokens
  user?: {
    id: string
    email: string
    role: string
    firstName?: string
    lastName?: string
  }
  error?: string
}> => {
  try {
    // Add delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await apiClient.login({
      email: payload.email,
      password: payload.password
    })

    if (response.success && response.data) {
      // Extract tokens and user data from response
      // Note: Using Record type since OpenAPI allOf types aren't fully resolved yet
      const data = response.data as Record<string, unknown>
      const tokens: AuthTokens = {
        accessToken: data.accessToken as string,
        refreshToken: data.refreshToken as string,
        expiresIn: data.expiresIn as number
      }

      const userObj = data.user as Record<string, unknown> | undefined
      const user = userObj
        ? {
            id: userObj.id as string,
            email: userObj.email as string,
            role: userObj.role as string,
            firstName: userObj.firstName as string | undefined,
            lastName: userObj.lastName as string | undefined
          }
        : undefined

      // Set auth token for subsequent requests
      if (tokens.accessToken) {
        const decodedToken = decodeJWT(tokens.accessToken)
        // Check role field (singular) - backend sets role: 'Customer' or role: 'Admin'
        const role = decodedToken?.role as string | undefined

        // If user has Customer role, reject the login for admin flow
        if (role === 'Customer') {
          clearAuthToken()
          toast.error('Access Denied', {
            description: 'No admin account found with these credentials'
          })
          return {
            success: false,
            error: 'User does not have admin privileges'
          }
        }

        setAuthToken(tokens.accessToken)

        toast.success('Login Successful', {
          description: `Welcome back, ${payload.email}!`
        })

        return {
          success: true,
          tokens,
          user
        }
      }
    }

    const errorMessage = response.error?.message ?? 'Login failed'
    toast.error('Login Failed', {
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
      description: 'Unable to connect to server. Please try again.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}

/**
 * Admin logout
 * Endpoint: POST /auth/logout
 */
export const adminLogout = async (): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Get refresh token from session store
    const refreshToken = useSessionStore.getState().refreshToken

    // Only pass body if refresh token exists, otherwise don't pass anything
    const response = refreshToken
      ? await apiClient.logout({ refreshToken })
      : await apiClient.logout()

    if (response.success) {
      clearAuthToken()
      toast.success('Logout Successful', {
        description: 'You have been logged out'
      })
      return {
        success: true
      }
    }

    const errorMessage = response.error?.message ?? 'Logout failed'
    toast.error('Logout Failed', {
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
      description: 'Unable to logout. Please try again.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}
