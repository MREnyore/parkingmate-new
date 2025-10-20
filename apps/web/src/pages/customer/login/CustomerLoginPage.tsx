import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { HeaderLogo } from '@/components/common/HeaderLogo'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { useVerifyOtpCode } from '@/mutations/auth'
import { useCustomerLoginOtp } from '@/mutations/customer'
import { ROUTES } from '@/types/routes'
import { CodeStep, EmailStep, LoginHeader, SuccessStep } from './components'
import type { Step } from './types'

export function CustomerLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  // Mutation for sending OTP to customer email
  const sendCodeMutation = useCustomerLoginOtp(() => {
    setStep('code')
  })

  // Mutation for verifying OTP code
  const verifyCodeMutation = useVerifyOtpCode(() => {
    // Navigate to manage plates page
    setStep('success')
  })

  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@')) return
    sendCodeMutation.mutateAsync(email.trim())
  }

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) return
    verifyCodeMutation.mutateAsync({
      email: email.trim(),
      otpCode: verificationCode.trim()
    })
  }

  const goToManagePlate = () => {
    navigate(ROUTES.MANAGE_PLATE, { replace: true })
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <HeaderLogo />

        {/* Header */}
        <LoginHeader
          step={step}
          email={email}
          sendCodeMutation={sendCodeMutation}
          verifyCodeMutation={verifyCodeMutation}
        />

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSendCode={handleSendCode}
              sendCodeMutation={sendCodeMutation}
            />
          )}

          {step === 'code' && (
            <CodeStep
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              onVerifyCode={handleVerifyCode}
              onSendCode={handleSendCode}
              onBack={() => setStep('email')}
              verifyCodeMutation={verifyCodeMutation}
              sendCodeMutation={sendCodeMutation}
            />
          )}

          {step === 'success' && (
            <SuccessStep onGoToManagePlate={goToManagePlate} />
          )}
        </AnimatePresence>

        {/* Bottom Links */}
        {step === 'email' && (
          <motion.div
            className="pt-6 border-t border-gray-200 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              {t('admin_login_instead', { defaultValue: 'Administrator?' })}{' '}
              <Button
                variant="link"
                size="sm"
                asChild={true}
                className="p-0 h-auto font-medium"
              >
                <Link to={ROUTES.LOGIN}>
                  {t('admin_login', { defaultValue: 'Admin-Anmeldung' })}
                </Link>
              </Button>
            </p>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  )
}
