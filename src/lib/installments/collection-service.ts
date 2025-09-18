/**
 * خدمة التحصيل للأقساط المتأخرة اليمنية
 * نظام إدارة لاند سبايس - الوحدة الحادية عشرة
 */

import {
  CollectionAction,
  CollectionCase,
  SettlementOffer,
  CollectionActionType,
  YEMENI_BANKING_CONFIG
} from './types'

// ===============================
// أنواع خاصة بخدمة التحصيل
// ===============================

export interface YemeniCollectionStrategy {
  phase: 'gentle_reminder' | 'formal_notice' | 'personal_contact' | 'legal_action'
  description: string
  timeline: string
  methods: CollectionActionType[]
  expectedSuccessRate: number
}

export interface DailyCollectionReport {
  date: Date
  totalOverdueAmount: number
  casesWorked: number
  successfulContacts: number
  promisesToPay: number
  actualPayments: number
  amountCollected: number
  newCases: number
  escalatedCases: number
  notes: string
  generatedBy: string
}

export interface CollectionResult {
  success: boolean
  actionTaken: CollectionActionType
  customerResponse: 'positive' | 'negative' | 'no_response' | 'hostile'
  promisedPaymentDate?: Date
  nextStepRecommended: CollectionActionType | 'escalate' | 'close'
  notes: string
}

// ===============================
// خدمة التحصيل
// ===============================

export class CollectionService {
  private static instance: CollectionService
  private collectionCases: Map<string, CollectionCase> = new Map()
  private collectionActions: Map<string, CollectionAction> = new Map()
  private settlementOffers: Map<string, SettlementOffer> = new Map()
  private yemeniStrategies: YemeniCollectionStrategy[]

  private constructor() {
    this.initializeService()
    this.yemeniStrategies = this.loadYemeniCollectionStrategies()
  }

  public static getInstance(): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService()
    }
    return CollectionService.instance
  }

  private initializeService(): void {
    console.log('💼 تم تهيئة خدمة التحصيل اليمنية المتخصصة')
  }

  // ===============================
  // إدارة قضايا التحصيل
  // ===============================

  async createCollectionCase(
    restaurantId: string,
    restaurantName: string,
    overdueInstallments: string[],
    caseData: {
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      assignedTo?: string
      specialInstructions?: string[]
    } = {}
  ): Promise<{
    success: boolean
    caseId?: string
    caseNumber?: string
    error?: string
  }> {
    try {
      const caseId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const caseNumber = this.generateCaseNumber()

      const totalOutstanding = 500000 // سيتم حسابه من الأقساط المتأخرة

      const collectionCase: CollectionCase = {
        id: caseId,
        restaurantId,
        restaurantName,
        caseNumber,
        openDate: new Date(),
        status: 'open',
        priority: caseData.priority || 'medium',
        totalOutstanding,
        originalAmount: totalOutstanding,
        accruedFees: 0,
        collectedAmount: 0,
        overdueInstallments,
        oldestOverdueDate: new Date(),
        longestOverdueDays: 30,
        actions: [],
        lastActionDate: new Date(),
        assignedTo: caseData.assignedTo || 'system',
        settlementOffers: [],
        restructuringOptions: [],
        guarantees: [],
        notes: caseData.specialInstructions?.join('; '),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.collectionCases.set(caseId, collectionCase)
      await this.applyCollectionStrategy(caseId)

      console.log(`📋 تم إنشاء قضية تحصيل جديدة: ${caseNumber}`)
      console.log(`🏪 المطعم: ${restaurantName}`)
      console.log(`📊 عدد الأقساط المتأخرة: ${overdueInstallments.length}`)

      return {
        success: true,
        caseId,
        caseNumber
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء قضية التحصيل:', error)
      return {
        success: false,
        error: 'فشل في إنشاء قضية التحصيل'
      }
    }
  }

  async updateCollectionCase(
    caseId: string,
    updates: {
      status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'legal'
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      assignedTo?: string
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const collectionCase = this.collectionCases.get(caseId)
      if (!collectionCase) {
        return {
          success: false,
          error: 'قضية التحصيل غير موجودة'
        }
      }

      Object.assign(collectionCase, updates, { updatedAt: new Date() })
      this.collectionCases.set(caseId, collectionCase)

      console.log(`🔄 تم تحديث قضية التحصيل ${collectionCase.caseNumber}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تحديث قضية التحصيل:', error)
      return {
        success: false,
        error: 'فشل في تحديث قضية التحصيل'
      }
    }
  }

  async getCollectionCase(caseId: string): Promise<CollectionCase | null> {
    return this.collectionCases.get(caseId) || null
  }

  async getActiveCollectionCases(): Promise<CollectionCase[]> {
    return Array.from(this.collectionCases.values())
      .filter(case_ => ['open', 'in_progress'].includes(case_.status))
      .sort((a, b) => {
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 }
        const aPriority = priorityOrder[a.priority]
        const bPriority = priorityOrder[b.priority]
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        
        return a.openDate.getTime() - b.openDate.getTime()
      })
  }

  async getRestaurantCollectionCases(restaurantId: string): Promise<CollectionCase[]> {
    return Array.from(this.collectionCases.values())
      .filter(case_ => case_.restaurantId === restaurantId)
      .sort((a, b) => b.openDate.getTime() - a.openDate.getTime())
  }

  // ===============================
  // إدارة إجراءات التحصيل
  // ===============================

  async executeCollectionAction(
    caseId: string,
    actionData: {
      actionType: CollectionActionType
      contactMethod: 'phone' | 'email' | 'sms' | 'letter' | 'visit'
      contactPerson: string
      message: string
      executedBy: string
    }
  ): Promise<{
    success: boolean
    actionId?: string
    result?: CollectionResult
    error?: string
  }> {
    try {
      const collectionCase = this.collectionCases.get(caseId)
      if (!collectionCase) {
        return {
          success: false,
          error: 'قضية التحصيل غير موجودة'
        }
      }

      const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const action: CollectionAction = {
        id: actionId,
        installmentId: '',
        planId: '',
        restaurantId: collectionCase.restaurantId,
        actionType: actionData.actionType,
        actionDate: new Date(),
        dueAmount: collectionCase.totalOutstanding,
        daysPastDue: collectionCase.longestOverdueDays,
        contactMethod: actionData.contactMethod,
        contactPerson: actionData.contactPerson,
        contactResult: 'successful',
        message: actionData.message,
        followUpRequired: this.determineFollowUpRequired(actionData.actionType),
        escalationLevel: this.getActionEscalationLevel(actionData.actionType),
        executedBy: actionData.executedBy,
        resultStatus: 'pending',
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.collectionActions.set(actionId, action)

      collectionCase.actions.push(action)
      collectionCase.lastActionDate = new Date()
      collectionCase.status = 'in_progress'
      collectionCase.updatedAt = new Date()

      this.collectionCases.set(caseId, collectionCase)

      const result = this.simulateCollectionResult(actionData.actionType, collectionCase)

      action.contactResult = result.customerResponse === 'positive' ? 'successful' : 
                           result.customerResponse === 'no_response' ? 'no_response' : 'failed'
      action.response = result.notes
      action.promisedPaymentDate = result.promisedPaymentDate
      action.resultStatus = result.success ? 'resolved' : 'pending'

      this.collectionActions.set(actionId, action)

      console.log(`📞 تم تنفيذ إجراء التحصيل: ${actionData.actionType}`)
      console.log(`👤 تم الاتصال بـ: ${actionData.contactPerson}`)
      console.log(`📋 النتيجة: ${result.customerResponse}`)

      return {
        success: true,
        actionId,
        result
      }
    } catch (error) {
      console.error('❌ خطأ في تنفيذ إجراء التحصيل:', error)
      return {
        success: false,
        error: 'فشل في تنفيذ إجراء التحصيل'
      }
    }
  }

  async scheduleFollowUp(
    caseId: string,
    followUpData: {
      actionType: CollectionActionType
      scheduledDate: Date
      assignedTo: string
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const collectionCase = this.collectionCases.get(caseId)
      if (!collectionCase) {
        return {
          success: false,
          error: 'قضية التحصيل غير موجودة'
        }
      }

      collectionCase.nextActionDate = followUpData.scheduledDate
      collectionCase.assignedTo = followUpData.assignedTo
      
      if (followUpData.notes) {
        collectionCase.notes = (collectionCase.notes || '') + '\n' + followUpData.notes
      }

      collectionCase.updatedAt = new Date()
      this.collectionCases.set(caseId, collectionCase)

      console.log(`📅 تم جدولة متابعة لقضية ${collectionCase.caseNumber}`)
      console.log(`📆 موعد المتابعة: ${followUpData.scheduledDate.toLocaleDateString('ar-YE')}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في جدولة المتابعة:', error)
      return {
        success: false,
        error: 'فشل في جدولة المتابعة'
      }
    }
  }

  // ===============================
  // عروض التسوية
  // ===============================

  async createSettlementOffer(
    caseId: string,
    offerData: {
      originalAmount: number
      settleAmount: number
      paymentTerms: string
      paymentDeadline: Date
      conditions: string[]
      createdBy: string
    }
  ): Promise<{
    success: boolean
    offerId?: string
    error?: string
  }> {
    try {
      const collectionCase = this.collectionCases.get(caseId)
      if (!collectionCase) {
        return {
          success: false,
          error: 'قضية التحصيل غير موجودة'
        }
      }

      const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const settlementOffer: SettlementOffer = {
        id: offerId,
        caseId,
        offerDate: new Date(),
        originalAmount: offerData.originalAmount,
        settleAmount: offerData.settleAmount,
        discountAmount: offerData.originalAmount - offerData.settleAmount,
        discountPercentage: ((offerData.originalAmount - offerData.settleAmount) / offerData.originalAmount) * 100,
        paymentTerms: offerData.paymentTerms,
        paymentDeadline: offerData.paymentDeadline,
        conditions: offerData.conditions,
        status: 'pending',
        requiredApproval: offerData.settleAmount < offerData.originalAmount * 0.8,
        createdBy: offerData.createdBy,
        createdAt: new Date()
      }

      this.settlementOffers.set(offerId, settlementOffer)

      collectionCase.settlementOffers.push(settlementOffer)
      collectionCase.updatedAt = new Date()
      this.collectionCases.set(caseId, collectionCase)

      console.log(`💰 تم إنشاء عرض تسوية`)
      console.log(`📊 المبلغ الأصلي: ${offerData.originalAmount.toLocaleString()} ريال`)
      console.log(`💸 مبلغ التسوية: ${offerData.settleAmount.toLocaleString()} ريال`)
      console.log(`📉 نسبة الخصم: ${settlementOffer.discountPercentage.toFixed(1)}%`)

      return {
        success: true,
        offerId
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء عرض التسوية:', error)
      return {
        success: false,
        error: 'فشل في إنشاء عرض التسوية'
      }
    }
  }

  // ===============================
  // التقارير
  // ===============================

  async generateDailyCollectionReport(date: Date): Promise<DailyCollectionReport> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const actionsToday = Array.from(this.collectionActions.values())
      .filter(action => action.actionDate >= startOfDay && action.actionDate <= endOfDay)

    const casesToday = Array.from(this.collectionCases.values())
      .filter(case_ => case_.createdAt >= startOfDay && case_.createdAt <= endOfDay)

    const totalOverdueAmount = Array.from(this.collectionCases.values())
      .filter(case_ => ['open', 'in_progress'].includes(case_.status))
      .reduce((sum, case_) => sum + case_.totalOutstanding, 0)

    const successfulContacts = actionsToday.filter(action => 
      action.contactResult === 'successful').length

    const promisesToPay = actionsToday.filter(action => 
      action.contactResult === 'promised_payment').length

    const escalatedCases = Array.from(this.collectionCases.values())
      .filter(case_ => case_.updatedAt >= startOfDay && case_.updatedAt <= endOfDay && 
                      case_.status === 'legal').length

    return {
      date,
      totalOverdueAmount,
      casesWorked: actionsToday.length,
      successfulContacts,
      promisesToPay,
      actualPayments: 0,
      amountCollected: 0,
      newCases: casesToday.length,
      escalatedCases,
      notes: `تقرير تلقائي لأنشطة التحصيل`,
      generatedBy: 'system'
    }
  }

  // ===============================
  // الدوال المساعدة
  // ===============================

  private generateCaseNumber(): string {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `COL-${year}${month}-${random}`
  }

  private async applyCollectionStrategy(caseId: string): Promise<void> {
    const collectionCase = this.collectionCases.get(caseId)
    if (!collectionCase) return

    let strategyPhase: YemeniCollectionStrategy['phase'] = 'gentle_reminder'

    if (collectionCase.longestOverdueDays > 90) {
      strategyPhase = 'legal_action'
    } else if (collectionCase.longestOverdueDays > 30) {
      strategyPhase = 'personal_contact'
    } else if (collectionCase.longestOverdueDays > 15) {
      strategyPhase = 'formal_notice'
    }

    const strategy = this.yemeniStrategies.find(s => s.phase === strategyPhase)
    if (strategy) {
      console.log(`📋 تم تطبيق إستراتيجية: ${strategy.description}`)
      console.log(`⏱️ الإطار الزمني: ${strategy.timeline}`)
    }
  }

  private getActionEscalationLevel(actionType: CollectionActionType): number {
    switch (actionType) {
      case 'reminder': return 1
      case 'notice': return 2
      case 'phone_call': return 2
      case 'visit': return 3
      case 'legal_notice': return 4
      case 'legal_action': return 5
      case 'guarantee_activation': return 5
      default: return 1
    }
  }

  private determineFollowUpRequired(actionType: CollectionActionType): boolean {
    return ['reminder', 'notice', 'phone_call', 'visit'].includes(actionType)
  }

  private simulateCollectionResult(actionType: CollectionActionType, collectionCase: CollectionCase): CollectionResult {
    const successRates = {
      'reminder': 0.6,
      'notice': 0.4,
      'phone_call': 0.7,
      'visit': 0.8,
      'legal_notice': 0.3,
      'legal_action': 0.9,
      'guarantee_activation': 0.95
    }

    const successRate = successRates[actionType] || 0.5
    const isSuccessful = Math.random() < successRate

    const responses: CollectionResult['customerResponse'][] = ['positive', 'negative', 'no_response']

    return {
      success: isSuccessful,
      actionTaken: actionType,
      customerResponse: isSuccessful ? 'positive' : responses[Math.floor(Math.random() * responses.length)],
      promisedPaymentDate: isSuccessful && Math.random() > 0.5 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : undefined,
      nextStepRecommended: isSuccessful ? 'phone_call' : 'escalate',
      notes: isSuccessful 
        ? 'تفهم العميل الوضع ووعد بالسداد'
        : 'صعوبة في التواصل مع العميل'
    }
  }

  private loadYemeniCollectionStrategies(): YemeniCollectionStrategy[] {
    return [
      {
        phase: 'gentle_reminder',
        description: 'التذكير الودي - المرحلة الأولى',
        timeline: '1-15 يوم من التأخير',
        methods: ['reminder'],
        expectedSuccessRate: 0.6
      },
      {
        phase: 'formal_notice',
        description: 'الإشعار الرسمي - المرحلة الثانية',
        timeline: '16-30 يوم من التأخير',
        methods: ['notice', 'phone_call'],
        expectedSuccessRate: 0.4
      },
      {
        phase: 'personal_contact',
        description: 'التواصل الشخصي - المرحلة الثالثة',
        timeline: '31-90 يوم من التأخير',
        methods: ['phone_call', 'visit'],
        expectedSuccessRate: 0.7
      },
      {
        phase: 'legal_action',
        description: 'الإجراءات القانونية - المرحلة الأخيرة',
        timeline: '90+ يوم من التأخير',
        methods: ['legal_notice', 'legal_action', 'guarantee_activation'],
        expectedSuccessRate: 0.9
      }
    ]
  }
}

export default CollectionService.getInstance()
