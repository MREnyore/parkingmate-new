import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { MultipartFile } from '@fastify/multipart'
import { env } from '../config/env'

/**
 * File upload service for handling profile pictures
 */
export const fileUploadService = {
  /**
   * Validate file type
   */
  validateFileType(mimetype: string): boolean {
    const allowedTypes = env.UPLOAD_ALLOWED_TYPES.split(',')
    return allowedTypes.includes(mimetype)
  },

  /**
   * Validate file size
   */
  validateFileSize(size: number): boolean {
    const maxSizeBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
    return size <= maxSizeBytes
  },

  /**
   * Generate unique filename
   */
  generateFilename(originalFilename: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalFilename.split('.').pop()
    return `${timestamp}-${randomString}.${extension}`
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    file: MultipartFile,
    userId: string
  ): Promise<string> {
    // Validate file type
    if (!this.validateFileType(file.mimetype)) {
      throw new Error(
        `Invalid file type. Allowed types: ${env.UPLOAD_ALLOWED_TYPES}`
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), env.UPLOAD_STORAGE_PATH)
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Generate filename
    const filename = this.generateFilename(file.filename)
    const filepath = join(uploadDir, filename)

    // Save file
    await pipeline(file.file, createWriteStream(filepath))

    // Return relative URL
    return `/uploads/profiles/${filename}`
  },

  /**
   * Delete file
   */
  deleteFile(filename: string): void {
    try {
      const filepath = join(process.cwd(), env.UPLOAD_STORAGE_PATH, filename)
      if (existsSync(filepath)) {
        unlinkSync(filepath)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      // Don't throw - file deletion is not critical
    }
  },

  /**
   * Extract filename from URL
   */
  extractFilename(url: string): string | null {
    const match = url.match(/\/uploads\/profiles\/(.+)$/)
    return match ? match[1] : null
  }
}
