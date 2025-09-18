// Bank Guarantee Validation for Yemeni Context
// نظام التحقق من الضمانات البنكية - السياق اليمني

import { z } from 'zod'
import { 
  BankGuarantee, 
  GuaranteeFormData, 
  GuaranteeType, 
  GuaranteeStatus,
  GuaranteePriority,
  Currency,
  GuaranteeDocumentType
} from './types'

// Yemeni phone number validation
const yemeniPhoneSchema = z.string()
  .regex(/^(\+967|00967|967)?[0-9]{9}$/, 'رقم الهاتف اليمني غير صحيح')
  .transform(phone => {
    // Normalize to +967 format
    const cleaned = phone.replace(/^(\+967|00967|967)/, '')
    return `+967${cleaned}`
  })

// Yemeni governorates
const yemeniGovernorates = [
  'صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حجة', 'صعدة', 'عمران',
  'البيضاء', 'مأرب', 'الجوف', 'شبوة', 'أبين', 'لحج', 'الضالع', 'ريمة',
  'المحويت', 'حضرموت', 'المهرة', 'سقطرى'
] as const

// Commercial registration number (Yemen format)
const yemeniRegistrationSchema = z.string()
  .regex(/^[0-9]{1,12}$/, 'رقم السجل التجاري يجب أن يكون من 1-12 رقم')

// Tax ID validation (Yemen format)
const yemeniTaxIdSchema = z.string()
  .regex(/^[0-9]{9}$/, 'الرقم الضريبي يجب أن يكون 9 أرقام')

// Address Schema (Yemeni format)
const yemeniAddressSchema = z.object({
  street: z.string().min(5, 'عنوان الشارع يجب أن يكون على الأقل 5 أحرف'),
  district: z.string().min(2, 'اسم الحي مطلوب'),
  city: z.string().min(2, 'اسم المدينة مطلوب'),
  governorate: z.enum(yemeniGovernorates, {
    errorMap: () => ({ message: 'يرجى اختيار محافظة صحيحة' })
  }),
  country: z.literal('اليمن'),
  postalCode: z.string().optional()
})

// Contact Information Schema
const contactSchema = z.object({
  primaryContact: z.string().min(2, 'اسم جهة الاتصال مطلوب'),
  position: z.string().min(2, 'المنصب مطلوب'),
  phone: yemeniPhoneSchema,
  mobile: yemeniPhoneSchema.optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  fax: z.string().optional()
})

// Bank Account Schema
const bankAccountSchema = z.object({
  bankName: z.string().min(3, 'اسم البنك مطلوب'),
  accountNumber: z.string().min(8, 'رقم الحساب يجب أن يكون على الأقل 8 أرقام'),
  iban: z.string()
    .regex(/^YE[0-9]{2}[0-9]{4}[0-9]{20}$/, 'رقم الآيبان اليمني غير صحيح')
    .optional(),
  swiftCode: z.string().optional()
}).optional()

// Legal Representative Schema
const legalRepresentativeSchema = z.object({
  name: z.string().min(2, 'اسم الممثل القانوني مطلوب'),
  position: z.string().min(2, 'منصب الممثل القانوني مطلوب'),
  idNumber: z.string()
    .regex(/^[0-9]{10}$/, 'رقم الهوية يجب أن يكون 10 أرقام'),
  phone: yemeniPhoneSchema
}).optional()

// Guarantee Party Schema
const guaranteePartySchema = z.object({
  type: z.enum(['restaurant', 'landspice', 'supplier', 'other']),
  name: z.string().min(2, 'اسم الطرف مطلوب'),
  legalName: z.string().min(2, 'الاسم القانوني مطلوب'),
  registrationNumber: yemeniRegistrationSchema.optional(),
  taxId: yemeniTaxIdSchema.optional(),
  address: yemeniAddressSchema,
  contact: contactSchema,
  bankAccount: bankAccountSchema,
  legalRepresentative: legalRepresentativeSchema
})

// Bank Info Schema
const bankInfoSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'اسم البنك مطلوب'),
  branchName: z.string().min(2, 'اسم الفرع مطلوب'),
  branchCode: z.string().optional(),
  address: yemeniAddressSchema,
  contact: z.object({
    phone: yemeniPhoneSchema,
    email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
    fax: z.string().optional(),
    manager: z.string().min(2, 'اسم مدير الفرع مطلوب')
  }),
  swiftCode: z.string().optional(),
  routingNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  commissionRates: z.object({
    performance: z.number().min(0).max(10, 'نسبة العمولة يجب أن تكون بين 0-10%'),
    advancePayment: z.number().min(0).max(10),
    maintenance: z.number().min(0).max(10),
    bidBond: z.number().min(0).max(10),
    customs: z.number().min(0).max(10),
    finalPayment: z.number().min(0).max(10)
  }),
  processingDays: z.object({
    standard: z.number().min(1).max(30, 'أيام المعالجة العادية يجب أن تكون بين 1-30 يوم'),
    urgent: z.number().min(1).max(7, 'أيام المعالجة العاجلة يجب أن تكون بين 1-7 أيام')
  }),
  workingDays: z.array(z.string()),
  workingHours: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة'),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة')
  }),
  isActive: z.boolean()
})

// Document Schema
const guaranteeDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(2, 'عنوان الوثيقة مطلوب'),
  type: z.enum([
    'application_form', 'trade_license', 'tax_certificate', 'bank_statement',
    'contract_copy', 'authorization_letter', 'id_copy', 'guarantee_letter',
    'amendment', 'extension_request', 'cancellation_request', 'other'
  ]),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().max(10 * 1024 * 1024, 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'),
  mimeType: z.string(),
  uploadDate: z.date(),
  uploadedBy: z.string(),
  isRequired: z.boolean(),
  isVerified: z.boolean(),
  verifiedBy: z.string().optional(),
  verificationDate: z.date().optional(),
  version: z.string(),
  parentDocumentId: z.string().optional(),
  accessLevel: z.enum(['public', 'restricted', 'confidential']),
  reviewStatus: z.enum(['pending', 'approved', 'rejected', 'requires_update']),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewDate: z.date().optional(),
  isActive: z.boolean()
})

// Status History Schema
const statusHistorySchema = z.object({
  id: z.string(),
  status: z.enum([
    'draft', 'submitted', 'under_review', 'approved', 'issued',
    'active', 'expired', 'cancelled', 'rejected', 'returned'
  ]),
  previousStatus: z.enum([
    'draft', 'submitted', 'under_review', 'approved', 'issued',
    'active', 'expired', 'cancelled', 'rejected', 'returned'
  ]).optional(),
  timestamp: z.date(),
  changedBy: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  automaticChange: z.boolean()
})

// Alert Schema
const alertSchema = z.object({
  id: z.string(),
  type: z.enum([
    'expiry_warning', 'renewal_required', 'document_missing', 'review_pending',
    'commission_due', 'bank_response_required', 'extension_available',
    'cancellation_notice', 'status_change', 'system_notification'
  ]),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string().min(2, 'عنوان التنبيه مطلوب'),
  message: z.string().min(5, 'رسالة التنبيه مطلوبة'),
  triggerDate: z.date(),
  dueDate: z.date().optional(),
  reminderDays: z.number().optional(),
  isActive: z.boolean(),
  isRead: z.boolean(),
  readBy: z.string().optional(),
  readDate: z.date().optional(),
  actionRequired: z.boolean(),
  actionType: z.string().optional(),
  actionUrl: z.string().optional(),
  createdDate: z.date(),
  createdBy: z.string()
})

// Note Schema
const noteSchema = z.object({
  id: z.string(),
  content: z.string().min(5, 'محتوى الملاحظة مطلوب'),
  type: z.enum(['general', 'internal', 'bank_communication', 'client_communication']),
  isPrivate: z.boolean(),
  createdBy: z.string(),
  createdDate: z.date(),
  lastModified: z.date().optional(),
  lastModifiedBy: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  visibleTo: z.array(z.string())
})

// Main Bank Guarantee Schema
export const bankGuaranteeSchema = z.object({
  id: z.string(),
  guaranteeNumber: z.string().min(5, 'رقم الضمانة مطلوب'),
  referenceNumber: z.string().optional(),
  
  // Basic Information
  type: z.enum(['performance', 'advance_payment', 'maintenance', 'bid_bond', 'customs', 'final_payment']),
  status: z.enum([
    'draft', 'submitted', 'under_review', 'approved', 'issued',
    'active', 'expired', 'cancelled', 'rejected', 'returned'
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  title: z.string().min(5, 'عنوان الضمانة يجب أن يكون على الأقل 5 أحرف'),
  description: z.string().optional(),
  
  // Parties
  applicant: guaranteePartySchema,
  beneficiary: guaranteePartySchema,
  bank: bankInfoSchema,
  
  // Financial Details
  amount: z.number()
    .positive('قيمة الضمانة يجب أن تكون موجبة')
    .min(1000, 'قيمة الضمانة يجب أن تكون على الأقل 1000')
    .max(100000000, 'قيمة الضمانة تتجاوز الحد الأقصى المسموح'),
  currency: z.enum(['YER', 'USD', 'SAR', 'EUR']),
  commissionRate: z.number().min(0).max(10, 'نسبة العمولة يجب أن تكون بين 0-10%'),
  commissionAmount: z.number().min(0),
  
  // Timeline
  applicationDate: z.date(),
  issueDate: z.date().optional(),
  effectiveDate: z.date().optional(),
  expiryDate: z.date().refine(date => date > new Date(), {
    message: 'تاريخ انتهاء الضمانة يجب أن يكون في المستقبل'
  }),
  extensionDate: z.date().optional(),
  
  // Related entities
  relatedContract: z.string().optional(),
  relatedProject: z.string().optional(),
  
  // Documents and processing
  documents: z.array(guaranteeDocumentSchema),
  submittedBy: z.string(),
  reviewedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  
  // Bank processing
  bankReference: z.string().optional(),
  bankNotes: z.string().optional(),
  bankOfficer: z.string().optional(),
  
  // Status tracking
  statusHistory: z.array(statusHistorySchema),
  alerts: z.array(alertSchema),
  
  // Renewal
  isRenewable: z.boolean(),
  renewalTerms: z.string().optional(),
  autoRenewal: z.boolean(),
  renewalNoticeDays: z.number().min(7).max(365, 'أيام إشعار التجديد يجب أن تكون بين 7-365 يوم'),
  
  // Metadata
  tags: z.array(z.string()),
  notes: z.array(noteSchema),
  createdDate: z.date(),
  lastModified: z.date(),
  createdBy: z.string(),
  lastModifiedBy: z.string(),
  version: z.string(),
  isArchived: z.boolean()
})

// Form Data Validation Schema
export const guaranteeFormDataSchema = z.object({
  basic: z.object({
    type: z.enum(['performance', 'advance_payment', 'maintenance', 'bid_bond', 'customs', 'final_payment']),
    title: z.string().min(5, 'عنوان الضمانة يجب أن يكون على الأقل 5 أحرف'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    amount: z.number()
      .positive('قيمة الضمانة يجب أن تكون موجبة')
      .min(1000, 'قيمة الضمانة يجب أن تكون على الأقل 1000 ريال يمني'),
    currency: z.enum(['YER', 'USD', 'SAR', 'EUR'])
  }),
  
  parties: z.object({
    applicant: guaranteePartySchema.omit({ id: true }),
    beneficiary: guaranteePartySchema.omit({ id: true })
  }),
  
  timeline: z.object({
    expiryDate: z.date().refine(date => date > new Date(), {
      message: 'تاريخ انتهاء الضمانة يجب أن يكون في المستقبل'
    }),
    isRenewable: z.boolean(),
    renewalNoticeDays: z.number().min(7).max(365),
    autoRenewal: z.boolean()
  }),
  
  bank: z.object({
    bankId: z.string().min(1, 'يجب اختيار البنك'),
    branchCode: z.string().optional(),
    requestedBy: z.string().min(2, 'اسم مقدم الطلب مطلوب'),
    urgentProcessing: z.boolean()
  }),
  
  documents: z.array(z.object({
    type: z.enum([
      'application_form', 'trade_license', 'tax_certificate', 'bank_statement',
      'contract_copy', 'authorization_letter', 'id_copy', 'guarantee_letter',
      'amendment', 'extension_request', 'cancellation_request', 'other'
    ]),
    title: z.string().min(2, 'عنوان الوثيقة مطلوب'),
    isRequired: z.boolean(),
    file: z.any().optional() // File object - validated separately
  })),
  
  relatedEntities: z.object({
    contractId: z.string().optional(),
    projectId: z.string().optional()
  }),
  
  notes: z.string().optional(),
  tags: z.array(z.string())
}).refine(data => {
  // Custom validation: Expiry date must be at least 30 days from now
  const minExpiryDate = new Date()
  minExpiryDate.setDate(minExpiryDate.getDate() + 30)
  return data.timeline.expiryDate >= minExpiryDate
}, {
  message: 'تاريخ انتهاء الضمانة يجب أن يكون على الأقل 30 يوم من تاريخ اليوم',
  path: ['timeline', 'expiryDate']
})

// Filter Validation Schema
export const guaranteeFilterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.array(z.enum([
    'draft', 'submitted', 'under_review', 'approved', 'issued',
    'active', 'expired', 'cancelled', 'rejected', 'returned'
  ])).optional(),
  type: z.array(z.enum([
    'performance', 'advance_payment', 'maintenance', 'bid_bond', 'customs', 'final_payment'
  ])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  bank: z.array(z.string()).optional(),
  applicant: z.array(z.string()).optional(),
  currency: z.array(z.enum(['YER', 'USD', 'SAR', 'EUR'])).optional(),
  
  // Date ranges
  applicationDateFrom: z.date().optional(),
  applicationDateTo: z.date().optional(),
  expiryDateFrom: z.date().optional(),
  expiryDateTo: z.date().optional(),
  
  // Amount ranges
  amountFrom: z.number().positive().optional(),
  amountTo: z.number().positive().optional(),
  
  // Flags
  hasAlerts: z.boolean().optional(),
  nearExpiry: z.boolean().optional(),
  requiresAction: z.boolean().optional(),
  isRenewable: z.boolean().optional(),
  
  // Bank specific
  bankOfficer: z.string().optional(),
  branchCode: z.string().optional(),
  
  tags: z.array(z.string()).optional()
}).refine(data => {
  // Validate date ranges
  if (data.applicationDateFrom && data.applicationDateTo) {
    return data.applicationDateFrom <= data.applicationDateTo
  }
  return true
}, {
  message: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية',
  path: ['applicationDateTo']
}).refine(data => {
  // Validate amount ranges
  if (data.amountFrom && data.amountTo) {
    return data.amountFrom <= data.amountTo
  }
  return true
}, {
  message: 'المبلغ الأدنى يجب أن يكون أقل من المبلغ الأعلى',
  path: ['amountTo']
})

// Validation Functions
export function validateBankGuarantee(guarantee: BankGuarantee) {
  try {
    bankGuaranteeSchema.parse(guarantee)
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

export function validateGuaranteeForm(formData: GuaranteeFormData) {
  try {
    guaranteeFormDataSchema.parse(formData)
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

export function validateGuaranteeFilter(filter: any) {
  try {
    guaranteeFilterSchema.parse(filter)
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
export function generateGuaranteeNumber(): string {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  return `BG-${year}${month}-${timestamp}`
}

export function validateYemeniPhone(phone: string): boolean {
  return /^(\+967|00967|967)?[0-9]{9}$/.test(phone)
}

export function validateYemeniRegistration(registration: string): boolean {
  return /^[0-9]{1,12}$/.test(registration)
}

export function validateYemeniTaxId(taxId: string): boolean {
  return /^[0-9]{9}$/.test(taxId)
}

export function isWorkingDay(date: Date, workingDays: string[] = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']): boolean {
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const dayName = dayNames[date.getDay()]
  return workingDays.includes(dayName)
}

export function calculateCommission(amount: number, rate: number): number {
  return Math.round((amount * rate / 100) * 100) / 100
}

export function isNearExpiry(expiryDate: Date, days: number = 30): boolean {
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays > 0
}

export function isExpired(expiryDate: Date): boolean {
  return expiryDate < new Date()
}

export function formatGuaranteeAmount(amount: number, currency: Currency): string {
  const formatters = {
    YER: new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER' }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    SAR: new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }),
    EUR: new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' })
  }
  
  return formatters[currency]?.format(amount) || `${amount} ${currency}`
}

// Export validation schemas
export {
  yemeniPhoneSchema,
  yemeniRegistrationSchema,
  yemeniTaxIdSchema,
  yemeniAddressSchema,
  contactSchema,
  bankAccountSchema,
  legalRepresentativeSchema,
  guaranteePartySchema,
  bankInfoSchema,
  guaranteeDocumentSchema,
  statusHistorySchema,
  alertSchema,
  noteSchema
}
