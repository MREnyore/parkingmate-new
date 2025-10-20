import { z } from 'zod'

/**
 * Reusable Zod validation schemas and utilities
 *
 * Best Practices:
 * 1. Always use .trim() for string fields to remove whitespace
 * 2. Provide clear, user-friendly error messages
 * 3. Use regex for specific format validation (phone, postal code, etc.)
 * 4. Set reasonable min/max lengths for all fields
 * 5. Use .refine() for complex validation logic
 */

// ============================================================================
// Common Regex Patterns
// ============================================================================

/**
 * Matches names with letters (including German umlauts), spaces, hyphens, and apostrophes
 * Examples: "Max", "Anna-Maria", "O'Connor", "Müller"
 */
export const NAME_REGEX = /^[a-zA-ZäöüÄÖÜß\s'-]+$/

/**
 * Matches phone numbers with digits, spaces, and common separators
 * Examples: "+49 123 456789", "0123-456789", "(030) 12345"
 */
export const PHONE_REGEX = /^[\d\s\-+()]+$/

/**
 * Matches German postal codes (exactly 5 digits)
 * Examples: "12345", "80331"
 */
export const POSTAL_CODE_REGEX = /^\d{5}$/

// ============================================================================
// Reusable Field Schemas
// ============================================================================

/**
 * Name field (first name, last name, full name)
 * - Min 2 characters, max 100 characters
 * - Only letters, spaces, hyphens, apostrophes
 * - Supports German umlauts (ä, ö, ü, ß)
 * - Rejects whitespace-only input
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .refine((val) => val.trim().length > 0, {
    message: 'Name cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .regex(
        NAME_REGEX,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      )
  )

/**
 * Short name field (car name, label, etc.)
 * - Min 2 characters, max 50 characters
 * - Rejects whitespace-only input
 */
export const shortNameSchema = z
  .string()
  .min(1, 'This field is required')
  .refine((val) => val.trim().length > 0, {
    message: 'This field cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(2, 'Must be at least 2 characters')
      .max(50, 'Must not exceed 50 characters')
  )

/**
 * Email field
 * - Standard email validation
 * - Trimmed whitespace
 * - Rejects whitespace-only input
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .refine((val) => val.trim().length > 0, {
    message: 'Email cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(z.string().email('Invalid email address'))

/**
 * Phone number field (required)
 * - Min 7 characters, max 20 characters
 * - Allows digits, spaces, +, -, (), and parentheses
 * - Rejects whitespace-only input
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine((val) => val.trim().length > 0, {
    message: 'Phone number cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .regex(
        PHONE_REGEX,
        'Phone number can only contain digits, spaces, and +()-'
      )
      .min(7, 'Phone number must be at least 7 characters')
      .max(20, 'Phone number must not exceed 20 characters')
  )

/**
 * Optional phone number field (numbers only)
 * - Optional field
 * - If provided, must only contain digits
 * - Whitespace-only input is rejected
 */
export const optionalPhoneSchema = z
  .string()
  .optional()
  .superRefine((val, ctx) => {
    // If empty or undefined, it's valid (optional field)
    if (!val) return

    // Check for whitespace-only
    const trimmed = val.trim()
    if (trimmed.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number cannot be only whitespace'
      })
      return
    }

    // Check if it contains valid phone characters
    if (!/^[\d+\-() ]+$/.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number can only contain numbers, +, -, (), and spaces'
      })
    }
  })

/**
 * Optional postal code field
 * - Optional field
 * - If provided, must only contain numbers
 * - Whitespace-only input is rejected
 */
export const optionalPostalCodeSchema = z
  .string()
  .optional()
  .superRefine((val, ctx) => {
    // If empty or undefined, it's valid (optional field)
    if (!val) return

    // Check for whitespace-only
    const trimmed = val.trim()
    if (trimmed.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Postal code cannot be only whitespace'
      })
      return
    }

    // Check if it contains only numbers
    if (!/^\d+$/.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Postal code can only contain numbers'
      })
    }
  })
/**
 * German postal code field
 * - Exactly 5 digits
 * - Rejects whitespace-only input
 */
export const postalCodeSchema = z
  .string()
  .min(1, 'Postal code is required')
  .refine((val) => val.trim().length > 0, {
    message: 'Postal code cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z.string().regex(POSTAL_CODE_REGEX, 'Postal code must be exactly 5 digits')
  )

/**
 * City field
 * - Min 2 characters, max 100 characters
 * - Only letters, spaces, hyphens, apostrophes
 * - Rejects whitespace-only input
 */
export const citySchema = z
  .string()
  .min(1, 'City is required')
  .refine((val) => val.trim().length > 0, {
    message: 'City cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must not exceed 100 characters')
      .regex(
        NAME_REGEX,
        'City can only contain letters, spaces, hyphens, and apostrophes'
      )
  )

/**
 * Address field (required)
 * - Min 5 characters, max 200 characters
 * - Rejects whitespace-only input
 */
export const addressSchema = z
  .string()
  .min(1, 'Address is required')
  .refine((val) => val.trim().length > 0, {
    message: 'Address cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must not exceed 200 characters')
  )

/**
 * Optional address field
 * - Whitespace-only input is rejected
 */
export const optionalAddressSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      // If empty or undefined, it's valid (optional field)
      if (!val) return true
      // Reject whitespace-only strings
      return val.trim().length > 0
    },
    {
      message: 'Address cannot be only whitespace'
    }
  )

/**
 * Optional city field
 * - Whitespace-only input is rejected
 */
export const optionalCitySchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      // If empty or undefined, it's valid (optional field)
      if (!val) return true
      // Reject whitespace-only strings
      return val.trim().length > 0
    },
    {
      message: 'City cannot be only whitespace'
    }
  )

/**
 * License plate field
 * - Min 2 characters, max 15 characters
 * - No format restrictions (flexible for international plates)
 * - Rejects whitespace-only input
 */
export const licensePlateSchema = z
  .string()
  .min(1, 'License plate is required')
  .refine((val) => val.trim().length > 0, {
    message: 'License plate cannot be only whitespace'
  })
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(2, 'License plate must be at least 2 characters')
      .max(15, 'License plate must not exceed 15 characters')
  )

/**
 * Password field (for new passwords)
 * - Min 8 characters, max 100 characters
 * - At least 1 uppercase letter
 * - At least 1 symbol/special character
 * - No whitespace allowed
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .regex(/^\S*$/, 'Password cannot contain spaces')
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    'Password must contain at least 1 special character'
  )

/**
 * Current password field (for password change)
 * - Just required, no length validation
 * - No whitespace allowed
 */
export const currentPasswordSchema = z
  .string()
  .min(1, 'Current password is required')
  .regex(/^\S*$/, 'Password cannot contain spaces')

// ============================================================================
// Composite Schemas
// ============================================================================

/**
 * Full name schema (first name + last name)
 */
export const fullNameSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema
})

/**
 * Password change schema with confirmation
 * - Validates that new password and confirm password match
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: currentPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine(
    (data) => {
      // Only validate if at least one of the new password fields has a value
      if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword
      }
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }
  )

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Create a required string field with custom error message
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`)

/**
 * Create an optional string field that can be empty
 */
export const optionalString = () => z.string().optional()

/**
 * Create a string field with min/max length
 */
export const stringWithLength = (
  min: number,
  max: number,
  fieldName: string = 'This field'
) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must not exceed ${max} characters`)
