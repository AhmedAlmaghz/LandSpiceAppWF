'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import Chart from '@/components/dashboard/Chart'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

interface MarketingMetrics {
  period: string
  campaignsLaunched: number
  totalBudget: number
  totalSpent: number
  totalRevenue: number
  roi: number
  clientsAcquired: number
  conversionRate: number
  avgDealSize: number
  customerLifetimeValue: number
  commissionEarned: number
  bonusReceived: number
  clientSatisfaction: number
  marketShare: number
}

interface ReportData {
  summary: MarketingMetrics
  monthlyData: MarketingMetrics[]
  campaignPerformance: Array<{
    campaignName: string
    type: string
    budget: number
    spent: number
    revenue: number
    roi: number
    clientsAcquired: number
  }>
  clientSegmentation: Array<{
    segment: string
    count: number
    revenue: number
    avgDealSize: number
    satisfaction: number
  }>
  regionalPerformance: Array<{
    region: string
    clients: number
    revenue: number
    marketPenetration: number
  }>
}

export default function MarketerReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      
      const mockData: ReportData = {
        summary: {
          period: 'يناير 2025',
          campaignsLaunched: 3,
          totalBudget: 165000,
          totalSpent: 65500,
          totalRevenue: 725000,
          roi: 1106,
          clientsAcquired: 32,
          conversionRate: 72.7,
          avgDealSize: 22656,
          customerLifetimeValue: 340000,
          commissionEarned: 63300,
          bonusReceived: 7000,
          clientSatisfaction: 4.6,
          marketShare: 18.5
        },
        monthlyData: [
          {
            period: 'سبتمبر 2024',
            campaignsLaunched: 2,
            totalBudget: 45000,
            totalSpent: 42000,
            totalRevenue: 280000,
            roi: 567,
            clientsAcquired: 12,
            conversionRate: 60.0,
            avgDealSize: 23333,
            customerLifetimeValue: 320000,
            commissionEarned: 25000,
            bonusReceived: 2000,
            clientSatisfaction: 4.3,
            marketShare: 15.2
          },
          {
            period: 'أكتوبر 2024',
            campaignsLaunched: 3,
            totalBudget: 60000,
            totalSpent: 58000,
            totalRevenue: 380000,
            roi: 555,
            clientsAcquired: 18,
            conversionRate: 66.7,
            avgDealSize: 21111,
            customerLifetimeValue: 325000,
            commissionEarned: 32000,
            bonusReceived: 3500,
            clientSatisfaction: 4.4,
            marketShare: 16.8
          },
          {
            period: 'نوفمبر 2024',
            campaignsLaunched: 2,
            totalBudget: 50000,
            totalSpent: 48000,
            totalRevenue: 350000,
            roi: 629,
            clientsAcquired: 15,
            conversionRate: 68.2,
            avgDealSize: 23333,
            customerLifetimeValue: 330000,
            commissionEarned: 28000,
            bonusReceived: 1500,
            clientSatisfaction: 4.5,
            marketShare: 17.2
          },
          {
            period: 'ديسمبر 2024',
            campaignsLaunched: 4,
            totalBudget: 85000,
            totalSpent: 81000,
            totalRevenue: 520000,
            roi: 542,
            clientsAcquired: 25,
            conversionRate: 71.4,
            avgDealSize: 20800,
            customerLifetimeValue: 335000,
            commissionEarned: 41000,
            bonusReceived: 4000,
            clientSatisfaction: 4.5,
            marketShare: 17.8
          },
          {
            period: 'يناير 2025',
            campaignsLaunched: 3,
            totalBudget: 165000,
            totalSpent: 65500,
            totalRevenue: 725000,
            roi: 1106,
            clientsAcquired: 32,
            conversionRate: 72.7,
            avgDealSize: 22656,
            customerLifetimeValue: 340000,
            commissionEarned: 63300,
            bonusReceived: 7000,
            clientSatisfaction: 4.6,
            marketShare: 18.5
          }
        ],
        campaignPerformance: [
          {
            campaignName: 'ترحيب المطاعم الجديدة',
            type: 'اكتساب',
            budget: 50000,
            spent: 32000,
            revenue: 385000,
            roi: 1203,
            clientsAcquired: 18
          },
          {
            campaignName: 'برنامج شراكة الموردين',
            type: 'اكتساب',
            budget: 35000,
            spent: 33500,
            revenue: 340000,
            roi: 1015,
            clientsAcquired: 14
          },
          {
            campaignName: 'عروض رمضان الخاصة',
            type: 'موسمية',
            budget: 80000,
            spent: 0,
            revenue: 0,
            roi: 0,
            clientsAcquired: 0
          }
        ],
        clientSegmentation: [
          {
            segment: 'مطاعم كبيرة',
            count: 8,
            revenue: 420000,
            avgDealSize: 52500,
            satisfaction: 4.8
          },
          {
            segment: 'مطاعم متوسطة',
            count: 15,
            revenue: 225000,
            avgDealSize: 15000,
            satisfaction: 4.5
          },
          {
            segment: 'مطاعم صغيرة',
            count: 22,
            revenue: 110000,
            avgDealSize: 5000,
            satisfaction: 4.3
          },
          {
            segment: 'موردين استراتيجيين',
            count: 5,
            revenue: 180000,
            avgDealSize: 36000,
            satisfaction: 4.7
          },
          {
            segment: 'موردين محليين',
            count: 12,
            revenue: 95000,
            avgDealSize: 7917,
            satisfaction: 4.4
          }
        ],
        regionalPerformance: [
          {
            region: 'أمانة العاصمة',
            clients: 22,
            revenue: 485000,
            marketPenetration: 28.5
          },
          {
            region: 'عدن',
            clients: 18,
            revenue: 320000,
            marketPenetration: 22.8
          },
          {
            region: 'تعز',
            clients: 12,
            revenue: 180000,
            marketPenetration: 18.2
          },
          {
            region: 'حضرموت',
            clients: 8,
            revenue: 125000,
            marketPenetration: 15.6
          },
          {
            region: 'إب',
            clients: 5,
            revenue: 75000,
            marketPenetration: 12.3
          }
        ]
      }

      setReportData(mockData)
    } catch (error) {
      console.error('خطأ في جلب بيانات التقارير:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true)
    try {
      console.log(`تصدير التقرير بصيغة ${format}`)
      // محاكاة التصدير
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('خطأ في التصدير:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'marketer') redirect('/auth/signin')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التقارير التسويقية...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return <div>خطأ في تحميل البيانات</div>
  }

  const monthlyRevenueChart = {
    labels: reportData.monthlyData.map(d => d.period),
    datasets: [{
      label: 'الإيرادات',
      data: reportData.monthlyData.map(d => d.totalRevenue),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2
    }, {
      label: 'العمولات',
      data: reportData.monthlyData.map(d => d.commissionEarned),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  }

  const clientSegmentChart = {
    labels: reportData.clientSegmentation.map(s => s.segment),
    datasets: [{
      data: reportData.clientSegmentation.map(s => s.revenue),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  }

  return (
    <ProtectedComponent roles={['marketer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📈 التقارير والتحليلات التسويقية</h1>
                <p className="text-gray-600">
                  تقرير شامل للأداء التسويقي - {reportData.summary.period}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="current_month">الشهر الحالي</option>
                  <option value="last_month">الشهر الماضي</option>
                  <option value="quarter">الربع الحالي</option>
                  <option value="year">السنة الحالية</option>
                </select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportReport('excel')}
                  disabled={isExporting}
                >
                  📊 Excel
                </Button>
                
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => exportReport('pdf')}
                  disabled={isExporting}
                >
                  📄 PDF
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Executive Summary */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl">📋 الملخص التنفيذي - {reportData.summary.period}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-700">إجمالي الإيرادات المحققة</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {reportData.summary.clientsAcquired}
                  </div>
                  <div className="text-sm text-gray-700">عميل جديد مكتسب</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {reportData.summary.roi}%
                  </div>
                  <div className="text-sm text-gray-700">عائد الاستثمار التسويقي</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {formatCurrency(reportData.summary.commissionEarned)}
                  </div>
                  <div className="text-sm text-gray-700">عمولات مكتسبة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="معدل التحويل"
              value={`${reportData.summary.conversionRate}%`}
              icon="🎯"
              color="blue"
            />
            
            <StatCard
              title="متوسط صفقة"
              value={formatCurrency(reportData.summary.avgDealSize)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="رضا العملاء"
              value={`⭐ ${reportData.summary.clientSatisfaction}`}
              icon="😊"
              color="yellow"
            />
            
            <StatCard
              title="حصة السوق"
              value={`${reportData.summary.marketShare}%`}
              icon="📊"
              color="purple"
            />
          </div>

          {/* Campaign Performance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🎯 أداء الحملات التسويقية</CardTitle>
              <CardDescription>تحليل مفصل لأداء كل حملة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحملة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الميزانية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المُنفق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROI</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العملاء</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.campaignPerformance.map((campaign, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {campaign.campaignName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(campaign.budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(campaign.spent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(campaign.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {campaign.roi}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.clientsAcquired}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>📈 الأداء الشهري</CardTitle>
                <CardDescription>تطور الإيرادات والعمولات</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  type="line"
                  data={monthlyRevenueChart}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🥧 توزيع العملاء</CardTitle>
                <CardDescription>الإيرادات حسب شرائح العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  type="doughnut"
                  data={clientSegmentChart}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          {/* Regional Performance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🗺️ الأداء الإقليمي</CardTitle>
              <CardDescription>توزيع العملاء والإيرادات حسب المحافظات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {reportData.regionalPerformance.map((region, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {region.clients}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {region.region}
                    </div>
                    <div className="text-xs text-green-600 mb-1">
                      {formatCurrency(region.revenue)}
                    </div>
                    <div className="text-xs text-gray-600">
                      اختراق: {region.marketPenetration}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Segmentation Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>👥 تحليل شرائح العملاء</CardTitle>
              <CardDescription>تفاصيل الأداء لكل شريحة عملاء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشريحة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العدد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متوسط الصفقة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرضا</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.clientSegmentation.map((segment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {segment.segment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {segment.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(segment.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(segment.avgDealSize)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          ⭐ {segment.satisfaction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
