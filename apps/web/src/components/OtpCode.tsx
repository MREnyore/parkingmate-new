import { AlertCircle, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { useTranslation } from '@/hooks/useTranslation'

interface OtpCodeProps {
  verificationCode: string
  setVerificationCode: (value: string) => void
  onVerifyCode: () => void
  onSendCode: () => void
  onBack: () => void
  verifyCodeMutation: {
    isPending: boolean
    error: Error | null
  }
  sendCodeMutation?: {
    isPending: boolean
  }
  submitButtonText?: string
  showHelperText?: boolean
  codeExpiryDuration?: number
  resendCooldown?: number
}

export const OtpCode = ({
  verificationCode,
  setVerificationCode,
  onVerifyCode,
  onSendCode,
  onBack,
  verifyCodeMutation,
  sendCodeMutation,
  submitButtonText,
  showHelperText = false,
  codeExpiryDuration = 600,
  resendCooldown = 30
}: OtpCodeProps) => {
  const { t } = useTranslation()
  const form = useForm({})

  // Code expiry timer (10 minutes)
  const [expiryTimeRemaining, setExpiryTimeRemaining] =
    useState(codeExpiryDuration)
  const [isExpiryActive, setIsExpiryActive] = useState(true)

  // Resend cooldown timer with exponential backoff
  const [resendTimeRemaining, setResendTimeRemaining] = useState(0)
  const [isResendCooldownActive, setIsResendCooldownActive] = useState(false)
  const [resendAttempts, setResendAttempts] = useState(0)

  // Calculate cooldown based on attempts: 30s for first 3, then double each time
  const calculateCooldown = (attempts: number) => {
    if (attempts < 3) {
      return resendCooldown // 30s for first 3 attempts
    }
    // After 3 attempts, double the cooldown each time
    // Attempt 3: 60s, Attempt 4: 120s, Attempt 5: 240s, etc.
    return resendCooldown * Math.pow(2, attempts - 2)
  }

  const handleResendCode = () => {
    onSendCode()

    // Clear the verification code input when resending
    setVerificationCode('')

    // Increment attempt counter
    const newAttempts = resendAttempts + 1
    setResendAttempts(newAttempts)

    // Calculate new cooldown with exponential backoff
    const newCooldown = calculateCooldown(newAttempts)

    // Reset expiry timer and start new cooldown
    setExpiryTimeRemaining(codeExpiryDuration)
    setIsExpiryActive(true)
    setResendTimeRemaining(newCooldown)
    setIsResendCooldownActive(true)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const isResendDisabled =
    (isResendCooldownActive && resendTimeRemaining > 0) ||
    sendCodeMutation?.isPending

  const isCodeExpired = !isExpiryActive && expiryTimeRemaining === 0

  // Initialize resend cooldown on mount (first code was just sent)
  useEffect(() => {
    setResendTimeRemaining(resendCooldown)
    setIsResendCooldownActive(true)
  }, [resendCooldown])

  // Code expiry countdown
  useEffect(() => {
    if (!isExpiryActive || expiryTimeRemaining <= 0) {
      return
    }

    const timer = setInterval(() => {
      setExpiryTimeRemaining((prev: number) => {
        if (prev <= 1) {
          setIsExpiryActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isExpiryActive, expiryTimeRemaining])

  // Resend cooldown countdown
  useEffect(() => {
    if (!isResendCooldownActive || resendTimeRemaining <= 0) {
      return
    }

    const timer = setInterval(() => {
      setResendTimeRemaining((prev: number) => {
        if (prev <= 1) {
          setIsResendCooldownActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isResendCooldownActive, resendTimeRemaining])

  return (
    <motion.div
      key="code-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <FormItem>
              <FormLabel className="text-sm text-gray-700">
                {t('verification_code', {
                  defaultValue: 'Bestätigungscode'
                })}
              </FormLabel>
              <FormControl>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
              {showHelperText && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {t('code_sent_message', {
                    defaultValue:
                      'Wir haben Ihnen einen 6-stelligen Code per E-Mail gesendet.'
                  })}
                </p>
              )}
            </FormItem>
          </motion.div>

          {/* Code Expiry Timer */}
          {isExpiryActive && expiryTimeRemaining > 0 && (
            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-gray-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Clock className="w-4 h-4" />
              <span>
                {t('code_expires_in', {
                  defaultValue: 'Code läuft ab in'
                })}{' '}
                <span className="font-semibold">
                  {formatTime(expiryTimeRemaining)}
                </span>
              </span>
            </motion.div>
          )}

          {/* Code Expired Warning */}
          {isCodeExpired && (
            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {t('code_expired', {
                  defaultValue:
                    'Dieser Code ist abgelaufen. Bitte fordern Sie einen neuen Code an.'
                })}
              </span>
            </motion.div>
          )}

          {verifyCodeMutation.error && (
            <motion.div
              className="text-sm text-red-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {verifyCodeMutation.error.message ||
                t('invalid_verification_code', {
                  defaultValue:
                    'Invalid or expired verification code. Please try again.'
                })}
            </motion.div>
          )}

          <motion.div
            className="flex gap-3 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onBack}
            >
              {t('back', { defaultValue: 'Zurück' })}
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={onVerifyCode}
              disabled={
                verificationCode.length !== 6 ||
                verifyCodeMutation.isPending ||
                isCodeExpired
              }
            >
              {verifyCodeMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  {t('verifying', { defaultValue: 'Überprüfen…' })}
                </>
              ) : (
                submitButtonText || t('continue', { defaultValue: 'Weiter' })
              )}
            </Button>
          </motion.div>

          <motion.div
            className="text-center space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResendCode}
              disabled={isResendDisabled}
              className={`text-sm ${
                isResendDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600'
              }`}
            >
              {sendCodeMutation?.isPending && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full mr-2 inline-block"
                />
              )}
              {isResendCooldownActive && resendTimeRemaining > 0
                ? `${t('resend_code', { defaultValue: 'Code erneut senden' })} (${resendTimeRemaining}s)`
                : t('resend_code', { defaultValue: 'Code erneut senden' })}
            </Button>
            {resendAttempts >= 3 && (
              <p className="text-xs text-gray-500">
                {t('cooldown_increased', {
                  defaultValue: 'Wartezeit erhöht nach mehreren Versuchen'
                })}
              </p>
            )}
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
