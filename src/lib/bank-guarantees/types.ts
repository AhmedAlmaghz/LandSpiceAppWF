// Bank Guarantee Types for Yemeni Banks
// أنواع بيانات الضمانات البنكية للبنوك اليمنية

export type GuaranteeType = 
  | 'performance'          // ضمان حسن التنفيذ
  | 'advance_payment'      // ضمان دفع مقدم
  | 'maintenance'          // ضمان صيانة
  | 'bid_bond'            // ضمان دخول مناقصة
  | 'customs'             // ضمان جمركي
  | 'final_payment'       // ضمان دفع نهائي

export type GuaranteeStatus = 
  | 'draft'               // مسودة
  | 'submitted'           // مرسل للبنك
  | 'under_review'        // قيد المراجعة
  | 'approved'            // موافق عليه
  | 'issued'              // صادر
  | 'active'              // نشط
  | 'expired'             // منتهي الصلاحية
  | 'cancelled'           // ملغي
  | 'rejected'            // مرفوض
  | 'returned'            // مُرجع

export type Currency = 'YER' | 'USD' | 'SAR' | 'EUR'

export type GuaranteePriority = 'low' | 'medium' | 'high' | 'urgent'

// Main Bank Guarantee Interface
export interface BankGuarantee {
  id: string
  guaranteeNumber: string          // رقم الضمانة
  referenceNumber?: string         // رقم المرجع (من البنك)
  
  // Basic Information
  type: GuaranteeType
  status: GuaranteeStatus
  priority: GuaranteePriority
  title: string                    // عنوان الضمانة
  description?: string             // وصف مفصل
  
  // Parties
  applicant: GuaranteeParty        // مقدم الطلب (المطعم)
  beneficiary: GuaranteeParty      // المستفيد (لاند سبايس)
  bank: BankInfo                   // البنك الضامن
  
  // Financial Details
  amount: number                   // قيمة الضمانة
  currency: Currency
  commissionRate: number           // نسبة العمولة
  commissionAmount: number         // مبلغ العمولة
  
  // Timeline
  applicationDate: Date            // تاريخ التقديم
  issueDate?: Date                // تاريخ الإصدار
  effectiveDate?: Date            // تاريخ السريان
  expiryDate: Date                // تاريخ الانتهاء
  extensionDate?: Date            // تاريخ التمديد
  
  // Related Documents
  relatedContract?: string         // العقد المرتبط
  relatedProject?: string          // المشروع المرتبط
  
  // Documents and Attachments
  documents: GuaranteeDocument[]
  
  // Processing Information
  submittedBy: string              // مقدم الطلب
  reviewedBy?: string             // مراجع الطلب
  approvedBy?: string             // موافق الطلب
  
  // Bank Processing
  bankReference?: string           // مرجع البنك
  bankNotes?: string              // ملاحظات البنك
  bankOfficer?: string            // موظف البنك المسؤول
  
  // Status Tracking
  statusHistory: GuaranteeStatusHistory[]
  
  // Notifications and Alerts
  alerts: GuaranteeAlert[]
  
  // Renewal Information
  isRenewable: boolean
  renewalTerms?: string
  autoRenewal: boolean
  renewalNoticeDays: number        // عدد أيام إشعار التجديد
  
  // Metadata
  tags: string[]
  notes: GuaranteeNote[]
  createdDate: Date
  lastModified: Date
  createdBy: string
  lastModifiedBy: string
  version: string
  isArchived: boolean
}

// Party Information (Applicant/Beneficiary)
export interface GuaranteeParty {
  id: string
  type: 'restaurant' | 'landspice' | 'supplier' | 'other'
  name: string
  legalName: string
  registrationNumber?: string      // رقم السجل التجاري
  taxId?: string                  // رقم الهوية الضريبية
  
  // Address (Yemeni format)
  address: {
    street: string
    district: string              // الحي
    city: string                 // المدينة
    governorate: string          // المحافظة
    country: string              // اليمن
    postalCode?: string
  }
  
  // Contact Information
  contact: {
    primaryContact: string        // جهة الاتصال الأساسية
    position: string             // المنصب
    phone: string               // رقم هاتف يمني
    mobile?: string             // رقم جوال
    email?: string
    fax?: string
  }
  
  // Bank Account (for commission deduction)
  bankAccount?: {
    bankName: string
    accountNumber: string
    iban?: string
    swiftCode?: string
  }
  
  // Legal Representative
  legalRepresentative?: {
    name: string
    position: string
    idNumber: string
    phone: string
  }
}

// Bank Information (Yemeni Banks)
export interface BankInfo {
  id: string
  name: string                    // اسم البنك
  branchName: string             // اسم الفرع
  branchCode?: string            // رمز الفرع
  
  // Address
  address: {
    street: string
    city: string
    governorate: string
    country: 'اليمن'
  }
  
  // Contact
  contact: {
    phone: string
    email?: string
    fax?: string
    manager: string              // مدير الفرع
  }
  
  // Bank Details
  swiftCode?: string
  routingNumber?: string
  licenseNumber?: string         // رقم الترخيص
  
  // Commission Structure
  commissionRates: {
    performance: number          // ضمان حسن التنفيذ
    advancePayment: number       // ضمان دفع مقدم
    maintenance: number          // ضمان صيانة
    bidBond: number             // ضمان دخول مناقصة
    customs: number             // ضمان جمركي
    finalPayment: number        // ضمان دفع نهائي
  }
  
  // Processing Times (in days)
  processingDays: {
    standard: number            // المعالجة العادية
    urgent: number              // المعالجة العاجلة
  }
  
  // Working Days (Yemeni context)
  workingDays: string[]         // ['الأحد', 'الاثنين', ...]
  workingHours: {
    start: string              // '08:00'
    end: string                // '14:00'
  }
  
  isActive: boolean
}

// Document Management
export interface GuaranteeDocument {
  id: string
  title: string
  type: GuaranteeDocumentType
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  uploadDate: Date
  uploadedBy: string
  
  // Document Details
  isRequired: boolean
  isVerified: boolean
  verifiedBy?: string
  verificationDate?: Date
  
  // Version Control
  version: string
  parentDocumentId?: string      // للإصدارات المحدثة
  
  // Access Control
  accessLevel: 'public' | 'restricted' | 'confidential'
  
  // Processing
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'requires_update'
  reviewNotes?: string
  reviewedBy?: string
  reviewDate?: Date
  
  isActive: boolean
}

export type GuaranteeDocumentType = 
  | 'application_form'          // نموذج الطلب
  | 'trade_license'            // رخصة تجارية
  | 'tax_certificate'          // شهادة ضريبية
  | 'bank_statement'           // كشف حساب بنكي
  | 'contract_copy'            // نسخة العقد
  | 'authorization_letter'     // خطاب تفويض
  | 'id_copy'                 // نسخة الهوية
  | 'guarantee_letter'         // خطاب الضمانة
  | 'amendment'               // تعديل
  | 'extension_request'        // طلب تمديد
  | 'cancellation_request'     // طلب إلغاء
  | 'other'                   // أخرى

// Status History Tracking
export interface GuaranteeStatusHistory {
  id: string
  status: GuaranteeStatus
  previousStatus?: GuaranteeStatus
  timestamp: Date
  changedBy: string
  reason?: string
  notes?: string
  automaticChange: boolean
}

// Alert System
export interface GuaranteeAlert {
  id: string
  type: GuaranteeAlertType
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  
  // Timing
  triggerDate: Date
  dueDate?: Date
  reminderDays?: number
  
  // Status
  isActive: boolean
  isRead: boolean
  readBy?: string
  readDate?: Date
  
  // Actions
  actionRequired: boolean
  actionType?: string
  actionUrl?: string
  
  createdDate: Date
  createdBy: string
}

export type GuaranteeAlertType = 
  | 'expiry_warning'           // تحذير انتهاء الصلاحية
  | 'renewal_required'         // تجديد مطلوب
  | 'document_missing'         // وثيقة مفقودة
  | 'review_pending'           // مراجعة معلقة
  | 'commission_due'           // عمولة مستحقة
  | 'bank_response_required'   // رد البنك مطلوب
  | 'extension_available'      // تمديد متاح
  | 'cancellation_notice'      // إشعار إلغاء
  | 'status_change'           // تغيير حالة
  | 'system_notification'     // إشعار النظام

// Notes System
export interface GuaranteeNote {
  id: string
  content: string
  type: 'general' | 'internal' | 'bank_communication' | 'client_communication'
  isPrivate: boolean
  
  // Metadata
  createdBy: string
  createdDate: Date
  lastModified?: Date
  lastModifiedBy?: string
  
  // Attachments
  attachments?: string[]
  
  // Visibility
  visibleTo: string[]          // user IDs who can see this note
}

// Search and Filter Types
export interface GuaranteeFilter {
  searchTerm?: string
  status?: GuaranteeStatus[]
  type?: GuaranteeType[]
  priority?: GuaranteePriority[]
  bank?: string[]
  applicant?: string[]
  currency?: Currency[]
  
  // Date ranges
  applicationDateFrom?: Date
  applicationDateTo?: Date
  expiryDateFrom?: Date
  expiryDateTo?: Date
  
  // Amount ranges
  amountFrom?: number
  amountTo?: number
  
  // Flags
  hasAlerts?: boolean
  nearExpiry?: boolean        // خلال 30 يوم
  requiresAction?: boolean
  isRenewable?: boolean
  
  // Bank specific
  bankOfficer?: string
  branchCode?: string
  
  tags?: string[]
}

export interface GuaranteeSortOption {
  field: 'applicationDate' | 'expiryDate' | 'amount' | 'status' | 'priority' | 'guaranteeNumber' | 'title'
  direction: 'asc' | 'desc'
}

// Statistics and Reporting
export interface GuaranteeStats {
  total: number
  active: number
  expired: number
  nearExpiry: number          // خلال 30 يوم
  
  byStatus: Record<GuaranteeStatus, number>
  byType: Record<GuaranteeType, number>
  byCurrency: Record<Currency, number>
  byBank: Record<string, number>
  
  totalAmount: number
  averageAmount: number
  totalCommission: number
  
  processingTimes: {
    average: number           // متوسط وقت المعالجة بالأيام
    fastest: number
    slowest: number
  }
  
  // Yemeni specific metrics
  byGovernorate: Record<string, number>
  byBankBranch: Record<string, number>
}

// Form Data Types
export interface GuaranteeFormData {
  basic: {
    type: GuaranteeType
    title: string
    description?: string
    priority: GuaranteePriority
    amount: number
    currency: Currency
  }
  
  parties: {
    applicant: Omit<GuaranteeParty, 'id'>
    beneficiary: Omit<GuaranteeParty, 'id'>
  }
  
  timeline: {
    expiryDate: Date
    isRenewable: boolean
    renewalNoticeDays: number
    autoRenewal: boolean
  }
  
  bank: {
    bankId: string
    branchCode?: string
    requestedBy: string
    urgentProcessing: boolean
  }
  
  documents: Array<{
    type: GuaranteeDocumentType
    title: string
    isRequired: boolean
    file?: File
  }>
  
  relatedEntities: {
    contractId?: string
    projectId?: string
  }
  
  notes?: string
  tags: string[]
}

// API Response Types
export interface GuaranteeApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Array<{
    field: string
    message: string
    code?: string
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Event Types for Integration
export interface GuaranteeEvent {
  type: 'guarantee_created' | 'guarantee_updated' | 'guarantee_status_changed' | 
        'guarantee_expired' | 'guarantee_renewed' | 'document_uploaded' |
        'alert_triggered' | 'review_completed' | 'bank_response_received'
  payload: any
  timestamp: Date
  userId?: string
}

// Configuration Types
export interface GuaranteeConfig {
  defaultCurrency: Currency
  defaultReminderDays: number
  maxFileSize: number           // بالبايت
  allowedFileTypes: string[]
  requiredDocuments: GuaranteeDocumentType[]
  autoArchiveDays: number      // أرشفة تلقائية بعد انتهاء الصلاحية
  
  // Yemeni business rules
  workingDays: string[]
  businessHours: {
    start: string
    end: string
  }
  holidays: Date[]             // العطل الرسمية اليمنية
  
  // Bank integration settings
  defaultBank: string
  commissionCalculation: 'percentage' | 'fixed' | 'tiered'
  
  // Notification settings
  emailNotifications: boolean
  smsNotifications: boolean
  systemNotifications: boolean
}

// Export all types
export type {
  BankGuarantee,
  GuaranteeParty,
  BankInfo,
  GuaranteeDocument,
  GuaranteeStatusHistory,
  GuaranteeAlert,
  GuaranteeNote,
  GuaranteeFilter,
  GuaranteeSortOption,
  GuaranteeStats,
  GuaranteeFormData,
  GuaranteeApiResponse,
  GuaranteeEvent,
  GuaranteeConfig
}
