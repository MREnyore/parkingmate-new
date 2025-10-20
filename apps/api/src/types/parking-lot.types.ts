/**
 * ParkingLot Types and Business Rules
 * Consolidated from domain entities and application DTOs
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface ParkingLot {
  id: string
  name: string
  description?: string | null
  address: string
  city: string
  country: string
  latitude: string
  longitude: string
  totalSpaces: number
  availableSpaces: number
  pricePerHour: string
  currency: string
  isActive: boolean
  openingTime?: string | null
  closingTime?: string | null
  isOpen247: boolean
  ownerId?: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Input/Output Types
// ============================================================================

export interface CreateParkingLotInput {
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  latitude: string
  longitude: string
  totalSpaces: number
  pricePerHour: string
  currency?: string
  openingTime?: string
  closingTime?: string
  isOpen247?: boolean
  ownerId?: string
}

export interface UpdateParkingLotInput {
  name?: string
  description?: string
  pricePerHour?: string
  openingTime?: string
  closingTime?: string
  isOpen247?: boolean
  isActive?: boolean
}

export interface ParkingLotOutput {
  id: string
  name: string
  description?: string | null
  address: string
  city: string
  country: string
  latitude: string
  longitude: string
  totalSpaces: number
  availableSpaces: number
  pricePerHour: string
  currency: string
  isActive: boolean
  openingTime?: string | null
  closingTime?: string | null
  isOpen247: boolean
  occupancyRate: number
  isCurrentlyOpen: boolean
  createdAt: string
  updatedAt: string
}

export interface ParkingLotListOutput {
  parkingLots: ParkingLotOutput[]
  total: number
  page: number
  limit: number
}

export interface ParkingLotQueryParams {
  page?: number
  limit?: number
  city?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// Business Rules
// ============================================================================

/**
 * Business rules for ParkingLot entity
 * Pure business logic with zero dependencies
 */
export class ParkingLotRules {
  /**
   * Check if parking lot is currently open
   */
  static isOpen(parkingLot: ParkingLot): boolean {
    if (parkingLot.isOpen247) {
      return true
    }

    if (!parkingLot.openingTime || !parkingLot.closingTime) {
      return false
    }

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    return (
      currentTime >= parkingLot.openingTime &&
      currentTime <= parkingLot.closingTime
    )
  }

  /**
   * Check if parking lot has available spaces
   */
  static hasAvailableSpaces(parkingLot: ParkingLot): boolean {
    return parkingLot.availableSpaces > 0
  }

  /**
   * Check if parking lot can accept a booking
   */
  static canAcceptBooking(parkingLot: ParkingLot): boolean {
    return (
      parkingLot.isActive &&
      this.isOpen(parkingLot) &&
      this.hasAvailableSpaces(parkingLot)
    )
  }

  /**
   * Calculate occupancy rate
   */
  static getOccupancyRate(parkingLot: ParkingLot): number {
    if (parkingLot.totalSpaces === 0) return 0
    const occupied = parkingLot.totalSpaces - parkingLot.availableSpaces
    return (occupied / parkingLot.totalSpaces) * 100
  }

  /**
   * Map database entity to output DTO with calculated fields
   */
  static toOutput(entity: ParkingLot): ParkingLotOutput {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      address: entity.address,
      city: entity.city,
      country: entity.country,
      latitude: entity.latitude,
      longitude: entity.longitude,
      totalSpaces: entity.totalSpaces,
      availableSpaces: entity.availableSpaces,
      pricePerHour: entity.pricePerHour,
      currency: entity.currency,
      isActive: entity.isActive,
      openingTime: entity.openingTime,
      closingTime: entity.closingTime,
      isOpen247: entity.isOpen247,
      occupancyRate: this.getOccupancyRate(entity),
      isCurrentlyOpen: this.isOpen(entity),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    }
  }
}
