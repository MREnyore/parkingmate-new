import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
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

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(2, t('first_name_min_2')),
      lastName: z.string().min(2, t('last_name_min_2')),
      email: z.string().email(t('invalid_email')),
      password: z
        .string()
        .min(8, t('password_min_8'))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('password_requirements')),
      confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwords_dont_match'),
      path: ['confirmPassword']
    })

type RegisterForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { t } = useTranslation()

  const registerSchema = createRegisterSchema(t)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (values: RegisterForm) => {
    setIsLoading(true)

    try {
      // TODO: Replace with actual registration logic
      console.log('Registration attempt:', values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful registration
      localStorage.setItem('isAuthenticated', 'true')

      // Redirect to home page
      navigate(ROUTES.HOME, { replace: true })
    } catch (error) {
      console.error('Registration error:', error)
      // Handle error - show toast, etc.
    } finally {
      setIsLoading(false)
    }
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
                {t('join_parkingmate')}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              {t('create_account_description')}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700">
                        {t('first_name')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('john_placeholder')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700">
                        {t('last_name')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('doe_placeholder')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

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
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700">
                      {t('password')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('create_strong_password')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-700">
                      {t('confirm_password')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('confirm_your_password')}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      </div>
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
                {isLoading ? t('creating_account') : t('register')}
              </Button>
            </form>
          </Form>

          {/* Bottom CTA */}
          <div className="pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('already_have_account')}{' '}
                <Button
                  variant="link"
                  size="sm"
                  asChild={true}
                  className="p-0 h-auto font-medium"
                >
                  <Link to={ROUTES.LOGIN}>{t('sign_in_link')}</Link>
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
