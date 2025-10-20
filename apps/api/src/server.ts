import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify, { type FastifyInstance } from 'fastify'
import * as yaml from 'js-yaml'
import { env } from './config/env'
import { errorHandler } from './middleware/error-handler.middleware'
import { registerRateLimiter } from './middleware/rate-limiter.middleware'

/**
 * Create and configure Fastify server
 */
export const createServer = async (): Promise<FastifyInstance> => {
  const server = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
              }
            }
          : undefined
    }
  })

  // Security: Helmet
  await server.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production'
  })

  // CORS - Support multiple origins (comma-separated)
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) =>
    origin.trim()
  )
  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        cb(null, true)
        return
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        cb(null, true)
      } else {
        server.log.warn(`✗ CORS blocked origin: ${origin}`)
        cb(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true
  })

  // JWT Authentication
  await server.register(jwt, {
    secret: env.JWT_SECRET ?? 'development-secret-key-change-in-production',
    sign: {
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY
    }
  })

  // Multipart/form-data support (for file uploads)
  await server.register(multipart, {
    limits: {
      fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
    }
  })

  // Rate limiting
  await registerRateLimiter(server)

  // Error handler
  server.setErrorHandler(errorHandler)

  // Load OpenAPI specification from YAML file
  const openapiPath = join(process.cwd(), 'openapi.yml')
  const openapiContent = readFileSync(openapiPath, 'utf8')
  // biome-ignore lint/suspicious/noExplicitAny: OpenAPI spec structure is dynamic and loaded from YAML
  const openapiSpec: any = yaml.load(openapiContent)

  // Update server URL dynamically based on environment
  if (openapiSpec.servers && Array.isArray(openapiSpec.servers)) {
    openapiSpec.servers[0] = {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}/${env.API_VERSION}`,
      description: 'Development server'
    }
  }

  // OpenAPI / Swagger Documentation
  await server.register(swagger, {
    mode: 'static',
    specification: {
      document: openapiSpec
    }
    // biome-ignore lint/suspicious/noExplicitAny: Swagger plugin type definitions don't match runtime behavior for static mode
  } as any)

  // Swagger UI
  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      withCredentials: true
    },
    staticCSP: false
  })

  // Health check endpoint
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })

  // Register API routes
  const { registerRoutes } = await import('./routes/router')
  await server.register(registerRoutes, {
    prefix: `${env.API_PREFIX}/${env.API_VERSION}`
  })

  return server
}
