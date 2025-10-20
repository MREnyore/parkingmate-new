import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/useTranslation'
import { ROUTES } from '@/types/routes'

const createForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('invalid_email'))
  })

type ForgotPasswordForm = {
  email: string
}

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { t } = useTranslation()

  const forgotPasswordSchema = createForgotPasswordSchema(t)

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (values: ForgotPasswordForm) => {
    setIsLoading(true)

    try {
      // TODO: Replace with actual password reset logic
      console.log('Password reset request:', values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful request
      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset error:', error)
      // Handle error - show toast, etc.
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Logo */}
            <div className="bg-blue-600 text-white p-4 rounded-lg inline-block">
              <div className="text-xl font-bold leading-tight">
                {t('parking_mate_full')
                  .split('\n')
                  .map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < t('parking_mate_full').split('\n').length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
              </div>
            </div>

            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('check_your_email')}
              </h1>
              <p className="text-gray-600">
                {t('password_reset_instructions')}
              </p>
              <p className="text-sm text-gray-500">
                {t('didnt_receive_email')}
              </p>
            </div>

            <Button size="lg" className="w-full" asChild={true}>
              <Link to={ROUTES.LOGIN}>{t('back_to_login')}</Link>
            </Button>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
          <div className="text-center relative z-10">
            {/* Large Typography Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[12rem] font-black text-gray-800 leading-none select-none opacity-80">
                {t('the_parking_mate_company')
                  .split('\n')
                  .map((line, i) => (
                    <span key={i}>
                      {line}
                      {i <
                        t('the_parking_mate_company').split('\n').length -
                          1 && <br />}
                    </span>
                  ))}
              </div>
            </div>

            {/* Centered Logo */}
            <div className="bg-blue-600 text-white p-8 rounded-2xl inline-block relative z-20 shadow-lg">
              <div className="text-4xl font-bold leading-tight">
                {t('parking_mate_full')
                  .split('\n')
                  .map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < t('parking_mate_full').split('\n').length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="bg-blue-600 text-white p-4 rounded-lg inline-block">
            <div className="text-xl font-bold leading-tight">
              {t('parking_mate_full')
                .split('\n')
                .map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < t('parking_mate_full').split('\n').length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                {t('reset_password')}
              </h1>
            </div>
            <p className="text-sm text-gray-600">{t('enter_email_reset')}</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700">
                      {t('email_address')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('email_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? t('sending_reset_link') : t('send_reset_link')}
              </Button>
            </form>
          </Form>

          {/* Bottom CTA */}
          <div className="pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('dont_have_account')}{' '}
                <Button
                  variant="link"
                  size="sm"
                  asChild={true}
                  className="p-0 h-auto font-medium"
                >
                  <Link to={ROUTES.REGISTER}>{t('sign_up')}</Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="text-center relative z-10">
          {/* Large Typography Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[12rem] font-black text-gray-800 leading-none select-none opacity-80">
              {t('the_parking_mate_company')
                .split('\n')
                .map((line, i) => (
                  <span key={i}>
                    {line}
                    {i <
                      t('the_parking_mate_company').split('\n').length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
            </div>
          </div>

          {/* Centered Logo */}
          <div className="bg-blue-600 text-white p-8 rounded-2xl inline-block relative z-20 shadow-lg">
            <div className="text-4xl font-bold leading-tight">
              {t('parking_mate_full')
                .split('\n')
                .map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < t('parking_mate_full').split('\n').length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
