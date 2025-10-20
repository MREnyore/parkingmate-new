import { OtpCode } from '@/components/OtpCode'
import { useTranslation } from '@/hooks/useTranslation'
import type { StepProps } from '../types'

interface CodeStepProps
  extends Pick<
    StepProps,
    | 'verificationCode'
    | 'setVerificationCode'
    | 'onVerifyCode'
    | 'onSendCode'
    | 'verifyCodeMutation'
    | 'sendCodeMutation'
  > {
  onBack: () => void
}

export const CodeStep = ({
  verificationCode,
  setVerificationCode,
  onVerifyCode,
  onSendCode,
  onBack,
  verifyCodeMutation,
  sendCodeMutation
}: CodeStepProps) => {
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
      submitButtonText={t('continue', { defaultValue: 'Weiter' })}
      showHelperText={true}
      codeExpiryDuration={600}
      resendCooldown={30}
    />
  )
}
