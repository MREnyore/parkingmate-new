import sendgrid from '@sendgrid/mail'
import { env } from '../config/env'

/**
 * Email service for sending OTP codes and registration emails
 * Uses SendGrid dynamic templates for all email communication
 */
class EmailService {
  private initialized = false
  private readonly senderEmail: string
  private readonly senderName: string
  private readonly otpTemplateId: string
  private readonly vehicleDetectionTemplateId: string

  constructor() {
    this.senderEmail = env.SENDGRID_FROM_EMAIL
    this.senderName = env.SENDGRID_FROM_NAME
    this.otpTemplateId = env.SENDGRID_OTP_TEMPLATE_ID
    this.vehicleDetectionTemplateId = env.SENDGRID_VEHICLE_DETECTION_TEMPLATE_ID
  }

  /**
   * Initialize SendGrid with API key
   */
  private initialize(): void {
    if (this.initialized) {
      return
    }

    if (!env.SENDGRID_API_KEY) {
      console.warn(
        '⚠️  SendGrid API key not configured. Email sending will fail.'
      )
      return
    }

    sendgrid.setApiKey(env.SENDGRID_API_KEY)
    this.initialized = true
    console.log('✅ SendGrid email service initialized')
  }

  /**
   * Send OTP code email using SendGrid dynamic template
   */
  async sendOtpEmail(
    customerEmail: string,
    customerName: string,
    otpCode: string
  ): Promise<boolean> {
    this.initialize()

    try {
      console.log(
        `Attempting to send OTP email to: ${customerEmail} using template: ${this.otpTemplateId}`
      )

      const msg = {
        to: {
          email: customerEmail,
          name: customerName
        },
        from: {
          email: this.senderEmail,
          name: this.senderName
        },
        templateId: this.otpTemplateId,
        dynamicTemplateData: {
          otp_code: otpCode,
          expires_minutes: env.OTP_EXPIRY_MINUTES.toString()
        }
      }

      const [response] = await sendgrid.send(msg)
      console.log(`SendGrid OTP Response Status: ${response.statusCode}`)

      return response.statusCode === 202
    } catch (error) {
      console.error('Error sending OTP email:', error)
      return false
    }
  }

  /**
   * Send vehicle detection email with registration token using SendGrid dynamic template
   */
  async sendVehicleDetectionEmailWithToken(
    customerEmail: string,
    customerName: string,
    registrationToken: string
  ): Promise<boolean> {
    this.initialize()

    try {
      console.log(
        `Attempting to send vehicle detection email with token to: ${customerEmail}`
      )

      const registrationUrl = `${env.APP_BASE_URL}/customer-registration?token=${encodeURIComponent(registrationToken)}`

      const msg = {
        to: {
          email: customerEmail,
          name: customerName
        },
        from: {
          email: this.senderEmail,
          name: this.senderName
        },
        templateId: this.vehicleDetectionTemplateId,
        dynamicTemplateData: {
          registration_url: registrationUrl,
          expires_hours: env.REGISTRATION_TOKEN_EXPIRY_HOURS.toString()
        }
      }

      const [response] = await sendgrid.send(msg)
      console.log(`SendGrid Token Response Status: ${response.statusCode}`)

      return response.statusCode === 202
    } catch (error) {
      console.error('Error sending vehicle detection email with token:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
