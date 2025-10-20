import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'
import { apiClient } from '@/lib/api-client'
import { useSessionStore } from '@/stores/sessionStore'
import type {
  AddCarRequest,
  Car,
  Customer,
  UpdateCarRequest,
  UpdateCustomerInfoRequest,
  ValidateRegistrationTokenRequest,
  ValidateRegistrationTokenResponse
} from '@/types/api'

// Simple response wrapper
interface ApiResponse {
  success: boolean
  message?: string
  responseStatus?: {
    errorCode?: string
    message?: string
  }
}

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

    const apiResponse: ValidateRegistrationTokenResponse = await response.json()

    // Handle successful response
    if (response.ok && apiResponse.success && apiResponse.data?.valid) {
      return {
        valid: apiResponse.data.valid,
        email: apiResponse.data.customer?.email
      }
    }

    // Handle validation failure (token invalid/expired)
    if (response.ok && apiResponse.success && !apiResponse.data?.valid) {
      const errorMessage =
        apiResponse.data?.error ?? 'Registration token is invalid or expired'
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
      apiResponse.data?.error ||
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

export const getCustomer = async (): Promise<Customer> => {
  const { clearAuthAndRedirect } = useSessionStore.getState()
  try {
    const response = await apiClient.getCustomer()

    if (response.success && response.data) {
      // TypeScript doesn't properly narrow intersection types from allOf schemas
      // At runtime, response.data is the Customer object due to ApiClient's data extraction
      return response.data as unknown as Customer
    }

    // Handle error response
    const errorMessage =
      response.error?.message ?? 'Failed to fetch customer info'

    // Security: Handle "Customer not found" error - clear session and redirect
    if (response.error?.code === 'NotFound') {
      toast.error('Session Invalid', {
        description: 'Your session is no longer valid. Please login again.'
      })
      clearAuthAndRedirect(errorMessage)
    } else {
      toast.error('Failed to fetch customer info', {
        description: errorMessage
      })
    }

    throw new Error(errorMessage)
  } catch (error) {
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
  customerData: UpdateCustomerInfoRequest
): Promise<ApiResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await apiClient.updateCustomerInfo(customerData)
    if (response.success) {
      toast.success('Customer info updated', {
        description: 'Your personal information has been updated successfully'
      })
      return { success: true }
    }

    const errorMessage =
      response.error?.message ?? 'An unexpected error occurred'
    toast.error(errorMessage)
    return {
      success: false,
      message: errorMessage,
      responseStatus: {
        errorCode: response.error?.code,
        message: errorMessage
      }
    }
  } catch (error) {
    console.error('Update customer info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to update customer info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}

export const addCarInfo = async (
  carInfo: AddCarRequest
): Promise<ApiResponse & { data?: Car }> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await apiClient.addCar(carInfo)
    if (response.success && response.data) {
      const car = response.data as Car
      toast.success('Car info added', {
        description: 'Your car information has been added successfully'
      })
      return {
        success: true,
        data: car
      }
    }

    const errorMessage =
      response.error?.message ?? 'An unexpected error occurred'
    toast.error(errorMessage)
    return {
      success: false,
      message: errorMessage,
      responseStatus: {
        errorCode: response.error?.code,
        message: errorMessage
      }
    }
  } catch (error) {
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
  carId,
  carInfo
}: {
  carId: string
  carInfo: UpdateCarRequest
}): Promise<ApiResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await apiClient.updateCar(carId, carInfo)
    if (response.success) {
      toast.success('Car info updated', {
        description: 'Your car information has been updated successfully'
      })
      return { success: true }
    }

    const errorMessage =
      response.error?.message ?? 'An unexpected error occurred'
    toast.error(errorMessage)
    return {
      success: false,
      message: errorMessage,
      responseStatus: {
        errorCode: response.error?.code,
        message: errorMessage
      }
    }
  } catch (error) {
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
}): Promise<ApiResponse> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await apiClient.deleteCar(carId)

    if (response.success) {
      toast.success('Car info deleted', {
        description: 'Your car information has been deleted successfully'
      })
      return { success: true }
    }

    const errorMessage =
      response.error?.message ?? 'An unexpected error occurred'
    toast.error(errorMessage)
    return {
      success: false,
      message: errorMessage,
      responseStatus: {
        errorCode: response.error?.code,
        message: errorMessage
      }
    }
  } catch (error) {
    console.error('Delete car info error:', error)
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Failed to delete car info', {
      description: 'Failed to connect to server'
    })

    throw new Error(networkError)
  }
}
