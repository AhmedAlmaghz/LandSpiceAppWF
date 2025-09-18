// Inventory Management Service for Yemeni Context
// خدمة إدارة المخزون للسياق اليمني

import {
  InventoryItem,
  InventoryItemFormData,
  InventoryFilter,
  InventorySortOption,
  InventoryStats,
  InventoryEvent,
  YemeniProductCategory,
  YemeniOrigin,
  QualityGrade,
  StorageCondition,
  YemeniMeasurementUnit,
  WarehouseLocation,
  InventoryNote,
  Currency,
  YemeniRegion,
  Season
} from './types'

import {
  validateInventoryItem,
  validateInventoryItemForm,
  generateInventorySKU,
  isLowStock,
  isExpiringSoon,
  isExpired,
  calculateReorderPoint
} from './validation'

export class InventoryService {
  private static instance: InventoryService
  private items: InventoryItem[] = []
  private eventListeners: ((event: InventoryEvent) => void)[] = []

  private constructor() {
    this.initializeMockData()
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService()
    }
    return InventoryService.instance
  }

  // Event System
  public addEventListener(listener: (event: InventoryEvent) => void): void {
    this.eventListeners.push(listener)
  }

  public removeEventListener(listener: (event: InventoryEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private emitEvent(event: InventoryEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  // CRUD Operations
  public async createInventoryItem(formData: InventoryItemFormData): Promise<{
    success: boolean
    item?: InventoryItem
    errors?: any[]
  }> {
    try {
      const validation = validateInventoryItemForm(formData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const sku = generateInventorySKU(formData.basic.category, formData.basic.origin)
      
      const item: InventoryItem = {
        id: this.generateId(),
        sku,
        name: formData.basic.name,
        nameEnglish: formData.basic.nameEnglish,
        description: formData.basic.description,
        
        category: formData.basic.category,
        subcategory: formData.basic.subcategory,
        origin: formData.basic.origin,
        
        unit: formData.measurement.unit,
        currentQuantity: 0, // Start with zero quantity
        minimumThreshold: formData.measurement.minimumThreshold,
        maximumCapacity: formData.measurement.maximumCapacity || 1000,
        reorderPoint: formData.measurement.reorderPoint,
        reorderQuantity: formData.measurement.reorderQuantity || formData.measurement.minimumThreshold * 2,
        
        costPerUnit: formData.pricing.costPerUnit,
        sellingPrice: formData.pricing.sellingPrice,
        currency: formData.pricing.currency,
        
        expiryDate: formData.quality.expiryDate,
        qualityGrade: formData.quality.qualityGrade,
        storageConditions: formData.quality.storageConditions,
        isPerishable: formData.quality.isPerishable,
        shelfLifeDays: formData.quality.shelfLifeDays,
        
        isTraditionalYemeni: formData.cultural.isTraditionalYemeni,
        regionalSpecialty: formData.cultural.regionalSpecialty,
        seasonality: formData.cultural.seasonality,
        traditionalUses: formData.cultural.traditionalUses,
        religionCompliant: formData.cultural.religionCompliant,
        
        supplierId: formData.supplier?.supplierId,
        supplierName: formData.supplier?.supplierName,
        leadTimeDays: formData.supplier?.leadTimeDays || 7,
        
        lastRestockDate: new Date(),
        lastCostUpdate: new Date(),
        location: formData.storage.location,
        
        isActive: true,
        requiresRefrigeration: formData.storage.requiresRefrigeration,
        
        images: [],
        notes: formData.notes ? [{
          id: this.generateId(),
          content: formData.notes,
          noteType: 'general',
          isPrivate: false,
          createdBy: 'current-user',
          createdDate: new Date(),
          priority: 'medium'
        }] : [],
        tags: formData.tags || [],
        
        createdDate: new Date(),
        lastModified: new Date(),
        createdBy: 'current-user',
        lastModifiedBy: 'current-user'
      }

      this.items.push(item)
      this.emitEvent({
        type: 'item_added',
        payload: item,
        timestamp: new Date(),
        triggeredBy: 'current-user',
        itemId: item.id,
        severity: 'info'
      })

      return { success: true, item }
    } catch (error) {
      console.error('Error creating inventory item:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'حدث خطأ أثناء إنشاء العنصر' }]
      }
    }
  }

  public async getInventoryItem(id: string): Promise<InventoryItem | null> {
    return this.items.find(item => item.id === id && item.isActive) || null
  }

  public async getInventoryItems(
    filter: InventoryFilter = {},
    sort: InventorySortOption = { field: 'name', direction: 'asc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    items: InventoryItem[]
    total: number
    page: number
    limit: number
    stats: InventoryStats
  }> {
    let filteredItems = this.applyFilters(this.items, filter)
    filteredItems = this.applySorting(filteredItems, sort)
    
    const stats = this.calculateStats(filteredItems)
    
    const total = filteredItems.length
    const startIndex = (page - 1) * limit
    const paginatedItems = filteredItems.slice(startIndex, startIndex + limit)

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      stats
    }
  }

  public async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<{
    success: boolean
    item?: InventoryItem
    errors?: any[]
  }> {
    try {
      const itemIndex = this.items.findIndex(item => item.id === id)
      if (itemIndex === -1) {
        return {
          success: false,
          errors: [{ field: 'general', message: 'العنصر غير موجود' }]
        }
      }

      const currentItem = this.items[itemIndex]
      const updatedItem = {
        ...currentItem,
        ...updates,
        lastModified: new Date(),
        lastModifiedBy: 'current-user'
      }

      const validation = validateInventoryItem(updatedItem)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      this.items[itemIndex] = updatedItem
      this.emitEvent({
        type: 'item_updated',
        payload: { id, changes: updates },
        timestamp: new Date(),
        triggeredBy: 'current-user',
        itemId: id,
        severity: 'info'
      })

      return { success: true, item: updatedItem }
    } catch (error) {
      console.error('Error updating inventory item:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'حدث خطأ أثناء تحديث العنصر' }]
      }
    }
  }

  public async updateStock(
    id: string,
    newQuantity: number,
    reason?: string
  ): Promise<{ success: boolean; item?: InventoryItem }> {
    const item = await this.getInventoryItem(id)
    if (!item) {
      return { success: false }
    }

    const oldQuantity = item.currentQuantity
    
    const result = await this.updateInventoryItem(id, {
      currentQuantity: newQuantity,
      lastRestockDate: newQuantity > oldQuantity ? new Date() : item.lastRestockDate
    })

    if (result.success && result.item) {
      // Check for low stock alert
      if (isLowStock(newQuantity, item.minimumThreshold, item.reorderPoint)) {
        this.emitEvent({
          type: 'stock_low',
          payload: { 
            itemId: id, 
            itemName: item.name,
            currentQuantity: newQuantity,
            threshold: item.reorderPoint || item.minimumThreshold
          },
          timestamp: new Date(),
          triggeredBy: 'system',
          itemId: id,
          severity: 'warning'
        })
      }

      // Add note for stock change if reason provided
      if (reason) {
        await this.addNote(id, {
          content: `تغيير المخزون من ${oldQuantity} إلى ${newQuantity}. السبب: ${reason}`,
          noteType: 'general',
          isPrivate: false,
          createdBy: 'current-user',
          createdDate: new Date(),
          priority: 'medium'
        })
      }
    }

    return result
  }

  public async addNote(
    itemId: string,
    noteData: Omit<InventoryNote, 'id'>
  ): Promise<{ success: boolean }> {
    const item = await this.getInventoryItem(itemId)
    if (!item) return { success: false }

    const note: InventoryNote = {
      ...noteData,
      id: this.generateId()
    }

    const result = await this.updateInventoryItem(itemId, {
      notes: [...item.notes, note]
    })

    return result
  }

  // Stock management operations
  public async adjustStock(
    itemId: string,
    adjustmentQuantity: number,
    reason: string,
    adjustmentType: 'increase' | 'decrease'
  ): Promise<{ success: boolean; newQuantity?: number }> {
    const item = await this.getInventoryItem(itemId)
    if (!item) return { success: false }

    const newQuantity = adjustmentType === 'increase' 
      ? item.currentQuantity + Math.abs(adjustmentQuantity)
      : Math.max(0, item.currentQuantity - Math.abs(adjustmentQuantity))

    const result = await this.updateStock(itemId, newQuantity, reason)
    
    return {
      success: result.success,
      newQuantity: result.success ? newQuantity : undefined
    }
  }

  public async reserveStock(
    itemId: string,
    quantity: number,
    reason: string
  ): Promise<{ success: boolean; message?: string }> {
    const item = await this.getInventoryItem(itemId)
    if (!item) {
      return { success: false, message: 'العنصر غير موجود' }
    }

    if (item.currentQuantity < quantity) {
      return { 
        success: false, 
        message: `الكمية المتاحة (${item.currentQuantity}) أقل من المطلوبة (${quantity})` 
      }
    }

    const result = await this.adjustStock(itemId, quantity, reason, 'decrease')
    return {
      success: result.success,
      message: result.success ? 'تم حجز المخزون بنجاح' : 'فشل في حجز المخزون'
    }
  }

  // Alert and notification system
  public async checkStockAlerts(): Promise<{
    lowStockItems: InventoryItem[]
    expiringSoonItems: InventoryItem[]
    expiredItems: InventoryItem[]
  }> {
    const activeItems = this.items.filter(item => item.isActive)
    
    const lowStockItems = activeItems.filter(item => 
      isLowStock(item.currentQuantity, item.minimumThreshold, item.reorderPoint)
    )
    
    const expiringSoonItems = activeItems.filter(item => 
      item.expiryDate && isExpiringSoon(item.expiryDate, 7)
    )
    
    const expiredItems = activeItems.filter(item => 
      item.expiryDate && isExpired(item.expiryDate)
    )

    // Emit alerts for critical items
    lowStockItems.forEach(item => {
      this.emitEvent({
        type: 'stock_low',
        payload: item,
        timestamp: new Date(),
        triggeredBy: 'system',
        itemId: item.id,
        severity: 'warning'
      })
    })

    expiringSoonItems.forEach(item => {
      this.emitEvent({
        type: 'expiry_alert',
        payload: item,
        timestamp: new Date(),
        triggeredBy: 'system',
        itemId: item.id,
        severity: 'warning'
      })
    })

    expiredItems.forEach(item => {
      this.emitEvent({
        type: 'expiry_alert',
        payload: item,
        timestamp: new Date(),
        triggeredBy: 'system',
        itemId: item.id,
        severity: 'error'
      })
    })

    return {
      lowStockItems,
      expiringSoonItems,
      expiredItems
    }
  }

  // Search functionality
  public async searchItems(query: string): Promise<InventoryItem[]> {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.items.filter(item =>
      item.isActive && (
        item.name.toLowerCase().includes(searchTerm) ||
        item.nameEnglish?.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm) ||
        item.subcategory.toLowerCase().includes(searchTerm) ||
        item.supplierName?.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        item.traditionalUses.some(use => use.toLowerCase().includes(searchTerm))
      )
    )
  }

  // Utility methods
  private generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private applyFilters(items: InventoryItem[], filter: InventoryFilter): InventoryItem[] {
    return items.filter(item => {
      if (filter.categories && !filter.categories.includes(item.category)) return false
      if (filter.origins && !filter.origins.includes(item.origin)) return false
      if (filter.suppliers && item.supplierId && !filter.suppliers.includes(item.supplierId)) return false
      if (filter.lowStock && !isLowStock(item.currentQuantity, item.minimumThreshold, item.reorderPoint)) return false
      if (filter.expiringSoon && (!item.expiryDate || !isExpiringSoon(item.expiryDate, 7))) return false
      if (filter.traditionalYemeni !== undefined && item.isTraditionalYemeni !== filter.traditionalYemeni) return false
      if (filter.isActive !== undefined && item.isActive !== filter.isActive) return false
      
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(searchTerm)
        const matchesSKU = item.sku.toLowerCase().includes(searchTerm)
        const matchesSupplier = item.supplierName?.toLowerCase().includes(searchTerm) || false
        if (!matchesName && !matchesSKU && !matchesSupplier) return false
      }
      
      return true
    })
  }

  private applySorting(items: InventoryItem[], sort: InventorySortOption): InventoryItem[] {
    return [...items].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sort.field) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'quantity':
          aValue = a.currentQuantity
          bValue = b.currentQuantity
          break
        case 'costPerUnit':
          aValue = a.costPerUnit
          bValue = b.costPerUnit
          break
        case 'lastRestockDate':
          aValue = a.lastRestockDate
          bValue = b.lastRestockDate
          break
        case 'expiryDate':
          aValue = a.expiryDate || new Date('9999-12-31')
          bValue = b.expiryDate || new Date('9999-12-31')
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

  private calculateStats(items: InventoryItem[]): InventoryStats {
    const stats: InventoryStats = {
      totalItems: items.length,
      totalValue: 0,
      lowStockItems: 0,
      expiringSoonItems: 0,
      traditionalYemeniItems: 0,
      byCategory: {} as Record<YemeniProductCategory, number>,
      byOrigin: {} as Record<YemeniOrigin, number>,
      currency: 'YER'
    }

    // Initialize category and origin counts
    const categories: YemeniProductCategory[] = [
      'اللحوم والدواجن', 'منتجات الألبان', 'الخضروات', 'الفواكه',
      'الحبوب والبقوليات', 'التوابل والبهارات', 'الزيوت والدهون',
      'المشروبات', 'المعلبات والمحفوظات', 'منتجات المخابز'
    ]
    
    const origins: YemeniOrigin[] = [
      'محلي يمني', 'مستورد من السعودية', 'مستورد من الهند',
      'مستورد من الصين', 'غير محدد'
    ]

    categories.forEach(cat => stats.byCategory[cat] = 0)
    origins.forEach(origin => stats.byOrigin[origin] = 0)

    // Calculate statistics
    items.forEach(item => {
      // Total value calculation
      stats.totalValue += item.currentQuantity * item.costPerUnit

      // Category and origin counts
      stats.byCategory[item.category]++
      stats.byOrigin[item.origin]++

      // Special condition counts
      if (isLowStock(item.currentQuantity, item.minimumThreshold, item.reorderPoint)) {
        stats.lowStockItems++
      }

      if (item.expiryDate && isExpiringSoon(item.expiryDate, 7)) {
        stats.expiringSoonItems++
      }

      if (item.isTraditionalYemeni) {
        stats.traditionalYemeniItems++
      }
    })

    return stats
  }

  private initializeMockData(): void {
    // Mock inventory items for Yemeni restaurants
    const mockItems: InventoryItem[] = [
      {
        id: 'inv_001',
        sku: 'SP-YE-156789-001',
        name: 'هيل يمني أصلي',
        nameEnglish: 'Authentic Yemeni Cardamom',
        description: 'هيل يمني من أجود الأنواع، مصدره الأصلي من مناطق الحديدة',
        
        category: 'التوابل والبهارات',
        subcategory: 'توابل عطرية',
        origin: 'محلي يمني',
        
        unit: 'كيلوغرام',
        currentQuantity: 15,
        minimumThreshold: 5,
        maximumCapacity: 50,
        reorderPoint: 8,
        reorderQuantity: 20,
        
        costPerUnit: 45000,
        sellingPrice: 55000,
        currency: 'YER',
        
        expiryDate: new Date('2025-06-15'),
        qualityGrade: 'ممتاز',
        storageConditions: ['جاف', 'بارد ومظلم'],
        isPerishable: false,
        shelfLifeDays: 365,
        
        isTraditionalYemeni: true,
        regionalSpecialty: 'الساحل الغربي',
        seasonality: ['طوال العام'],
        traditionalUses: ['الشاي اليمني', 'القهوة العربية', 'طبخ الأرز'],
        religionCompliant: true,
        
        supplierId: 'supplier_001',
        supplierName: 'مؤسسة التوابل اليمنية',
        leadTimeDays: 3,
        
        lastRestockDate: new Date('2024-09-01'),
        lastCostUpdate: new Date('2024-08-15'),
        location: {
          warehouseId: 'wh_001',
          warehouseName: 'المخزن الرئيسي',
          section: 'التوابل',
          zone: 'جاف'
        },
        
        isActive: true,
        requiresRefrigeration: false,
        
        images: ['/mock/cardamom.jpg'],
        notes: [{
          id: 'note_001',
          content: 'جودة ممتازة، يفضل البيع سريعاً للحفاظ على النكهة',
          noteType: 'quality',
          isPrivate: false,
          createdBy: 'مدير المخزن',
          createdDate: new Date('2024-09-01'),
          priority: 'medium'
        }],
        tags: ['يمني', 'أصلي', 'عطري', 'جودة عالية'],
        
        createdDate: new Date('2024-08-15'),
        lastModified: new Date('2024-09-01'),
        createdBy: 'مدير المخزن',
        lastModifiedBy: 'مدير المخزن'
      },
      {
        id: 'inv_002',
        sku: 'MT-YE-156790-002',
        name: 'لحم ضأن طازج',
        nameEnglish: 'Fresh Lamb Meat',
        description: 'لحم ضأن طازج من المراعي اليمنية المحلية',
        
        category: 'اللحوم والدواجن',
        subcategory: 'لحم ضأن',
        origin: 'محلي يمني',
        
        unit: 'كيلوغرام',
        currentQuantity: 25,
        minimumThreshold: 10,
        maximumCapacity: 100,
        reorderPoint: 15,
        reorderQuantity: 50,
        
        costPerUnit: 8500,
        sellingPrice: 10000,
        currency: 'YER',
        
        expiryDate: new Date('2024-09-25'),
        qualityGrade: 'ممتاز',
        storageConditions: ['مبرد'],
        isPerishable: true,
        shelfLifeDays: 7,
        
        isTraditionalYemeni: true,
        regionalSpecialty: 'المرتفعات الجبلية',
        seasonality: ['طوال العام'],
        traditionalUses: ['الزربيان', 'المندي', 'الحنيذ'],
        religionCompliant: true,
        
        supplierId: 'supplier_002',
        supplierName: 'مزارع الأبقار والأغنام اليمنية',
        leadTimeDays: 1,
        
        lastRestockDate: new Date('2024-09-18'),
        lastCostUpdate: new Date('2024-09-15'),
        location: {
          warehouseId: 'wh_001',
          warehouseName: 'المخزن الرئيسي',
          section: 'اللحوم',
          zone: 'مبرد'
        },
        
        isActive: true,
        requiresRefrigeration: true,
        
        images: ['/mock/lamb.jpg'],
        notes: [{
          id: 'note_002',
          content: 'تحديث: وصلت شحنة جديدة صباح اليوم، جودة ممتازة',
          noteType: 'general',
          isPrivate: false,
          createdBy: 'مدير المخزن',
          createdDate: new Date('2024-09-18'),
          priority: 'medium'
        }],
        tags: ['طازج', 'حلال', 'محلي', 'جودة عالية'],
        
        createdDate: new Date('2024-09-10'),
        lastModified: new Date('2024-09-18'),
        createdBy: 'مدير المخزن',
        lastModifiedBy: 'مدير المخزن'
      }
    ]

    this.items = mockItems
  }
}

// Export singleton instance
export const inventoryService = InventoryService.getInstance()
