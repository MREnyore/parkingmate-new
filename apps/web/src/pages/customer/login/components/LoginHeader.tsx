import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LoginHeaderProps } from '../types'

export const LoginHeader = ({
  step,
  email,
  sendCodeMutation,
  verifyCodeMutation
}: LoginHeaderProps) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <motion.h1
        className="text-lg font-semibold text-foreground"
        key={step}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'email' &&
          !sendCodeMutation.isPending &&
          t('customer_login_title', {
            defaultValue: 'Kundenbereich anmelden'
          })}
        {step === 'email' &&
          sendCodeMutation.isPending &&
          t('sending_code', {
            defaultValue: 'Code wird gesendet…'
          })}
        {step === 'code' &&
          t('enter_verification_code', {
            defaultValue: 'Bestätigungscode eingeben'
          })}
        {verifyCodeMutation.isPending &&
          t('verifying', { defaultValue: 'Überprüfen…' })}
        {step === 'success' &&
          t('login_successful', {
            defaultValue: 'Erfolgreich angemeldet'
          })}
      </motion.h1>

      {step === 'email' && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('enter_email_for_code', {
            defaultValue:
              'Geben Sie Ihre E-Mail-Adresse ein, um einen Bestätigungscode zu erhalten.'
          })}
        </motion.p>
      )}

      {step === 'code' && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('code_sent_to', { defaultValue: 'Code gesendet an' })}:{' '}
          <span className="font-medium">{email}</span>
        </motion.p>
      )}

      {step === 'success' && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('redirecting_to_dashboard', {
            defaultValue: 'Sie werden zum Dashboard weitergeleitet...'
          })}
        </motion.p>
      )}
    </div>
  )
}
