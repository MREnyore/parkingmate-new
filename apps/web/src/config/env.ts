const IS_DEV = import.meta.env.DEV
const IS_PROD = import.meta.env.PROD
const MODE = import.meta.env.MODE

function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv

  // Use relative paths in both dev and production
  // In dev: Vite proxy forwards requests to ServiceStack backend
  // In production: Frontend served from wwwroot by ServiceStack
  return ''
}

const API_BASE_URL = getApiBaseUrl()

export { API_BASE_URL, IS_DEV, IS_PROD, MODE }
