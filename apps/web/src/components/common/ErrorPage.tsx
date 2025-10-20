import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { ROUTES } from '@/types/routes'

interface ErrorPlaceholderProps {
  title?: string
  message?: string
  error?: Error | string
  onRetry?: () => void
  showRetry?: boolean
  showGoHome?: boolean
  userRole?: 'user' | 'admin'
  showHeader?: boolean
  showFooter?: boolean
}

export const ErrorPlaceholder = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data.',
  error,
  onRetry,
  showRetry = true,
  showGoHome = true,
  userRole = 'user',
  showHeader = true,
  showFooter = true
}: ErrorPlaceholderProps) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleGoHome = () => {
    if (userRole === 'user') {
      navigate(ROUTES.MANAGE_PLATE)
    } else {
      navigate(ROUTES.HOME)
    }
  }

  const ErrorContent = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-muted-foreground">{message}</p>

          {error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Technical details
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
                {typeof error === 'string' ? error : error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}

          {showGoHome && (
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  // For mobile customer pages
  if (isMobile && userRole === 'user') {
    // Import components dynamically to avoid circular dependencies
    const Header = require('@/pages/customer/manage-plates/components').Header
    const Footer = require('@/pages/customer/manage-plates/components').Footer

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && <Header />}
        <div className="flex-1 px-4 py-6">
          <ErrorContent />
        </div>
        {showFooter && <Footer />}
      </div>
    )
  }

  // For desktop or admin pages
  return (
    <DashboardLayout>
      <ErrorContent />
    </DashboardLayout>
  )
}
