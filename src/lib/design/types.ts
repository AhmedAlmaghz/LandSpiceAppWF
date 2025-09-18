// Design System Types for Yemeni Context
// أنواع بيانات نظام التصميم للسياق اليمني

export type DesignType = 
  | 'logo'                    // شعار
  | 'business_card'           // بطاقة عمل
  | 'letterhead'              // ورق مراسلات
  | 'brochure'                // بروشور
  | 'banner'                  // بانر
  | 'menu'                    // قائمة طعام
  | 'packaging'               // عبوات
  | 'sticker'                 // ملصقات
  | 'social_media'            // سوشيال ميديا
  | 'website'                 // موقع ويب
  | 'complete_identity'       // هوية بصرية كاملة

export type DesignStatus = 
  | 'draft'                   // مسودة
  | 'submitted'               // مرسل
  | 'under_review'            // قيد المراجعة
  | 'assigned'                // مُعيّن لمصمم
  | 'in_progress'             // قيد التنفيذ
  | 'draft_ready'             // مسودة جاهزة
  | 'client_review'           // مراجعة العميل
  | 'revision_requested'      // تعديل مطلوب
  | 'revision_in_progress'    // تعديل قيد التنفيذ
  | 'approved'                // موافق عليه
  | 'final_files_ready'       // الملفات النهائية جاهزة
  | 'delivered'               // مُسلّم
  | 'archived'                // مؤرشف
  | 'cancelled'               // ملغي
  | 'on_hold'                 // معلق

export type DesignPriority = 'low' | 'medium' | 'high' | 'urgent'

export type DesignCategory = 
  | 'branding'                // العلامة التجارية
  | 'marketing'               // التسويق
  | 'print'                   // الطباعة
  | 'digital'                 // الرقمي
  | 'packaging'               // التعبئة والتغليف

export type FileFormat = 
  | 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp'           // Images
  | 'pdf' | 'ai' | 'psd' | 'sketch' | 'fig'           // Design files
  | 'svg' | 'eps'                                      // Vector files
  | 'mp4' | 'mov' | 'gif'                             // Animation/Video

export type DesignComplexity = 'simple' | 'medium' | 'complex' | 'very_complex'

// Main Design Request Interface
export interface DesignRequest {
  id: string
  requestNumber: string           // رقم الطلب
  title: string                   // عنوان المشروع
  description?: string            // وصف تفصيلي
  
  // Basic Information
  type: DesignType
  category: DesignCategory
  status: DesignStatus
  priority: DesignPriority
  complexity: DesignComplexity
  
  // Client Information
  client: {
    restaurantId: string          // معرف المطعم
    restaurantName: string        // اسم المطعم
    contactPerson: string         // جهة الاتصال
    phone: string                 // رقم الهاتف
    email?: string                // البريد الإلكتروني
  }
  
  // Design Requirements
  requirements: DesignRequirements
  
  // Cultural Preferences (Yemeni Context)
  culturalPreferences: {
    arabicFont: string            // الخط العربي المفضل
    colorScheme: string[]         // نظام الألوان
    includeTraditionalElements: boolean    // تضمين عناصر تراثية
    islamicCompliant: boolean     // متوافق مع القيم الإسلامية
    yemeniCulturalElements: boolean        // عناصر ثقافية يمنية
  }
  
  // Timeline
  requestDate: Date               // تاريخ الطلب
  expectedDeliveryDate: Date      // تاريخ التسليم المتوقع
  actualDeliveryDate?: Date       // تاريخ التسليم الفعلي
  deadlineExtensions: DesignDeadlineExtension[]
  
  // Assignment
  assignedDesigner?: string       // المصمم المُعيّن
  assignedDate?: Date            // تاريخ التعيين
  estimatedHours?: number        // الساعات المقدرة
  actualHours?: number           // الساعات الفعلية
  
  // Files and Assets
  referenceFiles: DesignFile[]    // ملفات مرجعية
  draftFiles: DesignFile[]        // ملفات المسودات
  finalFiles: DesignFile[]        // الملفات النهائية
  
  // Revisions and Feedback
  revisions: DesignRevision[]
  feedback: DesignFeedback[]
  
  // Workflow
  statusHistory: DesignStatusHistory[]
  approvals: DesignApproval[]
  
  // Financial
  estimatedCost?: number          // التكلفة المقدرة
  actualCost?: number            // التكلفة الفعلية
  currency: 'YER' | 'USD' | 'SAR'
  billingStatus: 'pending' | 'billed' | 'paid'
  
  // Quality and Satisfaction
  qualityRating?: number          // تقييم الجودة (1-5)
  clientSatisfaction?: number     // رضا العميل (1-5)
  designerSelfRating?: number     // تقييم المصمم الذاتي (1-5)
  
  // Metadata
  tags: string[]
  notes: DesignNote[]
  isArchived: boolean
  createdDate: Date
  lastModified: Date
  createdBy: string
  lastModifiedBy: string
  version: string
}

// Design Requirements
export interface DesignRequirements {
  // Basic Requirements
  dimensions?: {
    width: number
    height: number
    unit: 'px' | 'mm' | 'cm' | 'in'
  }
  
  // Text Content
  primaryText: string             // النص الأساسي (عربي)
  secondaryText?: string          // النص الثانوي
  englishText?: string            // النص الإنجليزي (إن وجد)
  
  // Color Preferences
  preferredColors: string[]       // الألوان المفضلة
  avoidColors: string[]          // الألوان المراد تجنبها
  
  // Style Preferences
  styleDirection: string          // توجه التصميم
  moodKeywords: string[]         // كلمات المزاج
  inspirationReferences: string[] // مراجع الإلهام
  
  // Technical Requirements
  fileFormats: FileFormat[]       // صيغ الملفات المطلوبة
  resolution?: number             // الدقة المطلوبة
  colorMode: 'RGB' | 'CMYK' | 'both'  // نمط الألوان
  
  // Usage Requirements
  usageContext: string[]          // سياق الاستخدام
  printRequirements?: {
    paperSize: string
    orientation: 'portrait' | 'landscape'
    bleed: boolean
  }
  
  // Special Requirements
  includeQRCode: boolean         // تضمين رمز QR
  includeContactInfo: boolean    // تضمين معلومات الاتصال
  multiLanguage: boolean         // متعدد اللغات
  
  // Accessibility
  accessibilityRequirements?: string[]
  colorBlindFriendly: boolean
}

// Design File Management
export interface DesignFile {
  id: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  format: FileFormat
  
  // File Details
  uploadDate: Date
  uploadedBy: string
  version: string
  isLatest: boolean
  
  // File Type
  fileType: 'reference' | 'draft' | 'revision' | 'final' | 'source'
  fileCategory: string            // فئة الملف
  
  // Metadata
  description?: string
  dimensions?: {
    width: number
    height: number
  }
  resolution?: number
  colorMode?: 'RGB' | 'CMYK'
  
  // Access Control
  isPublic: boolean
  accessLevel: 'client' | 'designer' | 'internal' | 'admin'
  
  // Review Status
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  reviewNotes?: string
  reviewedBy?: string
  reviewDate?: Date
  
  isActive: boolean
}

// Design Revisions
export interface DesignRevision {
  id: string
  revisionNumber: number
  title: string
  description: string
  
  // Revision Details
  requestedBy: string
  requestDate: Date
  priority: DesignPriority
  
  // Changes Requested
  changesRequested: DesignChange[]
  
  // Designer Response
  designerResponse?: string
  estimatedTime?: number          // ساعات مقدرة للتعديل
  actualTime?: number            // الوقت الفعلي
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completedDate?: Date
  
  // Files
  beforeFiles: string[]           // ملفات ما قبل التعديل
  afterFiles: string[]            // ملفات ما بعد التعديل
}

export interface DesignChange {
  id: string
  changeType: 'text' | 'color' | 'layout' | 'font' | 'image' | 'other'
  description: string
  isRequired: boolean
  priority: 'low' | 'medium' | 'high'
  
  // Location (if applicable)
  elementLocation?: string
  coordinates?: {
    x: number
    y: number
  }
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  rejectionReason?: string
  completedDate?: Date
}

// Feedback System
export interface DesignFeedback {
  id: string
  feedbackType: 'general' | 'specific' | 'approval' | 'rejection'
  content: string
  
  // Feedback Details
  providedBy: string
  providedDate: Date
  rating?: number                 // تقييم (1-5)
  
  // Response
  designerResponse?: string
  responseDate?: Date
  
  // Visibility
  isPublic: boolean
  visibleTo: string[]
  
  // Attachments
  attachments: string[]           // معرفات الملفات المرفقة
}

// Status History
export interface DesignStatusHistory {
  id: string
  status: DesignStatus
  previousStatus?: DesignStatus
  timestamp: Date
  changedBy: string
  reason?: string
  notes?: string
  automaticChange: boolean
  
  // Duration tracking
  durationInPreviousStatus?: number  // المدة بالساعات
}

// Approval System
export interface DesignApproval {
  id: string
  approvalType: 'initial_concept' | 'draft_review' | 'final_approval' | 'delivery_confirmation'
  status: 'pending' | 'approved' | 'rejected' | 'conditional'
  
  // Approver Information
  approver: string
  approverRole: 'client' | 'designer' | 'art_director' | 'manager'
  approvalDate?: Date
  
  // Approval Details
  comments?: string
  conditions?: string[]           // شروط الموافقة
  nextSteps?: string[]           // الخطوات التالية
  
  // Files
  approvedFiles: string[]
  rejectedFiles: string[]
}

// Deadline Extensions
export interface DesignDeadlineExtension {
  id: string
  originalDeadline: Date
  newDeadline: Date
  reason: string
  requestedBy: string
  approvedBy?: string
  requestDate: Date
  approvalDate?: Date
  status: 'pending' | 'approved' | 'rejected'
}

// Notes System
export interface DesignNote {
  id: string
  content: string
  noteType: 'general' | 'technical' | 'client_communication' | 'internal'
  isPrivate: boolean
  
  // Metadata
  createdBy: string
  createdDate: Date
  lastModified?: Date
  lastModifiedBy?: string
  
  // Visibility
  visibleTo: string[]
  
  // Attachments
  attachments?: string[]
}

// Designer Information
export interface Designer {
  id: string
  name: string
  email: string
  phone?: string
  
  // Skills and Specialties
  specialties: DesignType[]
  skillLevel: 'junior' | 'mid' | 'senior' | 'lead'
  yemeniCulturalExpertise: boolean
  
  // Performance Metrics
  averageRating: number
  completedProjects: number
  onTimeDeliveryRate: number
  clientSatisfactionRate: number
  
  // Availability
  isAvailable: boolean
  currentWorkload: number         // عدد المشاريع الحالية
  maxWorkload: number            // الحد الأقصى للمشاريع
  
  // Portfolio
  portfolioItems: PortfolioItem[]
  
  isActive: boolean
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  designType: DesignType
  category: DesignCategory
  completionDate: Date
  clientName?: string             // اسم العميل (إن أراد العرض)
  
  // Files
  thumbnailImage: string
  portfolioImages: string[]
  
  // Metrics
  clientRating?: number
  projectDuration: number         // بالأيام
  
  // Cultural Context
  includedYemeniElements: boolean
  culturalRelevance: number       // تقييم الصلة الثقافية (1-5)
  
  isPublic: boolean
}

// Search and Filter Types
export interface DesignFilter {
  searchTerm?: string
  status?: DesignStatus[]
  type?: DesignType[]
  category?: DesignCategory[]
  priority?: DesignPriority[]
  assignedDesigner?: string[]
  
  // Date ranges
  requestDateFrom?: Date
  requestDateTo?: Date
  deadlineDateFrom?: Date
  deadlineDateTo?: Date
  
  // Client filters
  clientId?: string[]
  
  // Quality filters
  hasRevisions?: boolean
  qualityRating?: number          // الحد الأدنى للتقييم
  clientSatisfaction?: number     // الحد الأدنى لرضا العميل
  
  // Cultural filters
  includesYemeniElements?: boolean
  islamicCompliant?: boolean
  
  tags?: string[]
}

export interface DesignSortOption {
  field: 'requestDate' | 'deadline' | 'priority' | 'status' | 'clientName' | 'assignedDesigner' | 'qualityRating'
  direction: 'asc' | 'desc'
}

// Statistics and Reporting
export interface DesignStats {
  total: number
  active: number
  completed: number
  overdue: number
  
  byStatus: Record<DesignStatus, number>
  byType: Record<DesignType, number>
  byCategory: Record<DesignCategory, number>
  byDesigner: Record<string, number>
  
  // Performance Metrics
  averageCompletionTime: number   // بالأيام
  onTimeDeliveryRate: number      // نسبة التسليم في الوقت
  averageRevisions: number        // متوسط عدد التعديلات
  averageQualityRating: number    // متوسط تقييم الجودة
  averageClientSatisfaction: number // متوسط رضا العميل
  
  // Financial
  totalRevenue: number
  averageProjectValue: number
  
  // Cultural Metrics
  yemeniElementsUsage: number     // نسبة استخدام العناصر اليمنية
  islamicComplianceRate: number   // نسبة التوافق الإسلامي
}

// Form Data Types
export interface DesignRequestFormData {
  basic: {
    title: string
    type: DesignType
    category: DesignCategory
    priority: DesignPriority
    description?: string
    expectedDeliveryDate: Date
  }
  
  client: {
    restaurantId: string
    contactPerson: string
    phone: string
    email?: string
  }
  
  requirements: Omit<DesignRequirements, 'fileFormats'> & {
    fileFormats: string[]
  }
  
  culturalPreferences: {
    arabicFont: string
    colorScheme: string[]
    includeTraditionalElements: boolean
    islamicCompliant: boolean
    yemeniCulturalElements: boolean
  }
  
  referenceFiles: File[]
  
  budget?: {
    estimatedCost: number
    currency: 'YER' | 'USD' | 'SAR'
  }
  
  notes?: string
  tags: string[]
}

// API Response Types
export interface DesignApiResponse<T> {
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
export interface DesignEvent {
  type: 'request_created' | 'request_updated' | 'status_changed' | 
        'designer_assigned' | 'draft_uploaded' | 'revision_requested' |
        'approval_given' | 'project_completed' | 'deadline_approaching'
  payload: any
  timestamp: Date
  userId?: string
}

// Configuration Types
export interface DesignConfig {
  maxFileSize: number             // بالبايت
  allowedFileTypes: FileFormat[]
  maxRevisionsAllowed: number
  defaultDeliveryDays: number
  
  // Cultural defaults
  defaultArabicFont: string
  defaultColorSchemes: string[][]
  
  // Business rules
  autoAssignDesigners: boolean
  requireApprovalForDelivery: boolean
  allowClientUploads: boolean
  
  // Notification settings
  deadlineWarningDays: number     // تنبيه قبل الموعد النهائي
  emailNotifications: boolean
  smsNotifications: boolean
}

// Export all types
export type {
  DesignRequest,
  DesignRequirements,
  DesignFile,
  DesignRevision,
  DesignChange,
  DesignFeedback,
  DesignStatusHistory,
  DesignApproval,
  DesignDeadlineExtension,
  DesignNote,
  Designer,
  PortfolioItem,
  DesignFilter,
  DesignSortOption,
  DesignStats,
  DesignRequestFormData,
  DesignApiResponse,
  DesignEvent,
  DesignConfig
}
