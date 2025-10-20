/**
 * Authentication-related API types
 */

import type { components } from '@parkingmate/api-client'
import type { RequestBody, ResponseBody } from './common'

// ============================================================================
// Schema Types
// ============================================================================

export type LoginRequest = components['schemas']['LoginRequest']
export type RegisterRequest = components['schemas']['RegisterRequest']
export type AuthTokens = components['schemas']['AuthTokens']

// ============================================================================
// Admin Auth Endpoints
// ============================================================================

export type AdminLoginRequest = RequestBody<'/auth/login', 'post'>
export type AdminLoginResponse = ResponseBody<'/auth/login', 'post'>
export type AdminRegisterRequest = RequestBody<'/auth/register', 'post'>
export type AdminRegisterResponse = ResponseBody<'/auth/register', 'post', 201>
export type GetCurrentUserResponse = ResponseBody<'/auth/me', 'get'>

// ============================================================================
// Customer Auth Endpoints
// ============================================================================

export type RegisterCustomerRequest = RequestBody<
  '/auth/register-customer',
  'post'
>
export type CustomerSigninRequest = RequestBody<'/auth/customer/signin', 'post'>
export type VerifyOtpRequest = RequestBody<'/auth/verify-otp', 'post'>
export type VerifyOtpResponse = ResponseBody<'/auth/verify-otp', 'post'>

// ============================================================================
// Token Management
// ============================================================================

export type RefreshTokenRequest = RequestBody<'/auth/refresh-token', 'post'>
export type RefreshTokenResponse = ResponseBody<'/auth/refresh-token', 'post'>
export type ValidateRegistrationTokenRequest = RequestBody<
  '/auth/validate-registration-token',
  'post'
>
export type ValidateRegistrationTokenResponse = ResponseBody<
  '/auth/validate-registration-token',
  'post'
>
