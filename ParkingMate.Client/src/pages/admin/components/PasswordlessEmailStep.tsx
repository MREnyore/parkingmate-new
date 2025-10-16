import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/useTranslation'

interface PasswordlessEmailStepProps {
  email: string
  setEmail: (value: string) => void
  onSendCode: () => void
  onToggleMode: () => void
  sendCodeMutation: {
    isPending: boolean
    error: Error | null
  }
}

export const PasswordlessEmailStep = ({
  email,
  setEmail,
  onSendCode,
  onToggleMode,
  sendCodeMutation
}: PasswordlessEmailStepProps) => {
  const { t } = useTranslation()
  const form = useForm({})

  return (
    <motion.div
      key="passwordless-email-step"
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
                {t('email_address', { defaultValue: 'E-Mail-Adresse' })}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('email_placeholder', {
                    defaultValue: 'ihre.email@beispiel.de'
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          </motion.div>

          {sendCodeMutation.error && (
            <motion.div
              className="text-sm text-red-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {sendCodeMutation.error.message ||
                t('failed_to_send_code', {
                  defaultValue:
                    'Failed to send verification code. Please try again.'
                })}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={onSendCode}
              disabled={
                !email.trim() ||
                !email.includes('@') ||
                sendCodeMutation.isPending
              }
            >
              {sendCodeMutation.isPending ? (
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
                  {t('sending_code', { defaultValue: 'CODE WIRD GESENDET…' })}
                </>
              ) : (
                t('send_verification_code', {
                  defaultValue: 'BESTÄTIGUNGSCODE SENDEN'
                })
              )}
            </Button>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('or', { defaultValue: 'oder' })}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onToggleMode}
            >
              {t('login_with_password', {
                defaultValue: 'Mit Passwort anmelden'
              })}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
