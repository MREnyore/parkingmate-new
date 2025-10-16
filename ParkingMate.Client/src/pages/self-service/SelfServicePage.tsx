import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { AuthLayout } from '@/components/AuthLayout'
import { HeaderLogo } from '@/components/common'
import { useValidateGuestPlate } from '@/mutations/selfService'
import { ErrorStep, Header, PlateStep, SuccessStep } from './components'
import type { Step, ValidationError, ValidationErrorType } from './types'

export function SelfServicePage() {
  const [step, setStep] = useState<Step>('plate')
  const [plateNumber, setPlateNumber] = useState('')
  const [validUntil, setValidUntil] = useState<string | undefined>(undefined)
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null)

  // Mutation for plate validation
  const validatePlateMutation = useValidateGuestPlate((data) => {
    if (data.success) {
      // Check if this is their first time or they've already used it
      if (data.isFirstTime === false) {
        // Already used their one-time guest parking
        const error = getValidationError('already-used', data.errorMessage)
        setValidationError(error)
        setStep('error')
      } else {
        // First time - grant access
        setValidUntil(data.validUntil)
        setStep('success')
      }
    } else {
      // Map error type to user-friendly error
      const error = getValidationError(
        data.errorType ?? 'not-in-parking',
        data.errorMessage
      )
      setValidationError(error)
      setStep('error')
    }
  })

  const handlePlateSubmit = async (
    plate: string,
    captchaToken: string,
    resetCaptcha: () => void
  ) => {
    setPlateNumber(plate)
    try {
      await validatePlateMutation.mutateAsync({
        plateNumber: plate,
        captchaToken
      })
    } finally {
      // Reset captcha after request completes (success or error)
      resetCaptcha()
    }
  }

  const handleTryAgain = () => {
    setStep('plate')
    setPlateNumber('')
    setValidationError(null)
  }

  const getValidationError = (
    type: ValidationErrorType,
    message?: string
  ): ValidationError => {
    switch (type) {
      case 'captcha-failed':
        return {
          type,
          title: 'CAPTCHA-Verifizierung fehlgeschlagen',
          message:
            message ||
            'Die CAPTCHA-Verifizierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.'
        }
      case 'not-in-parking':
        return {
          type,
          title: 'Kennzeichen nicht gefunden',
          message:
            message ||
            'Dieses Kennzeichen wurde nicht auf dem Parkplatz erkannt. Bitte überprüfen Sie Ihr Kennzeichen oder kontaktieren Sie den Support.'
        }
      case 'customer-plate':
        return {
          type,
          title: 'Kundenkennzeichen',
          message:
            message ||
            'Dieses Kennzeichen ist einem Kundenkonto zugeordnet. Gästeparken ist für Kundenkennzeichen nicht verfügbar.'
        }
      case 'already-used':
        return {
          type,
          title: 'Bereits verwendet',
          message:
            message ||
            'Der einmalige Gästeparkplatz wurde für dieses Kennzeichen bereits genutzt. Bitte bezahlen Sie für das Parken oder registrieren Sie sich als Kunde.'
        }
      case 'expired':
        return {
          type,
          title: 'Zeitfenster abgelaufen',
          message:
            message ||
            'Das Zeitfenster für diesen Gästeparkplatz ist abgelaufen. Bitte kontaktieren Sie den Support.'
        }
      case 'unknown':
      default:
        return {
          type: 'unknown',
          title: 'Validierungsfehler',
          message:
            message ||
            'Kennzeichen konnte nicht validiert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.'
        }
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <HeaderLogo />

        {/* Header */}
        <Header step={step} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'plate' && (
            <PlateStep
              onSubmit={handlePlateSubmit}
              isLoading={validatePlateMutation.isPending}
            />
          )}

          {step === 'success' && (
            <SuccessStep plateNumber={plateNumber} validUntil={validUntil} />
          )}

          {step === 'error' && validationError && (
            <ErrorStep
              error={validationError}
              plateNumber={plateNumber}
              onTryAgain={handleTryAgain}
            />
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  )
}
