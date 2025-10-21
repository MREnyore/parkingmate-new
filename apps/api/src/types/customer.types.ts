import { z } from 'zod'
import {
    emailSchema,
    licensePlateSchema,
    phoneSchema,
    postalCodeSchema,
    uuidSchema
} from './common.types.js'

/**
 * Customer-related Zod schemas
 */

// Get Customer Info Response
export const customerInfoResponseSchema = z.object({
  id: uuidSchema,
  orgId: uuidSchema,
  name: z.string().nullable(),
  email: emailSchema,
  phoneNumber: z.string().nullable(),
  registered: z.boolean(),
  status: z.string(),
  membershipStatus: z.string().nullable(),
  membershipExpiryDate: z.string().nullable(), // ISO date string
  address: z.string().nullable(),
  postalCode: z.string().nullable(),
  city: z.string().nullable(),
  cars: z.array(
    z.object({
      id: uuidSchema,
      licensePlate: z.string(),
      label: z.string().nullable(),
      brand: z.string().nullable(),
      model: z.string().nullable(),
      createdAt: z.string(), // ISO date string
      updatedAt: z.string() // ISO date string
    })
  ),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string() // ISO date string
})

export type CustomerInfoResponse = z.infer<typeof customerInfoResponseSchema>

// Update Customer Info
export const updateCustomerInfoSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    phoneNumber: phoneSchema.optional(),
    address: z.string().max(500).optional(),
    postalCode: postalCodeSchema.optional(),
    city: z.string().max(100).optional()
  })
})

export type UpdateCustomerInfoInput = z.infer<
  typeof updateCustomerInfoSchema
>['body']

// Add Car
export const addCarSchema = z.object({
  body: z.object({
    licensePlate: licensePlateSchema,
    label: z.string().max(100).optional(),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional()
  })
})

export type AddCarInput = z.infer<typeof addCarSchema>['body']

// Update Car
export const updateCarSchema = z.object({
  params: z.object({
    carId: uuidSchema
  }),
  body: z.object({
    licensePlate: licensePlateSchema.optional(),
    label: z.string().max(100).optional(),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional()
  })
})

export type UpdateCarInput = z.infer<typeof updateCarSchema>['body']
export type UpdateCarParams = z.infer<typeof updateCarSchema>['params']

// Delete Car
export const deleteCarSchema = z.object({
  params: z.object({
    carId: uuidSchema
  })
})

export type DeleteCarParams = z.infer<typeof deleteCarSchema>['params']

// Car Response
export const carResponseSchema = z.object({
  id: uuidSchema,
  orgId: uuidSchema,
  ownerId: uuidSchema,
  licensePlate: z.string(),
  label: z.string().nullable(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string() // ISO date string
})

export type CarResponse = z.infer<typeof carResponseSchema>
