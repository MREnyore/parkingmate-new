// JWT utility functions for token handling
import { jwtDecode } from 'jwt-decode'

export type UserRole = 'Customer' | 'Admin'

export interface JWTPayload {
  exp?: number // Expiration time (Unix timestamp)
  iat?: number // Issued at time (Unix timestamp)
  sub?: string // Subject (usually user ID)
  email?: string
  name?: string
  roles?: UserRole[]
  [key: string]: unknown // Allow other claims
}

/**
 * Check if token is a valid JWT format
 */
export const isValidJWT = (token: string): boolean => {
  // JWT tokens have 3 parts separated by dots
  return token.includes('.')
}

/**
 * Decode JWT token using jwt-decode library
 * Note: This doesn't verify the signature, only decodes the payload
 * Returns null for invalid tokens
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Skip decoding for invalid tokens
    if (!isValidJWT(token)) {
      return null
    }
    return jwtDecode<JWTPayload>(token)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 * Returns false for invalid tokens
 */
export const isJWTExpired = (token: string): boolean => {
  // Invalid tokens are considered expired
  if (!isValidJWT(token)) {
    return true
  }

  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    // If we can't decode or no expiration, consider it expired for safety
    return true
  }

  // Compare expiration time with current time (both in seconds)
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Get time until JWT expires (in milliseconds)
 * Returns 0 if already expired or invalid
 */
export const getJWTTimeToExpiry = (token: string): number => {
  // Invalid tokens are considered expired
  if (!isValidJWT(token)) {
    return 0
  }

  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return 0
  }

  const currentTime = Math.floor(Date.now() / 1000)
  const timeToExpiry = (payload.exp - currentTime) * 1000 // Convert to milliseconds

  return Math.max(0, timeToExpiry)
}

/**
 * Get JWT expiration date
 * Returns null for invalid tokens
 */
export const getJWTExpirationDate = (token: string): Date | null => {
  // Invalid tokens don't have expiration date
  if (!isValidJWT(token)) {
    return null
  }

  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return null
  }

  return new Date(payload.exp * 1000)
}
