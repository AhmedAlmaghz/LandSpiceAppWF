// Design Request Validation for Yemeni Context
// نظام التحقق من طلبات التصميم - السياق اليمني

import { z } from 'zod'
import { 
  DesignRequest, 
  DesignRequestFormData, 
  DesignType, 
  DesignStatus,
  DesignPriority,
  DesignCategory,
  FileFormat
} from './types'

// Yemeni phone number validation
const yemeniPhoneSchema = z.string()
  .regex(/^(\+967|00967|967)?[0-9]{9}$/, 'رقم الهاتف اليمني غير صحيح')
  .transform(phone => {
    const cleaned = phone.replace(/^(\+967|00967|967)/, '')
    return `+967${cleaned}`
  })

// Arabic text validation
const arabicTextSchema = z.string()
  .min(2, 'النص العربي يجب أن يكون على الأقل حرفين')
  .regex(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\u060C\u061B\u061F\u0640]+/, 
    'يجب أن يحتوي على نص عربي صحيح')

// File format validation
const fileFormatSchema = z.enum([
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'pdf', 'ai', 'psd', 'sketch', 'fig',
  'svg', 'eps', 'mp4', 'mov'
], {
  errorMap: () => ({ message: 'صيغة الملف غير مدعومة' })
})

// Color hex validation
const colorHexSchema = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'كود اللون يجب أن يكون بصيغة hex صحيحة')

// Dimensions schema
const dimensionsSchema = z.object({
  width: z.number().positive('العرض يجب أن يكون رقماً موجباً'),
  height: z.number().positive('الارتفاع يجب أن يكون رقماً موجباً'),
  unit: z.enum(['px', 'mm', 'cm', 'in'], {
    errorMap: () => ({ message: 'وحدة القياس غير صحيحة' })
  })
}).optional()

// Cultural preferences schema
const culturalPreferencesSchema = z.object({
  arabicFont: z.string().min(1, 'يجب اختيار خط عربي'),
  colorScheme: z.array(colorHexSchema).min(1, 'يجب اختيار لون واحد على الأقل'),
  includeTraditionalElements: z.boolean(),
  islamicCompliant: z.boolean(),
  yemeniCulturalElements: z.boolean()
})

// Design requirements schema
const designRequirementsSchema = z.object({
  // Basic Requirements
  dimensions: dimensionsSchema,
  
  // Text Content
  primaryText: arabicTextSchema,
  secondaryText: z.string().optional(),
  englishText: z.string().optional(),
  
  // Color Preferences
  preferredColors: z.array(colorHexSchema).default([]),
  avoidColors: z.array(colorHexSchema).default([]),
  
  // Style Preferences
  styleDirection: z.string().min(5, 'توجه التصميم يجب أن يكون واضحاً'),
  moodKeywords: z.array(z.string()).min(1, 'يجب إضافة كلمة مفتاحية واحدة على الأقل'),
  inspirationReferences: z.array(z.string()).default([]),
  
  // Technical Requirements
  fileFormats: z.array(fileFormatSchema).min(1, 'يجب اختيار صيغة ملف واحدة على الأقل'),
  resolution: z.number().positive().optional(),
  colorMode: z.enum(['RGB', 'CMYK', 'both']).default('RGB'),
  
  // Usage Requirements
  usageContext: z.array(z.string()).min(1, 'يجب تحديد سياق الاستخدام'),
  printRequirements: z.object({
    paperSize: z.string().min(1, 'يجب تحديد حجم الورق'),
    orientation: z.enum(['portrait', 'landscape']),
    bleed: z.boolean()
  }).optional(),
  
  // Special Requirements
  includeQRCode: z.boolean().default(false),
  includeContactInfo: z.boolean().default(true),
  multiLanguage: z.boolean().default(false),
  
  // Accessibility
  accessibilityRequirements: z.array(z.string()).default([]),
  colorBlindFriendly: z.boolean().default(false)
})

// Client information schema
const clientSchema = z.object({
  restaurantId: z.string().min(1, 'يجب اختيار المطعم'),
  restaurantName: z.string().min(2, 'اسم المطعم مطلوب'),
  contactPerson: z.string().min(2, 'اسم جهة الاتصال مطلوب'),
  phone: yemeniPhoneSchema,
  email: z.string().email('البريد الإلكتروني غير صحيح').optional()
})

// Design file schema
const designFileSchema = z.object({
  id: z.string(),
  fileName: z.string().min(1, 'اسم الملف مطلوب'),
  originalName: z.string(),
  filePath: z.string(),
  fileSize: z.number().max(50 * 1024 * 1024, 'حجم الملف يجب أن يكون أقل من 50 ميجابايت'),
  mimeType: z.string(),
  format: fileFormatSchema,
  uploadDate: z.date(),
  uploadedBy: z.string(),
  version: z.string(),
  isLatest: z.boolean(),
  fileType: z.enum(['reference', 'draft', 'revision', 'final', 'source']),
  fileCategory: z.string(),
  description: z.string().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  resolution: z.number().optional(),
  colorMode: z.enum(['RGB', 'CMYK']).optional(),
  isPublic: z.boolean(),
  accessLevel: z.enum(['client', 'designer', 'internal', 'admin']),
  reviewStatus: z.enum(['pending', 'approved', 'rejected', 'needs_revision']),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewDate: z.date().optional(),
  isActive: z.boolean()
})

// Revision schema
const designRevisionSchema = z.object({
  id: z.string(),
  revisionNumber: z.number().positive(),
  title: z.string().min(3, 'عنوان التعديل يجب أن يكون على الأقل 3 أحرف'),
  description: z.string().min(10, 'وصف التعديل يجب أن يكون على الأقل 10 أحرف'),
  requestedBy: z.string(),
  requestDate: z.date(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  changesRequested: z.array(z.object({
    id: z.string(),
    changeType: z.enum(['text', 'color', 'layout', 'font', 'image', 'other']),
    description: z.string().min(5, 'وصف التغيير مطلوب'),
    isRequired: z.boolean(),
    priority: z.enum(['low', 'medium', 'high']),
    elementLocation: z.string().optional(),
    coordinates: z.object({
      x: z.number(),
      y: z.number()
    }).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
    rejectionReason: z.string().optional(),
    completedDate: z.date().optional()
  })),
  designerResponse: z.string().optional(),
  estimatedTime: z.number().positive().optional(),
  actualTime: z.number().positive().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  completedDate: z.date().optional(),
  beforeFiles: z.array(z.string()),
  afterFiles: z.array(z.string())
})

// Main Design Request Schema
export const designRequestSchema = z.object({
  id: z.string(),
  requestNumber: z.string().min(5, 'رقم الطلب مطلوب'),
  title: z.string().min(5, 'عنوان المشروع يجب أن يكون على الأقل 5 أحرف'),
  description: z.string().optional(),
  
  // Basic Information
  type: z.enum([
    'logo', 'business_card', 'letterhead', 'brochure', 'banner', 'menu',
    'packaging', 'sticker', 'social_media', 'website', 'complete_identity'
  ]),
  category: z.enum(['branding', 'marketing', 'print', 'digital', 'packaging']),
  status: z.enum([
    'draft', 'submitted', 'under_review', 'assigned', 'in_progress',
    'draft_ready', 'client_review', 'revision_requested', 'revision_in_progress',
    'approved', 'final_files_ready', 'delivered', 'archived', 'cancelled', 'on_hold'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  complexity: z.enum(['simple', 'medium', 'complex', 'very_complex']),
  
  // Client Information
  client: clientSchema,
  
  // Design Requirements
  requirements: designRequirementsSchema,
  
  // Cultural Preferences
  culturalPreferences: culturalPreferencesSchema,
  
  // Timeline
  requestDate: z.date(),
  expectedDeliveryDate: z.date().refine(date => date > new Date(), {
    message: 'تاريخ التسليم يجب أن يكون في المستقبل'
  }),
  actualDeliveryDate: z.date().optional(),
  deadlineExtensions: z.array(z.object({
    id: z.string(),
    originalDeadline: z.date(),
    newDeadline: z.date(),
    reason: z.string().min(10, 'سبب التمديد مطلوب'),
    requestedBy: z.string(),
    approvedBy: z.string().optional(),
    requestDate: z.date(),
    approvalDate: z.date().optional(),
    status: z.enum(['pending', 'approved', 'rejected'])
  })),
  
  // Assignment
  assignedDesigner: z.string().optional(),
  assignedDate: z.date().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  
  // Files and Assets
  referenceFiles: z.array(designFileSchema),
  draftFiles: z.array(designFileSchema),
  finalFiles: z.array(designFileSchema),
  
  // Revisions and Feedback
  revisions: z.array(designRevisionSchema),
  feedback: z.array(z.object({
    id: z.string(),
    feedbackType: z.enum(['general', 'specific', 'approval', 'rejection']),
    content: z.string().min(5, 'محتوى التعليق مطلوب'),
    providedBy: z.string(),
    providedDate: z.date(),
    rating: z.number().min(1).max(5).optional(),
    designerResponse: z.string().optional(),
    responseDate: z.date().optional(),
    isPublic: z.boolean(),
    visibleTo: z.array(z.string()),
    attachments: z.array(z.string())
  })),
  
  // Workflow
  statusHistory: z.array(z.object({
    id: z.string(),
    status: z.enum([
      'draft', 'submitted', 'under_review', 'assigned', 'in_progress',
      'draft_ready', 'client_review', 'revision_requested', 'revision_in_progress',
      'approved', 'final_files_ready', 'delivered', 'archived', 'cancelled', 'on_hold'
    ]),
    previousStatus: z.enum([
      'draft', 'submitted', 'under_review', 'assigned', 'in_progress',
      'draft_ready', 'client_review', 'revision_requested', 'revision_in_progress',
      'approved', 'final_files_ready', 'delivered', 'archived', 'cancelled', 'on_hold'
    ]).optional(),
    timestamp: z.date(),
    changedBy: z.string(),
    reason: z.string().optional(),
    notes: z.string().optional(),
    automaticChange: z.boolean(),
    durationInPreviousStatus: z.number().optional()
  })),
  
  approvals: z.array(z.object({
    id: z.string(),
    approvalType: z.enum(['initial_concept', 'draft_review', 'final_approval', 'delivery_confirmation']),
    status: z.enum(['pending', 'approved', 'rejected', 'conditional']),
    approver: z.string(),
    approverRole: z.enum(['client', 'designer', 'art_director', 'manager']),
    approvalDate: z.date().optional(),
    comments: z.string().optional(),
    conditions: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional(),
    approvedFiles: z.array(z.string()),
    rejectedFiles: z.array(z.string())
  })),
  
  // Financial
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional(),
  currency: z.enum(['YER', 'USD', 'SAR']),
  billingStatus: z.enum(['pending', 'billed', 'paid']),
  
  // Quality and Satisfaction
  qualityRating: z.number().min(1).max(5).optional(),
  clientSatisfaction: z.number().min(1).max(5).optional(),
  designerSelfRating: z.number().min(1).max(5).optional(),
  
  // Metadata
  tags: z.array(z.string()),
  notes: z.array(z.object({
    id: z.string(),
    content: z.string().min(5, 'محتوى الملاحظة مطلوب'),
    noteType: z.enum(['general', 'technical', 'client_communication', 'internal']),
    isPrivate: z.boolean(),
    createdBy: z.string(),
    createdDate: z.date(),
    lastModified: z.date().optional(),
    lastModifiedBy: z.string().optional(),
    visibleTo: z.array(z.string()),
    attachments: z.array(z.string()).optional()
  })),
  isArchived: z.boolean(),
  createdDate: z.date(),
  lastModified: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string(),
  version: z.string()
})

// Form Data Validation Schema
export const designRequestFormDataSchema = z.object({
  basic: z.object({
    title: z.string().min(5, 'عنوان المشروع يجب أن يكون على الأقل 5 أحرف'),
    type: z.enum([
      'logo', 'business_card', 'letterhead', 'brochure', 'banner', 'menu',
      'packaging', 'sticker', 'social_media', 'website', 'complete_identity'
    ]),
    category: z.enum(['branding', 'marketing', 'print', 'digital', 'packaging']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    description: z.string().optional(),
    expectedDeliveryDate: z.date().refine(date => date > new Date(), {
      message: 'تاريخ التسليم يجب أن يكون في المستقبل'
    })
  }),
  
  client: clientSchema,
  
  requirements: designRequirementsSchema,
  
  culturalPreferences: culturalPreferencesSchema,
  
  referenceFiles: z.array(z.any()).default([]), // File objects - validated separately
  
  budget: z.object({
    estimatedCost: z.number().positive('التكلفة يجب أن تكون رقماً موجباً'),
    currency: z.enum(['YER', 'USD', 'SAR'])
  }).optional(),
  
  notes: z.string().optional(),
  tags: z.array(z.string()).default([])
}).refine(data => {
  // Custom validation: delivery date should be at least 3 days from now
  const minDeliveryDate = new Date()
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 3)
  return data.basic.expectedDeliveryDate >= minDeliveryDate
}, {
  message: 'تاريخ التسليم يجب أن يكون على الأقل 3 أيام من تاريخ اليوم',
  path: ['basic', 'expectedDeliveryDate']
})

// Filter Validation Schema
export const designFilterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.array(z.enum([
    'draft', 'submitted', 'under_review', 'assigned', 'in_progress',
    'draft_ready', 'client_review', 'revision_requested', 'revision_in_progress',
    'approved', 'final_files_ready', 'delivered', 'archived', 'cancelled', 'on_hold'
  ])).optional(),
  type: z.array(z.enum([
    'logo', 'business_card', 'letterhead', 'brochure', 'banner', 'menu',
    'packaging', 'sticker', 'social_media', 'website', 'complete_identity'
  ])).optional(),
  category: z.array(z.enum(['branding', 'marketing', 'print', 'digital', 'packaging'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  assignedDesigner: z.array(z.string()).optional(),
  
  // Date ranges
  requestDateFrom: z.date().optional(),
  requestDateTo: z.date().optional(),
  deadlineDateFrom: z.date().optional(),
  deadlineDateTo: z.date().optional(),
  
  // Client filters
  clientId: z.array(z.string()).optional(),
  
  // Quality filters
  hasRevisions: z.boolean().optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  clientSatisfaction: z.number().min(1).max(5).optional(),
  
  // Cultural filters
  includesYemeniElements: z.boolean().optional(),
  islamicCompliant: z.boolean().optional(),
  
  tags: z.array(z.string()).optional()
})

// Validation Functions
export function validateDesignRequest(request: DesignRequest) {
  try {
    designRequestSchema.parse(request)
    return { success: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }
    }
    return {
      success: false,
      errors: [{ field: 'general', message: 'خطأ في التحقق من صحة البيانات', code: 'validation_error' }]
    }
  }
}

export function validateDesignRequestForm(formData: DesignRequestFormData) {
  try {
    designRequestFormDataSchema.parse(formData)
    return { success: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }
    }
    return {
      success: false,
      errors: [{ field: 'general', message: 'خطأ في التحقق من صحة النموذج', code: 'form_validation_error' }]
    }
  }
}

export function validateDesignFilter(filter: any) {
  try {
    designFilterSchema.parse(filter)
    return { success: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }
    }
    return {
      success: false,
      errors: [{ field: 'general', message: 'خطأ في معايير البحث', code: 'filter_validation_error' }]
    }
  }
}

// Utility Functions
export function generateRequestNumber(): string {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  return `DR-${year}${month}-${timestamp}`
}

export function validateYemeniPhone(phone: string): boolean {
  return /^(\+967|00967|967)?[0-9]{9}$/.test(phone)
}

export function validateArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\u060C\u061B\u061F\u0640]+/.test(text)
}

export function validateColorHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

export function isDeadlineApproaching(deadline: Date, warningDays: number = 3): boolean {
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= warningDays && diffDays > 0
}

export function isOverdue(deadline: Date): boolean {
  return deadline < new Date()
}

export function calculateProjectDuration(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getEstimatedDeliveryDays(designType: DesignType, complexity: string): number {
  const baseDays = {
    'logo': 3,
    'business_card': 2,
    'letterhead': 2,
    'brochure': 4,
    'banner': 2,
    'menu': 3,
    'packaging': 5,
    'sticker': 2,
    'social_media': 1,
    'website': 7,
    'complete_identity': 10
  }

  const complexityMultiplier = {
    'simple': 1,
    'medium': 1.5,
    'complex': 2,
    'very_complex': 3
  }

  const baseDay = baseDays[designType] || 3
  const multiplier = complexityMultiplier[complexity as keyof typeof complexityMultiplier] || 1

  return Math.ceil(baseDay * multiplier)
}

export function getDefaultFileFormats(designType: DesignType): FileFormat[] {
  const formats: Record<DesignType, FileFormat[]> = {
    'logo': ['ai', 'svg', 'png', 'pdf'],
    'business_card': ['ai', 'pdf', 'png'],
    'letterhead': ['ai', 'pdf', 'psd'],
    'brochure': ['ai', 'pdf', 'psd'],
    'banner': ['ai', 'pdf', 'png', 'psd'],
    'menu': ['ai', 'pdf', 'psd'],
    'packaging': ['ai', 'pdf', 'psd'],
    'sticker': ['ai', 'pdf', 'png'],
    'social_media': ['png', 'jpg', 'gif', 'mp4'],
    'website': ['png', 'jpg', 'svg', 'gif'],
    'complete_identity': ['ai', 'svg', 'png', 'pdf', 'psd']
  }

  return formats[designType] || ['png', 'pdf']
}

// Export validation schemas
export {
  yemeniPhoneSchema,
  arabicTextSchema,
  fileFormatSchema,
  colorHexSchema,
  dimensionsSchema,
  culturalPreferencesSchema,
  designRequirementsSchema,
  clientSchema,
  designFileSchema,
  designRevisionSchema
}
