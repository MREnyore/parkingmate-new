/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ResponseMeta
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string
}

/**
 * Pagination metadata
 */
export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  hasMore?: boolean
}
