// Step enum for customer login flow
export type Step = 'email' | 'code' | 'success'

// Props for step components
export interface StepProps {
  email: string
  setEmail: (email: string) => void
  verificationCode: string
  setVerificationCode: (code: string) => void
  onSendCode: () => void
  onVerifyCode: () => void
  onGoToManagePlate: () => void
  sendCodeMutation: {
    isPending: boolean
    error: Error | null
  }
  verifyCodeMutation: {
    isPending: boolean
    error: Error | null
  }
}

export interface LoginHeaderProps {
  step: Step
  email: string
  sendCodeMutation: {
    isPending: boolean
  }
  verifyCodeMutation: {
    isPending: boolean
  }
}
