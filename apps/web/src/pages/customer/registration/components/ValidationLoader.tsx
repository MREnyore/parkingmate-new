import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'

export const ValidationLoader = () => {
  const { t } = useTranslation()

  return (
    <motion.div
      key="validation-loader"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-foreground">
          {t('validating_registration', {
            defaultValue: 'Registrierungslink wird überprüft...'
          })}
        </h2>
        <p className="text-sm text-gray-600">
          {t('validating_registration_desc', {
            defaultValue:
              'Bitte warten Sie, während wir Ihren Registrierungslink validieren.'
          })}
        </p>
      </motion.div>
    </motion.div>
  )
}
