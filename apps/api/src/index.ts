import { env } from './config/env'
import { createServer } from './server'

/**
 * Start the server
 */
const start = async () => {
  try {
    const server = await createServer()

    await server.listen({
      port: env.PORT,
      host: env.HOST
    })

    console.log(`
╭─────────────────────────────────────────────╮
│                                             │
│  🚗 ParkingMate API Server                  │
│                                             │
│  Environment: ${env.NODE_ENV.padEnd(28)}  │
│  Port:        ${String(env.PORT).padEnd(28)}  │
│  Docs:        http://localhost:${env.PORT}/docs    │
│                                             │
╰─────────────────────────────────────────────╯
    `)
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`)
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server
start()
