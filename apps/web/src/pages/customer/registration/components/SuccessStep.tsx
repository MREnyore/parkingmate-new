import { motion } from 'motion/react'
import { AnimatedSuccesCheck } from '@/components/AnimatedSuccesCheck'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import type { StepProps } from '../types'

interface SuccessStepProps extends Pick<StepProps, 'onGoToDashboard'> {}

export const SuccessStep = ({ onGoToDashboard }: SuccessStepProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      key="success-step"
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedSuccesCheck />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Button
          type="button"
          size="lg"
          onClick={onGoToDashboard}
          className="w-full"
        >
          {t('go_to_dashboard', { defaultValue: 'ZUM DASHBOARD' })}
        </Button>
      </motion.div>
    </motion.div>
  )
}
