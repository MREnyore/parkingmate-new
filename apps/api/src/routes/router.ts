import type { FastifyInstance } from 'fastify'
import { adminRoutes } from './admin.routes'
import { adminCustomerRoutes } from './admin-customer.routes'
import { adminUserRoutes } from './admin-user.routes'
import { authRoutes } from './auth.routes'
import { cameraEventRoutes } from './camera-event.routes'
import { customerRoutes } from './customer.routes'
import { guestRoutes } from './guest.routes'
import { parkingLotRoutes } from './parking-lot.router'

/**
 * Register all API routes
 */
export async function registerRoutes(server: FastifyInstance) {
  // Authentication routes
  await server.register(authRoutes)

  // Customer routes
  await server.register(customerRoutes)

  // Admin user routes
  await server.register(adminUserRoutes)

  // Admin customer management routes
  await server.register(adminCustomerRoutes)

  // Camera event routes (ALPR webhook)
  await server.register(cameraEventRoutes)

  // Guest routes
  await server.register(guestRoutes)

  // Admin utility routes
  await server.register(adminRoutes)

  // Legacy parking lot routes
  await server.register(parkingLotRoutes)
}
