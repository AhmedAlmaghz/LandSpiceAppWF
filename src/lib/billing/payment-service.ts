/**
 * خدمة إدارة المدفوعات اليمنية
 * نظام إدارة لاند سبايس - الوحدة العاشرة
 * 
 * خدمة شاملة لإدارة المدفوعات والتحصيل مع العمليات اليدوية
 * مراعية للخصوصيات المصرفية اليمنية والعمليات التقليدية
 */

import {
  PaymentRecord,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  YemeniInvoice,
  PaymentSearchCriteria,
  DailyPaymentReport,
  YemeniBank,
  CurrencyCode
} from './types'

import {
  validatePaymentRecord,
  isValidYemeniBankAccount,
  isValidTransferReference,
  ValidationResult
} from './validation'

import { InvoiceService } from './invoice-service'
import { AccountingService } from '../financial/accounting-service'

// ===============================
// خدمة المدفوعات الرئيسية
// ===============================

/**
 * خدمة إدارة المدفوعات اليمنية
 * تطبق نمط Singleton مع التركيز على العمليات اليدوية
 */
export class PaymentService {
  private static instance: PaymentService
  private payments: Map<string, PaymentRecord> = new Map()
  private paymentNumberCounter: number = 1
  private invoiceService: InvoiceService
  private accountingService: AccountingService

  private constructor() {
    this.invoiceService = InvoiceService.getInstance()
    this.accountingService = AccountingService.getInstance()
    this.loadPaymentData()
  }

  /**
   * الحصول على المثيل الوحيد للخدمة
   */
  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  // ===============================
  // تسجيل ومعالجة المدفوعات
  // ===============================

  /**
   * تسجيل مدفوعة جديدة
   */
  public async recordPayment(paymentData: Partial<PaymentRecord>): Promise<PaymentRecord> {
    try {
      // التحقق من وجود الفاتورة
      const invoice = await this.invoiceService.getInvoice(paymentData.invoiceId!)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      // التحقق من حالة الفاتورة
      if (invoice.status === 'cancelled') {
        throw new Error('لا يمكن تسجيل مدفوعة لفاتورة ملغاة')
      }

      // إنشاء سجل المدفوعة
      const paymentId = this.generatePaymentId()
      const paymentNumber = this.generatePaymentNumber()

      const payment: PaymentRecord = {
        // معرفات أساسية
        id: paymentId,
        paymentNumber,
        invoiceId: paymentData.invoiceId!,
        invoiceNumber: invoice.invoiceNumber,

        // تفاصيل المبلغ
        amount: paymentData.amount!,
        currency: paymentData.currency || 'YER',
        exchangeRate: paymentData.exchangeRate,
        amountInYER: this.calculateAmountInYER(
          paymentData.amount!,
          paymentData.currency || 'YER',
          paymentData.exchangeRate
        ),

        // تفاصيل الدفع
        paymentDate: paymentData.paymentDate || new Date(),
        paymentMethod: paymentData.paymentMethod!,
        type: this.determinePaymentType(paymentData.amount!, invoice.total),

        // تفاصيل البنك أو الجهة
        bankName: paymentData.bankName,
        accountNumber: paymentData.accountNumber,
        referenceNumber: paymentData.referenceNumber || this.generateReferenceNumber(),
        checkNumber: paymentData.checkNumber,

        // التوثيق
        receiptNumber: this.generateReceiptNumber(),
        receiptIssued: false, // سيتم إصدار الإيصال لاحقاً
        receiptDate: undefined,

        // المسؤولية
        receivedBy: paymentData.receivedBy!,
        processedBy: paymentData.processedBy || paymentData.receivedBy!,
        approvedBy: undefined,

        // الحالة والتتبع
        status: 'pending',
        confirmationDate: undefined,

        // الملاحظات
        notes: paymentData.notes,
        internalNotes: paymentData.internalNotes,

        // المرفقات
        attachments: paymentData.attachments || [],
        bankSlip: paymentData.bankSlip,

        // التواريخ الإدارية
        createdAt: new Date(),
        updatedAt: new Date(),

        // التكامل
        accountingEntryId: undefined
      }

      // التحقق من صحة المدفوعة
      const validation = validatePaymentRecord(payment)
      if (!validation.isValid) {
        throw new Error(`بيانات المدفوعة غير صحيحة: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // حفظ المدفوعة
      this.payments.set(paymentId, payment)

      // إشعار بتسجيل المدفوعة
      await this.notifyPaymentRecorded(payment)

      return payment

    } catch (error) {
      console.error('خطأ في تسجيل المدفوعة:', error)
      throw error
    }
  }

  /**
   * تأكيد المدفوعة
   */
  public async confirmPayment(paymentId: string, confirmedBy: string): Promise<PaymentRecord> {
    try {
      const payment = this.payments.get(paymentId)
      if (!payment) {
        throw new Error('المدفوعة غير موجودة')
      }

      if (payment.status !== 'pending') {
        throw new Error('لا يمكن تأكيد المدفوعة إلا إذا كانت في حالة معلقة')
      }

      // تحديث حالة المدفوعة
      payment.status = 'confirmed'
      payment.confirmationDate = new Date()
      payment.approvedBy = confirmedBy
      payment.updatedAt = new Date()

      // إصدار الإيصال
      await this.issueReceipt(payment)

      // تحديث حالة الفاتورة
      await this.updateInvoicePaymentStatus(payment)

      // إنشاء قيد محاسبي
      await this.createPaymentAccountingEntry(payment)

      // حفظ التحديثات
      this.payments.set(paymentId, payment)

      // إشعار بتأكيد المدفوعة
      await this.notifyPaymentConfirmed(payment)

      return payment

    } catch (error) {
      console.error('خطأ في تأكيد المدفوعة:', error)
      throw error
    }
  }

  /**
   * رفض المدفوعة
   */
  public async rejectPayment(paymentId: string, rejectedBy: string, reason: string): Promise<PaymentRecord> {
    try {
      const payment = this.payments.get(paymentId)
      if (!payment) {
        throw new Error('المدفوعة غير موجودة')
      }

      if (payment.status !== 'pending') {
        throw new Error('لا يمكن رفض المدفوعة إلا إذا كانت في حالة معلقة')
      }

      // تحديث حالة المدفوعة
      payment.status = 'failed'
      payment.approvedBy = rejectedBy
      payment.internalNotes = (payment.internalNotes || '') + `\nمرفوضة: ${reason}`
      payment.updatedAt = new Date()

      // حفظ التحديثات
      this.payments.set(paymentId, payment)

      // إشعار بالرفض
      await this.notifyPaymentRejected(payment, reason)

      return payment

    } catch (error) {
      console.error('خطأ في رفض المدفوعة:', error)
      throw error
    }
  }

  /**
   * استرداد مدفوعة
   */
  public async refundPayment(
    paymentId: string,
    refundAmount: number,
    refundReason: string,
    refundedBy: string
  ): Promise<PaymentRecord> {
    try {
      const originalPayment = this.payments.get(paymentId)
      if (!originalPayment) {
        throw new Error('المدفوعة الأصلية غير موجودة')
      }

      if (originalPayment.status !== 'confirmed') {
        throw new Error('لا يمكن استرداد مدفوعة غير مؤكدة')
      }

      if (refundAmount > originalPayment.amountInYER) {
        throw new Error('مبلغ الاسترداد أكبر من المبلغ الأصلي')
      }

      // إنشاء سجل الاسترداد
      const refundPayment: PaymentRecord = {
        ...originalPayment,
        id: this.generatePaymentId(),
        paymentNumber: this.generatePaymentNumber(),
        amount: -refundAmount,
        amountInYER: -refundAmount,
        type: 'refund',
        status: 'confirmed',
        paymentDate: new Date(),
        confirmationDate: new Date(),
        receivedBy: refundedBy,
        processedBy: refundedBy,
        approvedBy: refundedBy,
        notes: `استرداد للمدفوعة ${originalPayment.paymentNumber}: ${refundReason}`,
        receiptNumber: this.generateReceiptNumber(),
        receiptIssued: true,
        receiptDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // حفظ سجل الاسترداد
      this.payments.set(refundPayment.id, refundPayment)

      // تحديث المدفوعة الأصلية
      originalPayment.status = 'refunded'
      originalPayment.internalNotes = (originalPayment.internalNotes || '') + `\nاسترُد جزئياً: ${refundAmount} ر.ي`
      originalPayment.updatedAt = new Date()
      this.payments.set(paymentId, originalPayment)

      // تحديث حالة الفاتورة
      await this.updateInvoicePaymentStatus(refundPayment)

      // إنشاء قيد محاسبي للاسترداد
      await this.createPaymentAccountingEntry(refundPayment)

      // إشعار بالاسترداد
      await this.notifyPaymentRefunded(refundPayment, originalPayment)

      return refundPayment

    } catch (error) {
      console.error('خطأ في استرداد المدفوعة:', error)
      throw error
    }
  }

  // ===============================
  // البحث والاستعلام
  // ===============================

  /**
   * البحث في المدفوعات
   */
  public async searchPayments(criteria: PaymentSearchCriteria): Promise<{
    payments: PaymentRecord[]
    totalCount: number
    totalAmount: number
  }> {
    try {
      let filteredPayments = Array.from(this.payments.values())

      // تطبيق المعايير
      if (criteria.restaurantId) {
        // البحث عبر الفواتير للحصول على مدفوعات مطعم محدد
        const restaurantInvoices = await this.invoiceService.getRestaurantInvoices(criteria.restaurantId)
        const invoiceIds = restaurantInvoices.map(inv => inv.id)
        filteredPayments = filteredPayments.filter(pay => invoiceIds.includes(pay.invoiceId))
      }

      if (criteria.invoiceId) {
        filteredPayments = filteredPayments.filter(pay => pay.invoiceId === criteria.invoiceId)
      }

      if (criteria.status && criteria.status.length > 0) {
        filteredPayments = filteredPayments.filter(pay => criteria.status!.includes(pay.status))
      }

      if (criteria.paymentMethod && criteria.paymentMethod.length > 0) {
        filteredPayments = filteredPayments.filter(pay => criteria.paymentMethod!.includes(pay.paymentMethod))
      }

      if (criteria.dateRange) {
        const { start, end } = criteria.dateRange
        filteredPayments = filteredPayments.filter(pay => 
          pay.paymentDate >= start && pay.paymentDate <= end
        )
      }

      if (criteria.amountRange) {
        const { min, max } = criteria.amountRange
        filteredPayments = filteredPayments.filter(pay => 
          pay.amountInYER >= min && pay.amountInYER <= max
        )
      }

      if (criteria.searchText) {
        const searchText = criteria.searchText.toLowerCase()
        filteredPayments = filteredPayments.filter(pay =>
          pay.paymentNumber.toLowerCase().includes(searchText) ||
          pay.referenceNumber.toLowerCase().includes(searchText) ||
          pay.invoiceNumber.toLowerCase().includes(searchText) ||
          (pay.notes && pay.notes.toLowerCase().includes(searchText))
        )
      }

      // الترتيب
      if (criteria.sortBy) {
        filteredPayments.sort((a, b) => {
          const aValue = a[criteria.sortBy!] as any
          const bValue = b[criteria.sortBy!] as any

          if (criteria.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1
          } else {
            return aValue > bValue ? 1 : -1
          }
        })
      }

      // الترقيم
      const totalCount = filteredPayments.length
      const page = criteria.page || 1
      const limit = criteria.limit || 20
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const payments = filteredPayments.slice(startIndex, endIndex)
      const totalAmount = filteredPayments.reduce((sum, pay) => sum + pay.amountInYER, 0)

      return {
        payments,
        totalCount,
        totalAmount
      }

    } catch (error) {
      console.error('خطأ في البحث عن المدفوعات:', error)
      throw new Error('فشل في البحث عن المدفوعات')
    }
  }

  /**
   * الحصول على مدفوعة محددة
   */
  public async getPayment(paymentId: string): Promise<PaymentRecord | null> {
    return this.payments.get(paymentId) || null
  }

  /**
   * الحصول على مدفوعات فاتورة محددة
   */
  public async getInvoicePayments(invoiceId: string): Promise<PaymentRecord[]> {
    return Array.from(this.payments.values()).filter(pay => pay.invoiceId === invoiceId)
  }

  // ===============================
  // التقارير والإحصائيات
  // ===============================

  /**
   * إنتاج تقرير المدفوعات اليومي
   */
  public async generateDailyPaymentReport(date: Date): Promise<DailyPaymentReport> {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const dailyPayments = Array.from(this.payments.values()).filter(pay => 
        pay.paymentDate >= startOfDay && 
        pay.paymentDate <= endOfDay &&
        pay.status === 'confirmed'
      )

      // إحصائيات عامة
      const totalPayments = dailyPayments.length
      const totalAmount = dailyPayments.reduce((sum, pay) => sum + pay.amountInYER, 0)

      // تفصيل حسب طريقة الدفع
      const paymentsByMethod = this.groupPaymentsByMethod(dailyPayments)

      // تفصيل حسب البنك
      const paymentsByBank = this.groupPaymentsByBank(dailyPayments)

      // الفواتير المدفوعة
      const paidInvoices = await this.getPaidInvoicesDetails(dailyPayments)

      return {
        date,
        totalPayments,
        totalAmount,
        paymentsByMethod,
        paymentsByBank,
        paidInvoices
      }

    } catch (error) {
      console.error('خطأ في إنتاج تقرير المدفوعات:', error)
      throw new Error('فشل في إنتاج التقرير اليومي')
    }
  }

  /**
   * حساب إجمالي المدفوعات لفترة محددة
   */
  public async calculateTotalPayments(startDate: Date, endDate: Date): Promise<{
    totalAmount: number
    paymentCount: number
    averagePayment: number
  }> {
    try {
      const payments = Array.from(this.payments.values()).filter(pay =>
        pay.paymentDate >= startDate &&
        pay.paymentDate <= endDate &&
        pay.status === 'confirmed'
      )

      const totalAmount = payments.reduce((sum, pay) => sum + pay.amountInYER, 0)
      const paymentCount = payments.length
      const averagePayment = paymentCount > 0 ? totalAmount / paymentCount : 0

      return {
        totalAmount,
        paymentCount,
        averagePayment
      }

    } catch (error) {
      console.error('خطأ في حساب إجمالي المدفوعات:', error)
      throw new Error('فشل في حساب الإجماليات')
    }
  }

  // ===============================
  // العمليات المساعدة
  // ===============================

  /**
   * حساب المبلغ بالريال اليمني
   */
  private calculateAmountInYER(amount: number, currency: CurrencyCode, exchangeRate?: number): number {
    if (currency === 'YER') {
      return amount
    }

    if (!exchangeRate || exchangeRate <= 0) {
      throw new Error('سعر الصرف مطلوب للعملات الأجنبية')
    }

    return Math.round(amount * exchangeRate * 100) / 100
  }

  /**
   * تحديد نوع المدفوعة
   */
  private determinePaymentType(paymentAmount: number, invoiceTotal: number): PaymentType {
    if (paymentAmount >= invoiceTotal) {
      return 'full'
    } else if (paymentAmount > 0) {
      return 'partial'
    } else {
      return 'refund'
    }
  }

  /**
   * إصدار إيصال المدفوعة
   */
  private async issueReceipt(payment: PaymentRecord): Promise<void> {
    try {
      payment.receiptIssued = true
      payment.receiptDate = new Date()
      
      console.log(`تم إصدار إيصال رقم ${payment.receiptNumber} للمدفوعة ${payment.paymentNumber}`)

    } catch (error) {
      console.error('خطأ في إصدار الإيصال:', error)
    }
  }

  /**
   * تحديث حالة دفع الفاتورة
   */
  private async updateInvoicePaymentStatus(payment: PaymentRecord): Promise<void> {
    try {
      const invoice = await this.invoiceService.getInvoice(payment.invoiceId)
      if (!invoice) return

      // حساب إجمالي المدفوعات للفاتورة
      const invoicePayments = await this.getInvoicePayments(payment.invoiceId)
      const totalPaid = invoicePayments
        .filter(pay => pay.status === 'confirmed')
        .reduce((sum, pay) => sum + pay.amountInYER, 0)

      // تحديث حالة الفاتورة
      if (totalPaid >= invoice.total) {
        invoice.status = 'paid'
      } else if (totalPaid > 0) {
        invoice.status = 'partial_paid'
      }

      // حفظ تحديث الفاتورة
      await this.invoiceService.updateInvoice(invoice.id, { status: invoice.status })

    } catch (error) {
      console.error('خطأ في تحديث حالة الفاتورة:', error)
    }
  }

  /**
   * إنشاء قيد محاسبي للمدفوعة
   */
  private async createPaymentAccountingEntry(payment: PaymentRecord): Promise<void> {
    try {
      // إنشاء قيد محاسبي للمدفوعة
      // سيتم تطويره مع التكامل الكامل مع النظام المحاسبي
      console.log(`إنشاء قيد محاسبي للمدفوعة: ${payment.paymentNumber}`)

    } catch (error) {
      console.error('خطأ في إنشاء القيد المحاسبي:', error)
    }
  }

  /**
   * تجميع المدفوعات حسب طريقة الدفع
   */
  private groupPaymentsByMethod(payments: PaymentRecord[]): {
    method: PaymentMethod
    count: number
    amount: number
  }[] {
    const groups: Map<PaymentMethod, { count: number; amount: number }> = new Map()

    payments.forEach(payment => {
      const existing = groups.get(payment.paymentMethod) || { count: 0, amount: 0 }
      existing.count++
      existing.amount += payment.amountInYER
      groups.set(payment.paymentMethod, existing)
    })

    return Array.from(groups.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount
    }))
  }

  /**
   * تجميع المدفوعات حسب البنك
   */
  private groupPaymentsByBank(payments: PaymentRecord[]): {
    bank: YemeniBank
    count: number
    amount: number
  }[] {
    const groups: Map<YemeniBank, { count: number; amount: number }> = new Map()

    payments.forEach(payment => {
      if (payment.bankName) {
        const existing = groups.get(payment.bankName) || { count: 0, amount: 0 }
        existing.count++
        existing.amount += payment.amountInYER
        groups.set(payment.bankName, existing)
      }
    })

    return Array.from(groups.entries()).map(([bank, data]) => ({
      bank,
      count: data.count,
      amount: data.amount
    }))
  }

  /**
   * الحصول على تفاصيل الفواتير المدفوعة
   */
  private async getPaidInvoicesDetails(payments: PaymentRecord[]): Promise<{
    invoiceId: string
    invoiceNumber: string
    restaurantName: string
    amount: number
    paymentMethod: PaymentMethod
  }[]> {
    const details = []

    for (const payment of payments) {
      const invoice = await this.invoiceService.getInvoice(payment.invoiceId)
      if (invoice) {
        details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          restaurantName: invoice.restaurantName,
          amount: payment.amountInYER,
          paymentMethod: payment.paymentMethod
        })
      }
    }

    return details
  }

  /**
   * توليد معرف فريد للمدفوعة
   */
  private generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * توليد رقم مدفوعة تسلسلي
   */
  private generatePaymentNumber(): string {
    const year = new Date().getFullYear()
    const number = this.paymentNumberCounter.toString().padStart(4, '0')
    this.paymentNumberCounter++
    return `PAY-${year}-${number}`
  }

  /**
   * توليد رقم مرجعي
   */
  private generateReferenceNumber(): string {
    return `REF${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  /**
   * توليد رقم إيصال
   */
  private generateReceiptNumber(): string {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `REC-${year}${month}-${number}`
  }

  /**
   * تحميل بيانات المدفوعات
   */
  private loadPaymentData(): void {
    console.log('تحميل بيانات المدفوعات...')
  }

  /**
   * إشعارات المدفوعات
   */
  private async notifyPaymentRecorded(payment: PaymentRecord): Promise<void> {
    console.log(`تم تسجيل مدفوعة جديدة: ${payment.paymentNumber}`)
  }

  private async notifyPaymentConfirmed(payment: PaymentRecord): Promise<void> {
    console.log(`تم تأكيد المدفوعة: ${payment.paymentNumber}`)
  }

  private async notifyPaymentRejected(payment: PaymentRecord, reason: string): Promise<void> {
    console.log(`تم رفض المدفوعة: ${payment.paymentNumber} - السبب: ${reason}`)
  }

  private async notifyPaymentRefunded(refund: PaymentRecord, original: PaymentRecord): Promise<void> {
    console.log(`تم استرداد المدفوعة: ${original.paymentNumber}`)
  }
}

// تصدير مثيل واحد للخدمة
export const paymentService = PaymentService.getInstance()
export default PaymentService
