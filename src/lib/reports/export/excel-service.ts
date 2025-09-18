/**
 * خدمة تصدير Excel للتقارير اليمنية
 * نظام إدارة لاند سبايس - الوحدة الثانية عشرة (الأخيرة)
 * 
 * خدمة متقدمة لتصدير التقارير بصيغة Excel مع تنسيق احترافي
 * ودعم الصيغ والرسوم البيانية والتنسيق العربي
 */

import { Report, ExcelExportSettings, ChartData } from '../types'

// ===============================
// أنواع البيانات لتصدير Excel
// ===============================

export interface ExcelWorkbook {
  id: string
  fileName: string
  sheets: ExcelWorksheet[]
  metadata: ExcelMetadata
  settings: ExcelExportSettings
}

export interface ExcelWorksheet {
  name: string
  nameArabic: string
  data: ExcelData
  charts: ExcelChart[]
  formatting: ExcelFormatting
  protection?: ExcelProtection
}

export interface ExcelData {
  headers: ExcelHeader[]
  rows: ExcelRow[]
  summary?: ExcelSummary
}

export interface ExcelHeader {
  key: string
  label: string
  labelArabic: string
  dataType: 'text' | 'number' | 'currency' | 'date' | 'percentage' | 'formula'
  width?: number
  format?: string
  alignment?: 'left' | 'center' | 'right'
  backgroundColor?: string
  textColor?: string
  fontWeight?: 'normal' | 'bold'
}

export interface ExcelRow {
  id: string
  values: Record<string, any>
  formulas?: Record<string, string>
  formatting?: ExcelCellFormatting
  conditional?: ExcelConditionalFormatting
}

export interface ExcelSummary {
  totals: Record<string, number | string>
  averages: Record<string, number>
  counts: Record<string, number>
  formulas: Record<string, string>
}

export interface ExcelChart {
  type: 'column' | 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter'
  title: string
  titleArabic: string
  dataRange: string
  position: {
    row: number
    column: number
    width: number
    height: number
  }
  styling: ExcelChartStyling
}

export interface ExcelFormatting {
  headerRow: ExcelRowFormatting
  dataRows: ExcelRowFormatting
  summaryRow?: ExcelRowFormatting
  alternateRowColors: boolean
  borders: boolean
  autoFilter: boolean
  freezePanes?: {
    row: number
    column: number
  }
}

export interface ExcelCellFormatting {
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  alignment?: 'left' | 'center' | 'right'
  numberFormat?: string
  borders?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
}

export interface ExcelRowFormatting extends ExcelCellFormatting {
  height?: number
}

export interface ExcelConditionalFormatting {
  rules: ConditionalRule[]
}

export interface ConditionalRule {
  type: 'cellValue' | 'formula' | 'colorScale' | 'dataBar' | 'iconSet'
  condition: string
  format: ExcelCellFormatting
  range: string
}

export interface ExcelChartStyling {
  colorScheme: 'yemeni' | 'professional' | 'modern' | 'custom'
  colors: string[]
  showDataLabels: boolean
  showLegend: boolean
  legendPosition: 'top' | 'bottom' | 'left' | 'right'
}

export interface ExcelProtection {
  password?: string
  allowEditing: boolean
  allowFormatting: boolean
  allowInsertingRows: boolean
  allowDeletingRows: boolean
  allowSorting: boolean
  allowFiltering: boolean
}

export interface ExcelMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  comments: string
  createdAt: Date
  lastModified: Date
  version: string
}

// ===============================
// خدمة تصدير Excel الرئيسية
// ===============================

/**
 * خدمة تصدير التقارير بصيغة Excel - نمط Singleton
 */
export class ExcelExportService {
  private static instance: ExcelExportService

  private constructor() {
    this.initializeExcelService()
  }

  public static getInstance(): ExcelExportService {
    if (!ExcelExportService.instance) {
      ExcelExportService.instance = new ExcelExportService()
    }
    return ExcelExportService.instance
  }

  private initializeExcelService(): void {
    console.log('📊 تم تهيئة خدمة تصدير Excel اليمنية المتقدمة')
  }

  // ===============================
  // إنتاج Excel للتقارير
  // ===============================

  /**
   * تصدير تقرير إلى Excel
   */
  async exportReportToExcel(report: Report, settings?: ExcelExportSettings): Promise<{
    success: boolean
    excelUrl?: string
    excelBuffer?: Buffer
    error?: string
  }> {
    try {
      console.log(`📊 بدء تصدير التقرير إلى Excel: ${report.titleArabic || report.title}`)
      
      // إعداد التكوين الافتراضي
      const excelSettings = this.getDefaultExcelSettings(settings)
      
      // إنشاء مصنف Excel
      const workbook = await this.createExcelWorkbook(report, excelSettings)
      
      // إنشاء ورقة العمل الرئيسية
      await this.createMainWorksheet(workbook, report)
      
      // إضافة ورقة الملخص
      await this.createSummaryWorksheet(workbook, report)
      
      // إضافة الرسوم البيانية إذا توفرت
      if (report.data.charts && report.data.charts.length > 0) {
        await this.createChartsWorksheet(workbook, report.data.charts)
      }
      
      // تطبيق التنسيق والحماية
      await this.applyExcelFormatting(workbook)
      
      // إنتاج ملف Excel النهائي
      const result = await this.generateExcelFile(workbook)
      
      console.log(`✅ تم تصدير Excel بنجاح: ${result.excelUrl}`)
      
      return {
        success: true,
        excelUrl: result.excelUrl,
        excelBuffer: result.buffer
      }
      
    } catch (error) {
      console.error('❌ خطأ في تصدير Excel:', error)
      return {
        success: false,
        error: 'فشل في تصدير التقرير إلى Excel'
      }
    }
  }

  /**
   * تصدير عدة تقارير إلى مصنف Excel واحد
   */
  async exportMultipleReportsToExcel(reports: Report[], settings?: ExcelExportSettings): Promise<{
    success: boolean
    excelUrl?: string
    error?: string
  }> {
    try {
      console.log(`📊 بدء تصدير ${reports.length} تقرير في مصنف Excel واحد`)
      
      const excelSettings = this.getDefaultExcelSettings(settings)
      
      // إنشاء مصنف موحد
      const workbook = await this.createCombinedWorkbook(reports, excelSettings)
      
      // إضافة ورقة عمل لكل تقرير
      for (const report of reports) {
        await this.addReportToWorkbook(workbook, report)
      }
      
      // إضافة ورقة الملخص الشامل
      await this.createOverallSummaryWorksheet(workbook, reports)
      
      // إنتاج الملف النهائي
      const result = await this.generateExcelFile(workbook)
      
      console.log(`✅ تم تصدير Excel المجمع بنجاح: ${result.excelUrl}`)
      
      return {
        success: true,
        excelUrl: result.excelUrl
      }
      
    } catch (error) {
      console.error('❌ خطأ في تصدير Excel المجمع:', error)
      return {
        success: false,
        error: 'فشل في تصدير التقارير المجمعة'
      }
    }
  }

  // ===============================
  // إنشاء مصنف Excel
  // ===============================

  private async createExcelWorkbook(report: Report, settings: ExcelExportSettings): Promise<ExcelWorkbook> {
    return {
      id: this.generateExcelId(),
      fileName: `${report.titleArabic || report.title}_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheets: [],
      settings,
      metadata: {
        title: report.titleArabic || report.title,
        author: 'لاند سبايس - Land Spice',
        subject: 'تقرير مالي وتشغيلي',
        keywords: ['تقرير', 'لاند سبايس', 'مطاعم', 'يمن', 'Excel'],
        comments: 'تم إنتاج هذا التقرير بواسطة نظام إدارة لاند سبايس',
        createdAt: new Date(),
        lastModified: new Date(),
        version: '1.0'
      }
    }
  }

  private async createCombinedWorkbook(reports: Report[], settings: ExcelExportSettings): Promise<ExcelWorkbook> {
    return {
      id: this.generateExcelId(),
      fileName: `تقارير_شاملة_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheets: [],
      settings,
      metadata: {
        title: 'مجموعة التقارير الشاملة - لاند سبايس',
        author: 'لاند سبايس - Land Spice',
        subject: 'مجموعة تقارير مالية وتشغيلية شاملة',
        keywords: ['تقارير', 'لاند سبايس', 'مطاعم', 'يمن', 'شامل', 'Excel'],
        comments: 'مجموعة متكاملة من التقارير تغطي جميع جوانب الأعمال',
        createdAt: new Date(),
        lastModified: new Date(),
        version: '1.0'
      }
    }
  }

  // ===============================
  // إنشاء أوراق العمل
  // ===============================

  private async createMainWorksheet(workbook: ExcelWorkbook, report: Report): Promise<void> {
    const worksheet: ExcelWorksheet = {
      name: 'البيانات الأساسية',
      nameArabic: 'البيانات الأساسية',
      data: {
        headers: report.data.headers.map(header => ({
          key: header.key,
          label: header.label,
          labelArabic: header.labelArabic || header.label,
          dataType: this.mapDataType(header.dataType),
          width: header.width || this.calculateColumnWidth(header.key),
          format: this.getNumberFormat(header.dataType),
          alignment: header.alignment || 'center',
          backgroundColor: '#f8fafc',
          textColor: '#1f2937',
          fontWeight: 'bold'
        })),
        rows: report.data.rows.map(row => ({
          id: row.id,
          values: row.values,
          formulas: this.generateRowFormulas(row.values),
          formatting: this.getRowFormatting(row.metadata?.highlight),
          conditional: this.getConditionalFormatting(row.values)
        })),
        summary: this.createDataSummary(report.data.rows, report.data.headers)
      },
      charts: [],
      formatting: {
        headerRow: {
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          fontWeight: 'bold',
          alignment: 'center',
          height: 25
        },
        dataRows: {
          alignment: 'center',
          height: 20
        },
        summaryRow: {
          backgroundColor: '#f3f4f6',
          fontWeight: 'bold',
          height: 25
        },
        alternateRowColors: true,
        borders: true,
        autoFilter: true,
        freezePanes: {
          row: 1,
          column: 0
        }
      }
    }

    workbook.sheets.push(worksheet)
  }

  private async createSummaryWorksheet(workbook: ExcelWorkbook, report: Report): Promise<void> {
    const summarySheet: ExcelWorksheet = {
      name: 'الملخص التنفيذي',
      nameArabic: 'الملخص التنفيذي',
      data: {
        headers: [
          {
            key: 'metric',
            label: 'المؤشر',
            labelArabic: 'المؤشر',
            dataType: 'text',
            width: 30,
            alignment: 'right'
          },
          {
            key: 'value',
            label: 'القيمة',
            labelArabic: 'القيمة',
            dataType: 'text',
            width: 20,
            alignment: 'center'
          },
          {
            key: 'change',
            label: 'التغيير',
            labelArabic: 'التغيير',
            dataType: 'percentage',
            width: 15,
            alignment: 'center'
          },
          {
            key: 'status',
            label: 'الحالة',
            labelArabic: 'الحالة',
            dataType: 'text',
            width: 15,
            alignment: 'center'
          }
        ],
        rows: this.createSummaryRows(report.summary),
        summary: {
          totals: {},
          averages: {},
          counts: { metrics: Object.keys(report.summary.keyMetrics || {}).length },
          formulas: {}
        }
      },
      charts: [],
      formatting: {
        headerRow: {
          backgroundColor: '#10b981',
          textColor: '#ffffff',
          fontWeight: 'bold'
        },
        dataRows: {
          alignment: 'center'
        },
        alternateRowColors: true,
        borders: true,
        autoFilter: false
      }
    }

    workbook.sheets.push(summarySheet)
  }

  private async createChartsWorksheet(workbook: ExcelWorkbook, charts: ChartData[]): Promise<void> {
    const chartsSheet: ExcelWorksheet = {
      name: 'الرسوم البيانية',
      nameArabic: 'الرسوم البيانية',
      data: {
        headers: [],
        rows: []
      },
      charts: charts.map((chart, index) => ({
        type: this.mapChartType(chart.type),
        title: chart.title,
        titleArabic: chart.titleArabic || chart.title,
        dataRange: `A1:D${chart.datasets[0].data.length + 1}`,
        position: {
          row: index * 20 + 2,
          column: 1,
          width: 480,
          height: 300
        },
        styling: {
          colorScheme: 'yemeni',
          colors: this.getYemeniColors(),
          showDataLabels: true,
          showLegend: true,
          legendPosition: 'bottom'
        }
      })),
      formatting: {
        headerRow: {
          backgroundColor: '#f3f4f6'
        },
        dataRows: {},
        alternateRowColors: false,
        borders: false,
        autoFilter: false
      }
    }

    workbook.sheets.push(chartsSheet)
  }

  private async createOverallSummaryWorksheet(workbook: ExcelWorkbook, reports: Report[]): Promise<void> {
    const overallSheet: ExcelWorksheet = {
      name: 'الملخص الشامل',
      nameArabic: 'الملخص الشامل',
      data: {
        headers: [
          {
            key: 'reportName',
            label: 'اسم التقرير',
            labelArabic: 'اسم التقرير',
            dataType: 'text',
            width: 35
          },
          {
            key: 'recordCount',
            label: 'عدد السجلات',
            labelArabic: 'عدد السجلات',
            dataType: 'number',
            width: 15
          },
          {
            key: 'generatedAt',
            label: 'تاريخ الإنتاج',
            labelArabic: 'تاريخ الإنتاج',
            dataType: 'date',
            width: 20
          },
          {
            key: 'status',
            label: 'الحالة',
            labelArabic: 'الحالة',
            dataType: 'text',
            width: 15
          }
        ],
        rows: reports.map((report, index) => ({
          id: `summary_${index}`,
          values: {
            reportName: report.titleArabic || report.title,
            recordCount: report.recordCount,
            generatedAt: report.generatedAt,
            status: report.status === 'completed' ? 'مكتمل' : 'غير مكتمل'
          }
        }))
      },
      charts: [],
      formatting: {
        headerRow: {
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff',
          fontWeight: 'bold'
        },
        dataRows: {},
        alternateRowColors: true,
        borders: true,
        autoFilter: true
      }
    }

    workbook.sheets.push(overallSheet)
  }

  // ===============================
  // دوال المساعدة
  // ===============================

  private getDefaultExcelSettings(customSettings?: ExcelExportSettings): ExcelExportSettings {
    return {
      createSeparateSheets: true,
      sheetNames: ['البيانات', 'الملخص', 'الرسوم البيانية'],
      includeFormulas: true,
      includeCharts: true,
      freezeHeaders: true,
      autoFitColumns: true,
      protectWorkbook: false,
      protectSheets: false,
      includeRawData: true,
      includeFormattedData: true,
      dateFormat: 'dd/mm/yyyy',
      numberFormat: '#,##0.00',
      ...customSettings
    }
  }

  private mapDataType(dataType: string): 'text' | 'number' | 'currency' | 'date' | 'percentage' | 'formula' {
    switch (dataType) {
      case 'currency': return 'currency'
      case 'number': return 'number'
      case 'date': return 'date'
      case 'percentage': return 'percentage'
      default: return 'text'
    }
  }

  private calculateColumnWidth(columnKey: string): number {
    const widthMap: Record<string, number> = {
      'restaurantName': 25,
      'totalRevenue': 15,
      'date': 12,
      'amount': 15,
      'percentage': 10,
      'status': 10
    }
    return widthMap[columnKey] || 15
  }

  private getNumberFormat(dataType: string): string {
    switch (dataType) {
      case 'currency': return '#,##0 "ر.ي"'
      case 'percentage': return '0.0%'
      case 'date': return 'dd/mm/yyyy'
      case 'number': return '#,##0.00'
      default: return '@'
    }
  }

  private generateRowFormulas(values: Record<string, any>): Record<string, string> {
    const formulas: Record<string, string> = {}
    
    // أمثلة على الصيغ المحتملة
    if (values.totalRevenue && values.expenses) {
      formulas.netProfit = `=${values.totalRevenue}-${values.expenses}`
    }
    
    if (values.paidAmount && values.totalDue) {
      formulas.paymentPercentage = `=${values.paidAmount}/${values.totalDue}`
    }
    
    return formulas
  }

  private getRowFormatting(highlight?: string): ExcelCellFormatting | undefined {
    if (!highlight) return undefined
    
    const formats: Record<string, ExcelCellFormatting> = {
      success: { backgroundColor: '#dcfce7', textColor: '#166534' },
      warning: { backgroundColor: '#fef3c7', textColor: '#92400e' },
      error: { backgroundColor: '#fecaca', textColor: '#991b1b' },
      info: { backgroundColor: '#dbeafe', textColor: '#1e40af' }
    }
    
    return formats[highlight]
  }

  private getConditionalFormatting(values: Record<string, any>): ExcelConditionalFormatting | undefined {
    const rules: ConditionalRule[] = []
    
    // قواعد التنسيق الشرطي للأرقام
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'number' && key.includes('percentage')) {
        rules.push({
          type: 'cellValue',
          condition: `>80`,
          format: { backgroundColor: '#dcfce7' },
          range: key
        })
      }
    })
    
    return rules.length > 0 ? { rules } : undefined
  }

  private createDataSummary(rows: any[], headers: any[]): ExcelSummary {
    const summary: ExcelSummary = {
      totals: {},
      averages: {},
      counts: { totalRows: rows.length },
      formulas: {}
    }
    
    // حساب المجاميع والمتوسطات
    headers.forEach(header => {
      if (header.dataType === 'number' || header.dataType === 'currency') {
        const values = rows.map(row => row.values[header.key]).filter(v => typeof v === 'number')
        if (values.length > 0) {
          summary.totals[header.key] = values.reduce((sum, val) => sum + val, 0)
          summary.averages[header.key] = summary.totals[header.key] / values.length
          summary.formulas[`${header.key}_sum`] = `=SUM(${header.key}:${header.key})`
          summary.formulas[`${header.key}_avg`] = `=AVERAGE(${header.key}:${header.key})`
        }
      }
    })
    
    return summary
  }

  private createSummaryRows(summary: any): ExcelRow[] {
    if (!summary.keyMetrics) return []
    
    return Object.entries(summary.keyMetrics).map(([key, metric]: [string, any], index) => ({
      id: `summary_${index}`,
      values: {
        metric: this.translateMetricName(key),
        value: this.formatMetricValue(metric.value, metric.unit),
        change: metric.changePercentage || 0,
        status: this.translateStatus(metric.status)
      },
      formatting: this.getStatusFormatting(metric.status)
    }))
  }

  private translateMetricName(key: string): string {
    const translations: Record<string, string> = {
      'totalRevenue': 'إجمالي الإيرادات',
      'totalCollected': 'إجمالي المحصل',
      'collectionRate': 'معدل التحصيل',
      'averagePerRestaurant': 'متوسط كل مطعم'
    }
    return translations[key] || key
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'excellent': 'ممتاز',
      'good': 'جيد',
      'warning': 'تحذير',
      'critical': 'حرج'
    }
    return translations[status] || status
  }

  private formatMetricValue(value: any, unit?: string): string {
    if (typeof value === 'number') {
      if (unit === 'YER') {
        return `${value.toLocaleString('ar-EG')} ر.ي`
      } else if (unit === '%') {
        return `${value.toFixed(1)}%`
      }
      return value.toLocaleString('ar-EG')
    }
    return String(value)
  }

  private getStatusFormatting(status: string): ExcelCellFormatting {
    const formats: Record<string, ExcelCellFormatting> = {
      excellent: { backgroundColor: '#dcfce7', textColor: '#166534' },
      good: { backgroundColor: '#dbeafe', textColor: '#1e40af' },
      warning: { backgroundColor: '#fef3c7', textColor: '#92400e' },
      critical: { backgroundColor: '#fecaca', textColor: '#991b1b' }
    }
    return formats[status] || {}
  }

  private mapChartType(chartType: string): 'column' | 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter' {
    switch (chartType) {
      case 'bar': return 'column'
      case 'pie': return 'pie'
      case 'line': return 'line'
      case 'area': return 'area'
      case 'doughnut': return 'doughnut'
      default: return 'column'
    }
  }

  private getYemeniColors(): string[] {
    return [
      '#dc2626', // أحمر يمني
      '#059669', // أخضر
      '#2563eb', // أزرق
      '#d97706', // برتقالي
      '#7c3aed', // بنفسجي
      '#0891b2', // تركوازي
      '#be123c', // وردي داكن
      '#166534'  // أخضر داكن
    ]
  }

  private async addReportToWorkbook(workbook: ExcelWorkbook, report: Report): Promise<void> {
    const sheetName = this.sanitizeSheetName(report.titleArabic || report.title)
    
    const worksheet: ExcelWorksheet = {
      name: sheetName,
      nameArabic: sheetName,
      data: {
        headers: report.data.headers.map(header => ({
          key: header.key,
          label: header.label,
          labelArabic: header.labelArabic || header.label,
          dataType: this.mapDataType(header.dataType),
          width: this.calculateColumnWidth(header.key),
          alignment: header.alignment
        })),
        rows: report.data.rows.map(row => ({
          id: row.id,
          values: row.values
        }))
      },
      charts: [],
      formatting: {
        headerRow: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
        dataRows: {},
        alternateRowColors: true,
        borders: true,
        autoFilter: true
      }
    }

    workbook.sheets.push(worksheet)
  }

  private sanitizeSheetName(name: string): string {
    return name.replace(/[\\\/\?\*\[\]]/g, '').substring(0, 31)
  }

  private async applyExcelFormatting(workbook: ExcelWorkbook): Promise<void> {
    workbook.sheets.forEach(sheet => {
      // تطبيق التنسيق العام
      if (sheet.formatting.autoFilter) {
        // تطبيق الفلترة التلقائية
      }
      
      if (sheet.formatting.freezePanes) {
        // تجميد الأجزاء
      }
      
      if (sheet.formatting.alternateRowColors) {
        // تلوين الصفوف المتناوبة
      }
    })
  }

  private async generateExcelFile(workbook: ExcelWorkbook): Promise<{
    excelUrl: string
    buffer: Buffer
  }> {
    // محاكاة إنتاج ملف Excel
    const fileName = workbook.fileName
    const excelUrl = `/reports/exports/${fileName}`
    
    // في التطبيق الحقيقي، سيتم استخدام مكتبة مثل ExcelJS
    const mockBuffer = Buffer.from('Excel Content Placeholder', 'utf-8')
    
    console.log(`📊 تم إنتاج ملف Excel: ${fileName}`)
    
    return {
      excelUrl,
      buffer: mockBuffer
    }
  }

  private generateExcelId(): string {
    return `excel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export default ExcelExportService.getInstance()
