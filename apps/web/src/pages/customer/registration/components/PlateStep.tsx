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

interface PlateStepProps
  extends Pick<
    StepProps,
    'plate' | 'setPlate' | 'onSubmitPlate' | 'registerPlateMutation'
  > {
  onBack: () => void
}

export const PlateStep = ({
  plate,
  setPlate,
  onSubmitPlate,
  onBack,
  registerPlateMutation
}: PlateStepProps) => {
  const { t } = useTranslation()
  const form = useForm({})

  return (
    <motion.div
      key="plate-step"
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
                {t('plate_number', { defaultValue: 'Kennzeichen' })}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('plate_placeholder', {
                    defaultValue: 'B-AB 1234'
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          </motion.div>

          {registerPlateMutation.error && (
            <motion.div
              className="text-sm text-red-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {registerPlateMutation.error.message ||
                t('registration_failed', {
                  defaultValue: 'Registration failed. Please try again.'
                })}
            </motion.div>
          )}

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onBack}
            >
              {t('back', { defaultValue: 'Zurück' })}
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={onSubmitPlate}
              disabled={!plate.trim() || registerPlateMutation.isPending}
            >
              {registerPlateMutation.isPending ? (
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
                  {t('saving', { defaultValue: 'Speichern…' })}
                </>
              ) : (
                t('confirm', { defaultValue: 'Bestätigen' })
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
