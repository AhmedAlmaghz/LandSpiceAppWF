/**
 * خدمة التكامل البنكي للأقساط اليمنية
 * نظام إدارة لاند سبايس - الوحدة الحادية عشرة
 * 
 * خدمة متخصصة للتكامل مع بنك القاسمي والبنوك اليمنية الأخرى
 * مع التركيز على العمليات اليدوية وإدخال البيانات البنكية
 */

import {
  BankApprovalRequest,
  InstallmentPlan,
  InstallmentPayment,
  YemeniBank,
  GuaranteeInfo,
  YEMENI_BANKING_CONFIG
} from './types'

// ===============================
// أنواع خاصة بالتكامل البنكي
// ===============================

/**
 * استجابة البنك للطلبات
 */
export interface BankResponse {
  success: boolean
  referenceNumber?: string
  approvalCode?: string
  processingTime?: number
  bankNotes?: string
  requiresManualReview?: boolean
  additionalDocuments?: string[]
  error?: string
}

/**
 * حالة الاتصال بالبنك
 */
export interface BankConnectionStatus {
  bank: YemeniBank
  isConnected: boolean
  lastContact: Date
  responseTime: number
  availableServices: string[]
  maintenanceWindow?: {
    start: Date
    end: Date
    reason: string
  }
}

/**
 * تقرير التعامل مع البنك
 */
export interface BankTransactionReport {
  bank: YemeniBank
  period: {
    startDate: Date
    endDate: Date
  }
  totalRequests: number
  approvedRequests: number
  rejectedRequests: number
  pendingRequests: number
  averageProcessingTime: number
  commonRejectionReasons: string[]
  bankContactPerson?: string
  notes?: string
}

/**
 * بيانات التواصل مع البنك
 */
export interface BankContactInfo {
  bank: YemeniBank
  branchName: string
  branchCode?: string
  contactPerson: string
  position: string
  phoneNumber: string
  email?: string
  workingHours: string
  preferredContactMethod: 'phone' | 'email' | 'visit' | 'fax'
  lastContactDate?: Date
  relationshipNotes?: string
}

// ===============================
// خدمة التكامل البنكي
// ===============================

/**
 * خدمة التكامل مع البنوك اليمنية - نمط Singleton
 */
export class BankIntegrationService {
  private static instance: BankIntegrationService
  private bankApprovals: Map<string, BankApprovalRequest> = new Map()
  private bankContacts: Map<YemeniBank, BankContactInfo> = new Map()
  private requestCounter: number = 1000

  private constructor() {
    this.initializeService()
  }

  public static getInstance(): BankIntegrationService {
    if (!BankIntegrationService.instance) {
      BankIntegrationService.instance = new BankIntegrationService()
    }
    return BankIntegrationService.instance
  }

  private initializeService(): void {
    console.log('🏦 تم تهيئة خدمة التكامل البنكي اليمني')
    this.initializeBankContacts()
  }

  // ===============================
  // إدارة طلبات الموافقة البنكية
  // ===============================

  /**
   * إنشاء طلب موافقة بنكية جديد
   */
  async createBankApprovalRequest(
    requestData: Omit<BankApprovalRequest, 'id' | 'requestNumber' | 'status' | 'submittedDate' | 'createdAt' | 'updatedAt'>
  ): Promise<{
    success: boolean
    requestId?: string
    requestNumber?: string
    error?: string
  }> {
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const requestNumber = this.generateRequestNumber()

      const request: BankApprovalRequest = {
        ...requestData,
        id: requestId,
        requestNumber,
        status: 'submitted',
        submittedDate: new Date(),
        followUpRequired: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.bankApprovals.set(requestId, request)

      console.log(`📋 تم إنشاء طلب موافقة بنكية: ${requestNumber}`)

      return {
        success: true,
        requestId,
        requestNumber
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء طلب الموافقة البنكية:', error)
      return {
        success: false,
        error: 'فشل في إنشاء طلب الموافقة البنكية'
      }
    }
  }

  /**
   * تحديث حالة طلب الموافقة البنكية
   */
  async updateApprovalStatus(
    requestId: string,
    status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_modification',
    updateData: {
      bankOfficer?: string
      bankComments?: string
      approvalConditions?: string[]
      rejectionReasons?: string[]
      reviewedBy?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const request = this.bankApprovals.get(requestId)
      if (!request) {
        return {
          success: false,
          error: 'طلب الموافقة البنكية غير موجود'
        }
      }

      // تحديث بيانات الطلب
      request.status = status
      request.bankOfficer = updateData.bankOfficer
      request.bankComments = updateData.bankComments
      request.approvalConditions = updateData.approvalConditions
      request.rejectionReasons = updateData.rejectionReasons
      request.reviewedBy = updateData.reviewedBy
      request.responseDate = new Date()
      request.updatedAt = new Date()

      // تحديد ما إذا كان الطلب يحتاج متابعة
      request.followUpRequired = ['requires_modification', 'under_review'].includes(status)
      
      if (request.followUpRequired) {
        // تحديد موعد المتابعة التالي (3 أيام عمل)
        request.nextFollowUpDate = this.getNextBusinessDate(3)
      }

      this.bankApprovals.set(requestId, request)

      console.log(`🔄 تم تحديث حالة طلب الموافقة ${request.requestNumber} إلى: ${status}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة طلب الموافقة:', error)
      return {
        success: false,
        error: 'فشل في تحديث حالة طلب الموافقة'
      }
    }
  }

  /**
   * الحصول على طلب موافقة بنكية
   */
  async getBankApprovalRequest(requestId: string): Promise<BankApprovalRequest | null> {
    return this.bankApprovals.get(requestId) || null
  }

  /**
   * الحصول على جميع طلبات الموافقة البنكية للمطعم
   */
  async getRestaurantApprovalRequests(restaurantId: string): Promise<BankApprovalRequest[]> {
    return Array.from(this.bankApprovals.values())
      .filter(request => request.restaurantId === restaurantId)
      .sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime())
  }

  /**
   * الحصول على طلبات الموافقة المعلقة
   */
  async getPendingApprovalRequests(): Promise<BankApprovalRequest[]> {
    return Array.from(this.bankApprovals.values())
      .filter(request => ['submitted', 'under_review'].includes(request.status))
      .sort((a, b) => a.submittedDate.getTime() - b.submittedDate.getTime())
  }

  /**
   * الحصول على طلبات المتابعة المطلوبة
   */
  async getRequestsRequiringFollowUp(): Promise<BankApprovalRequest[]> {
    const now = new Date()
    return Array.from(this.bankApprovals.values())
      .filter(request => 
        request.followUpRequired && 
        request.nextFollowUpDate && 
        request.nextFollowUpDate <= now
      )
      .sort((a, b) => a.nextFollowUpDate!.getTime() - b.nextFollowUpDate!.getTime())
  }

  // ===============================
  // إدارة التواصل مع البنوك
  // ===============================

  /**
   * تسجيل اتصال مع البنك
   */
  async recordBankContact(
    bank: YemeniBank,
    contactData: {
      contactPerson: string
      contactMethod: 'phone' | 'email' | 'visit' | 'fax'
      purpose: string
      outcome: string
      followUpRequired: boolean
      followUpDate?: Date
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const contactInfo = this.bankContacts.get(bank)
      if (contactInfo) {
        contactInfo.lastContactDate = new Date()
        contactInfo.relationshipNotes = contactData.notes
        this.bankContacts.set(bank, contactInfo)
      }

      console.log(`📞 تم تسجيل اتصال مع ${bank}: ${contactData.purpose}`)
      console.log(`📋 النتيجة: ${contactData.outcome}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تسجيل الاتصال البنكي:', error)
      return {
        success: false,
        error: 'فشل في تسجيل الاتصال البنكي'
      }
    }
  }

  /**
   * الحصول على معلومات التواصل مع البنك
   */
  async getBankContactInfo(bank: YemeniBank): Promise<BankContactInfo | null> {
    return this.bankContacts.get(bank) || null
  }

  /**
   * تحديث معلومات التواصل مع البنك
   */
  async updateBankContactInfo(
    bank: YemeniBank,
    updates: Partial<BankContactInfo>
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const existingInfo = this.bankContacts.get(bank)
      if (!existingInfo) {
        return {
          success: false,
          error: 'معلومات التواصل مع البنك غير موجودة'
        }
      }

      const updatedInfo: BankContactInfo = {
        ...existingInfo,
        ...updates
      }

      this.bankContacts.set(bank, updatedInfo)

      console.log(`✅ تم تحديث معلومات التواصل مع ${bank}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تحديث معلومات التواصل البنكي:', error)
      return {
        success: false,
        error: 'فشل في تحديث معلومات التواصل البنكي'
      }
    }
  }

  // ===============================
  // تقارير الأداء البنكي
  // ===============================

  /**
   * إنتاج تقرير الأداء البنكي
   */
  async generateBankPerformanceReport(
    bank: YemeniBank,
    startDate: Date,
    endDate: Date
  ): Promise<BankTransactionReport> {
    const requests = Array.from(this.bankApprovals.values())
      .filter(request => 
        request.submittedDate >= startDate &&
        request.submittedDate <= endDate
      )

    const totalRequests = requests.length
    const approvedRequests = requests.filter(r => r.status === 'approved').length
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length
    const pendingRequests = requests.filter(r => ['submitted', 'under_review'].includes(r.status)).length

    // حساب متوسط وقت المعالجة
    const processedRequests = requests.filter(r => r.responseDate)
    const averageProcessingTime = processedRequests.length > 0
      ? processedRequests.reduce((sum, r) => {
          const processingTime = r.responseDate!.getTime() - r.submittedDate.getTime()
          return sum + (processingTime / (1000 * 60 * 60 * 24)) // تحويل إلى أيام
        }, 0) / processedRequests.length
      : 0

    // تحليل أسباب الرفض الشائعة
    const rejectedRequestsWithReasons = requests.filter(r => 
      r.status === 'rejected' && r.rejectionReasons && r.rejectionReasons.length > 0
    )
    
    const reasonCounts = new Map<string, number>()
    for (const request of rejectedRequestsWithReasons) {
      for (const reason of request.rejectionReasons!) {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
      }
    }

    const commonRejectionReasons = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0])

    // الحصول على معلومات التواصل
    const contactInfo = this.bankContacts.get(bank)

    return {
      bank,
      period: { startDate, endDate },
      totalRequests,
      approvedRequests,
      rejectedRequests,
      pendingRequests,
      averageProcessingTime,
      commonRejectionReasons,
      bankContactPerson: contactInfo?.contactPerson,
      notes: contactInfo?.relationshipNotes
    }
  }

  /**
   * حالة الاتصال بجميع البنوك
   */
  async getAllBankConnectionStatuses(): Promise<BankConnectionStatus[]> {
    const statuses: BankConnectionStatus[] = []
    
    for (const [bank, contactInfo] of this.bankContacts.entries()) {
      const status: BankConnectionStatus = {
        bank,
        isConnected: true, // افتراض الاتصال (يمكن تطويره لاحقاً)
        lastContact: contactInfo.lastContactDate || new Date(0),
        responseTime: 24, // افتراضي 24 ساعة
        availableServices: [
          'approval_requests',
          'payment_confirmation',
          'guarantee_management',
          'status_updates'
        ]
      }

      // فحص نافذة الصيانة (مثال: الجمعة والسبت)
      const now = new Date()
      const dayOfWeek = now.getDay()
      
      if (dayOfWeek === 5 || dayOfWeek === 6) { // الجمعة والسبت
        const maintenanceStart = new Date(now)
        maintenanceStart.setHours(0, 0, 0, 0)
        
        const maintenanceEnd = new Date(now)
        maintenanceEnd.setHours(23, 59, 59, 999)
        if (dayOfWeek === 6) { // السبت
          maintenanceEnd.setDate(maintenanceEnd.getDate() + 1)
          maintenanceEnd.setHours(6, 0, 0, 0) // بداية العمل الأحد
        }

        status.maintenanceWindow = {
          start: maintenanceStart,
          end: maintenanceEnd,
          reason: 'عطلة نهاية الأسبوع'
        }
        status.isConnected = false
      }

      statuses.push(status)
    }

    return statuses
  }

  // ===============================
  // معالجة البيانات البنكية اليدوية
  // ===============================

  /**
   * تسجيل تأكيد دفع من البنك (يدوي)
   */
  async recordBankPaymentConfirmation(
    installmentId: string,
    bankData: {
      bank: YemeniBank
      confirmationNumber: string
      confirmationDate: Date
      confirmedAmount: number
      bankReference: string
      processingFee?: number
      bankOfficer: string
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      console.log(`🏦 تم تسجيل تأكيد دفع من ${bankData.bank}`)
      console.log(`📋 رقم التأكيد: ${bankData.confirmationNumber}`)
      console.log(`💰 المبلغ المؤكد: ${bankData.confirmedAmount.toLocaleString()} ريال يمني`)
      console.log(`👤 موظف البنك: ${bankData.bankOfficer}`)

      // هنا يمكن إضافة المنطق للتكامل مع خدمة الأقساط
      // لتحديث حالة القسط بناء على تأكيد البنك

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تسجيل تأكيد الدفع البنكي:', error)
      return {
        success: false,
        error: 'فشل في تسجيل تأكيد الدفع البنكي'
      }
    }
  }

  /**
   * إرسال ملخص للبنك (يدوي)
   */
  async prepareBankSummary(
    bank: YemeniBank,
    summaryType: 'daily' | 'weekly' | 'monthly',
    date: Date
  ): Promise<{
    success: boolean
    summaryData?: any
    error?: string
  }> {
    try {
      const startDate = new Date(date)
      const endDate = new Date(date)

      // تحديد فترة التقرير
      if (summaryType === 'daily') {
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
      } else if (summaryType === 'weekly') {
        startDate.setDate(startDate.getDate() - startDate.getDay()) // بداية الأسبوع
        endDate.setDate(startDate.getDate() + 6) // نهاية الأسبوع
      } else if (summaryType === 'monthly') {
        startDate.setDate(1) // بداية الشهر
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0) // آخر يوم في الشهر
      }

      const report = await this.generateBankPerformanceReport(bank, startDate, endDate)

      const summaryData = {
        bank: bank,
        reportType: summaryType,
        period: report.period,
        statistics: {
          totalRequests: report.totalRequests,
          approvedRequests: report.approvedRequests,
          rejectedRequests: report.rejectedRequests,
          pendingRequests: report.pendingRequests,
          averageProcessingTime: `${report.averageProcessingTime.toFixed(1)} يوم`,
          approvalRate: report.totalRequests > 0 
            ? `${((report.approvedRequests / report.totalRequests) * 100).toFixed(1)}%`
            : '0%'
        },
        commonIssues: report.commonRejectionReasons,
        contactInfo: this.bankContacts.get(bank),
        generatedAt: new Date(),
        preparationNotes: [
          'يرجى مراجعة الإحصائيات مع موظف البنك المختص',
          'التأكد من صحة البيانات قبل الإرسال',
          'متابعة الطلبات المعلقة حسب الأولوية'
        ]
      }

      console.log(`📊 تم تحضير ملخص ${summaryType} للبنك ${bank}`)

      return {
        success: true,
        summaryData
      }
    } catch (error) {
      console.error('❌ خطأ في تحضير ملخص البنك:', error)
      return {
        success: false,
        error: 'فشل في تحضير ملخص البنك'
      }
    }
  }

  // ===============================
  // الدوال المساعدة الخاصة
  // ===============================

  /**
   * توليد رقم طلب موافقة فريد
   */
  private generateRequestNumber(): string {
    const year = new Date().getFullYear()
    const requestNum = this.requestCounter.toString().padStart(4, '0')
    this.requestCounter++
    return `REQ-${year}-${requestNum}`
  }

  /**
   * الحصول على تاريخ العمل التالي
   */
  private getNextBusinessDate(daysToAdd: number): Date {
    const { BUSINESS_DAYS } = YEMENI_BANKING_CONFIG
    const date = new Date()
    let addedDays = 0

    while (addedDays < daysToAdd) {
      date.setDate(date.getDate() + 1)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      
      if (BUSINESS_DAYS.includes(dayName as any)) {
        addedDays++
      }
    }

    return date
  }

  /**
   * تهيئة معلومات التواصل مع البنوك
   */
  private initializeBankContacts(): void {
    // بنك القاسمي - التكامل الرئيسي
    this.bankContacts.set('AlQasimi', {
      bank: 'AlQasimi',
      branchName: 'الفرع الرئيسي',
      branchCode: 'AQ001',
      contactPerson: 'أحمد محمد القاسمي',
      position: 'مدير قسم الأقساط التجارية',
      phoneNumber: '+967-1-123456',
      email: 'commercial@alqasimi-bank.ye',
      workingHours: 'الأحد - الخميس: 8:00 ص - 2:00 م',
      preferredContactMethod: 'phone',
      relationshipNotes: 'علاقة تجارية ممتازة مع تسهيلات خاصة'
    })

    // البنك الأهلي اليمني
    this.bankContacts.set('NationalBank', {
      bank: 'NationalBank',
      branchName: 'فرع الزبيري',
      contactPerson: 'سعد أحمد الزبيري',
      position: 'مسؤول القروض التجارية',
      phoneNumber: '+967-1-234567',
      workingHours: 'الأحد - الخميس: 8:30 ص - 2:30 م',
      preferredContactMethod: 'visit'
    })

    // بنك سبأ الإسلامي
    this.bankContacts.set('SabaBank', {
      bank: 'SabaBank',
      branchName: 'فرع الحداء',
      contactPerson: 'عبدالله محسن الحداء',
      position: 'مدير التمويل الإسلامي',
      phoneNumber: '+967-1-345678',
      workingHours: 'الأحد - الخميس: 8:00 ص - 2:00 م',
      preferredContactMethod: 'phone'
    })

    console.log('📞 تم تهيئة معلومات التواصل مع البنوك اليمنية')
  }
}

export default BankIntegrationService.getInstance()
