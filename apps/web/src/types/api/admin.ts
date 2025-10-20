/**
 * Admin-related API types
 */

import type { RequestBody, ResponseBody } from './common'

// ============================================================================
// Admin Profile Endpoints
// ============================================================================

export type GetAdminProfileResponse = ResponseBody<'/admin/profile', 'get'>
export type UpdateAdminProfileRequest = RequestBody<'/admin/profile', 'put'>
export type ChangeAdminPasswordRequest = RequestBody<
  '/admin/profile/change-password',
  'post'
>

// ============================================================================
// Admin Customer Management Endpoints
// ============================================================================

export type GetAllCustomersResponse = ResponseBody<'/admin/customers', 'get'>
export type GetCustomerByIdResponse = ResponseBody<
  '/admin/customers/{id}',
  'get'
>
export type CreateCustomerRequest = RequestBody<'/admin/customers', 'post'>
export type CreateCustomerResponse = ResponseBody<'/admin/customers', 'post'>
export type UpdateCustomerRequest = RequestBody<'/admin/customers/{id}', 'put'>
export type UpdateCustomerResponse = ResponseBody<
  '/admin/customers/{id}',
  'put'
>
export type DeleteCustomerResponse = ResponseBody<
  '/admin/customers/{id}',
  'delete'
>

// Customer with cars type
export interface CustomerWithCars {
  id: string
  orgId: string
  name: string
  email: string
  phoneNumber?: string | null
  registered: boolean
  status: 'active' | 'inactive'
  membershipStatus: 'active' | 'expired' | 'cancelled'
  membershipExpiryDate?: string | null
  address?: string | null
  postalCode?: string | null
  city?: string | null
  cars: Array<{
    id: string
    orgId: string
    licensePlate: string
    label?: string | null
    brand?: string | null
    model?: string | null
    createdAt: string
    updatedAt: string
  }>
  createdAt: string
  updatedAt: string
}
