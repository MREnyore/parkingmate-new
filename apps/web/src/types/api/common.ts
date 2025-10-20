/**
 * Common API types and utilities
 */

import type { components, paths } from '@parkingmate/api-client'

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Helper type to extract request body from OpenAPI paths
 */
export type RequestBody<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  requestBody: { content: { 'application/json': infer Body } }
}
  ? Body
  : never

/**
 * Helper type to extract response body from OpenAPI paths
 */
export type ResponseBody<
  Path extends keyof paths,
  Method extends keyof paths[Path],
  Status extends number = 200
> = paths[Path][Method] extends {
  responses: { [K in Status]: { content: { 'application/json': infer Body } } }
}
  ? Body
  : unknown

// ============================================================================
// Common Response Types
// ============================================================================

export type ApiError = components['schemas']['Error']
export type SuccessResponse = components['schemas']['SuccessResponse']

// ============================================================================
// Health Check
// ============================================================================

export type HealthCheckResponse = ResponseBody<'/health', 'get'>

// ============================================================================
// Export OpenAPI types for advanced usage
// ============================================================================

export type { components, paths }
