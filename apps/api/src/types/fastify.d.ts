import type { AdminUserData, CustomerData } from './request.types'

declare module 'fastify' {
  interface FastifyRequest {
    user?: AdminUserData
    customer?: CustomerData
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AdminUserData
  }
}

export {}
