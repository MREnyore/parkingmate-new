/**
 * Validation service for common data validation and normalization
 */
export const validationService = {
  /**
   * Normalize license plate (uppercase, remove spaces)
   */
  normalizeLicensePlate(plate: string): string {
    return plate.toUpperCase().replace(/\s+/g, '')
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate license plate format (basic validation)
   */
  validateLicensePlate(plate: string): boolean {
    // Allow alphanumeric characters and basic punctuation
    const plateRegex = /^[A-Z0-9-]+$/
    const normalized = this.normalizeLicensePlate(plate)
    return (
      plateRegex.test(normalized) &&
      normalized.length >= 2 &&
      normalized.length <= 20
    )
  },

  /**
   * Generate OTP code
   */
  generateOtpCode(length = 6): string {
    const digits = '0123456789'
    let otp = ''
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)]
    }
    return otp
  },

  /**
   * Generate random token
   */
  generateToken(length = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)]
    }
    return token
  },

  /**
   * Validate phone number (basic validation)
   */
  validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    // Check if it's between 10 and 15 digits
    return cleaned.length >= 10 && cleaned.length <= 15
  },

  /**
   * Normalize phone number
   */
  normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '')
  },

  /**
   * Validate postal code (flexible format)
   */
  validatePostalCode(postalCode: string): boolean {
    // Allow alphanumeric with spaces and hyphens
    const postalRegex = /^[A-Z0-9\s-]+$/i
    return (
      postalRegex.test(postalCode) &&
      postalCode.length >= 3 &&
      postalCode.length <= 10
    )
  }
}
