import { motion } from 'motion/react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useUserRoles } from '@/stores/sessionStore'
import { ROUTES } from '@/types/routes'

type UserRole = 'Admin' | 'Customer'

interface RouteGuardProps {
  children: React.ReactNode
  /** Route requires authentication */
  requireAuth?: boolean
  /** Allowed roles for this route (if empty, any authenticated user can access) */
  allowedRoles?: UserRole[]
  /** Where to redirect if not authenticated */
  redirectIfNotAuth?: string
  /** Where to redirect if authenticated (for auth pages like login) */
  redirectIfAuth?: string
  /** Where to redirect if user doesn't have required role */
  redirectIfUnauthorized?: string
}

/**
 * RouteGuard - Unified component for handling authentication and authorization
 *
 * Use cases:
 * 1. Public routes (no auth required): <RouteGuard>{children}</RouteGuard>
 * 2. Auth pages (redirect if logged in): <RouteGuard redirectIfAuth="/dashboard">{children}</RouteGuard>
 * 3. Protected routes (any authenticated user): <RouteGuard requireAuth>{children}</RouteGuard>
 * 4. Role-specific routes: <RouteGuard requireAuth allowedRoles={['Customer']}>{children}</RouteGuard>
 */
export function RouteGuard({
  children,
  requireAuth = false,
  allowedRoles = [],
  redirectIfNotAuth = ROUTES.CUSTOMER_LOGIN,
  redirectIfAuth,
  redirectIfUnauthorized = ROUTES.CUSTOMER_LOGIN
}: RouteGuardProps) {
  const { accessToken, isAuthenticated } = useAuth()
  const { getUserRole } = useUserRoles()
  const location = useLocation()
  const userRole = getUserRole()

  // Case 1: User is authenticated but shouldn't be on this page (e.g., login page)
  if (isAuthenticated && accessToken && redirectIfAuth) {
    console.log(
      `User already authenticated, redirecting from ${location.pathname} to ${redirectIfAuth}`
    )
    return <Navigate to={redirectIfAuth} replace={true} />
  }

  // Case 2: Route requires authentication but user is not authenticated
  if (requireAuth && (!isAuthenticated || !accessToken)) {
    // Determine redirect based on required role
    const loginRoute = allowedRoles.includes('Admin')
      ? ROUTES.LOGIN
      : redirectIfNotAuth

    console.log(
      `User not authenticated, redirecting from ${location.pathname} to ${loginRoute}`
    )
    return (
      <Navigate
        to={loginRoute}
        state={{ from: location.pathname }}
        replace={true}
      />
    )
  }

  // Case 3: Route requires specific roles and user doesn't have them
  if (
    requireAuth &&
    allowedRoles.length > 0 &&
    userRole &&
    !allowedRoles.includes(userRole as UserRole)
  ) {
    // Redirect based on user's actual role
    let unauthorizedRedirect: string

    if (userRole === 'Admin') {
      // Admin trying to access customer page -> redirect to admin dashboard
      unauthorizedRedirect = ROUTES.HOME
    } else if (userRole === 'Customer') {
      // Customer trying to access admin page -> redirect to customer dashboard
      unauthorizedRedirect = ROUTES.MANAGE_PLATE
    } else {
      // Unknown role -> redirect to appropriate login
      unauthorizedRedirect = allowedRoles.includes('Admin')
        ? ROUTES.LOGIN
        : redirectIfUnauthorized
    }

    console.log(
      `User role "${userRole}" not authorized for ${location.pathname}, redirecting to ${unauthorizedRedirect}`
    )
    return (
      <Navigate
        to={unauthorizedRedirect}
        state={{ from: location.pathname }}
        replace={true}
      />
    )
  }

  // Case 4: All checks passed, render the content
  // Add animation for protected routes
  if (requireAuth) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {children}
      </motion.div>
    )
  }

  // Public routes without animation
  return <>{children}</>
}
