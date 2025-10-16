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
 * Check if token is a ServiceStack sessionId (not a JWT)
 * ServiceStack sessionIds are typically shorter and don't have JWT structure
 */
export const isServiceStackSession = (token: string): boolean => {
  // JWT tokens have 3 parts separated by dots
  return !token.includes('.')
}

/**
 * Decode JWT token using jwt-decode library
 * Note: This doesn't verify the signature, only decodes the payload
 * Returns null for ServiceStack sessionIds (admin sessions)
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Skip decoding for ServiceStack sessionIds (admin sessions)
    if (isServiceStackSession(token)) {
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
 * Returns false for ServiceStack sessionIds (admin sessions) - they don't expire client-side
 */
export const isJWTExpired = (token: string): boolean => {
  // ServiceStack sessionIds don't have expiration in the token
  if (isServiceStackSession(token)) {
    return false
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
 * Returns Infinity for ServiceStack sessionIds (admin sessions)
 * Returns 0 if already expired or invalid
 */
export const getJWTTimeToExpiry = (token: string): number => {
  // ServiceStack sessionIds don't have client-side expiration
  if (isServiceStackSession(token)) {
    return Infinity
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
 * Returns null for ServiceStack sessionIds (admin sessions)
 */
export const getJWTExpirationDate = (token: string): Date | null => {
  // ServiceStack sessionIds don't have expiration date
  if (isServiceStackSession(token)) {
    return null
  }

  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return null
  }

  return new Date(payload.exp * 1000)
}
