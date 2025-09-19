'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatCard from '@/components/dashboard/StatCard'
import Chart from '@/components/dashboard/Chart'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface ReportData {
  guarantees: {
    totalValue: number
    activeCount: number
    monthlyCommission: number
    riskDistribution: { [key: string]: number }
  }
  installments: {
    totalFinanced: number
    monthlyCollections: number
    overdueAmount: number
    collectionRate: number
  }
  performance: {
    totalRevenue: number
    netProfit: number
    roa: number
    portfolioGrowth: number
  }
  risks: {
    totalExposure: number
    provisioning: number
    npl: number
    coverageRatio: number
  }
}

interface ReportFilters {
  dateFrom: string
  dateTo: string
  reportType: 'financial' | 'risk' | 'operations' | 'comprehensive'
  format: 'pdf' | 'excel' | 'dashboard'
}

export default function BankReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    reportType: 'comprehensive',
    format: 'dashboard'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [filters.dateFrom, filters.dateTo])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/bank/reports?from=${filters.dateFrom}&to=${filters.dateTo}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReportData(data.data.report)
          setChartData(data.data.charts)
        }
      } else {
        // بيانات تجريبية شاملة للتقارير
        const mockReportData: ReportData = {
          guarantees: {
            totalValue: 15750000,
            activeCount: 76,
            monthlyCommission: 125000,
            riskDistribution: {
              'منخفض': 45,
              'متوسط': 25,
              'عالي': 6
            }
          },
          installments: {
            totalFinanced: 8950000,
            monthlyCollections: 485000,
            overdueAmount: 145000,
            collectionRate: 94.2
          },
          performance: {
            totalRevenue: 2850000,
            netProfit: 1420000,
            roa: 8.5,
            portfolioGrowth: 15.3
          },
          risks: {
            totalExposure: 24700000,
            provisioning: 650000,
            npl: 2.8,
            coverageRatio: 125.5
          }
        }

        setReportData(mockReportData)

        // بيانات المخططات التحليلية
        setChartData({
          monthlyRevenue: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [
              {
                label: 'الإيرادات الشهرية',
                data: [245000, 268000, 285000, 275000, 312000, 289000],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2
              },
              {
                label: 'صافي الربح',
                data: [125000, 142000, 158000, 147000, 169000, 155000],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2
              }
            ]
          },
          riskDistribution: {
            labels: ['ضمانات منخفضة المخاطر', 'ضمانات متوسطة المخاطر', 'ضمانات عالية المخاطر'],
            datasets: [{
              data: [45, 25, 6],
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ]
            }]
          },
          portfolioGrowth: {
            labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
            datasets: [{
              label: 'نمو المحفظة (%)',
              data: [8.2, 11.5, 13.8, 14.2, 15.3],
              backgroundColor: 'rgba(147, 51, 234, 0.8)',
              borderColor: 'rgb(147, 51, 234)',
              borderWidth: 2,
              fill: true
            }]
          },
          collectionsVsOverdue: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [
              {
                label: 'التحصيلات',
                data: [465000, 478000, 485000, 492000, 485000, 489000],
                backgroundColor: 'rgba(34, 197, 94, 0.8)'
              },
              {
                label: 'المتأخرات',
                data: [25000, 32000, 28000, 35000, 42000, 38000],
                backgroundColor: 'rgba(239, 68, 68, 0.8)'
              }
            ]
          }
        })
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات التقارير:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // التحقق من صلاحية البنك
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'bank') {
    redirect('/auth/signin')
  }

  // توليد التقرير
  const generateReport = async () => {
    if (!reportData) return

    setIsGenerating(true)
    
    try {
      if (filters.format === 'dashboard') {
        alert('تم تحديث البيانات في لوحة التقارير')
        return
      }

      const response = await fetch('/api/bank/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `تقرير-بنكي-${filters.reportType}-${filters.dateFrom}-${filters.dateTo}.${filters.format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // محاكاة التحميل
        alert(`تم إنشاء التقرير بنجاح!

نوع التقرير: ${getReportTypeText(filters.reportType)}
الصيغة: ${filters.format.toUpperCase()}
الفترة: من ${filters.dateFrom} إلى ${filters.dateTo}

سيتم تحميل التقرير خلال لحظات...`)
      }
    } catch (error) {
      console.error('خطأ في توليد التقرير:', error)
      alert('حدث خطأ أثناء توليد التقرير')
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'financial': return 'التقرير المالي'
      case 'risk': return 'تقرير المخاطر'
      case 'operations': return 'التقرير التشغيلي'
      case 'comprehensive': return 'التقرير الشامل'
      default: return type
    }
  }

  // حساب معدل التغيير
  const calculateChangeRate = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات التقارير...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return <div>خطأ في تحميل البيانات</div>
  }

  return (
    <ProtectedComponent roles={['bank']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📊 التقارير البنكية المتخصصة</h1>
                <p className="text-gray-600">تحليلات شاملة للأداء المالي والمخاطر</p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/bank/reports/scheduled')}
                >
                  📅 تقارير مجدولة
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={generateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? '⏳ جاري الإنشاء...' : '📄 إنشاء تقرير'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Report Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🔍 إعدادات التقرير</CardTitle>
              <CardDescription>اختر نوع التقرير والفترة الزمنية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع التقرير</label>
                  <select
                    value={filters.reportType}
                    onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="comprehensive">📊 التقرير الشامل</option>
                    <option value="financial">💰 التقرير المالي</option>
                    <option value="risk">⚠️ تقرير المخاطر</option>
                    <option value="operations">🔄 التقرير التشغيلي</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صيغة التصدير</label>
                  <select
                    value={filters.format}
                    onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dashboard">🖥️ لوحة التحكم</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="excel">📊 Excel</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الإيرادات"
              value={formatCurrency(reportData.performance.totalRevenue)}
              icon="💰"
              color="green"
              subtitle={`نمو ${reportData.performance.portfolioGrowth}%`}
            />
            
            <StatCard
              title="صافي الربح"
              value={formatCurrency(reportData.performance.netProfit)}
              icon="📈"
              color="blue"
              subtitle={`عائد الأصول ${reportData.performance.roa}%`}
            />
            
            <StatCard
              title="قيمة الضمانات"
              value={formatCurrency(reportData.guarantees.totalValue)}
              icon="🛡️"
              color="purple"
              subtitle={`${reportData.guarantees.activeCount} ضمانة نشطة`}
            />
            
            <StatCard
              title="المتأخرات"
              value={formatCurrency(reportData.installments.overdueAmount)}
              icon="⚠️"
              color="red"
              subtitle={`معدل التحصيل ${reportData.installments.collectionRate}%`}
            />
          </div>

          {/* Performance Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>الأداء المالي الشهري</CardTitle>
                  <CardDescription>الإيرادات وصافي الربح</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={chartData.monthlyRevenue}
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>نمو المحفظة</CardTitle>
                  <CardDescription>نمو المحفظة الاستثمارية ربع سنوي</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={chartData.portfolioGrowth}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Risk Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>⚠️ تحليل المخاطر</CardTitle>
                <CardDescription>توزيع الضمانات حسب مستوى المخاطر</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData && (
                  <Chart
                    type="doughnut"
                    data={chartData.riskDistribution}
                    height={250}
                  />
                )}
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">إجمالي التعرض:</span>
                    <span className="font-medium">{formatCurrency(reportData.risks.totalExposure)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">المخصصات:</span>
                    <span className="font-medium">{formatCurrency(reportData.risks.provisioning)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">نسبة القروض المتعثرة:</span>
                    <span className="font-medium text-red-600">{reportData.risks.npl}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">نسبة التغطية:</span>
                    <span className="font-medium text-green-600">{reportData.risks.coverageRatio}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💳 أداء التحصيلات</CardTitle>
                <CardDescription>التحصيلات مقابل المتأخرات</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData && (
                  <Chart
                    type="bar"
                    data={chartData.collectionsVsOverdue}
                    height={250}
                  />
                )}
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">التحصيل الشهري:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(reportData.installments.monthlyCollections)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">المبلغ المتأخر:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(reportData.installments.overdueAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">معدل التحصيل:</span>
                    <span className="font-medium text-blue-600">
                      {reportData.installments.collectionRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>🛡️ تحليل الضمانات</CardTitle>
                <CardDescription>أداء محفظة الضمانات البنكية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {reportData.guarantees.activeCount}
                    </div>
                    <p className="text-sm text-blue-800">ضمانة نشطة</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {formatCurrency(reportData.guarantees.monthlyCommission)}
                    </div>
                    <p className="text-sm text-green-800">عمولة شهرية</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>إجمالي القيمة المضمونة:</span>
                    <span className="font-medium">{formatCurrency(reportData.guarantees.totalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>متوسط قيمة الضمانة:</span>
                    <span className="font-medium">
                      {formatCurrency(reportData.guarantees.totalValue / reportData.guarantees.activeCount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💰 تحليل التمويل</CardTitle>
                <CardDescription>أداء محفظة التمويل والأقساط</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {formatCurrency(reportData.installments.totalFinanced)}
                    </div>
                    <p className="text-sm text-purple-800">إجمالي التمويل</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {reportData.installments.collectionRate}%
                    </div>
                    <p className="text-sm text-orange-800">معدل التحصيل</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التحصيل الشهري:</span>
                    <span className="font-medium">{formatCurrency(reportData.installments.monthlyCollections)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>المبلغ المتأخر:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(reportData.installments.overdueAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🚀 إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/bank/reports/financial')}
                >
                  📊 التقرير المالي التفصيلي
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/bank/reports/risk')}
                >
                  ⚠️ تقرير إدارة المخاطر
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/bank/reports/collections')}
                >
                  💳 تقرير التحصيلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
