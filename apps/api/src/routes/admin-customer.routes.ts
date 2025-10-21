import type { FastifyInstance } from 'fastify'
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer
} from '../controllers/admin-customer.controller.js'
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware.js'

export async function adminCustomerRoutes(server: FastifyInstance) {
  // All routes require admin authentication
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', requireAdmin)

  // Get all customers
  server.get('/admin/customers', getAllCustomers)

  // Create customer
  server.post('/admin/customers', createCustomer)

  // Get customer by ID
  server.get('/admin/customers/:id', getCustomerById)

  // Update customer
  server.put('/admin/customers/:id', updateCustomer)

  // Delete customer
  server.delete('/admin/customers/:id', deleteCustomer)
}
