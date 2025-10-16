import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'

export const HeaderLogo = () => {
  const { t } = useTranslation()

  return (
    <motion.div
      className="bg-blue-600 text-white p-4 rounded-lg inline-block"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="text-xl font-bold leading-tight">
        {t('parking_mate_full', { defaultValue: 'PARKING\nMATE' })
          .split('\n')
          .map((line, i) => (
            <span key={i}>
              {line}
              {i <
                t('parking_mate_full', {
                  defaultValue: 'PARKING\nMATE'
                }).split('\n').length -
                  1 && <br />}
            </span>
          ))}
      </div>
    </motion.div>
  )
}
