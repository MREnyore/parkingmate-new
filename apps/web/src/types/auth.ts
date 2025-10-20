// Authentication types
export interface AuthToken {
  token: string
  expiresAt: number // Unix timestamp
}

export interface AuthUser {
  id?: string
  email: string
  name?: string
  isRegisteredCustomer?: boolean
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (token: string, user?: AuthUser) => void
  logout: () => void
  validateToken: () => Promise<boolean>
  getAuthHeaders: () => Record<string, string>
}

// API response types for token validation
export interface ValidateTokenRequest {
  token: string
}

export interface ValidateTokenResponse {
  isValid: boolean
  user?: AuthUser
  expiresAt?: number
  errorMessage?: string
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
