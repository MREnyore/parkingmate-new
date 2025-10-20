/**
 * Main entry point for @parkingmate/api-client package
 * Provides type-safe API client with types generated from OpenAPI spec
 */

export * from './api'
export * from './client'
// Export generated types
export type { components, paths } from './generated/api'

export * from './types'

/**
 * Example usage:
 *
 * import { createParkingMateApi } from '@parkingmate/api-client';
 *
 * const api = createParkingMateApi({
 *   baseUrl: 'http://localhost:3000/api/v1',
 * });
 *
 * // Set auth token
 * api.setAuthToken('your-jwt-token');
 *
 * // Make type-safe requests
 * const result = await api.listParkingLots({ page: 1, limit: 20 });
 * if (result.success) {
 *   console.log(result.data); // Fully typed!
 * }
 *
 * // Login
 * const loginResult = await api.login({
 *   email: 'admin@example.com',
 *   password: 'password123'
 * });
 */
