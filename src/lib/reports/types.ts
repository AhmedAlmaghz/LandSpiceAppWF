/**
 * أنواع البيانات لنظام التقارير والإحصائيات اليمني المتقدم
 * نظام إدارة لاند سبايس - الوحدة الثانية عشرة (الأخيرة)
 * 
 * نظام شامل لإنتاج التقارير المالية والتشغيلية مع مراعاة 
 * الخصوصيات اليمنية والمعايير المحاسبية المحلية
 */

import { CurrencyCode } from '../financial/types'
import { YemeniBank } from '../installments/types'

// ===============================
// أساسيات نظام التقارير اليمني
// ===============================

/**
 * أنواع التقارير في النظام
 */
export type ReportType = 
  | 'financial'        // التقارير المالية
  | 'operational'      // التقارير التشغيلية
  | 'strategic'        // التقارير الاستراتيجية
  | 'compliance'       // تقارير الامتثال
  | 'custom'           // تقارير مخصصة

/**
 * تصنيفات التقارير المالية
 */
export type FinancialReportCategory =
  | 'revenue'          // تقارير الإيرادات
  | 'payments'         // تقارير المدفوعات
  | 'installments'     // تقارير الأقساط
  | 'profitability'    // تقارير الربحية
  | 'cash_flow'        // تقارير التدفق النقدي
  | 'collections'      // تقارير التحصيل
  | 'banking'          // التقارير البنكية

/**
 * تصنيفات التقارير التشغيلية
 */
export type OperationalReportCategory =
  | 'production'       // تقارير الإنتاج
  | 'inventory'        // تقارير المخزون
  | 'suppliers'        // تقارير الموردين
  | 'contracts'        // تقارير العقود
  | 'efficiency'       // تقارير الكفاءة
  | 'quality'          // تقارير الجودة

/**
 * تنسيقات التصدير
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'xml'

/**
 * فترات التقارير
 */
export type ReportPeriod = 
  | 'daily'           // يومي
  | 'weekly'          // أسبوعي
  | 'monthly'         // شهري
  | 'quarterly'       // ربع سنوي
  | 'semi_annual'     // نصف سنوي
  | 'annual'          // سنوي
  | 'custom'          // مخصص

/**
 * حالات التقرير
 */
export type ReportStatus = 
  | 'draft'           // مسودة
  | 'generating'      // قيد الإنشاء
  | 'completed'       // مكتمل
  | 'failed'          // فشل
  | 'scheduled'       // مجدول
  | 'sent'            // تم الإرسال
  | 'archived'        // مؤرشف

// ===============================
// هيكل التقرير الأساسي
// ===============================

/**
 * قالب التقرير
 */
export interface ReportTemplate {
  id: string
  name: string
  nameArabic: string
  type: ReportType
  category: FinancialReportCategory | OperationalReportCategory
  description: string
  descriptionArabic: string
  
  // المعايير التقنية
  version: string
  isActive: boolean
  supportedFormats: ExportFormat[]
  defaultFormat: ExportFormat
  
  // المعايير الوظيفية
  requiredPermissions: string[]
  dataSourceTables: string[]
  refreshFrequency: ReportPeriod
  estimatedGenerationTime: number // بالثواني
  
  // المعايير اليمنية
  supportArabicRTL: boolean
  useHijriCalendar: boolean
  includeYemeniHolidays: boolean
  
  // معلومات الإنشاء
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastUsed?: Date
}

/**
 * تكوين التقرير
 */
export interface ReportConfig {
  templateId: string
  title: string
  titleArabic?: string
  
  // فترة التقرير
  dateRange: {
    startDate: Date
    endDate: Date
    period: ReportPeriod
    includeWeekends: boolean
    includeHolidays: boolean
  }
  
  // مرشحات البيانات
  filters: {
    restaurantIds?: string[]
    supplierIds?: string[]
    bankIds?: YemeniBank[]
    contractTypes?: string[]
    statusFilters?: string[]
    amountRange?: {
      min: number
      max: number
      currency: CurrencyCode
    }
    customFilters?: Record<string, any>
  }
  
  // تجميع البيانات
  groupBy?: string[]
  aggregations?: AggregationConfig[]
  sortBy?: SortConfig[]
  
  // التخصيص
  customizations?: {
    includeLogo: boolean
    includeSignature: boolean
    includeWatermark: boolean
    colorTheme: string
    fontSize: 'small' | 'medium' | 'large'
    language: 'ar' | 'en' | 'both'
  }
  
  // التوزيع
  distribution?: {
    emailList: string[]
    scheduleType: 'once' | 'recurring'
    scheduleFrequency?: ReportPeriod
    nextScheduledDate?: Date
  }
}

/**
 * تكوين التجميع
 */
export interface AggregationConfig {
  field: string
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median'
  alias?: string
  format?: 'currency' | 'percentage' | 'number' | 'date'
}

/**
 * تكوين الترتيب
 */
export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
  priority: number
}

// ===============================
// نتائج التقرير
// ===============================

/**
 * التقرير المكتمل
 */
export interface Report {
  id: string
  templateId: string
  config: ReportConfig
  
  // معلومات التقرير
  title: string
  titleArabic?: string
  generatedAt: Date
  generatedBy: string
  status: ReportStatus
  
  // البيانات
  data: ReportData
  summary: ReportSummary
  insights: ReportInsight[]
  recommendations: string[]
  
  // معلومات التوليد
  generationTime: number // milliseconds
  recordCount: number
  dataVersion: string
  
  // ملفات الإخراج
  exports: {
    [format in ExportFormat]?: {
      url: string
      size: number
      generatedAt: Date
      expiresAt: Date
    }
  }
  
  // معلومات التوزيع
  distributionHistory: DistributionRecord[]
}

/**
 * بيانات التقرير
 */
export interface ReportData {
  headers: ReportHeader[]
  rows: ReportRow[]
  charts?: ChartData[]
  tables?: TableData[]
  appendices?: AppendixData[]
}

/**
 * رأس التقرير
 */
export interface ReportHeader {
  key: string
  label: string
  labelArabic?: string
  dataType: 'string' | 'number' | 'date' | 'currency' | 'percentage'
  format?: string
  width?: number
  alignment: 'left' | 'center' | 'right'
  isVisible: boolean
  isSortable: boolean
}

/**
 * صف التقرير
 */
export interface ReportRow {
  id: string
  values: Record<string, any>
  metadata?: {
    highlight?: 'success' | 'warning' | 'error' | 'info'
    tooltip?: string
    clickable?: boolean
    drillDownData?: any
  }
}

/**
 * ملخص التقرير
 */
export interface ReportSummary {
  totalRecords: number
  keyMetrics: {
    [key: string]: {
      value: number
      previousValue?: number
      changePercentage?: number
      trend: 'up' | 'down' | 'stable'
      status: 'good' | 'warning' | 'critical'
      unit?: string
    }
  }
  periodComparisons?: {
    currentPeriod: string
    previousPeriod: string
    changes: Record<string, number>
  }
}

/**
 * رؤية التقرير
 */
export interface ReportInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'achievement'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  titleArabic?: string
  description: string
  descriptionArabic?: string
  impact: 'positive' | 'negative' | 'neutral'
  confidence: number // 0-100
  actionRequired: boolean
  relatedData?: any
}

/**
 * سجل التوزيع
 */
export interface DistributionRecord {
  id: string
  distributedAt: Date
  method: 'email' | 'download' | 'api' | 'scheduled'
  recipients: string[]
  status: 'sent' | 'failed' | 'pending'
  errorMessage?: string
  deliveryConfirmations?: {
    recipient: string
    deliveredAt?: Date
    openedAt?: Date
    downloadedAt?: Date
  }[]
}

// ===============================
// مؤشرات الأداء الرئيسية (KPIs)
// ===============================

/**
 * مؤشر الأداء الرئيسي
 */
export interface KPI {
  id: string
  name: string
  nameArabic: string
  category: 'financial' | 'operational' | 'quality' | 'growth'
  
  // القياس
  currentValue: number
  targetValue?: number
  previousValue?: number
  unit: string
  unitArabic?: string
  
  // التحليل
  trend: 'up' | 'down' | 'stable'
  changePercentage: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  
  // التفاصيل
  description: string
  descriptionArabic: string
  calculationMethod: string
  dataSource: string
  updateFrequency: ReportPeriod
  lastUpdated: Date
  
  // الإعدادات
  thresholds: {
    excellent: number
    good: number
    warning: number
    critical: number
  }
  
  // الرسم البياني
  chartConfig?: {
    type: ChartType
    timeRange: number // days
    showTrend: boolean
    showTarget: boolean
  }
}

/**
 * مجموعة مؤشرات الأداء
 */
export interface KPIDashboard {
  id: string
  title: string
  titleArabic: string
  description: string
  
  // المؤشرات
  kpis: KPI[]
  layout: DashboardLayout
  
  // الإعدادات
  refreshInterval: number // minutes
  autoRefresh: boolean
  requiredPermissions: string[]
  
  // معلومات الوصول
  accessHistory: {
    userId: string
    accessedAt: Date
    ipAddress?: string
  }[]
  
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * تخطيط لوحة المعلومات
 */
export interface DashboardLayout {
  columns: number
  rows: number
  widgets: DashboardWidget[]
}

/**
 * عنصر لوحة المعلومات
 */
export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'text' | 'image'
  kpiId?: string
  
  // الموقع والحجم
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  
  // الإعدادات
  title?: string
  titleArabic?: string
  showHeader: boolean
  refreshEnabled: boolean
  
  // التصميم
  styling: {
    backgroundColor: string
    borderColor: string
    textColor: string
    fontSize: string
  }
}

// ===============================
// الرسوم البيانية
// ===============================

/**
 * أنواع الرسوم البيانية
 */
export type ChartType = 
  | 'line'            // خط
  | 'bar'             // عمود
  | 'column'          // شريط
  | 'pie'             // دائري
  | 'doughnut'        // كعكة
  | 'area'            // منطقة
  | 'scatter'         // نقاط متناثرة
  | 'bubble'          // فقاعات
  | 'radar'           // رادار
  | 'gauge'           // مقياس
  | 'heatmap'         // خريطة حرارية
  | 'treemap'         // خريطة شجرية
  | 'funnel'          // قمع
  | 'waterfall'       // شلال

/**
 * بيانات الرسم البياني
 */
export interface ChartData {
  type: ChartType
  title: string
  titleArabic?: string
  
  // البيانات
  datasets: ChartDataset[]
  labels: string[]
  labelsArabic?: string[]
  
  // الإعدادات
  options: ChartOptions
  styling: ChartStyling
  
  // التفاعل
  interactive: boolean
  drillDownEnabled: boolean
  exportEnabled: boolean
}

/**
 * مجموعة بيانات الرسم البياني
 */
export interface ChartDataset {
  label: string
  labelArabic?: string
  data: (number | { x: number; y: number })[]
  
  // التصميم
  backgroundColor: string | string[]
  borderColor: string | string[]
  borderWidth: number
  fill?: boolean
  
  // معلومات إضافية
  metadata?: {
    unit?: string
    format?: string
    tooltip?: string
  }
}

/**
 * خيارات الرسم البياني
 */
export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  
  // المحاور
  scales?: {
    x?: AxisConfig
    y?: AxisConfig
  }
  
  // الأسطورة
  legend?: {
    display: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
    align: 'start' | 'center' | 'end'
    rtl: boolean
  }
  
  // التفاعل
  interaction?: {
    intersect: boolean
    mode: 'point' | 'nearest' | 'index' | 'dataset'
  }
  
  // الرسوم المتحركة
  animation?: {
    duration: number
    easing: string
  }
}

/**
 * تكوين المحور
 */
export interface AxisConfig {
  display: boolean
  title: {
    display: boolean
    text: string
    textArabic?: string
  }
  grid: {
    display: boolean
    color: string
  }
  ticks: {
    display: boolean
    format?: string
  }
}

/**
 * تصميم الرسم البياني
 */
export interface ChartStyling {
  colorScheme: 'default' | 'yemeni' | 'professional' | 'modern' | 'custom'
  customColors?: string[]
  
  // الخطوط
  fonts: {
    family: string
    size: number
    weight: 'normal' | 'bold'
    color: string
  }
  
  // المساحات
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// ===============================
// الجداول والبيانات
// ===============================

/**
 * بيانات الجدول
 */
export interface TableData {
  title: string
  titleArabic?: string
  
  // الهيكل
  columns: TableColumn[]
  rows: TableRow[]
  
  // الإعدادات
  pagination?: {
    enabled: boolean
    pageSize: number
    currentPage: number
    totalPages: number
  }
  
  sorting?: {
    enabled: boolean
    defaultSort?: {
      column: string
      direction: 'asc' | 'desc'
    }
  }
  
  filtering?: {
    enabled: boolean
    searchEnabled: boolean
    columnFilters: boolean
  }
  
  // التصميم
  styling: TableStyling
}

/**
 * عمود الجدول
 */
export interface TableColumn {
  key: string
  label: string
  labelArabic?: string
  dataType: 'text' | 'number' | 'currency' | 'date' | 'percentage' | 'boolean'
  
  // العرض
  width?: number
  alignment: 'left' | 'center' | 'right'
  visible: boolean
  
  // الوظائف
  sortable: boolean
  filterable: boolean
  searchable: boolean
  
  // التنسيق
  format?: string
  prefix?: string
  suffix?: string
}

/**
 * صف الجدول
 */
export interface TableRow {
  id: string
  values: Record<string, any>
  
  // التصميم
  styling?: {
    backgroundColor?: string
    textColor?: string
    fontWeight?: 'normal' | 'bold'
    highlight?: 'success' | 'warning' | 'error' | 'info'
  }
  
  // التفاعل
  clickable?: boolean
  expandable?: boolean
  expandedContent?: any
}

/**
 * تصميم الجدول
 */
export interface TableStyling {
  // الحدود
  borders: {
    enabled: boolean
    color: string
    width: number
  }
  
  // الألوان
  colors: {
    headerBackground: string
    headerText: string
    rowBackground: string
    alternateRowBackground: string
    textColor: string
  }
  
  // الخطوط
  fonts: {
    headerSize: number
    rowSize: number
    family: string
  }
  
  // المساحات
  padding: {
    horizontal: number
    vertical: number
  }
}

// ===============================
// الملاحق والمرفقات
// ===============================

/**
 * ملحق التقرير
 */
export interface AppendixData {
  id: string
  title: string
  titleArabic?: string
  type: 'methodology' | 'data_sources' | 'glossary' | 'references' | 'raw_data'
  
  content: {
    text?: string
    textArabic?: string
    tables?: TableData[]
    charts?: ChartData[]
    files?: AttachedFile[]
  }
  
  order: number
  includeInExport: boolean
}

/**
 * ملف مرفق
 */
export interface AttachedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// ===============================
// الجدولة والأتمتة
// ===============================

/**
 * جدول التقارير
 */
export interface ReportSchedule {
  id: string
  templateId: string
  config: ReportConfig
  
  // الجدولة
  frequency: ReportPeriod
  startDate: Date
  endDate?: Date
  nextRunDate: Date
  
  // الإعدادات
  isActive: boolean
  timezone: string
  
  // التوزيع التلقائي
  autoDistribute: boolean
  distributionList: string[]
  distributionTemplate: string
  
  // السجلات
  executionHistory: ScheduleExecution[]
  
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * تنفيذ الجدولة
 */
export interface ScheduleExecution {
  id: string
  scheduleId: string
  
  // التوقيت
  scheduledAt: Date
  startedAt: Date
  completedAt?: Date
  
  // النتيجة
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled'
  reportId?: string
  errorMessage?: string
  
  // الإحصائيات
  executionTime: number
  recordsProcessed: number
  memoryUsed: number
}

// ===============================
// المعايير اليمنية المتخصصة
// ===============================

/**
 * إعدادات التقويم اليمني
 */
export interface YemeniCalendarSettings {
  useHijriDates: boolean
  showBothCalendars: boolean
  hijriDateFormat: string
  
  // العطل والمناسبات
  includeReligiousHolidays: boolean
  includeNationalHolidays: boolean
  customHolidays: YemeniHoliday[]
  
  // أوقات العمل
  workingDays: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[]
  workingHours: {
    start: string // HH:mm
    end: string   // HH:mm
    breakStart?: string
    breakEnd?: string
  }
}

/**
 * المناسبة اليمنية
 */
export interface YemeniHoliday {
  id: string
  name: string
  nameArabic: string
  type: 'religious' | 'national' | 'cultural'
  isRecurring: boolean
  
  // التوقيت
  date?: Date // للمناسبات الثابتة
  hijriDate?: string // للمناسبات الهجرية
  duration: number // بالأيام
  
  // التأثير على الأعمال
  affectsBusinessHours: boolean
  businessImpact: 'no_work' | 'reduced_hours' | 'normal'
  
  description?: string
  descriptionArabic?: string
}

/**
 * إعدادات العملة اليمنية
 */
export interface YemeniCurrencySettings {
  primaryCurrency: CurrencyCode
  showCurrencySymbol: boolean
  currencyPosition: 'before' | 'after'
  
  // التنسيق
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
  numberFormat: 'arabic' | 'english' | 'both'
  
  // أسعار الصرف
  exchangeRates?: {
    [currency: string]: {
      rate: number
      lastUpdated: Date
      source: string
    }
  }
}

// ===============================
// إعدادات التصدير المتقدمة
// ===============================

/**
 * إعدادات تصدير PDF
 */
export interface PDFExportSettings {
  // الصفحة
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  
  // المحتوى
  includeHeader: boolean
  includeFooter: boolean
  includePageNumbers: boolean
  includeTableOfContents: boolean
  
  // الأمان
  password?: string
  allowPrinting: boolean
  allowCopying: boolean
  allowModification: boolean
  
  // الجودة
  imageQuality: 'low' | 'medium' | 'high'
  compressImages: boolean
  
  // العلامة المائية
  watermark?: {
    text: string
    opacity: number
    rotation: number
    color: string
  }
}

/**
 * إعدادات تصدير Excel
 */
export interface ExcelExportSettings {
  // الأوراق
  createSeparateSheets: boolean
  sheetNames: string[]
  
  // التنسيق
  includeFormulas: boolean
  includeCharts: boolean
  freezeHeaders: boolean
  autoFitColumns: boolean
  
  // الحماية
  protectWorkbook: boolean
  protectSheets: boolean
  password?: string
  
  // البيانات
  includeRawData: boolean
  includeFormattedData: boolean
  dateFormat: string
  numberFormat: string
}

// ===============================
// تصدير النماذج
// ===============================

export default {
  // Types
  ReportType,
  FinancialReportCategory,
  OperationalReportCategory,
  ExportFormat,
  ReportPeriod,
  ReportStatus,
  
  // Interfaces
  ReportTemplate,
  ReportConfig,
  Report,
  ReportData,
  KPI,
  KPIDashboard,
  ChartData,
  TableData,
  
  // Yemeni Specific
  YemeniCalendarSettings,
  YemeniHoliday,
  YemeniCurrencySettings,
  
  // Export Settings
  PDFExportSettings,
  ExcelExportSettings
}
