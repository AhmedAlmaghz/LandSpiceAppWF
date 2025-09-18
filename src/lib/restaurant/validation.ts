// Restaurant Data Validation
// التحقق من صحة بيانات المطاعم

import { z } from 'zod'

// Basic validation schemas
export const phoneSchema = z.string()
  .regex(/^(\+966|0)?[5-9]\d{8}$/, 'رقم الهاتف غير صحيح')

export const emailSchema = z.string()
  .email('البريد الإلكتروني غير صحيح')

export const postalCodeSchema = z.string()
  .regex(/^\d{5}$/, 'الرمز البريدي يجب أن يكون 5 أرقام')
  .optional()

// Contact validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً'),
  position: z.string()
    .min(2, 'المنصب مطلوب')
    .max(50, 'المنصب طويل جداً'),
  phone: phoneSchema,
  email: emailSchema,
  isPrimary: z.boolean(),
  isActive: z.boolean()
})

// Address validation
export const addressSchema = z.object({
  street: z.string()
    .min(5, 'العنوان قصير جداً')
    .max(200, 'العنوان طويل جداً'),
  city: z.string()
    .min(2, 'اسم المدينة مطلوب')
    .max(50, 'اسم المدينة طويل جداً'),
  region: z.string()
    .min(2, 'المنطقة مطلوبة')
    .max(50, 'اسم المنطقة طويل جداً'),
  postalCode: postalCodeSchema,
  country: z.string()
    .min(2, 'الدولة مطلوبة')
    .max(50, 'اسم الدولة طويل جداً'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
})

// Branch validation
export const branchSchema = z.object({
  name: z.string()
    .min(2, 'اسم الفرع مطلوب')
    .max(100, 'اسم الفرع طويل جداً'),
  address: addressSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  manager: z.string()
    .min(2, 'اسم المدير مطلوب')
    .max(100, 'اسم المدير طويل جداً'),
  isActive: z.boolean(),
  openingDate: z.date()
})

// Financial info validation
export const financialInfoSchema = z.object({
  registrationNumber: z.string()
    .min(5, 'رقم السجل التجاري مطلوب')
    .max(20, 'رقم السجل التجاري طويل جداً'),
  taxId: z.string()
    .min(5, 'الرقم الضريبي مطلوب')
    .max(20, 'الرقم الضريبي طويل جداً'),
  capitalAmount: z.number()
    .min(1000, 'رأس المال يجب أن يكون 1000 على الأقل')
    .max(1000000000, 'رأس المال مرتفع جداً'),
  currency: z.enum(['SAR', 'USD', 'EUR']),
  creditRating: z.enum(['A', 'B', 'C', 'D']).optional(),
  guaranteeRequired: z.number()
    .min(0, 'مبلغ الضمان لا يمكن أن يكون سالب')
    .max(10000000, 'مبلغ الضمان مرتفع جداً'),
  paymentTerms: z.number()
    .min(1, 'مدة الدفع يجب أن تكون يوم واحد على الأقل')
    .max(180, 'مدة الدفع طويلة جداً'),
  preferredPaymentMethod: z.enum(['bank_transfer', 'check', 'cash', 'online'])
})

// Business info validation
export const businessInfoSchema = z.object({
  establishedDate: z.date()
    .refine(date => date <= new Date(), 'تاريخ التأسيس لا يمكن أن يكون في المستقبل'),
  businessType: z.enum(['restaurant', 'cafe', 'fast_food', 'catering', 'food_truck']),
  description: z.string()
    .min(10, 'الوصف قصير جداً')
    .max(1000, 'الوصف طويل جداً'),
  website: z.string().url('رابط الموقع غير صحيح').optional(),
  socialMedia: z.object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    tiktok: z.string().url().optional()
  })
})

// Operating hours validation
export const operatingHoursSchema = z.record(
  z.object({
    open: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'وقت البداية غير صحيح'),
    close: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'وقت النهاية غير صحيح'),
    isOpen: z.boolean()
  })
)

// Preferences validation
export const preferencesSchema = z.object({
  cuisineType: z.array(z.string()).min(1, 'نوع المطبخ مطلوب'),
  servingCapacity: z.object({
    dineIn: z.number().min(0, 'السعة لا يمكن أن تكون سالبة'),
    takeaway: z.number().min(0, 'السعة لا يمكن أن تكون سالبة'),
    delivery: z.number().min(0, 'السعة لا يمكن أن تكون سالبة')
  }),
  operatingHours: operatingHoursSchema,
  specialRequirements: z.array(z.string()),
  marketingPreferences: z.object({
    allowMarketing: z.boolean(),
    preferredChannels: z.array(z.string()),
    targetAudience: z.array(z.string())
  })
})

// Main restaurant validation schema
export const restaurantSchema = z.object({
  name: z.string()
    .min(2, 'اسم المطعم قصير جداً')
    .max(100, 'اسم المطعم طويل جداً'),
  legalName: z.string()
    .min(2, 'الاسم القانوني قصير جداً')
    .max(150, 'الاسم القانوني طويل جداً'),
  type: z.enum(['single', 'chain', 'franchise']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended', 'terminated']),
  contacts: z.array(contactSchema)
    .min(1, 'جهة اتصال واحدة على الأقل مطلوبة')
    .refine(contacts => contacts.some(c => c.isPrimary), 'جهة اتصال رئيسية مطلوبة'),
  branches: z.array(branchSchema)
    .min(1, 'فرع واحد على الأقل مطلوب'),
  businessInfo: businessInfoSchema,
  financialInfo: financialInfoSchema,
  preferences: preferencesSchema,
  tags: z.array(z.string()),
  categories: z.array(z.string())
})

// Form validation schema
export const restaurantFormSchema = restaurantSchema.omit({
  status: true
}).extend({
  documents: z.array(z.instanceof(File)).optional()
})

// Validation helper functions
export const validatePhone = (phone: string): boolean => {
  try {
    phoneSchema.parse(phone)
    return true
  } catch {
    return false
  }
}

export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

export const validateRestaurant = (restaurant: any) => {
  try {
    return {
      success: true,
      data: restaurantSchema.parse(restaurant),
      errors: null
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'خطأ في التحقق من البيانات' }]
    }
  }
}

export const validateRestaurantForm = (formData: any) => {
  try {
    return {
      success: true,
      data: restaurantFormSchema.parse(formData),
      errors: null
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'خطأ في التحقق من بيانات النموذج' }]
    }
  }
}
