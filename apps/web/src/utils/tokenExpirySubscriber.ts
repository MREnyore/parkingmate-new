// Token expiry subscriber - checks token expiration every 5 minutes

import { useSessionStore } from '@/stores/sessionStore'
import { getJWTTimeToExpiry, isJWTExpired } from './jwt'

class TokenExpirySubscriber {
  private intervalId: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds
  private isRunning = false
  private consecutiveFailures = 0
  private readonly MAX_FAILURES_BEFORE_LOGOUT = 3 // Allow 3 failures before logout

  /**
   * Check if we're in development mode
   */
  private isDevelopment(): boolean {
    return import.meta.env.DEV || process.env.NODE_ENV === 'development'
  }

  /**
   * Reset failure counter on successful operations
   */
  private resetFailureCounter() {
    if (this.consecutiveFailures > 0) {
      console.log('Resetting failure counter after successful operation')
      this.consecutiveFailures = 0
    }
  }

  /**
   * Start the token expiry checker
   */
  start() {
    if (this.isRunning) {
      console.log('Token expiry subscriber already running')
      return
    }

    console.log('Starting token expiry subscriber (checks every 5 minutes)')
    this.isRunning = true

    // Don't check immediately on start - let the user access the app first
    // The interval will handle validation after 5 minutes
    // This prevents aggressive validation on page refresh that could clear auth

    // Then check every 5 minutes
    this.intervalId = setInterval(async () => {
      await this.checkTokenExpiry()
    }, this.CHECK_INTERVAL)
  }

  /**
   * Stop the token expiry checker
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('Token expiry subscriber stopped')
  }

  /**
   * Check if current token is expired and handle accordingly
   * Now uses API validation and attempts token refresh if needed
   * Skips JWT expiry checks for ServiceStack sessions (admin)
   */
  private async checkTokenExpiry() {
    const { accessToken, isAuthenticated, validateToken, refreshTokens } =
      useSessionStore.getState()

    // Skip if no token or not authenticated
    if (!accessToken || !isAuthenticated) {
      return
    }

    try {
      // First check if token is expired locally (quick check) - JWT only
      const locallyExpired = isJWTExpired(accessToken)

      if (locallyExpired) {
        console.log('Token expired locally, attempting refresh...')

        // Try to refresh the token
        const refreshSuccess = await refreshTokens()

        if (!refreshSuccess) {
          console.log('Token refresh failed, user will be redirected to login')
          // refreshTokens() already handles clearing auth and redirecting
          return
        }

        console.log('Token refreshed successfully')
        this.resetFailureCounter()
        return
      }

      // If not locally expired, validate with server (every 5 minutes)
      console.log('Validating token with server...')
      const isValid = await validateToken()

      if (!isValid) {
        console.log('Server validation failed, attempting refresh...')

        // Try to refresh the token
        const refreshSuccess = await refreshTokens()

        if (!refreshSuccess) {
          console.log('Token refresh failed after server validation failure')
          // refreshTokens() already handles clearing auth and redirecting
          return
        }

        console.log(
          'Token refreshed successfully after server validation failure'
        )
        this.resetFailureCounter()
      } else {
        // Token is valid, log time remaining
        const timeToExpiry = getJWTTimeToExpiry(accessToken)
        const minutesRemaining = Math.floor(timeToExpiry / (1000 * 60))
        console.log(`Token valid for ${minutesRemaining} more minutes`)
        this.resetFailureCounter()
      }
    } catch (error) {
      console.error('Error checking token expiry:', error)

      // Try to refresh token as fallback
      try {
        console.log('Attempting token refresh due to validation error...')
        const refreshSuccess = await refreshTokens()

        if (!refreshSuccess) {
          console.log('Token refresh failed after validation error')
          this.consecutiveFailures++
          // refreshTokens() already handles clearing auth and redirecting
        } else {
          this.resetFailureCounter()
        }
      } catch (refreshError) {
        console.error('Token refresh also failed:', refreshError)
        this.consecutiveFailures++

        // Only clear auth if we've had multiple consecutive failures
        // and we're not in development mode (to prevent logout during crashes)
        if (
          this.consecutiveFailures >= this.MAX_FAILURES_BEFORE_LOGOUT &&
          !this.isDevelopment()
        ) {
          console.error(
            `Clearing auth after ${this.consecutiveFailures} consecutive failures`
          )
          useSessionStore.getState().clearAuth()
        } else if (this.isDevelopment()) {
          console.warn(
            `Development mode: Not clearing auth despite ${this.consecutiveFailures} failures (crash protection)`
          )
        } else {
          console.warn(
            `Failure ${this.consecutiveFailures}/${this.MAX_FAILURES_BEFORE_LOGOUT} - will retry`
          )
        }
      }
    }
  }

  /**
   * Force check token expiry (useful for testing or manual validation)
   */
  async checkNow() {
    await this.checkTokenExpiry()
  }

  /**
   * Validate token only (without refresh attempts) - useful for startup
   */
  async validateOnly() {
    const { accessToken, isAuthenticated, validateToken } =
      useSessionStore.getState()

    // Skip if no token or not authenticated
    if (!accessToken || !isAuthenticated) {
      return false
    }

    try {
      console.log('Validating token (startup check)...')
      const isValid = await validateToken()

      if (isValid) {
        console.log('Token is valid on startup')
        return true
      } else {
        console.log(
          'Token validation failed on startup - will attempt refresh later'
        )
        return false
      }
    } catch (error) {
      console.error('Token validation error on startup:', error)
      return false
    }
  }

  /**
   * Get current status
   */
  get status() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.CHECK_INTERVAL,
      consecutiveFailures: this.consecutiveFailures,
      maxFailuresBeforeLogout: this.MAX_FAILURES_BEFORE_LOGOUT,
      isDevelopmentMode: this.isDevelopment()
    }
  }
}

// Create singleton instance
export const tokenExpirySubscriber = new TokenExpirySubscriber()

// Auto-start when module is imported (in production)
// Comment out during development if you want manual control
if (typeof window !== 'undefined') {
  // Only start in browser environment
  tokenExpirySubscriber.start()
}
