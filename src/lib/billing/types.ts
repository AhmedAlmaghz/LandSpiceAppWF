/**
 * أنواع البيانات لنظام الفوترة والمدفوعات اليمني
 * نظام إدارة لاند سبايس - الوحدة العاشرة
 * 
 * هذا الملف يحتوي على جميع أنواع البيانات المتعلقة بالفوترة والمدفوعات
 * مع مراعاة الخصوصيات اليمنية والمتطلبات المحلية
 */

import { CurrencyCode, YemeniBank } from '../financial/types'

// ===============================
// أساسيات الفوترة اليمنية
// ===============================

/**
 * حالات الفاتورة في النظام اليمني
 */
export type InvoiceStatus = 
  | 'draft'        // مسودة - لم يتم إرسالها بعد
  | 'sent'         // مرسلة - تم إرسالها للمطعم
  | 'delivered'    // مُسلمة - تم استلامها من المطعم
  | 'paid'         // مدفوعة - تم دفعها بالكامل
  | 'partial_paid' // مدفوعة جزئياً - دفع جزئي
  | 'overdue'      // متأخرة - تجاوزت تاريخ الاستحقاق
  | 'disputed'     // محل خلاف - هناك اعتراض عليها
  | 'cancelled'    // ملغاة - تم إلغاؤها
  | 'refunded'     // مسترجعة - تم استرداد المبلغ

/**
 * أنواع الفواتير في نظام لاند سبايس
 */
export type InvoiceType = 
  | 'monthly'      // فاتورة شهرية منتظمة
  | 'service'      // فاتورة خدمة إضافية
  | 'setup'        // فاتورة إعداد وتركيب
  | 'maintenance'  // فاتورة صيانة
  | 'consultation' // فاتورة استشارة
  | 'design'       // فاتورة تصميم
  | 'training'     // فاتورة تدريب
  | 'emergency'    // فاتورة طوارئ

/**
 * فترات الفوترة المتاحة
 */
export type BillingPeriod = 
  | 'monthly'      // شهرياً
  | 'quarterly'    // ربع سنوي
  | 'semi_annual'  // نصف سنوي
  | 'annual'       // سنوي
  | 'one_time'     // مرة واحدة

/**
 * أولويات الفواتير
 */
export type InvoicePriority = 'low' | 'normal' | 'high' | 'urgent'

// ===============================
// بيانات الفاتورة الأساسية
// ===============================

/**
 * بند الفاتورة - عنصر واحد في الفاتورة
 */
export interface InvoiceItem {
  id: string
  description: string              // وصف الخدمة أو المنتج
  category: ItemCategory          // تصنيف البند
  quantity: number                // الكمية
  unitPrice: number              // سعر الوحدة بالريال اليمني
  discount: number               // خصم على البند (نسبة مئوية)
  discountAmount: number         // مبلغ الخصم الفعلي
  subtotal: number               // المجموع الفرعي قبل الضريبة
  vatRate: number                // معدل ضريبة القيمة المضافة (عادة 5%)
  vatAmount: number              // مبلغ ضريبة القيمة المضافة
  total: number                  // المجموع الإجمالي للبند
  notes?: string                 // ملاحظات إضافية
  startDate?: Date               // تاريخ بداية الخدمة
  endDate?: Date                 // تاريخ نهاية الخدمة
  restaurantSpecific?: boolean   // خاص بمطعم محدد
}

/**
 * تصنيفات بنود الفاتورة
 */
export type ItemCategory = 
  | 'management'     // إدارة المطعم
  | 'design'         // التصميم
  | 'setup'          // الإعداد والتركيب
  | 'maintenance'    // الصيانة
  | 'consultation'   // الاستشارات
  | 'training'       // التدريب
  | 'supplies'       // المستلزمات
  | 'equipment'      // المعدات
  | 'software'       // البرمجيات
  | 'other'          // أخرى

/**
 * الفاتورة اليمنية الكاملة
 */
export interface YemeniInvoice {
  // معرفات أساسية
  id: string
  invoiceNumber: string           // رقم الفاتورة (تسلسلي)
  referenceNumber?: string        // رقم مرجعي إضافي
  
  // بيانات المطعم
  restaurantId: string           // معرف المطعم
  restaurantName: string         // اسم المطعم
  restaurantAddress: string      // عنوان المطعم
  restaurantPhone: string        // رقم هاتف المطعم
  restaurantEmail?: string       // بريد المطعم الإلكتروني
  contactPerson: string          // الشخص المسؤول
  
  // تواريخ مهمة
  issueDate: Date                // تاريخ إصدار الفاتورة
  dueDate: Date                  // تاريخ الاستحقاق
  periodStart: Date              // بداية فترة الخدمة
  periodEnd: Date                // نهاية فترة الخدمة
  
  // تصنيف الفاتورة
  type: InvoiceType              // نوع الفاتورة
  period: BillingPeriod          // فترة الفوترة
  priority: InvoicePriority      // أولوية الفاتورة
  
  // بنود الفاتورة
  items: InvoiceItem[]           // قائمة بنود الفاتورة
  
  // الحسابات المالية
  subtotal: number               // المجموع الفرعي
  discountRate: number           // معدل الخصم العام (نسبة مئوية)
  discountAmount: number         // مبلغ الخصم
  vatRate: number                // معدل ضريبة القيمة المضافة
  vatAmount: number              // مبلغ ضريبة القيمة المضافة
  total: number                  // المبلغ الإجمالي
  amountInWords: string          // المبلغ بالكلمات
  
  // العملة والدفع
  currency: CurrencyCode         // العملة (YER افتراضي)
  exchangeRate?: number          // سعر الصرف (للعملات الأجنبية)
  paymentTerms: string           // شروط الدفع
  paymentMethod: PaymentMethod   // طريقة الدفع المقترحة
  
  // الحالة والتتبع
  status: InvoiceStatus          // حالة الفاتورة
  sentDate?: Date                // تاريخ الإرسال
  deliveredDate?: Date           // تاريخ التسليم
  readDate?: Date                // تاريخ القراءة
  
  // ملاحظات وتفاصيل إضافية
  notes?: string                 // ملاحظات عامة
  internalNotes?: string         // ملاحظات داخلية
  termsAndConditions: string     // الشروط والأحكام
  
  // معلومات إدارية
  createdBy: string              // منشئ الفاتورة
  approvedBy?: string            // معتمد الفاتورة
  createdAt: Date                // تاريخ الإنشاء
  updatedAt: Date                // تاريخ آخر تحديث
  
  // المرفقات والوثائق
  attachments: string[]          // قائمة المرفقات
  legalDocuments: string[]       // الوثائق القانونية
  
  // التكامل مع الأنظمة الأخرى
  accountingEntryId?: string     // معرف القيد المحاسبي المرتبط
  contractId?: string            // معرف العقد المرتبط
}

// ===============================
// نظام المدفوعات اليمني
// ===============================

/**
 * طرق الدفع المتاحة في اليمن
 */
export type PaymentMethod = 
  | 'cash'           // نقداً
  | 'bank_transfer'  // تحويل بنكي
  | 'check'          // شيك
  | 'qasimi_bank'    // بنك القاسمي
  | 'ahli_bank'      // البنك الأهلي
  | 'saba_bank'      // بنك سبأ
  | 'credit'         // آجل (دين)
  | 'exchange_house' // صرافة
  | 'installments'   // أقساط

/**
 * حالات المدفوعات
 */
export type PaymentStatus = 
  | 'pending'        // معلق - في انتظار المعالجة
  | 'processing'     // قيد المعالجة
  | 'confirmed'      // مؤكد - تم استلام المبلغ
  | 'failed'         // فاشل - لم يتم الدفع
  | 'cancelled'      // ملغي
  | 'refunded'       // مسترجع
  | 'disputed'       // محل خلاف

/**
 * أنواع المدفوعات
 */
export type PaymentType = 
  | 'full'           // دفع كامل
  | 'partial'        // دفع جزئي
  | 'advance'        // دفع مقدم
  | 'installment'    // قسط
  | 'refund'         // استرداد
  | 'adjustment'     // تعديل

/**
 * سجل دفع واحد
 */
export interface PaymentRecord {
  // معرفات أساسية
  id: string
  paymentNumber: string          // رقم الدفع التسلسلي
  invoiceId: string              // معرف الفاتورة
  invoiceNumber: string          // رقم الفاتورة للمرجع
  
  // تفاصيل المبلغ
  amount: number                 // المبلغ المدفوع
  currency: CurrencyCode         // العملة
  exchangeRate?: number          // سعر الصرف
  amountInYER: number            // المبلغ بالريال اليمني
  
  // تفاصيل الدفع
  paymentDate: Date              // تاريخ الدفع
  paymentMethod: PaymentMethod   // طريقة الدفع
  type: PaymentType              // نوع الدفع
  
  // تفاصيل البنك أو الجهة
  bankName?: YemeniBank          // اسم البنك
  accountNumber?: string         // رقم الحساب
  referenceNumber: string        // الرقم المرجعي للمعاملة
  checkNumber?: string           // رقم الشيك
  
  // التوثيق
  receiptNumber: string          // رقم الإيصال
  receiptIssued: boolean         // تم إصدار الإيصال
  receiptDate?: Date             // تاريخ إصدار الإيصال
  
  // المسؤولية
  receivedBy: string             // مستلم المبلغ
  processedBy: string            // معالج العملية
  approvedBy?: string            // معتمد العملية
  
  // الحالة والتتبع
  status: PaymentStatus          // حالة المدفوعة
  confirmationDate?: Date        // تاريخ التأكيد
  
  // ملاحظات
  notes?: string                 // ملاحظات عامة
  internalNotes?: string         // ملاحظات داخلية
  
  // المرفقات
  attachments: string[]          // صور الإيصالات أو الوثائق
  bankSlip?: string              // صورة إيصال البنك
  
  // التواريخ الإدارية
  createdAt: Date                // تاريخ الإنشاء
  updatedAt: Date                // تاريخ آخر تحديث
  
  // التكامل
  accountingEntryId?: string     // معرف القيد المحاسبي
}

// ===============================
// تقارير الفوترة والمدفوعات
// ===============================

/**
 * ملخص الفوترة للمطعم
 */
export interface RestaurantBillingSummary {
  restaurantId: string
  restaurantName: string
  period: {
    start: Date
    end: Date
  }
  
  // إحصائيات الفواتير
  totalInvoices: number          // إجمالي الفواتير
  totalAmount: number            // إجمالي المبلغ
  paidAmount: number             // المبلغ المدفوع
  unpaidAmount: number           // المبلغ غير المدفوع
  overdueAmount: number          // المبلغ المتأخر
  
  // معدلات الأداء
  paymentRate: number            // معدل الدفع (نسبة مئوية)
  averagePaymentTime: number     // متوسط وقت الدفع (بالأيام)
  
  // تفاصيل الفواتير
  invoicesByStatus: Record<InvoiceStatus, number>
  paymentsByMethod: Record<PaymentMethod, number>
  
  lastInvoiceDate: Date
  nextInvoiceDate: Date
}

/**
 * تقرير المدفوعات اليومي
 */
export interface DailyPaymentReport {
  date: Date
  
  // إحصائيات عامة
  totalPayments: number          // إجمالي المدفوعات
  totalAmount: number            // إجمالي المبلغ
  
  // تفصيل حسب طريقة الدفع
  paymentsByMethod: {
    method: PaymentMethod
    count: number
    amount: number
  }[]
  
  // تفصيل حسب البنك
  paymentsByBank: {
    bank: YemeniBank
    count: number
    amount: number
  }[]
  
  // الفواتير المدفوعة
  paidInvoices: {
    invoiceId: string
    invoiceNumber: string
    restaurantName: string
    amount: number
    paymentMethod: PaymentMethod
  }[]
}

/**
 * إحصائيات الأداء المالي
 */
export interface BillingPerformanceStats {
  period: {
    start: Date
    end: Date
  }
  
  // مؤشرات الفوترة
  invoicing: {
    totalInvoices: number
    totalRevenue: number
    averageInvoiceValue: number
    invoicesPerRestaurant: number
  }
  
  // مؤشرات التحصيل
  collection: {
    collectionRate: number         // معدل التحصيل
    averageCollectionTime: number  // متوسط وقت التحصيل
    overdueRate: number            // معدل التأخير
    badDebtRate: number            // معدل الديون المعدومة
  }
  
  // الاتجاهات
  trends: {
    revenueGrowth: number          // نمو الإيرادات
    collectionImprovement: number  // تحسن التحصيل
    customerRetention: number      // الاحتفاظ بالعملاء
  }
}

// ===============================
// إعدادات الفوترة
// ===============================

/**
 * إعدادات الفوترة للمطعم
 */
export interface RestaurantBillingSettings {
  restaurantId: string
  
  // إعدادات الفوترة
  billingPeriod: BillingPeriod   // دورية الفوترة
  paymentTerms: number           // فترة السماح بالأيام
  currency: CurrencyCode         // العملة المفضلة
  
  // إعدادات الخصومات
  discountRate: number           // معدل الخصم
  earlyPaymentDiscount: number   // خصم الدفع المبكر
  loyaltyDiscount: number        // خصم الولاء
  
  // إعدادات الضرائب
  vatExempt: boolean             // معفي من ضريبة القيمة المضافة
  customVatRate?: number         // معدل ضريبة مخصص
  
  // طرق الدفع المفضلة
  preferredPaymentMethods: PaymentMethod[]
  defaultPaymentMethod: PaymentMethod
  
  // إعدادات الإشعارات
  emailNotifications: boolean     // إشعارات البريد الإلكتروني
  smsNotifications: boolean      // إشعارات الرسائل النصية
  reminderDays: number[]         // أيام التذكير قبل الاستحقاق
  
  // إعدادات التحصيل
  maxOverdueDays: number         // الحد الأقصى لأيام التأخير
  creditLimit: number            // الحد الائتماني
  suspendOnOverdue: boolean      // تعليق الخدمة عند التأخير
  
  // معلومات الاتصال
  billingContact: string         // جهة الاتصال للفوترة
  billingEmail: string           // بريد الفوترة
  billingPhone: string           // هاتف الفوترة
  billingAddress: string         // عنوان الفوترة
}

/**
 * قالب الفاتورة
 */
export interface InvoiceTemplate {
  id: string
  name: string                   // اسم القالب
  description?: string           // وصف القالب
  
  // إعدادات العرض
  logoUrl?: string               // شعار الشركة
  headerText: string             // نص الترويسة
  footerText: string             // نص التذييل
  
  // الألوان والتنسيق
  primaryColor: string           // اللون الأساسي
  secondaryColor: string         // اللون الثانوي
  fontFamily: string             // نوع الخط
  
  // الحقول المعروضة
  showItemDescription: boolean   // عرض وصف البند
  showItemCategory: boolean      // عرض تصنيف البند
  showDiscounts: boolean         // عرض الخصومات
  showVAT: boolean              // عرض ضريبة القيمة المضافة
  
  // الشروط والأحكام
  defaultTerms: string           // الشروط الافتراضية
  defaultNotes: string           // الملاحظات الافتراضية
  
  // اللغة والترجمة
  language: 'ar' | 'en'         // اللغة
  rtlSupport: boolean           // دعم من اليمين لليسار
  
  // الحالة
  isActive: boolean             // القالب نشط
  isDefault: boolean            // القالب افتراضي
  
  createdAt: Date
  updatedAt: Date
}

// ===============================
// عمليات الفوترة المجمعة
// ===============================

/**
 * دفعة فوترة جماعية
 */
export interface BillingBatch {
  id: string
  batchNumber: string            // رقم الدفعة
  description: string            // وصف الدفعة
  
  // إعدادات الدفعة
  period: BillingPeriod
  periodStart: Date
  periodEnd: Date
  invoiceDate: Date
  dueDate: Date
  
  // المطاعم المستهدفة
  restaurantIds: string[]        // قائمة معرفات المطاعم
  excludeRestaurants: string[]   // مطاعم مستثناة
  
  // إعدادات مخصصة
  customVATRate?: number         // معدل ضريبة مخصص للدفعة
  customDiscount?: number        // خصم مخصص للدفعة
  customTemplate?: string        // قالب مخصص
  
  // الحالة والتقدم
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalInvoices: number          // العدد المتوقع
  generatedInvoices: number      // العدد المُنشأ
  failedInvoices: number         // العدد الفاشل
  
  // التوقيتات
  startedAt?: Date
  completedAt?: Date
  createdBy: string
  
  // النتائج
  invoiceIds: string[]           // معرفات الفواتير المُنشأة
  errors: string[]               // أخطاء العملية
  totalAmount: number            // إجمالي مبلغ الدفعة
}

// ===============================
// أنواع مساعدة للعمليات
// ===============================

/**
 * معايير البحث في الفواتير
 */
export interface InvoiceSearchCriteria {
  // المعايير الأساسية
  restaurantId?: string
  status?: InvoiceStatus[]
  type?: InvoiceType[]
  priority?: InvoicePriority[]
  
  // المعايير الزمنية
  dateRange?: {
    field: 'issueDate' | 'dueDate' | 'createdAt'
    start: Date
    end: Date
  }
  
  // المعايير المالية
  amountRange?: {
    min: number
    max: number
  }
  
  // البحث النصي
  searchText?: string            // بحث في الرقم أو الوصف
  
  // الترتيب والترقيم
  sortBy?: 'issueDate' | 'dueDate' | 'amount' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * نتائج البحث في الفواتير
 */
export interface InvoiceSearchResult {
  invoices: YemeniInvoice[]
  totalCount: number
  totalPages: number
  currentPage: number
  summary: {
    totalAmount: number
    paidAmount: number
    unpaidAmount: number
    overdueAmount: number
  }
}

/**
 * معايير البحث في المدفوعات
 */
export interface PaymentSearchCriteria {
  // المعايير الأساسية
  restaurantId?: string
  invoiceId?: string
  status?: PaymentStatus[]
  paymentMethod?: PaymentMethod[]
  
  // المعايير الزمنية
  dateRange?: {
    start: Date
    end: Date
  }
  
  // المعايير المالية
  amountRange?: {
    min: number
    max: number
  }
  
  // البحث النصي
  searchText?: string
  
  // الترتيب
  sortBy?: 'paymentDate' | 'amount' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ===============================
// التصدير والواردات المساعدة
// ===============================

/**
 * إعادة تصدير الأنواع من الوحدات الأخرى
 */
export type { CurrencyCode, YemeniBank } from '../financial/types'

/**
 * الثوابت المفيدة
 */
export const YEMEN_VAT_RATE = 0.05;           // ضريبة القيمة المضافة اليمنية 5%
export const DEFAULT_PAYMENT_TERMS = 30;      // فترة السماح الافتراضية 30 يوم
export const MAX_OVERDUE_DAYS = 90;          // الحد الأقصى للتأخير 90 يوم

/**
 * الثوابت اليمنية للفوترة
 */
export const YEMENI_BILLING_CONSTANTS = {
  DEFAULT_CURRENCY: 'YER' as CurrencyCode,
  VAT_RATE: YEMEN_VAT_RATE,
  BUSINESS_DAYS_PER_WEEK: 6,     // أيام العمل في اليمن (السبت - الخميس)
  WEEKEND_DAYS: ['friday'],      // أيام العطل
  WORKING_HOURS: {
    start: '08:00',
    end: '16:00'
  }
} as const

export default YemeniInvoice
