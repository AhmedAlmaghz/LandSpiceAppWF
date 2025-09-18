/**
 * أنواع البيانات لنظام الأقساط البنكية اليمني
 * نظام إدارة لاند سبايس - الوحدة الحادية عشرة
 */

import { CurrencyCode, YemeniBank } from '../financial/types'

// ===============================
// أساسيات نظام الأقساط اليمني
// ===============================

/**
 * تكرار الأقساط في النظام البنكي اليمني
 */
export type InstallmentFrequency = 
  | 'monthly'      // شهرياً (الأكثر شيوعاً)
  | 'quarterly'    // كل 3 أشهر
  | 'semi_annual'  // كل 6 أشهر
  | 'annual'       // سنوياً
  | 'custom'       // مخصص حسب الاتفاق

/**
 * حالات خطة الأقساط
 */
export type InstallmentPlanStatus = 
  | 'draft'        // مسودة - قيد الإعداد
  | 'pending'      // معلق - في انتظار موافقة البنك
  | 'approved'     // معتمد - تم اعتماده من البنك
  | 'active'       // نشط - قيد التنفيذ
  | 'completed'    // مكتمل - تم سداد جميع الأقساط
  | 'suspended'    // معلق - تم إيقافه مؤقتاً
  | 'defaulted'    // متعثر - فشل في السداد
  | 'restructured' // معاد الهيكلة - تم تعديل الشروط
  | 'cancelled'    // ملغي - تم إلغاء الخطة

/**
 * حالات القسط الواحد
 */
export type InstallmentStatus = 
  | 'pending'      // معلق - لم يحن موعد الاستحقاق بعد
  | 'due'          // مستحق - حان موعد الدفع
  | 'paid'         // مدفوع - تم السداد كاملاً
  | 'partial_paid' // مدفوع جزئياً - دفع جزئي
  | 'overdue'      // متأخر - تجاوز موعد الاستحقاق
  | 'waived'       // معفي - تم إعفاؤه من السداد
  | 'restructured' // معاد الهيكلة - تم تعديل شروطه
  | 'disputed'     // محل خلاف - هناك نزاع حوله

/**
 * مستويات المخاطر الائتمانية
 */
export type CreditRiskLevel = 
  | 'minimal'      // مخاطر دنيا (95-100%)
  | 'low'          // مخاطر منخفضة (85-94%)
  | 'moderate'     // مخاطر معتدلة (70-84%)
  | 'high'         // مخاطر عالية (50-69%)
  | 'severe'       // مخاطر شديدة (30-49%)
  | 'critical'     // مخاطر حرجة (أقل من 30%)

/**
 * أنواع إجراءات التحصيل
 */
export type CollectionActionType = 
  | 'reminder'     // تذكير ودي
  | 'notice'       // إشعار رسمي
  | 'phone_call'   // اتصال هاتفي
  | 'visit'        // زيارة ميدانية
  | 'legal_notice' // إشعار قانوني
  | 'legal_action' // إجراء قانوني
  | 'guarantee_activation' // تفعيل الضمانة

/**
 * حالات الضمانة البنكية للأقساط
 */
export type GuaranteeStatus = 
  | 'active'       // نشطة
  | 'expired'      // منتهية الصلاحية
  | 'activated'    // مُفعلة (تم استخدامها)
  | 'released'     // محررة (تم إطلاقها)
  | 'renewed'      // متجددة

// ===============================
// بيانات خطة الأقساط
// ===============================

/**
 * خطة الأقساط الرئيسية
 */
export interface InstallmentPlan {
  // معرفات أساسية
  id: string
  planNumber: string              // رقم الخطة التسلسلي
  contractId: string              // معرف العقد المرتبط
  restaurantId: string            // معرف المطعم
  restaurantName: string          // اسم المطعم
  
  // معلومات البنك والتمويل
  bankId: YemeniBank              // البنك الممول (بنك القاسمي عادة)
  bankBranch?: string             // فرع البنك
  bankAccountNumber?: string      // رقم الحساب في البنك
  bankOfficer?: string            // موظف البنك المسؤول
  
  // تفاصيل التمويل
  totalAmount: number             // المبلغ الإجمالي للتمويل
  currency: CurrencyCode          // العملة (YER افتراضي)
  exchangeRate?: number           // سعر الصرف (للعملات الأجنبية)
  
  // بنية الأقساط
  installmentCount: number        // عدد الأقساط
  installmentAmount: number       // مبلغ القسط الواحد
  frequency: InstallmentFrequency // تكرار الأقساط
  
  // معدلات الفائدة والرسوم
  interestRate: number            // معدل الفائدة السنوي (%)
  processingFee: number           // رسوم المعالجة
  lateFee: number                 // غرامة التأخير (يومي)
  earlyPaymentDiscount?: number   // خصم السداد المبكر (%)
  
  // التواريخ المهمة
  startDate: Date                 // تاريخ بداية الخطة
  endDate: Date                   // تاريخ نهاية الخطة
  firstInstallmentDate: Date      // تاريخ أول قسط
  gracePeriod: number             // فترة السماح بالأيام
  
  // الحالة والتتبع
  status: InstallmentPlanStatus   // حالة الخطة
  approvalDate?: Date             // تاريخ الموافقة البنكية
  activationDate?: Date           // تاريخ التفعيل
  completionDate?: Date           // تاريخ الإكمال
  
  // الضمانات
  guaranteeId?: string            // معرف الضمانة البنكية
  guaranteeAmount?: number        // مبلغ الضمانة
  guaranteeExpiryDate?: Date      // تاريخ انتهاء الضمانة
  
  // الشروط والأحكام
  terms: string                   // الشروط والأحكام النصية
  specialConditions?: string      // شروط خاصة
  penaltyClause?: string          // بند الجزاءات
  
  // معلومات إدارية
  createdBy: string               // منشئ الخطة
  approvedBy?: string             // معتمد الخطة
  createdAt: Date                 // تاريخ الإنشاء
  updatedAt: Date                 // تاريخ آخر تحديث
  
  // ملاحظات
  notes?: string                  // ملاحظات عامة
  internalNotes?: string          // ملاحظات داخلية
  
  // المرفقات
  attachments: string[]           // قائمة المرفقات
  contractDocument?: string       // وثيقة العقد
  guaranteeDocument?: string      // وثيقة الضمانة
}

/**
 * القسط الواحد
 */
export interface InstallmentPayment {
  // معرفات أساسية
  id: string
  planId: string                  // معرف خطة الأقساط
  installmentNumber: number       // رقم القسط في التسلسل
  
  // تفاصيل القسط
  dueDate: Date                   // تاريخ الاستحقاق
  amount: number                  // المبلغ الأساسي للقسط
  principalAmount: number         // مبلغ رأس المال
  interestAmount: number          // مبلغ الفائدة
  
  // الرسوم والغرامات
  lateFee?: number                // غرامة التأخير
  processingFee?: number          // رسوم المعالجة
  additionalCharges?: number      // رسوم إضافية
  totalAmount: number             // المبلغ الإجمالي المطلوب
  
  // تفاصيل السداد
  paidDate?: Date                 // تاريخ السداد الفعلي
  paidAmount?: number             // المبلغ المدفوع فعلياً
  paymentMethod?: string          // طريقة الدفع
  bankReference?: string          // المرجع البنكي
  receiptNumber?: string          // رقم الإيصال
  
  // الحالة والتتبع
  status: InstallmentStatus       // حالة القسط
  daysPastDue?: number            // عدد أيام التأخير
  remindersSent: number           // عدد التذكيرات المرسلة
  lastReminderDate?: Date         // تاريخ آخر تذكير
  
  // معالجة البنك
  bankProcessed: boolean          // تمت معالجته من البنك
  bankProcessedDate?: Date        // تاريخ المعالجة البنكية
  bankNotes?: string              // ملاحظات البنك
  
  // ملاحظات
  notes?: string                  // ملاحظات عامة
  adjustmentReason?: string       // سبب التعديل (إن وجد)
  
  // التواريخ الإدارية
  createdAt: Date                 // تاريخ الإنشاء
  updatedAt: Date                 // تاريخ آخر تحديث
}

// ===============================
// تقييم المخاطر الائتمانية
// ===============================

/**
 * سجل التقييم الائتماني
 */
export interface CreditAssessment {
  id: string
  restaurantId: string            // معرف المطعم
  restaurantName: string          // اسم المطعم
  
  // درجة المخاطر
  riskLevel: CreditRiskLevel      // مستوى المخاطر
  creditScore: number             // النقاط الائتمانية (0-100)
  maxCreditLimit: number          // الحد الائتماني الأقصى
  availableCredit: number         // الائتمان المتاح
  
  // تاريخ السداد
  paymentHistory: PaymentHistoryRecord[]  // سجل المدفوعات
  onTimePayments: number          // عدد المدفوعات في الموعد
  latePayments: number            // عدد المدفوعات المتأخرة
  missedPayments: number          // عدد المدفوعات المفقودة
  
  // المبالغ المستحقة
  currentOutstanding: number      // المبلغ المستحق حالياً
  overdueAmount: number           // المبلغ المتأخر
  longestOverdueDays: number      // أطول فترة تأخير بالأيام
  
  // الإحصائيات
  averagePaymentTime: number      // متوسط وقت السداد بالأيام
  totalPaidAmount: number         // إجمالي المبلغ المدفوع
  totalInstallmentPlans: number   // إجمالي خطط الأقساط
  completedPlans: number          // الخطط المكتملة
  activePlans: number             // الخطط النشطة
  
  // التقييم والتوصيات
  assessmentDate: Date            // تاريخ التقييم
  nextReviewDate: Date            // تاريخ المراجعة القادمة
  recommendations: string[]       // التوصيات
  warningFlags: string[]          // علامات التحذير
  
  // تفاصيل إضافية
  industryRisk: number            // مخاطر القطاع (المطاعم)
  locationRisk: number            // مخاطر الموقع الجغرافي
  economicIndicators: number      // المؤشرات الاقتصادية
  
  // معلومات التقييم
  assessedBy: string              // من قام بالتقييم
  approvedBy?: string             // من اعتمد التقييم
  notes?: string                  // ملاحظات التقييم
}

/**
 * سجل سداد واحد في التاريخ الائتماني
 */
export interface PaymentHistoryRecord {
  date: Date                      // تاريخ السداد
  amount: number                  // المبلغ المدفوع
  dueDate: Date                   // تاريخ الاستحقاق الأصلي
  daysPastDue: number             // عدد أيام التأخير
  status: 'on_time' | 'late' | 'missed' | 'partial'  // حالة السداد
  installmentId: string           // معرف القسط المرتبط
}

// ===============================
// إدارة التحصيل
// ===============================

/**
 * إجراء تحصيل واحد
 */
export interface CollectionAction {
  id: string
  installmentId: string           // معرف القسط المتأخر
  planId: string                  // معرف خطة الأقساط
  restaurantId: string            // معرف المطعم
  
  // تفاصيل الإجراء
  actionType: CollectionActionType // نوع الإجراء
  actionDate: Date                // تاريخ تنفيذ الإجراء
  dueAmount: number               // المبلغ المستحق
  daysPastDue: number             // عدد أيام التأخير
  
  // تفاصيل التواصل
  contactMethod: 'phone' | 'email' | 'sms' | 'letter' | 'visit'
  contactPerson: string           // الشخص المتصل به
  contactResult: 'successful' | 'failed' | 'no_response' | 'promised_payment'
  
  // المحتوى والرسائل
  message: string                 // نص الرسالة أو محضر المكالمة
  response?: string               // رد المطعم
  promisedPaymentDate?: Date      // تاريخ الدفع المتفق عليه
  
  // متابعة الإجراء
  followUpRequired: boolean       // يحتاج متابعة
  followUpDate?: Date             // تاريخ المتابعة
  escalationLevel: number         // مستوى التصعيد (1-5)
  
  // معلومات إدارية
  executedBy: string              // من نفذ الإجراء
  approvedBy?: string             // من اعتمد الإجراء
  cost?: number                   // تكلفة الإجراء
  
  // النتائج والتحديثات
  resultStatus: 'pending' | 'resolved' | 'escalated' | 'closed'
  resultNotes?: string            // ملاحظات النتائج
  
  // الوثائق
  attachments: string[]           // المرفقات (صور، تسجيلات، إلخ)
  legalDocuments?: string[]       // الوثائق القانونية
  
  createdAt: Date
  updatedAt: Date
}

// ===============================
// التكامل البنكي
// ===============================

/**
 * طلب موافقة بنكية
 */
export interface BankApprovalRequest {
  id: string
  requestNumber: string           // رقم الطلب
  
  // معلومات الطلب
  requestType: 'new_plan' | 'modification' | 'restructuring' | 'settlement'
  planId?: string                 // معرف الخطة (للتعديل)
  restaurantId: string            // معرف المطعم
  
  // تفاصيل التمويل المطلوب
  requestedAmount: number         // المبلغ المطلوب
  proposedTerms: string           // الشروط المقترحة
  justification: string           // مبررات الطلب
  
  // المرفقات والوثائق
  creditAssessmentId?: string     // معرف التقييم الائتماني
  guaranteeId?: string            // معرف الضمانة
  
  // الحالة والمعالجة
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_modification'
  submittedDate: Date             // تاريخ التقديم
  reviewStartDate?: Date          // تاريخ بدء المراجعة
  responseDate?: Date             // تاريخ الرد
  
  // رد البنك
  bankOfficer?: string            // موظف البنك المراجع
  bankComments?: string           // تعليقات البنك
  approvalConditions?: string[]   // شروط الموافقة
  rejectionReasons?: string[]     // أسباب الرفض
  
  // المتابعة
  followUpRequired: boolean       // يحتاج متابعة
  nextFollowUpDate?: Date         // موعد المتابعة القادم
  
  submittedBy: string
  reviewedBy?: string
  createdAt: Date
  updatedAt: Date
}

// ===============================
// التقارير والإحصائيات
// ===============================

/**
 * تقرير الأقساط الشامل
 */
export interface InstallmentReport {
  // فترة التقرير
  reportPeriod: {
    startDate: Date
    endDate: Date
  }
  
  // إحصائيات عامة
  totalPlans: number              // إجمالي عدد الخطط
  activePlans: number             // الخطط النشطة
  completedPlans: number          // الخطط المكتملة
  defaultedPlans: number          // الخطط المتعثرة
  
  // المبالغ
  totalFinanced: number           // إجمالي المبلغ الممول
  outstandingAmount: number       // المبلغ المستحق
  collectedAmount: number         // المبلغ المحصل
  overdueAmount: number           // المبلغ المتأخر
  
  // معدلات الأداء
  collectionRate: number          // معدل التحصيل %
  defaultRate: number             // معدل التعثر %
  averagePaymentTime: number      // متوسط وقت السداد بالأيام
  
  // توزيع المخاطر
  riskDistribution: {
    riskLevel: CreditRiskLevel
    count: number
    amount: number
  }[]
  
  // أداء البنوك
  bankPerformance: {
    bank: YemeniBank
    totalPlans: number
    successRate: number
    averageProcessingTime: number
  }[]
  
  generatedAt: Date
  generatedBy: string
}

// ===============================
// معايير البحث والفلترة
// ===============================

/**
 * معايير البحث في الأقساط
 */
export interface InstallmentSearchCriteria {
  // المعايير الأساسية
  restaurantId?: string
  bankId?: YemeniBank
  status?: InstallmentPlanStatus[]
  riskLevel?: CreditRiskLevel[]
  
  // المعايير الزمنية
  dateRange?: {
    field: 'startDate' | 'endDate' | 'createdAt'
    start: Date
    end: Date
  }
  
  // المعايير المالية
  amountRange?: {
    min: number
    max: number
  }
  
  // البحث النصي
  searchText?: string             // بحث في رقم الخطة أو اسم المطعم
  
  // الترتيب والترقيم
  sortBy?: 'startDate' | 'amount' | 'status' | 'riskLevel'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ===============================
// الثوابت والتكوين
// ===============================

/**
 * إعدادات النظام البنكي اليمني
 */
export const YEMENI_BANKING_CONFIG = {
  // معدلات الفائدة الافتراضية
  DEFAULT_INTEREST_RATE: 0.12,     // 12% سنوياً
  MAX_INTEREST_RATE: 0.25,         // الحد الأقصى 25%
  MIN_INTEREST_RATE: 0.05,         // الحد الأدنى 5%
  
  // الرسوم والغرامات
  DEFAULT_PROCESSING_FEE: 500,     // 500 ريال يمني
  DEFAULT_LATE_FEE: 50,            // 50 ريال يمني يومياً
  
  // فترات السداد
  MIN_INSTALLMENT_COUNT: 3,        // أقل عدد أقساط
  MAX_INSTALLMENT_COUNT: 60,       // أكثر عدد أقساط (5 سنوات)
  DEFAULT_GRACE_PERIOD: 7,         // فترة السماح 7 أيام
  
  // حدود التمويل
  MIN_FINANCING_AMOUNT: 50000,     // الحد الأدنى للتمويل
  MAX_FINANCING_AMOUNT: 10000000,  // الحد الأقصى للتمويل
  
  // أيام العمل
  BUSINESS_DAYS: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  WEEKEND_DAYS: ['friday', 'saturday'],
  
  // العطل الرسمية اليمنية
  NATIONAL_HOLIDAYS: [
    '01-01', // رأس السنة الميلادية
    '05-01', // عيد العمال
    '05-22', // عيد الوحدة اليمنية
    '09-26', // عيد ثورة سبتمبر
    '10-14', // عيد ثورة أكتوبر
    '11-30'  // عيد الاستقلال
  ]
} as const

/**
 * إعادة تصدير الأنواع من الوحدات الأخرى
 */
export type { CurrencyCode, YemeniBank } from '../financial/types'

export default {
  InstallmentPlan,
  InstallmentPayment,
  CreditAssessment,
  CollectionAction,
  BankApprovalRequest,
  InstallmentReport,
  YEMENI_BANKING_CONFIG
}
