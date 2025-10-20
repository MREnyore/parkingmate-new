import { AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface ExpiredRegistrationProps {
  onContactSupport?: () => void
}

export const ExpiredRegistration = ({
  onContactSupport
}: ExpiredRegistrationProps) => {
  const { t } = useTranslation()

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport()
    } else {
      // Default behavior - could open email client or redirect to support page
      window.location.href =
        'mailto:support@parkingmate.com?subject=Expired Registration Link'
    }
  }

  return (
    <motion.div
      key="expired-registration"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-foreground">
          {t('registration_expired_title', {
            defaultValue: 'Registrierungslink abgelaufen'
          })}
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          {t('registration_expired_desc', {
            defaultValue:
              'Ihr Registrierungslink ist abgelaufen oder wurde bereits verwendet. Bitte wenden Sie sich an den Support, um einen neuen Link zu erhalten.'
          })}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={handleContactSupport}
          className="w-full sm:w-auto"
          size="lg"
        >
          {t('contact_support', {
            defaultValue: 'Support kontaktieren'
          })}
        </Button>
      </motion.div>

      <motion.div
        className="text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {t('registration_help_text', {
          defaultValue:
            'Benötigen Sie Hilfe? Unser Support-Team hilft Ihnen gerne weiter.'
        })}
      </motion.div>
    </motion.div>
  )
}
