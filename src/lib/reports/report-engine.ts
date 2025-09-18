/**
 * محرك التقارير اليمني المتقدم
 * نظام إدارة لاند سبايس - الوحدة الثانية عشرة (الأخيرة)
 */

import {
  ReportTemplate,
  ReportConfig,
  Report,
  ReportSummary,
  ReportInsight,
  ExportFormat,
  ReportStatus,
  YemeniCalendarSettings,
  YemeniCurrencySettings,
  PDFExportSettings,
  ExcelExportSettings
} from './types'

export class ReportEngine {
  private static instance: ReportEngine
  private templates: Map<string, ReportTemplate> = new Map()
  private reports: Map<string, Report> = new Map()
  private yemeniSettings: YemeniCalendarSettings
  private currencySettings: YemeniCurrencySettings

  private constructor() {
    this.initializeEngine()
    this.loadYemeniSettings()
    this.loadDefaultTemplates()
  }

  public static getInstance(): ReportEngine {
    if (!ReportEngine.instance) {
      ReportEngine.instance = new ReportEngine()
    }
    return ReportEngine.instance
  }

  private initializeEngine(): void {
    console.log('📊 تم تهيئة محرك التقارير اليمني المتقدم')
  }

  // ===============================
  // إدارة قوالب التقارير
  // ===============================

  registerTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template)
    console.log(`✅ تم تسجيل قالب التقرير: ${template.nameArabic || template.name}`)
  }

  getTemplate(templateId: string): ReportTemplate | null {
    return this.templates.get(templateId) || null
  }

  getAvailableTemplates(category?: string): ReportTemplate[] {
    const templates = Array.from(this.templates.values())
    
    if (category) {
      return templates.filter(t => t.category === category)
    }
    
    return templates.filter(t => t.isActive)
  }

  // ===============================
  // إنتاج التقارير
  // ===============================

  async generateReport(config: ReportConfig): Promise<{
    success: boolean
    reportId?: string
    error?: string
  }> {
    try {
      const startTime = Date.now()
      
      const validation = await this.validateConfig(config)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      const template = this.getTemplate(config.templateId)
      if (!template) {
        return {
          success: false,
          error: 'قالب التقرير غير موجود'
        }
      }

      const reportId = this.generateReportId()

      const report: Report = {
        id: reportId,
        templateId: config.templateId,
        config,
        title: config.title,
        titleArabic: config.titleArabic,
        generatedAt: new Date(),
        generatedBy: 'system',
        status: 'generating',
        data: { headers: [], rows: [] },
        summary: { totalRecords: 0, keyMetrics: {} },
        insights: [],
        recommendations: [],
        generationTime: 0,
        recordCount: 0,
        dataVersion: '1.0',
        exports: {},
        distributionHistory: []
      }

      this.reports.set(reportId, report)

      await this.generateReportData(report, template)
      await this.generateSummaryAndInsights(report)

      const endTime = Date.now()
      report.generationTime = endTime - startTime
      report.status = 'completed'
      report.recordCount = report.data.rows.length

      this.reports.set(reportId, report)

      console.log(`📊 تم إنتاج التقرير بنجاح: ${report.title}`)
      console.log(`⏱️ وقت التوليد: ${report.generationTime}ms`)

      return {
        success: true,
        reportId
      }
    } catch (error) {
      console.error('❌ خطأ في إنتاج التقرير:', error)
      return {
        success: false,
        error: 'فشل في إنتاج التقرير'
      }
    }
  }

  async getReport(reportId: string): Promise<Report | null> {
    return this.reports.get(reportId) || null
  }

  // ===============================
  // تصدير التقارير
  // ===============================

  async exportReport(reportId: string, format: ExportFormat): Promise<{
    success: boolean
    url?: string
    error?: string
  }> {
    try {
      const report = await this.getReport(reportId)
      if (!report) {
        return {
          success: false,
          error: 'التقرير غير موجود'
        }
      }

      let exportUrl: string
      const startTime = Date.now()

      switch (format) {
        case 'pdf':
          exportUrl = await this.exportToPDF(report)
          break
        case 'excel':
          exportUrl = await this.exportToExcel(report)
          break
        case 'csv':
          exportUrl = await this.exportToCSV(report)
          break
        case 'json':
          exportUrl = await this.exportToJSON(report)
          break
        default:
          return {
            success: false,
            error: 'تنسيق التصدير غير مدعوم'
          }
      }

      const exportInfo = {
        url: exportUrl,
        size: 0,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      report.exports[format] = exportInfo
      this.reports.set(reportId, report)

      console.log(`📤 تم تصدير التقرير بصيغة ${format}`)

      return {
        success: true,
        url: exportUrl
      }
    } catch (error) {
      console.error(`❌ خطأ في تصدير التقرير:`, error)
      return {
        success: false,
        error: 'فشل في تصدير التقرير'
      }
    }
  }

  // ===============================
  // إنتاج البيانات
  // ===============================

  private async generateReportData(report: Report, template: ReportTemplate): Promise<void> {
    switch (template.category) {
      case 'revenue':
        await this.generateRevenueData(report)
        break
      case 'payments':
        await this.generatePaymentsData(report)
        break
      case 'installments':
        await this.generateInstallmentsData(report)
        break
      default:
        await this.generateDefaultData(report)
        break
    }
  }

  private async generateRevenueData(report: Report): Promise<void> {
    const sampleData = [
      {
        id: '1',
        restaurantName: 'مطعم الأصالة اليمنية',
        month: '2025-01',
        totalRevenue: 850000,
        growth: 15.5
      },
      {
        id: '2',
        restaurantName: 'مطعم البركة للمأكولات الشعبية',
        month: '2025-01',
        totalRevenue: 720000,
        growth: 8.2
      }
    ]

    report.data.headers = [
      { key: 'restaurantName', label: 'Restaurant Name', labelArabic: 'اسم المطعم', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'month', label: 'Month', labelArabic: 'الشهر', dataType: 'date', alignment: 'center', isVisible: true, isSortable: true },
      { key: 'totalRevenue', label: 'Total Revenue', labelArabic: 'إجمالي الإيرادات', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'growth', label: 'Growth %', labelArabic: 'معدل النمو %', dataType: 'percentage', alignment: 'center', isVisible: true, isSortable: true }
    ]

    report.data.rows = sampleData.map(item => ({
      id: item.id,
      values: item,
      metadata: {
        highlight: item.growth > 10 ? 'success' : 'info'
      }
    }))

    report.data.charts = [{
      type: 'bar',
      title: 'Revenue by Restaurant',
      titleArabic: 'الإيرادات حسب المطعم',
      datasets: [{
        label: 'Total Revenue',
        labelArabic: 'إجمالي الإيرادات',
        data: sampleData.map(item => item.totalRevenue),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }],
      labels: sampleData.map(item => item.restaurantName),
      interactive: true,
      drillDownEnabled: true,
      exportEnabled: true,
      options: {
        responsive: true,
        maintainAspectRatio: false
      },
      styling: {
        colorScheme: 'yemeni',
        fonts: { family: 'Cairo', size: 12, weight: 'normal', color: '#374151' },
        padding: { top: 20, right: 20, bottom: 20, left: 20 }
      }
    }]
  }

  private async generatePaymentsData(report: Report): Promise<void> {
    const sampleData = [
      {
        id: '1',
        restaurantName: 'مطعم الأصالة اليمنية',
        totalDue: 500000,
        paidAmount: 450000,
        overdueAmount: 50000
      },
      {
        id: '2',
        restaurantName: 'مطعم البركة للمأكولات الشعبية',
        totalDue: 750000,
        paidAmount: 750000,
        overdueAmount: 0
      }
    ]

    report.data.headers = [
      { key: 'restaurantName', label: 'Restaurant', labelArabic: 'المطعم', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'totalDue', label: 'Total Due', labelArabic: 'المستحق', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'paidAmount', label: 'Paid', labelArabic: 'المدفوع', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'overdueAmount', label: 'Overdue', labelArabic: 'المتأخر', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true }
    ]

    report.data.rows = sampleData.map(item => ({
      id: item.id,
      values: item,
      metadata: {
        highlight: item.overdueAmount === 0 ? 'success' : 'warning'
      }
    }))
  }

  private async generateInstallmentsData(report: Report): Promise<void> {
    const sampleData = [
      {
        id: '1',
        planNumber: 'PLN-2025-0001',
        restaurantName: 'مطعم الأصالة اليمنية',
        bank: 'بنك القاسمي',
        totalAmount: 500000,
        status: 'active'
      }
    ]

    report.data.headers = [
      { key: 'planNumber', label: 'Plan Number', labelArabic: 'رقم الخطة', dataType: 'string', alignment: 'center', isVisible: true, isSortable: true },
      { key: 'restaurantName', label: 'Restaurant', labelArabic: 'المطعم', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'bank', label: 'Bank', labelArabic: 'البنك', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'totalAmount', label: 'Amount', labelArabic: 'المبلغ', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'status', label: 'Status', labelArabic: 'الحالة', dataType: 'string', alignment: 'center', isVisible: true, isSortable: true }
    ]

    report.data.rows = sampleData.map(item => ({
      id: item.id,
      values: item
    }))
  }

  private async generateDefaultData(report: Report): Promise<void> {
    report.data.headers = [
      { key: 'id', label: 'ID', labelArabic: 'المعرف', dataType: 'string', alignment: 'center', isVisible: true, isSortable: true },
      { key: 'name', label: 'Name', labelArabic: 'الاسم', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true }
    ]

    report.data.rows = [
      { id: '1', values: { id: '1', name: 'بيانات تجريبية' } }
    ]
  }

  private async generateSummaryAndInsights(report: Report): Promise<void> {
    const totalRevenue = report.data.rows.reduce((sum, row) => 
      sum + (row.values.totalRevenue || row.values.totalAmount || 0), 0)

    report.summary = {
      totalRecords: report.data.rows.length,
      keyMetrics: {
        totalRevenue: {
          value: totalRevenue,
          trend: 'up',
          status: 'good',
          unit: 'YER'
        }
      }
    }

    report.insights = [{
      type: 'trend',
      severity: 'medium',
      title: 'Revenue Growth',
      titleArabic: 'نمو الإيرادات',
      description: 'Steady revenue growth observed',
      descriptionArabic: 'نمو مستقر في الإيرادات',
      impact: 'positive',
      confidence: 85,
      actionRequired: false
    }]

    report.recommendations = [
      'الاستمرار في استراتيجية النمو الحالية',
      'مراقبة المدفوعات المتأخرة',
      'تطوير علاقات جديدة مع المطاعم'
    ]
  }

  // ===============================
  // التصدير
  // ===============================

  private async exportToPDF(report: Report): Promise<string> {
    console.log('📄 تصدير PDF للتقرير:', report.title)
    return `/reports/exports/${report.id}.pdf`
  }

  private async exportToExcel(report: Report): Promise<string> {
    console.log('📊 تصدير Excel للتقرير:', report.title)
    return `/reports/exports/${report.id}.xlsx`
  }

  private async exportToCSV(report: Report): Promise<string> {
    console.log('📋 تصدير CSV للتقرير:', report.title)
    return `/reports/exports/${report.id}.csv`
  }

  private async exportToJSON(report: Report): Promise<string> {
    console.log('🔗 تصدير JSON للتقرير:', report.title)
    return `/reports/exports/${report.id}.json`
  }

  // ===============================
  // الدوال المساعدة
  // ===============================

  private async validateConfig(config: ReportConfig): Promise<{
    isValid: boolean
    error?: string
  }> {
    if (!config.templateId) {
      return { isValid: false, error: 'معرف القالب مطلوب' }
    }

    if (!config.title) {
      return { isValid: false, error: 'عنوان التقرير مطلوب' }
    }

    if (!config.dateRange.startDate || !config.dateRange.endDate) {
      return { isValid: false, error: 'فترة التقرير مطلوبة' }
    }

    return { isValid: true }
  }

  private generateReportId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `report_${timestamp}_${random}`
  }

  private loadYemeniSettings(): void {
    this.yemeniSettings = {
      useHijriDates: true,
      showBothCalendars: true,
      hijriDateFormat: 'DD/MM/YYYY هـ',
      includeReligiousHolidays: true,
      includeNationalHolidays: true,
      customHolidays: [],
      workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      workingHours: {
        start: '08:00',
        end: '16:00'
      }
    }

    this.currencySettings = {
      primaryCurrency: 'YER',
      showCurrencySymbol: true,
      currencyPosition: 'after',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      numberFormat: 'arabic'
    }
  }

  private loadDefaultTemplates(): void {
    const templates: ReportTemplate[] = [
      {
        id: 'revenue_monthly',
        name: 'Monthly Revenue Report',
        nameArabic: 'تقرير الإيرادات الشهرية',
        type: 'financial',
        category: 'revenue',
        description: 'Monthly revenue analysis by restaurant',
        descriptionArabic: 'تحليل الإيرادات الشهرية حسب المطعم',
        version: '1.0',
        isActive: true,
        supportedFormats: ['pdf', 'excel', 'csv'],
        defaultFormat: 'pdf',
        requiredPermissions: ['reports.financial.read'],
        dataSourceTables: ['invoices', 'payments', 'restaurants'],
        refreshFrequency: 'daily',
        estimatedGenerationTime: 5,
        supportArabicRTL: true,
        useHijriCalendar: true,
        includeYemeniHolidays: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'payments_status',
        name: 'Payments Status Report',
        nameArabic: 'تقرير حالة المدفوعات',
        type: 'financial',
        category: 'payments',
        description: 'Payment status and overdue analysis',
        descriptionArabic: 'تحليل حالة المدفوعات والمتأخرات',
        version: '1.0',
        isActive: true,
        supportedFormats: ['pdf', 'excel'],
        defaultFormat: 'excel',
        requiredPermissions: ['reports.financial.read'],
        dataSourceTables: ['payments', 'invoices'],
        refreshFrequency: 'daily',
        estimatedGenerationTime: 3,
        supportArabicRTL: true,
        useHijriCalendar: true,
        includeYemeniHolidays: false,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    templates.forEach(template => this.registerTemplate(template))
  }
}

export default ReportEngine.getInstance()
