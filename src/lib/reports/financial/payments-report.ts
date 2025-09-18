/**
 * خدمة تقرير المدفوعات والمتأخرات اليمنية
 * نظام إدارة لاند سبايس - الوحدة الثانية عشرة (الأخيرة)
 */

import { ReportConfig, Report, ChartData, KPI } from '../types'

export interface PaymentAnalysis {
  totalPaid: number
  totalDue: number
  totalOverdue: number
  collectionRate: number
  
  paymentsByMethod: {
    bankTransfer: number
    cash: number
    check: number
    installments: number
    other: number
  }
  
  paymentsByStatus: {
    paid: number
    partiallyPaid: number
    overdue: number
    pending: number
    disputed: number
  }
  
  overdueAnalysis: {
    lessThan30Days: number
    days30To60: number
    days60To90: number
    moreThan90Days: number
  }
}

export interface PaymentKPI {
  totalCollected: KPI
  collectionEfficiency: KPI
  averageDaysToPayment: KPI
  overduePercentage: KPI
}

export interface PaymentAlert {
  type: 'high_overdue' | 'payment_pattern' | 'collection_issue' | 'cash_flow_risk'
  severity: 'low' | 'medium' | 'high' | 'critical'
  restaurantId?: string
  restaurantName?: string
  amount: number
  daysPastDue?: number
  message: string
  messageArabic: string
  recommendedAction: string
  recommendedActionArabic: string
  culturalConsideration?: string
}

export interface CollectionStrategy {
  priority: 'high' | 'medium' | 'low'
  restaurantId: string
  restaurantName: string
  amountDue: number
  daysPastDue: number
  suggestedApproach: 'gentle_reminder' | 'formal_notice' | 'personal_visit' | 'family_mediation' | 'legal_action'
  culturalNotes: string
  expectedSuccess: number
  estimatedTimeFrame: string
}

export interface PaymentReport extends Report {
  analysis: PaymentAnalysis
  kpis: PaymentKPI
  alerts: PaymentAlert[]
  collectionStrategy: CollectionStrategy[]
}

export class PaymentsReportService {
  constructor() {
    console.log('💳 تم تهيئة خدمة تقارير المدفوعات والتحصيل اليمنية')
  }

  async generatePaymentsReport(config: ReportConfig): Promise<PaymentReport> {
    const startTime = Date.now()

    const report: PaymentReport = {
      id: this.generateReportId(),
      templateId: config.templateId,
      config,
      title: config.title || 'تقرير المدفوعات والمتأخرات',
      titleArabic: config.titleArabic || 'تقرير المدفوعات والمتأخرات',
      generatedAt: new Date(),
      generatedBy: 'payments-service',
      status: 'completed',
      data: { headers: [], rows: [] },
      summary: { totalRecords: 0, keyMetrics: {} },
      insights: [],
      recommendations: [],
      generationTime: 0,
      recordCount: 0,
      dataVersion: '1.0',
      exports: {},
      distributionHistory: [],
      
      analysis: await this.generatePaymentAnalysis(config),
      kpis: await this.calculatePaymentKPIs(config),
      alerts: await this.generatePaymentAlerts(config),
      collectionStrategy: await this.generateCollectionStrategy(config)
    }

    await this.generateReportData(report)
    await this.generateCharts(report)
    await this.generateSummaryAndInsights(report)

    report.generationTime = Date.now() - startTime
    report.recordCount = report.data.rows.length

    return report
  }

  private async generatePaymentAnalysis(config: ReportConfig): Promise<PaymentAnalysis> {
    const totalDue = 18750000
    const totalPaid = 14200000
    const totalOverdue = 4550000
    
    return {
      totalPaid,
      totalDue,
      totalOverdue,
      collectionRate: (totalPaid / totalDue) * 100,
      
      paymentsByMethod: {
        bankTransfer: 8520000,    // 60%
        cash: 3550000,            // 25%
        check: 1420000,           // 10%
        installments: 568000,     // 4%
        other: 142000             // 1%
      },
      
      paymentsByStatus: {
        paid: 9375000,            // 50%
        partiallyPaid: 4687500,   // 25%
        overdue: 3750000,         // 20%
        pending: 750000,          // 4%
        disputed: 187500          // 1%
      },
      
      overdueAnalysis: {
        lessThan30Days: 2275000,  // 50%
        days30To60: 1365000,      // 30%
        days60To90: 682500,       // 15%
        moreThan90Days: 227500    // 5%
      }
    }
  }

  private async calculatePaymentKPIs(config: ReportConfig): Promise<PaymentKPI> {
    const analysis = await this.generatePaymentAnalysis(config)
    
    return {
      totalCollected: {
        id: 'total_collected',
        name: 'Total Collected',
        nameArabic: 'إجمالي المحصل',
        category: 'financial',
        currentValue: analysis.totalPaid,
        previousValue: 12800000,
        unit: 'YER',
        unitArabic: 'ريال يمني',
        trend: 'up',
        changePercentage: ((analysis.totalPaid - 12800000) / 12800000) * 100,
        status: 'good',
        description: 'Total amount collected from customers',
        descriptionArabic: 'إجمالي المبلغ المحصل من العملاء',
        calculationMethod: 'Sum of all collected payments',
        dataSource: 'payment_transactions',
        updateFrequency: 'daily',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 16000000,
          good: 14000000,
          warning: 12000000,
          critical: 10000000
        }
      },
      
      collectionEfficiency: {
        id: 'collection_efficiency',
        name: 'Collection Efficiency',
        nameArabic: 'كفاءة التحصيل',
        category: 'operational',
        currentValue: analysis.collectionRate,
        previousValue: 74.2,
        unit: '%',
        unitArabic: '%',
        trend: analysis.collectionRate > 74.2 ? 'up' : 'down',
        changePercentage: analysis.collectionRate - 74.2,
        status: analysis.collectionRate > 80 ? 'excellent' : 'good',
        description: 'Percentage of total dues collected',
        descriptionArabic: 'نسبة المستحقات المحصلة',
        calculationMethod: '(Total Paid / Total Due) * 100',
        dataSource: 'payment_analysis',
        updateFrequency: 'daily',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 85,
          good: 75,
          warning: 65,
          critical: 55
        }
      },
      
      averageDaysToPayment: {
        id: 'avg_days_payment',
        name: 'Average Days to Payment',
        nameArabic: 'متوسط أيام السداد',
        category: 'operational',
        currentValue: 28.5,
        previousValue: 32.1,
        unit: 'days',
        unitArabic: 'يوم',
        trend: 'down',
        changePercentage: -11.2,
        status: 'good',
        description: 'Average time from invoice to payment',
        descriptionArabic: 'متوسط الوقت من الفاتورة للسداد',
        calculationMethod: 'Average of payment delays',
        dataSource: 'payment_timing',
        updateFrequency: 'weekly',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 20,
          good: 30,
          warning: 45,
          critical: 60
        }
      },
      
      overduePercentage: {
        id: 'overdue_percentage',
        name: 'Overdue Percentage',
        nameArabic: 'نسبة المتأخرات',
        category: 'quality',
        currentValue: (analysis.totalOverdue / analysis.totalDue) * 100,
        previousValue: 26.8,
        unit: '%',
        unitArabic: '%',
        trend: 'down',
        changePercentage: -2.5,
        status: 'good',
        description: 'Percentage of overdue payments',
        descriptionArabic: 'نسبة المدفوعات المتأخرة',
        calculationMethod: '(Total Overdue / Total Due) * 100',
        dataSource: 'overdue_analysis',
        updateFrequency: 'daily',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 15,
          good: 25,
          warning: 35,
          critical: 45
        }
      }
    }
  }

  private async generatePaymentAlerts(config: ReportConfig): Promise<PaymentAlert[]> {
    return [
      {
        type: 'high_overdue',
        severity: 'critical',
        restaurantId: 'rest_001',
        restaurantName: 'مطعم الوادي السعيد',
        amount: 890000,
        daysPastDue: 95,
        message: 'Critical overdue payment: 95 days past due',
        messageArabic: 'مستحقات متأخرة حرجة: 95 يوم تأخير',
        recommendedAction: 'Escalate to legal action after family mediation',
        recommendedActionArabic: 'التصعيد للإجراءات القانونية بعد الوساطة العائلية',
        culturalConsideration: 'مراعاة الكرامة الشخصية والعلاقات الاجتماعية'
      },
      {
        type: 'cash_flow_risk',
        severity: 'high',
        amount: 4550000,
        message: 'High cash flow risk due to overdue amounts',
        messageArabic: 'مخاطر عالية في التدفق النقدي بسبب المتأخرات',
        recommendedAction: 'Implement aggressive collection strategy',
        recommendedActionArabic: 'تطبيق استراتيجية تحصيل مكثفة',
        culturalConsideration: 'التوازن بين الحزم والحفاظ على العلاقات'
      }
    ]
  }

  private async generateCollectionStrategy(config: ReportConfig): Promise<CollectionStrategy[]> {
    return [
      {
        priority: 'high',
        restaurantId: 'rest_001',
        restaurantName: 'مطعم الوادي السعيد',
        amountDue: 890000,
        daysPastDue: 95,
        suggestedApproach: 'family_mediation',
        culturalNotes: 'عائلة معروفة، يفضل التعامل عبر الأعيان',
        expectedSuccess: 75,
        estimatedTimeFrame: '2-3 أسابيع'
      },
      {
        priority: 'medium',
        restaurantId: 'rest_023',
        restaurantName: 'مطعم الأصالة الشامية',
        amountDue: 420000,
        daysPastDue: 45,
        suggestedApproach: 'formal_notice',
        culturalNotes: 'مطعم حديث، يحتاج تذكير رسمي مع مرونة',
        expectedSuccess: 90,
        estimatedTimeFrame: '1 أسبوع'
      }
    ]
  }

  private async generateReportData(report: PaymentReport): Promise<void> {
    const paymentData = [
      {
        id: '1',
        restaurantName: 'مطعم الأصالة اليمنية',
        totalDue: 850000,
        paidAmount: 680000,
        overdueAmount: 170000,
        daysPastDue: 15,
        status: 'partially_paid'
      },
      {
        id: '2',
        restaurantName: 'مطعم البركة للمأكولات الشعبية',
        totalDue: 1200000,
        paidAmount: 1200000,
        overdueAmount: 0,
        daysPastDue: 0,
        status: 'paid'
      },
      {
        id: '3',
        restaurantName: 'مطعم الوادي السعيد',
        totalDue: 890000,
        paidAmount: 0,
        overdueAmount: 890000,
        daysPastDue: 95,
        status: 'overdue'
      }
    ]

    report.data.headers = [
      { key: 'restaurantName', label: 'Restaurant', labelArabic: 'المطعم', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'totalDue', label: 'Total Due', labelArabic: 'المستحق', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'paidAmount', label: 'Paid', labelArabic: 'المدفوع', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'overdueAmount', label: 'Overdue', labelArabic: 'المتأخر', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'daysPastDue', label: 'Days Past Due', labelArabic: 'أيام التأخير', dataType: 'number', alignment: 'center', isVisible: true, isSortable: true },
      { key: 'status', label: 'Status', labelArabic: 'الحالة', dataType: 'string', alignment: 'center', isVisible: true, isSortable: true }
    ]

    report.data.rows = paymentData.map(item => ({
      id: item.id,
      values: item,
      metadata: {
        highlight: item.status === 'paid' ? 'success' : 
                  item.daysPastDue > 90 ? 'error' : 
                  item.daysPastDue > 30 ? 'warning' : undefined
      }
    }))
  }

  private async generateCharts(report: PaymentReport): Promise<void> {
    const { analysis } = report

    const paymentStatusChart: ChartData = {
      type: 'doughnut',
      title: 'Payment Status Distribution',
      titleArabic: 'توزيع حالة المدفوعات',
      datasets: [{
        label: 'Amount',
        labelArabic: 'المبلغ',
        data: [
          analysis.paymentsByStatus.paid,
          analysis.paymentsByStatus.partiallyPaid,
          analysis.paymentsByStatus.overdue,
          analysis.paymentsByStatus.pending
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
        borderColor: ['#059669', '#2563EB', '#DC2626', '#D97706'],
        borderWidth: 2
      }],
      labels: ['مدفوع', 'مدفوع جزئياً', 'متأخر', 'معلق'],
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
    }

    report.data.charts = [paymentStatusChart]
  }

  private async generateSummaryAndInsights(report: PaymentReport): Promise<void> {
    const { analysis, kpis } = report

    report.summary = {
      totalRecords: report.data.rows.length,
      keyMetrics: {
        totalCollected: {
          value: analysis.totalPaid,
          changePercentage: kpis.totalCollected.changePercentage,
          trend: 'up',
          status: 'good',
          unit: 'YER'
        },
        collectionRate: {
          value: analysis.collectionRate,
          changePercentage: kpis.collectionEfficiency.changePercentage,
          trend: 'up',
          status: 'good',
          unit: '%'
        }
      }
    }

    report.insights = [
      {
        type: 'trend',
        severity: 'medium',
        title: 'Improved Collection Efficiency',
        titleArabic: 'تحسن في كفاءة التحصيل',
        description: `Collection rate improved to ${analysis.collectionRate.toFixed(1)}%`,
        descriptionArabic: `تحسن معدل التحصيل إلى ${analysis.collectionRate.toFixed(1)}%`,
        impact: 'positive',
        confidence: 85,
        actionRequired: false
      },
      {
        type: 'risk',
        severity: 'high',
        title: 'High Overdue Concentration',
        titleArabic: 'تركز عالي في المتأخرات',
        description: 'Significant overdue amounts require immediate attention',
        descriptionArabic: 'مبالغ متأخرة كبيرة تحتاج اهتمام فوري',
        impact: 'negative',
        confidence: 90,
        actionRequired: true
      }
    ]

    report.recommendations = [
      'تكثيف جهود التحصيل للمبالغ المتأخرة أكثر من 60 يوم',
      'تطبيق استراتيجيات تحصيل مراعية للثقافة اليمنية',
      'تحسين شروط الدفع للعملاء الجدد',
      'إنشاء برنامج حوافز للسداد المبكر'
    ]
  }

  private generateReportId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `payments_${timestamp}_${random}`
  }
}

export default new PaymentsReportService()
