import { OtpCode } from '@/components/OtpCode'
import { useTranslation } from '@/hooks/useTranslation'

interface PasswordlessCodeStepProps {
  verificationCode: string
  setVerificationCode: (value: string) => void
  onVerifyCode: () => void
  onSendCode: () => void
  onBack: () => void
  verifyCodeMutation: {
    isPending: boolean
    error: Error | null
  }
  sendCodeMutation: {
    isPending: boolean
  }
}

export const PasswordlessCodeStep = ({
  verificationCode,
  setVerificationCode,
  onVerifyCode,
  onSendCode,
  onBack,
  verifyCodeMutation,
  sendCodeMutation
}: PasswordlessCodeStepProps) => {
  const { t } = useTranslation()

  return (
    <OtpCode
      verificationCode={verificationCode}
      setVerificationCode={setVerificationCode}
      onVerifyCode={onVerifyCode}
      onSendCode={onSendCode}
      onBack={onBack}
      verifyCodeMutation={verifyCodeMutation}
      sendCodeMutation={sendCodeMutation}
      submitButtonText={t('sign_in', { defaultValue: 'Anmelden' })}
      showHelperText={false}
      codeExpiryDuration={600}
      resendCooldown={30}
    />
  )
}
