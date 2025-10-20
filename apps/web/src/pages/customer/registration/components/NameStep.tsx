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

interface NameStepProps
  extends Pick<StepProps, 'name' | 'setName' | 'onConfirmName'> {}

export const NameStep = ({ name, setName, onConfirmName }: NameStepProps) => {
  const { t } = useTranslation()
  const form = useForm({})

  return (
    <motion.div
      key="name-step"
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
                {t('name', { defaultValue: 'Name' })}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('name_placeholder', {
                    defaultValue: 'John Doe'
                  })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={onConfirmName}
              disabled={!name.trim()}
            >
              {t('register_plate_cta', {
                defaultValue: 'KENNZEICHEN REGISTRIEREN'
              })}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
