// Step enum for customer registration flow
export type Step =
  | 'validating'
  | 'expired'
  | 'email'
  | 'code'
  | 'name'
  | 'plate'
  | 'success'

// Props for step components
export interface StepProps {
  email: string
  setEmail: (email: string) => void
  verificationCode: string
  setVerificationCode: (code: string) => void
  name: string
  setName: (name: string) => void
  plate: string
  setPlate: (plate: string) => void
  onSendCode: () => void
  onVerifyCode: () => void
  onConfirmName: () => void
  onSubmitPlate: () => void
  onGoToDashboard: () => void
  sendCodeMutation: {
    isPending: boolean
    error: Error | null
  }
  verifyCodeMutation: {
    isPending: boolean
    error: Error | null
  }
  registerPlateMutation: {
    isPending: boolean
    error: Error | null
  }
}

export interface RegistrationHeaderProps {
  step: Step
  name: string
  registerPlateMutation: {
    isPending: boolean
  }
}
