export interface ParkingSpot {
  id?: string
  name: string
  address: string
  capacity: number
  violations?: number
  rule?: {
    value: string
    type: 'minutes' | 'hours' | 'days'
    variant: 'blue' | 'green'
  }
  ruleConfig?: {
    maxParkingDuration: {
      enabled: boolean
      value: string
      unit: 'minutes' | 'hours'
    }
    validTimes: {
      enabled: boolean
      days: string
      timeRange: string
    }
    accessControl: {
      enabled: boolean
      type: 'registered' | 'registered_and_guests'
    }
    maxVehiclesPerUser: {
      enabled: boolean
      value: string
    }
    penaltyFee: {
      enabled: boolean
      value: string
    }
  }
}
