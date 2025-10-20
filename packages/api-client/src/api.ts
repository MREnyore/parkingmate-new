/**
 * Type-safe API methods using OpenAPI generated types
 */

import { ApiClient } from './client'
import type { components, paths } from './generated/api'

/**
 * Type helper to extract request body type
 */
type RequestBody<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  requestBody: { content: { 'application/json': infer Body } }
}
  ? Body
  : never

/**
 * Type helper to extract response body type from OpenAPI spec
 * This extracts the full response structure (e.g., { success: true, data: T })
 */
type ResponseBody<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  responses: { 200: { content: { 'application/json': infer Body } } }
}
  ? Body
  : paths[Path][Method] extends {
        responses: { 201: { content: { 'application/json': infer Body } } }
      }
    ? Body
    : unknown

/**
 * Type helper to extract the data property from OpenAPI response
 * Handles responses that use allOf to combine SuccessResponse with data
 *
 * For responses like { success: boolean } & { data: User }, this extracts just User
 * For responses without data property, returns the full response
 */
type ExtractData<T> = T extends { data?: infer D }
  ? NonNullable<D> // Extract and remove undefined from the data type
  : T

/**
 * Type-safe API wrapper with OpenAPI types
 */
export class ParkingMateApi extends ApiClient {
  // ============================================================================
  // Auth Endpoints
  // ============================================================================

  async login(credentials: RequestBody<'/auth/login', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/auth/login', 'post'>>>(
      '/auth/login',
      credentials
    )
  }

  async register(data: RequestBody<'/auth/register', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/auth/register', 'post'>>>(
      '/auth/register',
      data
    )
  }

  async logout(data?: { refreshToken?: string }) {
    return this.post<ResponseBody<'/auth/logout', 'post'>>('/auth/logout', data)
  }

  async getMe() {
    return this.get<ExtractData<ResponseBody<'/auth/me', 'get'>>>('/auth/me')
  }

  async registerCustomer(data: RequestBody<'/auth/register-customer', 'post'>) {
    return this.post<
      ExtractData<ResponseBody<'/auth/register-customer', 'post'>>
    >('/auth/register-customer', data)
  }

  async customerSignin(data: RequestBody<'/auth/customer/signin', 'post'>) {
    return this.post<ResponseBody<'/auth/customer/signin', 'post'>>(
      '/auth/customer/signin',
      data
    )
  }

  async verifyOtp(data: RequestBody<'/auth/verify-otp', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/auth/verify-otp', 'post'>>>(
      '/auth/verify-otp',
      data
    )
  }

  async refreshToken(data: RequestBody<'/auth/refresh-token', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/auth/refresh-token', 'post'>>>(
      '/auth/refresh-token',
      data
    )
  }

  async customerLogout(data?: { refreshToken?: string }) {
    return this.post<ResponseBody<'/auth/customer/logout', 'post'>>(
      '/auth/customer/logout',
      data
    )
  }

  // ============================================================================
  // Customer Endpoints
  // ============================================================================

  async getCustomer() {
    return this.get<ExtractData<ResponseBody<'/customer/info', 'get'>>>(
      '/customer/info'
    )
  }

  async updateCustomerInfo(data: RequestBody<'/customer/info', 'put'>) {
    return this.put<ExtractData<ResponseBody<'/customer/info', 'put'>>>(
      '/customer/info',
      data
    )
  }

  async addCar(data: RequestBody<'/customer/cars', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/customer/cars', 'post'>>>(
      '/customer/cars',
      data
    )
  }

  async updateCar(
    carId: string,
    data: RequestBody<'/customer/cars/{carId}', 'put'>
  ) {
    return this.put<ResponseBody<'/customer/cars/{carId}', 'put'>>(
      `/customer/cars/${carId}`,
      data
    )
  }

  async deleteCar(carId: string) {
    return this.delete(`/customer/cars/${carId}`)
  }

  // ============================================================================
  // Admin Profile Endpoints
  // ============================================================================

  async getAdminProfile() {
    return this.get<ExtractData<ResponseBody<'/admin/profile', 'get'>>>(
      '/admin/profile'
    )
  }

  async updateAdminProfile(data: RequestBody<'/admin/profile', 'put'>) {
    return this.put<ResponseBody<'/admin/profile', 'put'>>(
      '/admin/profile',
      data
    )
  }

  async changeAdminPassword(
    data: RequestBody<'/admin/profile/change-password', 'post'>
  ) {
    return this.post<ResponseBody<'/admin/profile/change-password', 'post'>>(
      '/admin/profile/change-password',
      data
    )
  }

  // ============================================================================
  // Admin Customer Management Endpoints
  // ============================================================================

  async getAllCustomers() {
    return this.get<ExtractData<ResponseBody<'/admin/customers', 'get'>>>(
      '/admin/customers'
    )
  }

  async getCustomerById(id: string) {
    return this.get<ExtractData<ResponseBody<'/admin/customers/{id}', 'get'>>>(
      `/admin/customers/${id}`
    )
  }

  async createCustomer(data: RequestBody<'/admin/customers', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/admin/customers', 'post'>>>(
      '/admin/customers',
      data
    )
  }

  async updateCustomer(
    id: string,
    data: RequestBody<'/admin/customers/{id}', 'put'>
  ) {
    return this.put<ExtractData<ResponseBody<'/admin/customers/{id}', 'put'>>>(
      `/admin/customers/${id}`,
      data
    )
  }

  async deleteCustomer(id: string) {
    return this.delete<ResponseBody<'/admin/customers/{id}', 'delete'>>(
      `/admin/customers/${id}`
    )
  }

  // ============================================================================
  // Parking Lot Endpoints
  // ============================================================================

  async listParkingLots(params?: {
    page?: number
    limit?: number
    city?: string
    isActive?: boolean
  }) {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : ''
    return this.get<ExtractData<ResponseBody<'/parking-lots', 'get'>>>(
      `/parking-lots${queryString}`
    )
  }

  async getParkingLot(id: string) {
    return this.get<ExtractData<ResponseBody<'/parking-lots/{id}', 'get'>>>(
      `/parking-lots/${id}`
    )
  }

  async createParkingLot(data: RequestBody<'/parking-lots', 'post'>) {
    return this.post<ExtractData<ResponseBody<'/parking-lots', 'post'>>>(
      '/parking-lots',
      data
    )
  }

  async updateParkingLot(
    id: string,
    data: RequestBody<'/parking-lots/{id}', 'patch'>
  ) {
    return this.patch<ResponseBody<'/parking-lots/{id}', 'patch'>>(
      `/parking-lots/${id}`,
      data
    )
  }

  async deleteParkingLot(id: string) {
    return this.delete(`/parking-lots/${id}`)
  }

  // ============================================================================
  // Guest Endpoints
  // ============================================================================

  async validateGuestPlate(data: RequestBody<'/guest/validate-plate', 'post'>) {
    return this.post<ResponseBody<'/guest/validate-plate', 'post'>>(
      '/guest/validate-plate',
      data
    )
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  async healthCheck() {
    return this.get<ExtractData<ResponseBody<'/health', 'get'>>>('/health')
  }
}

/**
 * Create type-safe ParkingMate API client
 */
export const createParkingMateApi = (config: {
  baseUrl: string
  headers?: Record<string, string>
}) => {
  return new ParkingMateApi(config)
}

// Export component types for convenience
export type { components }
