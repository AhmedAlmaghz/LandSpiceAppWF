/**
 * خدمة تصدير PDF للتقارير اليمنية
 * نظام إدارة لاند سبايس - الوحدة الثانية عشرة (الأخيرة)
 * 
 * خدمة متقدمة لتصدير التقارير بصيغة PDF مع تصميم احترافي
 * ودعم كامل للغة العربية والهوية البصرية لشركة لاند سبايس
 */

import { Report, PDFExportSettings, ChartData, TableData } from '../types'

// ===============================
// أنواع البيانات للتصدير
// ===============================

export interface PDFDocument {
  id: string
  title: string
  titleArabic: string
  generatedAt: Date
  pages: PDFPage[]
  settings: PDFExportSettings
  metadata: PDFMetadata
}

export interface PDFPage {
  pageNumber: number
  content: PDFContent[]
  header?: PDFHeader
  footer?: PDFFooter
}

export interface PDFContent {
  type: 'text' | 'table' | 'chart' | 'image' | 'divider' | 'spacer'
  data: any
  styling?: PDFContentStyling
  position?: {
    x: number
    y: number
    width?: number
    height?: number
  }
}

export interface PDFHeader {
  logo?: {
    url: string
    width: number
    height: number
    position: 'left' | 'center' | 'right'
  }
  title: string
  titleArabic?: string
  companyInfo: {
    name: string
    nameArabic: string
    address: string
    addressArabic: string
    phone: string
    email: string
    website: string
  }
  reportInfo: {
    reportType: string
    reportTypeArabic: string
    generatedAt: Date
    generatedBy: string
  }
}

export interface PDFFooter {
  pageNumbers: boolean
  totalPages: boolean
  generatedAt: boolean
  companyName: boolean
  customText?: string
  customTextArabic?: string
}

export interface PDFMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  creator: string
  producer: string
  creationDate: Date
  modificationDate: Date
  language: 'ar' | 'en'
}

export interface PDFContentStyling {
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold'
  color?: string
  backgroundColor?: string
  padding?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  alignment?: 'left' | 'center' | 'right' | 'justify'
  direction?: 'ltr' | 'rtl'
}

// ===============================
// خدمة تصدير PDF الرئيسية
// ===============================

/**
 * خدمة تصدير التقارير بصيغة PDF - نمط Singleton
 */
export class PDFExportService {
  private static instance: PDFExportService

  private constructor() {
    this.initializePDFService()
  }

  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService()
    }
    return PDFExportService.instance
  }

  private initializePDFService(): void {
    console.log('📄 تم تهيئة خدمة تصدير PDF اليمنية المتقدمة')
  }

  // ===============================
  // إنتاج PDF للتقارير
  // ===============================

  /**
   * تصدير تقرير إلى PDF
   */
  async exportReportToPDF(report: Report, settings?: PDFExportSettings): Promise<{
    success: boolean
    pdfUrl?: string
    pdfBuffer?: Buffer
    error?: string
  }> {
    try {
      console.log(`📄 بدء تصدير التقرير: ${report.titleArabic || report.title}`)
      
      // إعداد التكوين الافتراضي
      const pdfSettings = this.getDefaultPDFSettings(settings)
      
      // إنشاء وثيقة PDF
      const pdfDocument = await this.createPDFDocument(report, pdfSettings)
      
      // توليد محتوى PDF
      await this.generatePDFContent(pdfDocument, report)
      
      // تطبيق التصميم والتنسيق
      await this.applyPDFStyling(pdfDocument)
      
      // إنتاج ملف PDF النهائي
      const result = await this.generatePDFFile(pdfDocument)
      
      console.log(`✅ تم تصدير PDF بنجاح: ${result.pdfUrl}`)
      
      return {
        success: true,
        pdfUrl: result.pdfUrl,
        pdfBuffer: result.buffer
      }
      
    } catch (error) {
      console.error('❌ خطأ في تصدير PDF:', error)
      return {
        success: false,
        error: 'فشل في تصدير التقرير إلى PDF'
      }
    }
  }

  /**
   * تصدير عدة تقارير إلى PDF واحد
   */
  async exportMultipleReportsToPDF(reports: Report[], settings?: PDFExportSettings): Promise<{
    success: boolean
    pdfUrl?: string
    error?: string
  }> {
    try {
      console.log(`📄 بدء تصدير ${reports.length} تقرير في ملف PDF واحد`)
      
      const pdfSettings = this.getDefaultPDFSettings(settings)
      
      // إنشاء وثيقة PDF موحدة
      const combinedDocument = await this.createCombinedPDFDocument(reports, pdfSettings)
      
      // توليد المحتوى لكل تقرير
      for (const report of reports) {
        await this.addReportToPDF(combinedDocument, report)
      }
      
      // إنتاج الملف النهائي
      const result = await this.generatePDFFile(combinedDocument)
      
      console.log(`✅ تم تصدير PDF المجمع بنجاح: ${result.pdfUrl}`)
      
      return {
        success: true,
        pdfUrl: result.pdfUrl
      }
      
    } catch (error) {
      console.error('❌ خطأ في تصدير PDF المجمع:', error)
      return {
        success: false,
        error: 'فشل في تصدير التقارير المجمعة'
      }
    }
  }

  // ===============================
  // إعداد وثيقة PDF
  // ===============================

  private async createPDFDocument(report: Report, settings: PDFExportSettings): Promise<PDFDocument> {
    return {
      id: this.generatePDFId(),
      title: report.title,
      titleArabic: report.titleArabic || report.title,
      generatedAt: new Date(),
      pages: [],
      settings,
      metadata: {
        title: report.titleArabic || report.title,
        author: 'لاند سبايس - Land Spice',
        subject: 'تقرير مالي وتشغيلي',
        keywords: ['تقرير', 'لاند سبايس', 'مطاعم', 'يمن'],
        creator: 'Land Spice Management System',
        producer: 'Land Spice PDF Generator v1.0',
        creationDate: new Date(),
        modificationDate: new Date(),
        language: 'ar'
      }
    }
  }

  private async createCombinedPDFDocument(reports: Report[], settings: PDFExportSettings): Promise<PDFDocument> {
    return {
      id: this.generatePDFId(),
      title: 'مجموعة التقارير الشاملة',
      titleArabic: 'مجموعة التقارير الشاملة - لاند سبايس',
      generatedAt: new Date(),
      pages: [],
      settings,
      metadata: {
        title: 'مجموعة التقارير الشاملة - لاند سبايس',
        author: 'لاند سبايس - Land Spice',
        subject: 'مجموعة تقارير مالية وتشغيلية شاملة',
        keywords: ['تقارير', 'لاند سبايس', 'مطاعم', 'يمن', 'شامل'],
        creator: 'Land Spice Management System',
        producer: 'Land Spice PDF Generator v1.0',
        creationDate: new Date(),
        modificationDate: new Date(),
        language: 'ar'
      }
    }
  }

  // ===============================
  // توليد محتوى PDF
  // ===============================

  private async generatePDFContent(pdfDocument: PDFDocument, report: Report): Promise<void> {
    // إنشاء صفحة العنوان
    await this.createTitlePage(pdfDocument, report)
    
    // إنشاء صفحة الملخص التنفيذي
    await this.createExecutiveSummary(pdfDocument, report)
    
    // إنشاء صفحات البيانات التفصيلية
    await this.createDataPages(pdfDocument, report)
    
    // إنشاء صفحات الرسوم البيانية
    if (report.data.charts && report.data.charts.length > 0) {
      await this.createChartPages(pdfDocument, report.data.charts)
    }
    
    // إنشاء صفحة التوصيات والخاتمة
    await this.createRecommendationsPage(pdfDocument, report)
  }

  private async createTitlePage(pdfDocument: PDFDocument, report: Report): Promise<void> {
    const titlePage: PDFPage = {
      pageNumber: 1,
      content: [
        {
          type: 'image',
          data: {
            url: '/assets/landspice-logo.png',
            width: 200,
            height: 100,
            alt: 'شعار لاند سبايس'
          },
          position: { x: 50, y: 50 },
          styling: { alignment: 'center' }
        },
        {
          type: 'text',
          data: {
            content: pdfDocument.titleArabic,
            level: 1
          },
          styling: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1f2937',
            alignment: 'center',
            direction: 'rtl',
            margin: { top: 50, bottom: 30, left: 0, right: 0 }
          }
        },
        {
          type: 'text',
          data: {
            content: `تقرير شامل لأداء منصة لاند سبايس`,
            level: 2
          },
          styling: {
            fontSize: 18,
            color: '#6b7280',
            alignment: 'center',
            direction: 'rtl',
            margin: { top: 20, bottom: 40, left: 0, right: 0 }
          }
        },
        {
          type: 'divider',
          data: { style: 'solid', color: '#e5e7eb', thickness: 2 }
        },
        {
          type: 'text',
          data: {
            content: `تاريخ الإنتاج: ${new Date().toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`
          },
          styling: {
            fontSize: 14,
            color: '#4b5563',
            alignment: 'center',
            direction: 'rtl',
            margin: { top: 30, bottom: 0, left: 0, right: 0 }
          }
        }
      ],
      header: this.createStandardHeader(report),
      footer: this.createStandardFooter()
    }
    
    pdfDocument.pages.push(titlePage)
  }

  private async createExecutiveSummary(pdfDocument: PDFDocument, report: Report): Promise<void> {
    const summaryPage: PDFPage = {
      pageNumber: 2,
      content: [
        {
          type: 'text',
          data: {
            content: 'الملخص التنفيذي',
            level: 1
          },
          styling: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            direction: 'rtl',
            margin: { top: 0, bottom: 30, left: 0, right: 0 }
          }
        }
      ],
      header: this.createStandardHeader(report),
      footer: this.createStandardFooter()
    }

    // إضافة المؤشرات الرئيسية
    if (report.summary.keyMetrics) {
      Object.entries(report.summary.keyMetrics).forEach(([key, metric], index) => {
        summaryPage.content.push({
          type: 'text',
          data: {
            content: `${key}: ${this.formatMetricValue(metric.value, metric.unit || '')}`
          },
          styling: {
            fontSize: 16,
            color: metric.status === 'good' ? '#10b981' : 
                   metric.status === 'warning' ? '#f59e0b' : '#ef4444',
            direction: 'rtl',
            margin: { top: 10, bottom: 10, left: 0, right: 20 }
          }
        })
      })
    }

    // إضافة الرؤى
    if (report.insights && report.insights.length > 0) {
      summaryPage.content.push({
        type: 'text',
        data: {
          content: 'الرؤى الرئيسية:',
          level: 2
        },
        styling: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#374151',
          direction: 'rtl',
          margin: { top: 30, bottom: 20, left: 0, right: 0 }
        }
      })

      report.insights.slice(0, 3).forEach((insight, index) => {
        summaryPage.content.push({
          type: 'text',
          data: {
            content: `• ${insight.titleArabic || insight.title}`
          },
          styling: {
            fontSize: 14,
            color: '#4b5563',
            direction: 'rtl',
            margin: { top: 8, bottom: 8, left: 0, right: 20 }
          }
        })
      })
    }

    pdfDocument.pages.push(summaryPage)
  }

  private async createDataPages(pdfDocument: PDFDocument, report: Report): Promise<void> {
    if (!report.data.rows || report.data.rows.length === 0) return

    const dataPage: PDFPage = {
      pageNumber: pdfDocument.pages.length + 1,
      content: [
        {
          type: 'text',
          data: {
            content: 'البيانات التفصيلية',
            level: 1
          },
          styling: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            direction: 'rtl',
            margin: { top: 0, bottom: 30, left: 0, right: 0 }
          }
        },
        {
          type: 'table',
          data: {
            headers: report.data.headers.map(header => ({
              key: header.key,
              label: header.labelArabic || header.label,
              alignment: header.alignment,
              width: header.width
            })),
            rows: report.data.rows.slice(0, 20).map(row => ({
              id: row.id,
              values: row.values,
              styling: this.getRowStyling(row.metadata?.highlight)
            }))
          },
          styling: {
            direction: 'rtl',
            fontSize: 12,
            margin: { top: 20, bottom: 20, left: 0, right: 0 }
          }
        }
      ],
      header: this.createStandardHeader(report),
      footer: this.createStandardFooter()
    }

    pdfDocument.pages.push(dataPage)
  }

  private async createChartPages(pdfDocument: PDFDocument, charts: ChartData[]): Promise<void> {
    for (const chart of charts) {
      const chartPage: PDFPage = {
        pageNumber: pdfDocument.pages.length + 1,
        content: [
          {
            type: 'text',
            data: {
              content: chart.titleArabic || chart.title,
              level: 1
            },
            styling: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1f2937',
              direction: 'rtl',
              alignment: 'center',
              margin: { top: 0, bottom: 30, left: 0, right: 0 }
            }
          },
          {
            type: 'chart',
            data: {
              type: chart.type,
              datasets: chart.datasets,
              labels: chart.labelsArabic || chart.labels,
              options: chart.options,
              width: 500,
              height: 300
            },
            position: { x: 50, y: 100 },
            styling: {
              alignment: 'center',
              margin: { top: 20, bottom: 20, left: 0, right: 0 }
            }
          }
        ],
        header: this.createStandardHeader(),
        footer: this.createStandardFooter()
      }

      pdfDocument.pages.push(chartPage)
    }
  }

  private async createRecommendationsPage(pdfDocument: PDFDocument, report: Report): Promise<void> {
    if (!report.recommendations || report.recommendations.length === 0) return

    const recommendationsPage: PDFPage = {
      pageNumber: pdfDocument.pages.length + 1,
      content: [
        {
          type: 'text',
          data: {
            content: 'التوصيات والخطوات التالية',
            level: 1
          },
          styling: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            direction: 'rtl',
            margin: { top: 0, bottom: 30, left: 0, right: 0 }
          }
        }
      ],
      header: this.createStandardHeader(report),
      footer: this.createStandardFooter()
    }

    report.recommendations.forEach((recommendation, index) => {
      recommendationsPage.content.push({
        type: 'text',
        data: {
          content: `${index + 1}. ${recommendation}`
        },
        styling: {
          fontSize: 14,
          color: '#374151',
          direction: 'rtl',
          margin: { top: 12, bottom: 12, left: 0, right: 20 }
        }
      })
    })

    pdfDocument.pages.push(recommendationsPage)
  }

  // ===============================
  // إنشاء رأس وتذييل الصفحة
  // ===============================

  private createStandardHeader(report?: Report): PDFHeader {
    return {
      logo: {
        url: '/assets/landspice-logo.png',
        width: 80,
        height: 40,
        position: 'right'
      },
      title: report?.titleArabic || 'تقرير لاند سبايس',
      companyInfo: {
        name: 'Land Spice',
        nameArabic: 'لاند سبايس',
        address: 'صنعاء - اليمن',
        addressArabic: 'صنعاء - اليمن',
        phone: '+967-1-123456',
        email: 'info@landspice.com',
        website: 'www.landspice.com'
      },
      reportInfo: {
        reportType: report?.templateId || 'general',
        reportTypeArabic: 'تقرير عام',
        generatedAt: new Date(),
        generatedBy: 'نظام لاند سبايس'
      }
    }
  }

  private createStandardFooter(): PDFFooter {
    return {
      pageNumbers: true,
      totalPages: true,
      generatedAt: true,
      companyName: true,
      customTextArabic: 'تم إنتاج هذا التقرير بواسطة نظام إدارة لاند سبايس'
    }
  }

  // ===============================
  // دوال المساعدة
  // ===============================

  private getDefaultPDFSettings(customSettings?: PDFExportSettings): PDFExportSettings {
    return {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      },
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeTableOfContents: false,
      allowPrinting: true,
      allowCopying: true,
      allowModification: false,
      imageQuality: 'high',
      compressImages: true,
      watermark: {
        text: 'لاند سبايس',
        opacity: 0.1,
        rotation: 45,
        color: '#6b7280'
      },
      ...customSettings
    }
  }

  private formatMetricValue(value: any, unit: string): string {
    if (typeof value === 'number') {
      if (unit === 'YER' || unit === 'ريال يمني') {
        return `${value.toLocaleString('ar-EG')} ر.ي`
      } else if (unit === '%') {
        return `${value.toFixed(1)}%`
      } else {
        return value.toLocaleString('ar-EG')
      }
    }
    return String(value)
  }

  private getRowStyling(highlight?: string): any {
    const styles = {
      success: { backgroundColor: '#f0fdf4', color: '#166534' },
      warning: { backgroundColor: '#fffbeb', color: '#92400e' },
      error: { backgroundColor: '#fef2f2', color: '#991b1b' },
      info: { backgroundColor: '#eff6ff', color: '#1e40af' }
    }
    
    return highlight ? styles[highlight as keyof typeof styles] : {}
  }

  private async addReportToPDF(pdfDocument: PDFDocument, report: Report): Promise<void> {
    const startingPageNumber = pdfDocument.pages.length + 1
    
    // إضافة فاصل بين التقارير
    if (pdfDocument.pages.length > 0) {
      const separatorPage: PDFPage = {
        pageNumber: startingPageNumber,
        content: [
          {
            type: 'divider',
            data: { style: 'double', color: '#374151', thickness: 3 }
          },
          {
            type: 'spacer',
            data: { height: 50 }
          }
        ],
        header: this.createStandardHeader(),
        footer: this.createStandardFooter()
      }
      pdfDocument.pages.push(separatorPage)
    }
    
    // إضافة محتوى التقرير
    await this.generatePDFContent(pdfDocument, report)
  }

  private async applyPDFStyling(pdfDocument: PDFDocument): Promise<void> {
    // تطبيق التصميم الموحد على جميع الصفحات
    pdfDocument.pages.forEach((page, index) => {
      // تحديث رقم الصفحة
      page.pageNumber = index + 1
      
      // تطبيق التنسيق العربي
      page.content.forEach(content => {
        if (content.type === 'text' || content.type === 'table') {
          content.styling = {
            ...content.styling,
            fontFamily: 'Cairo',
            direction: 'rtl'
          }
        }
      })
    })
  }

  private async generatePDFFile(pdfDocument: PDFDocument): Promise<{
    pdfUrl: string
    buffer: Buffer
  }> {
    // محاكاة إنتاج ملف PDF
    const fileName = `report_${pdfDocument.id}_${Date.now()}.pdf`
    const pdfUrl = `/reports/exports/${fileName}`
    
    // في التطبيق الحقيقي، سيتم استخدام مكتبة مثل jsPDF أو Puppeteer
    const mockBuffer = Buffer.from('PDF Content Placeholder', 'utf-8')
    
    console.log(`📄 تم إنتاج ملف PDF: ${fileName}`)
    
    return {
      pdfUrl,
      buffer: mockBuffer
    }
  }

  private generatePDFId(): string {
    return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export default PDFExportService.getInstance()
