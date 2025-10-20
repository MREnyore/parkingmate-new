import { and, desc, eq } from 'drizzle-orm'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import { db } from '../config/database'
import { ERROR_CODES } from '../constants/error-codes'
import { parkingLots } from '../db'
import { type ParkingLot, ParkingLotRules } from '../types/parking-lot.types'

// ============================================================================
// Validation Schemas (Zod)
// ============================================================================

const createParkingLotSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  address: z.string().min(1),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(1).max(100),
  postalCode: z.string().max(20).optional(),
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  totalSpaces: z.number().int().positive(),
  pricePerHour: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).default('USD'),
  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  isOpen247: z.boolean().default(false)
})

const updateParkingLotSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  pricePerHour: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  isOpen247: z.boolean().optional(),
  isActive: z.boolean().optional()
})

const parkingLotQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  city: z.string().optional(),
  isActive: z.coerce.boolean().optional()
})

const parkingLotIdSchema = z.object({
  id: z.string().uuid()
})

// ============================================================================
// Helper: Error Handling
// ============================================================================

function handleError(error: unknown, reply: FastifyReply): FastifyReply {
  // Zod validation error
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'ZodError'
  ) {
    return reply.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: 'errors' in error ? error.errors : undefined
      }
    })
  }

  // Standard error
  const message =
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : 'Internal server error'

  return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message
    }
  })
}

// ============================================================================
// Routes
// ============================================================================

export async function parkingLotRoutes(server: FastifyInstance) {
  /**
   * GET /parking-lots
   * Get all parking lots with pagination and filters
   */
  server.get(
    '/parking-lots',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = parkingLotQuerySchema.parse(request.query)
        const { page, limit, city, isActive } = query

        // Build query conditions
        const conditions = []
        if (city) conditions.push(eq(parkingLots.city, city))
        if (isActive !== undefined)
          conditions.push(eq(parkingLots.isActive, isActive))

        // Query database
        const offset = (page - 1) * limit
        const results = await db.query.parkingLots.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset,
          orderBy: desc(parkingLots.createdAt)
        })

        // Map to output DTOs with calculated fields
        const parkingLotsOutput = results.map((lot) =>
          ParkingLotRules.toOutput(lot as ParkingLot)
        )

        return reply.status(StatusCodes.OK).send({
          success: true,
          data: parkingLotsOutput,
          meta: {
            page,
            limit,
            total: results.length // In production, get actual total count
          }
        })
      } catch (error: unknown) {
        return handleError(error, reply)
      }
    }
  )

  /**
   * GET /parking-lots/:id
   * Get a single parking lot by ID
   */
  server.get(
    '/parking-lots/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = parkingLotIdSchema.parse(request.params)

        // Query database
        const result = await db.query.parkingLots.findFirst({
          where: eq(parkingLots.id, id)
        })

        if (!result) {
          return reply.status(StatusCodes.NOT_FOUND).send({
            success: false,
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: 'Parking lot not found'
            }
          })
        }

        // Map to output DTO
        const parkingLotOutput = ParkingLotRules.toOutput(result as ParkingLot)

        return reply.status(StatusCodes.OK).send({
          success: true,
          data: parkingLotOutput
        })
      } catch (error: unknown) {
        return handleError(error, reply)
      }
    }
  )

  /**
   * POST /parking-lots
   * Create a new parking lot
   */
  server.post(
    '/parking-lots',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = createParkingLotSchema.parse(request.body)

        // Insert into database
        const [result] = await db
          .insert(parkingLots)
          .values({
            ...data,
            availableSpaces: data.totalSpaces // Initially all spaces are available
          })
          .returning()

        // Map to output DTO
        const parkingLotOutput = ParkingLotRules.toOutput(result as ParkingLot)

        return reply.status(StatusCodes.CREATED).send({
          success: true,
          data: parkingLotOutput
        })
      } catch (error: unknown) {
        return handleError(error, reply)
      }
    }
  )

  /**
   * PATCH /parking-lots/:id
   * Update a parking lot
   */
  server.patch(
    '/parking-lots/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = parkingLotIdSchema.parse(request.params)
        const data = updateParkingLotSchema.parse(request.body)

        // Update database
        const [result] = await db
          .update(parkingLots)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(parkingLots.id, id))
          .returning()

        if (!result) {
          return reply.status(StatusCodes.NOT_FOUND).send({
            success: false,
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: 'Parking lot not found'
            }
          })
        }

        // Map to output DTO
        const parkingLotOutput = ParkingLotRules.toOutput(result as ParkingLot)

        return reply.status(StatusCodes.OK).send({
          success: true,
          data: parkingLotOutput
        })
      } catch (error: unknown) {
        return handleError(error, reply)
      }
    }
  )

  /**
   * DELETE /parking-lots/:id
   * Delete a parking lot (soft delete)
   */
  server.delete(
    '/parking-lots/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = parkingLotIdSchema.parse(request.params)

        // Soft delete
        await db
          .update(parkingLots)
          .set({ deletedAt: new Date() })
          .where(eq(parkingLots.id, id))

        return reply.code(StatusCodes.NO_CONTENT).send()
      } catch (error: unknown) {
        return handleError(error, reply)
      }
    }
  )
}
