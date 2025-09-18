/**
 * نظام التحقق والحساب للأقساط البنكية اليمنية
 * نظام إدارة لاند سبايس - الوحدة الحادية عشرة
 */

import {
  InstallmentPlan,
  InstallmentPayment,
  CreditAssessment,
  InstallmentFrequency,
  YEMENI_BANKING_CONFIG,
  PaymentHistoryRecord
} from './types'

// ===============================
// نتائج التحقق والحساب
// ===============================

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

export interface InstallmentCalculationResult {
  installmentAmount: number
  totalInterest: number
  totalAmount: number
  monthlyPayments: {
    installmentNumber: number
    dueDate: Date
    principalAmount: number
    interestAmount: number
    totalAmount: number
    remainingBalance: number
  }[]
  effectiveAnnualRate: number
}

// ===============================
// التحقق من خطط الأقساط
// ===============================

export function validateInstallmentPlan(plan: InstallmentPlan): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // التحقق من المعرفات الأساسية
  if (!plan.id || plan.id.trim().length === 0) {
    errors.push({
      field: 'id',
      message: 'معرف خطة الأقساط مطلوب',
      code: 'PLAN_ID_REQUIRED',
      severity: 'error'
    })
  }

  if (!plan.planNumber || plan.planNumber.trim().length === 0) {
    errors.push({
      field: 'planNumber',
      message: 'رقم خطة الأقساط مطلوب',
      code: 'PLAN_NUMBER_REQUIRED',
      severity: 'error'
    })
  }

  // التحقق من معلومات المطعم والعقد
  if (!plan.contractId || plan.contractId.trim().length === 0) {
    errors.push({
      field: 'contractId',
      message: 'معرف العقد مطلوب',
      code: 'CONTRACT_ID_REQUIRED',
      severity: 'error'
    })
  }

  if (!plan.restaurantId || plan.restaurantId.trim().length === 0) {
    errors.push({
      field: 'restaurantId',
      message: 'معرف المطعم مطلوب',
      code: 'RESTAURANT_ID_REQUIRED',
      severity: 'error'
    })
  }

  // التحقق من المبالغ المالية
  validateFinancialAmounts(plan, errors, warnings)

  // التحقق من بنية الأقساط
  validateInstallmentStructure(plan, errors, warnings)

  // التحقق من معدلات الفائدة
  validateInterestRates(plan, errors, warnings)

  // التحقق من التواريخ
  validatePlanDates(plan, errors, warnings)

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateFinancialAmounts(
  plan: InstallmentPlan,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const { MIN_FINANCING_AMOUNT, MAX_FINANCING_AMOUNT } = YEMENI_BANKING_CONFIG

  // التحقق من المبلغ الإجمالي
  if (!plan.totalAmount || plan.totalAmount <= 0) {
    errors.push({
      field: 'totalAmount',
      message: 'المبلغ الإجمالي للتمويل يجب أن يكون أكبر من صفر',
      code: 'INVALID_TOTAL_AMOUNT',
      severity: 'error'
    })
  } else {
    if (plan.totalAmount < MIN_FINANCING_AMOUNT) {
      errors.push({
        field: 'totalAmount',
        message: `المبلغ الإجمالي يجب أن يكون أكبر من ${MIN_FINANCING_AMOUNT.toLocaleString()} ريال يمني`,
        code: 'AMOUNT_TOO_LOW',
        severity: 'error'
      })
    }

    if (plan.totalAmount > MAX_FINANCING_AMOUNT) {
      warnings.push({
        field: 'totalAmount',
        message: 'المبلغ الإجمالي مرتفع جداً',
        suggestion: `يفضل ألا يتجاوز المبلغ ${MAX_FINANCING_AMOUNT.toLocaleString()} ريال يمني`
      })
    }
  }

  // التحقق من مبلغ القسط الواحد
  if (!plan.installmentAmount || plan.installmentAmount <= 0) {
    errors.push({
      field: 'installmentAmount',
      message: 'مبلغ القسط الواحد يجب أن يكون أكبر من صفر',
      code: 'INVALID_INSTALLMENT_AMOUNT',
      severity: 'error'
    })
  }

  // التحقق من العملة وسعر الصرف
  if (plan.currency !== 'YER' && (!plan.exchangeRate || plan.exchangeRate <= 0)) {
    errors.push({
      field: 'exchangeRate',
      message: 'سعر الصرف مطلوب للعملات الأجنبية',
      code: 'EXCHANGE_RATE_REQUIRED',
      severity: 'error'
    })
  }
}

function validateInstallmentStructure(
  plan: InstallmentPlan,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const { MIN_INSTALLMENT_COUNT, MAX_INSTALLMENT_COUNT } = YEMENI_BANKING_CONFIG

  // التحقق من عدد الأقساط
  if (!plan.installmentCount || plan.installmentCount <= 0) {
    errors.push({
      field: 'installmentCount',
      message: 'عدد الأقساط يجب أن يكون أكبر من صفر',
      code: 'INVALID_INSTALLMENT_COUNT',
      severity: 'error'
    })
  } else {
    if (plan.installmentCount < MIN_INSTALLMENT_COUNT) {
      errors.push({
        field: 'installmentCount',
        message: `عدد الأقساط يجب أن يكون على الأقل ${MIN_INSTALLMENT_COUNT}`,
        code: 'INSTALLMENT_COUNT_TOO_LOW',
        severity: 'error'
      })
    }

    if (plan.installmentCount > MAX_INSTALLMENT_COUNT) {
      warnings.push({
        field: 'installmentCount',
        message: 'عدد الأقساط كبير جداً',
        suggestion: `يفضل ألا يتجاوز عدد الأقساط ${MAX_INSTALLMENT_COUNT}`
      })
    }
  }

  // التحقق من تكرار الأقساط
  if (!plan.frequency) {
    errors.push({
      field: 'frequency',
      message: 'تكرار الأقساط مطلوب',
      code: 'FREQUENCY_REQUIRED',
      severity: 'error'
    })
  }
}

function validateInterestRates(
  plan: InstallmentPlan,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const { MIN_INTEREST_RATE, MAX_INTEREST_RATE } = YEMENI_BANKING_CONFIG

  // التحقق من معدل الفائدة
  if (plan.interestRate < 0) {
    errors.push({
      field: 'interestRate',
      message: 'معدل الفائدة لا يمكن أن يكون سالباً',
      code: 'NEGATIVE_INTEREST_RATE',
      severity: 'error'
    })
  } else if (plan.interestRate > MAX_INTEREST_RATE) {
    errors.push({
      field: 'interestRate',
      message: `معدل الفائدة يتجاوز الحد الأقصى المسموح (${MAX_INTEREST_RATE * 100}%)`,
      code: 'INTEREST_RATE_TOO_HIGH',
      severity: 'error'
    })
  }

  // التحقق من الرسوم
  if (plan.processingFee < 0) {
    errors.push({
      field: 'processingFee',
      message: 'رسوم المعالجة لا يمكن أن تكون سالبة',
      code: 'NEGATIVE_PROCESSING_FEE',
      severity: 'error'
    })
  }

  if (plan.lateFee < 0) {
    errors.push({
      field: 'lateFee',
      message: 'غرامة التأخير لا يمكن أن تكون سالبة',
      code: 'NEGATIVE_LATE_FEE',
      severity: 'error'
    })
  }
}

function validatePlanDates(
  plan: InstallmentPlan,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const now = new Date()

  // التحقق من تاريخ البداية
  if (!plan.startDate) {
    errors.push({
      field: 'startDate',
      message: 'تاريخ بداية الخطة مطلوب',
      code: 'START_DATE_REQUIRED',
      severity: 'error'
    })
  }

  // التحقق من تاريخ النهاية
  if (!plan.endDate) {
    errors.push({
      field: 'endDate',
      message: 'تاريخ نهاية الخطة مطلوب',
      code: 'END_DATE_REQUIRED',
      severity: 'error'
    })
  } else if (plan.startDate && plan.endDate <= plan.startDate) {
    errors.push({
      field: 'endDate',
      message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
      code: 'END_DATE_BEFORE_START',
      severity: 'error'
    })
  }

  // التحقق من تاريخ أول قسط
  if (!plan.firstInstallmentDate) {
    errors.push({
      field: 'firstInstallmentDate',
      message: 'تاريخ أول قسط مطلوب',
      code: 'FIRST_INSTALLMENT_DATE_REQUIRED',
      severity: 'error'
    })
  }
}

// ===============================
// حسابات الأقساط
// ===============================

export function calculateInstallmentPlan(
  principal: number,
  annualInterestRate: number,
  installmentCount: number,
  frequency: InstallmentFrequency,
  startDate: Date
): InstallmentCalculationResult {
  // تحويل معدل الفائدة السنوي إلى معدل دوري
  const periodsPerYear = getPeriodsPerYear(frequency)
  const periodicInterestRate = annualInterestRate / periodsPerYear
  
  // حساب مبلغ القسط باستخدام صيغة الأقساط الثابتة
  const installmentAmount = calculateFixedInstallmentAmount(
    principal,
    periodicInterestRate,
    installmentCount
  )
  
  // إنشاء جدول الأقساط
  const monthlyPayments = generatePaymentSchedule(
    principal,
    installmentAmount,
    periodicInterestRate,
    installmentCount,
    frequency,
    startDate
  )
  
  const totalInterest = monthlyPayments.reduce((sum, payment) => sum + payment.interestAmount, 0)
  const totalAmount = principal + totalInterest
  
  // حساب المعدل السنوي الفعال
  const effectiveAnnualRate = Math.pow(1 + periodicInterestRate, periodsPerYear) - 1
  
  return {
    installmentAmount,
    totalInterest,
    totalAmount,
    monthlyPayments,
    effectiveAnnualRate
  }
}

function getPeriodsPerYear(frequency: InstallmentFrequency): number {
  switch (frequency) {
    case 'monthly': return 12
    case 'quarterly': return 4
    case 'semi_annual': return 2
    case 'annual': return 1
    case 'custom': return 12 // افتراضي شهري
    default: return 12
  }
}

function calculateFixedInstallmentAmount(
  principal: number,
  periodicRate: number,
  periods: number
): number {
  if (periodicRate === 0) {
    return principal / periods
  }
  
  const denominator = 1 - Math.pow(1 + periodicRate, -periods)
  return (principal * periodicRate) / denominator
}

function generatePaymentSchedule(
  principal: number,
  installmentAmount: number,
  periodicRate: number,
  installmentCount: number,
  frequency: InstallmentFrequency,
  startDate: Date
) {
  const payments = []
  let remainingBalance = principal
  
  for (let i = 1; i <= installmentCount; i++) {
    const interestAmount = remainingBalance * periodicRate
    const principalAmount = installmentAmount - interestAmount
    
    // التأكد من أن آخر قسط يغطي الرصيد المتبقي
    const actualPrincipalAmount = i === installmentCount 
      ? remainingBalance 
      : Math.min(principalAmount, remainingBalance)
    
    const actualTotalAmount = i === installmentCount 
      ? remainingBalance + interestAmount 
      : installmentAmount
    
    remainingBalance -= actualPrincipalAmount
    
    const dueDate = calculateDueDate(startDate, i, frequency)
    
    payments.push({
      installmentNumber: i,
      dueDate,
      principalAmount: actualPrincipalAmount,
      interestAmount,
      totalAmount: actualTotalAmount,
      remainingBalance: Math.max(0, remainingBalance)
    })
  }
  
  return payments
}

function calculateDueDate(startDate: Date, installmentNumber: number, frequency: InstallmentFrequency): Date {
  const dueDate = new Date(startDate)
  
  switch (frequency) {
    case 'monthly':
      dueDate.setMonth(dueDate.getMonth() + installmentNumber)
      break
    case 'quarterly':
      dueDate.setMonth(dueDate.getMonth() + (installmentNumber * 3))
      break
    case 'semi_annual':
      dueDate.setMonth(dueDate.getMonth() + (installmentNumber * 6))
      break
    case 'annual':
      dueDate.setFullYear(dueDate.getFullYear() + installmentNumber)
      break
    default:
      dueDate.setMonth(dueDate.getMonth() + installmentNumber)
  }
  
  return dueDate
}

// ===============================
// تقييم المخاطر الائتمانية
// ===============================

export function calculateCreditScore(assessment: Partial<CreditAssessment>): number {
  let score = 100 // النقطة الأساسية

  // تقييم تاريخ السداد (40% من النقاط)
  if (assessment.paymentHistory && assessment.paymentHistory.length > 0) {
    const onTimeRate = assessment.onTimePayments! / (assessment.onTimePayments! + assessment.latePayments! + assessment.missedPayments!)
    score = score * (0.6 + (onTimeRate * 0.4))
  }

  // تقييم المبالغ المستحقة (30% من النقاط)
  if (assessment.currentOutstanding && assessment.maxCreditLimit) {
    const utilizationRate = assessment.currentOutstanding / assessment.maxCreditLimit
    const utilizationPenalty = Math.min(utilizationRate * 30, 30)
    score -= utilizationPenalty
  }

  // تقييم المبالغ المتأخرة (20% من النقاط)
  if (assessment.overdueAmount && assessment.currentOutstanding) {
    const overdueRate = assessment.overdueAmount / assessment.currentOutstanding
    const overduePenalty = Math.min(overdueRate * 20, 20)
    score -= overduePenalty
  }

  // تقييم عدد الخطط المكتملة (10% من النقاط)
  if (assessment.completedPlans && assessment.totalInstallmentPlans) {
    const completionRate = assessment.completedPlans / assessment.totalInstallmentPlans
    score = score * (0.9 + (completionRate * 0.1))
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function assessCreditRisk(creditScore: number): string {
  if (creditScore >= 95) return 'minimal'
  if (creditScore >= 85) return 'low'
  if (creditScore >= 70) return 'moderate'
  if (creditScore >= 50) return 'high'
  if (creditScore >= 30) return 'severe'
  return 'critical'
}

// ===============================
// دوال مساعدة للحسابات
// ===============================

export function calculateLateFee(daysLate: number, dailyFee: number): number {
  return Math.max(0, daysLate * dailyFee)
}

export function calculateEarlyPaymentDiscount(
  remainingAmount: number,
  discountRate: number,
  monthsEarly: number
): number {
  const maxDiscount = remainingAmount * discountRate
  const timeBasedDiscount = maxDiscount * (monthsEarly / 12)
  return Math.min(maxDiscount, timeBasedDiscount)
}

export function isBusinessDay(date: Date): boolean {
  const { BUSINESS_DAYS } = YEMENI_BANKING_CONFIG
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  return BUSINESS_DAYS.includes(dayName as any)
}

export function getNextBusinessDay(date: Date): Date {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1)
  }
  
  return nextDay
}

export function formatCurrency(amount: number, currency: string = 'YER'): string {
  return new Intl.NumberFormat('ar-YE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'YER' ? 0 : 2
  }).format(amount)
}

export default {
  validateInstallmentPlan,
  calculateInstallmentPlan,
  calculateCreditScore,
  assessCreditRisk,
  formatCurrency,
  isBusinessDay,
  getNextBusinessDay
}
