import type { FastifyRequest } from 'fastify'

/**
 * Extended request types for authenticated routes
 */

// Admin user data attached to request
export interface AdminUserData {
  userId: string
  email: string
  role: string
  orgId: string
}

// Customer data attached to request
export interface CustomerData {
  customerId: string
  email: string
  orgId: string
}

// Type aliases for authenticated requests
// Note: These don't extend FastifyRequest because the properties are already
// added via module augmentation in fastify.d.ts. These are just for documentation
// and type narrowing after runtime checks.
export type AuthenticatedAdminRequest = FastifyRequest & {
  user: AdminUserData
}

export type AuthenticatedCustomerRequest = FastifyRequest & {
  customer: CustomerData
}

// Type guards for checking authentication type
export function isAdminAuthenticated(
  request: FastifyRequest
): request is AuthenticatedAdminRequest {
  return 'user' in request && request.user != null
}

export function isCustomerAuthenticated(
  request: FastifyRequest
): request is AuthenticatedCustomerRequest {
  return 'customer' in request && request.customer != null
}
