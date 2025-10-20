import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { refreshAuthToken, validateAuthToken } from '@/api/auth'
import {
  decodeJWT,
  isJWTExpired,
  type JWTPayload,
  type UserRole
} from '@/utils/jwt'

// Types for the session store

interface AuthUser {
  email: string
  name?: string
  isRegisteredCustomer?: boolean
  role?: UserRole
}

interface SessionState {
  // Auth state
  accessToken: string | null
  refreshToken: string | null
  getDecodedAuthToken: () => JWTPayload | null
  user: AuthUser | null
  isAuthenticated: boolean

  // Actions
  setTokens: (
    accessToken: string,
    refreshToken?: string,
    user?: AuthUser
  ) => void
  setAccessToken: (token: string, user?: AuthUser) => void // Keep for backward compatibility
  clearAuth: () => void
  clearAuthAndRedirect: (reason?: string) => void
  updateUser: (user: Partial<AuthUser>) => void
  validateToken: () => Promise<boolean>
  refreshTokens: () => Promise<boolean>
  checkTokenExpiry: () => boolean

  // Role helpers
  getUserRoles: () => UserRole[]
  hasRole: (role: UserRole) => boolean
  isCustomer: () => boolean
  isAdmin: () => boolean
  getPrimaryRole: () => UserRole | null
  getUserRole: () => 'Customer' | 'Admin' | null

  // Getters
  getAuthHeaders: () => Record<string, string>
}

// Create the Zustand store with session storage persistence
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      getDecodedAuthToken: () => {
        const currentToken = get().accessToken
        if (!currentToken) return null
        const decodedToken = decodeJWT(currentToken)
        return decodedToken
      },

      // Set both access and refresh tokens with user data
      setTokens: (
        accessToken: string,
        refreshToken?: string,
        user?: AuthUser
      ) => {
        // Decode JWT to extract role
        const decodedToken = decodeJWT(accessToken)

        // Get role from JWT (can be 'admin' or 'customer' lowercase)
        const roleFromToken = decodedToken?.role as string | undefined

        // Normalize role to UserRole type (capitalize first letter)
        const normalizedRole = roleFromToken
          ? ((roleFromToken.charAt(0).toUpperCase() +
              roleFromToken.slice(1)) as UserRole)
          : undefined

        // Merge user data with role
        // Priority: user-provided role > JWT role
        const userData: AuthUser = {
          ...user,
          role: user?.role || normalizedRole,
          email: (user?.email || decodedToken?.email) ?? '',
          name: user?.name || decodedToken?.name
        }

        set({
          accessToken,
          refreshToken: refreshToken || null,
          user: userData,
          isAuthenticated: true
        })
      },

      setAccessToken: (token: string, user?: AuthUser) => {
        get().setTokens(token, undefined, user)
      },

      // Clear all auth data
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false
        })
      },

      // Clear auth and redirect to customer login (for security issues like customer not found)
      clearAuthAndRedirect: (reason?: string) => {
        console.log('Clearing auth and redirecting to login:', reason)

        // Clear all auth data
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false
        })

        // // Redirect to customer login
        // const currentPath = window.location.pathname
        // if (currentPath !== ROUTES.CUSTOMER_LOGIN) {
        //   window.location.href = ROUTES.CUSTOMER_LOGIN
        // }
      },

      // Update user data
      updateUser: (userData: Partial<AuthUser>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      // Validate current token with server
      validateToken: async (): Promise<boolean> => {
        const currentToken = get().accessToken
        if (!currentToken) {
          set({ isAuthenticated: false })
          return false
        }

        try {
          const validation = await validateAuthToken(currentToken)

          if (validation.isValid) {
            // Update user data if provided
            if (validation.user) {
              set({ user: validation.user })
            }
            set({ isAuthenticated: true })
            return true
          } else {
            // Token is invalid, clear auth
            get().clearAuth()
            return false
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          get().clearAuth()
          return false
        }
      },

      // Refresh access token using refresh token
      refreshTokens: async (): Promise<boolean> => {
        const currentRefreshToken = get().refreshToken
        if (!currentRefreshToken) {
          console.log('No refresh token available')
          get().clearAuth()
          return false
        }

        try {
          const refreshResult = await refreshAuthToken(currentRefreshToken)

          if (refreshResult.success && refreshResult.accessToken) {
            // Update tokens with new access token and refresh token (if provided)
            get().setTokens(
              refreshResult.accessToken,
              refreshResult.refreshToken || currentRefreshToken
            )
            console.log('Tokens refreshed successfully')
            return true
          } else {
            // Refresh failed, clear auth and redirect to login
            console.log('Token refresh failed:', refreshResult.error)
            get().clearAuth()

            // Redirect to appropriate login page
            const currentPath = window.location.pathname
            const loginPath = currentPath.startsWith('/customer')
              ? '/customer-login'
              : '/login'

            if (currentPath !== loginPath) {
              console.log(
                `Redirecting from ${currentPath} to ${loginPath} due to refresh failure`
              )
              window.location.href = loginPath
            }
            return false
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().clearAuth()
          return false
        }
      },

      // Check if current token is expired (local JWT check)
      checkTokenExpiry: (): boolean => {
        const currentToken = get().accessToken
        if (!currentToken) {
          return true // No token = expired
        }

        const expired = isJWTExpired(currentToken)
        if (expired) {
          console.log('Token expired locally, clearing auth')
          get().clearAuth()
        }
        return expired
      },

      // Get authorization headers for API requests
      getAuthHeaders: (): Record<string, string> => {
        const token = get().accessToken
        if (!token) return {}

        return {
          Authorization: `Bearer ${token}`
        }
      },

      // Role helper functions
      getUserRoles: (): UserRole[] => {
        const user = get().user
        return user?.role ? [user.role] : []
      },

      hasRole: (role: UserRole): boolean => {
        const user = get().user
        return user?.role === role
      },

      isCustomer: (): boolean => {
        return get().hasRole('Customer')
      },

      isAdmin: (): boolean => {
        return get().hasRole('Admin')
      },

      getPrimaryRole: (): UserRole | null => {
        const user = get().user
        return user?.role || null
      },

      // Simple role getter that returns the user's role
      // Works for both JWT tokens (Customer) and admin sessions
      getUserRole: (): 'Customer' | 'Admin' | null => {
        const user = get().user

        // Get role from user object
        if (user?.role) {
          return user.role
        }

        // Fallback: try to decode JWT token
        const decodedToken = get().getDecodedAuthToken()
        if (decodedToken?.role) {
          const roleStr = decodedToken.role as string
          // Normalize to capitalized format
          return (roleStr.charAt(0).toUpperCase() + roleStr.slice(1)) as
            | 'Admin'
            | 'Customer'
        }

        return null
      }
    }),
    {
      name: 'customer-session', // Key in session storage
      storage: createJSONStorage(() => sessionStorage), // Use session storage instead of localStorage
      partialize: (state) => ({
        // Only persist these fields
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Utility hooks for easier access
export const useAuth = () => {
  const { accessToken, user, isAuthenticated, getDecodedAuthToken } =
    useSessionStore()
  return { accessToken, user, isAuthenticated, getDecodedAuthToken }
}

export const useAuthActions = () => {
  const {
    setTokens,
    setAccessToken,
    clearAuth,
    clearAuthAndRedirect,
    updateUser,
    validateToken,
    refreshTokens,
    checkTokenExpiry,
    getAuthHeaders
  } = useSessionStore()
  return {
    setTokens,
    setAccessToken,
    clearAuth,
    clearAuthAndRedirect,
    updateUser,
    validateToken,
    refreshTokens,
    checkTokenExpiry,
    getAuthHeaders
  }
}

// Role-specific utility hooks
export const useUserRoles = () => {
  const {
    getUserRoles,
    hasRole,
    isCustomer,
    isAdmin,
    getPrimaryRole,
    getUserRole
  } = useSessionStore()
  return {
    getUserRoles,
    hasRole,
    isCustomer,
    isAdmin,
    getPrimaryRole,
    getUserRole
  }
}
