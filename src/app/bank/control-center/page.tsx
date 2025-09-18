// Bank Control Center - Main Financial Dashboard
// مركز التحكم المالي للبنك الوسيط

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import StatCard from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'

interface BankDashboardData {
  overview: {
    totalRestaurants: number
    activeContracts: number
    totalGuarantees: number
    monthlyVolume: number
    pendingPayments: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  financials: {
    totalLiquidity: number
    guaranteesHeld: number
    pendingPayouts: number
    monthlyRevenue: number
    profitMargin: number
    defaultRate: number
  }
  recentTransactions: Array<{
    id: string
    type: 'guarantee_collection' | 'supplier_payment' | 'fee_collection'
    restaurant: string
    amount: number
    date: Date
    status: 'completed' | 'pending' | 'failed'
  }>
  riskAlerts: Array<{
    id: string
    type: 'late_payment' | 'credit_limit' | 'fraud_suspicious' | 'contract_expiry'
    restaurant: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    date: Date
  }>
  performanceMetrics: {
    transactionSuccessRate: number
    averageProcessingTime: number
    customerSatisfaction: number
    systemUptime: number
  }
}

export default function BankControlCenter() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<BankDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('month')

  // التحقق من صلاحية البنك
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.roleName !== 'bank') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي
      const mockData: BankDashboardData = {
        overview: {
          totalRestaurants: 156,
          activeContracts: 89,
          totalGuarantees: 2450000,
          monthlyVolume: 18500000,
          pendingPayments: 12,
          riskLevel: 'low'
        },
        financials: {
          totalLiquidity: 125000000,
          guaranteesHeld: 2450000,
          pendingPayouts: 890000,
          monthlyRevenue: 185000,
          profitMargin: 12.5,
          defaultRate: 0.8
        },
        recentTransactions: [
          {
            id: '1',
            type: 'supplier_payment',
            restaurant: 'مطعم الذوق الأصيل',
            amount: 45000,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed'
          },
          {
            id: '2',
            type: 'guarantee_collection',
            restaurant: 'مطعم البيك',
            amount: 25000,
            date: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: 'completed'
          },
          {
            id: '3',
            type: 'fee_collection',
            restaurant: 'مطعم الطازج',
            amount: 850,
            date: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'pending'
          }
        ],
        riskAlerts: [
          {
            id: '1',
            type: 'late_payment',
            restaurant: 'مطعم الوليمة',
            severity: 'medium',
            description: 'تأخر في سداد دفعة شهر يناير بـ 5 أيام',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'contract_expiry',
            restaurant: 'مطعم الأصالة',
            severity: 'high',
            description: 'عقد التوريد ينتهي خلال 30 يوم ولم يتم التجديد',
            date: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        ],
        performanceMetrics: {
          transactionSuccessRate: 99.2,
          averageProcessingTime: 2.5,
          customerSatisfaction: 4.7,
          systemUptime: 99.9
        }
      }

      setDashboardData(mockData)
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'guarantee_collection': return 'تحصيل ضمان'
      case 'supplier_payment': return 'دفع للمورد'
      case 'fee_collection': return 'رسوم خدمة'
      default: return 'غير محدد'
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'guarantee_collection': return '🔒'
      case 'supplier_payment': return '💸'
      case 'fee_collection': return '💰'
      default: return '💳'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل مركز التحكم المالي...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div>خطأ في تحميل البيانات</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏦 مركز التحكم المالي
              </h1>
              <p className="text-gray-600">أهلاً بك، {session.user.name || session.user.username}</p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="day">اليوم</option>
                <option value="week">الأسبوع</option>
                <option value="month">الشهر</option>
                <option value="quarter">الربع</option>
              </select>
              <Button variant="outline" size="sm">
                📊 التقارير
              </Button>
              <Button variant="primary" size="sm">
                💰 المعاملات
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Risk Alert */}
        {dashboardData.riskAlerts.some(alert => alert.severity === 'critical' || alert.severity === 'high') && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-red-800">تنبيه عالي المخاطر</h3>
                <p className="text-sm text-red-700">يوجد {dashboardData.riskAlerts.filter(a => a.severity === 'high').length} تنبيه عالي المخاطر يحتاج للمراجعة الفورية.</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي السيولة"
            value={formatCurrency(dashboardData.financials.totalLiquidity)}
            icon="💎"
            color="blue"
            subtitle="السيولة المتاحة"
          />
          <StatCard
            title="الضمانات المحصلة"
            value={formatCurrency(dashboardData.financials.guaranteesHeld)}
            icon="🔒"
            color="green"
            subtitle="ضمانات نشطة"
          />
          <StatCard
            title="المدفوعات المعلقة"
            value={formatCurrency(dashboardData.financials.pendingPayouts)}
            icon="⏱️"
            color="yellow"
            subtitle="في انتظار الدفع"
          />
          <StatCard
            title="الإيرادات الشهرية"
            value={formatCurrency(dashboardData.financials.monthlyRevenue)}
            icon="📈"
            color="purple"
            subtitle={`هامش ${dashboardData.financials.profitMargin}%`}
          />
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* System Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>نظرة عامة على النظام</CardTitle>
                <CardDescription>الأداء العام ومؤشرات النشاط</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.overview.totalRestaurants}</div>
                    <p className="text-sm text-blue-800">إجمالي المطاعم</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.overview.activeContracts}</div>
                    <p className="text-sm text-green-800">عقود نشطة</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData.overview.pendingPayments}</div>
                    <p className="text-sm text-yellow-800">دفعات معلقة</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getRiskLevelColor(dashboardData.overview.riskLevel)}`}>
                      {dashboardData.overview.riskLevel === 'low' ? 'منخفض' :
                       dashboardData.overview.riskLevel === 'medium' ? 'متوسط' : 'عالي'}
                    </div>
                    <p className="text-sm text-purple-800">مستوى المخاطر</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>مؤشرات الأداء</CardTitle>
              <CardDescription>KPIs أساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">نسبة نجاح المعاملات</span>
                <span className="font-bold text-green-600">{dashboardData.performanceMetrics.transactionSuccessRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.performanceMetrics.transactionSuccessRate}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">متوسط زمن المعالجة</span>
                <span className="font-bold text-blue-600">{dashboardData.performanceMetrics.averageProcessingTime}ث</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">رضا العملاء</span>
                <span className="font-bold text-yellow-600">{dashboardData.performanceMetrics.customerSatisfaction}/5</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">وقت تشغيل النظام</span>
                <span className="font-bold text-purple-600">{dashboardData.performanceMetrics.systemUptime}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions & Risk Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>المعاملات الأخيرة</CardTitle>
              <CardDescription>آخر العمليات المالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {getTransactionTypeText(transaction.type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.restaurant} • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(transaction.amount)}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'completed' ? 'مكتمل' :
                         transaction.status === 'pending' ? 'معلق' : 'فاشل'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button variant="ghost" className="w-full">
                  عرض جميع المعاملات
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>تنبيهات المخاطر</CardTitle>
              <CardDescription>تحتاج للمراجعة والمتابعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.riskAlerts.map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{alert.restaurant}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity === 'critical' ? 'حرج' :
                       alert.severity === 'high' ? 'عالي' :
                       alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(alert.date)}</p>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-4">
                عرض جميع التنبيهات
              </Button>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  )
}
