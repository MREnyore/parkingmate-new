/**
 * Car-related API types
 */

import type { components } from '@parkingmate/api-client'
import type { RequestBody, ResponseBody } from './common'

// ============================================================================
// Schema Types
// ============================================================================

export type Car = components['schemas']['Car']

// ============================================================================
// Car Endpoints
// ============================================================================

export type AddCarRequest = RequestBody<'/customer/cars', 'post'>
export type AddCarResponse = ResponseBody<'/customer/cars', 'post', 201>
export type UpdateCarRequest = RequestBody<'/customer/cars/{carId}', 'put'>
