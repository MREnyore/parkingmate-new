import type { FastifyInstance } from 'fastify'
import { processEntry } from '../controllers/camera-event.controller.js'

export async function cameraEventRoutes(server: FastifyInstance) {
  // ALPR webhook - no authentication (comes from camera system)
  // In production, you may want to add API key authentication or IP whitelisting
  server.post('/datahub/entry', processEntry)
}
