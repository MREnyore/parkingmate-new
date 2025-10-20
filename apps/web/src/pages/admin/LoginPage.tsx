import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { useAdminLogin } from '@/mutations/auth'
import { useSessionStore } from '@/stores/sessionStore'
import { ROUTES } from '@/types/routes'
import { decodeJWT } from '@/utils/jwt'
import {
  PasswordlessCodeStep,
  PasswordlessEmailStep,
  PasswordStep
} from './components'

type LoginMode = 'password' | 'passwordless'
type PasswordlessStep = 'email' | 'code'

type LoginForm = {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const setTokens = useSessionStore((state) => state.setTokens)

  // Login mode state
  const [loginMode, setLoginMode] = useState<LoginMode>('password')
  const [passwordlessStep, setPasswordlessStep] =
    useState<PasswordlessStep>('email')

  // Passwordless login state
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  // TODO: Implement admin passwordless login mutations
  // For now, passwordless login is not implemented
  const sendCodeMutation = {
    mutateAsync: async (email: string) => {
      console.log('Admin OTP not implemented yet:', email)
      return { success: false }
    },
    isPending: false,
    isError: false,
    error: null
  }

  const verifyCodeMutation = {
    mutateAsync: async (payload: { email: string; code: string }) => {
      console.log('Admin OTP verification not implemented yet:', payload)
      return { success: false }
    },
    isPending: false,
    isError: false,
    error: null
  }

  // Admin login mutation
  const loginMutation = useAdminLogin((data) => {
    if (data.success && data.tokens) {
      const { accessToken, refreshToken } = data.tokens

      // Decode JWT to extract user info
      const decodedToken = decodeJWT(accessToken)

      // Get role from JWT (normalize to capitalized format)
      const roleFromToken = decodedToken?.role as string | undefined
      const role = roleFromToken
        ? ((roleFromToken.charAt(0).toUpperCase() + roleFromToken.slice(1)) as
            | 'Admin'
            | 'Customer')
        : undefined

      // Use user data from response if available, otherwise fall back to JWT
      const email =
        data.user?.email || (decodedToken?.email as string | undefined)
      const firstName = data.user?.firstName
      const lastName = data.user?.lastName
      const name =
        firstName && lastName ? `${firstName} ${lastName}` : undefined

      // Store tokens in Zustand session store (this is what RouteGuard checks!)
      setTokens(accessToken, refreshToken, {
        email: email ?? '',
        role,
        name
      })

      // Also store in localStorage for persistence
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('bearerToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      // User data will be fetched via /auth/me query
      // Redirect to originally requested page or home
      const returnTo = location.state?.from || ROUTES.HOME
      navigate(returnTo, { replace: true })
    }
  })

  const onPasswordSubmit = (values: LoginForm) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password
    })
  }

  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@')) return
    sendCodeMutation.mutateAsync(email.trim())
  }

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) return
    verifyCodeMutation.mutateAsync({
      email: email.trim(),
      code: verificationCode.trim()
    })
  }

  const toggleLoginMode = () => {
    setLoginMode((prev) => (prev === 'password' ? 'passwordless' : 'password'))
    // Reset passwordless step when toggling
    if (loginMode === 'passwordless') {
      setPasswordlessStep('email')
      setVerificationCode('')
    }
  }

  const handleBackToEmail = () => {
    setPasswordlessStep('email')
    setVerificationCode('')
  }

  // Determine header text based on mode and step
  const getHeaderText = () => {
    if (loginMode === 'password') {
      return {
        title: t('welcome_back'),
        subtitle: t('sign_in_to_access')
      }
    }
    if (passwordlessStep === 'email') {
      return {
        title: t('passwordless_login', {
          defaultValue: 'Passwortlose Anmeldung'
        }),
        subtitle: t('enter_email_for_code', {
          defaultValue: 'Geben Sie Ihre E-Mail-Adresse ein'
        })
      }
    }
    return {
      title: t('enter_verification_code', {
        defaultValue: 'Bestätigungscode eingeben'
      }),
      subtitle: t('code_sent_to_email', {
        defaultValue: `Code wurde an ${email} gesendet`
      })
    }
  }

  const headerText = getHeaderText()

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="bg-primary text-primary-foreground p-4 rounded-lg inline-block">
          <div className="text-xl font-bold leading-tight">
            {t('parking_mate_full')
              .split('\n')
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i < t('parking_mate_full').split('\n').length - 1 && <br />}
                </span>
              ))}
          </div>
        </div>

        {/* Header */}
        <motion.div
          className="space-y-2"
          key={`header-${loginMode}-${passwordlessStep}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">
              {headerText.title}
            </h1>
          </div>
          <p className="text-sm text-gray-600">{headerText.subtitle}</p>
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {loginMode === 'password' && (
            <PasswordStep
              onSubmit={onPasswordSubmit}
              isLoading={loginMutation.isPending}
              onToggleMode={toggleLoginMode}
            />
          )}

          {loginMode === 'passwordless' && passwordlessStep === 'email' && (
            <PasswordlessEmailStep
              email={email}
              setEmail={setEmail}
              onSendCode={handleSendCode}
              onToggleMode={toggleLoginMode}
              sendCodeMutation={sendCodeMutation}
            />
          )}

          {loginMode === 'passwordless' && passwordlessStep === 'code' && (
            <PasswordlessCodeStep
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              onVerifyCode={handleVerifyCode}
              onSendCode={handleSendCode}
              onBack={handleBackToEmail}
              verifyCodeMutation={verifyCodeMutation}
              sendCodeMutation={sendCodeMutation}
            />
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        {loginMode === 'password' && (
          <motion.div
            className="pt-6 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('dont_have_account', {
                  defaultValue: "Don't have an account?"
                })}{' '}
                <Button
                  variant="link"
                  size="sm"
                  asChild={true}
                  className="p-0 h-auto font-medium"
                >
                  <a href="mailto:admin@parkingmate.com">
                    {t('contact_administrator', {
                      defaultValue: 'Contact Administrator'
                    })}
                  </a>
                </Button>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  )
}
