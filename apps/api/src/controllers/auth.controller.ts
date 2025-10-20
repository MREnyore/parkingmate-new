import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { env } from '../config/env'
import { adminUserService } from '../services/admin-user.service'
import { customerService } from '../services/customer.service'
import { customerRefreshTokenService } from '../services/customer-refresh-token.service'
import { customerRegistrationTokenService } from '../services/customer-registration-token.service'
import { emailService } from '../services/email.service'
import { jwtService } from '../services/jwt.service'
import { otpCodeService } from '../services/otp-code.service'
import { passwordService } from '../services/password.service'
import { refreshTokenService } from '../services/refresh-token.service'
import { validationService } from '../services/validation.service'
import type {
  AdminLoginInput,
  AdminRegisterInput,
  CustomerRegisterInitiateInput,
  CustomerSigninInput,
  LogoutInput,
  RefreshTokenInput,
  ValidateAuthTokenInput,
  ValidateRegistrationTokenInput,
  VerifyOtpInput
} from '../types/auth.types'

/**
 * Admin login with email/password
 */
export async function adminLogin(
  request: FastifyRequest<{ Body: AdminLoginInput }>,
  reply: FastifyReply
) {
  const { email, password } = request.body

  try {
    // Find user by email
    const user = await adminUserService.findByEmail(email)
    if (!user || user.status !== 'active') {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      })
    }

    // Verify password
    const isValidPassword = await passwordService.verify(
      password,
      user.passwordHash
    )
    if (!isValidPassword) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      })
    }

    // Generate tokens
    const accessToken = jwtService.generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.orgId || undefined
    )

    // Create refresh token
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30) // 30 days

    const refreshTokenString = validationService.generateToken(64)
    await refreshTokenService.create({
      userId: user.id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiry,
      deviceInfo: request.headers['user-agent'],
      ipAddress: request.ip
    })

    return reply.send({
      success: true,
      data: {
        accessToken,
        refreshToken: refreshTokenString,
        expiresIn: 30 * 60, // 30 minutes in seconds
        tokenType: 'Bearer' as const,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login'
      }
    })
  }
}

/**
 * Admin registration
 */
export async function adminRegister(
  request: FastifyRequest<{ Body: AdminRegisterInput }>,
  reply: FastifyReply
) {
  const { email, password, firstName, lastName, phone, orgId } = request.body

  try {
    // Check if user already exists
    const existingUser = await adminUserService.findByEmail(email)
    if (existingUser) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      })
    }

    // Validate password strength
    const passwordValidation = passwordService.validate(password)
    if (!passwordValidation.valid) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password does not meet requirements',
          details: { errors: passwordValidation.errors }
        }
      })
    }

    // Hash password
    const passwordHash = await passwordService.hash(password)

    // Create user
    const user = await adminUserService.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      orgId,
      role: 'admin',
      status: 'active'
    })

    // Generate tokens
    const accessToken = jwtService.generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.orgId || undefined
    )

    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30)

    const refreshTokenString = validationService.generateToken(64)
    await refreshTokenService.create({
      userId: user.id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiry,
      deviceInfo: request.headers['user-agent'],
      ipAddress: request.ip
    })

    return reply.code(StatusCodes.CREATED).send({
      success: true,
      data: {
        accessToken,
        refreshToken: refreshTokenString,
        expiresIn: 30 * 60,
        tokenType: 'Bearer' as const,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration'
      }
    })
  }
}

/**
 * Validate registration token
 */
export async function validateRegistrationToken(
  request: FastifyRequest<{ Body: ValidateRegistrationTokenInput }>,
  reply: FastifyReply
) {
  const { token } = request.body

  try {
    const regToken = await customerRegistrationTokenService.findByToken(token)

    if (!regToken) {
      return reply.send({
        success: true,
        data: {
          valid: false,
          error: 'Invalid or expired registration token'
        }
      })
    }

    // Get customer details
    const customer = await customerService.findById(regToken.customerId)
    if (!customer) {
      return reply.send({
        success: true,
        data: {
          valid: false,
          error: 'Customer not found'
        }
      })
    }

    return reply.send({
      success: true,
      data: {
        valid: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          registered: customer.registered
        }
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred validating the token'
      }
    })
  }
}

/**
 * Customer registration (initiate - sends OTP)
 */
export async function registerCustomer(
  request: FastifyRequest<{ Body: CustomerRegisterInitiateInput }>,
  reply: FastifyReply
) {
  const { registrationToken } = request.body

  try {
    // Validate registration token
    const regToken =
      await customerRegistrationTokenService.findByToken(registrationToken)
    if (!regToken) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired registration token'
        }
      })
    }

    // Get customer
    const customer = await customerService.findById(regToken.customerId)
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      })
    }

    // Generate OTP code
    const otpCode = validationService.generateOtpCode(env.OTP_LENGTH)
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + env.OTP_EXPIRY_MINUTES)

    // Invalidate old OTP codes for this email
    await otpCodeService.invalidateForEmail(customer.email)

    // Create new OTP code with purpose 'registration'
    await otpCodeService.create({
      email: customer.email,
      code: otpCode,
      expiresAt: otpExpiry,
      used: false,
      purpose: 'registration'
    })

    // Send OTP email
    await emailService.sendOtpEmail(
      customer.email,
      customer.name || 'Customer',
      otpCode
    )

    return reply.send({
      success: true,
      data: {
        message: 'OTP code sent to your email',
        email: customer.email
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred sending OTP'
      }
    })
  }
}

/**
 * Customer signin (sends OTP)
 * Matches C# CustomerAuthenticate implementation
 */
export async function customerSignin(
  request: FastifyRequest<{ Body: CustomerSigninInput }>,
  reply: FastifyReply
) {
  const { email } = request.body

  try {
    // Find customer by email (use default org ID from env or first match)
    const customer = await customerService.findByEmail(
      email,
      env.DEFAULT_ORG_ID
    )
    request.log.info(`customer: ${customer}`)

    // Check if customer exists
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        customerExists: false,
        message: 'Customer not found. Please check your email address.'
      })
    }

    // Check if customer is registered
    if (!customer.registered) {
      return reply.code(StatusCodes.FORBIDDEN).send({
        success: false,
        customerExists: true,
        message:
          'Customer account not activated. Please complete registration first.'
      })
    }

    // Generate OTP code
    const otpCode = validationService.generateOtpCode(env.OTP_LENGTH)
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + env.OTP_EXPIRY_MINUTES)

    // Invalidate old OTP codes for this email
    await otpCodeService.invalidateForEmail(email)

    // Create new OTP code with purpose 'signin'
    await otpCodeService.create({
      email,
      code: otpCode,
      expiresAt: otpExpiry,
      used: false,
      purpose: 'signin'
    })

    // Send OTP email
    await emailService.sendOtpEmail(email, customer.name || 'Customer', otpCode)

    return reply.send({
      success: true,
      customerExists: true,
      message: 'OTP sent to your email. Please check your inbox.'
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      customerExists: false,
      message: 'Failed to send OTP email'
    })
  }
}

/**
 * Verify OTP and issue tokens
 * Matches C# VerifyOtp implementation
 */
export async function verifyOtp(
  request: FastifyRequest<{ Body: VerifyOtpInput }>,
  reply: FastifyReply
) {
  const { email, otpCode } = request.body

  try {
    // Find and validate OTP
    const otp = await otpCodeService.findByEmailAndCode(email, otpCode)
    if (!otp) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: 'Invalid or expired OTP code'
      })
    }

    // Find customer
    const customer = await customerService.findByEmail(
      email,
      env.DEFAULT_ORG_ID
    )
    if (!customer) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: 'Customer not found'
      })
    }

    // Mark OTP as used
    await otpCodeService.markAsUsed(otp.id)

    // If this is registration OTP and customer not registered, mark as registered
    if (otp.purpose === 'registration' && !customer.registered) {
      await customerService.markAsRegistered(customer.id)

      // Mark the registration token as used
      await customerRegistrationTokenService.markAsUsedByEmail(
        customer.email,
        customer.orgId
      )
    }

    // Generate JWT access token (30 minutes)
    const accessToken = jwtService.generateCustomerAccessToken(
      customer.id,
      customer.email,
      customer.orgId
    )

    // Generate refresh token (30 days)
    const refreshTokenString = validationService.generateToken(64)
    const accessTokenExpiry = new Date()
    accessTokenExpiry.setMinutes(accessTokenExpiry.getMinutes() + 30)
    const refreshTokenExpiry = new Date()
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30)

    // Store refresh token in database
    await customerRefreshTokenService.create({
      customerId: customer.id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiry,
      deviceInfo: request.headers['user-agent'] || null,
      ipAddress: request.ip || null,
      isRevoked: false
    })

    return reply.send({
      success: true,
      sessionId: customer.id, // Using customer ID as session ID
      accessToken,
      refreshToken: refreshTokenString,
      accessTokenExpiresAt: accessTokenExpiry.toISOString(),
      refreshTokenExpiresAt: refreshTokenExpiry.toISOString(),
      email: customer.email,
      name: customer.name,
      isRegisteredCustomer:
        customer.registered || otp.purpose === 'registration'
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'An error occurred verifying OTP'
    })
  }
}

/**
 * Refresh access token (Admin)
 */
export async function refreshToken(
  request: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply
) {
  const { refreshToken: token } = request.body

  try {
    // Find refresh token
    const refreshToken = await refreshTokenService.findByToken(token)
    if (!refreshToken) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        message: 'Invalid or expired refresh token'
      })
    }

    // Find user
    const user = await adminUserService.findById(refreshToken.userId)
    if (!user || user.status !== 'active') {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        message: 'User not found or inactive'
      })
    }

    // Generate new tokens
    const accessToken = jwtService.generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.orgId || undefined
    )

    const newRefreshTokenExpiry = new Date()
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 30)
    const accessTokenExpiry = new Date()
    accessTokenExpiry.setMinutes(accessTokenExpiry.getMinutes() + 30)

    const newRefreshTokenString = validationService.generateToken(64)

    // Revoke old token
    await refreshTokenService.revoke(token)

    // Create new refresh token
    await refreshTokenService.create({
      userId: user.id,
      token: newRefreshTokenString,
      expiresAt: newRefreshTokenExpiry,
      deviceInfo: request.headers['user-agent'],
      ipAddress: request.ip
    })

    return reply.send({
      success: true,
      accessToken,
      refreshToken: newRefreshTokenString,
      accessTokenExpiresAt: accessTokenExpiry.toISOString(),
      refreshTokenExpiresAt: newRefreshTokenExpiry.toISOString()
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'An error occurred refreshing token'
    })
  }
}

/**
 * Refresh customer access token
 * Matches C# RefreshToken implementation
 */
export async function customerRefreshToken(
  request: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply
) {
  const { refreshToken: token } = request.body

  try {
    // Find and validate refresh token
    const refreshToken = await customerRefreshTokenService.findByToken(token)
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        message: 'Invalid or expired refresh token'
      })
    }

    // Get customer
    const customer = await customerService.findById(refreshToken.customerId)
    if (!customer) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        message: 'Customer not found'
      })
    }

    // Generate new tokens
    const newAccessToken = jwtService.generateCustomerAccessToken(
      customer.id,
      customer.email,
      customer.orgId
    )

    const newRefreshTokenString = validationService.generateToken(64)
    const newRefreshTokenExpiry = new Date()
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 30)
    const newAccessTokenExpiry = new Date()
    newAccessTokenExpiry.setMinutes(newAccessTokenExpiry.getMinutes() + 30)

    // Revoke old refresh token
    await customerRefreshTokenService.revoke(refreshToken.id)

    // Store new refresh token
    await customerRefreshTokenService.create({
      customerId: customer.id,
      token: newRefreshTokenString,
      expiresAt: newRefreshTokenExpiry,
      deviceInfo: request.headers['user-agent'] || null,
      ipAddress: request.ip || null
    })

    return reply.send({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
      accessTokenExpiresAt: newAccessTokenExpiry.toISOString(),
      refreshTokenExpiresAt: newRefreshTokenExpiry.toISOString()
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'An error occurred refreshing token'
    })
  }
}

/**
 * Logout (revoke refresh token)
 */
export async function logout(
  request: FastifyRequest<{ Body: LogoutInput }>,
  reply: FastifyReply
) {
  const { refreshToken } = request.body

  try {
    if (refreshToken) {
      await refreshTokenService.revoke(refreshToken)
    }

    return reply.send({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during logout'
      }
    })
  }
}

/**
 * Customer logout
 */
export async function customerLogout(
  request: FastifyRequest<{ Body: LogoutInput }>,
  reply: FastifyReply
) {
  const { refreshToken } = request.body

  try {
    // Revoke refresh token if provided
    if (refreshToken) {
      await customerRefreshTokenService.revokeByToken(refreshToken)
    }

    return reply.send({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'An error occurred during logout'
    })
  }
}

/**
 * Get current user (from JWT)
 */
export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header'
        }
      })
    }

    const token = authHeader.substring(7)
    const payload = jwtService.verify(token)

    if (jwtService.isAdmin(payload)) {
      const user = await adminUserService.findById(payload.userId)
      if (!user) {
        return reply.code(StatusCodes.NOT_FOUND).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        })
      }

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      })
    } else if (jwtService.isCustomer(payload)) {
      const customer = await customerService.findById(payload.customerId)
      if (!customer) {
        return reply.code(StatusCodes.NOT_FOUND).send({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found'
          }
        })
      }

      return reply.send({
        success: true,
        data: {
          customer: {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            registered: customer.registered
          }
        }
      })
    }

    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token payload'
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.UNAUTHORIZED).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    })
  }
}

/**
 * Validate auth token (without expiry check)
 */
export async function validateAuthToken(
  request: FastifyRequest<{ Body: ValidateAuthTokenInput }>,
  reply: FastifyReply
) {
  const { token } = request.body

  try {
    const payload = jwtService.verifyWithoutExpiry(token)

    return reply.send({
      success: true,
      data: {
        valid: true,
        expired: false,
        payload: {
          userId: jwtService.isAdmin(payload) ? payload.userId : undefined,
          customerId: jwtService.isCustomer(payload)
            ? payload.customerId
            : undefined,
          email: payload.email,
          role: jwtService.isAdmin(payload) ? payload.role : undefined,
          type: payload.type
        }
      }
    })
  } catch (_error) {
    // Try to decode to check if expired
    const decoded = jwtService.decode(token)
    if (decoded) {
      return reply.send({
        success: true,
        data: {
          valid: false,
          expired: true,
          payload: {
            userId: 'userId' in decoded ? decoded.userId : undefined,
            customerId:
              'customerId' in decoded ? decoded.customerId : undefined,
            email: decoded.email,
            role: 'role' in decoded ? decoded.role : undefined,
            type: decoded.type
          }
        }
      })
    }

    return reply.send({
      success: true,
      data: {
        valid: false,
        expired: false
      }
    })
  }
}
