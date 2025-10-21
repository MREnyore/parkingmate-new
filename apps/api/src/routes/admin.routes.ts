import type { FastifyInstance } from 'fastify'
import { seedDatabase } from '../controllers/admin.controller.js'

export async function adminRoutes(server: FastifyInstance) {
  // Seed database (development only - checked in controller)
  server.post('/admin/seed-db', seedDatabase)
}
