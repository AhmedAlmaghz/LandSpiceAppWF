// Contract Data Validation
// التحقق من صحة بيانات العقود

import { z } from 'zod'

// Basic validation schemas
export const contractNumberSchema = z.string()
  .min(5, 'رقم العقد يجب أن يكون 5 أحرف على الأقل')
  .max(20, 'رقم العقد طويل جداً')

export const monetaryAmountSchema = z.number()
  .min(0, 'المبلغ لا يمكن أن يكون سالب')
  .max(100000000, 'المبلغ مرتفع جداً')

export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
}).refine(data => data.endDate > data.startDate, {
  message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
  path: ['endDate']
})

// Contract party validation
export const contractPartySchema = z.object({
  type: z.enum(['restaurant', 'bank', 'supplier', 'landspice', 'marketer']),
  name: z.string()
    .min(2, 'اسم الطرف مطلوب')
    .max(100, 'اسم الطرف طويل جداً'),
  legalName: z.string()
    .min(2, 'الاسم القانوني مطلوب')
    .max(150, 'الاسم القانوني طويل جداً'),
  representative: z.object({
    name: z.string()
      .min(2, 'اسم الممثل مطلوب')
      .max(100, 'اسم الممثل طويل جداً'),
    position: z.string()
      .min(2, 'منصب الممثل مطلوب')
      .max(50, 'منصب الممثل طويل جداً'),
    email: z.string()
      .email('البريد الإلكتروني غير صحيح'),
    phone: z.string()
      .regex(/^(\+966|0)?[5-9]\d{8}$/, 'رقم الهاتف غير صحيح')
  }),
  signatureAuthority: z.boolean(),
  signedAt: z.date().optional(),
  signatureMethod: z.enum(['physical', 'digital', 'electronic']).optional()
})

// Contract term validation
export const contractTermSchema = z.object({
  title: z.string()
    .min(3, 'عنوان البند مطلوب')
    .max(200, 'عنوان البند طويل جداً'),
  description: z.string()
    .min(10, 'وصف البند قصير جداً')
    .max(2000, 'وصف البند طويل جداً'),
  category: z.enum(['payment', 'delivery', 'quality', 'liability', 'termination', 'other']),
  mandatory: z.boolean(),
  negotiable: z.boolean(),
  defaultValue: z.string().optional(),
  acceptedValue: z.string().optional()
})

// Contract milestone validation
export const contractMilestoneSchema = z.object({
  title: z.string()
    .min(3, 'عنوان المرحلة مطلوب')
    .max(200, 'عنوان المرحلة طويل جداً'),
  description: z.string()
    .min(10, 'وصف المرحلة مطلوب')
    .max(1000, 'وصف المرحلة طويل جداً'),
  dueDate: z.date()
    .refine(date => date > new Date(), 'تاريخ الاستحقاق يجب أن يكون في المستقبل'),
  completedDate: z.date().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue', 'cancelled']),
  responsible: z.string()
    .min(1, 'المسؤول عن المرحلة مطلوب'),
  deliverables: z.array(z.string())
    .min(1, 'يجب تحديد مخرجات المرحلة'),
  dependencies: z.array(z.string()).optional()
})

// Contract payment validation
export const contractPaymentSchema = z.object({
  description: z.string()
    .min(3, 'وصف الدفعة مطلوب')
    .max(200, 'وصف الدفعة طويل جداً'),
  amount: monetaryAmountSchema,
  currency: z.enum(['SAR', 'USD', 'EUR']),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  paidAmount: monetaryAmountSchema.optional(),
  status: z.enum(['pending', 'partial', 'paid', 'overdue', 'waived']),
  paymentMethod: z.enum(['bank_transfer', 'check', 'cash', 'online']).optional(),
  invoiceId: z.string().optional(),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional()
})

// Contract document validation
export const contractDocumentSchema = z.object({
  title: z.string()
    .min(3, 'عنوان المستند مطلوب')
    .max(200, 'عنوان المستند طويل جداً'),
  type: z.enum(['contract', 'amendment', 'attachment', 'specification', 'drawing', 'certificate', 'other']),
  fileName: z.string()
    .min(1, 'اسم الملف مطلوب'),
  fileSize: z.number()
    .min(1, 'حجم الملف غير صحيح')
    .max(50 * 1024 * 1024, 'حجم الملف كبير جداً (أكثر من 50MB)'),
  version: z.string()
    .regex(/^\d+\.\d+$/, 'رقم الإصدار يجب أن يكون بالشكل 1.0'),
  status: z.enum(['draft', 'final', 'archived'])
})

// Main contract validation schema
export const contractSchema = z.object({
  contractNumber: contractNumberSchema,
  title: z.string()
    .min(5, 'عنوان العقد قصير جداً')
    .max(200, 'عنوان العقد طويل جداً'),
  description: z.string()
    .min(20, 'وصف العقد قصير جداً')
    .max(2000, 'وصف العقد طويل جداً'),
  type: z.enum(['design', 'printing', 'supply', 'maintenance', 'marketing']),
  status: z.enum(['draft', 'pending_review', 'under_negotiation', 'approved', 'signed', 'active', 'completed', 'terminated', 'expired']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  parties: z.array(contractPartySchema)
    .min(2, 'يجب أن يحتوي العقد على طرفين على الأقل')
    .max(10, 'عدد الأطراف كبير جداً'),
  
  startDate: z.date(),
  endDate: z.date(),
  autoRenewal: z.boolean(),
  renewalPeriod: z.number()
    .min(1, 'فترة التجديد يجب أن تكون شهر واحد على الأقل')
    .max(60, 'فترة التجديد طويلة جداً')
    .optional(),
  noticePeriod: z.number()
    .min(1, 'فترة الإشعار يجب أن تكون يوم واحد على الأقل')
    .max(365, 'فترة الإشعار طويلة جداً'),
  
  totalValue: monetaryAmountSchema,
  currency: z.enum(['SAR', 'USD', 'EUR']),
  paymentTerms: z.array(contractPaymentSchema)
    .min(1, 'يجب تحديد شروط الدفع'),
  
  terms: z.array(contractTermSchema)
    .min(1, 'يجب تحديد شروط العقد'),
    
  milestones: z.array(contractMilestoneSchema)
    .optional(),
    
  riskLevel: z.enum(['low', 'medium', 'high']),
  tags: z.array(z.string()),
  categories: z.array(z.string())
}).refine(data => data.endDate > data.startDate, {
  message: 'تاريخ انتهاء العقد يجب أن يكون بعد تاريخ البداية',
  path: ['endDate']
}).refine(data => {
  // Check if payment amounts sum up to total value
  const paymentsTotal = data.paymentTerms.reduce((sum, payment) => sum + payment.amount, 0)
  return Math.abs(paymentsTotal - data.totalValue) < 0.01 // Allow small floating point differences
}, {
  message: 'مجموع الدفعات يجب أن يساوي القيمة الإجمالية للعقد',
  path: ['paymentTerms']
})

// Contract template validation
export const contractTemplateSchema = z.object({
  name: z.string()
    .min(3, 'اسم القالب مطلوب')
    .max(100, 'اسم القالب طويل جداً'),
  description: z.string()
    .min(10, 'وصف القالب مطلوب')
    .max(500, 'وصف القالب طويل جداً'),
  type: z.enum(['design', 'printing', 'supply', 'maintenance', 'marketing']),
  version: z.string()
    .regex(/^\d+\.\d+$/, 'رقم الإصدار يجب أن يكون بالشكل 1.0'),
  isActive: z.boolean(),
  
  sections: z.array(z.object({
    title: z.string()
      .min(3, 'عنوان القسم مطلوب')
      .max(100, 'عنوان القسم طويل جداً'),
    order: z.number()
      .min(1, 'ترتيب القسم يجب أن يكون 1 أو أكثر'),
    required: z.boolean(),
    content: z.string()
      .min(10, 'محتوى القسم مطلوب'),
    variables: z.array(z.string())
  })).min(1, 'يجب أن يحتوي القالب على قسم واحد على الأقل'),
  
  legalReview: z.boolean()
})

// Form validation schema
export const contractFormSchema = contractSchema.omit({
  contractNumber: true,
  status: true
}).extend({
  documents: z.array(z.instanceof(File)).optional()
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
      errors: [{ field: 'general', message: 'خطأ في التحقق من بيانات النموذج' }]
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
      errors: [{ field: 'general', message: 'خطأ في التحقق من بيانات القالب' }]
    }
  }
}

// Business logic validations
export const validatePaymentSchedule = (payments: any[], totalValue: number) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return { valid: false, message: 'يجب تحديد جدول الدفعات' }
  }
  
  const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  
  if (Math.abs(totalPayments - totalValue) > 0.01) {
    return { 
      valid: false, 
      message: `مجموع الدفعات (${totalPayments}) لا يساوي القيمة الإجمالية (${totalValue})` 
    }
  }
  
  return { valid: true }
}

export const validateMilestoneDependencies = (milestones: any[]) => {
  const milestoneIds = milestones.map(m => m.id)
  
  for (const milestone of milestones) {
    if (milestone.dependencies) {
      for (const depId of milestone.dependencies) {
        if (!milestoneIds.includes(depId)) {
          return { 
            valid: false, 
            message: `المرحلة "${milestone.title}" تعتمد على مرحلة غير موجودة` 
          }
        }
      }
    }
  }
  
  return { valid: true }
}

export const validateContractDates = (startDate: Date, endDate: Date, milestones: any[] = []) => {
  if (endDate <= startDate) {
    return { valid: false, message: 'تاريخ انتهاء العقد يجب أن يكون بعد تاريخ البداية' }
  }
  
  for (const milestone of milestones) {
    const dueDate = new Date(milestone.dueDate)
    if (dueDate < startDate || dueDate > endDate) {
      return { 
        valid: false, 
        message: `تاريخ استحقاق المرحلة "${milestone.title}" خارج نطاق العقد` 
      }
    }
  }
  
  return { valid: true }
}
