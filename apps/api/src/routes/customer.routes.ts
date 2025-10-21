import type { FastifyInstance } from 'fastify'
import {
  addCar,
  deleteCar,
  getCustomerInfo,
  updateCar,
  updateCustomerInfo
} from '../controllers/customer.controller.js'
import { authMiddleware, requireCustomer } from '../middleware/auth.middleware.js'

export async function customerRoutes(server: FastifyInstance) {
  // All customer routes require authentication
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', requireCustomer)

  // Get customer info
  server.get('/customer/info', getCustomerInfo)

  // Update customer info
  server.put('/customer/info', updateCustomerInfo)

  // Add car
  server.post('/customer/cars', addCar)

  // Update car
  server.put('/customer/cars/:carId', updateCar)

  // Delete car
  server.delete('/customer/cars/:carId', deleteCar)
}
