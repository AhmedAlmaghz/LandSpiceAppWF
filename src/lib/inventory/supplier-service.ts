// Supplier Management Service for Yemeni Context
// خدمة إدارة الموردين للسياق اليمني

import {
  YemeniSupplier,
  SupplierFilter,
  SupplierSortOption,
  SupplierStats,
  SupplierEvent,
  SupplierSpecialty,
  PaymentTerms,
  DeliveryTerms,
  YemeniGovernorate,
  YemeniProductCategory,
  SupplierNote,
  Currency
} from './types'

import {
  validateSupplier,
  generateSupplierCode,
  validateYemeniPhoneNumber
} from './validation'

export class SupplierService {
  private static instance: SupplierService
  private suppliers: YemeniSupplier[] = []
  private eventListeners: ((event: SupplierEvent) => void)[] = []

  private constructor() {
    this.initializeMockData()
  }

  public static getInstance(): SupplierService {
    if (!SupplierService.instance) {
      SupplierService.instance = new SupplierService()
    }
    return SupplierService.instance
  }

  // Event System
  public addEventListener(listener: (event: SupplierEvent) => void): void {
    this.eventListeners.push(listener)
  }

  public removeEventListener(listener: (event: SupplierEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private emitEvent(event: SupplierEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  // CRUD Operations
  public async createSupplier(supplierData: Omit<YemeniSupplier, 'id' | 'supplierCode' | 'createdDate' | 'lastModified' | 'createdBy' | 'lastModifiedBy'>): Promise<{
    success: boolean
    supplier?: YemeniSupplier
    errors?: any[]
  }> {
    try {
      const validation = validateSupplier(supplierData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      // Generate supplier code
      const supplierCode = generateSupplierCode(
        supplierData.address.governorate,
        supplierData.specialties[0] // Use first specialty for code generation
      )

      // Calculate overall rating
      const overallRating = this.calculateOverallRating(
        supplierData.qualityRating,
        supplierData.reliabilityRating,
        supplierData.priceCompetitiveness,
        supplierData.deliveryPerformance
      )

      const supplier: YemeniSupplier = {
        ...supplierData,
        id: this.generateId(),
        supplierCode,
        overallRating,
        totalOrdersCount: 0,
        totalOrderValue: 0,
        averageOrderValue: 0,
        averageDeliveryTime: 0,
        notes: [],
        tags: [],
        createdDate: new Date(),
        lastModified: new Date(),
        createdBy: 'current-user',
        lastModifiedBy: 'current-user'
      }

      this.suppliers.push(supplier)
      this.emitEvent({
        type: 'supplier_added',
        payload: supplier,
        timestamp: new Date(),
        triggeredBy: 'current-user',
        supplierId: supplier.id,
        severity: 'info'
      })

      return { success: true, supplier }
    } catch (error) {
      console.error('Error creating supplier:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'حدث خطأ أثناء إنشاء المورد' }]
      }
    }
  }

  public async getSupplier(id: string): Promise<YemeniSupplier | null> {
    return this.suppliers.find(supplier => supplier.id === id && supplier.isActive) || null
  }

  public async getSuppliers(
    filter: SupplierFilter = {},
    sort: SupplierSortOption = { field: 'businessName', direction: 'asc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    suppliers: YemeniSupplier[]
    total: number
    page: number
    limit: number
    stats: SupplierStats
  }> {
    let filteredSuppliers = this.applyFilters(this.suppliers, filter)
    filteredSuppliers = this.applySorting(filteredSuppliers, sort)
    
    const stats = this.calculateStats(filteredSuppliers)
    
    const total = filteredSuppliers.length
    const startIndex = (page - 1) * limit
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + limit)

    return {
      suppliers: paginatedSuppliers,
      total,
      page,
      limit,
      stats
    }
  }

  public async updateSupplier(id: string, updates: Partial<YemeniSupplier>): Promise<{
    success: boolean
    supplier?: YemeniSupplier
    errors?: any[]
  }> {
    try {
      const supplierIndex = this.suppliers.findIndex(supplier => supplier.id === id)
      if (supplierIndex === -1) {
        return {
          success: false,
          errors: [{ field: 'general', message: 'المورد غير موجود' }]
        }
      }

      const currentSupplier = this.suppliers[supplierIndex]
      const updatedSupplier = {
        ...currentSupplier,
        ...updates,
        lastModified: new Date(),
        lastModifiedBy: 'current-user'
      }

      // Recalculate overall rating if rating fields were updated
      if (updates.qualityRating || updates.reliabilityRating || 
          updates.priceCompetitiveness || updates.deliveryPerformance) {
        updatedSupplier.overallRating = this.calculateOverallRating(
          updatedSupplier.qualityRating,
          updatedSupplier.reliabilityRating,
          updatedSupplier.priceCompetitiveness,
          updatedSupplier.deliveryPerformance
        )
      }

      const validation = validateSupplier(updatedSupplier)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      this.suppliers[supplierIndex] = updatedSupplier
      this.emitEvent({
        type: 'supplier_updated',
        payload: { id, changes: updates },
        timestamp: new Date(),
        triggeredBy: 'current-user',
        supplierId: id,
        severity: 'info'
      })

      return { success: true, supplier: updatedSupplier }
    } catch (error) {
      console.error('Error updating supplier:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'حدث خطأ أثناء تحديث المورد' }]
      }
    }
  }

  public async updateSupplierRating(
    id: string,
    ratingType: 'quality' | 'reliability' | 'price' | 'delivery',
    newRating: number
  ): Promise<{ success: boolean; supplier?: YemeniSupplier }> {
    if (newRating < 1 || newRating > 5) {
      return { success: false }
    }

    const supplier = await this.getSupplier(id)
    if (!supplier) {
      return { success: false }
    }

    const updateData: Partial<YemeniSupplier> = {}
    switch (ratingType) {
      case 'quality':
        updateData.qualityRating = newRating
        break
      case 'reliability':
        updateData.reliabilityRating = newRating
        break
      case 'price':
        updateData.priceCompetitiveness = newRating
        break
      case 'delivery':
        updateData.deliveryPerformance = newRating
        break
    }

    const result = await this.updateSupplier(id, updateData)
    
    if (result.success) {
      this.emitEvent({
        type: 'rating_changed',
        payload: { 
          supplierId: id, 
          ratingType, 
          oldRating: supplier[`${ratingType}Rating` as keyof YemeniSupplier] as number,
          newRating 
        },
        timestamp: new Date(),
        triggeredBy: 'current-user',
        supplierId: id,
        severity: 'info'
      })
    }

    return result
  }

  public async addSupplierNote(
    supplierId: string,
    noteData: Omit<SupplierNote, 'id'>
  ): Promise<{ success: boolean }> {
    const supplier = await this.getSupplier(supplierId)
    if (!supplier) return { success: false }

    const note: SupplierNote = {
      ...noteData,
      id: this.generateId()
    }

    const result = await this.updateSupplier(supplierId, {
      notes: [...supplier.notes, note]
    })

    return result
  }

  // Supplier performance tracking
  public async recordOrder(
    supplierId: string,
    orderValue: number,
    deliveryDays: number,
    currency: Currency = 'YER'
  ): Promise<{ success: boolean }> {
    const supplier = await this.getSupplier(supplierId)
    if (!supplier) return { success: false }

    // Update order statistics
    const newOrderCount = supplier.totalOrdersCount + 1
    const newTotalValue = supplier.totalOrderValue + orderValue
    const newAverageValue = newTotalValue / newOrderCount
    const newAverageDeliveryTime = (
      (supplier.averageDeliveryTime * supplier.totalOrdersCount) + deliveryDays
    ) / newOrderCount

    const result = await this.updateSupplier(supplierId, {
      totalOrdersCount: newOrderCount,
      totalOrderValue: newTotalValue,
      averageOrderValue: newAverageValue,
      averageDeliveryTime: newAverageDeliveryTime,
      lastOrderDate: new Date()
    })

    return result
  }

  public async togglePreferredStatus(id: string): Promise<{ success: boolean }> {
    const supplier = await this.getSupplier(id)
    if (!supplier) return { success: false }

    const result = await this.updateSupplier(id, {
      isPreferred: !supplier.isPreferred
    })

    return result
  }

  // Search and filtering
  public async searchSuppliers(query: string): Promise<YemeniSupplier[]> {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.suppliers.filter(supplier =>
      supplier.isActive && (
        supplier.businessName.toLowerCase().includes(searchTerm) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm) ||
        supplier.phone.includes(searchTerm) ||
        supplier.supplierCode.toLowerCase().includes(searchTerm) ||
        supplier.address.governorate.includes(searchTerm) ||
        supplier.specialties.some(specialty => specialty.includes(searchTerm)) ||
        supplier.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    )
  }

  public async getSuppliersBySpecialty(specialty: SupplierSpecialty): Promise<YemeniSupplier[]> {
    return this.suppliers.filter(supplier =>
      supplier.isActive &&
      supplier.specialties.includes(specialty)
    ).sort((a, b) => b.overallRating - a.overallRating)
  }

  public async getPreferredSuppliers(): Promise<YemeniSupplier[]> {
    return this.suppliers.filter(supplier =>
      supplier.isActive && supplier.isPreferred
    ).sort((a, b) => b.overallRating - a.overallRating)
  }

  public async getTopSuppliersByRating(limit: number = 10): Promise<YemeniSupplier[]> {
    return this.suppliers
      .filter(supplier => supplier.isActive)
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, limit)
  }

  public async getLocalProducers(): Promise<YemeniSupplier[]> {
    return this.suppliers.filter(supplier =>
      supplier.isActive && supplier.isLocalProducer
    ).sort((a, b) => b.overallRating - a.overallRating)
  }

  // Utility methods
  private generateId(): string {
    return `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateOverallRating(
    quality: number,
    reliability: number,
    price: number,
    delivery: number
  ): number {
    // Weighted average: Quality 30%, Reliability 25%, Delivery 25%, Price 20%
    const weighted = (quality * 0.3) + (reliability * 0.25) + (delivery * 0.25) + (price * 0.20)
    return Math.round(weighted * 10) / 10
  }

  private applyFilters(suppliers: YemeniSupplier[], filter: SupplierFilter): YemeniSupplier[] {
    return suppliers.filter(supplier => {
      if (filter.governorates && !filter.governorates.includes(supplier.address.governorate)) return false
      if (filter.specialties && !filter.specialties.some(s => supplier.specialties.includes(s))) return false
      if (filter.isLocalProducer !== undefined && supplier.isLocalProducer !== filter.isLocalProducer) return false
      if (filter.isPreferred !== undefined && supplier.isPreferred !== filter.isPreferred) return false
      if (filter.minRating && supplier.overallRating < filter.minRating) return false
      if (filter.isActive !== undefined && supplier.isActive !== filter.isActive) return false
      
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const matchesName = supplier.businessName.toLowerCase().includes(searchTerm)
        const matchesContact = supplier.contactPerson.toLowerCase().includes(searchTerm)
        const matchesPhone = supplier.phone.includes(searchTerm)
        if (!matchesName && !matchesContact && !matchesPhone) return false
      }
      
      return true
    })
  }

  private applySorting(suppliers: YemeniSupplier[], sort: SupplierSortOption): YemeniSupplier[] {
    return [...suppliers].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sort.field) {
        case 'businessName':
          aValue = a.businessName
          bValue = b.businessName
          break
        case 'overallRating':
          aValue = a.overallRating
          bValue = b.overallRating
          break
        case 'totalOrderValue':
          aValue = a.totalOrderValue
          bValue = b.totalOrderValue
          break
        case 'lastOrderDate':
          aValue = a.lastOrderDate || new Date(0)
          bValue = b.lastOrderDate || new Date(0)
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

  private calculateStats(suppliers: YemeniSupplier[]): SupplierStats {
    const stats: SupplierStats = {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter(s => s.isActive).length,
      localProducers: suppliers.filter(s => s.isLocalProducer).length,
      halalCertified: suppliers.filter(s => s.isCertifiedHalal).length,
      averageRating: 0,
      byGovernorate: {} as Record<YemeniGovernorate, number>,
      bySpecialty: {} as Record<SupplierSpecialty, number>,
      totalOrderValue: 0,
      currency: 'YER'
    }

    // Initialize counts
    const governorates: YemeniGovernorate[] = [
      'صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'صعدة', 'مأرب',
      'لحج', 'أبين', 'شبوة', 'حضرموت', 'المهرة', 'الجوف', 'ريمة',
      'الضالع', 'البيضاء', 'عمران', 'حجة', 'المحويت'
    ]
    
    const specialties: SupplierSpecialty[] = [
      'لحوم طازجة', 'خضروات وفواكه', 'منتجات ألبان', 'توابل وبهارات',
      'حبوب وبقوليات', 'مشروبات', 'معلبات'
    ]

    governorates.forEach(gov => stats.byGovernorate[gov] = 0)
    specialties.forEach(spec => stats.bySpecialty[spec] = 0)

    // Calculate statistics
    let totalRating = 0
    suppliers.forEach(supplier => {
      // Governorate count
      stats.byGovernorate[supplier.address.governorate]++
      
      // Specialty counts
      supplier.specialties.forEach(specialty => {
        stats.bySpecialty[specialty]++
      })
      
      // Total order value
      stats.totalOrderValue += supplier.totalOrderValue
      
      // Rating calculation
      totalRating += supplier.overallRating
    })

    if (suppliers.length > 0) {
      stats.averageRating = Math.round((totalRating / suppliers.length) * 10) / 10
    }

    return stats
  }

  private initializeMockData(): void {
    // Mock suppliers for Yemeni restaurants
    const mockSuppliers: YemeniSupplier[] = [
      {
        id: 'supplier_001',
        supplierCode: 'SUP-SA-SP-1001',
        businessName: 'مؤسسة التوابل اليمنية',
        contactPerson: 'أحمد محمد الصالح',
        phone: '+967-1-234567',
        email: 'info@yemenspices.ye',
        address: {
          governorate: 'صنعاء',
          district: 'شعوب',
          neighborhood: 'حي الزراعة',
          street: 'شارع الستين',
          buildingNumber: '125',
          nearbyLandmark: 'بجوار سوق الملح'
        },
        specialties: ['توابل وبهارات'],
        productCategories: ['التوابل والبهارات'],
        isLocalProducer: true,
        isCertifiedHalal: true,
        qualityRating: 4.8,
        reliabilityRating: 4.7,
        priceCompetitiveness: 4.5,
        deliveryPerformance: 4.6,
        overallRating: 4.65,
        totalOrdersCount: 156,
        totalOrderValue: 2450000,
        lastOrderDate: new Date('2024-09-15'),
        averageOrderValue: 15705,
        averageDeliveryTime: 2,
        paymentTerms: 'نقدي فوري',
        deliveryTerms: 'تسليم في المطعم',
        minimumOrderValue: 50000,
        isActive: true,
        isPreferred: true,
        notes: [{
          id: 'note_sup_001',
          content: 'مورد موثوق للتوابل اليمنية الأصيلة، جودة ممتازة وأسعار تنافسية',
          noteType: 'general',
          isPrivate: false,
          createdBy: 'مدير المشتريات',
          createdDate: new Date('2024-09-01'),
          priority: 'medium'
        }],
        tags: ['توابل', 'يمني', 'أصلي', 'موثوق'],
        createdDate: new Date('2024-01-15'),
        lastModified: new Date('2024-09-15'),
        createdBy: 'مدير المشتريات',
        lastModifiedBy: 'مدير المشتريات'
      },
      {
        id: 'supplier_002',
        supplierCode: 'SUP-AD-MT-1002',
        businessName: 'مزارع الأبقار والأغنام اليمنية',
        contactPerson: 'سالم عبدالله محمد',
        phone: '+967-2-345678',
        email: 'salem@yemenfarms.ye',
        address: {
          governorate: 'عدن',
          district: 'خور مكسر',
          neighborhood: 'حي المزارع',
          street: 'طريق المطار',
          buildingNumber: '67',
          nearbyLandmark: 'مقابل محطة الوقود'
        },
        specialties: ['لحوم طازجة'],
        productCategories: ['اللحوم والدواجن'],
        isLocalProducer: true,
        isCertifiedHalal: true,
        qualityRating: 4.9,
        reliabilityRating: 4.8,
        priceCompetitiveness: 4.2,
        deliveryPerformance: 4.7,
        overallRating: 4.65,
        totalOrdersCount: 89,
        totalOrderValue: 1890000,
        lastOrderDate: new Date('2024-09-18'),
        averageOrderValue: 21236,
        averageDeliveryTime: 1,
        paymentTerms: 'نقدي فوري',
        deliveryTerms: 'تسليم في المطعم',
        minimumOrderValue: 100000,
        isActive: true,
        isPreferred: true,
        notes: [{
          id: 'note_sup_002',
          content: 'أفضل مورد للحوم الطازجة في عدن، التسليم دائماً في الوقت المحدد',
          noteType: 'quality',
          isPrivate: false,
          createdBy: 'مدير المطعم',
          createdDate: new Date('2024-09-10'),
          priority: 'high'
        }],
        tags: ['لحوم', 'طازجة', 'حلال', 'سريع'],
        createdDate: new Date('2024-02-20'),
        lastModified: new Date('2024-09-18'),
        createdBy: 'مدير المشتريات',
        lastModifiedBy: 'مدير المطعم'
      },
      {
        id: 'supplier_003',
        supplierCode: 'SUP-TZ-VF-1003',
        businessName: 'مزارع الخضار والفواكه التعزية',
        contactPerson: 'فاطمة أحمد الحاج',
        phone: '+967-4-567890',
        email: 'fatima@taizfarms.ye',
        address: {
          governorate: 'تعز',
          district: 'المظفر',
          neighborhood: 'منطقة الحوبان',
          street: 'شارع الجمهورية',
          buildingNumber: '89',
          nearbyLandmark: 'بجوار مستشفى الثورة'
        },
        specialties: ['خضروات وفواكه'],
        productCategories: ['الخضروات', 'الفواكه'],
        isLocalProducer: true,
        isCertifiedHalal: false,
        qualityRating: 4.6,
        reliabilityRating: 4.4,
        priceCompetitiveness: 4.7,
        deliveryPerformance: 4.3,
        overallRating: 4.5,
        totalOrdersCount: 234,
        totalOrderValue: 1560000,
        lastOrderDate: new Date('2024-09-16'),
        averageOrderValue: 6667,
        averageDeliveryTime: 3,
        paymentTerms: 'نقدي خلال أسبوع',
        deliveryTerms: 'تسليم في المخزن',
        minimumOrderValue: 25000,
        isActive: true,
        isPreferred: false,
        notes: [{
          id: 'note_sup_003',
          content: 'جودة الخضار ممتازة خاصة في موسم الصيف، أسعار معقولة',
          noteType: 'general',
          isPrivate: false,
          createdBy: 'مساعد المطبخ',
          createdDate: new Date('2024-08-20'),
          priority: 'medium'
        }],
        tags: ['خضار', 'فواكه', 'طازج', 'موسمي'],
        createdDate: new Date('2024-03-10'),
        lastModified: new Date('2024-09-16'),
        createdBy: 'مدير المشتريات',
        lastModifiedBy: 'مساعد المطبخ'
      }
    ]

    this.suppliers = mockSuppliers
  }
}

// Export singleton instance
export const supplierService = SupplierService.getInstance()
