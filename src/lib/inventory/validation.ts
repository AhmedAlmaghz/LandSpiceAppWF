// Inventory and Supplier Validation for Yemeni Context
// نظام التحقق من بيانات المخزون والموردين للسياق اليمني

import { z } from 'zod'
import {
  YemeniGovernorate,
  YemeniMeasurementUnit,
  YemeniProductCategory,
  YemeniOrigin,
  QualityGrade,
  StorageCondition,
  SupplierSpecialty,
  PaymentTerms,
  YemeniPaymentMethod,
  Currency,
  InventoryItem,
  YemeniSupplier,
  SupplyOrder,
  InventoryItemFormData
} from './types'

// Yemeni phone number validation
export const validateYemeniPhoneNumber = (phone: string): boolean => {
  const yemeniPhoneRegex = /^(\+?967|0)?[17][0-9]{7}$/
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  return yemeniPhoneRegex.test(cleanPhone)
}

// Generate unique SKU for inventory items
export const generateInventorySKU = (
  category: YemeniProductCategory,
  origin: YemeniOrigin,
  sequence?: number
): string => {
  const categoryPrefixes: Record<YemeniProductCategory, string> = {
    'اللحوم والدواجن': 'MT',
    'منتجات الألبان': 'DR',
    'الخضروات': 'VG',
    'الفواكه': 'FR',
    'الحبوب والبقوليات': 'GR',
    'التوابل والبهارات': 'SP',
    'الزيوت والدهون': 'OL',
    'المشروبات': 'BV',
    'المعلبات والمحفوظات': 'CN',
    'منتجات المخابز': 'BK'
  }
  
  const originPrefixes: Record<YemeniOrigin, string> = {
    'محلي يمني': 'YE',
    'مستورد من السعودية': 'SA',
    'مستورد من الهند': 'IN',
    'مستورد من الصين': 'CN',
    'غير محدد': 'XX'
  }
  
  const categoryPrefix = categoryPrefixes[category] || 'XX'
  const originPrefix = originPrefixes[origin] || 'XX'
  const timestamp = Date.now().toString().slice(-6)
  const seq = sequence ? sequence.toString().padStart(3, '0') : Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `${categoryPrefix}-${originPrefix}-${timestamp}-${seq}`
}

// Generate supplier code
export const generateSupplierCode = (
  governorate: YemeniGovernorate,
  specialty: SupplierSpecialty,
  sequence?: number
): string => {
  const governoratePrefixes: Record<YemeniGovernorate, string> = {
    'صنعاء': 'SA', 'عدن': 'AD', 'تعز': 'TZ', 'الحديدة': 'HD', 'إب': 'IB',
    'ذمار': 'DH', 'صعدة': 'SD', 'مأرب': 'MA', 'لحج': 'LH', 'أبين': 'AB',
    'شبوة': 'SH', 'حضرموت': 'HA', 'المهرة': 'MH', 'الجوف': 'JO',
    'ريمة': 'RI', 'الضالع': 'DA', 'البيضاء': 'BA', 'عمران': 'AM',
    'حجة': 'HJ', 'المحويت': 'MC'
  }
  
  const specialtyPrefixes: Record<SupplierSpecialty, string> = {
    'لحوم طازجة': 'MT',
    'خضروات وفواكه': 'VF',
    'منتجات ألبان': 'DR',
    'توابل وبهارات': 'SP',
    'حبوب وبقوليات': 'GR',
    'مشروبات': 'BV',
    'معلبات': 'CN'
  }
  
  const govPrefix = governoratePrefixes[governorate] || 'XX'
  const specPrefix = specialtyPrefixes[specialty] || 'XX'
  const seq = sequence ? sequence.toString().padStart(4, '0') : Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `SUP-${govPrefix}-${specPrefix}-${seq}`
}

// Generate supply order number
export const generateSupplyOrderNumber = (
  supplierId: string,
  orderDate: Date = new Date()
): string => {
  const year = orderDate.getFullYear()
  const month = (orderDate.getMonth() + 1).toString().padStart(2, '0')
  const day = orderDate.getDate().toString().padStart(2, '0')
  const supplierPrefix = supplierId.slice(-4).toUpperCase()
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `SO-${year}${month}${day}-${supplierPrefix}-${sequence}`
}

// Calculate reorder points based on consumption patterns
export const calculateReorderPoint = (
  averageDailyConsumption: number,
  leadTimeDays: number,
  safetyStockDays: number = 7
): number => {
  return Math.ceil(averageDailyConsumption * (leadTimeDays + safetyStockDays))
}

// Validate expiry date based on product type
export const validateExpiryDate = (
  expiryDate: Date,
  category: YemeniProductCategory,
  isPerishable: boolean
): { isValid: boolean; message?: string } => {
  const today = new Date()
  const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (expiryDate <= today) {
    return { isValid: false, message: 'تاريخ الانتهاء يجب أن يكون في المستقبل' }
  }
  
  if (isPerishable) {
    const perishableCategories: YemeniProductCategory[] = [
      'اللحوم والدواجن',
      'منتجات الألبان',
      'الخضروات',
      'الفواكه'
    ]
    
    if (perishableCategories.includes(category)) {
      if (daysDifference > 365) {
        return { isValid: false, message: 'المنتجات سريعة التلف لا يمكن أن تكون صالحة لأكثر من سنة' }
      }
    }
  }
  
  return { isValid: true }
}

// Validate storage conditions compatibility
export const validateStorageConditions = (
  conditions: StorageCondition[],
  category: YemeniProductCategory
): { isValid: boolean; message?: string } => {
  const categoryRequirements: Record<YemeniProductCategory, StorageCondition[]> = {
    'اللحوم والدواجن': ['مبرد', 'مجمد'],
    'منتجات الألبان': ['مبرد'],
    'الخضروات': ['مبرد', 'درجة حرارة الغرفة', 'بارد ومظلم'],
    'الفواكه': ['مبرد', 'درجة حرارة الغرفة', 'بارد ومظلم'],
    'الحبوب والبقوليات': ['جاف', 'بارد ومظلم'],
    'التوابل والبهارات': ['جاف', 'بارد ومظلم'],
    'الزيوت والدهون': ['درجة حرارة الغرفة', 'بارد ومظلم'],
    'المشروبات': ['درجة حرارة الغرفة', 'مبرد'],
    'المعلبات والمحفوظات': ['درجة حرارة الغرفة', 'جاف'],
    'منتجات المخابز': ['درجة حرارة الغرفة', 'جاف']
  }
  
  const requiredConditions = categoryRequirements[category] || []
  const hasRequiredCondition = conditions.some(condition => requiredConditions.includes(condition))
  
  if (requiredConditions.length > 0 && !hasRequiredCondition) {
    return {
      isValid: false,
      message: `يجب أن تتضمن ظروف التخزين إحدى الخيارات التالية: ${requiredConditions.join(', ')}`
    }
  }
  
  return { isValid: true }
}

// Validate pricing logic
export const validatePricing = (
  costPerUnit: number,
  sellingPrice: number,
  currency: Currency
): { isValid: boolean; message?: string; marginPercentage?: number } => {
  if (costPerUnit <= 0) {
    return { isValid: false, message: 'تكلفة الوحدة يجب أن تكون أكبر من صفر' }
  }
  
  if (sellingPrice <= 0) {
    return { isValid: false, message: 'سعر البيع يجب أن يكون أكبر من صفر' }
  }
  
  if (sellingPrice < costPerUnit) {
    return { isValid: false, message: 'سعر البيع لا يمكن أن يكون أقل من التكلفة' }
  }
  
  const marginPercentage = ((sellingPrice - costPerUnit) / costPerUnit) * 100
  
  if (marginPercentage < 5) {
    return {
      isValid: true,
      message: 'تحذير: هامش الربح منخفض جداً (أقل من 5%)',
      marginPercentage
    }
  }
  
  return { isValid: true, marginPercentage }
}

// Check if item is low in stock
export const isLowStock = (
  currentQuantity: number,
  minimumThreshold: number,
  reorderPoint?: number
): boolean => {
  const threshold = reorderPoint || minimumThreshold
  return currentQuantity <= threshold
}

// Check if item is expiring soon
export const isExpiringSoon = (
  expiryDate: Date,
  warningDays: number = 7
): boolean => {
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= warningDays && daysUntilExpiry > 0
}

// Check if item has expired
export const isExpired = (expiryDate: Date): boolean => {
  return expiryDate <= new Date()
}

// Zod validation schemas
export const YemeniAddressSchema = z.object({
  governorate: z.enum([
    'صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'صعدة', 'مأرب',
    'لحج', 'أبين', 'شبوة', 'حضرموت', 'المهرة', 'الجوف', 'ريمة',
    'الضالع', 'البيضاء', 'عمران', 'حجة', 'المحويت'
  ]),
  district: z.string().min(1, 'المديرية مطلوبة'),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  buildingNumber: z.string().optional(),
  nearbyLandmark: z.string().optional(),
  postalCode: z.string().optional()
})

export const InventoryItemSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  nameEnglish: z.string().optional(),
  category: z.enum([
    'اللحوم والدواجن', 'منتجات الألبان', 'الخضروات', 'الفواكه',
    'الحبوب والبقوليات', 'التوابل والبهارات', 'الزيوت والدهون',
    'المشروبات', 'المعلبات والمحفوظات', 'منتجات المخابز'
  ]),
  subcategory: z.string().min(1, 'الفئة الفرعية مطلوبة'),
  origin: z.enum([
    'محلي يمني', 'مستورد من السعودية', 'مستورد من الهند',
    'مستورد من الصين', 'غير محدد'
  ]),
  unit: z.string().min(1, 'وحدة القياس مطلوبة'),
  currentQuantity: z.number().min(0, 'الكمية الحالية لا يمكن أن تكون سالبة'),
  minimumThreshold: z.number().min(0, 'الحد الأدنى لا يمكن أن يكون سالباً'),
  reorderPoint: z.number().min(0, 'نقطة إعادة الطلب لا يمكن أن تكون سالبة'),
  costPerUnit: z.number().min(0.01, 'تكلفة الوحدة يجب أن تكون أكبر من صفر'),
  sellingPrice: z.number().min(0.01, 'سعر البيع يجب أن تكون أكبر من صفر'),
  currency: z.enum(['YER', 'USD', 'SAR', 'EUR']),
  qualityGrade: z.enum(['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف']),
  storageConditions: z.array(z.enum([
    'درجة حرارة الغرفة', 'مبرد', 'مجمد', 'جاف', 'بارد ومظلم'
  ])).min(1, 'يجب تحديد ظروف تخزين واحدة على الأقل'),
  isPerishable: z.boolean(),
  isTraditionalYemeni: z.boolean(),
  religionCompliant: z.boolean(),
  requiresRefrigeration: z.boolean(),
  isActive: z.boolean().default(true)
})

export const SupplierSchema = z.object({
  businessName: z.string().min(1, 'اسم النشاط التجاري مطلوب'),
  contactPerson: z.string().min(1, 'جهة الاتصال مطلوبة'),
  phone: z.string().refine(validateYemeniPhoneNumber, 'رقم هاتف يمني غير صحيح'),
  email: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
  address: YemeniAddressSchema,
  specialties: z.array(z.enum([
    'لحوم طازجة', 'خضروات وفواكه', 'منتجات ألبان', 'توابل وبهارات',
    'حبوب وبقوليات', 'مشروبات', 'معلبات'
  ])).min(1, 'يجب تحديد تخصص واحد على الأقل'),
  isLocalProducer: z.boolean(),
  isCertifiedHalal: z.boolean(),
  qualityRating: z.number().min(1).max(5),
  reliabilityRating: z.number().min(1).max(5),
  priceCompetitiveness: z.number().min(1).max(5),
  deliveryPerformance: z.number().min(1).max(5),
  paymentTerms: z.enum(['نقدي فوري', 'نقدي خلال أسبوع', 'نقدي خلال شهر', 'دفع مؤجل 30 يوم']),
  isActive: z.boolean().default(true),
  isPreferred: z.boolean().default(false)
})

// Validation functions using schemas
export const validateInventoryItem = (data: any): { success: boolean; data?: InventoryItem; errors?: any } => {
  try {
    const validatedData = InventoryItemSchema.parse(data)
    return { success: true, data: validatedData as any }
  } catch (error) {
    return { success: false, errors: error }
  }
}

export const validateSupplier = (data: any): { success: boolean; data?: YemeniSupplier; errors?: any } => {
  try {
    const validatedData = SupplierSchema.parse(data)
    return { success: true, data: validatedData as any }
  } catch (error) {
    return { success: false, errors: error }
  }
}

export const validateInventoryItemForm = (data: InventoryItemFormData): { success: boolean; errors?: any[] } => {
  const errors: any[] = []
  
  // Basic information validation
  if (!data.basic.name.trim()) {
    errors.push({ field: 'basic.name', message: 'اسم المنتج مطلوب' })
  }
  
  if (!data.basic.subcategory.trim()) {
    errors.push({ field: 'basic.subcategory', message: 'الفئة الفرعية مطلوبة' })
  }
  
  // Measurement validation
  if (data.measurement.minimumThreshold < 0) {
    errors.push({ field: 'measurement.minimumThreshold', message: 'الحد الأدنى لا يمكن أن يكون سالباً' })
  }
  
  if (data.measurement.reorderPoint < data.measurement.minimumThreshold) {
    errors.push({ field: 'measurement.reorderPoint', message: 'نقطة إعادة الطلب يجب أن تكون أكبر من أو تساوي الحد الأدنى' })
  }
  
  // Pricing validation
  const pricingValidation = validatePricing(
    data.pricing.costPerUnit,
    data.pricing.sellingPrice,
    data.pricing.currency
  )
  if (!pricingValidation.isValid) {
    errors.push({ field: 'pricing', message: pricingValidation.message })
  }
  
  // Quality validation
  if (data.quality.isPerishable && !data.quality.expiryDate) {
    errors.push({ field: 'quality.expiryDate', message: 'تاريخ الانتهاء مطلوب للمنتجات سريعة التلف' })
  }
  
  if (data.quality.expiryDate) {
    const expiryValidation = validateExpiryDate(
      data.quality.expiryDate,
      data.basic.category,
      data.quality.isPerishable
    )
    if (!expiryValidation.isValid) {
      errors.push({ field: 'quality.expiryDate', message: expiryValidation.message })
    }
  }
  
  // Storage conditions validation
  const storageValidation = validateStorageConditions(
    data.quality.storageConditions,
    data.basic.category
  )
  if (!storageValidation.isValid) {
    errors.push({ field: 'quality.storageConditions', message: storageValidation.message })
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}
