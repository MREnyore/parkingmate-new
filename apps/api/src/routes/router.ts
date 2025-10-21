import type { FastifyInstance } from 'fastify'
import { adminRoutes } from './admin.routes.js'
import { adminCustomerRoutes } from './admin-customer.routes.js'
import { adminUserRoutes } from './admin-user.routes.js'
import { authRoutes } from './auth.routes.js'
import { cameraEventRoutes } from './camera-event.routes.js'
import { customerRoutes } from './customer.routes.js'
import { guestRoutes } from './guest.routes.js'
import { parkingLotRoutes } from './parking-lot.router.js'

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
