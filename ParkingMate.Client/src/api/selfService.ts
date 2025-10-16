import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'

export type ValidationErrorType =
  | 'captcha-failed'
  | 'not-in-parking'
  | 'customer-plate'
  | 'already-used'
  | 'expired'
  | 'unknown'

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
    const response = await fetch(`${API_BASE_URL}/api/guest/validate-plate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licensePlate: plateNumber,
        captchaToken: captchaToken
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle HTTP error responses
      const errorMessage =
        data.errorMessage || data.message || 'Failed to validate plate'
      toast.error('Validation Failed', {
        description: errorMessage
      })
      return {
        success: false,
        errorType: 'not-in-parking',
        errorMessage
      }
    }

    // Handle successful response
    if (data.success) {
      toast.success('Guest Parking Approved', {
        description: `One-time guest parking permit granted for ${plateNumber}`
      })
      return {
        success: true,
        isFirstTime: data.isFirstTime || true,
        validUntil: data.validUntil
      }
    }

    // Handle validation errors
    const errorType = (data.errorType as ValidationErrorType) || 'unknown'
    const errorMessage = data.errorMessage || 'Validation failed'

    toast.error('Validation Failed', {
      description: errorMessage
    })

    return {
      success: false,
      isFirstTime: false,
      errorType,
      errorMessage
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
      errorType: 'not-in-parking',
      errorMessage
    }
  }
}
