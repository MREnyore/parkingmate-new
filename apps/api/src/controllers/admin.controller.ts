import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { adminUserService } from '../services/admin-user.service'
import { carService } from '../services/car.service'
import { customerService } from '../services/customer.service'
import { organizationService } from '../services/organization.service'
import { passwordService } from '../services/password.service'

/**
 * Seed database with initial data (development only)
 */
export async function seedDatabase(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Seeding is only allowed in development mode'
        }
      })
    }

    request.log.info('Seeding database...')

    // 1. Create default organization
    let org = await organizationService.findById(
      '00000000-0000-0000-0000-000000000000'
    )
    if (!org) {
      org = await organizationService.create({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Default Organization',
        status: 'active'
      })
      request.log.info(`Organization created: ${org.id}`)
    }

    // 2. Create admin user
    let admin = await adminUserService.findByEmail('admin@parkingmate.com')
    if (!admin) {
      const passwordHash = await passwordService.hash('Admin123!')
      admin = await adminUserService.create({
        orgId: org.id,
        email: 'admin@parkingmate.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active'
      })
      request.log.info(`Admin user created: ${admin.email}`)
    }

    // 3. Create test customer
    let customer = await customerService.findByEmail(
      'customer@test.com',
      org.id
    )
    if (!customer) {
      customer = await customerService.create({
        orgId: org.id,
        name: 'Test Customer',
        email: 'customer@test.com',
        phoneNumber: '+1234567890',
        registered: true,
        status: 'active',
        membershipStatus: 'active',
        city: 'San Francisco'
      })
      request.log.info(`Test customer created: ${customer.email}`)
    }

    // 4. Create test car for customer
    const testPlate = 'ABC123'
    let car = await carService.findByLicensePlate(testPlate, org.id)
    if (!car) {
      car = await carService.create({
        orgId: org.id,
        ownerId: customer.id,
        licensePlate: testPlate,
        label: 'Test Car',
        brand: 'Tesla',
        model: 'Model 3'
      })
      request.log.info(`Test car created: ${car.licensePlate}`)
    }

    return reply.send({
      success: true,
      data: {
        message: 'Database seeded successfully',
        details: {
          organization: {
            id: org.id,
            name: org.name
          },
          adminUser: {
            email: admin.email,
            password: 'Admin123!' // Only show in seed response
          },
          testCustomer: {
            id: customer.id,
            email: customer.email,
            name: customer.name
          },
          testCar: {
            id: car.id,
            licensePlate: car.licensePlate
          }
        }
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred seeding database'
      }
    })
  }
}
