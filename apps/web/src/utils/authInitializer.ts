/**
 * Auth Initializer
 *
 * Restores authentication token from sessionStorage to the API client on app startup.
 * This ensures that after a page refresh, the API client has the auth token available
 * for authenticated requests.
 */

import { setAuthToken } from '@/lib/api-client'
import { useSessionStore } from '@/stores/sessionStore'

/**
 * Initialize authentication by restoring token from sessionStorage to apiClient
 * This runs synchronously on module import to ensure auth is set up before any API calls
 */
const initializeAuth = () => {
  // Get token from sessionStorage (Zustand will have already hydrated the store)
  const accessToken = useSessionStore.getState().accessToken

  if (accessToken) {
    console.log('Restoring authentication token to API client')
    setAuthToken(accessToken)
  }
}

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  initializeAuth()
}

export { initializeAuth }
