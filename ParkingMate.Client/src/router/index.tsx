import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RouteGuard } from '@/components/RouteGuard'
import { AccountPage } from '@/pages/admin/AccountPage'
import { ALPRPage } from '@/pages/admin/ALPRPage'
import { ForgotPasswordPage } from '@/pages/admin/ForgotPasswordPage'
import { HomePage } from '@/pages/admin/HomePage'
import { LoginPage } from '@/pages/admin/LoginPage'
import { CustomerLoginPage } from '@/pages/customer/login/CustomerLoginPage'
import { ManagePlatesPage } from '@/pages/customer/manage-plates/ManagePlatesPage'
import { CustomerRegistrationPage } from '@/pages/customer/registration/CustomerRegistrationPage'
import { SelfServicePage } from '@/pages/self-service/SelfServicePage'
import { ROUTES } from '@/types/routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RouteGuard redirectIfAuth={ROUTES.MANAGE_PLATE}>
        <Navigate to={ROUTES.CUSTOMER_LOGIN} replace={true} />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <RouteGuard redirectIfAuth={ROUTES.HOME}>
        <LoginPage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.CUSTOMER_LOGIN,
    element: (
      <RouteGuard redirectIfAuth={ROUTES.MANAGE_PLATE}>
        <CustomerLoginPage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <RouteGuard>
        <ForgotPasswordPage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.CUSTOMER_REGISTRATION,
    element: (
      <RouteGuard redirectIfAuth={ROUTES.MANAGE_PLATE}>
        <CustomerRegistrationPage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.SELF_SERVICE,
    element: (
      <RouteGuard>
        <SelfServicePage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.HOME,
    element: (
      <RouteGuard requireAuth={true} allowedRoles={['Admin']}>
        <HomePage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.ACCOUNT,
    element: (
      <RouteGuard requireAuth={true} allowedRoles={['Admin']}>
        <AccountPage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.ALPR,
    element: (
      <RouteGuard requireAuth={true} allowedRoles={['Admin']}>
        <ALPRPage />
      </RouteGuard>
    )
  },
  {
    path: ROUTES.MANAGE_PLATE,
    element: (
      <RouteGuard requireAuth={true} allowedRoles={['Customer']}>
        <ManagePlatesPage />
      </RouteGuard>
    )
  },
  {
    path: '*',
    element: <div>404 - Page Not Found</div>
  }
])
