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
import type { StepProps } from '../types'

interface EmailStepProps
  extends Pick<
    StepProps,
    'email' | 'setEmail' | 'onSendCode' | 'sendCodeMutation'
  > {}

export const EmailStep = ({
  email,
  setEmail,
  onSendCode,
  sendCodeMutation
}: EmailStepProps) => {
  const { t } = useTranslation()
  const form = useForm({})

  return (
    <motion.div
      key="email-step"
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
                  readOnly={true}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
              <p className="text-xs text-gray-500 mt-1">
                {t('email_prefilled_message', {
                  defaultValue:
                    'Diese E-Mail-Adresse wurde aus Ihrem Registrierungslink übernommen.'
                })}
              </p>
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
                t('continue_registration', {
                  defaultValue: 'REGISTRIERUNG FORTSETZEN'
                })
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
