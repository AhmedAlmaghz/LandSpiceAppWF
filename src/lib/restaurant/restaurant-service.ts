// Restaurant Management Service
// خدمات إدارة المطاعم

import { 
  Restaurant, 
  RestaurantFilter, 
  RestaurantSortOption, 
  RestaurantStats, 
  RestaurantFormData,
  RestaurantContact,
  RestaurantBranch,
  RestaurantDocument,
  RestaurantEvent
} from './types'
import { validateRestaurant, validateRestaurantForm } from './validation'

export class RestaurantService {
  private static instance: RestaurantService
  private restaurants: Restaurant[] = []
  private eventListeners: ((event: RestaurantEvent) => void)[] = []

  private constructor() {
    this.initializeMockData()
  }

  public static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService()
    }
    return RestaurantService.instance
  }

  // Event system
  public addEventListener(listener: (event: RestaurantEvent) => void): void {
    this.eventListeners.push(listener)
  }

  public removeEventListener(listener: (event: RestaurantEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private emitEvent(event: RestaurantEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  // CRUD Operations
  public async createRestaurant(formData: RestaurantFormData): Promise<{
    success: boolean
    restaurant?: Restaurant
    errors?: any[]
  }> {
    try {
      const validation = validateRestaurantForm(formData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const restaurant: Restaurant = {
        id: this.generateId(),
        name: formData.basic.name,
        legalName: formData.basic.legalName,
        type: formData.basic.type,
        status: 'pending',
        contacts: formData.contacts.map(contact => ({
          ...contact,
          id: this.generateId()
        })),
        branches: formData.branches.map(branch => ({
          ...branch,
          id: this.generateId()
        })),
        businessInfo: formData.basic.businessInfo,
        financialInfo: formData.financial,
        preferences: formData.preferences,
        documents: [],
        relationshipHistory: {
          firstContact: new Date(),
          lastUpdate: new Date(),
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          contractsCount: 0,
          currentContracts: []
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // This would be dynamic
        lastModifiedBy: 'current-user',
        tags: formData.tags,
        categories: formData.categories,
        internalNotes: []
      }

      this.restaurants.push(restaurant)
      this.emitEvent({ type: 'restaurant_created', payload: restaurant })

      return { success: true, restaurant }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'حدث خطأ أثناء إنشاء المطعم' }]
      }
    }
  }

  public async getRestaurant(id: string): Promise<Restaurant | null> {
    return this.restaurants.find(r => r.id === id) || null
  }

  public async getRestaurants(
    filter: RestaurantFilter = {},
    sort: RestaurantSortOption = { field: 'name', direction: 'asc' },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    restaurants: Restaurant[]
    total: number
    page: number
    limit: number
    stats: RestaurantStats
  }> {
    let filteredRestaurants = this.applyFilters(this.restaurants, filter)
    
    // Apply sorting
    filteredRestaurants = this.applySorting(filteredRestaurants, sort)
    
    // Calculate stats
    const stats = this.calculateStats(filteredRestaurants)
    
    // Apply pagination
    const total = filteredRestaurants.length
    const startIndex = (page - 1) * limit
    const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + limit)

    return {
      restaurants: paginatedRestaurants,
      total,
      page,
      limit,
      stats
    }
  }

  public async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<{
    success: boolean
    restaurant?: Restaurant
    errors?: any[]
  }> {
    try {
      const restaurantIndex = this.restaurants.findIndex(r => r.id === id)
      if (restaurantIndex === -1) {
        return { 
          success: false, 
          errors: [{ field: 'general', message: 'المطعم غير موجود' }]
        }
      }

      const currentRestaurant = this.restaurants[restaurantIndex]
      const updatedRestaurant = {
        ...currentRestaurant,
        ...updates,
        updatedAt: new Date(),
        lastModifiedBy: 'current-user'
      }

      const validation = validateRestaurant(updatedRestaurant)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      this.restaurants[restaurantIndex] = updatedRestaurant
      this.emitEvent({ 
        type: 'restaurant_updated', 
        payload: { id, changes: updates }
      })

      return { success: true, restaurant: updatedRestaurant }
    } catch (error) {
      console.error('Error updating restaurant:', error)
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'حدث خطأ أثناء تحديث المطعم' }]
      }
    }
  }

  public async updateRestaurantStatus(id: string, newStatus: Restaurant['status']): Promise<{
    success: boolean
    restaurant?: Restaurant
  }> {
    const restaurant = await this.getRestaurant(id)
    if (!restaurant) {
      return { success: false }
    }

    const oldStatus = restaurant.status
    const result = await this.updateRestaurant(id, { status: newStatus })
    
    if (result.success) {
      this.emitEvent({
        type: 'restaurant_status_changed',
        payload: { id, oldStatus, newStatus }
      })
    }

    return result
  }

  public async deleteRestaurant(id: string): Promise<boolean> {
    const index = this.restaurants.findIndex(r => r.id === id)
    if (index === -1) return false

    this.restaurants.splice(index, 1)
    return true
  }

  // Contact Management
  public async addContact(restaurantId: string, contact: Omit<RestaurantContact, 'id'>): Promise<{
    success: boolean
    contact?: RestaurantContact
  }> {
    const restaurant = await this.getRestaurant(restaurantId)
    if (!restaurant) {
      return { success: false }
    }

    const newContact: RestaurantContact = {
      ...contact,
      id: this.generateId()
    }

    restaurant.contacts.push(newContact)
    restaurant.updatedAt = new Date()

    this.emitEvent({
      type: 'contact_added',
      payload: { restaurantId, contact: newContact }
    })

    return { success: true, contact: newContact }
  }

  public async updateContact(restaurantId: string, contactId: string, updates: Partial<RestaurantContact>): Promise<boolean> {
    const restaurant = await this.getRestaurant(restaurantId)
    if (!restaurant) return false

    const contactIndex = restaurant.contacts.findIndex(c => c.id === contactId)
    if (contactIndex === -1) return false

    restaurant.contacts[contactIndex] = {
      ...restaurant.contacts[contactIndex],
      ...updates
    }
    restaurant.updatedAt = new Date()

    return true
  }

  public async removeContact(restaurantId: string, contactId: string): Promise<boolean> {
    const restaurant = await this.getRestaurant(restaurantId)
    if (!restaurant) return false

    const contactIndex = restaurant.contacts.findIndex(c => c.id === contactId)
    if (contactIndex === -1) return false

    restaurant.contacts.splice(contactIndex, 1)
    restaurant.updatedAt = new Date()

    return true
  }

  // Branch Management
  public async addBranch(restaurantId: string, branch: Omit<RestaurantBranch, 'id'>): Promise<{
    success: boolean
    branch?: RestaurantBranch
  }> {
    const restaurant = await this.getRestaurant(restaurantId)
    if (!restaurant) {
      return { success: false }
    }

    const newBranch: RestaurantBranch = {
      ...branch,
      id: this.generateId()
    }

    restaurant.branches.push(newBranch)
    restaurant.updatedAt = new Date()

    this.emitEvent({
      type: 'branch_added',
      payload: { restaurantId, branch: newBranch }
    })

    return { success: true, branch: newBranch }
  }

  // Search functionality
  public async searchRestaurants(query: string): Promise<Restaurant[]> {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.legalName.toLowerCase().includes(searchTerm) ||
      restaurant.businessInfo.description.toLowerCase().includes(searchTerm) ||
      restaurant.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      restaurant.contacts.some(contact => 
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm)
      )
    )
  }

  // Utility methods
  private generateId(): string {
    return `rest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private applyFilters(restaurants: Restaurant[], filter: RestaurantFilter): Restaurant[] {
    return restaurants.filter(restaurant => {
      if (filter.status && !filter.status.includes(restaurant.status)) return false
      if (filter.type && !filter.type.includes(restaurant.type)) return false
      if (filter.businessType && !filter.businessType.includes(restaurant.businessInfo.businessType)) return false
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const matchesName = restaurant.name.toLowerCase().includes(searchTerm)
        const matchesLegalName = restaurant.legalName.toLowerCase().includes(searchTerm)
        const matchesDescription = restaurant.businessInfo.description.toLowerCase().includes(searchTerm)
        if (!matchesName && !matchesLegalName && !matchesDescription) return false
      }
      return true
    })
  }

  private applySorting(restaurants: Restaurant[], sort: RestaurantSortOption): Restaurant[] {
    return [...restaurants].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sort.field) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'lastUpdate':
          aValue = a.updatedAt
          bValue = b.updatedAt
          break
        case 'totalRevenue':
          aValue = a.relationshipHistory.totalRevenue
          bValue = b.relationshipHistory.totalRevenue
          break
        case 'totalOrders':
          aValue = a.relationshipHistory.totalOrders
          bValue = b.relationshipHistory.totalOrders
          break
        default:
          return 0
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  private calculateStats(restaurants: Restaurant[]): RestaurantStats {
    const stats: RestaurantStats = {
      total: restaurants.length,
      active: 0,
      inactive: 0,
      pending: 0,
      byType: { single: 0, chain: 0, franchise: 0 },
      byBusinessType: { restaurant: 0, cafe: 0, fast_food: 0, catering: 0, food_truck: 0 },
      byRegion: {},
      totalRevenue: 0,
      averageRevenue: 0,
      contractsCount: 0
    }

    restaurants.forEach(restaurant => {
      // Status counts
      if (restaurant.status === 'active') stats.active++
      else if (restaurant.status === 'inactive') stats.inactive++
      else if (restaurant.status === 'pending') stats.pending++

      // Type counts
      stats.byType[restaurant.type]++
      stats.byBusinessType[restaurant.businessInfo.businessType]++

      // Region counts
      restaurant.branches.forEach(branch => {
        const region = branch.address.region
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1
      })

      // Financial stats
      stats.totalRevenue += restaurant.relationshipHistory.totalRevenue
      stats.contractsCount += restaurant.relationshipHistory.contractsCount
    })

    stats.averageRevenue = restaurants.length > 0 ? stats.totalRevenue / restaurants.length : 0

    return stats
  }

  private initializeMockData(): void {
    // Add some mock data for testing
    const mockRestaurant: Restaurant = {
      id: 'rest_001',
      name: 'مطعم البيك',
      legalName: 'شركة البيك للمأكولات السريعة',
      type: 'chain',
      status: 'active',
      contacts: [{
        id: 'contact_001',
        name: 'أحمد محمد',
        position: 'مدير المطعم',
        phone: '+966501234567',
        email: 'ahmed@albaik.com',
        isPrimary: true,
        isActive: true
      }],
      branches: [{
        id: 'branch_001',
        name: 'الفرع الرئيسي',
        address: {
          street: 'شارع الملك عبدالعزيز',
          city: 'جدة',
          region: 'مكة المكرمة',
          postalCode: '23432',
          country: 'السعودية'
        },
        phone: '+966126789012',
        manager: 'سالم أحمد',
        isActive: true,
        openingDate: new Date('2020-01-15')
      }],
      businessInfo: {
        establishedDate: new Date('2010-05-20'),
        businessType: 'fast_food',
        description: 'مطعم متخصص في المأكولات السريعة والدجاج المقلي',
        website: 'https://albaik.com',
        socialMedia: {
          instagram: 'https://instagram.com/albaik',
          twitter: 'https://twitter.com/albaik'
        }
      },
      financialInfo: {
        registrationNumber: '1234567890',
        taxId: '987654321',
        capitalAmount: 5000000,
        currency: 'SAR',
        creditRating: 'A',
        guaranteeRequired: 100000,
        paymentTerms: 30,
        preferredPaymentMethod: 'bank_transfer'
      },
      preferences: {
        cuisineType: ['سريع', 'دجاج'],
        servingCapacity: {
          dineIn: 100,
          takeaway: 50,
          delivery: 30
        },
        operatingHours: {
          sunday: { open: '11:00', close: '23:00', isOpen: true },
          monday: { open: '11:00', close: '23:00', isOpen: true },
          tuesday: { open: '11:00', close: '23:00', isOpen: true },
          wednesday: { open: '11:00', close: '23:00', isOpen: true },
          thursday: { open: '11:00', close: '23:00', isOpen: true },
          friday: { open: '14:00', close: '23:00', isOpen: true },
          saturday: { open: '11:00', close: '23:00', isOpen: true }
        },
        specialRequirements: ['حلال', 'دون لحم خنزير'],
        marketingPreferences: {
          allowMarketing: true,
          preferredChannels: ['email', 'sms', 'social_media'],
          targetAudience: ['عائلات', 'شباب']
        }
      },
      documents: [],
      relationshipHistory: {
        firstContact: new Date('2023-01-01'),
        lastUpdate: new Date(),
        totalOrders: 25,
        totalRevenue: 750000,
        averageOrderValue: 30000,
        lastOrderDate: new Date('2024-12-01'),
        contractsCount: 3,
        currentContracts: ['contract_001', 'contract_002']
      },
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date(),
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      tags: ['مميز', 'عميل مهم', 'سلسلة'],
      categories: ['مطاعم سريعة', 'دجاج'],
      internalNotes: [{
        id: 'note_001',
        content: 'عميل ممتاز، دفع سريع وتعامل محترف',
        author: 'مدير المبيعات',
        createdAt: new Date('2023-06-15'),
        isPrivate: false,
        category: 'sales'
      }]
    }

    this.restaurants.push(mockRestaurant)
  }
}

// Export singleton instance
export const restaurantService = RestaurantService.getInstance()
