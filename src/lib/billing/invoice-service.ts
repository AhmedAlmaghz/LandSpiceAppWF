/**
 * خدمة إدارة الفواتير اليمنية
 * نظام إدارة لاند سبايس - الوحدة العاشرة
 * 
 * خدمة شاملة لإدارة دورة حياة الفواتير من الإنشاء إلى التحصيل
 * مع مراعاة الخصوصيات اليمنية والعمليات اليدوية
 */

import {
  YemeniInvoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceType,
  BillingPeriod,
  RestaurantBillingSummary,
  DailyPaymentReport,
  InvoiceSearchCriteria,
  InvoiceSearchResult,
  BillingBatch,
  InvoiceTemplate,
  RestaurantBillingSettings,
  PaymentMethod,
  YEMEN_VAT_RATE,
  DEFAULT_PAYMENT_TERMS
} from './types'

import {
  validateYemeniInvoice,
  calculateVAT,
  calculateAfterDiscount,
  convertAmountToWords,
  ValidationResult
} from './validation'

import { AccountingService } from '../financial/accounting-service'

// ===============================
// خدمة الفواتير الرئيسية
// ===============================

/**
 * خدمة إدارة الفواتير اليمنية
 * تطبق نمط Singleton لضمان التناسق
 */
export class InvoiceService {
  private static instance: InvoiceService
  private invoices: Map<string, YemeniInvoice> = new Map()
  private invoiceNumberCounter: number = 1
  private accountingService: AccountingService

  private constructor() {
    this.accountingService = AccountingService.getInstance()
    this.loadInvoiceData()
  }

  /**
   * الحصول على المثيل الوحيد للخدمة
   */
  public static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService()
    }
    return InvoiceService.instance
  }

  // ===============================
  // إنشاء وإدارة الفواتير
  // ===============================

  /**
   * إنشاء فاتورة جديدة
   */
  public async createInvoice(invoiceData: Partial<YemeniInvoice>): Promise<YemeniInvoice> {
    try {
      // إنشاء معرف فريد
      const invoiceId = this.generateInvoiceId()
      const invoiceNumber = this.generateInvoiceNumber()

      // إنشاء الفاتورة الأساسية
      const invoice: YemeniInvoice = {
        id: invoiceId,
        invoiceNumber,
        referenceNumber: invoiceData.referenceNumber,
        
        // بيانات المطعم (مطلوبة)
        restaurantId: invoiceData.restaurantId!,
        restaurantName: invoiceData.restaurantName!,
        restaurantAddress: invoiceData.restaurantAddress || '',
        restaurantPhone: invoiceData.restaurantPhone || '',
        restaurantEmail: invoiceData.restaurantEmail,
        contactPerson: invoiceData.contactPerson || '',
        
        // التواريخ
        issueDate: invoiceData.issueDate || new Date(),
        dueDate: invoiceData.dueDate || this.calculateDueDate(invoiceData.issueDate),
        periodStart: invoiceData.periodStart || this.getDefaultPeriodStart(),
        periodEnd: invoiceData.periodEnd || this.getDefaultPeriodEnd(),
        
        // تصنيف الفاتورة
        type: invoiceData.type || 'monthly',
        period: invoiceData.period || 'monthly',
        priority: invoiceData.priority || 'normal',
        
        // البنود (ستُحسب لاحقاً)
        items: invoiceData.items || [],
        
        // الحسابات المالية (ستُحسب تلقائياً)
        subtotal: 0,
        discountRate: invoiceData.discountRate || 0,
        discountAmount: 0,
        vatRate: invoiceData.vatRate || YEMEN_VAT_RATE,
        vatAmount: 0,
        total: 0,
        amountInWords: '',
        
        // العملة والدفع
        currency: invoiceData.currency || 'YER',
        exchangeRate: invoiceData.exchangeRate,
        paymentTerms: invoiceData.paymentTerms || `الدفع خلال ${DEFAULT_PAYMENT_TERMS} يوم من تاريخ الفاتورة`,
        paymentMethod: invoiceData.paymentMethod || 'bank_transfer',
        
        // الحالة
        status: 'draft',
        sentDate: undefined,
        deliveredDate: undefined,
        readDate: undefined,
        
        // الملاحظات
        notes: invoiceData.notes,
        internalNotes: invoiceData.internalNotes,
        termsAndConditions: invoiceData.termsAndConditions || this.getDefaultTermsAndConditions(),
        
        // معلومات إدارية
        createdBy: invoiceData.createdBy || 'system',
        approvedBy: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // المرفقات
        attachments: invoiceData.attachments || [],
        legalDocuments: invoiceData.legalDocuments || [],
        
        // التكامل
        accountingEntryId: undefined,
        contractId: invoiceData.contractId
      }

      // إضافة البنود إذا كانت موجودة
      if (invoiceData.items && invoiceData.items.length > 0) {
        await this.addItemsToInvoice(invoice, invoiceData.items)
      }

      // حفظ الفاتورة
      this.invoices.set(invoiceId, invoice)
      
      // إنشاء قيد محاسبي
      await this.createAccountingEntry(invoice)

      return invoice

    } catch (error) {
      console.error('خطأ في إنشاء الفاتورة:', error)
      throw new Error('فشل في إنشاء الفاتورة')
    }
  }

  /**
   * إضافة بنود إلى الفاتورة
   */
  public async addItemsToInvoice(invoice: YemeniInvoice, items: InvoiceItem[]): Promise<void> {
    try {
      // إضافة معرفات فريدة للبنود
      const processedItems = items.map(item => ({
        ...item,
        id: item.id || this.generateItemId(),
        vatRate: item.vatRate || YEMEN_VAT_RATE
      }))

      // حساب كل بند
      processedItems.forEach(item => {
        this.calculateItemAmounts(item)
      })

      // إضافة البنود إلى الفاتورة
      invoice.items = [...invoice.items, ...processedItems]

      // إعادة حساب إجماليات الفاتورة
      this.calculateInvoiceTotals(invoice)

      // تحديث الفاتورة
      invoice.updatedAt = new Date()
      this.invoices.set(invoice.id, invoice)

    } catch (error) {
      console.error('خطأ في إضافة البنود:', error)
      throw new Error('فشل في إضافة البنود للفاتورة')
    }
  }

  /**
   * تحديث فاتورة موجودة
   */
  public async updateInvoice(invoiceId: string, updates: Partial<YemeniInvoice>): Promise<YemeniInvoice> {
    try {
      const invoice = this.invoices.get(invoiceId)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      // منع تحديث الفواتير المرسلة أو المدفوعة
      if (invoice.status === 'paid' || invoice.status === 'sent') {
        throw new Error('لا يمكن تحديث الفاتورة بعد إرسالها أو دفعها')
      }

      // تطبيق التحديثات
      const updatedInvoice: YemeniInvoice = {
        ...invoice,
        ...updates,
        id: invoice.id, // المحافظة على المعرف الأصلي
        invoiceNumber: invoice.invoiceNumber, // المحافظة على رقم الفاتورة
        createdAt: invoice.createdAt, // المحافظة على تاريخ الإنشاء
        updatedAt: new Date()
      }

      // إعادة حساب المجاميع إذا تم تحديث البنود
      if (updates.items) {
        this.calculateInvoiceTotals(updatedInvoice)
      }

      // حفظ التحديثات
      this.invoices.set(invoiceId, updatedInvoice)

      return updatedInvoice

    } catch (error) {
      console.error('خطأ في تحديث الفاتورة:', error)
      throw error
    }
  }

  /**
   * حذف فاتورة
   */
  public async deleteInvoice(invoiceId: string): Promise<boolean> {
    try {
      const invoice = this.invoices.get(invoiceId)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      // منع حذف الفواتير المرسلة أو المدفوعة
      if (invoice.status !== 'draft') {
        throw new Error('لا يمكن حذف الفاتورة بعد إرسالها')
      }

      // حذف القيد المحاسبي المرتبط
      if (invoice.accountingEntryId) {
        await this.accountingService.deleteJournalEntry(invoice.accountingEntryId)
      }

      // حذف الفاتورة
      this.invoices.delete(invoiceId)

      return true

    } catch (error) {
      console.error('خطأ في حذف الفاتورة:', error)
      throw error
    }
  }

  // ===============================
  // إدارة حالة الفاتورة
  // ===============================

  /**
   * إرسال الفاتورة للمطعم
   */
  public async sendInvoice(invoiceId: string, sendBy: string): Promise<YemeniInvoice> {
    try {
      const invoice = this.invoices.get(invoiceId)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      if (invoice.status !== 'draft') {
        throw new Error('لا يمكن إرسال الفاتورة إلا إذا كانت في حالة مسودة')
      }

      // التحقق من صحة الفاتورة قبل الإرسال
      const validation = validateYemeniInvoice(invoice)
      if (!validation.isValid) {
        throw new Error(`الفاتورة تحتوي على أخطاء: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // تحديث حالة الفاتورة
      invoice.status = 'sent'
      invoice.sentDate = new Date()
      invoice.updatedAt = new Date()

      // حفظ التغييرات
      this.invoices.set(invoiceId, invoice)

      // إشعار بالإرسال (يمكن إضافة خدمة الإشعارات لاحقاً)
      await this.notifyInvoiceSent(invoice, sendBy)

      return invoice

    } catch (error) {
      console.error('خطأ في إرسال الفاتورة:', error)
      throw error
    }
  }

  /**
   * تأكيد تسليم الفاتورة
   */
  public async markInvoiceDelivered(invoiceId: string): Promise<YemeniInvoice> {
    try {
      const invoice = this.invoices.get(invoiceId)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      if (invoice.status !== 'sent') {
        throw new Error('يجب إرسال الفاتورة أولاً')
      }

      // تحديث الحالة
      invoice.status = 'delivered'
      invoice.deliveredDate = new Date()
      invoice.updatedAt = new Date()

      this.invoices.set(invoiceId, invoice)

      return invoice

    } catch (error) {
      console.error('خطأ في تأكيد التسليم:', error)
      throw error
    }
  }

  /**
   * تأكيد قراءة الفاتورة
   */
  public async markInvoiceRead(invoiceId: string): Promise<YemeniInvoice> {
    try {
      const invoice = this.invoices.get(invoiceId)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      // تحديث تاريخ القراءة
      invoice.readDate = new Date()
      invoice.updatedAt = new Date()

      this.invoices.set(invoiceId, invoice)

      return invoice

    } catch (error) {
      console.error('خطأ في تأكيد القراءة:', error)
      throw error
    }
  }

  /**
   * تحديث حالة الفاتورة إلى متأخرة
   */
  public async markInvoiceOverdue(invoiceId: string): Promise<YemeniInvoice> {
    try {
      const invoice = this.invoices.get(invoiceId)
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة')
      }

      const now = new Date()
      if (invoice.dueDate <= now && invoice.status === 'delivered') {
        invoice.status = 'overdue'
        invoice.updatedAt = new Date()

        this.invoices.set(invoiceId, invoice)

        // إشعار بالتأخير
        await this.notifyInvoiceOverdue(invoice)
      }

      return invoice

    } catch (error) {
      console.error('خطأ في تحديث حالة التأخير:', error)
      throw error
    }
  }

  // ===============================
  // البحث والاستعلام
  // ===============================

  /**
   * البحث في الفواتير
   */
  public async searchInvoices(criteria: InvoiceSearchCriteria): Promise<InvoiceSearchResult> {
    try {
      let filteredInvoices = Array.from(this.invoices.values())

      // تطبيق المعايير
      if (criteria.restaurantId) {
        filteredInvoices = filteredInvoices.filter(inv => inv.restaurantId === criteria.restaurantId)
      }

      if (criteria.status && criteria.status.length > 0) {
        filteredInvoices = filteredInvoices.filter(inv => criteria.status!.includes(inv.status))
      }

      if (criteria.type && criteria.type.length > 0) {
        filteredInvoices = filteredInvoices.filter(inv => criteria.type!.includes(inv.type))
      }

      if (criteria.dateRange) {
        const { field, start, end } = criteria.dateRange
        filteredInvoices = filteredInvoices.filter(inv => {
          const date = inv[field]
          return date >= start && date <= end
        })
      }

      if (criteria.amountRange) {
        const { min, max } = criteria.amountRange
        filteredInvoices = filteredInvoices.filter(inv => inv.total >= min && inv.total <= max)
      }

      if (criteria.searchText) {
        const searchText = criteria.searchText.toLowerCase()
        filteredInvoices = filteredInvoices.filter(inv => 
          inv.invoiceNumber.toLowerCase().includes(searchText) ||
          inv.restaurantName.toLowerCase().includes(searchText) ||
          (inv.notes && inv.notes.toLowerCase().includes(searchText))
        )
      }

      // الترتيب
      if (criteria.sortBy) {
        filteredInvoices.sort((a, b) => {
          const aValue = a[criteria.sortBy!] as any
          const bValue = b[criteria.sortBy!] as any
          
          if (criteria.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1
          } else {
            return aValue > bValue ? 1 : -1
          }
        })
      }

      // حساب الملخص
      const summary = {
        totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
        paidAmount: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
        unpaidAmount: filteredInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0),
        overdueAmount: filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
      }

      // الترقيم
      const totalCount = filteredInvoices.length
      const page = criteria.page || 1
      const limit = criteria.limit || 20
      const totalPages = Math.ceil(totalCount / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const invoices = filteredInvoices.slice(startIndex, endIndex)

      return {
        invoices,
        totalCount,
        totalPages,
        currentPage: page,
        summary
      }

    } catch (error) {
      console.error('خطأ في البحث:', error)
      throw new Error('فشل في البحث عن الفواتير')
    }
  }

  /**
   * الحصول على فاتورة محددة
   */
  public async getInvoice(invoiceId: string): Promise<YemeniInvoice | null> {
    return this.invoices.get(invoiceId) || null
  }

  /**
   * الحصول على فواتير مطعم محدد
   */
  public async getRestaurantInvoices(restaurantId: string): Promise<YemeniInvoice[]> {
    return Array.from(this.invoices.values()).filter(inv => inv.restaurantId === restaurantId)
  }

  // ===============================
  // التقارير والإحصائيات
  // ===============================

  /**
   * إنتاج ملخص فوترة المطعم
   */
  public async generateRestaurantBillingSummary(
    restaurantId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<RestaurantBillingSummary> {
    try {
      const invoices = Array.from(this.invoices.values()).filter(inv => 
        inv.restaurantId === restaurantId &&
        inv.issueDate >= startDate &&
        inv.issueDate <= endDate
      )

      const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
      const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
      const unpaidAmount = totalAmount - paidAmount
      const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)

      // حساب معدل الدفع
      const paymentRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

      // حساب متوسط وقت الدفع
      const paidInvoices = invoices.filter(inv => inv.status === 'paid')
      const averagePaymentTime = paidInvoices.length > 0 
        ? paidInvoices.reduce((sum, inv) => {
            // حساب الفرق بين تاريخ الإصدار وتاريخ الدفع (افتراضي)
            const paymentDate = inv.updatedAt // تبسيط للمثال
            const daysDiff = Math.ceil((paymentDate.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + daysDiff
          }, 0) / paidInvoices.length
        : 0

      // إحصائيات الحالات
      const invoicesByStatus = invoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1
        return acc
      }, {} as Record<InvoiceStatus, number>)

      // إحصائيات طرق الدفع
      const paymentsByMethod = invoices.reduce((acc, inv) => {
        acc[inv.paymentMethod] = (acc[inv.paymentMethod] || 0) + 1
        return acc
      }, {} as Record<PaymentMethod, number>)

      return {
        restaurantId,
        restaurantName: invoices[0]?.restaurantName || 'غير محدد',
        period: { start: startDate, end: endDate },
        totalInvoices: invoices.length,
        totalAmount,
        paidAmount,
        unpaidAmount,
        overdueAmount,
        paymentRate,
        averagePaymentTime,
        invoicesByStatus,
        paymentsByMethod,
        lastInvoiceDate: invoices.length > 0 ? Math.max(...invoices.map(inv => inv.issueDate.getTime())) : Date.now(),
        nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // شهر من الآن
      } as RestaurantBillingSummary

    } catch (error) {
      console.error('خطأ في إنتاج ملخص الفوترة:', error)
      throw new Error('فشل في إنتاج ملخص الفوترة')
    }
  }

  // ===============================
  // العمليات المساعدة
  // ===============================

  /**
   * حساب مبالغ البند
   */
  private calculateItemAmounts(item: InvoiceItem): void {
    item.subtotal = item.quantity * item.unitPrice
    item.discountAmount = item.subtotal * (item.discount / 100)
    const afterDiscount = item.subtotal - item.discountAmount
    item.vatAmount = afterDiscount * item.vatRate
    item.total = afterDiscount + item.vatAmount
  }

  /**
   * حساب إجماليات الفاتورة
   */
  private calculateInvoiceTotals(invoice: YemeniInvoice): void {
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0)
    
    // الخصم العام
    const generalDiscountAmount = invoice.subtotal * (invoice.discountRate / 100)
    const itemDiscountAmount = invoice.items.reduce((sum, item) => sum + item.discountAmount, 0)
    invoice.discountAmount = generalDiscountAmount + itemDiscountAmount
    
    // ضريبة القيمة المضافة
    invoice.vatAmount = invoice.items.reduce((sum, item) => sum + item.vatAmount, 0)
    
    // المجموع الإجمالي
    invoice.total = invoice.items.reduce((sum, item) => sum + item.total, 0) - generalDiscountAmount
    
    // المبلغ بالكلمات
    invoice.amountInWords = convertAmountToWords(invoice.total, invoice.currency)
  }

  /**
   * إنشاء قيد محاسبي للفاتورة
   */
  private async createAccountingEntry(invoice: YemeniInvoice): Promise<void> {
    try {
      // إنشاء قيد محاسبي بسيط
      // سيتم تطويره أكثر مع التكامل مع النظام المحاسبي
      console.log('إنشاء قيد محاسبي للفاتورة:', invoice.invoiceNumber)
    } catch (error) {
      console.error('خطأ في إنشاء القيد المحاسبي:', error)
    }
  }

  /**
   * توليد معرف فريد للفاتورة
   */
  private generateInvoiceId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * توليد رقم فاتورة تسلسلي
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear()
    const number = this.invoiceNumberCounter.toString().padStart(4, '0')
    this.invoiceNumberCounter++
    return `LSI-${year}-${number}`
  }

  /**
   * توليد معرف فريد للبند
   */
  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * حساب تاريخ الاستحقاق
   */
  private calculateDueDate(issueDate?: Date): Date {
    const baseDate = issueDate || new Date()
    const dueDate = new Date(baseDate)
    dueDate.setDate(dueDate.getDate() + DEFAULT_PAYMENT_TERMS)
    return dueDate
  }

  /**
   * الحصول على بداية الفترة الافتراضية
   */
  private getDefaultPeriodStart(): Date {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  /**
   * الحصول على نهاية الفترة الافتراضية
   */
  private getDefaultPeriodEnd(): Date {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  /**
   * الحصول على الشروط والأحكام الافتراضية
   */
  private getDefaultTermsAndConditions(): string {
    return `
1. يستحق سداد هذه الفاتورة خلال ${DEFAULT_PAYMENT_TERMS} يوم من تاريخ الإصدار.
2. في حالة التأخير في السداد، قد تطبق غرامة تأخير 2% شهرياً.
3. جميع الأسعار شاملة ضريبة القيمة المضافة ${YEMEN_VAT_RATE * 100}%.
4. أي اعتراض على هذه الفاتورة يجب إبلاغه خلال 7 أيام من تاريخ الاستلام.
5. تخضع هذه الفاتورة للقوانين اليمنية النافذة.
    `.trim()
  }

  /**
   * تحميل بيانات الفواتير (محاكاة)
   */
  private loadInvoiceData(): void {
    // هنا سيتم تحميل البيانات من قاعدة البيانات
    console.log('تحميل بيانات الفواتير...')
  }

  /**
   * إشعار بإرسال الفاتورة
   */
  private async notifyInvoiceSent(invoice: YemeniInvoice, sentBy: string): Promise<void> {
    console.log(`تم إرسال الفاتورة ${invoice.invoiceNumber} إلى ${invoice.restaurantName} بواسطة ${sentBy}`)
  }

  /**
   * إشعار بتأخير الفاتورة
   */
  private async notifyInvoiceOverdue(invoice: YemeniInvoice): Promise<void> {
    console.log(`الفاتورة ${invoice.invoiceNumber} متأخرة عن موعد الاستحقاق`)
  }
}

// تصدير مثيل واحد للخدمة
export const invoiceService = InvoiceService.getInstance()
export default InvoiceService
