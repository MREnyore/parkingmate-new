import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { carService } from '../services/car.service.js'
import { customerService } from '../services/customer.service.js'
import { parkingSessionService } from '../services/parking-session.service.js'
import { validationService } from '../services/validation.service.js'
import type {
  AddCarInput,
  DeleteCarParams,
  UpdateCarInput,
  UpdateCarParams,
  UpdateCustomerInfoInput
} from '../types/customer.types.js'

/**
 * Get customer info with all cars
 */
export async function getCustomerInfo(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.customer) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { customerId } = request.customer

    // Get customer
    const customer = await customerService.findById(customerId)
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    // Get all customer's cars
    const cars = await carService.findByOwner(customerId)

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
        message: 'An error occurred retrieving customer info'
      }
    })
  }
}

/**
 * Update customer info
 */
export async function updateCustomerInfo(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.customer) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { customerId } = request.customer
    const updateData = request.body as UpdateCustomerInfoInput

    // Normalize phone number if provided
    if (updateData.phoneNumber) {
      updateData.phoneNumber = validationService.normalizePhoneNumber(
        updateData.phoneNumber
      )
    }

    // Update customer
    const updated = await customerService.update(customerId, updateData)
    if (!updated) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    return reply.send({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        address: updated.address,
        postalCode: updated.postalCode,
        city: updated.city,
        updatedAt: updated.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred updating customer info'
      }
    })
  }
}

/**
 * Add a new car
 */
export async function addCar(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.customer) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { customerId, orgId } = request.customer
    const { licensePlate, label, brand, model } = request.body as AddCarInput

    // Normalize license plate
    const normalizedPlate =
      validationService.normalizeLicensePlate(licensePlate)

    // Validate license plate
    if (!validationService.validateLicensePlate(normalizedPlate)) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'INVALID_LICENSE_PLATE',
          message: 'Invalid license plate format'
        }
      })
    }

    // Check if customer already has a car with this license plate
    const exists = await carService.existsForCustomer(
      normalizedPlate,
      customerId
    )
    if (exists) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: {
          code: 'CAR_EXISTS',
          message: 'You already have a car with this license plate'
        }
      })
    }

    // Create car
    const car = await carService.create({
      orgId,
      ownerId: customerId,
      licensePlate: normalizedPlate,
      label,
      brand,
      model
    })

    return reply.code(StatusCodes.CREATED).send({
      success: true,
      data: {
        id: car.id,
        orgId: car.orgId,
        ownerId: car.ownerId,
        licensePlate: car.licensePlate,
        label: car.label,
        brand: car.brand,
        model: car.model,
        createdAt: car.createdAt.toISOString(),
        updatedAt: car.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred adding car'
      }
    })
  }
}

/**
 * Update car
 */
export async function updateCar(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.customer) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { customerId } = request.customer
    const { carId } = request.params as UpdateCarParams
    const updateData = request.body as UpdateCarInput

    // Find car and verify ownership
    const car = await carService.findById(carId)
    if (!car) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CAR_NOT_FOUND',
          message: 'Car not found'
        }
      })
    }

    if (car.ownerId !== customerId) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this car'
        }
      })
    }

    // Normalize license plate if updating
    if (updateData.licensePlate) {
      updateData.licensePlate = validationService.normalizeLicensePlate(
        updateData.licensePlate
      )

      // Validate
      if (!validationService.validateLicensePlate(updateData.licensePlate)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
          success: false,
          error: {
            code: 'INVALID_LICENSE_PLATE',
            message: 'Invalid license plate format'
          }
        })
      }

      // Check for duplicates (excluding current car)
      const exists = await carService.existsForCustomer(
        updateData.licensePlate,
        customerId,
        carId
      )
      if (exists) {
        return reply.code(StatusCodes.CONFLICT).send({
          success: false,
          error: {
            code: 'CAR_EXISTS',
            message: 'You already have a car with this license plate'
          }
        })
      }
    }

    // Update car
    const updated = await carService.update(carId, updateData)
    if (!updated) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CAR_NOT_FOUND',
          message: 'Car not found'
        }
      })
    }

    return reply.send({
      success: true,
      data: {
        id: updated.id,
        licensePlate: updated.licensePlate,
        label: updated.label,
        brand: updated.brand,
        model: updated.model,
        updatedAt: updated.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred updating car'
      }
    })
  }
}

/**
 * Delete car
 */
export async function deleteCar(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.customer) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { customerId } = request.customer
    const { carId } = request.params as DeleteCarParams

    // Find car and verify ownership
    const car = await carService.findById(carId)
    if (!car) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CAR_NOT_FOUND',
          message: 'Car not found'
        }
      })
    }

    if (car.ownerId !== customerId) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this car'
        }
      })
    }

    // Check for active parking sessions
    const activeSessions = await parkingSessionService.findActiveByCarId(carId)
    if (activeSessions) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: {
          code: 'ACTIVE_SESSION_EXISTS',
          message: 'Cannot delete car with active parking session'
        }
      })
    }

    // Delete car
    await carService.delete(carId)

    return reply.code(StatusCodes.NO_CONTENT).send()
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred deleting car'
      }
    })
  }
}
