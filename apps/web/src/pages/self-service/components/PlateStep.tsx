import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
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

interface PlateStepProps {
  onSubmit: (
    plateNumber: string,
    captchaToken: string,
    resetCaptcha: () => void
  ) => void
  isLoading: boolean
}

export const PlateStep = ({ onSubmit, isLoading }: PlateStepProps) => {
  const { t } = useTranslation()
  const form = useForm({})
  const [plateNumber, setPlateNumber] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const siteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token)
  }

  const resetCaptcha = () => {
    recaptchaRef.current?.reset()
    setCaptchaToken(null)
  }

  const handleSubmit = () => {
    if (plateNumber.trim() && captchaToken) {
      onSubmit(plateNumber.trim(), captchaToken, resetCaptcha)
    }
  }

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
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex justify-center"
          >
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={handleCaptchaChange}
              theme="light"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!plateNumber.trim() || !captchaToken || isLoading}
            >
              {isLoading ? (
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
                  {t('validating', { defaultValue: 'Validierung…' })}
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
