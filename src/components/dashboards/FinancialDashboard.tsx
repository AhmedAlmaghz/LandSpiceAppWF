/**
 * لوحة معلومات المالية - لاند سبايس
 * الوحدة الثانية عشرة: التقارير والإحصائيات المتقدمة
 * 
 * لوحة مالية متخصصة للمدير المالي وفريق المحاسبة
 * مع تركيز على التدفقات النقدية والأداء المالي
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Banknote,
  Calculator,
  CreditCard,
  DollarSign,
  FileText,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react'

// ===============================
// أنواع البيانات المالية
// ===============================

interface FinancialMetrics {
  // التدفقات النقدية
  cashFlow: {
    inflow: number
    outflow: number
    netFlow: number
    operatingCashFlow: number
    investingCashFlow: number
    financingCashFlow: number
  }
  
  // الأرصدة والسيولة
  balances: {
    cashOnHand: number
    bankBalances: number
    accountsReceivable: number
    accountsPayable: number
    totalAssets: number
    totalLiabilities: number
  }
  
  // مؤشرات الربحية
  profitability: {
    grossProfit: number
    netProfit: number
    grossMargin: number
    netMargin: number
    ebitda: number
    roi: number
  }
  
  // مؤشرات السيولة
  liquidity: {
    currentRatio: number
    quickRatio: number
    cashRatio: number
    workingCapital: number
    daysPayableOutstanding: number
    daysSalesOutstanding: number
  }
}

interface FinancialAlert {
  id: string
  type: 'cash_flow' | 'overdue' | 'liquidity' | 'profitability'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  titleArabic: string
  description: string
  descriptionArabic: string
  amount?: number
  actionRequired: boolean
  dueDate?: Date
}

interface MonthlyFinancials {
  month: string
  revenue: number
  expenses: number
  netProfit: number
  cashFlow: number
  margin: number
}

interface ExpenseBreakdown {
  category: string
  categoryArabic: string
  amount: number
  percentage: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

// ===============================
// المكون الرئيسي
// ===============================

export default function FinancialDashboard() {
  // ===============================
  // الحالة المحلية
  // ===============================

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [alerts, setAlerts] = useState<FinancialAlert[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancials[]>([])
  const [expenses, setExpenses] = useState<ExpenseBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // ===============================
  // تحميل البيانات
  // ===============================

  useEffect(() => {
    loadFinancialDashboardData()
    
    // تحديث كل 5 دقائق
    const interval = setInterval(loadFinancialDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadFinancialDashboardData = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // المؤشرات المالية الأساسية
      setMetrics({
        cashFlow: {
          inflow: 18750000,        // التدفق الداخل
          outflow: 14200000,       // التدفق الخارج
          netFlow: 4550000,        // صافي التدفق
          operatingCashFlow: 5200000,
          investingCashFlow: -800000,
          financingCashFlow: 150000
        },
        
        balances: {
          cashOnHand: 2800000,     // النقد المتاح
          bankBalances: 12300000,  // أرصدة البنوك
          accountsReceivable: 6450000, // الذمم المدينة
          accountsPayable: 3200000,    // الذمم الدائنة
          totalAssets: 45800000,       // إجمالي الأصول
          totalLiabilities: 18200000   // إجمالي الخصوم
        },
        
        profitability: {
          grossProfit: 12850000,   // الربح الإجمالي
          netProfit: 4550000,      // الربح الصافي
          grossMargin: 68.5,       // هامش الربح الإجمالي
          netMargin: 24.3,         // هامش الربح الصافي
          ebitda: 6200000,         // الأرباح قبل الفوائد والضرائب
          roi: 16.7                // العائد على الاستثمار
        },
        
        liquidity: {
          currentRatio: 2.85,      // نسبة السيولة الجارية
          quickRatio: 2.12,        // نسبة السيولة السريعة
          cashRatio: 1.47,         // نسبة النقدية
          workingCapital: 8650000, // رأس المال العامل
          daysPayableOutstanding: 35.2, // أيام سداد الموردين
          daysSalesOutstanding: 28.7    // أيام تحصيل العملاء
        }
      })

      // التنبيهات المالية
      setAlerts([
        {
          id: 'alert_f001',
          type: 'overdue',
          severity: 'high',
          title: 'High Overdue Receivables',
          titleArabic: 'ذمم مدينة متأخرة عالية',
          description: '4.55M YER in overdue receivables need immediate collection',
          descriptionArabic: '4.55 مليون ريال ذمم متأخرة تحتاج تحصيل عاجل',
          amount: 4550000,
          actionRequired: true,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'alert_f002',
          type: 'cash_flow',
          severity: 'medium',
          title: 'Cash Flow Projection',
          titleArabic: 'توقعات التدفق النقدي',
          description: 'Cash flow expected to decrease next month',
          descriptionArabic: 'متوقع انخفاض التدفق النقدي الشهر القادم',
          actionRequired: false
        },
        {
          id: 'alert_f003',
          type: 'profitability',
          severity: 'low',
          title: 'Strong Profit Margins',
          titleArabic: 'هوامش ربح قوية',
          description: 'Net margin of 24.3% exceeds industry average',
          descriptionArabic: 'هامش الربح الصافي 24.3% يتجاوز متوسط الصناعة',
          actionRequired: false
        }
      ])

      // البيانات الشهرية
      setMonthlyData([
        {
          month: '2024-07',
          revenue: 15200000,
          expenses: 11400000,
          netProfit: 3800000,
          cashFlow: 4200000,
          margin: 25.0
        },
        {
          month: '2024-08',
          revenue: 16800000,
          expenses: 12600000,
          netProfit: 4200000,
          cashFlow: 4650000,
          margin: 25.0
        },
        {
          month: '2024-09',
          revenue: 17500000,
          expenses: 13100000,
          netProfit: 4400000,
          cashFlow: 4850000,
          margin: 25.1
        },
        {
          month: '2024-10',
          revenue: 18200000,
          expenses: 13700000,
          netProfit: 4500000,
          cashFlow: 5100000,
          margin: 24.7
        },
        {
          month: '2024-11',
          revenue: 17900000,
          expenses: 13400000,
          netProfit: 4500000,
          cashFlow: 4950000,
          margin: 25.1
        },
        {
          month: '2025-01',
          revenue: 18750000,
          expenses: 14200000,
          netProfit: 4550000,
          cashFlow: 5200000,
          margin: 24.3
        }
      ])

      // تفصيل المصروفات
      setExpenses([
        {
          category: 'Staff',
          categoryArabic: 'رواتب الموظفين',
          amount: 6800000,
          percentage: 47.9,
          change: 8.2,
          trend: 'up'
        },
        {
          category: 'Technology',
          categoryArabic: 'التقنية والأنظمة',
          amount: 2850000,
          percentage: 20.1,
          change: 12.5,
          trend: 'up'
        },
        {
          category: 'Operations',
          categoryArabic: 'العمليات التشغيلية',
          amount: 2130000,
          percentage: 15.0,
          change: 5.3,
          trend: 'up'
        },
        {
          category: 'Marketing',
          categoryArabic: 'التسويق والإعلان',
          amount: 1420000,
          percentage: 10.0,
          change: -2.1,
          trend: 'down'
        },
        {
          category: 'Other',
          categoryArabic: 'مصروفات أخرى',
          amount: 1000000,
          percentage: 7.0,
          change: 1.8,
          trend: 'stable'
        }
      ])

    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة المالية:', error)
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getAlertColor = (severity: FinancialAlert['severity']) => {
    const colors = {
      low: 'text-blue-600 bg-blue-50 border-blue-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      critical: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[severity]
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  // ===============================
  // مكونات الواجهة
  // ===============================

  const FinancialMetricsCards = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* صافي التدفق النقدي */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">صافي التدفق النقدي</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics?.cashFlow.netFlow || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">تدفق إيجابي قوي</span>
          </p>
        </CardContent>
      </Card>

      {/* الربح الصافي */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الربح الصافي</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(metrics?.profitability.netProfit || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            هامش {formatPercentage(metrics?.profitability.netMargin || 0)}
          </p>
        </CardContent>
      </Card>

      {/* إجمالي الأصول */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(metrics?.balances.totalAssets || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            نمو مستقر في الأصول
          </p>
        </CardContent>
      </Card>

      {/* نسبة السيولة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نسبة السيولة</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics?.liquidity.currentRatio.toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            سيولة ممتازة
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const CashFlowCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          تفصيل التدفقات النقدية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
            <div>
              <h4 className="font-medium text-green-800">التدفق من العمليات</h4>
              <p className="text-sm text-green-600">Operating Cash Flow</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(metrics?.cashFlow.operatingCashFlow || 0)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
            <div>
              <h4 className="font-medium text-blue-800">التدفق الداخل</h4>
              <p className="text-sm text-blue-600">Total Inflow</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(metrics?.cashFlow.inflow || 0)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-800">التدفق الخارج</h4>
              <p className="text-sm text-red-600">Total Outflow</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(metrics?.cashFlow.outflow || 0)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ExpenseBreakdownCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          تفصيل المصروفات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{expense.categoryArabic}</span>
                  {getTrendIcon(expense.trend)}
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(expense.amount)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage(expense.percentage)}
                  </div>
                </div>
              </div>
              <Progress value={expense.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-left">
                {expense.change > 0 ? '+' : ''}{formatPercentage(expense.change)} من الشهر السابق
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const FinancialAlertsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          التنبيهات المالية
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
                  {alert.amount && (
                    <div className="text-sm font-medium mt-2">
                      المبلغ: {formatCurrency(alert.amount)}
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

  const ProfitabilityCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          مؤشرات الربحية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(metrics?.profitability.grossMargin || 0)}
            </div>
            <div className="text-sm text-muted-foreground">هامش الربح الإجمالي</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(metrics?.profitability.netMargin || 0)}
            </div>
            <div className="text-sm text-muted-foreground">هامش الربح الصافي</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(metrics?.profitability.roi || 0)}
            </div>
            <div className="text-sm text-muted-foreground">العائد على الاستثمار</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(metrics?.profitability.ebitda || 0)}
            </div>
            <div className="text-sm text-muted-foreground">EBITDA</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const BalanceSummaryCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          ملخص الميزانية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 border-b">
            <span>النقد والأرصدة البنكية</span>
            <span className="font-medium">
              {formatCurrency((metrics?.balances.cashOnHand || 0) + (metrics?.balances.bankBalances || 0))}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 border-b">
            <span>الذمم المدينة</span>
            <span className="font-medium">
              {formatCurrency(metrics?.balances.accountsReceivable || 0)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 border-b">
            <span>الذمم الدائنة</span>
            <span className="font-medium text-red-600">
              ({formatCurrency(metrics?.balances.accountsPayable || 0)})
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 font-medium text-lg border-t-2">
            <span>رأس المال العامل</span>
            <span className="text-green-600">
              {formatCurrency(metrics?.liquidity.workingCapital || 0)}
            </span>
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
          <p className="mt-4 text-muted-foreground">جاري تحميل لوحة المالية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* رأس اللوحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة معلومات المالية</h1>
          <p className="text-muted-foreground">
            مراقبة الأداء المالي والتدفقات النقدية والمؤشرات الرئيسية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadFinancialDashboardData}>
            تحديث البيانات
          </Button>
          <Button>
            <FileText className="w-4 h-4 ml-2" />
            تقرير مالي
          </Button>
        </div>
      </div>

      {/* المؤشرات الرئيسية */}
      <FinancialMetricsCards />

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="cashflow">التدفق النقدي</TabsTrigger>
          <TabsTrigger value="profitability">الربحية</TabsTrigger>
          <TabsTrigger value="balance">الميزانية</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <CashFlowCard />
              <ExpenseBreakdownCard />
            </div>
            <div className="space-y-6">
              <FinancialAlertsCard />
              <ProfitabilityCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CashFlowCard />
            <ExpenseBreakdownCard />
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ProfitabilityCard />
            <ExpenseBreakdownCard />
          </div>
        </TabsContent>

        <TabsContent value="balance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BalanceSummaryCard />
            <FinancialAlertsCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
