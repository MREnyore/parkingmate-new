import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { jwtService } from '../services/jwt.service'
import type {
  AuthenticatedAdminRequest,
  AuthenticatedCustomerRequest
} from '../types/request.types'

/**
 * Auth middleware - validates JWT and attaches user/customer to request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header'
        }
      })
    }

    const token = authHeader.substring(7)
    const payload = jwtService.verify(token)

    // Attach payload to request based on type
    if (jwtService.isAdmin(payload)) {
      // Admin user
      if (!payload.orgId) {
        throw new Error('Organization ID is required in JWT payload')
      }

      ;(request as AuthenticatedAdminRequest).user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role as string, // Ensure role is treated as string
        orgId: payload.orgId as string // Ensure orgId is treated as string
      }
    } else if (jwtService.isCustomer(payload)) {
      // Customer
      if (!payload.orgId) {
        throw new Error('Organization ID is required')
      }

      ;(request as AuthenticatedCustomerRequest).customer = {
        customerId: payload.customerId,
        email: payload.email,
        orgId: payload.orgId
      }
    }
  } catch (error) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message:
          error instanceof Error ? error.message : 'Invalid or expired token'
      }
    })
  }
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as AuthenticatedAdminRequest).user

  if (!user || user.role !== 'admin') {
    return reply.code(StatusCodes.FORBIDDEN).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    })
  }
}

/**
 * Require customer middleware
 */
export async function requireCustomer(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const customer = (request as AuthenticatedCustomerRequest).customer

  if (!customer) {
    return reply.code(StatusCodes.FORBIDDEN).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Customer access required'
      }
    })
  }
}
