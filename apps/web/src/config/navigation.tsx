import {
  LayoutDashboard,
  type LucideIcon,
  ParkingSquare,
  ScanLine,
  Settings,
  UserCog,
  Users
} from 'lucide-react'
import i18n from '@/lib/i18n'
import { ROUTES, type RoutePath } from '@/types/routes'

export interface NavigationItem {
  id: string
  label: string
  path: RoutePath
  icon: LucideIcon
  tooltip: string
}

export const getNavigationItems = (): NavigationItem[] => [
  {
    id: 'dashboard',
    label: i18n.t('dashboard'),
    path: ROUTES.HOME,
    icon: LayoutDashboard,
    tooltip: i18n.t('dashboard')
  },
  {
    id: 'alpr',
    label: i18n.t('alpr_erkennungen'),
    path: ROUTES.ALPR,
    icon: ScanLine,
    tooltip: i18n.t('alpr_erkennungen_title')
  },
  {
    id: 'autorisierte-nutzer',
    label: i18n.t('autorisierte_nutzer'),
    path: ROUTES.AUTORISIERTE_NUTZER,
    icon: Users,
    tooltip: i18n.t('autorisierte_nutzer')
  },
  {
    id: 'customers',
    label: i18n.t('customers'),
    path: ROUTES.CUSTOMERS,
    icon: UserCog,
    tooltip: i18n.t('customers_description')
  },
  {
    id: 'parkplatze',
    label: i18n.t('parkplatze'),
    path: ROUTES.PARKPLATZE,
    icon: ParkingSquare,
    tooltip: i18n.t('parkplatze')
  },
  {
    id: 'account',
    label: i18n.t('account').toUpperCase(),
    path: ROUTES.ACCOUNT,
    icon: Settings,
    tooltip: i18n.t('account_settings')
  }
]

// This will be called dynamically to get fresh translations
export const NAVIGATION_ITEMS = getNavigationItems()

export const getNavigationItem = (id: string): NavigationItem | undefined => {
  return getNavigationItems().find((item) => item.id === id)
}

export const getNavigationItemByPath = (
  path: string
): NavigationItem | undefined => {
  return getNavigationItems().find((item) => item.path === path)
}
