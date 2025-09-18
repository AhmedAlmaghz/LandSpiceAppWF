// Bank Dashboard - Main Page
// لوحة تحكم البنك الوسيط - الصفحة الرئيسية

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import TransactionCard from '@/components/bank/TransactionCard'
import RiskAlert from '@/components/bank/RiskAlert'
import StatCard from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/Button'

interface BankDashboardData {
  overview: {
    totalRestaurants: number
    activeContracts: number
    totalGuarantees: number
    monthlyVolume: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  financials: {
    totalLiquidity: number
    guaranteesHeld: number
    pendingPayouts: number
    monthlyRevenue: number
  }
  recentTransactions: Array<{
    id: string
    type: 'guarantee_collection' | 'supplier_payment' | 'fee_collection'
    restaurant: string
    amount: number
    date: Date
    status: 'completed' | 'pending' | 'failed'
    description?: string
  }>
  riskAlerts: Array<{
    id: string
    type: 'late_payment' | 'credit_limit' | 'fraud_suspicious' | 'contract_expiry'
    restaurant: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    date: Date
    acknowledged: boolean
    dueDate?: Date
    amount?: number
    recommendedAction?: string
  }>
}

export default function BankDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<BankDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'risks'>('overview')

  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.roleName !== 'bank') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const mockData: BankDashboardData = {
        overview: {
          totalRestaurants: 156,
          activeContracts: 89,
          totalGuarantees: 2450000,
          monthlyVolume: 18500000,
          riskLevel: 'low'
        },
        financials: {
          totalLiquidity: 125000000,
          guaranteesHeld: 2450000,
          pendingPayouts: 890000,
          monthlyRevenue: 185000
        },
        recentTransactions: [
          {
            id: '1',
            type: 'supplier_payment',
            restaurant: 'مطعم الذوق الأصيل',
            amount: 45000,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed',
            description: 'دفعة طباعة عبوات شهر يناير'
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
            title: 'تأخر في سداد دفعة يناير',
            description: 'تأخر في سداد دفعة شهر يناير بـ 5 أيام',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            acknowledged: false,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            amount: 35000,
            recommendedAction: 'التواصل مع المطعم لتحديد موعد السداد'
          },
          {
            id: '2',
            type: 'contract_expiry',
            restaurant: 'مطعم الأصالة',
            severity: 'high',
            title: 'انتهاء عقد قريب',
            description: 'عقد التوريد ينتهي خلال 30 يوم ولم يتم التجديد',
            date: new Date(Date.now() - 12 * 60 * 60 * 1000),
            acknowledged: false,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            recommendedAction: 'بدء إجراءات تجديد العقد فوراً'
          }
        ]
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
        
        {/* Critical Risk Alert */}
        {dashboardData.riskAlerts.some(alert => alert.severity === 'critical') && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">تنبيه عالي المخاطر</h3>
                <p className="text-sm text-red-700">
                  يوجد {dashboardData.riskAlerts.filter(a => a.severity === 'critical').length} تنبيه حرج يحتاج للمراجعة الفورية.
                </p>
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
            subtitle="إيرادات هذا الشهر"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: '📊' },
                { id: 'transactions', label: 'المعاملات', icon: '💳' },
                { id: 'risks', label: 'تنبيهات المخاطر', icon: '⚠️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">نظرة عامة على النظام</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.overview.totalRestaurants}</div>
                  <p className="text-sm text-blue-800">إجمالي المطاعم</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.overview.activeContracts}</div>
                  <p className="text-sm text-green-800">عقود نشطة</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">الحجم الشهري</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(dashboardData.overview.monthlyVolume)}
                </div>
                <p className="text-sm text-purple-800">حجم المعاملات هذا الشهر</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">المعاملات الأخيرة</h2>
              <Button>عرض جميع المعاملات</Button>
            </div>
            
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={{...transaction, currency: 'SAR'}}
                  onClick={() => console.log('عرض تفاصيل المعاملة', transaction.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">تنبيهات المخاطر</h2>
              <Button>إعدادات التنبيهات</Button>
            </div>
            
            <div className="space-y-4">
              {dashboardData.riskAlerts.map((alert) => (
                <RiskAlert
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => console.log('إقرار التنبيه', alert.id)}
                  onAction={() => console.log('اتخاذ إجراء', alert.id)}
                />
              ))}
            </div>

            {dashboardData.riskAlerts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تنبيهات مخاطر</h3>
                <p className="text-gray-600">جميع العمليات تسير بسلاسة</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
