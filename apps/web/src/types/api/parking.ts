/**
 * Parking lot-related API types
 */

import type { components } from '@parkingmate/api-client'
import type { RequestBody, ResponseBody } from './common'

// ============================================================================
// Schema Types
// ============================================================================

export type ParkingLot = components['schemas']['ParkingLot']
export type CreateParkingLotRequest =
  components['schemas']['CreateParkingLotRequest']

// ============================================================================
// Parking Lot Endpoints
// ============================================================================

export type ListParkingLotsResponse = ResponseBody<'/parking-lots', 'get'>
export type GetParkingLotResponse = ResponseBody<'/parking-lots/{id}', 'get'>
export type CreateParkingLotResponse = ResponseBody<
  '/parking-lots',
  'post',
  201
>
export type UpdateParkingLotRequest = RequestBody<'/parking-lots/{id}', 'patch'>
export type UpdateParkingLotResponse = ResponseBody<
  '/parking-lots/{id}',
  'patch'
>
