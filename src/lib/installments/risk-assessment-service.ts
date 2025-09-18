/**
 * خدمة تقييم المخاطر الائتمانية للمطاعم اليمنية
 * نظام إدارة لاند سبايس - الوحدة الحادية عشرة
 */

import {
  CreditAssessment,
  PaymentHistoryRecord,
  CreditRiskLevel,
  YEMENI_BANKING_CONFIG
} from './types'

import {
  calculateCreditScore,
  assessCreditRisk
} from './validation'

// ===============================
// أنواع خاصة بتقييم المخاطر
// ===============================

export interface YemeniRiskFactors {
  economicStability: number      // (0-10) استقرار الوضع الاقتصادي
  currencyStability: number      // (0-10) استقرار العملة
  locationRisk: number           // (0-10) مخاطر الموقع الجغرافي
  industryTrends: number         // (0-10) اتجاهات قطاع المطاعم
  competitionLevel: number       // (0-10) مستوى المنافسة
}

export interface RestaurantRiskProfile {
  restaurantId: string
  restaurantName: string
  creditScore: number
  riskLevel: CreditRiskLevel
  riskCategory: string
  
  financialPerformance: {
    averageMonthlyRevenue: number
    profitMargin: number
    debtToIncomeRatio: number
    cashFlowStability: number
  }
  
  paymentBehavior: {
    onTimePaymentRate: number
    averageDelayDays: number
    paymentConsistency: number
  }
  
  externalFactors: YemeniRiskFactors
  recommendations: string[]
  warningFlags: string[]
  
  lastAssessment: Date
  nextReviewDate: Date
  assessedBy: string
}

export interface PortfolioRiskReport {
  reportPeriod: {
    startDate: Date
    endDate: Date
  }
  
  totalRestaurants: number
  totalExposure: number
  averageCreditScore: number
  
  riskDistribution: {
    riskLevel: CreditRiskLevel
    count: number
    percentage: number
    totalExposure: number
  }[]
  
  portfolioHealth: {
    defaultRate: number
    expectedLoss: number
    concentrationRisk: number
  }
  
  strategicRecommendations: string[]
  generatedAt: Date
  generatedBy: string
}

// ===============================
// خدمة تقييم المخاطر الائتمانية
// ===============================

export class RiskAssessmentService {
  private static instance: RiskAssessmentService
  private creditAssessments: Map<string, CreditAssessment> = new Map()
  private riskProfiles: Map<string, RestaurantRiskProfile> = new Map()
  private yemeniFactors: YemeniRiskFactors

  private constructor() {
    this.initializeService()
    this.yemeniFactors = this.loadYemeniRiskFactors()
  }

  public static getInstance(): RiskAssessmentService {
    if (!RiskAssessmentService.instance) {
      RiskAssessmentService.instance = new RiskAssessmentService()
    }
    return RiskAssessmentService.instance
  }

  private initializeService(): void {
    console.log('⚖️ تم تهيئة خدمة تقييم المخاطر الائتمانية اليمنية')
  }

  // ===============================
  // التقييم الائتماني الأساسي
  // ===============================

  async createCreditAssessment(
    restaurantId: string,
    restaurantName: string,
    assessmentData: {
      paymentHistory: PaymentHistoryRecord[]
      currentOutstanding: number
      maxCreditLimit?: number
      businessSize?: 'small' | 'medium' | 'large'
    }
  ): Promise<{
    success: boolean
    assessmentId?: string
    creditScore?: number
    riskLevel?: CreditRiskLevel
    error?: string
  }> {
    try {
      const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // تحليل تاريخ السداد
      const paymentAnalysis = this.analyzePaymentHistory(assessmentData.paymentHistory)

      // حساب الحد الائتماني المقترح
      const suggestedCreditLimit = assessmentData.maxCreditLimit || 
        this.calculateSuggestedCreditLimit(assessmentData)

      // إنشاء التقييم الأساسي
      const baseAssessment: Partial<CreditAssessment> = {
        restaurantId,
        restaurantName,
        paymentHistory: assessmentData.paymentHistory,
        onTimePayments: paymentAnalysis.onTimePayments,
        latePayments: paymentAnalysis.latePayments,
        missedPayments: paymentAnalysis.missedPayments,
        currentOutstanding: assessmentData.currentOutstanding,
        maxCreditLimit: suggestedCreditLimit,
        overdueAmount: paymentAnalysis.overdueAmount,
        averagePaymentTime: paymentAnalysis.averagePaymentTime,
        totalPaidAmount: paymentAnalysis.totalPaidAmount,
        totalInstallmentPlans: paymentAnalysis.totalPlans,
        completedPlans: paymentAnalysis.completedPlans,
        activePlans: paymentAnalysis.activePlans
      }

      // حساب النقاط الائتمانية ومستوى المخاطر
      const creditScore = calculateCreditScore(baseAssessment)
      const riskLevel = assessCreditRisk(creditScore) as CreditRiskLevel

      // إنشاء التقييم الكامل
      const assessment: CreditAssessment = {
        id: assessmentId,
        restaurantId,
        restaurantName,
        riskLevel,
        creditScore,
        maxCreditLimit: suggestedCreditLimit,
        availableCredit: Math.max(0, suggestedCreditLimit - assessmentData.currentOutstanding),
        paymentHistory: assessmentData.paymentHistory,
        onTimePayments: paymentAnalysis.onTimePayments,
        latePayments: paymentAnalysis.latePayments,
        missedPayments: paymentAnalysis.missedPayments,
        currentOutstanding: assessmentData.currentOutstanding,
        overdueAmount: paymentAnalysis.overdueAmount,
        longestOverdueDays: paymentAnalysis.longestOverdueDays,
        averagePaymentTime: paymentAnalysis.averagePaymentTime,
        totalPaidAmount: paymentAnalysis.totalPaidAmount,
        totalInstallmentPlans: paymentAnalysis.totalPlans,
        completedPlans: paymentAnalysis.completedPlans,
        activePlans: paymentAnalysis.activePlans,
        assessmentDate: new Date(),
        nextReviewDate: this.calculateNextReviewDate(riskLevel),
        recommendations: this.generateRecommendations(creditScore, riskLevel, baseAssessment),
        warningFlags: this.identifyWarningFlags(baseAssessment),
        industryRisk: this.yemeniFactors.industryTrends,
        locationRisk: this.yemeniFactors.locationRisk,
        economicIndicators: this.yemeniFactors.economicStability,
        assessedBy: 'system'
      }

      // حفظ التقييم
      this.creditAssessments.set(assessmentId, assessment)

      // إنشاء ملف المخاطر المفصل
      await this.createRiskProfile(restaurantId, assessment)

      console.log(`📊 تم إنشاء تقييم ائتماني للمطعم ${restaurantName}`)
      console.log(`📈 النقاط الائتمانية: ${creditScore}`)
      console.log(`⚠️ مستوى المخاطر: ${riskLevel}`)

      return {
        success: true,
        assessmentId,
        creditScore,
        riskLevel
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء التقييم الائتماني:', error)
      return {
        success: false,
        error: 'فشل في إنشاء التقييم الائتماني'
      }
    }
  }

  async updateCreditAssessment(
    assessmentId: string,
    updates: Partial<CreditAssessment>
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const existingAssessment = this.creditAssessments.get(assessmentId)
      if (!existingAssessment) {
        return {
          success: false,
          error: 'التقييم الائتماني غير موجود'
        }
      }

      const updatedAssessment: CreditAssessment = {
        ...existingAssessment,
        ...updates,
        assessmentDate: new Date()
      }

      // إعادة حساب النقاط إذا تغيرت البيانات الأساسية
      if (updates.paymentHistory || updates.currentOutstanding || updates.overdueAmount) {
        updatedAssessment.creditScore = calculateCreditScore(updatedAssessment)
        updatedAssessment.riskLevel = assessCreditRisk(updatedAssessment.creditScore) as CreditRiskLevel
        updatedAssessment.recommendations = this.generateRecommendations(
          updatedAssessment.creditScore,
          updatedAssessment.riskLevel,
          updatedAssessment
        )
        updatedAssessment.warningFlags = this.identifyWarningFlags(updatedAssessment)
      }

      this.creditAssessments.set(assessmentId, updatedAssessment)
      await this.updateRiskProfile(updatedAssessment.restaurantId, updatedAssessment)

      console.log(`🔄 تم تحديث التقييم الائتماني للمطعم ${updatedAssessment.restaurantName}`)

      return { success: true }
    } catch (error) {
      console.error('❌ خطأ في تحديث التقييم الائتماني:', error)
      return {
        success: false,
        error: 'فشل في تحديث التقييم الائتماني'
      }
    }
  }

  async getCreditAssessment(restaurantId: string): Promise<CreditAssessment | null> {
    for (const assessment of this.creditAssessments.values()) {
      if (assessment.restaurantId === restaurantId) {
        return assessment
      }
    }
    return null
  }

  async getRestaurantRiskProfile(restaurantId: string): Promise<RestaurantRiskProfile | null> {
    return this.riskProfiles.get(restaurantId) || null
  }

  // ===============================
  // تحليل المخاطر
  // ===============================

  async generatePortfolioRiskReport(startDate: Date, endDate: Date): Promise<PortfolioRiskReport> {
    const allAssessments = Array.from(this.creditAssessments.values())
      .filter(assessment => assessment.assessmentDate >= startDate && assessment.assessmentDate <= endDate)

    const totalRestaurants = allAssessments.length
    const totalExposure = allAssessments.reduce((sum, a) => sum + a.currentOutstanding, 0)
    const averageCreditScore = allAssessments.reduce((sum, a) => sum + a.creditScore, 0) / totalRestaurants

    // توزيع المخاطر
    const riskCounts = new Map<CreditRiskLevel, { count: number; exposure: number }>()
    
    for (const assessment of allAssessments) {
      const current = riskCounts.get(assessment.riskLevel) || { count: 0, exposure: 0 }
      current.count++
      current.exposure += assessment.currentOutstanding
      riskCounts.set(assessment.riskLevel, current)
    }

    const riskDistribution = Array.from(riskCounts.entries()).map(([riskLevel, data]) => ({
      riskLevel,
      count: data.count,
      percentage: (data.count / totalRestaurants) * 100,
      totalExposure: data.exposure
    }))

    // صحة المحفظة
    const defaultedAssessments = allAssessments.filter(a => a.riskLevel === 'critical' || a.riskLevel === 'severe')
    const defaultRate = (defaultedAssessments.length / totalRestaurants) * 100

    // الخسارة المتوقعة (تقدير)
    const expectedLoss = allAssessments.reduce((sum, assessment) => {
      const lossRate = this.getExpectedLossRate(assessment.riskLevel)
      return sum + (assessment.currentOutstanding * lossRate)
    }, 0)

    // مخاطر التركز
    const concentrationRisk = this.calculateConcentrationRisk(allAssessments)

    return {
      reportPeriod: { startDate, endDate },
      totalRestaurants,
      totalExposure,
      averageCreditScore,
      riskDistribution,
      portfolioHealth: {
        defaultRate,
        expectedLoss,
        concentrationRisk
      },
      strategicRecommendations: this.generateStrategicRecommendations(riskDistribution, defaultRate),
      generatedAt: new Date(),
      generatedBy: 'system'
    }
  }

  // ===============================
  // الدوال المساعدة الخاصة
  // ===============================

  private analyzePaymentHistory(paymentHistory: PaymentHistoryRecord[]) {
    let onTimePayments = 0
    let latePayments = 0
    let missedPayments = 0
    let totalPaidAmount = 0
    let totalDelayDays = 0
    let overdueAmount = 0
    let longestOverdueDays = 0

    for (const record of paymentHistory) {
      totalPaidAmount += record.amount

      switch (record.status) {
        case 'on_time':
          onTimePayments++
          break
        case 'late':
          latePayments++
          totalDelayDays += record.daysPastDue
          longestOverdueDays = Math.max(longestOverdueDays, record.daysPastDue)
          break
        case 'missed':
          missedPayments++
          overdueAmount += record.amount
          break
        case 'partial':
          latePayments++
          break
      }
    }

    const totalPayments = paymentHistory.length
    const averagePaymentTime = latePayments > 0 ? totalDelayDays / latePayments : 0
    const totalPlans = Math.ceil(totalPayments / 12)
    const completedPlans = Math.floor(totalPlans * 0.7)
    const activePlans = totalPlans - completedPlans

    return {
      onTimePayments,
      latePayments,
      missedPayments,
      totalPaidAmount,
      averagePaymentTime,
      overdueAmount,
      longestOverdueDays,
      totalPlans,
      completedPlans,
      activePlans
    }
  }

  private calculateSuggestedCreditLimit(assessmentData: {
    paymentHistory: PaymentHistoryRecord[]
    currentOutstanding: number
    businessSize?: 'small' | 'medium' | 'large'
  }): number {
    const monthlyPayments = assessmentData.paymentHistory
      .filter(p => p.status !== 'missed')
      .reduce((sum, p) => sum + p.amount, 0) / 12

    let sizeMultiplier = 1.2
    switch (assessmentData.businessSize) {
      case 'small': sizeMultiplier = 1.0; break
      case 'medium': sizeMultiplier = 1.5; break
      case 'large': sizeMultiplier = 2.0; break
    }

    const baseCreditLimit = monthlyPayments * 6 * sizeMultiplier
    const minLimit = 100000
    const maxLimit = 10000000

    return Math.min(maxLimit, Math.max(minLimit, baseCreditLimit))
  }

  private calculateNextReviewDate(riskLevel: CreditRiskLevel): Date {
    const now = new Date()
    const nextReview = new Date(now)

    switch (riskLevel) {
      case 'minimal':
      case 'low':
        nextReview.setMonth(nextReview.getMonth() + 12)
        break
      case 'moderate':
        nextReview.setMonth(nextReview.getMonth() + 6)
        break
      case 'high':
        nextReview.setMonth(nextReview.getMonth() + 3)
        break
      case 'severe':
      case 'critical':
        nextReview.setMonth(nextReview.getMonth() + 1)
        break
    }

    return nextReview
  }

  private generateRecommendations(
    creditScore: number,
    riskLevel: CreditRiskLevel,
    assessment: Partial<CreditAssessment>
  ): string[] {
    const recommendations: string[] = []

    if (creditScore >= 85) {
      recommendations.push('مطعم ممتاز - يمكن تقديم شروط تفضيلية')
      recommendations.push('النظر في زيادة الحد الائتماني')
    } else if (creditScore >= 70) {
      recommendations.push('مطعم جيد - شروط عادية مناسبة')
      recommendations.push('مراقبة دورية للأداء المالي')
    } else if (creditScore >= 50) {
      recommendations.push('يتطلب ضمانات إضافية')
      recommendations.push('تقليل الحد الائتماني')
    } else {
      recommendations.push('مخاطر عالية - النظر في رفض التمويل')
      recommendations.push('طلب ضمانات بنكية قوية')
    }

    if (assessment.averagePaymentTime && assessment.averagePaymentTime > 15) {
      recommendations.push('نمط تأخير مستمر - تطبيق رسوم تأخير أعلى')
    }

    return recommendations
  }

  private identifyWarningFlags(assessment: Partial<CreditAssessment>): string[] {
    const flags: string[] = []

    if (assessment.missedPayments && assessment.missedPayments > 3) {
      flags.push('أكثر من 3 مدفوعات مفقودة')
    }

    if (assessment.overdueAmount && assessment.overdueAmount > 500000) {
      flags.push('مبلغ متأخر يزيد عن 500,000 ريال')
    }

    if (assessment.longestOverdueDays && assessment.longestOverdueDays > 90) {
      flags.push('تأخير لأكثر من 90 يوم')
    }

    return flags
  }

  private async createRiskProfile(restaurantId: string, assessment: CreditAssessment): Promise<void> {
    const riskProfile: RestaurantRiskProfile = {
      restaurantId,
      restaurantName: assessment.restaurantName,
      creditScore: assessment.creditScore,
      riskLevel: assessment.riskLevel,
      riskCategory: this.getRiskCategory(assessment.riskLevel),
      
      financialPerformance: {
        averageMonthlyRevenue: assessment.totalPaidAmount / 12,
        profitMargin: 0.15,
        debtToIncomeRatio: assessment.currentOutstanding / (assessment.totalPaidAmount || 1),
        cashFlowStability: this.calculateCashFlowStability(assessment.paymentHistory)
      },
      
      paymentBehavior: {
        onTimePaymentRate: assessment.onTimePayments / (assessment.onTimePayments + assessment.latePayments + assessment.missedPayments),
        averageDelayDays: assessment.averagePaymentTime,
        paymentConsistency: this.calculatePaymentConsistency(assessment.paymentHistory)
      },
      
      externalFactors: this.yemeniFactors,
      recommendations: assessment.recommendations,
      warningFlags: assessment.warningFlags,
      
      lastAssessment: assessment.assessmentDate,
      nextReviewDate: assessment.nextReviewDate,
      assessedBy: assessment.assessedBy
    }

    this.riskProfiles.set(restaurantId, riskProfile)
  }

  private async updateRiskProfile(restaurantId: string, assessment: CreditAssessment): Promise<void> {
    const existingProfile = this.riskProfiles.get(restaurantId)
    if (!existingProfile) {
      await this.createRiskProfile(restaurantId, assessment)
      return
    }

    existingProfile.creditScore = assessment.creditScore
    existingProfile.riskLevel = assessment.riskLevel
    existingProfile.riskCategory = this.getRiskCategory(assessment.riskLevel)
    existingProfile.lastAssessment = assessment.assessmentDate
    existingProfile.nextReviewDate = assessment.nextReviewDate
    existingProfile.recommendations = assessment.recommendations
    existingProfile.warningFlags = assessment.warningFlags

    this.riskProfiles.set(restaurantId, existingProfile)
  }

  private getRiskCategory(riskLevel: CreditRiskLevel): string {
    switch (riskLevel) {
      case 'minimal': return 'عميل ممتاز'
      case 'low': return 'عميل جيد'
      case 'moderate': return 'عميل عادي'
      case 'high': return 'عميل يحتاج مراقبة'
      case 'severe': return 'عميل عالي المخاطر'
      case 'critical': return 'عميل خطر جداً'
      default: return 'غير محدد'
    }
  }

  private calculateCashFlowStability(paymentHistory: PaymentHistoryRecord[]): number {
    if (paymentHistory.length < 3) return 0.5

    const amounts = paymentHistory.map(p => p.amount)
    const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - average, 2), 0) / amounts.length
    const standardDeviation = Math.sqrt(variance)
    const coefficientOfVariation = standardDeviation / average
    
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation))
  }

  private calculatePaymentConsistency(paymentHistory: PaymentHistoryRecord[]): number {
    if (paymentHistory.length < 6) return 0.5

    const recentPayments = paymentHistory.slice(-6)
    const onTimeCount = recentPayments.filter(p => p.status === 'on_time').length
    
    return onTimeCount / recentPayments.length
  }

  private getExpectedLossRate(riskLevel: CreditRiskLevel): number {
    switch (riskLevel) {
      case 'minimal': return 0.001  // 0.1%
      case 'low': return 0.005      // 0.5%
      case 'moderate': return 0.02  // 2%
      case 'high': return 0.08      // 8%
      case 'severe': return 0.25    // 25%
      case 'critical': return 0.6   // 60%
      default: return 0.1           // 10%
    }
  }

  private calculateConcentrationRisk(assessments: CreditAssessment[]): number {
    // حساب مؤشر هيرفيندال-هيرشمان للتركز
    const totalExposure = assessments.reduce((sum, a) => sum + a.currentOutstanding, 0)
    
    if (totalExposure === 0) return 0

    const hhi = assessments.reduce((sum, assessment) => {
      const marketShare = assessment.currentOutstanding / totalExposure
      return sum + Math.pow(marketShare, 2)
    }, 0)

    return hhi * 10000 // تحويل إلى مقياس 0-10000
  }

  private generateStrategicRecommendations(riskDistribution: any[], defaultRate: number): string[] {
    const recommendations: string[] = []

    if (defaultRate > 10) {
      recommendations.push('معدل التعثر مرتفع - مراجعة معايير الموافقة')
      recommendations.push('تعزيز عمليات التحصيل والمتابعة')
    }

    const highRiskPercentage = riskDistribution
      .filter(r => r.riskLevel === 'high' || r.riskLevel === 'severe' || r.riskLevel === 'critical')
      .reduce((sum, r) => sum + r.percentage, 0)

    if (highRiskPercentage > 30) {
      recommendations.push('نسبة عالية من العملاء عالي المخاطر')
      recommendations.push('تنويع المحفظة نحو عملاء أقل مخاطرة')
    }

    return recommendations
  }

  private loadYemeniRiskFactors(): YemeniRiskFactors {
    return {
      economicStability: 6.5,    // وضع متوسط
      currencyStability: 5.0,    // تقلبات العملة
      locationRisk: 7.0,         // مخاطر متوسطة
      industryTrends: 7.5,       // قطاع مطاعم نامي
      competitionLevel: 6.0      // منافسة متوسطة
    }
  }
}

export default RiskAssessmentService.getInstance()
