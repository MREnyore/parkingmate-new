import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type {
  CreateCustomerRequest,
  CustomerWithCars,
  UpdateCustomerRequest
} from '@/types/api'

/**
 * Get all customers for admin's organization
 * Endpoint: GET /admin/customers
 */
export const getAllCustomers = async (): Promise<{
  success: boolean
  customers?: CustomerWithCars[]
  error?: string
}> => {
  try {
    const response = await apiClient.getAllCustomers()

    if (response.success && response.data) {
      return {
        success: true,
        customers: response.data as CustomerWithCars[]
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to fetch customers'
    toast.error('Failed to Load Customers', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to fetch customers.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}

/**
 * Get customer by ID
 * Endpoint: GET /admin/customers/:id
 */
export const getCustomerById = async (
  customerId: string
): Promise<{
  success: boolean
  customer?: CustomerWithCars
  error?: string
}> => {
  try {
    const response = await apiClient.getCustomerById(customerId)

    if (response.success && response.data) {
      return {
        success: true,
        customer: response.data as CustomerWithCars
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to fetch customer'
    toast.error('Failed to Load Customer', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to fetch customer.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}

/**
 * Create new customer
 * Endpoint: POST /admin/customers
 */
export const createCustomer = async (
  data: CreateCustomerRequest
): Promise<{
  success: boolean
  customer?: CustomerWithCars
  error?: string
}> => {
  try {
    const response = await apiClient.createCustomer(data)

    if (response.success && response.data) {
      toast.success('Customer Created', {
        description: `Customer ${data.name} has been created successfully.`
      })

      return {
        success: true,
        customer: response.data as CustomerWithCars
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to create customer'
    toast.error('Failed to Create Customer', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to create customer.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}

/**
 * Update customer
 * Endpoint: PUT /admin/customers/:id
 */
export const updateCustomer = async (
  customerId: string,
  data: UpdateCustomerRequest
): Promise<{
  success: boolean
  customer?: CustomerWithCars
  error?: string
}> => {
  try {
    const response = await apiClient.updateCustomer(customerId, data)

    if (response.success && response.data) {
      toast.success('Customer Updated', {
        description: 'Customer information has been updated successfully.'
      })

      return {
        success: true,
        customer: response.data as CustomerWithCars
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to update customer'
    toast.error('Failed to Update Customer', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to update customer.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}

/**
 * Delete customer
 * Endpoint: DELETE /admin/customers/:id
 */
export const deleteCustomer = async (
  customerId: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    const response = await apiClient.deleteCustomer(customerId)

    if (response.success) {
      toast.success('Customer Deleted', {
        description: 'Customer has been deleted successfully.'
      })

      return {
        success: true
      }
    }

    const errorMessage = response.error?.message ?? 'Failed to delete customer'
    toast.error('Failed to Delete Customer', {
      description: errorMessage
    })

    return {
      success: false,
      error: errorMessage
    }
  } catch (error) {
    const networkError =
      error instanceof Error ? error.message : 'Network error occurred'

    toast.error('Connection Error', {
      description: 'Unable to delete customer.'
    })

    return {
      success: false,
      error: networkError
    }
  }
}
