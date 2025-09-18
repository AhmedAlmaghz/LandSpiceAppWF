/**
 * لوحة معلومات المدير العام - لاند سبايس
 * الوحدة الثانية عشرة: التقارير والإحصائيات المتقدمة
 * 
 * لوحة معلومات شاملة للمدير العام توفر نظرة 360 درجة
 * على جميع جوانب الأعمال مع مؤشرات الأداء الحرجة
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Gauge,
  Globe,
  Handshake,
  PieChart,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react'

// ===============================
// أنواع البيانات للوحة الرئيسية
// ===============================

interface ExecutiveMetrics {
  // المؤشرات المالية الرئيسية
  totalRevenue: {
    current: number
    previous: number
    change: number
    trend: 'up' | 'down' | 'stable'
    status: 'excellent' | 'good' | 'warning' | 'critical'
  }
  
  // المؤشرات التشغيلية
  activeRestaurants: {
    current: number
    newThisMonth: number
    churnRate: number
  }
  
  // مؤشرات التدفق النقدي
  cashFlow: {
    inflow: number
    outflow: number
    netFlow: number
    burnRate: number
  }
  
  // مؤشرات الأقساط البنكية
  installments: {
    totalValue: number
    approvalRate: number
    defaultRate: number
    avgProcessingTime: number
  }
  
  // مؤشرات الجودة والرضا
  performance: {
    customerSatisfaction: number
    serviceQuality: number
    systemUptime: number
    supportResponseTime: number
  }
}

interface RegionalBreakdown {
  region: string
  regionArabic: string
  revenue: number
  restaurants: number
  growth: number
  marketShare: number
}

interface Alert {
  id: string
  type: 'financial' | 'operational' | 'risk' | 'opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  titleArabic: string
  description: string
  descriptionArabic: string
  actionRequired: boolean
  deadline?: Date
  assignedTo?: string
}

interface QuickAction {
  id: string
  label: string
  labelArabic: string
  icon: React.ComponentType
  action: string
  urgent: boolean
  count?: number
}

// ===============================
// المكون الرئيسي
// ===============================

export default function ExecutiveDashboard() {
  // ===============================
  // الحالة المحلية
  // ===============================

  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null)
  const [regionalData, setRegionalData] = useState<RegionalBreakdown[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTime, setRefreshTime] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  // ===============================
  // تحميل البيانات
  // ===============================

  useEffect(() => {
    loadDashboardData()
    
    // تحديث تلقائي كل 5 دقائق
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000))

      // محاكاة بيانات المدير العام
      setMetrics({
        totalRevenue: {
          current: 47850000,     // 47.85 مليون ريال
          previous: 42100000,    // 42.1 مليون ريال
          change: 13.6,          // +13.6% نمو
          trend: 'up',
          status: 'excellent'
        },
        
        activeRestaurants: {
          current: 124,          // 124 مطعم نشط
          newThisMonth: 12,      // 12 مطعم جديد
          churnRate: 2.8         // 2.8% معدل التسرب
        },
        
        cashFlow: {
          inflow: 18750000,      // التدفق الداخل
          outflow: 14200000,     // التدفق الخارج
          netFlow: 4550000,      // صافي التدفق
          burnRate: 850000       // معدل الإنفاق الشهري
        },
        
        installments: {
          totalValue: 52750000,  // إجمالي الأقساط
          approvalRate: 78.5,    // معدل الموافقة
          defaultRate: 3.1,      // معدل التعثر
          avgProcessingTime: 6.2 // متوسط وقت المعالجة
        },
        
        performance: {
          customerSatisfaction: 4.6,    // من 5
          serviceQuality: 92.3,         // %
          systemUptime: 99.7,           // %
          supportResponseTime: 2.4      // ساعات
        }
      })

      // بيانات التوزيع الجغرافي
      setRegionalData([
        {
          region: 'Sanaa',
          regionArabic: 'صنعاء',
          revenue: 19140000,      // 40%
          restaurants: 50,
          growth: 15.2,
          marketShare: 42.5
        },
        {
          region: 'Aden',
          regionArabic: 'عدن',
          revenue: 10527000,      // 22%
          restaurants: 27,
          growth: 18.7,
          marketShare: 28.3
        },
        {
          region: 'Taiz',
          regionArabic: 'تعز',
          revenue: 7177500,       // 15%
          restaurants: 19,
          growth: 12.1,
          marketShare: 18.2
        },
        {
          region: 'Hudaydah',
          regionArabic: 'الحديدة',
          revenue: 5742000,       // 12%
          restaurants: 15,
          growth: 22.4,
          marketShare: 15.8
        },
        {
          region: 'Other',
          regionArabic: 'مناطق أخرى',
          revenue: 5263500,       // 11%
          restaurants: 13,
          growth: 8.9,
          marketShare: 12.1
        }
      ])

      // التنبيهات والإنذارات
      setAlerts([
        {
          id: 'alert_001',
          type: 'financial',
          severity: 'high',
          title: 'High Overdue Payments',
          titleArabic: 'مدفوعات متأخرة عالية',
          description: '4.55M YER in overdue payments require immediate attention',
          descriptionArabic: '4.55 مليون ريال مدفوعات متأخرة تحتاج اهتماماً عاجلاً',
          actionRequired: true,
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 أيام
          assignedTo: 'finance_team'
        },
        {
          id: 'alert_002',
          type: 'opportunity',
          severity: 'medium',
          title: 'Strong Growth in Hudaydah',
          titleArabic: 'نمو قوي في الحديدة',
          description: '22.4% growth rate presents expansion opportunity',
          descriptionArabic: 'معدل نمو 22.4% يوفر فرصة للتوسع',
          actionRequired: false
        },
        {
          id: 'alert_003',
          type: 'risk',
          severity: 'low',
          title: 'Market Concentration Risk',
          titleArabic: 'مخاطر التركز السوقي',
          description: '42.5% market concentration in Sanaa',
          descriptionArabic: '42.5% تركز سوقي في صنعاء',
          actionRequired: false
        }
      ])

      // الإجراءات السريعة
      setQuickActions([
        {
          id: 'action_001',
          label: 'Review Overdue Payments',
          labelArabic: 'مراجعة المدفوعات المتأخرة',
          icon: AlertTriangle,
          action: 'payments',
          urgent: true,
          count: 23
        },
        {
          id: 'action_002',
          label: 'Approve New Restaurants',
          labelArabic: 'اعتماد مطاعم جديدة',
          icon: Building2,
          action: 'approvals',
          urgent: false,
          count: 8
        },
        {
          id: 'action_003',
          label: 'Bank Installments Review',
          labelArabic: 'مراجعة الأقساط البنكية',
          icon: CreditCard,
          action: 'installments',
          urgent: false,
          count: 5
        },
        {
          id: 'action_004',
          label: 'Generate Monthly Report',
          labelArabic: 'إنتاج التقرير الشهري',
          icon: BarChart3,
          action: 'reports',
          urgent: false
        }
      ])

      setRefreshTime(new Date())
      
    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة المدير العام:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // دوال المساعدة
  // ===============================

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}م ر.ي`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}ك ر.ي`
    }
    return `${amount.toLocaleString()} ر.ي`
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-EG')
  }

  const getChangeIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getAlertColor = (severity: Alert['severity']) => {
    const colors = {
      low: 'text-blue-600 bg-blue-50 border-blue-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      critical: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[severity]
  }

  // ===============================
  // مكونات الواجهة
  // ===============================

  const KPICards = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* إجمالي الإيرادات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics?.totalRevenue.current || 0)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {getChangeIcon(metrics?.totalRevenue.trend || 'stable')}
            <span className="ml-1">
              {metrics?.totalRevenue.change.toFixed(1)}% من الشهر الماضي
            </span>
          </div>
        </CardContent>
      </Card>

      {/* المطاعم النشطة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المطاعم النشطة</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {metrics?.activeRestaurants.current || 0}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="ml-1">
              {metrics?.activeRestaurants.newThisMonth || 0} جديد هذا الشهر
            </span>
          </div>
        </CardContent>
      </Card>

      {/* صافي التدفق النقدي */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">صافي التدفق النقدي</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(metrics?.cashFlow.netFlow || 0)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="ml-1">
              تدفق إيجابي قوي
            </span>
          </div>
        </CardContent>
      </Card>

      {/* رضا العملاء */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
          <Handshake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics?.performance.customerSatisfaction || 0}/5
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="ml-1">
              تقييم ممتاز
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const RegionalBreakdownCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          التوزيع الجغرافي للإيرادات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regionalData.map((region) => (
            <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{region.regionArabic}</h4>
                  <Badge variant="outline">{region.restaurants} مطعم</Badge>
                </div>
                <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
                  <span>{formatCurrency(region.revenue)}</span>
                  <span className="flex items-center">
                    {getChangeIcon('up')}
                    {region.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-right text-sm">
                  <div className="font-medium">{region.marketShare.toFixed(1)}%</div>
                  <div className="text-muted-foreground">حصة السوق</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const AlertsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          التنبيهات والإنذارات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{alert.titleArabic}</h4>
                  <p className="text-sm mt-1">{alert.descriptionArabic}</p>
                  {alert.deadline && (
                    <div className="flex items-center mt-2 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      موعد نهائي: {alert.deadline.toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </div>
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity === 'critical' ? 'حرج' :
                   alert.severity === 'high' ? 'عالي' :
                   alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                </Badge>
              </div>
              {alert.actionRequired && (
                <Button size="sm" className="mt-2" variant="outline">
                  اتخاذ إجراء
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const QuickActionsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>الإجراءات السريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.urgent ? "default" : "outline"}
                className="justify-start h-auto p-4"
                onClick={() => console.log(`تنفيذ إجراء: ${action.action}`)}
              >
                <Icon className="w-5 h-5 ml-2" />
                <div className="text-right flex-1">
                  <div className="font-medium">{action.labelArabic}</div>
                  {action.count && (
                    <div className="text-sm opacity-70">
                      ({action.count} عنصر)
                    </div>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const SystemHealthCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          صحة النظام
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>وقت التشغيل</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{metrics?.performance.systemUptime}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>جودة الخدمة</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{metrics?.performance.serviceQuality}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>وقت الاستجابة</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">{metrics?.performance.supportResponseTime}س</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ===============================
  // العرض الرئيسي
  // ===============================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل لوحة المدير العام...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* رأس اللوحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة معلومات المدير العام</h1>
          <p className="text-muted-foreground">
            نظرة شاملة على أداء لاند سبايس - آخر تحديث: {refreshTime.toLocaleTimeString('ar-EG')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
            تحديث البيانات
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 ml-2" />
            تقرير شامل
          </Button>
        </div>
      </div>

      {/* المؤشرات الرئيسية */}
      <KPICards />

      {/* التبويبات الرئيسية */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
          <TabsTrigger value="operational">التشغيلية</TabsTrigger>
          <TabsTrigger value="regional">الإقليمية</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RegionalBreakdownCard />
            </div>
            <div className="space-y-6">
              <SystemHealthCard />
              <QuickActionsCard />
            </div>
          </div>
          <AlertsCard />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>الأداء المالي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>إجمالي الإيرادات</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(metrics?.totalRevenue.current || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التدفق النقدي الصافي</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(metrics?.cashFlow.netFlow || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>إجمالي الأقساط</span>
                    <span className="font-medium text-purple-600">
                      {formatCurrency(metrics?.installments.totalValue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الجودة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>معدل الموافقة البنكية</span>
                    <span className="font-medium">{metrics?.installments.approvalRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>معدل التعثر</span>
                    <span className="font-medium">{metrics?.installments.defaultRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>معدل التسرب</span>
                    <span className="font-medium">{metrics?.activeRestaurants.churnRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <SystemHealthCard />
            <QuickActionsCard />
            <Card>
              <CardHeader>
                <CardTitle>الإحصائيات التشغيلية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics?.activeRestaurants.current}
                    </div>
                    <div className="text-sm text-muted-foreground">مطعم نشط</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics?.activeRestaurants.newThisMonth}
                    </div>
                    <div className="text-sm text-muted-foreground">مطعم جديد</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics?.installments.avgProcessingTime}
                    </div>
                    <div className="text-sm text-muted-foreground">أيام متوسط المعالجة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <RegionalBreakdownCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
