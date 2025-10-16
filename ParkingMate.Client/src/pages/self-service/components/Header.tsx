import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Step } from '../types'

interface HeaderProps {
  step: Step
}

export const Header = ({ step }: HeaderProps) => {
  const { t } = useTranslation()

  const getHeaderContent = () => {
    switch (step) {
      case 'plate':
        return {
          title: t('guest_parking_title', {
            defaultValue: 'Gästeparkplatz'
          }),
          description: t('guest_parking_description', {
            defaultValue:
              'Bitte geben Sie Ihr Kennzeichen ein, um Ihren einmaligen Gästeparkausweis zu aktivieren.'
          })
        }
      case 'success':
        return {
          title: t('success', { defaultValue: 'Erfolg' }),
          description: ''
        }
      case 'error':
        return {
          title: t('error', { defaultValue: 'Fehler' }),
          description: ''
        }
      default:
        return {
          title: '',
          description: ''
        }
    }
  }

  const { title, description } = getHeaderContent()

  // Don't show header for success/error steps (they have their own titles)
  if (step === 'success' || step === 'error') {
    return null
  }

  return (
    <div className="space-y-2">
      <motion.h1
        className="text-lg font-semibold text-foreground"
        key={step}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
