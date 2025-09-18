/**
 * خدمة إدارة الأقساط البنكية اليمنية
 * نظام إدارة لاند سبايس - الوحدة الحادية عشرة
 */

import {
  InstallmentPlan,
  InstallmentPayment,
  InstallmentPlanStatus,
  InstallmentStatus,
  InstallmentSearchCriteria,
  InstallmentReport,
  YEMENI_BANKING_CONFIG,
  YemeniBank
} from './types'

import {
  validateInstallmentPlan,
  calculateInstallmentPlan,
  ValidationResult
} from './validation'

/**
 * خدمة إدارة الأقساط - نمط Singleton
 */
export class InstallmentService {
  private static instance: InstallmentService
  private installmentPlans: Map<string, InstallmentPlan> = new Map()
  private installmentPayments: Map<string, InstallmentPayment> = new Map()
  private planCounter: number = 1000

  private constructor() {
    this.initializeService()
  }

  public static getInstance(): InstallmentService {
    if (!InstallmentService.instance) {
      InstallmentService.instance = new InstallmentService()
    }
    return InstallmentService.instance
  }

  private initializeService(): void {
    console.log('🏧 تم تهيئة خدمة إدارة الأقساط البنكية اليمنية')
    this.loadSampleData()
  }

  // ===============================
  // إدارة خطط الأقساط
  // ===============================

  async createInstallmentPlan(planData: Omit<InstallmentPlan, 'id' | 'planNumber' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean
    planId?: string
    validation?: ValidationResult
    error?: string
  }> {
    try {
      const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const planNumber = this.generatePlanNumber()

      const plan: InstallmentPlan = {
        ...planData,
        id: planId,
        planNumber,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const validation = validateInstallmentPlan(plan)
      if (!validation.isValid) {
        return {
          success: false,
          validation,
          error: 'بيانات الخطة غير صحيحة'
        }
      }

      this.installmentPlans.set(planId, plan)
      await this.generateInstallmentSchedule(planId)

      console.log(`✅ تم إنشاء خطة الأقساط: ${planNumber}`)

      return {
        success: true,
        planId,
        validation
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء خطة الأقساط:', error)
      return {
        success: false,
        error: 'فشل في إنشاء خطة الأقساط'
      }
    }
  }

  async updateInstallmentPlan(
    planId: string,
    updates: Partial<Omit<InstallmentPlan, 'id' | 'planNumber' | 'createdAt'>>
  ): Promise<{
    success: boolean
    validation?: ValidationResult
    error?: string
  }> {
    try {
      const existingPlan = this.installmentPlans.get(planId)
      if (!existingPlan) {
        return {
          success: false,
          error: 'خطة الأقساط غير موجودة'
        }
      }

      if (['completed', 'cancelled'].includes(existingPlan.status)) {
        return {
          success: false,
          error: 'لا يمكن تعديل الخطط المكتملة أو الملغاة'
        }
      }

      const updatedPlan: InstallmentPlan = {
        ...existingPlan,
        ...updates,
        updatedAt: new Date()
      }

      const validation = validateInstallmentPlan(updatedPlan)
      if (!validation.isValid) {
        return {
          success: false,
          validation,
          error: 'بيانات التحديث غير صحيحة'
        }
      }

      this.installmentPlans.set(planId, updatedPlan)

      if (this.shouldRegenerateSchedule(existingPlan, updatedPlan)) {
        await this.regenerateInstallmentSchedule(planId)
      }

      console.log(`✅ تم تحديث خطة الأقساط: ${updatedPlan.planNumber}`)

      return {
        success: true,
        validation
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث خطة الأقساط:', error)
      return {
        success: false,
        error: 'فشل في تحديث خطة الأقساط'
      }
    }
  }

  async getInstallmentPlan(planId: string): Promise<InstallmentPlan | null> {
    return this.installmentPlans.get(planId) || null
  }

  async getRestaurantInstallmentPlans(restaurantId: string): Promise<InstallmentPlan[]> {
    return Array.from(this.installmentPlans.values())
      .filter(plan => plan.restaurantId === restaurantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async searchInstallmentPlans(criteria: InstallmentSearchCriteria): Promise<{
    plans: InstallmentPlan[]
    totalCount: number
    page: number
    totalPages: number
  }> {
    let filteredPlans = Array.from(this.installmentPlans.values())

    // تطبيق المرشحات
    if (criteria.restaurantId) {
      filteredPlans = filteredPlans.filter(plan => plan.restaurantId === criteria.restaurantId)
    }

    if (criteria.bankId) {
      filteredPlans = filteredPlans.filter(plan => plan.bankId === criteria.bankId)
    }

    if (criteria.status && criteria.status.length > 0) {
      filteredPlans = filteredPlans.filter(plan => criteria.status!.includes(plan.status))
    }

    if (criteria.searchText) {
      const searchLower = criteria.searchText.toLowerCase()
      filteredPlans = filteredPlans.filter(plan => 
        plan.planNumber.toLowerCase().includes(searchLower) ||
        plan.restaurantName.toLowerCase().includes(searchLower)
      )
    }

    // الترتيب
    if (criteria.sortBy) {
      filteredPlans.sort((a, b) => {
        const aVal = a[criteria.sortBy as keyof InstallmentPlan]
        const bVal = b[criteria.sortBy as keyof InstallmentPlan]
        
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return criteria.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    // الترقيم
    const page = criteria.page || 1
    const limit = criteria.limit || 10
    const totalCount = filteredPlans.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const plans = filteredPlans.slice(startIndex, endIndex)

    return {
      plans,
      totalCount,
      page,
      totalPages
    }
  }

  // ===============================
  // إدارة حالات الخطط
  // ===============================

  async submitForBankApproval(planId: string, submittedBy: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const plan = this.installmentPlans.get(planId)
      if (!plan) {
        return {
          success: false,
          error: 'خطة الأقساط غير موجودة'
        }
      }

      if (plan.status !== 'draft') {
        return {
          success: false,
          error: 'يمكن تقديم المسودات فقط للموافقة'
        }
      }

      plan.status = 'pending'
      plan.updatedAt = new Date()
      this.installmentPlans.set(planId, plan)

      console.log(`📋 تم تقديم خطة الأقساط ${plan.planNumber} للموافقة البنكية`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تقديم خطة الأقساط:', error)
      return {
        success: false,
        error: 'فشل في تقديم خطة الأقساط'
      }
    }
  }

  async approvePlan(planId: string, approvedBy: string, conditions?: string[]): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const plan = this.installmentPlans.get(planId)
      if (!plan) {
        return {
          success: false,
          error: 'خطة الأقساط غير موجودة'
        }
      }

      if (plan.status !== 'pending') {
        return {
          success: false,
          error: 'يمكن الموافقة على الخطط المعلقة فقط'
        }
      }

      plan.status = 'approved'
      plan.approvedBy = approvedBy
      plan.approvalDate = new Date()
      plan.updatedAt = new Date()

      if (conditions) {
        plan.specialConditions = conditions.join('; ')
      }

      this.installmentPlans.set(planId, plan)

      console.log(`✅ تم اعتماد خطة الأقساط ${plan.planNumber} من قبل ${approvedBy}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في اعتماد خطة الأقساط:', error)
      return {
        success: false,
        error: 'فشل في اعتماد خطة الأقساط'
      }
    }
  }

  async activatePlan(planId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const plan = this.installmentPlans.get(planId)
      if (!plan) {
        return {
          success: false,
          error: 'خطة الأقساط غير موجودة'
        }
      }

      if (plan.status !== 'approved') {
        return {
          success: false,
          error: 'يمكن تفعيل الخطط المعتمدة فقط'
        }
      }

      plan.status = 'active'
      plan.activationDate = new Date()
      plan.updatedAt = new Date()

      this.installmentPlans.set(planId, plan)
      await this.activateInstallments(planId)

      console.log(`🚀 تم تفعيل خطة الأقساط ${plan.planNumber}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تفعيل خطة الأقساط:', error)
      return {
        success: false,
        error: 'فشل في تفعيل خطة الأقساط'
      }
    }
  }

  // ===============================
  // إدارة الأقساط الفردية
  // ===============================

  private async generateInstallmentSchedule(planId: string): Promise<void> {
    const plan = this.installmentPlans.get(planId)
    if (!plan) return

    const calculation = calculateInstallmentPlan(
      plan.totalAmount,
      plan.interestRate,
      plan.installmentCount,
      plan.frequency,
      plan.firstInstallmentDate
    )

    for (let i = 0; i < calculation.monthlyPayments.length; i++) {
      const paymentData = calculation.monthlyPayments[i]
      
      const installmentId = `inst_${planId}_${i + 1}`
      const installment: InstallmentPayment = {
        id: installmentId,
        planId: planId,
        installmentNumber: paymentData.installmentNumber,
        dueDate: paymentData.dueDate,
        amount: paymentData.totalAmount,
        principalAmount: paymentData.principalAmount,
        interestAmount: paymentData.interestAmount,
        totalAmount: paymentData.totalAmount,
        status: 'pending',
        remindersSent: 0,
        bankProcessed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.installmentPayments.set(installmentId, installment)
    }

    console.log(`📅 تم إنشاء جدول ${plan.installmentCount} قسط للخطة ${plan.planNumber}`)
  }

  async recordInstallmentPayment(
    installmentId: string,
    paymentData: {
      paidAmount: number
      paidDate: Date
      paymentMethod?: string
      bankReference?: string
      receiptNumber?: string
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const installment = this.installmentPayments.get(installmentId)
      if (!installment) {
        return {
          success: false,
          error: 'القسط غير موجود'
        }
      }

      if (installment.status === 'paid') {
        return {
          success: false,
          error: 'تم دفع هذا القسط مسبقاً'
        }
      }

      installment.paidDate = paymentData.paidDate
      installment.paidAmount = paymentData.paidAmount
      installment.paymentMethod = paymentData.paymentMethod
      installment.bankReference = paymentData.bankReference
      installment.receiptNumber = paymentData.receiptNumber
      installment.notes = paymentData.notes

      if (paymentData.paidAmount >= installment.totalAmount) {
        installment.status = 'paid'
      } else {
        installment.status = 'partial_paid'
      }

      if (paymentData.paidDate > installment.dueDate) {
        installment.daysPastDue = Math.ceil(
          (paymentData.paidDate.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        const plan = this.installmentPlans.get(installment.planId)
        if (plan && plan.lateFee > 0) {
          installment.lateFee = installment.daysPastDue * plan.lateFee
          installment.totalAmount += installment.lateFee
        }
      }

      installment.updatedAt = new Date()
      this.installmentPayments.set(installmentId, installment)

      await this.checkPlanCompletion(installment.planId)

      console.log(`💰 تم تسجيل دفع القسط رقم ${installment.installmentNumber}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تسجيل دفع القسط:', error)
      return {
        success: false,
        error: 'فشل في تسجيل دفع القسط'
      }
    }
  }

  async getPlanInstallments(planId: string): Promise<InstallmentPayment[]> {
    return Array.from(this.installmentPayments.values())
      .filter(payment => payment.planId === planId)
      .sort((a, b) => a.installmentNumber - b.installmentNumber)
  }

  async getDueInstallments(): Promise<InstallmentPayment[]> {
    const now = new Date()
    return Array.from(this.installmentPayments.values())
      .filter(payment => 
        payment.status === 'due' && 
        payment.dueDate <= now &&
        !payment.paidDate
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }

  async getOverdueInstallments(): Promise<InstallmentPayment[]> {
    const now = new Date()
    return Array.from(this.installmentPayments.values())
      .filter(payment => {
        const plan = this.installmentPlans.get(payment.planId)
        const gracePeriodEnd = new Date(payment.dueDate)
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + (plan?.gracePeriod || 0))
        
        return payment.status !== 'paid' && 
               now > gracePeriodEnd &&
               !payment.paidDate
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }

  // ===============================
  // الدوال المساعدة الخاصة
  // ===============================

  private generatePlanNumber(): string {
    const year = new Date().getFullYear()
    const planNum = this.planCounter.toString().padStart(4, '0')
    this.planCounter++
    return `PLN-${year}-${planNum}`
  }

  private shouldRegenerateSchedule(oldPlan: InstallmentPlan, newPlan: InstallmentPlan): boolean {
    return oldPlan.totalAmount !== newPlan.totalAmount ||
           oldPlan.installmentCount !== newPlan.installmentCount ||
           oldPlan.interestRate !== newPlan.interestRate ||
           oldPlan.frequency !== newPlan.frequency ||
           oldPlan.firstInstallmentDate.getTime() !== newPlan.firstInstallmentDate.getTime()
  }

  private async regenerateInstallmentSchedule(planId: string): Promise<void> {
    const existingPayments = Array.from(this.installmentPayments.values())
      .filter(payment => payment.planId === planId)

    for (const payment of existingPayments) {
      if (payment.status === 'pending') {
        this.installmentPayments.delete(payment.id)
      }
    }

    await this.generateInstallmentSchedule(planId)
  }

  private async activateInstallments(planId: string): Promise<void> {
    const installments = Array.from(this.installmentPayments.values())
      .filter(payment => payment.planId === planId)

    for (const installment of installments) {
      if (installment.dueDate <= new Date() && installment.status === 'pending') {
        installment.status = 'due'
        installment.updatedAt = new Date()
        this.installmentPayments.set(installment.id, installment)
      }
    }
  }

  private async checkPlanCompletion(planId: string): Promise<void> {
    const plan = this.installmentPlans.get(planId)
    if (!plan || plan.status === 'completed') return

    const installments = await this.getPlanInstallments(planId)
    const allPaid = installments.every(inst => inst.status === 'paid')

    if (allPaid) {
      plan.status = 'completed'
      plan.completionDate = new Date()
      plan.updatedAt = new Date()
      this.installmentPlans.set(planId, plan)

      console.log(`🎉 تم إكمال خطة الأقساط ${plan.planNumber} بنجاح`)
    }
  }

  private loadSampleData(): void {
    // بيانات عينة للاختبار
    console.log('📝 تم تحميل البيانات العينة')
  }
}

export default InstallmentService.getInstance()
