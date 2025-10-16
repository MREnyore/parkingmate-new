import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'
import { useSessionStore } from '@/stores/sessionStore'
import { authenticatedFetch } from './auth'

// Base interfaces (lowest level)
interface ApiResponseStatus {
  errorCode?: string
  message?: string
  stackTrace?: string
  errors?: Array<{
    propertyName?: string
    errorMessage?: string
    attemptedValue?: unknown
  }>
  meta?: Record<string, string>
}

interface BaseApiResponse {
  success: boolean
  message?: string
  responseStatus?: ApiResponseStatus
}

interface CarOwner {
  ownerName: string
  ownerEmail: string
}

// Entity interfaces (extending base types)
export interface CustomerCarInfo {
  carId: string
  licensePlate: string
  label: string
  brand: string
  model: string
  owner: CarOwner
  createdAt: string // Date format: "/Date(1758973222457-0000)/"
  updatedAt: string // Date format: "/Date(1758973222457-0000)/"
}

// API Request/Response interfaces (extending BaseApiResponse)
interface ValidateRegistrationTokenRequest {
  token: string
}

interface ValidateRegistrationTokenResponse {
  isValid: boolean
  email?: string
  errorMessage?: string
  responseStatus?: ApiResponseStatus
}

interface UpdateCustomerInfoResponse extends BaseApiResponse {
  customerInfo?: {
    customerId: string
    name: string
    email: string
    phoneNumber?: string
    isRegistered: boolean
    status: string
    cars: []
    totalCars: 0
    createdAt: string
    updatedAt: string
  }
}

interface CrudCustomerCarResponse extends BaseApiResponse {
  carInfo?: CustomerCarInfo
}

export interface GetCustomerInfoResponse {
  customerId: string
  name: string
  email: string
  phoneNumber?: string
  isRegistered: boolean
  status: 'active' | 'inactive'
  membershipStatus: 'active' | 'inactive'
  membershipExpiryDate: string // Date format: "/Date(1758973222514-0000)/"
  address?: string
  postalCode?: string
  city?: string
  cars: CustomerCarInfo[]
  totalCars: number
  createdAt: string // Date format: "/Date(1758973222514-0000)/"
  updatedAt: string // Date format: "/Date(1758973222514-0000)/"
  responseStatus?: ApiResponseStatus
  success?: boolean
  message?: string
}

export type CustomerType = Pick<
  GetCustomerInfoResponse,
  'name' | 'email' | 'phoneNumber' | 'address' | 'postalCode' | 'city'
>

// API call to validate registration token
export const validateRegistrationToken = async (
  token: string
): Promise<{
  valid: boolean
  email?: string
  error?: string
}> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch(
      `${API_BASE_URL}/auth/validate-registration-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token } as ValidateRegistrationTokenRequest)
      }
    )

    const data: ValidateRegistrationTokenResponse = await response.json()

    // Handle successful response
    if (response.ok && data.isValid) {
      return {
        valid: data.isValid,
        email: data.email
      }
    }

    // Handle validation failure (token invalid/expired)
    if (response.ok && !data.isValid) {
      const errorMessage =
        data.errorMessage || 'Registration token is invalid or expired'
      toast.error('Invalid Registration Link', {
        description: errorMessage
      })
      return {
        valid: false,
        error: errorMessage
      }
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.errorMessage ||
      `API error: ${response.status} ${response.statusText}`

    toast.error('Validation Error', {
      description: errorMessage
    })

    return {
      valid: false,
      error: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Token validation error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'
    toast.error('Connection Error', {
      description: networkError
    })
    return {
      valid: false,
      error: networkError
    }
  }
}

export const getCustomerInfo = async (): Promise<GetCustomerInfoResponse> => {
  const { clearAuthAndRedirect } = useSessionStore.getState()
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/customer/info`
    )

    const data: GetCustomerInfoResponse = await response.json()

    // Handle successful response
    if (response.ok && !data.responseStatus?.errorCode) {
      return {
        ...data,
        success: true
      }
    }

    // Security: Handle "Customer not found" error - clear session and redirect
    if (data.responseStatus?.errorCode === 'NotFound') {
      const errorMessage = data.responseStatus?.message || 'Customer not found'

      toast.error('Session Invalid', {
        description: 'Your session is no longer valid. Please login again.'
      })

      // Clear auth and redirect to login
      clearAuthAndRedirect(errorMessage)

      return {
        ...data,
        success: false,
        message: errorMessage
      }
    }

    // Handle other API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      `API error: ${response.status} ${response.statusText}`

    toast.error('Failed to fetch customer info', {
      description: errorMessage
    })

    return {
      ...data,
      success: false,
      message: errorMessage
    }
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Get customer info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to fetch customer info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}

export const updateCustomerInfo = async (
  customerData: CustomerType
): Promise<UpdateCustomerInfoResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/customer/info`,
      {
        method: 'PUT',
        body: JSON.stringify(customerData)
      }
    )

    const data: UpdateCustomerInfoResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Customer info updated', {
        description: 'Your personal information has been updated successfully'
      })
      return data
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      'An unexpected error occurred'

    toast.error(errorMessage)

    return data
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Update customer info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to update customer info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}

export const addCarInfo = async ({
  carInfo
}: {
  carInfo: Pick<CustomerCarInfo, 'licensePlate' | 'label' | 'brand' | 'model'>
}): Promise<CrudCustomerCarResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/customer/cars`,
      {
        method: 'POST',
        body: JSON.stringify(carInfo)
      }
    )

    const data: CrudCustomerCarResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Car info added', {
        description: 'Your car information has been added successfully'
      })
      return data
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      'An unexpected error occurred'

    toast.error(errorMessage)

    return data
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Add car info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to add car info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}

export const updateCarInfo = async ({
  carInfo
}: {
  carInfo: Pick<
    CustomerCarInfo,
    'carId' | 'licensePlate' | 'label' | 'brand' | 'model'
  >
}): Promise<CrudCustomerCarResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/customer/cars/${carInfo.carId}`,
      {
        method: 'PUT',
        body: JSON.stringify(carInfo)
      }
    )

    const data: CrudCustomerCarResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Car info updated', {
        description: 'Your car information has been updated successfully'
      })
      return data
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      'An unexpected error occurred'

    toast.error(errorMessage)

    return data
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Update car info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to update car info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}

export const deleteCarInfo = async ({
  carId
}: {
  carId: string
}): Promise<BaseApiResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/customer/cars/${carId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ carId })
      }
    )

    const data: BaseApiResponse = await response.json()

    // Handle successful response
    if (response.ok && data.success) {
      toast.success('Car info deleted', {
        description: 'Your car information has been deleted successfully'
      })
      return data
    }

    // Handle API error responses
    const errorMessage =
      data.responseStatus?.message ||
      data.message ||
      'An unexpected error occurred'

    toast.error(errorMessage)

    return data
  } catch (error) {
    // Handle network errors or other exceptions
    console.error('Delete car info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to delete car info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}
