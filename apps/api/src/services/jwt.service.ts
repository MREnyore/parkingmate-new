import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  userId: string
  email: string
  role: string
  orgId?: string
  type: 'access' | 'refresh'
}

export interface CustomerJwtPayload {
  customerId: string
  email: string
  role: string
  orgId: string
  type: 'access' | 'refresh'
}

/**
 * JWT service for generating and verifying tokens
 */
export const jwtService = {
  /**
   * Generate access token for admin user
   */
  generateAccessToken(
    userId: string,
    email: string,
    role: string,
    orgId?: string
  ): string {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

    const payload: JwtPayload = {
      userId,
      email,
      role,
      orgId,
      type: 'access'
    }

    // TODO: fix
    // @ts-ignore
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE
    })
  },

  /**
   * Generate access token for customer
   */
  generateCustomerAccessToken(
    customerId: string,
    email: string,
    orgId: string
  ): string {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

    const payload: CustomerJwtPayload = {
      customerId,
      email,
      role: 'Customer',
      orgId,
      type: 'access'
    }

    // TODO: fix
    // @ts-ignore
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: (env.JWT_ACCESS_TOKEN_EXPIRY as string) ?? '1h',
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE
    })
  },

  /**
   * Verify and decode JWT token
   */
  verify(token: string): JwtPayload | CustomerJwtPayload {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE
      }) as JwtPayload | CustomerJwtPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      }
      throw error
    }
  },

  /**
   * Verify token without checking expiry (for validation endpoint)
   */
  verifyWithoutExpiry(token: string): JwtPayload | CustomerJwtPayload {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        ignoreExpiration: true
      }) as JwtPayload | CustomerJwtPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      }
      throw error
    }
  },

  /**
   * Decode token without verification (for inspection)
   */
  decode(token: string): JwtPayload | CustomerJwtPayload | null {
    return jwt.decode(token) as JwtPayload | CustomerJwtPayload | null
  },

  /**
   * Check if user is admin
   */
  isAdmin(payload: JwtPayload | CustomerJwtPayload): payload is JwtPayload {
    return 'userId' in payload && 'role' in payload
  },

  /**
   * Check if user is customer
   */
  isCustomer(
    payload: JwtPayload | CustomerJwtPayload
  ): payload is CustomerJwtPayload {
    return 'customerId' in payload
  }
}
