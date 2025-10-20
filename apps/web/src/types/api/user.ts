/**
 * User and Customer-related API types
 */

import type { components } from '@parkingmate/api-client'
import type { RequestBody, ResponseBody } from './common'

// ============================================================================
// Schema Types
// ============================================================================

export type User = components['schemas']['User']
export type Customer = components['schemas']['Customer']

// ============================================================================
// Customer Endpoints
// ============================================================================

export type GetCustomerInfoResponse = ResponseBody<'/customer/info', 'get'>
export type UpdateCustomerInfoRequest = RequestBody<'/customer/info', 'put'>
