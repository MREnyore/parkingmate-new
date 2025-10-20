/**
 * Guest-related API types
 */

import type { RequestBody } from './common'

// ============================================================================
// Guest Endpoints
// ============================================================================

export type ValidateGuestPlateRequest = RequestBody<
  '/guest/validate-plate',
  'post'
>
