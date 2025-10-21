import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { adminUserService } from '../services/admin-user.service.js'
import { fileUploadService } from '../services/file-upload.service.js'
import { passwordService } from '../services/password.service.js'
import type {
  ChangePasswordInput,
  UpdateAdminProfileInput
} from '../types/admin-user.types.js'

/**
 * Get admin profile
 */
export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { userId } = request.user

    const user = await adminUserService.findById(userId)
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
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profilePictureUrl: user.profilePictureUrl,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred retrieving profile'
      }
    })
  }
}

/**
 * Update admin profile
 */
export async function updateProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { userId } = request.user
    const updateData = request.body as UpdateAdminProfileInput

    const updated = await adminUserService.update(userId, updateData)
    if (!updated) {
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
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        updatedAt: updated.updatedAt.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred updating profile'
      }
    })
  }
}

/**
 * Change password
 */
export async function changePassword(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { userId } = request.user
    const { currentPassword, newPassword } = request.body as ChangePasswordInput

    // Get user
    const user = await adminUserService.findById(userId)
    if (!user) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      })
    }

    // Verify current password
    const isValid = await passwordService.verify(
      currentPassword,
      user.passwordHash
    )
    if (!isValid) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      })
    }

    // Validate new password
    const validation = passwordService.validate(newPassword)
    if (!validation.valid) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'New password does not meet requirements',
          details: { errors: validation.errors }
        }
      })
    }

    // Hash new password
    const newPasswordHash = await passwordService.hash(newPassword)

    // Update password
    await adminUserService.updatePassword(userId, newPasswordHash)

    return reply.send({
      success: true,
      data: {
        message: 'Password changed successfully'
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred changing password'
      }
    })
  }
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { userId } = request.user

    // Get file from multipart request
    const data = await request.file()
    if (!data) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      })
    }

    // Validate file type
    if (!fileUploadService.validateFileType(data.mimetype)) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `Invalid file type. Allowed types: ${process.env.UPLOAD_ALLOWED_TYPES ?? 'image/png,image/jpeg,image/jpg'}`
        }
      })
    }

    // Get user to check for existing profile picture
    const user = await adminUserService.findById(userId)
    if (!user) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      })
    }

    // Delete old profile picture if exists
    if (user.profilePictureUrl) {
      const oldFilename = fileUploadService.extractFilename(
        user.profilePictureUrl
      )
      if (oldFilename) {
        fileUploadService.deleteFile(oldFilename)
      }
    }

    // Upload new file
    const profilePictureUrl = await fileUploadService.uploadProfilePicture(
      data,
      userId
    )

    // Update user
    await adminUserService.updateProfilePicture(userId, profilePictureUrl)

    return reply.send({
      success: true,
      data: {
        profilePictureUrl
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred uploading profile picture'
      }
    })
  }
}

/**
 * Remove profile picture
 */
export async function removeProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    const { userId } = request.user

    // Get user
    const user = await adminUserService.findById(userId)
    if (!user) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      })
    }

    if (!user.profilePictureUrl) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'NO_PROFILE_PICTURE',
          message: 'No profile picture to remove'
        }
      })
    }

    // Delete file
    const filename = fileUploadService.extractFilename(user.profilePictureUrl)
    if (filename) {
      fileUploadService.deleteFile(filename)
    }

    // Update user
    await adminUserService.updateProfilePicture(userId, null)

    return reply.code(StatusCodes.NO_CONTENT).send()
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred removing profile picture'
      }
    })
  }
}
