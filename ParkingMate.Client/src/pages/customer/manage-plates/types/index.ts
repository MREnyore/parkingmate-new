// Types for the manage plates feature
export interface Plate {
  id: string
  number: string
  vehicle: string
  brand: string
  model: string
}

export interface PersonalInfo {
  name: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
}

export interface UserData {
  membershipStatus: string
  validUntil: string
  personalInfo: PersonalInfo
}

export interface PersonalInfoFormData {
  name: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
}

export interface PlateFormData {
  number: string
  vehicle: string
  brand: string
  model: string
}
