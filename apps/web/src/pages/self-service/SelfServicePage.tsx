import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { AuthLayout } from '@/components/AuthLayout'
import { HeaderLogo } from '@/components/common/HeaderLogo'
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
        const error = getValidationError('ALREADY_CONFIRMED', data.errorMessage)
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
        data.errorType ?? 'UNKNOWN',
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
      case 'RECAPTCHA_FAILED':
        return {
          type,
          title: 'CAPTCHA-Verifizierung fehlgeschlagen',
          message:
            message ||
            'Die CAPTCHA-Verifizierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.'
        }
      case 'INVALID_LICENSE_PLATE':
        return {
          type,
          title: 'Ungültiges Kennzeichen',
          message:
            message ||
            'Das eingegebene Kennzeichen hat ein ungültiges Format. Bitte überprüfen Sie Ihre Eingabe.'
        }
      case 'NO_ENTRY_DETECTED':
        return {
          type,
          title: 'Kennzeichen nicht gefunden',
          message:
            message ||
            'Dieses Kennzeichen wurde nicht auf dem Parkplatz erkannt. Bitte überprüfen Sie Ihr Kennzeichen oder kontaktieren Sie den Support.'
        }
      case 'REGISTERED_VEHICLE':
        return {
          type,
          title: 'Registriertes Fahrzeug',
          message:
            message ||
            'Dieses Fahrzeug ist bereits registriert. Bitte nutzen Sie den Kunden-Login.'
        }
      case 'ALREADY_CONFIRMED':
        return {
          type,
          title: 'Bereits bestätigt',
          message:
            message ?? 'Dieses Fahrzeug wurde bereits als Gast bestätigt.'
        }
      case 'CONFIRMATION_WINDOW_EXPIRED':
        return {
          type,
          title: 'Zeitfenster abgelaufen',
          message:
            message ||
            'Das Bestätigungszeitfenster ist abgelaufen. Bitte kontaktieren Sie den Parkplatz-Service.'
        }
      case 'NETWORK_ERROR':
        return {
          type,
          title: 'Netzwerkfehler',
          message:
            message ||
            'Ein Netzwerkfehler ist aufgetreten. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.'
        }
      case 'TIMEOUT':
        return {
          type,
          title: 'Zeitüberschreitung',
          message:
            message ||
            'Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.'
        }
      case 'UNKNOWN':
      default:
        return {
          type: 'UNKNOWN',
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
