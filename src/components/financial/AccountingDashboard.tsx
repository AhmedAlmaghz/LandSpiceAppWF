'use client'

import React, { useState, useEffect } from 'react'
import { FinancialStats, TrialBalance, IncomeStatement, FinancialEvent, CurrencyCode } from '@/lib/financial/types'
import { AccountingService } from '@/lib/financial/accounting-service'
import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import PieChart from '@/components/charts/PieChart'
import LineChart from '@/components/charts/LineChart'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AccountingDashboardProps {
  onViewChartOfAccounts?: () => void
  onCreateJournalEntry?: () => void
  onViewTrialBalance?: () => void
  onCreateInvoice?: () => void
  onViewReports?: () => void
  userRole?: 'manager' | 'accountant' | 'staff' | 'viewer'
  restaurantId?: string
}

export default function AccountingDashboard({
  onViewChartOfAccounts,
  onCreateJournalEntry,
  onViewTrialBalance,
  onCreateInvoice,
  onViewReports,
  userRole = 'accountant',
  restaurantId
}: AccountingDashboardProps) {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null)
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null)
  const [events, setEvents] = useState<FinancialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [baseCurrency] = useState<CurrencyCode>('YER')

  const accountingService = AccountingService.getInstance()

  useEffect(() => {
    loadDashboardData()
    setupEventListeners()
    
    return () => {
      // Clean up event listeners
    }
  }, [selectedPeriod, restaurantId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load accounts data and stats
      const accountsResult = await accountingService.getAccounts()
      setStats(accountsResult.stats)

      // Load trial balance
      const trialBalanceData = await accountingService.getTrialBalance()
      setTrialBalance(trialBalanceData)

      // Load income statement for selected period
      const { startDate, endDate } = getPeriodDates(selectedPeriod)
      const incomeStatementData = await accountingService.getIncomeStatement(startDate, endDate)
      setIncomeStatement(incomeStatementData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupEventListeners = () => {
    const handleFinancialEvent = (event: FinancialEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
    }

    accountingService.addEventListener(handleFinancialEvent)
  }

  const getPeriodDates = (period: 'month' | 'quarter' | 'year') => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    switch (period) {
      case 'month':
        return {
          startDate: new Date(currentYear, currentMonth, 1),
          endDate: new Date(currentYear, currentMonth + 1, 0)
        }
      case 'quarter':
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3
        return {
          startDate: new Date(currentYear, quarterStartMonth, 1),
          endDate: new Date(currentYear, quarterStartMonth + 3, 0)
        }
      case 'year':
        return {
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear, 11, 31)
        }
    }
  }

  const formatCurrencyValue = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: baseCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getFinancialHealthColor = (ratio: number, type: 'profit' | 'growth' | 'ratio') => {
    switch (type) {
      case 'profit':
        return ratio > 0 ? 'text-green-600' : 'text-red-600'
      case 'growth':
        return ratio > 0 ? 'text-green-600' : ratio < -5 ? 'text-red-600' : 'text-yellow-600'
      case 'ratio':
        return ratio > 1.5 ? 'text-green-600' : ratio > 1.0 ? 'text-yellow-600' : 'text-red-600'
    }
  }

  const chartOfAccountsData = trialBalance ? [
    { name: 'الأصول', value: trialBalance.items.filter(item => item.accountType === 'assets').reduce((sum, item) => sum + Math.abs(item.netBalance), 0), color: '#10b981' },
    { name: 'الخصوم', value: trialBalance.items.filter(item => item.accountType === 'liabilities').reduce((sum, item) => sum + Math.abs(item.netBalance), 0), color: '#f59e0b' },
    { name: 'حقوق الملكية', value: trialBalance.items.filter(item => item.accountType === 'equity').reduce((sum, item) => sum + Math.abs(item.netBalance), 0), color: '#3b82f6' },
    { name: 'الإيرادات', value: trialBalance.items.filter(item => item.accountType === 'revenue').reduce((sum, item) => sum + Math.abs(item.netBalance), 0), color: '#8b5cf6' },
    { name: 'المصروفات', value: trialBalance.items.filter(item => item.accountType === 'expenses').reduce((sum, item) => sum + Math.abs(item.netBalance), 0), color: '#ef4444' }
  ] : []

  const revenueChartData = incomeStatement ? [
    { period: 'يناير', revenue: 45000, expenses: 35000 },
    { period: 'فبراير', revenue: 52000, expenses: 38000 },
    { period: 'مارس', revenue: 48000, expenses: 36000 },
    { period: 'أبريل', revenue: 58000, expenses: 42000 },
    { period: 'مايو', revenue: 55000, expenses: 40000 },
    { period: 'يونيو', revenue: 62000, expenses: 45000 }
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم المحاسبية</h1>
          <p className="text-gray-600">
            نظرة شاملة على الوضع المالي والمحاسبي للشركة
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'quarter'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ربع سنوي
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              سنوي
            </button>
          </div>

          {onCreateJournalEntry && (userRole === 'manager' || userRole === 'accountant') && (
            <Button onClick={onCreateJournalEntry}>
              إنشاء قيد محاسبي
            </Button>
          )}
        </div>
      </div>

      {/* Financial Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي الإيرادات"
            value={formatCurrencyValue(stats.totalRevenue)}
            change={stats.monthlyGrowthRate}
            changeLabel="الشهر الماضي"
            icon="💰"
            trend={stats.monthlyGrowthRate > 0 ? 'up' : 'down'}
            color="green"
          />
          
          <StatCard
            title="إجمالي المصروفات"
            value={formatCurrencyValue(stats.totalExpenses)}
            change={-stats.monthlyGrowthRate * 0.8}
            changeLabel="الشهر الماضي"
            icon="📊"
            trend={stats.totalExpenses < stats.totalRevenue ? 'up' : 'down'}
            color="orange"
          />
          
          <StatCard
            title="صافي الربح"
            value={formatCurrencyValue(stats.netProfit)}
            change={stats.grossProfitMargin}
            changeLabel="هامش الربح %"
            icon={stats.netProfit > 0 ? "📈" : "📉"}
            trend={stats.netProfit > 0 ? 'up' : 'down'}
            color={stats.netProfit > 0 ? 'green' : 'red'}
          />
          
          <StatCard
            title="إجمالي الأصول"
            value={formatCurrencyValue(stats.totalAssets)}
            change={stats.yearOverYearGrowth}
            changeLabel="نمو سنوي %"
            icon="🏢"
            trend={stats.yearOverYearGrowth > 0 ? 'up' : 'down'}
            color="blue"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Distribution Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Types Distribution */}
          {chartOfAccountsData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">توزيع أنواع الحسابات</h2>
                {onViewChartOfAccounts && (
                  <button
                    onClick={onViewChartOfAccounts}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    عرض شجرة الحسابات
                  </button>
                )}
              </div>
              <div className="h-64">
                <PieChart
                  data={chartOfAccountsData}
                  centerLabel="أنواع الحسابات"
                  valueFormat={(value) => formatCurrencyValue(value)}
                />
              </div>
            </div>
          )}

          {/* Revenue vs Expenses Trend */}
          {revenueChartData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">اتجاه الإيرادات والمصروفات</h2>
                {onViewReports && (
                  <button
                    onClick={onViewReports}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    عرض التقارير المفصلة
                  </button>
                )}
              </div>
              <div className="h-64">
                <LineChart
                  data={revenueChartData}
                  xDataKey="period"
                  lines={[
                    { dataKey: 'revenue', name: 'الإيرادات', color: '#10b981' },
                    { dataKey: 'expenses', name: 'المصروفات', color: '#ef4444' }
                  ]}
                  valueFormat={(value) => formatCurrencyValue(value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات السريعة</h2>
            <div className="space-y-3">
              {onCreateJournalEntry && (userRole === 'manager' || userRole === 'accountant') && (
                <button
                  onClick={onCreateJournalEntry}
                  className="w-full flex items-center space-x-3 space-x-reverse p-3 text-right bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <span className="text-green-600 text-xl">📝</span>
                  <span className="text-green-700 font-medium">إنشاء قيد محاسبي</span>
                </button>
              )}
              
              {onCreateInvoice && (userRole === 'manager' || userRole === 'accountant') && (
                <button
                  onClick={onCreateInvoice}
                  className="w-full flex items-center space-x-3 space-x-reverse p-3 text-right bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-blue-600 text-xl">🧾</span>
                  <span className="text-blue-700 font-medium">إنشاء فاتورة</span>
                </button>
              )}
              
              {onViewTrialBalance && (
                <button
                  onClick={onViewTrialBalance}
                  className="w-full flex items-center space-x-3 space-x-reverse p-3 text-right bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <span className="text-purple-600 text-xl">⚖️</span>
                  <span className="text-purple-700 font-medium">ميزان المراجعة</span>
                </button>
              )}
              
              {onViewChartOfAccounts && (
                <button
                  onClick={onViewChartOfAccounts}
                  className="w-full flex items-center space-x-3 space-x-reverse p-3 text-right bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-600 text-xl">🌳</span>
                  <span className="text-gray-700 font-medium">شجرة الحسابات</span>
                </button>
              )}
              
              {onViewReports && (
                <button
                  onClick={onViewReports}
                  className="w-full flex items-center space-x-3 space-x-reverse p-3 text-right bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <span className="text-orange-600 text-xl">📊</span>
                  <span className="text-orange-700 font-medium">التقارير المالية</span>
                </button>
              )}
            </div>
          </div>

          {/* Trial Balance Summary */}
          {trialBalance && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">ميزان المراجعة</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  trialBalance.isBalanced 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {trialBalance.isBalanced ? 'متوازن' : 'غير متوازن'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">إجمالي المدين:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrencyValue(trialBalance.totalDebits)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">إجمالي الدائن:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrencyValue(trialBalance.totalCredits)}
                  </span>
                </div>
                
                {trialBalance.variance !== 0 && (
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm text-red-600">الفرق:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrencyValue(Math.abs(trialBalance.variance))}
                    </span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 border-t pt-2">
                  آخر تحديث: {formatDate(trialBalance.generatedAt)}
                </div>
              </div>
            </div>
          )}

          {/* Recent Financial Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">النشاط المالي الحديث</h2>
            {events.length > 0 ? (
              <ActivityFeed
                activities={events.map(event => ({
                  id: event.id,
                  type: event.type as any,
                  title: event.title,
                  description: event.description,
                  timestamp: event.createdAt,
                  user: 'النظام',
                  metadata: event.data
                }))}
                showFilters={false}
                compact={true}
              />
            ) : (
              <div className="text-center py-4">
                <span className="text-gray-500 text-sm">لا توجد أنشطة حديثة</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">مؤشرات الصحة المالية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profitability */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">الربحية</h3>
              <div className={`text-2xl font-bold ${getFinancialHealthColor(stats.grossProfitMargin, 'profit')}`}>
                {stats.grossProfitMargin.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">هامش الربح الإجمالي</p>
            </div>
            
            {/* Growth */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">النمو</h3>
              <div className={`text-2xl font-bold ${getFinancialHealthColor(stats.yearOverYearGrowth, 'growth')}`}>
                {stats.yearOverYearGrowth > 0 ? '+' : ''}{stats.yearOverYearGrowth.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500">نمو سنوي</p>
            </div>
            
            {/* Liquidity */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💧</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">السيولة</h3>
              <div className={`text-2xl font-bold ${getFinancialHealthColor(1.5, 'ratio')}`}>
                1.5
              </div>
              <p className="text-sm text-gray-500">النسبة الجارية</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
