import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

  // Zod validation errors
  if (error instanceof ZodError) {
    const zodError = error as ZodError
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: zodError.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }))
      }
    })
  }

  // Fastify validation errors
  if (error.validation) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message ?? 'Validation failed',
        details: error.validation
      }
    })
  }

  // Duplicate key errors (PostgreSQL)
  if (error.message?.includes('duplicate key value')) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this value already exists'
      }
    })
  }

  // Foreign key constraint errors
  if (error.message?.includes('foreign key constraint')) {
    return reply.code(StatusCodes.CONFLICT).send({
      success: false,
      error: {
        code: 'CONSTRAINT_VIOLATION',
        message: 'Referenced resource not found or cannot be deleted'
      }
    })
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.code(StatusCodes.TOO_MANY_REQUESTS).send({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.'
      }
    })
  }

  // Default error response
  const statusCode = error.statusCode || 500
  return reply.code(statusCode).send({
    success: false,
    error: {
      code: error.code ?? 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : (error.message ?? 'An unexpected error occurred')
    }
  })
}
