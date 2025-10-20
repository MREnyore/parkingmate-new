import type { ApiResponse } from './types'

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string
  headers?: Record<string, string>
  timeout?: number
}

/**
 * API Client Options for requests
 */
export interface RequestOptions {
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * Type-safe API Client for ParkingMate
 * Uses generated types from OpenAPI specification
 */
export class ApiClient {
  private baseUrl: string
  private headers: Record<string, string>
  private timeout: number

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }
    this.timeout = config.timeout || 30000
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.headers.Authorization = `Bearer ${token}`
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    delete this.headers.Authorization
  }

  /**
   * Generic GET request
   */
  async get<T>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options)
  }

  /**
   * Generic POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options)
  }

  /**
   * Generic PUT request
   */
  async put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options)
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, options)
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options)
  }

  /**
   * Core request method
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      // Only include Content-Type header if there's a body
      const headers = { ...this.headers, ...options?.headers }
      if (!body) {
        delete headers['Content-Type']
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal || controller.signal
      })

      clearTimeout(timeoutId)

      const data = response.status === 204 ? null : await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`
          }
        }
      }

      // If the response already has a success field, return it as-is
      // This prevents double-wrapping API responses
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>
      }

      return {
        success: true,
        data: data?.data || data,
        meta: data?.meta
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId)

      // Type guard for AbortError
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'AbortError'
      ) {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timeout'
          }
        }
      }

      // Type guard for Error objects with message
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Network error occurred'

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message
        }
      }
    }
  }
}

/**
 * Create API client instance
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config)
}
