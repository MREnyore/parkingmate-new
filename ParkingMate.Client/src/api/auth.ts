import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'
import { useSessionStore } from '@/stores/sessionStore'
import type { AuthUser } from '@/types/auth'
import { decodeJWT } from '@/utils/jwt'

// Types for customer registration API
interface RegisterCustomerRequest {
  token: string
  email: string
}

interface RegisterCustomerResponse {
  success: boolean
  message?: string
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

// Types for OTP verification API
interface VerifyOtpRequest {
  email: string
  code: string
}

interface VerifyOtpResponse {
  success: boolean
  sessionId?: string
  accessToken?: string
  refreshToken?: string
  email?: string
  name?: string
  isRegisteredCustomer: boolean
  message?: string
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

interface AdminLoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

interface AdminLoginResponse {
  sessionId?: string
  email?: string
  firstName?: string
  lastName?: string
  roles?: string[]
  bearerToken?: string
  refreshToken?: string
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

// API call to send OTP for customer login (existing customers)
export const triggerCustomerLoginOtp = async (
  email: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch(`${API_BASE_URL}/auth/customer/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const data: RegisterCustomerResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Verification Code Sent', {
        description: 'Please check your email for the verification code'
      })
      return {
        success: true
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      `API error: ${response.status} ${response.statusText}`

    toast.error('Failed to Send Code', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/auth/customer/logout`,
      {
        method: 'POST'
      }
    )

    const data: RegisterCustomerResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Logout successful', {
        description: 'You have been logged out'
      })
      return {
        success: true
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      `API error: ${response.status} ${response.statusText}`

    toast.error('Logout failed', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
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
  token: string
  email: string
}): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch(`${API_BASE_URL}/auth/register-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload as RegisterCustomerRequest)
    })

    const data: RegisterCustomerResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Verification Code Sent', {
        description: 'Please check your email for the verification code'
      })
      return {
        success: true
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      `API error: ${response.status} ${response.statusText}`

    toast.error('Failed to Send Code', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
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
  code: string
}): Promise<{
  success: boolean
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  email?: string
  name?: string
  isRegisteredCustomer?: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload as VerifyOtpRequest)
    })

    const data: VerifyOtpResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      // Validate that the user has Customer role (decode JWT to check)
      if (data.accessToken) {
        const decodedToken = decodeJWT(data.accessToken)
        const roles = (decodedToken?.roles as string[]) || []
        const hasCustomerRole = roles.includes('Customer')
        const hasAdminRole = roles.includes('Admin')

        // If user only has Admin role, reject the login for customer flow
        if (hasAdminRole && !hasCustomerRole) {
          toast.error('Access Denied', {
            description: 'Please use the admin login page'
          })
          return {
            success: false,
            error: 'User does not have customer access'
          }
        }
      }

      toast.success('Code Verified', {
        description: 'Your verification code is correct'
      })

      // Store auth tokens and user data in session store
      if (data.accessToken) {
        const user = {
          email: data.email || payload.email,
          name: data.name,
          sessionId: data.sessionId,
          isRegisteredCustomer: data.isRegisteredCustomer
        }
        useSessionStore
          .getState()
          .setTokens(data.accessToken, data.refreshToken, user)
      }

      return {
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        sessionId: data.sessionId,
        email: data.email,
        name: data.name,
        isRegisteredCustomer: data.isRegisteredCustomer
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      `API error: ${response.status} ${response.statusText}`

    toast.error('Invalid Code', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
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
        data.errorMessage || 'Authentication token is invalid or expired'
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
  expiresAt?: number
  error?: string
}> => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/auth/refresh-token`,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      }
    )

    const data = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      return {
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt
      }
    }

    // Handle refresh failure (refresh token invalid/expired)
    if (response.ok && !data.success) {
      const errorMessage =
        data.errorMessage || 'Refresh token is invalid or expired'
      return {
        success: false,
        error: errorMessage
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.errorMessage ||
      `API error: ${response.status} ${response.statusText}`

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
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
 * Returns sessionId (ServiceStack's bearer token)
 */
export const adminLogin = async (payload: {
  email: string
  password: string
}): Promise<{
  success: boolean
  sessionId?: string
  bearerToken?: string
  email?: string
  roles?: string[]
  error?: string
}> => {
  try {
    // Add delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important: Accept cookies from ServiceStack
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        rememberMe: false // Always false as per requirements
      } as AdminLoginRequest)
    })

    const data: AdminLoginResponse = await response.json()

    // Handle successful response - ServiceStack returns sessionId as the bearer token
    if (response.ok && data.sessionId) {
      // Validate that the user has Admin role
      const roles = data.roles || []
      const hasAdminRole = roles.includes('Admin')
      const hasCustomerRole = roles.includes('Customer')

      // If user only has Customer role, reject the login for admin flow
      if (hasCustomerRole && !hasAdminRole) {
        toast.error('Access Denied', {
          description: 'No admin account found with these credentials'
        })
        return {
          success: false,
          error: 'User does not have admin privileges'
        }
      }

      const welcomeMessage = data.email
        ? `Welcome back, ${data.email}!`
        : 'Welcome back!'

      toast.success('Login Successful', {
        description: welcomeMessage
      })
      return {
        success: true,
        sessionId: data.sessionId,
        bearerToken: data.sessionId, // Use sessionId as bearer token
        email: data.email,
        roles: data.roles // Return roles from ServiceStack response
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.responseStatus?.errorCode ||
      `Login failed: ${response.status} ${response.statusText}`

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
 * Clears ServiceStack session
 */
export const adminLogout = async (): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Important for ServiceStack session cookies
    })

    // ServiceStack logout typically returns 200 even on success
    if (response.ok) {
      toast.success('Logout Successful', {
        description: 'You have been logged out'
      })
      return {
        success: true
      }
    }

    // Handle error responses
    const errorMessage = `Logout failed: ${response.status} ${response.statusText}`

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
