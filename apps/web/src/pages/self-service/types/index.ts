import type { ValidationErrorType } from '@/api/selfService'

export type Step = 'plate' | 'success' | 'error'

export interface ValidationError {
  type: ValidationErrorType
  message: string
  title: string
}

export interface StepProps {
  onNext?: () => void
  onBack?: () => void
}

// Re-export for convenience
export type { ValidationErrorType }
