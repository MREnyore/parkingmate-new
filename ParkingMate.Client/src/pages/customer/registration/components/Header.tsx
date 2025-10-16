import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import type { RegistrationHeaderProps } from '../types'

export const Header = ({
  step,
  name,
  registerPlateMutation
}: RegistrationHeaderProps) => {
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
        {step === 'validating' &&
          t('validating_registration_title', {
            defaultValue: 'Registrierung wird überprüft'
          })}
        {step === 'expired' &&
          t('registration_expired_title', {
            defaultValue: 'Registrierung abgelaufen'
          })}
        {step === 'email' &&
          t('verify_email_title', {
            defaultValue: 'E-Mail bestätigen'
          })}
        {step === 'code' &&
          t('enter_verification_code_title', {
            defaultValue: 'Bestätigungscode eingeben'
          })}
        {step === 'name' &&
          !registerPlateMutation.isPending &&
          t('register_plate_title', {
            defaultValue: 'Kennzeichen registrieren'
          })}
        {step === 'plate' &&
          !registerPlateMutation.isPending &&
          t('enter_plate_title', {
            defaultValue: 'Kennzeichen eingeben'
          })}
        {registerPlateMutation.isPending &&
          t('saving', { defaultValue: 'Speichern…' })}
        {step === 'success' &&
          t('plate_registered_title', {
            defaultValue: 'Kennzeichen erfolgreich registriert'
          })}
      </motion.h1>

      {step === 'email' && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('verify_email_desc', {
            defaultValue: 'Bestätigen Sie Ihre E-Mail-Adresse, um fortzufahren.'
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
          {t('enter_verification_code_desc', {
            defaultValue:
              'Geben Sie den 6-stelligen Code ein, den wir Ihnen per E-Mail gesendet haben.'
          })}
        </motion.p>
      )}

      {step === 'plate' && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('customer_name_label', { defaultValue: 'Name' })}:{' '}
          <span className="font-medium">{name}</span>
        </motion.p>
      )}

      {step === 'success' && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('plate_registered_desc', {
            defaultValue: 'Ihr Kennzeichen wurde gespeichert.'
          })}
        </motion.p>
      )}
    </div>
  )
}
