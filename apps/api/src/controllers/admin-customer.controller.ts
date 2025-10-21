import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { carService } from '../services/car.service.js'
import { customerService } from '../services/customer.service.js'
import { validationService } from '../services/validation.service.js'

interface CreateCustomerBody {
  name: string
  email: string
  phoneNumber?: string
  address?: string
  postalCode?: string
  city?: string
  isPermanentParker?: boolean
  parkingStartDate?: string
  parkingEndDate?: string
  cars?: Array<{
    licensePlate: string
    brand?: string
    model?: string
    label?: string
  }>
}

interface UpdateCustomerBody {
  name?: string
  email?: string
  phoneNumber?: string
  address?: string
  postalCode?: string
  city?: string
  isPermanentParker?: boolean
  parkingStartDate?: string
  parkingEndDate?: string
  cars?: Array<{
    id?: string
    licensePlate: string
    brand?: string
    model?: string
    label?: string
  }>
}

interface CustomerIdParams {
  id: string
}

/**
 * Get all customers for admin's organization
 */
export async function getAllCustomers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { orgId } = request.user

    // Get all customers in organization
    const customers = await customerService.findByOrg(orgId)

    // Get cars for each customer
    const customersWithCars = await Promise.all(
      customers.map(async (customer) => {
        const cars = await carService.findByOwner(customer.id)
        return {
          id: customer.id,
          orgId: customer.orgId,
          name: customer.name,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          registered: customer.registered,
          status: customer.status,
          membershipStatus: customer.membershipStatus,
          membershipExpiryDate:
            customer.membershipExpiryDate?.toISOString() || null,
          address: customer.address,
          postalCode: customer.postalCode,
          city: customer.city,
          cars: cars.map((car) => ({
            id: car.id,
            orgId: car.orgId,
            licensePlate: car.licensePlate,
            label: car.label,
            brand: car.brand,
            model: car.model,
            createdAt: car.createdAt.toISOString(),
            updatedAt: car.updatedAt.toISOString()
          })),
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString()
        }
      })
    )

    return reply.send({
      success: true,
      data: customersWithCars
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred retrieving customers'
      }
    })
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { orgId } = request.user
    const { id } = request.params as CustomerIdParams

    // Get customer
    const customer = await customerService.findById(id)
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    // Verify customer belongs to admin's organization
    if (customer.orgId !== orgId) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this customer'
        }
      })
    }

    // Get customer's cars
    const cars = await carService.findByOwner(customer.id)

    return reply.send({
      success: true,
      data: {
        id: customer.id,
        orgId: customer.orgId,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        registered: customer.registered,
        status: customer.status,
        membershipStatus: customer.membershipStatus,
        membershipExpiryDate:
          customer.membershipExpiryDate?.toISOString() || null,
        address: customer.address,
        postalCode: customer.postalCode,
        city: customer.city,
        cars: cars.map((car) => ({
          id: car.id,
          orgId: car.orgId,
          licensePlate: car.licensePlate,
          label: car.label,
          brand: car.brand,
          model: car.model,
          createdAt: car.createdAt.toISOString(),
          updatedAt: car.updatedAt.toISOString()
        })),
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred retrieving customer'
      }
    })
  }
}

/**
 * Create new customer
 */
export async function createCustomer(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { orgId } = request.user
    const body = request.body as CreateCustomerBody

    // Normalize phone number if provided
    let phoneNumber = body.phoneNumber
    if (phoneNumber) {
      phoneNumber = validationService.normalizePhoneNumber(phoneNumber)
    }

    // Check if customer with email already exists
    const existingCustomer = await customerService.findByEmail(
      body.email,
      orgId
    )
    if (existingCustomer) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: {
          code: 'CUSTOMER_EXISTS',
          message: 'A customer with this email already exists'
        }
      })
    }

    // Determine membership dates based on isPermanentParker
    let membershipStatus: 'active' | 'expired' | 'cancelled' = 'active'
    let membershipExpiryDate: Date | undefined

    if (body.isPermanentParker) {
      // Permanent parkers get lifetime membership (or very far future date)
      membershipExpiryDate = undefined
    } else if (body.parkingEndDate) {
      membershipExpiryDate = new Date(body.parkingEndDate)
      // Check if already expired
      if (membershipExpiryDate < new Date()) {
        membershipStatus = 'expired'
      }
    }

    // Create customer
    const customer = await customerService.create({
      orgId,
      name: body.name,
      email: body.email,
      phoneNumber,
      address: body.address,
      postalCode: body.postalCode,
      city: body.city,
      registered: true, // Admin-created customers are automatically registered
      status: 'active',
      membershipStatus,
      membershipExpiryDate
    })

    // Create cars if provided
    const cars = []
    if (body.cars && body.cars.length > 0) {
      for (const carData of body.cars) {
        // Normalize license plate
        const normalizedPlate = validationService.normalizeLicensePlate(
          carData.licensePlate
        )

        // Validate license plate
        if (!validationService.validateLicensePlate(normalizedPlate)) {
          continue // Skip invalid license plates
        }

        const car = await carService.create({
          orgId,
          ownerId: customer.id,
          licensePlate: normalizedPlate,
          label: carData.label,
          brand: carData.brand,
          model: carData.model
        })

        cars.push({
          id: car.id,
          orgId: car.orgId,
          licensePlate: car.licensePlate,
          label: car.label,
          brand: car.brand,
          model: car.model,
          createdAt: car.createdAt.toISOString(),
          updatedAt: car.updatedAt.toISOString()
        })
      }
    }

    return reply.code(StatusCodes.CREATED).send({
      success: true,
      data: {
        id: customer.id,
        orgId: customer.orgId,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        registered: customer.registered,
        status: customer.status,
        membershipStatus: customer.membershipStatus,
        membershipExpiryDate:
          customer.membershipExpiryDate?.toISOString() || null,
        address: customer.address,
        postalCode: customer.postalCode,
        city: customer.city,
        cars,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred creating customer'
      }
    })
  }
}

/**
 * Update customer
 */
export async function updateCustomer(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { orgId } = request.user
    const { id } = request.params as CustomerIdParams
    const body = request.body as UpdateCustomerBody

    // Find customer
    const customer = await customerService.findById(id)
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    // Verify customer belongs to admin's organization
    if (customer.orgId !== orgId) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this customer'
        }
      })
    }

    // Normalize phone number if provided
    let phoneNumber = body.phoneNumber
    if (phoneNumber) {
      phoneNumber = validationService.normalizePhoneNumber(phoneNumber)
    }

    // Determine membership status based on dates
    let membershipStatus: 'active' | 'expired' | 'cancelled' =
      customer.membershipStatus ?? 'active'
    let membershipExpiryDate: Date | undefined =
      customer.membershipExpiryDate ?? undefined

    if (body.isPermanentParker !== undefined) {
      if (body.isPermanentParker) {
        membershipStatus = 'active'
        membershipExpiryDate = undefined
      } else if (body.parkingEndDate) {
        membershipExpiryDate = new Date(body.parkingEndDate)
        if (membershipExpiryDate < new Date()) {
          membershipStatus = 'expired'
        } else {
          membershipStatus = 'active'
        }
      }
    }

    // Update customer data
    const updated = await customerService.update(id, {
      name: body.name,
      email: body.email,
      phoneNumber,
      address: body.address,
      postalCode: body.postalCode,
      city: body.city,
      membershipStatus,
      membershipExpiryDate
    })

    if (!updated) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    // Handle cars update if provided
    const cars = []
    if (body.cars) {
      // Get existing cars
      const existingCars = await carService.findByOwner(id)
      const existingCarIds = new Set(existingCars.map((c) => c.id))
      const providedCarIds = new Set(
        body.cars.filter((c) => c.id).map((c) => c.id as string)
      )

      // Delete cars not in the update list
      for (const car of existingCars) {
        if (!providedCarIds.has(car.id)) {
          await carService.delete(car.id)
        }
      }

      // Update or create cars
      for (const carData of body.cars) {
        const normalizedPlate = validationService.normalizeLicensePlate(
          carData.licensePlate
        )

        if (!validationService.validateLicensePlate(normalizedPlate)) {
          continue // Skip invalid plates
        }

        if (carData.id && existingCarIds.has(carData.id)) {
          // Update existing car
          const updatedCar = await carService.update(carData.id, {
            licensePlate: normalizedPlate,
            label: carData.label,
            brand: carData.brand,
            model: carData.model
          })

          if (updatedCar) {
            cars.push({
              id: updatedCar.id,
              orgId: updatedCar.orgId,
              licensePlate: updatedCar.licensePlate,
              label: updatedCar.label,
              brand: updatedCar.brand,
              model: updatedCar.model,
              createdAt: updatedCar.createdAt.toISOString(),
              updatedAt: updatedCar.updatedAt.toISOString()
            })
          }
        } else {
          // Create new car
          const newCar = await carService.create({
            orgId,
            ownerId: id,
            licensePlate: normalizedPlate,
            label: carData.label,
            brand: carData.brand,
            model: carData.model
          })

          cars.push({
            id: newCar.id,
            orgId: newCar.orgId,
            licensePlate: newCar.licensePlate,
            label: newCar.label,
            brand: newCar.brand,
            model: newCar.model,
            createdAt: newCar.createdAt.toISOString(),
            updatedAt: newCar.updatedAt.toISOString()
          })
        }
      }
    } else {
      // If no cars provided, return existing cars
      const existingCars = await carService.findByOwner(id)
      cars.push(
        ...existingCars.map((car) => ({
          id: car.id,
          orgId: car.orgId,
          licensePlate: car.licensePlate,
          label: car.label,
          brand: car.brand,
          model: car.model,
          createdAt: car.createdAt.toISOString(),
          updatedAt: car.updatedAt.toISOString()
        }))
      )
    }

    return reply.send({
      success: true,
      data: {
        id: updated.id,
        orgId: updated.orgId,
        name: updated.name,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        registered: updated.registered,
        status: updated.status,
        membershipStatus: updated.membershipStatus,
        membershipExpiryDate:
          updated.membershipExpiryDate?.toISOString() || null,
        address: updated.address,
        postalCode: updated.postalCode,
        city: updated.city,
        cars,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred updating customer'
      }
    })
  }
}

/**
 * Delete customer (soft delete)
 */
export async function deleteCustomer(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { orgId } = request.user
    const { id } = request.params as CustomerIdParams

    // Find customer
    const customer = await customerService.findById(id)
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    // Verify customer belongs to admin's organization
    if (customer.orgId !== orgId) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this customer'
        }
      })
    }

    // Soft delete customer (set status to inactive)
    await customerService.delete(id)

    return reply.code(StatusCodes.NO_CONTENT).send()
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred deleting customer'
      }
    })
  }
}
