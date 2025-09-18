// Marketer Statistics Component
// مكون إحصائيات المسوق

import React from 'react'
import StatCard from '@/components/dashboard/StatCard'

interface MarketerStatsData {
  overview: {
    totalLeads: number
    activeLeads: number
    convertedThisMonth: number
    conversionRate: number
    totalRevenue: number
    avgDealSize: number
    activeCampaigns: number
    monthlyTarget: number
  }
  performance: {
    leadsGenerated: number
    meetingsScheduled: number
    proposalsSent: number
    dealsWon: number
    totalCommission: number
    monthlyCommission: number
  }
  commissions: {
    pending: number
    paid: number
    disputed: number
    thisMonth: number
    lastMonth: number
  }
}

interface MarketerStatsProps {
  data: MarketerStatsData
  period?: 'day' | 'week' | 'month' | 'quarter'
  loading?: boolean
}

export default function MarketerStats({
  data,
  period = 'month',
  loading = false
}: MarketerStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getTargetProgress = () => {
    if (data.overview.monthlyTarget === 0) return 0
    return Math.round((data.commissions.thisMonth / data.overview.monthlyTarget) * 100)
  }

  const getConversionTrend = () => {
    // محاكاة اتجاه معدل التحويل
    const trends = ['↗️ +2.3%', '↘️ -1.1%', '→ 0.5%', '↗️ +3.8%']
    return trends[Math.floor(Math.random() * trends.length)]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي العملاء المحتملين"
          value={data.overview.totalLeads.toString()}
          icon="👥"
          color="blue"
          subtitle={`${data.overview.activeLeads} نشط`}
          trend={data.overview.activeLeads > data.overview.totalLeads * 0.3 ? 'up' : 'down'}
        />
        
        <StatCard
          title="معدل التحويل"
          value={`${data.overview.conversionRate}%`}
          icon="📈"
          color="green"
          subtitle={`${data.overview.convertedThisMonth} هذا الشهر`}
          trend={getConversionTrend()}
        />
        
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(data.overview.totalRevenue)}
          icon="💰"
          color="purple"
          subtitle={`متوسط ${formatCurrency(data.overview.avgDealSize)}`}
        />
        
        <StatCard
          title="العمولة الشهرية"
          value={formatCurrency(data.performance.monthlyCommission)}
          icon="💎"
          color="orange"
          subtitle={`${getTargetProgress()}% من الهدف`}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Funnel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">قمع المبيعات</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">عملاء محتملين</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {data.performance.leadsGenerated}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">اجتماعات مجدولة</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {data.performance.meetingsScheduled}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">عروض مُرسلة</span>
              </div>
              <span className="text-lg font-bold text-orange-600">
                {data.performance.proposalsSent}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">صفقات مُبرمة</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {data.performance.dealsWon}
              </span>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">معدل التحويل الإجمالي</div>
            <div className="text-2xl font-bold text-green-600">
              {data.performance.leadsGenerated > 0 
                ? Math.round((data.performance.dealsWon / data.performance.leadsGenerated) * 100)
                : 0}%
            </div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تفصيل العمولات</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">معلقة</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(data.commissions.pending)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((data.commissions.pending / data.performance.totalCommission) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">مدفوعة</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(data.commissions.paid)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((data.commissions.paid / data.performance.totalCommission) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {data.commissions.disputed > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">متنازع عليها</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(data.commissions.disputed)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((data.commissions.disputed / data.performance.totalCommission) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">إجمالي العمولات</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(data.performance.totalCommission)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مقارنة شهرية</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-blue-600 font-medium">هذا الشهر</div>
                <div className="text-lg font-bold text-blue-800">
                  {formatCurrency(data.commissions.thisMonth)}
                </div>
              </div>
              <div className="text-2xl">📊</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600 font-medium">الشهر الماضي</div>
                <div className="text-lg font-bold text-gray-700">
                  {formatCurrency(data.commissions.lastMonth)}
                </div>
              </div>
              <div className="text-2xl">📈</div>
            </div>

            {/* Growth Indicator */}
            <div className="pt-2 border-t">
              <div className="text-sm text-gray-600 mb-1">النمو الشهري</div>
              <div className={`text-lg font-bold ${
                data.commissions.thisMonth >= data.commissions.lastMonth 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {data.commissions.lastMonth > 0 
                  ? `${Math.round(((data.commissions.thisMonth - data.commissions.lastMonth) / data.commissions.lastMonth) * 100)}%`
                  : '0%'
                }
                {data.commissions.thisMonth >= data.commissions.lastMonth ? ' ↗️' : ' ↘️'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص النشاط</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{data.overview.activeCampaigns}</div>
            <div className="text-sm text-gray-600">حملات نشطة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.performance.leadsGenerated > 0 && data.performance.meetingsScheduled > 0
                ? Math.round((data.performance.meetingsScheduled / data.performance.leadsGenerated) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">معدل تحديد الاجتماعات</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.performance.meetingsScheduled > 0 && data.performance.proposalsSent > 0
                ? Math.round((data.performance.proposalsSent / data.performance.meetingsScheduled) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">معدل إرسال العروض</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.performance.proposalsSent > 0 && data.performance.dealsWon > 0
                ? Math.round((data.performance.dealsWon / data.performance.proposalsSent) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">معدل إبرام الصفقات</div>
          </div>
        </div>
      </div>
    </div>
  )
}
