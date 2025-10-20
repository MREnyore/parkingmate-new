/**
 * Centralized API client using @parkingmate/api-client with generated types
 */

import type { components } from '@parkingmate/api-client'
import { createParkingMateApi } from '@parkingmate/api-client'
import { API_BASE_URL } from '@/config/env'

// Export types from the generated API client
export type User = components['schemas']['User']
export type AuthTokens = components['schemas']['AuthTokens']
export type LoginRequest = components['schemas']['LoginRequest']
export type RegisterRequest = components['schemas']['RegisterRequest']
export type ParkingLot = components['schemas']['ParkingLot']
export type CreateParkingLotRequest =
  components['schemas']['CreateParkingLotRequest']
export type Car = components['schemas']['Car']
export type Error = components['schemas']['Error']
export type SuccessResponse = components['schemas']['SuccessResponse']

// Create singleton API client instance
export const apiClient = createParkingMateApi({
  baseUrl: API_BASE_URL
})

/**
 * Set authentication token for all subsequent requests
 */
export const setAuthToken = (token: string) => {
  apiClient.setAuthToken(token)
}

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  apiClient.clearAuthToken()
}

// Re-export the api client for direct access if needed
export { apiClient as api }
