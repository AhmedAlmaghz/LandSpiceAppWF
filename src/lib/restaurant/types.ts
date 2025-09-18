// Restaurant Management Types
// أنواع بيانات إدارة المطاعم

export interface RestaurantContact {
  id: string
  name: string
  position: string
  phone: string
  email: string
  isPrimary: boolean
  isActive: boolean
}

export interface RestaurantBranch {
  id: string
  name: string
  address: {
    street: string
    city: string
    region: string
    postalCode?: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  phone: string
  email?: string
  manager: string
  isActive: boolean
  openingDate: Date
}

export interface FinancialInfo {
  registrationNumber: string
  taxId: string
  capitalAmount: number
  currency: 'SAR' | 'USD' | 'EUR'
  creditRating?: 'A' | 'B' | 'C' | 'D'
  guaranteeRequired: number
  paymentTerms: number // days
  preferredPaymentMethod: 'bank_transfer' | 'check' | 'cash' | 'online'
}

export interface RestaurantPreferences {
  cuisineType: string[]
  servingCapacity: {
    dineIn: number
    takeaway: number
    delivery: number
  }
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }
  specialRequirements: string[]
  marketingPreferences: {
    allowMarketing: boolean
    preferredChannels: string[]
    targetAudience: string[]
  }
}

export interface RestaurantDocument {
  id: string
  type: 'license' | 'permit' | 'certificate' | 'contract' | 'other'
  title: string
  fileName: string
  filePath: string
  uploadDate: Date
  expiryDate?: Date
  issuedBy?: string
  status: 'valid' | 'expired' | 'pending' | 'rejected'
  notes?: string
}

export interface Restaurant {
  id: string
  name: string
  legalName: string
  type: 'single' | 'chain' | 'franchise'
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated'
  
  // Contact Information
  contacts: RestaurantContact[]
  branches: RestaurantBranch[]
  
  // Business Information
  businessInfo: {
    establishedDate: Date
    businessType: 'restaurant' | 'cafe' | 'fast_food' | 'catering' | 'food_truck'
    description: string
    website?: string
    socialMedia: {
      instagram?: string
      twitter?: string
      facebook?: string
      tiktok?: string
    }
  }
  
  // Financial Information
  financialInfo: FinancialInfo
  
  // Preferences & Requirements
  preferences: RestaurantPreferences
  
  // Documents & Files
  documents: RestaurantDocument[]
  
  // Relationship History
  relationshipHistory: {
    firstContact: Date
    lastUpdate: Date
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    lastOrderDate?: Date
    contractsCount: number
    currentContracts: string[] // Contract IDs
  }
  
  // System Fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  
  // Tags and Categories
  tags: string[]
  categories: string[]
  
  // Internal Notes
  internalNotes: {
    id: string
    content: string
    author: string
    createdAt: Date
    isPrivate: boolean
    category: 'general' | 'sales' | 'technical' | 'financial' | 'legal'
  }[]
}

export interface RestaurantFilter {
  status?: Restaurant['status'][]
  type?: Restaurant['type'][]
  businessType?: Restaurant['businessInfo']['businessType'][]
  cuisineType?: string[]
  city?: string[]
  region?: string[]
  creditRating?: FinancialInfo['creditRating'][]
  hasActiveContracts?: boolean
  registrationDateFrom?: Date
  registrationDateTo?: Date
  tags?: string[]
  searchTerm?: string
}

export interface RestaurantSortOption {
  field: 'name' | 'createdAt' | 'lastUpdate' | 'totalRevenue' | 'totalOrders'
  direction: 'asc' | 'desc'
}

export interface RestaurantStats {
  total: number
  active: number
  inactive: number
  pending: number
  byType: Record<Restaurant['type'], number>
  byBusinessType: Record<Restaurant['businessInfo']['businessType'], number>
  byRegion: Record<string, number>
  totalRevenue: number
  averageRevenue: number
  contractsCount: number
}

// Form Types
export interface RestaurantFormData {
  basic: Pick<Restaurant, 'name' | 'legalName' | 'type' | 'businessInfo'>
  contacts: Omit<RestaurantContact, 'id'>[]
  branches: Omit<RestaurantBranch, 'id'>[]
  financial: FinancialInfo
  preferences: RestaurantPreferences
  documents: File[]
  tags: string[]
  categories: string[]
}

// API Response Types
export interface RestaurantListResponse {
  restaurants: Restaurant[]
  total: number
  page: number
  limit: number
  stats: RestaurantStats
}

export interface RestaurantResponse {
  restaurant: Restaurant
  success: boolean
  message?: string
}

// Event Types
export type RestaurantEvent = 
  | { type: 'restaurant_created'; payload: Restaurant }
  | { type: 'restaurant_updated'; payload: { id: string; changes: Partial<Restaurant> } }
  | { type: 'restaurant_status_changed'; payload: { id: string; oldStatus: Restaurant['status']; newStatus: Restaurant['status'] } }
  | { type: 'contact_added'; payload: { restaurantId: string; contact: RestaurantContact } }
  | { type: 'branch_added'; payload: { restaurantId: string; branch: RestaurantBranch } }
  | { type: 'document_uploaded'; payload: { restaurantId: string; document: RestaurantDocument } }
