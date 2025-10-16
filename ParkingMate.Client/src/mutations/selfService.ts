import { useMutation } from '@tanstack/react-query'
import { type ValidationErrorType, validateGuestPlate } from '@/api/selfService'

/**
 * Mutation hook for validating guest plate number with reCAPTCHA
 * Used in the self-service guest parking flow
 */
export const useValidateGuestPlate = (
  onSuccess?: (data: {
    success: boolean
    isFirstTime?: boolean
    validUntil?: string
    errorType?: ValidationErrorType
    errorMessage?: string
  }) => void
) => {
  return useMutation({
    mutationFn: validateGuestPlate,
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data)
      }
    },
    throwOnError: false
  })
}
