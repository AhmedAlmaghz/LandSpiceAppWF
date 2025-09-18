/**
 * نظام التحقق من بيانات الفوترة والمدفوعات اليمني
 * نظام إدارة لاند سبايس - الوحدة العاشرة
 */

import {
  YemeniInvoice,
  InvoiceItem,
  PaymentRecord,
  PaymentMethod,
  YEMEN_VAT_RATE
} from './types'

import { validateYemeniPhone } from '../financial/validation'

// نتائج التحقق
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion: string
}

// ===============================
// التحقق من الفواتير
// ===============================

/**
 * التحقق من صحة الفاتورة اليمنية
 */
export function validateYemeniInvoice(invoice: YemeniInvoice): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // التحقق من المعرفات الأساسية
  if (!invoice.id || invoice.id.trim().length === 0) {
    errors.push({
      field: 'id',
      message: 'معرف الفاتورة مطلوب',
      code: 'INVOICE_ID_REQUIRED',
      severity: 'error'
    })
  }

  if (!invoice.invoiceNumber || invoice.invoiceNumber.trim().length === 0) {
    errors.push({
      field: 'invoiceNumber',
      message: 'رقم الفاتورة مطلوب',
      code: 'INVOICE_NUMBER_REQUIRED',
      severity: 'error'
    })
  } else if (!isValidInvoiceNumber(invoice.invoiceNumber)) {
    errors.push({
      field: 'invoiceNumber',
      message: 'رقم الفاتورة غير صالح. يجب أن يكون بالتنسيق: INV-YYYY-NNNN',
      code: 'INVALID_INVOICE_NUMBER_FORMAT',
      severity: 'error'
    })
  }

  // التحقق من بيانات المطعم
  validateRestaurantInfo(invoice, errors, warnings)

  // التحقق من التواريخ
  validateInvoiceDates(invoice, errors, warnings)

  // التحقق من البنود
  validateInvoiceItems(invoice.items, errors, warnings)

  // التحقق من الحسابات المالية
  validateInvoiceCalculations(invoice, errors, warnings)

  // التحقق من طريقة الدفع
  validatePaymentMethodType(invoice.paymentMethod, errors)

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * التحقق من صحة رقم الفاتورة
 */
function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // تنسيق مقترح: INV-2025-0001 أو LSI-2025-0001
  const pattern = /^(INV|LSI)-\d{4}-\d{4,6}$/
  return pattern.test(invoiceNumber)
}

/**
 * التحقق من بيانات المطعم في الفاتورة
 */
function validateRestaurantInfo(
  invoice: YemeniInvoice,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!invoice.restaurantId || invoice.restaurantId.trim().length === 0) {
    errors.push({
      field: 'restaurantId',
      message: 'معرف المطعم مطلوب',
      code: 'RESTAURANT_ID_REQUIRED',
      severity: 'error'
    })
  }

  if (!invoice.restaurantName || invoice.restaurantName.trim().length === 0) {
    errors.push({
      field: 'restaurantName',
      message: 'اسم المطعم مطلوب',
      code: 'RESTAURANT_NAME_REQUIRED',
      severity: 'error'
    })
  }

  // التحقق من رقم الهاتف اليمني
  if (invoice.restaurantPhone) {
    const phoneValidation = validateYemeniPhone(invoice.restaurantPhone)
    if (!phoneValidation.isValid) {
      errors.push({
        field: 'restaurantPhone',
        message: 'رقم هاتف المطعم غير صالح',
        code: 'INVALID_RESTAURANT_PHONE',
        severity: 'error'
      })
    }
  }
}

/**
 * التحقق من تواريخ الفاتورة
 */
function validateInvoiceDates(
  invoice: YemeniInvoice,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const now = new Date()

  if (!invoice.issueDate) {
    errors.push({
      field: 'issueDate',
      message: 'تاريخ إصدار الفاتورة مطلوب',
      code: 'ISSUE_DATE_REQUIRED',
      severity: 'error'
    })
  } else if (invoice.issueDate > now) {
    errors.push({
      field: 'issueDate',
      message: 'تاريخ إصدار الفاتورة لا يمكن أن يكون في المستقبل',
      code: 'ISSUE_DATE_FUTURE',
      severity: 'error'
    })
  }

  if (!invoice.dueDate) {
    errors.push({
      field: 'dueDate',
      message: 'تاريخ استحقاق الفاتورة مطلوب',
      code: 'DUE_DATE_REQUIRED',
      severity: 'error'
    })
  } else if (invoice.issueDate && invoice.dueDate <= invoice.issueDate) {
    errors.push({
      field: 'dueDate',
      message: 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ الإصدار',
      code: 'DUE_DATE_BEFORE_ISSUE',
      severity: 'error'
    })
  }
}

/**
 * التحقق من بنود الفاتورة
 */
function validateInvoiceItems(
  items: InvoiceItem[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!items || items.length === 0) {
    errors.push({
      field: 'items',
      message: 'يجب أن تحتوي الفاتورة على بند واحد على الأقل',
      code: 'NO_INVOICE_ITEMS',
      severity: 'error'
    })
    return
  }

  items.forEach((item, index) => {
    const prefix = `items[${index}]`

    if (!item.description || item.description.trim().length === 0) {
      errors.push({
        field: `${prefix}.description`,
        message: `وصف البند رقم ${index + 1} مطلوب`,
        code: 'ITEM_DESCRIPTION_REQUIRED',
        severity: 'error'
      })
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push({
        field: `${prefix}.quantity`,
        message: `كمية البند رقم ${index + 1} يجب أن تكون أكبر من صفر`,
        code: 'INVALID_ITEM_QUANTITY',
        severity: 'error'
      })
    }

    if (!item.unitPrice || item.unitPrice <= 0) {
      errors.push({
        field: `${prefix}.unitPrice`,
        message: `سعر الوحدة للبند رقم ${index + 1} يجب أن يكون أكبر من صفر`,
        code: 'INVALID_UNIT_PRICE',
        severity: 'error'
      })
    }

    if (item.discount < 0 || item.discount > 100) {
      errors.push({
        field: `${prefix}.discount`,
        message: `نسبة الخصم للبند رقم ${index + 1} يجب أن تكون بين 0 و 100`,
        code: 'INVALID_DISCOUNT_RATE',
        severity: 'error'
      })
    }

    // التحقق من حساب المجاميع
    validateItemCalculations(item, index, errors)
  })
}

/**
 * التحقق من حسابات بند الفاتورة
 */
function validateItemCalculations(
  item: InvoiceItem,
  index: number,
  errors: ValidationError[]
): void {
  if (item.quantity && item.unitPrice) {
    const expectedSubtotal = item.quantity * item.unitPrice
    const expectedDiscountAmount = expectedSubtotal * (item.discount / 100)
    const expectedAfterDiscount = expectedSubtotal - expectedDiscountAmount
    const expectedVatAmount = expectedAfterDiscount * item.vatRate
    const expectedTotal = expectedAfterDiscount + expectedVatAmount

    if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
      errors.push({
        field: `items[${index}].subtotal`,
        message: `المجموع الفرعي للبند رقم ${index + 1} غير صحيح`,
        code: 'INCORRECT_SUBTOTAL',
        severity: 'error'
      })
    }

    if (Math.abs(item.total - expectedTotal) > 0.01) {
      errors.push({
        field: `items[${index}].total`,
        message: `المجموع الإجمالي للبند رقم ${index + 1} غير صحيح`,
        code: 'INCORRECT_ITEM_TOTAL',
        severity: 'error'
      })
    }
  }
}

/**
 * التحقق من حسابات الفاتورة الإجمالية
 */
function validateInvoiceCalculations(
  invoice: YemeniInvoice,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!invoice.items || invoice.items.length === 0) {
    return
  }

  const expectedSubtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0)
  const expectedTotal = invoice.items.reduce((sum, item) => sum + item.total, 0)

  if (Math.abs(invoice.subtotal - expectedSubtotal) > 0.01) {
    errors.push({
      field: 'subtotal',
      message: 'المجموع الفرعي للفاتورة غير صحيح',
      code: 'INCORRECT_INVOICE_SUBTOTAL',
      severity: 'error'
    })
  }

  if (Math.abs(invoice.total - expectedTotal) > 0.01) {
    errors.push({
      field: 'total',
      message: 'المبلغ الإجمالي للفاتورة غير صحيح',
      code: 'INCORRECT_INVOICE_TOTAL',
      severity: 'error'
    })
  }

  // تحذيرات المبالغ
  if (invoice.total > 1000000) {
    warnings.push({
      field: 'total',
      message: 'قيمة الفاتورة كبيرة جداً',
      suggestion: 'تأكد من صحة المبلغ قبل الإرسال'
    })
  }
}

/**
 * التحقق من طريقة الدفع
 */
function validatePaymentMethodType(
  paymentMethod: PaymentMethod,
  errors: ValidationError[]
): void {
  const validMethods: PaymentMethod[] = [
    'cash', 'bank_transfer', 'check', 'qasimi_bank',
    'ahli_bank', 'saba_bank', 'credit', 'exchange_house', 'installments'
  ]

  if (!validMethods.includes(paymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: 'طريقة الدفع غير مدعومة',
      code: 'INVALID_PAYMENT_METHOD',
      severity: 'error'
    })
  }
}

// ===============================
// التحقق من المدفوعات
// ===============================

/**
 * التحقق من صحة المدفوعة
 */
export function validatePaymentRecord(payment: PaymentRecord): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (!payment.id || payment.id.trim().length === 0) {
    errors.push({
      field: 'id',
      message: 'معرف المدفوعة مطلوب',
      code: 'PAYMENT_ID_REQUIRED',
      severity: 'error'
    })
  }

  if (!payment.paymentNumber || payment.paymentNumber.trim().length === 0) {
    errors.push({
      field: 'paymentNumber',
      message: 'رقم المدفوعة مطلوب',
      code: 'PAYMENT_NUMBER_REQUIRED',
      severity: 'error'
    })
  }

  if (!payment.invoiceId || payment.invoiceId.trim().length === 0) {
    errors.push({
      field: 'invoiceId',
      message: 'معرف الفاتورة مطلوب',
      code: 'INVOICE_ID_REQUIRED',
      severity: 'error'
    })
  }

  validatePaymentAmount(payment, errors, warnings)
  validatePaymentDate(payment, errors, warnings)
  validatePaymentMethodType(payment.paymentMethod, errors)

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * التحقق من مبلغ المدفوعة
 */
function validatePaymentAmount(
  payment: PaymentRecord,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!payment.amount || payment.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'مبلغ المدفوعة يجب أن يكون أكبر من صفر',
      code: 'INVALID_PAYMENT_AMOUNT',
      severity: 'error'
    })
  }

  if (payment.currency !== 'YER' && (!payment.exchangeRate || payment.exchangeRate <= 0)) {
    errors.push({
      field: 'exchangeRate',
      message: 'سعر الصرف مطلوب للعملات الأجنبية',
      code: 'EXCHANGE_RATE_REQUIRED',
      severity: 'error'
    })
  }

  if (payment.amountInYER > 10000000) {
    warnings.push({
      field: 'amount',
      message: 'مبلغ الدفع كبير جداً',
      suggestion: 'تأكد من صحة المبلغ والموافقة المسبقة'
    })
  }
}

/**
 * التحقق من تاريخ الدفع
 */
function validatePaymentDate(
  payment: PaymentRecord,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!payment.paymentDate) {
    errors.push({
      field: 'paymentDate',
      message: 'تاريخ الدفع مطلوب',
      code: 'PAYMENT_DATE_REQUIRED',
      severity: 'error'
    })
    return
  }

  const now = new Date()
  if (payment.paymentDate > now) {
    errors.push({
      field: 'paymentDate',
      message: 'تاريخ الدفع لا يمكن أن يكون في المستقبل',
      code: 'PAYMENT_DATE_FUTURE',
      severity: 'error'
    })
  }
}

// ===============================
// دوال مساعدة
// ===============================

/**
 * حساب ضريبة القيمة المضافة
 */
export function calculateVAT(amount: number, vatRate: number = YEMEN_VAT_RATE): number {
  return Math.round(amount * vatRate * 100) / 100
}

/**
 * حساب المبلغ بعد الخصم
 */
export function calculateAfterDiscount(amount: number, discountRate: number): number {
  const discountAmount = amount * (discountRate / 100)
  return Math.round((amount - discountAmount) * 100) / 100
}

/**
 * تحويل المبلغ إلى كلمات (باللغة العربية)
 */
export function convertAmountToWords(amount: number, currency: string = 'YER'): string {
  // تطبيق مبسط لتحويل الأرقام إلى كلمات
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
  const teens = ['عشرة', 'أحد عشر', 'اثني عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر']
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
  
  if (amount === 0) return 'صفر'
  
  // تطبيق مبسط - يمكن توسيعه لاحقاً
  const currencyName = currency === 'YER' ? 'ريال يمني' : currency
  return `${Math.floor(amount)} ${currencyName}`
}

/**
 * التحقق من صيغة رقم الحساب البنكي اليمني
 */
export function isValidYemeniBankAccount(accountNumber: string, bankName?: string): boolean {
  if (!accountNumber || accountNumber.trim().length === 0) return false
  
  // أنماط مختلفة حسب البنك
  const patterns = {
    'qasimi_bank': /^\d{10,14}$/,
    'ahli_bank': /^\d{12,16}$/,
    'saba_bank': /^\d{10,12}$/,
    'default': /^\d{8,16}$/
  }
  
  const pattern = bankName ? patterns[bankName as keyof typeof patterns] || patterns.default : patterns.default
  return pattern.test(accountNumber.replace(/\s/g, ''))
}

/**
 * التحقق من صحة الرقم المرجعي للتحويل
 */
export function isValidTransferReference(reference: string): boolean {
  // الرقم المرجعي يجب أن يكون 8-20 رقم أو حرف
  return /^[A-Za-z0-9]{8,20}$/.test(reference)
}

/**
 * دالة شاملة للتحقق من الفوترة
 */
export function validateBillingData(invoice: YemeniInvoice, payments?: PaymentRecord[]): ValidationResult {
  const invoiceValidation = validateYemeniInvoice(invoice)
  
  if (!payments || payments.length === 0) {
    return invoiceValidation
  }
  
  const allErrors = [...invoiceValidation.errors]
  const allWarnings = [...invoiceValidation.warnings]
  
  payments.forEach((payment, index) => {
    const paymentValidation = validatePaymentRecord(payment)
    
    paymentValidation.errors.forEach(error => {
      allErrors.push({
        ...error,
        field: `payments[${index}].${error.field}`
      })
    })
    
    paymentValidation.warnings.forEach(warning => {
      allWarnings.push({
        ...warning,
        field: `payments[${index}].${warning.field}`
      })
    })
  })
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

export default {
  validateYemeniInvoice,
  validatePaymentRecord,
  validateBillingData,
  calculateVAT,
  calculateAfterDiscount,
  convertAmountToWords,
  isValidYemeniBankAccount,
  isValidTransferReference
}
