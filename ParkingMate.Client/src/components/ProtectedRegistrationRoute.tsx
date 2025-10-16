import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/types/routes'

interface ProtectedRegistrationRouteProps {
  children: React.ReactNode
}

// Mock API call to validate registration ID from email
const validateRegistrationId = async (id: string | null): Promise<boolean> => {
  if (!id) {
    throw new Error('No registration ID provided')
  }

  // Simulate API call with delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock validation logic - in real app, this would hit your backend
  // For demo: accept IDs that are at least 8 characters and contain numbers
  const isValidFormat = id.length >= 8 && /\d/.test(id)

  if (!isValidFormat) {
    throw new Error('Invalid registration ID format')
  }

  // Mock: randomly reject 10% of valid IDs to simulate expired/used tokens
  if (Math.random() < 0.1) {
    throw new Error('Registration ID has expired or been used')
  }

  return true
}

export function ProtectedRegistrationRoute({
  children
}: ProtectedRegistrationRouteProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const {
    data: isValidId,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['validateRegistrationId', id],
    queryFn: () => validateRegistrationId(id),
    retry: false, // Don't retry failed validations
    staleTime: 5 * 60 * 1000 // Consider valid for 5 minutes
  })

  // Show loading state while validating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold">
            Validating registration link...
          </div>
          <div className="text-sm text-gray-600">
            Please wait while we verify your registration ID.
          </div>
        </div>
      </div>
    )
  }

  // If validation failed or ID is invalid, redirect to login
  if (isError || !isValidId) {
    console.error('Registration ID validation failed:', error)
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{
          from: location.pathname,
          error: 'Invalid or expired registration link. Please contact support.'
        }}
        replace={true}
      />
    )
  }

  // If ID is valid, render the registration content with animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth feel
      }}
    >
      {children}
    </motion.div>
  )
}
