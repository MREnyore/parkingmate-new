import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export type ValidationErrorType =
  | 'RECAPTCHA_FAILED'
  | 'INVALID_LICENSE_PLATE'
  | 'REGISTERED_VEHICLE'
  | 'ALREADY_CONFIRMED'
  | 'NO_ENTRY_DETECTED'
  | 'CONFIRMATION_WINDOW_EXPIRED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN'

interface ValidatePlateRequest {
  plateNumber: string
  captchaToken: string
}

interface ValidatePlateResponse {
  success: boolean
  isFirstTime?: boolean
  validUntil?: string
  errorType?: ValidationErrorType
  errorMessage?: string
}

/**
 * Validates a guest plate number with reCAPTCHA verification
 * Calls the backend API which verifies the captcha token server-side
 */
export async function validateGuestPlate(
  payload: ValidatePlateRequest
): Promise<ValidatePlateResponse> {
  const { plateNumber, captchaToken } = payload

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await apiClient.validateGuestPlate({
      licensePlate: plateNumber,
      recaptchaToken: captchaToken
    })

    if (response.success && response.data) {
      const validUntil =
        typeof response.data === 'object' && 'validUntil' in response.data
          ? (response.data.validUntil as string)
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      toast.success('Guest Parking Approved', {
        description: `One-time guest parking permit granted for ${plateNumber}`
      })
      return {
        success: true,
        isFirstTime: true,
        validUntil
      }
    }

    // Handle validation errors from API
    const errorCode = (response.error?.code as ValidationErrorType) ?? 'UNKNOWN'
    const errorMessage = response.error?.message ?? 'Validation failed'

    // Map error codes to user-friendly messages
    const userMessage = getUserFriendlyErrorMessage(errorCode, errorMessage)

    toast.error('Validation Failed', {
      description: userMessage
    })

    return {
      success: false,
      isFirstTime: false,
      errorType: errorCode,
      errorMessage: userMessage
    }
  } catch (error) {
    console.error('Error validating guest plate:', error)
    const errorMessage =
      'An unexpected error occurred. Please try again or contact support.'
    toast.error('Validation Error', {
      description: errorMessage
    })
    return {
      success: false,
      errorType: 'NETWORK_ERROR',
      errorMessage
    }
  }
}

/**
 * Get user-friendly error messages based on error codes
 */
function getUserFriendlyErrorMessage(
  code: ValidationErrorType,
  defaultMessage: string
): string {
  const messages: Record<ValidationErrorType, string> = {
    RECAPTCHA_FAILED: 'reCAPTCHA verification failed. Please try again.',
    INVALID_LICENSE_PLATE:
      'Invalid license plate format. Please check and try again.',
    REGISTERED_VEHICLE:
      'This vehicle is already registered. Please use the customer login instead.',
    ALREADY_CONFIRMED: 'This vehicle has already been confirmed as a guest.',
    NO_ENTRY_DETECTED:
      'No recent entry detected for this license plate. Please contact parking staff.',
    CONFIRMATION_WINDOW_EXPIRED:
      'The confirmation window has expired. Please contact parking staff.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNKNOWN: defaultMessage
  }

  return messages[code] || defaultMessage
}
