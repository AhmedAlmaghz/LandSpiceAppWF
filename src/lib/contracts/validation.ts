// Contract Data Validation
// التحقق من صحة بيانات العقود

import { z } from 'zod'

// Basic validation schemas
export const contractNumberSchema = z.string()
  .regex(/^CON-\d{4}-\d{6}$/, 'رقم العقد يجب أن يكون بالصيغة: CON-YYYY-XXXXXX')

export const phoneSchema = z.string()
  .regex(/^(\+966|0)?[5-9]\d{8}$/, 'رقم الهاتف غير صحيح')

export const emailSchema = z.string()
  .email('البريد الإلكتروني غير صحيح')

export const nationalIdSchema = z.string()
  .regex(/^\d{10}$/, 'رقم الهوية يجب أن يكون 10 أرقام')
  .optional()

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
  postalCode: z.string()
    .regex(/^\d{5}$/, 'الرمز البريدي يجب أن يكون 5 أرقام')
    .optional(),
  country: z.string()
    .min(2, 'الدولة مطلوبة')
    .max(50, 'اسم الدولة طويل جداً')
})

// Contact validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً'),
  position: z.string()
    .min(2, 'المنصب مطلوب')
    .max(100, 'المنصب طويل جداً'),
  phone: phoneSchema,
  email: emailSchema
})

// Signatory validation
export const signatorySchema = z.object({
  name: z.string()
    .min(2, 'اسم المفوض مطلوب')
    .max(100, 'اسم المفوض طويل جداً'),
  position: z.string()
    .min(2, 'منصب المفوض مطلوب')
    .max(100, 'منصب المفوض طويل جداً'),
  nationalId: nationalIdSchema,
  signature: z.string().optional()
})

// Contract party validation
export const contractPartySchema = z.object({
  type: z.enum(['landspice', 'restaurant', 'bank', 'supplier', 'other']),
  name: z.string()
    .min(2, 'اسم الطرف مطلوب')
    .max(150, 'اسم الطرف طويل جداً'),
  legalName: z.string()
    .min(2, 'الاسم القانوني مطلوب')
    .max(200, 'الاسم القانوني طويل جداً'),
  registrationNumber: z.string()
    .min(5, 'رقم السجل التجاري مطلوب')
    .max(20, 'رقم السجل التجاري طويل جداً')
    .optional(),
  taxId: z.string()
    .min(5, 'الرقم الضريبي مطلوب')
    .max(20, 'الرقم الضريبي طويل جداً')
    .optional(),
  address: addressSchema,
  contact: contactSchema,
  signatory: signatorySchema
})

// Contract term validation
export const contractTermSchema = z.object({
  title: z.string()
    .min(3, 'عنوان البند قصير جداً')
    .max(200, 'عنوان البند طويل جداً'),
  content: z.string()
    .min(10, 'محتوى البند قصير جداً')
    .max(5000, 'محتوى البند طويل جداً'),
  type: z.enum(['clause', 'condition', 'obligation', 'penalty', 'termination']),
  isRequired: z.boolean(),
  order: z.number()
    .min(1, 'ترتيب البند يجب أن يكون رقم موجب')
    .max(100, 'ترتيب البند مرتفع جداً'),
  variables: z.record(z.any()).optional()
})

// Financial terms validation
export const paymentTermsSchema = z.object({
  method: z.enum(['monthly', 'quarterly', 'annually', 'milestone', 'custom']),
  dueDate: z.number()
    .min(1, 'مدة الاستحقاق يجب أن تكون يوم واحد على الأقل')
    .max(365, 'مدة الاستحقاق طويلة جداً'),
  penaltyRate: z.number()
    .min(0, 'معدل الغرامة لا يمكن أن يكون سالب')
    .max(10, 'معدل الغرامة مرتفع جداً')
    .optional(),
  discountRate: z.number()
    .min(0, 'معدل الخصم لا يمكن أن يكون سالب')
    .max(50, 'معدل الخصم مرتفع جداً')
    .optional()
})

export const contractFinancialsSchema = z.object({
  totalValue: z.number()
    .min(1, 'قيمة العقد يجب أن تكون أكبر من صفر')
    .max(100000000, 'قيمة العقد مرتفعة جداً'),
  currency: z.enum(['SAR', 'USD', 'EUR']),
  paymentTerms: paymentTermsSchema,
  guaranteeRequired: z.number()
    .min(0, 'مبلغ الضمان لا يمكن أن يكون سالب')
    .max(50000000, 'مبلغ الضمان مرتفع جداً'),
  guaranteeType: z.enum(['bank_guarantee', 'cash_deposit', 'insurance', 'none']),
  installments: z.array(z.object({
    amount: z.number().min(1, 'مبلغ القسط يجب أن يكون أكبر من صفر'),
    dueDate: z.date(),
    description: z.string().min(1, 'وصف القسط مطلوب'),
    status: z.enum(['pending', 'paid', 'overdue', 'cancelled'])
  })).optional()
})

// Deliverable validation
export const contractDeliverableSchema = z.object({
  title: z.string()
    .min(3, 'عنوان المخرج قصير جداً')
    .max(200, 'عنوان المخرج طويل جداً'),
  description: z.string()
    .min(10, 'وصف المخرج قصير جداً')
    .max(2000, 'وصف المخرج طويل جداً'),
  category: z.enum(['design', 'printing', 'delivery', 'training', 'support', 'other']),
  quantity: z.number().min(1, 'الكمية يجب أن تكون رقم موجب').optional(),
  unit: z.string().max(50, 'وحدة القياس طويلة جداً').optional(),
  specifications: z.record(z.any()).optional(),
  timeline: z.object({
    startDate: z.date().optional(),
    endDate: z.date(),
    milestones: z.array(z.object({
      title: z.string().min(1, 'عنوان المرحلة مطلوب'),
      date: z.date(),
      status: z.enum(['pending', 'completed', 'delayed', 'cancelled'])
    })).optional()
  }),
  dependencies: z.array(z.string()).optional(),
  assignedTo: z.string().optional()
})

// Contract document validation
export const contractDocumentSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الوثيقة قصير جداً')
    .max(200, 'عنوان الوثيقة طويل جداً'),
  type: z.enum(['contract', 'amendment', 'attachment', 'invoice', 'receipt', 'report', 'correspondence']),
  fileName: z.string().min(1, 'اسم الملف مطلوب'),
  filePath: z.string().min(1, 'مسار الملف مطلوب'),
  fileSize: z.number().min(1, 'حجم الملف يجب أن يكون أكبر من صفر'),
  mimeType: z.string().min(1, 'نوع الملف مطلوب'),
  uploadDate: z.date(),
  uploadedBy: z.string().min(1, 'معرف رافع الملف مطلوب'),
  version: z.string().min(1, 'رقم الإصدار مطلوب'),
  isActive: z.boolean()
})

// Main contract validation schema
export const contractSchema = z.object({
  title: z.string()
    .min(5, 'عنوان العقد قصير جداً')
    .max(200, 'عنوان العقد طويل جداً'),
  contractNumber: contractNumberSchema,
  type: z.enum(['service', 'supply', 'partnership', 'licensing', 'maintenance', 'consulting']),
  category: z.enum(['design', 'printing', 'supply_chain', 'marketing', 'technology', 'general']),
  parties: z.array(contractPartySchema)
    .min(2, 'العقد يحتاج إلى طرفين على الأقل'),
  primaryParty: z.string().min(1, 'الطرف الأول مطلوب'),
  secondaryParty: z.string().min(1, 'الطرف الثاني مطلوب'),
  status: z.enum(['draft', 'review', 'negotiation', 'approval', 'signed', 'active', 'completed', 'terminated', 'expired']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  createdDate: z.date(),
  effectiveDate: z.date(),
  expiryDate: z.date(),
  renewalDate: z.date().optional(),
  terminationDate: z.date().optional(),
  lastModified: z.date(),
  terms: z.array(contractTermSchema)
    .min(1, 'العقد يحتاج إلى بند واحد على الأقل'),
  financials: contractFinancialsSchema,
  deliverables: z.array(contractDeliverableSchema),
  governingLaw: z.string()
    .min(2, 'القانون الحاكم مطلوب')
    .max(100, 'القانون الحاكم طويل جداً'),
  jurisdiction: z.string()
    .min(2, 'الاختصاص القضائي مطلوب')
    .max(100, 'الاختصاص القضائي طويل جداً'),
  disputeResolution: z.enum(['arbitration', 'litigation', 'mediation']),
  confidentialityLevel: z.enum(['public', 'internal', 'confidential', 'restricted']),
  documents: z.array(contractDocumentSchema),
  tags: z.array(z.string().max(50, 'العلامة طويلة جداً')),
  createdBy: z.string().min(1, 'منشئ العقد مطلوب'),
  lastModifiedBy: z.string().min(1, 'محرر العقد مطلوب'),
  version: z.string().min(1, 'رقم الإصدار مطلوب'),
  isArchived: z.boolean()
}).refine(
  (data) => data.effectiveDate < data.expiryDate,
  {
    message: 'تاريخ انتهاء العقد يجب أن يكون بعد تاريخ السريان',
    path: ['expiryDate']
  }
).refine(
  (data) => !data.renewalDate || data.renewalDate <= data.expiryDate,
  {
    message: 'تاريخ التجديد يجب أن يكون قبل أو في تاريخ انتهاء العقد',
    path: ['renewalDate']
  }
)

// Form validation schema
export const contractFormSchema = contractSchema.omit({
  contractNumber: true,
  createdDate: true,
  lastModified: true,
  status: true,
  version: true,
  documents: true
}).extend({
  documents: z.array(z.instanceof(File)).optional(),
  timeline: z.object({
    effectiveDate: z.date(),
    expiryDate: z.date(),
    renewalDate: z.date().optional()
  })
})

// Contract template validation
export const contractTemplateSchema = z.object({
  name: z.string()
    .min(3, 'اسم القالب قصير جداً')
    .max(150, 'اسم القالب طويل جداً'),
  description: z.string()
    .min(10, 'وصف القالب قصير جداً')
    .max(500, 'وصف القالب طويل جداً'),
  category: z.enum(['design', 'printing', 'supply_chain', 'marketing', 'technology', 'general']),
  type: z.enum(['service', 'supply', 'partnership', 'licensing', 'maintenance', 'consulting']),
  language: z.enum(['ar', 'en']),
  version: z.string().min(1, 'رقم إصدار القالب مطلوب'),
  isActive: z.boolean(),
  structure: z.object({
    header: z.string().min(10, 'رأس القالب قصير جداً'),
    sections: z.array(z.object({
      title: z.string().min(1, 'عنوان القسم مطلوب'),
      content: z.string().min(1, 'محتوى القسم مطلوب'),
      order: z.number().min(1, 'ترتيب القسم مطلوب'),
      isRequired: z.boolean(),
      variables: z.array(z.string()).optional()
    })).min(1, 'القالب يحتاج إلى قسم واحد على الأقل'),
    footer: z.string().min(5, 'تذييل القالب قصير جداً')
  }),
  defaultTerms: z.array(contractTermSchema.omit({ id: true })),
  defaultFinancials: contractFinancialsSchema.partial(),
  defaultDeliverables: z.array(contractDeliverableSchema.omit({ id: true })),
  tags: z.array(z.string().max(50, 'العلامة طويلة جداً'))
})

// Validation helper functions
export const validateContract = (contract: any) => {
  try {
    return {
      success: true,
      data: contractSchema.parse(contract),
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
      errors: [{ field: 'general', message: 'خطأ في التحقق من بيانات العقد' }]
    }
  }
}

export const validateContractForm = (formData: any) => {
  try {
    return {
      success: true,
      data: contractFormSchema.parse(formData),
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
      errors: [{ field: 'general', message: 'خطأ في التحقق من بيانات نموذج العقد' }]
    }
  }
}

export const validateContractTemplate = (template: any) => {
  try {
    return {
      success: true,
      data: contractTemplateSchema.parse(template),
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
      errors: [{ field: 'general', message: 'خطأ في التحقق من بيانات قالب العقد' }]
    }
  }
}

export const validateContractNumber = (contractNumber: string): boolean => {
  try {
    contractNumberSchema.parse(contractNumber)
    return true
  } catch {
    return false
  }
}

export const generateContractNumber = (): string => {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 900000) + 100000
  return `CON-${year}-${randomNum}`
}
