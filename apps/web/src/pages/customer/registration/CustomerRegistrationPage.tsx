import { useMutation } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { HeaderLogo } from '@/components/common/HeaderLogo'
import { useTriggerOtpCode, useVerifyOtpCode } from '@/mutations/auth'
import { useValidateRegistrationToken } from '@/queries/customer'
import { ROUTES } from '@/types/routes'
import {
  CodeStep,
  EmailStep,
  ExpiredRegistration,
  Header,
  NameStep,
  PlateStep,
  type Step,
  SuccessStep,
  ValidationLoader
} from './components'

export function CustomerRegistrationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // State for all steps - start with validating only if we have a token
  const [step, setStep] = useState<Step>('validating')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [name, setName] = useState('')
  const [plate, setPlate] = useState('')

  // Get registration token from URL
  const registrationToken = searchParams.get('token')

  // React Query for validation
  const {
    data: validationData,
    isLoading: isValidating,
    isError: validationError
  } = useValidateRegistrationToken({
    registrationToken: registrationToken ?? ''
  })

  // React Query mutations for the rest of the flow
  const sendCodeMutation = useTriggerOtpCode(() => {
    setStep('code')
  })

  const verifyCodeMutation = useVerifyOtpCode(() => {
    setStep('name')
  })

  const registerPlateMutation = useMutation({
    mutationFn: () => {
      return Promise.resolve()
    },
    onSuccess: () => {
      setStep('success')
    },
    onError: (error: Error) => {
      console.error('Registration error:', error)
    }
  })

  // Step handlers
  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@') || !registrationToken) return
    sendCodeMutation.mutateAsync({
      registrationToken: registrationToken
    })
  }

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) return
    verifyCodeMutation.mutateAsync({
      email: email.trim(),
      otpCode: verificationCode
    })
  }

  const handleConfirmName = () => {
    if (!name.trim()) return
    setStep('plate')
  }

  const handleSubmitPlate = () => {
    if (!plate.trim()) return
  }

  const goToDashboard = () => {
    navigate(ROUTES.MANAGE_PLATE)
  }

  // Handle validation results
  useEffect(() => {
    if (!registrationToken) {
      setStep('expired')
      return
    }

    if (isValidating) {
      setStep('validating')
      return
    }

    if (validationError) {
      setStep('expired')
      return
    }

    if (validationData) {
      if (validationData.valid && validationData.email) {
        setEmail(validationData.email)
        setStep('email')
      } else {
        // Token is invalid or expired, or there was an API error
        console.error('Token validation failed:', validationData.error)
        setStep('expired')
      }
    }
  }, [registrationToken, isValidating, validationError, validationData])

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <HeaderLogo />

        {/* Header */}
        <Header
          step={step}
          name={name}
          registerPlateMutation={registerPlateMutation}
        />

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {step === 'validating' && <ValidationLoader />}

          {step === 'expired' && <ExpiredRegistration />}

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

          {step === 'name' && (
            <NameStep
              name={name}
              setName={setName}
              onConfirmName={handleConfirmName}
            />
          )}

          {step === 'plate' && (
            <PlateStep
              plate={plate}
              setPlate={setPlate}
              onSubmitPlate={handleSubmitPlate}
              onBack={() => setStep('name')}
              registerPlateMutation={registerPlateMutation}
            />
          )}

          {step === 'success' && (
            <SuccessStep onGoToDashboard={goToDashboard} />
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  )
}
