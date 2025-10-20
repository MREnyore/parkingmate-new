import { AlertCircle, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import type { ValidationError } from '../types'

interface ErrorStepProps {
  error: ValidationError
  plateNumber: string
  onTryAgain: () => void
}

export const ErrorStep = ({
  error,
  plateNumber,
  onTryAgain
}: ErrorStepProps) => {
  const { t } = useTranslation()

  const getErrorIcon = () => {
    return (
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
    )
  }

  const handleContactSupport = () => {
    // Open email client or phone dialer
    window.location.href = 'mailto:support@parkingmate.com'
  }

  return (
    <motion.div
      key="error-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex justify-center"
      >
        {getErrorIcon()}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="space-y-2"
      >
        <h3 className="text-2xl font-semibold text-gray-900">{error.title}</h3>
        <p className="text-gray-600">
          {t('entered_plate', { defaultValue: 'Eingegebenes Kennzeichen' })}:{' '}
          <span className="font-semibold text-gray-900">{plateNumber}</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 text-left"
      >
        <p className="text-sm text-red-900">{error.message}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="space-y-3"
      >
        {/* Show "Try Again" button only for errors where retrying makes sense */}
        {error.type !== 'ALREADY_CONFIRMED' &&
          error.type !== 'REGISTERED_VEHICLE' && (
            <Button size="lg" className="w-full" onClick={onTryAgain}>
              {t('try_again', { defaultValue: 'Erneut versuchen' })}
            </Button>
          )}

        {/* Contact Support button */}
        <Button
          size="lg"
          variant={
            error.type === 'ALREADY_CONFIRMED' ||
            error.type === 'REGISTERED_VEHICLE'
              ? 'default'
              : 'outline'
          }
          className="w-full"
          onClick={handleContactSupport}
        >
          <Phone className="w-4 h-4 mr-2" />
          {t('contact_support', { defaultValue: 'Support kontaktieren' })}
        </Button>
      </motion.div>
    </motion.div>
  )
}
