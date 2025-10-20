import type { FastifyInstance } from 'fastify'
import {
  changePassword,
  getProfile,
  removeProfilePicture,
  updateProfile,
  uploadProfilePicture
} from '../controllers/admin-user.controller'
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware'

export async function adminUserRoutes(server: FastifyInstance) {
  // All routes require admin authentication
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', requireAdmin)

  // Get admin profile
  server.get('/admin/profile', getProfile)

  // Update admin profile
  server.put('/admin/profile', updateProfile)

  // Change password
  server.post('/admin/profile/change-password', changePassword)

  // Upload profile picture
  server.post('/admin/profile/picture', uploadProfilePicture)

  // Remove profile picture
  server.delete('/admin/profile/picture', removeProfilePicture)
}
