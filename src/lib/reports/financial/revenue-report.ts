/**
 * خدمة تقرير الإيرادات اليمنية المتخصصة
 * نظام إدارة لاند سبايس - الوحدة الثانية عشرة (الأخيرة)
 */

import { ReportConfig, Report, ChartData, KPI } from '../types'

export interface RevenueAnalysis {
  totalRevenue: number
  previousPeriodRevenue: number
  revenueGrowth: number
  
  revenueBySource: {
    directBills: number
    installments: number
    subscriptionFees: number
    serviceFees: number
    penalties: number
    other: number
  }
  
  revenueByRegion: {
    sanaa: number
    aden: number
    taiz: number
    hudaydah: number
    other: number
  }
  
  seasonalTrends: {
    ramadan: number
    eid: number
    summer: number
    winter: number
    regular: number
  }
}

export interface RevenueKPI {
  totalRevenue: KPI
  averageRevenuePerRestaurant: KPI
  revenueGrowthRate: KPI
  collectionEfficiency: KPI
}

export interface RevenueReport extends Report {
  analysis: RevenueAnalysis
  kpis: RevenueKPI
}

export class RevenueReportService {
  constructor() {
    console.log('💰 تم تهيئة خدمة تقارير الإيرادات اليمنية')
  }

  async generateMonthlyRevenueReport(config: ReportConfig): Promise<RevenueReport> {
    const startTime = Date.now()

    const report: RevenueReport = {
      id: this.generateReportId(),
      templateId: config.templateId,
      config,
      title: config.title || 'تقرير الإيرادات الشهرية',
      titleArabic: config.titleArabic || 'تقرير الإيرادات الشهرية',
      generatedAt: new Date(),
      generatedBy: 'revenue-service',
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
      
      analysis: await this.generateRevenueAnalysis(config),
      kpis: await this.calculateRevenueKPIs(config)
    }

    await this.generateReportData(report)
    await this.generateCharts(report)
    await this.generateSummaryAndInsights(report)

    report.generationTime = Date.now() - startTime
    report.recordCount = report.data.rows.length

    return report
  }

  private async generateRevenueAnalysis(config: ReportConfig): Promise<RevenueAnalysis> {
    const currentRevenue = 15750000
    const previousRevenue = 13200000
    
    return {
      totalRevenue: currentRevenue,
      previousPeriodRevenue: previousRevenue,
      revenueGrowth: ((currentRevenue - previousRevenue) / previousRevenue) * 100,
      
      revenueBySource: {
        directBills: 8500000,      // 54%
        installments: 4200000,     // 27%
        subscriptionFees: 1800000, // 11%
        serviceFees: 950000,       // 6%
        penalties: 200000,         // 1%
        other: 100000              // 1%
      },
      
      revenueByRegion: {
        sanaa: 6300000,           // 40%
        aden: 3465000,            // 22%
        taiz: 2362500,            // 15%
        hudaydah: 1890000,        // 12%
        other: 1732500            // 11%
      },
      
      seasonalTrends: {
        ramadan: 4725000,         // 30%
        eid: 1575000,             // 10%
        summer: 3937500,          // 25%
        winter: 3150000,          // 20%
        regular: 2362500          // 15%
      }
    }
  }

  private async calculateRevenueKPIs(config: ReportConfig): Promise<RevenueKPI> {
    const analysis = await this.generateRevenueAnalysis(config)
    const totalRestaurants = 124
    
    return {
      totalRevenue: {
        id: 'total_revenue',
        name: 'Total Revenue',
        nameArabic: 'إجمالي الإيرادات',
        category: 'financial',
        currentValue: analysis.totalRevenue,
        previousValue: analysis.previousPeriodRevenue,
        unit: 'YER',
        unitArabic: 'ريال يمني',
        trend: analysis.revenueGrowth > 0 ? 'up' : 'down',
        changePercentage: analysis.revenueGrowth,
        status: analysis.revenueGrowth > 15 ? 'excellent' : 
               analysis.revenueGrowth > 5 ? 'good' : 
               analysis.revenueGrowth > 0 ? 'warning' : 'critical',
        description: 'Total revenue from all sources',
        descriptionArabic: 'إجمالي الإيرادات من جميع المصادر',
        calculationMethod: 'Sum of all revenue streams',
        dataSource: 'financial_transactions',
        updateFrequency: 'daily',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 20000000,
          good: 15000000,
          warning: 10000000,
          critical: 5000000
        }
      },
      
      averageRevenuePerRestaurant: {
        id: 'arpr',
        name: 'Average Revenue Per Restaurant',
        nameArabic: 'متوسط الإيرادات لكل مطعم',
        category: 'financial',
        currentValue: analysis.totalRevenue / totalRestaurants,
        unit: 'YER',
        unitArabic: 'ريال يمني',
        trend: 'up',
        changePercentage: 12.5,
        status: 'good',
        description: 'Average monthly revenue per restaurant',
        descriptionArabic: 'متوسط الإيرادات الشهرية لكل مطعم',
        calculationMethod: 'Total Revenue / Active Restaurants',
        dataSource: 'aggregated_data',
        updateFrequency: 'monthly',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 200000,
          good: 150000,
          warning: 100000,
          critical: 50000
        }
      },
      
      revenueGrowthRate: {
        id: 'revenue_growth',
        name: 'Revenue Growth Rate',
        nameArabic: 'معدل نمو الإيرادات',
        category: 'growth',
        currentValue: analysis.revenueGrowth,
        unit: '%',
        unitArabic: '%',
        trend: analysis.revenueGrowth > 0 ? 'up' : 'down',
        changePercentage: analysis.revenueGrowth,
        status: analysis.revenueGrowth > 20 ? 'excellent' : 
               analysis.revenueGrowth > 10 ? 'good' : 
               analysis.revenueGrowth > 0 ? 'warning' : 'critical',
        description: 'Month-over-month revenue growth',
        descriptionArabic: 'معدل نمو الإيرادات شهرياً',
        calculationMethod: '((Current - Previous) / Previous) * 100',
        dataSource: 'comparative_analysis',
        updateFrequency: 'monthly',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 25,
          good: 15,
          warning: 5,
          critical: 0
        }
      },
      
      collectionEfficiency: {
        id: 'collection_efficiency',
        name: 'Collection Efficiency',
        nameArabic: 'كفاءة التحصيل',
        category: 'operational',
        currentValue: 94.5,
        unit: '%',
        unitArabic: '%',
        trend: 'up',
        changePercentage: 2.1,
        status: 'excellent',
        description: 'Percentage of invoiced amount collected',
        descriptionArabic: 'نسبة المبلغ المحصل من إجمالي الفواتير',
        calculationMethod: '(Collected Amount / Total Invoiced) * 100',
        dataSource: 'collection_data',
        updateFrequency: 'weekly',
        lastUpdated: new Date(),
        thresholds: {
          excellent: 95,
          good: 90,
          warning: 85,
          critical: 80
        }
      }
    }
  }

  private async generateReportData(report: RevenueReport): Promise<void> {
    const restaurantData = [
      {
        id: '1',
        restaurantName: 'مطعم الأصالة اليمنية',
        region: 'صنعاء',
        totalRevenue: 850000,
        directBills: 620000,
        installments: 180000,
        growth: 15.5
      },
      {
        id: '2',
        restaurantName: 'مطعم البركة للمأكولات الشعبية',
        region: 'عدن',
        totalRevenue: 1200000,
        directBills: 890000,
        installments: 250000,
        growth: 22.1
      },
      {
        id: '3',
        restaurantName: 'مطعم الحضرمي التراثي',
        region: 'تعز',
        totalRevenue: 450000,
        directBills: 320000,
        installments: 100000,
        growth: 8.7
      }
    ]

    report.data.headers = [
      { key: 'restaurantName', label: 'Restaurant', labelArabic: 'المطعم', dataType: 'string', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'region', label: 'Region', labelArabic: 'المنطقة', dataType: 'string', alignment: 'center', isVisible: true, isSortable: true },
      { key: 'totalRevenue', label: 'Total Revenue', labelArabic: 'إجمالي الإيرادات', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'directBills', label: 'Direct Bills', labelArabic: 'الفواتير المباشرة', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'installments', label: 'Installments', labelArabic: 'الأقساط', dataType: 'currency', alignment: 'right', isVisible: true, isSortable: true },
      { key: 'growth', label: 'Growth %', labelArabic: 'النمو %', dataType: 'percentage', alignment: 'center', isVisible: true, isSortable: true }
    ]

    report.data.rows = restaurantData.map(item => ({
      id: item.id,
      values: item,
      metadata: {
        highlight: item.growth > 20 ? 'success' : item.growth > 10 ? 'info' : undefined
      }
    }))
  }

  private async generateCharts(report: RevenueReport): Promise<void> {
    const { analysis } = report

    // رسم الإيرادات حسب المصدر
    const revenueSourceChart: ChartData = {
      type: 'pie',
      title: 'Revenue by Source',
      titleArabic: 'الإيرادات حسب المصدر',
      datasets: [{
        label: 'Revenue',
        labelArabic: 'الإيرادات',
        data: [
          analysis.revenueBySource.directBills,
          analysis.revenueBySource.installments,
          analysis.revenueBySource.subscriptionFees,
          analysis.revenueBySource.serviceFees,
          analysis.revenueBySource.penalties
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderColor: ['#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED'],
        borderWidth: 2
      }],
      labels: ['فواتير مباشرة', 'أقساط', 'رسوم اشتراك', 'رسوم خدمات', 'غرامات'],
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

    // رسم الإيرادات حسب المنطقة
    const revenueRegionChart: ChartData = {
      type: 'bar',
      title: 'Revenue by Region',
      titleArabic: 'الإيرادات حسب المنطقة',
      datasets: [{
        label: 'Revenue',
        labelArabic: 'الإيرادات',
        data: [
          analysis.revenueByRegion.sanaa,
          analysis.revenueByRegion.aden,
          analysis.revenueByRegion.taiz,
          analysis.revenueByRegion.hudaydah,
          analysis.revenueByRegion.other
        ],
        backgroundColor: '#059669',
        borderColor: '#10B981',
        borderWidth: 1
      }],
      labels: ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'مناطق أخرى'],
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

    report.data.charts = [revenueSourceChart, revenueRegionChart]
  }

  private async generateSummaryAndInsights(report: RevenueReport): Promise<void> {
    const { analysis, kpis } = report

    report.summary = {
      totalRecords: report.data.rows.length,
      keyMetrics: {
        totalRevenue: {
          value: analysis.totalRevenue,
          previousValue: analysis.previousPeriodRevenue,
          changePercentage: analysis.revenueGrowth,
          trend: 'up',
          status: 'good',
          unit: 'YER'
        },
        averagePerRestaurant: {
          value: kpis.averageRevenuePerRestaurant.currentValue,
          changePercentage: kpis.averageRevenuePerRestaurant.changePercentage,
          trend: 'up',
          status: 'good',
          unit: 'YER'
        }
      }
    }

    report.insights = [
      {
        type: 'trend',
        severity: 'medium',
        title: 'Strong Revenue Growth',
        titleArabic: 'نمو قوي في الإيرادات',
        description: `Revenue increased by ${analysis.revenueGrowth.toFixed(1)}% compared to previous period`,
        descriptionArabic: `زادت الإيرادات بنسبة ${analysis.revenueGrowth.toFixed(1)}% مقارنة بالفترة السابقة`,
        impact: 'positive',
        confidence: 85,
        actionRequired: false
      },
      {
        type: 'opportunity',
        severity: 'low',
        title: 'Geographic Expansion Opportunity',
        titleArabic: 'فرصة للتوسع الجغرافي',
        description: 'Revenue concentration in Sanaa presents diversification opportunities',
        descriptionArabic: 'تركز الإيرادات في صنعاء يوفر فرص للتنويع الجغرافي',
        impact: 'positive',
        confidence: 70,
        actionRequired: true
      }
    ]

    report.recommendations = [
      'الاستمرار في استراتيجية النمو الحالية',
      'التوسع في المناطق الأخرى لتقليل التركز الجغرافي',
      'تطوير منتجات وخدمات جديدة لزيادة الإيرادات',
      'تعزيز كفاءة التحصيل للحفاظ على التدفق النقدي'
    ]
  }

  private generateReportId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `revenue_${timestamp}_${random}`
  }
}

export default new RevenueReportService()
