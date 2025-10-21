import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { z } from 'zod'

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from project root (../../../../.env)
// In production (Azure), this will fail silently as there's no .env file
// Azure App Service injects env vars directly into process.env
try {
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })
} catch {
  // Ignore if .env file doesn't exist (production)
}

/**
 * Environment validation schema using Zod
 */
const envSchema = z
  .object({
    // Application
    NODE_ENV: z.enum(['production', 'development']),
    PORT: z.coerce.number().default(3000),
    HOST: z.string(),
    APP_BASE_URL: z.string().default('http://localhost:5173'),

    // Database
    DATABASE_URL: z.string(),

    // JWT Configuration
    JWT_SECRET: z.string().min(32).optional(),
    JWT_ACCESS_TOKEN_EXPIRY: z.string().default('30m'),
    JWT_REFRESH_TOKEN_EXPIRY: z.string().default('30d'),
    JWT_ISSUER: z.string().default('parkingmate-api'),
    JWT_AUDIENCE: z.string().default('parkingmate-client'),

    // OTP Configuration
    OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
    OTP_LENGTH: z.coerce.number().default(6),

    // Registration Token
    REGISTRATION_TOKEN_EXPIRY_HOURS: z.coerce.number().default(48),

    // Guest Configuration
    GUEST_CONFIRMATION_WINDOW_MINUTES: z.coerce.number().default(30),
    GUEST_PARKING_DURATION_HOURS: z.coerce.number().default(24),

    // Default Org ID
    DEFAULT_ORG_ID: z.string().default('00000000-0000-0000-0000-000000000000'),

    // Email Configuration (SendGrid)
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM_EMAIL: z.string().default('noreply@parkingmate.com'),
    SENDGRID_FROM_NAME: z.string().default('ParkingMate'),
    SENDGRID_VEHICLE_DETECTION_TEMPLATE_ID: z.string(),
    SENDGRID_OTP_TEMPLATE_ID: z.string(),

    // reCAPTCHA
    RECAPTCHA_SECRET_KEY: z.string().optional(),

    // File Upload
    UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(15),
    UPLOAD_ALLOWED_TYPES: z.string().default('image/png,image/jpeg,image/jpg'),
    UPLOAD_STORAGE_PATH: z.string().default('./uploads/profiles'),

    // CORS
    CORS_ORIGIN: z
      .string()
      .default('http://localhost:5173,http://localhost:3000'),
    CORS_ALLOWED_METHODS: z
      .string()
      .default('GET,POST,PUT,DELETE,PATCH,OPTIONS'),
    CORS_ALLOWED_HEADERS: z
      .string()
      .default('Content-Type,Authorization,Accept,Accept-Language'),

    // API
    API_VERSION: z.string().default('v1'),
    API_PREFIX: z.string().default('/api'),

    // Logging
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .default('info')
  })
  .superRefine((schema, ctx) => {
    if (schema.NODE_ENV === 'production') {
      if (!schema.DATABASE_URL) {
        ctx.addIssue({
          code: 'custom',
          message: 'DATABASE_URL is required in production environment',
          path: ['DATABASE_URL']
        })
      }
      if (!schema.JWT_SECRET) {
        ctx.addIssue({
          code: 'custom',
          message: 'JWT_SECRET is required in production environment',
          path: ['JWT_SECRET']
        })
      }
      if (!schema.SENDGRID_API_KEY) {
        ctx.addIssue({
          code: 'custom',
          message: 'SendGrid API key is required in production environment',
          path: ['SENDGRID_API_KEY']
        })
      }
      if (!schema.RECAPTCHA_SECRET_KEY) {
        ctx.addIssue({
          code: 'custom',
          message: 'RECAPTCHA_SECRET_KEY is required in production environment',
          path: ['RECAPTCHA_SECRET_KEY']
        })
      }
    }
  })

/**
 * Parse and validate environment variables
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(error.issues)
      throw new Error('Environment validation failed')
    }
    throw error
  }
}

/**
 * Validated environment configuration
 */
export const env = parseEnv()

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>
