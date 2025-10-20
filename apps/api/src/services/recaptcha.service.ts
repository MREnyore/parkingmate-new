import { env } from '../config/env'

/**
 * Google reCAPTCHA API response interface
 */
interface RecaptchaApiResponse {
  success: boolean
  score?: number // For v3
  action?: string // For v3
  challenge_ts?: string // ISO timestamp
  hostname?: string
  'error-codes'?: string[]
}

/**
 * reCAPTCHA service for validating reCAPTCHA tokens
 */
export const recaptchaService = {
  /**
   * Verify reCAPTCHA token
   */
  async verify(
    token: string,
    remoteIp?: string
  ): Promise<{ success: boolean; score?: number; error?: string }> {
    // Skip validation in development if no secret key is configured
    if (env.NODE_ENV === 'development' && !env.RECAPTCHA_SECRET_KEY) {
      return { success: true, score: 1.0 }
    }

    if (!env.RECAPTCHA_SECRET_KEY) {
      throw new Error('reCAPTCHA secret key not configured')
    }

    try {
      const response = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            secret: env.RECAPTCHA_SECRET_KEY,
            response: token,
            ...(remoteIp && { remoteip: remoteIp })
          })
        }
      )

      const data = (await response.json()) as RecaptchaApiResponse

      if (!data.success) {
        return {
          success: false,
          error:
            data['error-codes']?.join(', ') ?? 'reCAPTCHA validation failed'
        }
      }

      return {
        success: true,
        score: data.score // For reCAPTCHA v3
      }
    } catch (_error) {
      return {
        success: false,
        error: 'Failed to verify reCAPTCHA'
      }
    }
  },

  /**
   * Verify reCAPTCHA v3 with score threshold
   */
  async verifyWithScore(
    token: string,
    minScore = 0.5,
    remoteIp?: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.verify(token, remoteIp)

    if (!result.success) {
      return result
    }

    // For reCAPTCHA v3, check the score
    if (result.score !== undefined && result.score < minScore) {
      return {
        success: false,
        error: `reCAPTCHA score too low: ${result.score} (required: ${minScore})`
      }
    }

    return { success: true }
  }
}
