import type { UserRole } from './jwt'

export interface UserData {
  isAuthenticated: boolean
  userRole: UserRole
  userName: string
  userEmail: string
}

// Get user data from localStorage
export const getUserData = (): UserData => {
  return {
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    userRole: (localStorage.getItem('userRole') as UserRole) ?? 'Customer',
    userName: localStorage.getItem('userName') ?? 'User',
    userEmail: localStorage.getItem('userEmail') ?? ''
  }
}

// Clear user data from localStorage
export const clearUserData = (): void => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
}
