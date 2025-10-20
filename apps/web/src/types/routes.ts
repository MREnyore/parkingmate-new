// Route path constants for type safety
export const ROUTES = {
  HOME: '/dashboard',
  LOGIN: '/admin-login',
  CUSTOMER_LOGIN: '/customer-login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ACCOUNT: '/account',
  ALPR: '/alpr-erkennungen',
  MANAGE_PLATE: '/customer/manage-plates',
  CUSTOMER_REGISTRATION: '/customer-registration',
  SELF_SERVICE: '/self-service',
  PARKPLATZE: '/parkplatze',
  AUTORISIERTE_NUTZER: '/autorisierte-nutzer',
  CUSTOMERS: '/customers'
} as const

// Type for all valid route paths
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

// Route configuration type
export interface RouteConfig {
  path: RoutePath
  protected: boolean
  title: string
}

// Route configurations
export const ROUTE_CONFIGS: Record<RoutePath, RouteConfig> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    protected: true,
    title: 'Home - ParkingMate'
  },
  [ROUTES.ACCOUNT]: {
    path: ROUTES.ACCOUNT,
    protected: true,
    title: 'Account - ParkingMate'
  },
  [ROUTES.ALPR]: {
    path: ROUTES.ALPR,
    protected: true,
    title: 'ALPR-Erkennungen - ParkingMate'
  },
  [ROUTES.MANAGE_PLATE]: {
    path: ROUTES.MANAGE_PLATE,
    protected: true,
    title: 'Manage Plate - ParkingMate'
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    protected: false,
    title: 'Login - ParkingMate'
  },
  [ROUTES.CUSTOMER_LOGIN]: {
    path: ROUTES.CUSTOMER_LOGIN,
    protected: false,
    title: 'Customer Login - ParkingMate'
  },
  [ROUTES.REGISTER]: {
    path: ROUTES.REGISTER,
    protected: false,
    title: 'Register - ParkingMate'
  },
  [ROUTES.FORGOT_PASSWORD]: {
    path: ROUTES.FORGOT_PASSWORD,
    protected: false,
    title: 'Forgot Password - ParkingMate'
  },
  [ROUTES.CUSTOMER_REGISTRATION]: {
    path: ROUTES.CUSTOMER_REGISTRATION,
    protected: false,
    title: 'Customer Registration - ParkingMate'
  },
  [ROUTES.SELF_SERVICE]: {
    path: ROUTES.SELF_SERVICE,
    protected: false,
    title: 'Guest Parking - ParkingMate'
  },
  [ROUTES.PARKPLATZE]: {
    path: ROUTES.PARKPLATZE,
    protected: true,
    title: 'Parkplätze - ParkingMate'
  },
  [ROUTES.AUTORISIERTE_NUTZER]: {
    path: ROUTES.AUTORISIERTE_NUTZER,
    protected: true,
    title: 'Autorisierte Nutzer - ParkingMate'
  },
  [ROUTES.CUSTOMERS]: {
    path: ROUTES.CUSTOMERS,
    protected: true,
    title: 'Customers - ParkingMate'
  }
}
