// Inventory and Supplier Management Types for Yemeni Context
// أنواع بيانات إدارة المخزون والموردين للسياق اليمني

// Basic Yemeni geographical and cultural types
export type YemeniGovernorate = 
  | 'صنعاء' | 'عدن' | 'تعز' | 'الحديدة' | 'إب' 
  | 'ذمار' | 'صعدة' | 'مأرب' | 'لحج' | 'أبين'
  | 'شبوة' | 'حضرموت' | 'المهرة' | 'الجوف' 
  | 'ريمة' | 'الضالع' | 'البيضاء' | 'عمران'
  | 'حجة' | 'المحويت' | 'الحديدة' | 'الجوف'

export type YemeniRegion = 
  | 'الشمال' | 'الجنوب' | 'الشرق' | 'الغرب' | 'الوسط'
  | 'الساحل الغربي' | 'الساحل الجنوبي' | 'المرتفعات الجبلية'
  | 'الصحراء الشرقية' | 'الهضبة الوسطى'

export type YemeniAddress = {
  governorate: YemeniGovernorate
  district: string
  neighborhood?: string
  street?: string
  buildingNumber?: string
  nearbyLandmark?: string
  postalCode?: string
}

// Yemeni measurement units (traditional and modern)
export type YemeniMeasurementUnit = 
  // Traditional Yemeni units
  | 'ثقل' | 'كيلة' | 'وزنة' | 'عدة' | 'ربطة' | 'قدح'
  | 'صاع' | 'مد' | 'غرفة' | 'كيس' | 'علبة' | 'حزمة'
  // Modern metric units
  | 'كيلوغرام' | 'غرام' | 'طن' | 'لتر' | 'مليلتر'
  | 'قطعة' | 'حبة' | 'علبة' | 'كرتونة' | 'كيس'

export type Currency = 'YER' | 'USD' | 'SAR' | 'EUR'

// Product categories specific to Yemeni cuisine and culture
export type YemeniProductCategory = 
  | 'اللحوم والدواجن'      // Meat & Poultry
  | 'منتجات الألبان'      // Dairy Products  
  | 'الخضروات'           // Vegetables
  | 'الفواكه'            // Fruits
  | 'الحبوب والبقوليات'   // Grains & Legumes
  | 'التوابل والبهارات'   // Spices & Herbs
  | 'الزيوت والدهون'     // Oils & Fats
  | 'المشروبات'          // Beverages
  | 'المعلبات والمحفوظات' // Canned & Preserved
  | 'منتجات المخابز'      // Bakery Products

export type YemeniOrigin = 
  | 'محلي يمني'          // Local Yemeni
  | 'مستورد من السعودية' // Imported from Saudi Arabia
  | 'مستورد من الهند'    // Imported from India
  | 'مستورد من الصين'    // Imported from China
  | 'غير محدد'          // Unspecified

export type QualityGrade = 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف'

export type StorageCondition = 
  | 'درجة حرارة الغرفة'  // Room Temperature
  | 'مبرد'             // Refrigerated
  | 'مجمد'             // Frozen
  | 'جاف'              // Dry
  | 'بارد ومظلم'       // Cool & Dark

export type Season = 'الربيع' | 'الصيف' | 'الخريف' | 'الشتاء' | 'طوال العام'

// Warehouse location
export type WarehouseLocation = {
  warehouseId: string
  warehouseName: string
  section: string
  zone?: 'مبرد' | 'مجمد' | 'جاف' | 'خضروات' | 'لحوم'
}

// Core inventory item interface
export interface InventoryItem {
  id: string
  sku: string
  name: string
  nameEnglish?: string
  description?: string
  
  // Categorization
  category: YemeniProductCategory
  subcategory: string
  origin: YemeniOrigin
  
  // Quantity and measurement
  unit: YemeniMeasurementUnit
  currentQuantity: number
  minimumThreshold: number
  maximumCapacity: number
  reorderPoint: number
  reorderQuantity: number
  
  // Pricing
  costPerUnit: number
  sellingPrice: number
  currency: Currency
  
  // Quality and expiration
  expiryDate?: Date
  qualityGrade: QualityGrade
  storageConditions: StorageCondition[]
  isPerishable: boolean
  shelfLifeDays?: number
  
  // Yemeni cultural information
  isTraditionalYemeni: boolean
  regionalSpecialty?: YemeniRegion
  seasonality?: Season[]
  traditionalUses: string[]
  religionCompliant: boolean
  
  // Supplier information
  supplierId?: string
  supplierName?: string
  leadTimeDays: number
  
  // Tracking
  lastRestockDate: Date
  lastCostUpdate: Date
  location: WarehouseLocation
  
  // Status
  isActive: boolean
  requiresRefrigeration: boolean
  
  // Audit trail
  createdDate: Date
  lastModified: Date
  createdBy: string
  lastModifiedBy: string
  
  // Additional
  images: string[]
  notes: InventoryNote[]
  tags: string[]
}

export interface InventoryNote {
  id: string
  content: string
  noteType: 'general' | 'quality' | 'supplier' | 'storage' | 'alert'
  isPrivate: boolean
  createdBy: string
  createdDate: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// Supplier management types
export type SupplierSpecialty = 
  | 'لحوم طازجة'         // Fresh Meat
  | 'خضروات وفواكه'      // Vegetables & Fruits
  | 'منتجات ألبان'       // Dairy Products
  | 'توابل وبهارات'      // Spices & Herbs
  | 'حبوب وبقوليات'      // Grains & Legumes
  | 'مشروبات'           // Beverages
  | 'معلبات'            // Canned Goods

export type PaymentTerms = 
  | 'نقدي فوري'          // Cash on delivery
  | 'نقدي خلال أسبوع'    // Cash within a week
  | 'نقدي خلال شهر'      // Cash within a month
  | 'دفع مؤجل 30 يوم'    // 30 days credit

export type DeliveryTerms = 
  | 'تسليم في المخزن'    // Warehouse delivery
  | 'تسليم في المطعم'    // Restaurant delivery
  | 'استلام من المورد'   // Pickup from supplier

export type YemeniPaymentMethod = 
  | 'نقدي'              // Cash
  | 'شيك'               // Check
  | 'تحويل بنكي'         // Bank transfer

export interface YemeniSupplier {
  id: string
  supplierCode: string
  businessName: string
  contactPerson: string
  phone: string
  email?: string
  address: YemeniAddress
  
  // Business information
  specialties: SupplierSpecialty[]
  productCategories: YemeniProductCategory[]
  isLocalProducer: boolean
  isCertifiedHalal: boolean
  
  // Performance metrics
  qualityRating: number
  reliabilityRating: number
  priceCompetitiveness: number
  deliveryPerformance: number
  overallRating: number
  
  // Business metrics
  totalOrdersCount: number
  totalOrderValue: number
  lastOrderDate?: Date
  averageOrderValue: number
  averageDeliveryTime: number
  
  // Commercial terms
  paymentTerms: PaymentTerms
  deliveryTerms: DeliveryTerms
  minimumOrderValue?: number
  
  // Status
  isActive: boolean
  isPreferred: boolean
  
  // Audit trail
  createdDate: Date
  lastModified: Date
  createdBy: string
  lastModifiedBy: string
  
  // Additional
  notes: SupplierNote[]
  tags: string[]
}

export interface SupplierNote {
  id: string
  content: string
  noteType: 'general' | 'quality' | 'delivery' | 'payment' | 'alert'
  isPrivate: boolean
  createdBy: string
  createdDate: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// Supply order management types
export type SupplyOrderStatus = 
  | 'draft'              // مسودة
  | 'pending_approval'   // في انتظار الموافقة
  | 'approved'           // معتمد
  | 'sent_to_supplier'   // مرسل للمورد
  | 'confirmed'          // مؤكد من المورد
  | 'in_preparation'     // قيد التحضير
  | 'delivered'          // تم التسليم
  | 'completed'          // مكتمل
  | 'cancelled'          // ملغي

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type PaymentStatus = 
  | 'pending'       // في انتظار الدفع
  | 'partial'       // دفع جزئي
  | 'paid'          // مدفوع
  | 'overdue'       // متأخر

export interface SupplyOrderItem {
  id: string
  inventoryItemId: string
  inventoryItemName: string
  requestedQuantity: number
  confirmedQuantity?: number
  unit: YemeniMeasurementUnit
  unitPrice: number
  totalPrice: number
  currency: Currency
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  notes?: string
}

export interface OrderApproval {
  id: string
  approverId: string
  approverName: string
  status: 'pending' | 'approved' | 'rejected'
  approvalDate?: Date
  comments?: string
  level: number
}

export interface SupplyOrder {
  id: string
  orderNumber: string
  restaurantId: string
  restaurantName: string
  supplierId: string
  supplierName: string
  
  status: SupplyOrderStatus
  priority: Priority
  orderType: 'regular' | 'urgent' | 'seasonal'
  
  items: SupplyOrderItem[]
  totalItems: number
  totalCost: number
  currency: Currency
  
  // Dates
  orderDate: Date
  requestedDeliveryDate: Date
  confirmedDeliveryDate?: Date
  actualDeliveryDate?: Date
  
  // Approval
  approvals: OrderApproval[]
  requiresApproval: boolean
  
  // Delivery
  deliveryAddress: YemeniAddress
  deliveryInstructions?: string
  receivedBy?: string
  
  // Financial
  paymentStatus: PaymentStatus
  paymentMethod: YemeniPaymentMethod
  paymentTerms: PaymentTerms
  
  // Audit trail
  createdDate: Date
  lastModified: Date
  createdBy: string
  lastModifiedBy: string
  
  notes: OrderNote[]
}

export interface OrderNote {
  id: string
  content: string
  noteType: 'general' | 'delivery' | 'quality' | 'payment'
  isInternal: boolean
  createdBy: string
  createdDate: Date
}

// Filter and statistics types
export interface InventoryFilter {
  categories?: YemeniProductCategory[]
  origins?: YemeniOrigin[]
  suppliers?: string[]
  lowStock?: boolean
  expiringSoon?: boolean
  traditionalYemeni?: boolean
  searchTerm?: string
  isActive?: boolean
}

export interface SupplierFilter {
  governorates?: YemeniGovernorate[]
  specialties?: SupplierSpecialty[]
  isLocalProducer?: boolean
  isPreferred?: boolean
  minRating?: number
  searchTerm?: string
  isActive?: boolean
}

export interface SupplyOrderFilter {
  statuses?: SupplyOrderStatus[]
  suppliers?: string[]
  priorities?: Priority[]
  paymentStatuses?: PaymentStatus[]
  dateRange?: {
    start: Date
    end: Date
  }
  searchTerm?: string
  pendingApproval?: boolean
}

// Sorting options
export interface InventorySortOption {
  field: 'name' | 'quantity' | 'costPerUnit' | 'lastRestockDate' | 'expiryDate'
  direction: 'asc' | 'desc'
}

export interface SupplierSortOption {
  field: 'businessName' | 'overallRating' | 'totalOrderValue' | 'lastOrderDate'
  direction: 'asc' | 'desc'
}

export interface SupplyOrderSortOption {
  field: 'orderNumber' | 'orderDate' | 'totalAmount' | 'deliveryDate' | 'status'
  direction: 'asc' | 'desc'
}

// Statistics types
export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  expiringSoonItems: number
  traditionalYemeniItems: number
  byCategory: Record<YemeniProductCategory, number>
  byOrigin: Record<YemeniOrigin, number>
  currency: Currency
}

export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  localProducers: number
  halalCertified: number
  averageRating: number
  byGovernorate: Record<YemeniGovernorate, number>
  bySpecialty: Record<SupplierSpecialty, number>
  totalOrderValue: number
  currency: Currency
}

export interface SupplyOrderStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  byStatus: Record<SupplyOrderStatus, number>
  byPriority: Record<Priority, number>
  averageOrderValue: number
  totalOrderValue: number
  currency: Currency
}

// Event types
export interface InventoryEvent {
  type: 'item_added' | 'item_updated' | 'stock_low' | 'expiry_alert'
  payload: any
  timestamp: Date
  triggeredBy: string
  itemId?: string
  severity?: 'info' | 'warning' | 'error'
}

export interface SupplierEvent {
  type: 'supplier_added' | 'supplier_updated' | 'rating_changed'
  payload: any
  timestamp: Date
  triggeredBy: string
  supplierId?: string
  severity?: 'info' | 'warning' | 'error'
}

export interface SupplyOrderEvent {
  type: 'order_created' | 'order_approved' | 'order_delivered' | 'order_cancelled'
  payload: any
  timestamp: Date
  triggeredBy: string
  orderId?: string
  severity?: 'info' | 'warning' | 'error'
}

// Form data types
export interface InventoryItemFormData {
  basic: {
    name: string
    category: YemeniProductCategory
    subcategory: string
    origin: YemeniOrigin
  }
  measurement: {
    unit: YemeniMeasurementUnit
    minimumThreshold: number
    reorderPoint: number
  }
  pricing: {
    costPerUnit: number
    sellingPrice: number
    currency: Currency
  }
  quality: {
    qualityGrade: QualityGrade
    storageConditions: StorageCondition[]
    isPerishable: boolean
    expiryDate?: Date
  }
  cultural: {
    isTraditionalYemeni: boolean
    traditionalUses: string[]
    religionCompliant: boolean
  }
  supplier?: {
    supplierId: string
    leadTimeDays: number
  }
  storage: {
    location: WarehouseLocation
    requiresRefrigeration: boolean
  }
  notes?: string
  tags?: string[]
}
