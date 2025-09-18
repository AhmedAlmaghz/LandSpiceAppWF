'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface MarketerDashboardData {
  marketer: {
    id: string
    name: string
    region: string
    joinDate: Date
  }
  performance: {
    totalClients: number
    activeContracts: number
    monthlyTarget: number
    achievedPercentage: number
    commission: number
  }
  clientPortfolio: Array<{
    id: string
    restaurantName: string
    contractValue: number
    monthlyQuota: number
    status: string
    signDate: Date
    nextRenewal?: Date
  }>
  leads: {
    total: number
    contacted: number
    scheduled: number
    converted: number
    conversionRate: number
  }
  recentActivity: Array<{
    id: string
    type: 'client_signed' | 'lead_contacted' | 'meeting_scheduled' | 'renewal_completed'
    description: string
    clientName: string
    date: Date
    value?: number
  }>
  upcomingTasks: Array<{
    id: string
    type: 'follow_up' | 'meeting' | 'renewal_reminder' | 'contract_review'
    title: string
    clientName: string
    dueDate: Date
    priority: 'high' | 'medium' | 'low'
  }>
}

export default function MarketerDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<MarketerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي
      const mockData: MarketerDashboardData = {
        marketer: {
          id: 'm1',
          name: 'أحمد المسوق',
          region: 'الرياض الكبرى',
          joinDate: new Date('2024-06-01')
        },
        performance: {
          totalClients: 15,
          activeContracts: 12,
          monthlyTarget: 20000,
          achievedPercentage: 85,
          commission: 17000
        },
        clientPortfolio: [
          {
            id: 'c1',
            restaurantName: 'مطعم البيك',
            contractValue: 216000,
            monthlyQuota: 18000,
            status: 'active',
            signDate: new Date('2024-08-15'),
            nextRenewal: new Date('2025-08-15')
          },
          {
            id: 'c2', 
            restaurantName: 'مطعم الطازج',
            contractValue: 144000,
            monthlyQuota: 12000,
            status: 'active',
            signDate: new Date('2024-10-01'),
            nextRenewal: new Date('2025-10-01')
          },
          {
            id: 'c3',
            restaurantName: 'مطعم الدانة',
            contractValue: 180000,
            monthlyQuota: 15000,
            status: 'pending_renewal',
            signDate: new Date('2024-01-10'),
            nextRenewal: new Date('2025-01-10')
          }
        ],
        leads: {
          total: 45,
          contacted: 38,
          scheduled: 12,
          converted: 8,
          conversionRate: 17.8
        },
        recentActivity: [
          {
            id: '1',
            type: 'client_signed',
            description: 'توقيع عقد جديد',
            clientName: 'مطعم السلام',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            value: 150000
          },
          {
            id: '2',
            type: 'meeting_scheduled',
            description: 'جدولة اجتماع مع العميل',
            clientName: 'مطعم الشام',
            date: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'lead_contacted',
            description: 'متابعة مع عميل محتمل',
            clientName: 'مطعم المدينة',
            date: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        ],
        upcomingTasks: [
          {
            id: '1',
            type: 'renewal_reminder',
            title: 'تذكير بتجديد العقد',
            clientName: 'مطعم الدانة',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priority: 'high'
          },
          {
            id: '2',
            type: 'meeting',
            title: 'اجتماع مع عميل جديد',
            clientName: 'مطعم النخيل',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            priority: 'medium'
          },
          {
            id: '3',
            type: 'follow_up',
            title: 'متابعة عرض السعر',
            clientName: 'مطعم الواحة',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            priority: 'high'
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

  // التحقق من صلاحية المسوق
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'marketer') {
    redirect('/auth/signin')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'client_signed': return '✍️'
      case 'lead_contacted': return '📞'
      case 'meeting_scheduled': return '📅'
      case 'renewal_completed': return '🔄'
      default: return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'client_signed': return 'text-green-600 bg-green-50'
      case 'lead_contacted': return 'text-blue-600 bg-blue-50'
      case 'meeting_scheduled': return 'text-purple-600 bg-purple-50'
      case 'renewal_completed': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'follow_up': return '📞'
      case 'meeting': return '🤝'
      case 'renewal_reminder': return '🔔'
      case 'contract_review': return '📋'
      default: return '📝'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم المسوق...</p>
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
                📈 لوحة المسوق - {dashboardData.marketer.name}
              </h1>
              <p className="text-gray-600">
                منطقة {dashboardData.marketer.region} - أهلاً بك، {session.user.name || session.user.username}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-center px-3 py-1 bg-green-100 rounded-lg">
                <div className="text-sm font-bold text-green-600">
                  {formatCurrency(dashboardData.performance.commission)}
                </div>
                <div className="text-xs text-green-800">عمولة الشهر</div>
              </div>
              <Button variant="outline" size="sm">
                👥 إضافة عميل
              </Button>
              <Button variant="primary" size="sm">
                📊 تقرير الأداء
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Alert */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-blue-800">
                أداء ممتاز! حققت {dashboardData.performance.achievedPercentage}% من الهدف الشهري
              </h3>
              <p className="text-sm text-blue-700">
                تحتاج {formatCurrency(dashboardData.performance.monthlyTarget - (dashboardData.performance.monthlyTarget * dashboardData.performance.achievedPercentage / 100))} لتحقيق الهدف كاملاً
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clients */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">محفظة العملاء</CardTitle>
              <div className="text-2xl">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.performance.totalClients}</div>
              <p className="text-xs text-green-600">
                {dashboardData.performance.activeContracts} عقد نشط
              </p>
            </CardContent>
          </Card>

          {/* Monthly Target */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الهدف الشهري</CardTitle>
              <div className="text-2xl">🎯</div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(dashboardData.performance.monthlyTarget)}
              </div>
              <p className="text-xs text-blue-600">
                تم تحقيق {dashboardData.performance.achievedPercentage}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.performance.achievedPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Conversion */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
              <div className="text-2xl">📊</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.leads.conversionRate}%</div>
              <p className="text-xs text-gray-600">
                {dashboardData.leads.converted} من {dashboardData.leads.total} عميل محتمل
              </p>
            </CardContent>
          </Card>

          {/* Commission */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العمولة</CardTitle>
              <div className="text-2xl">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(dashboardData.performance.commission)}
              </div>
              <p className="text-xs text-gray-600">هذا الشهر</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Portfolio */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>محفظة العملاء</CardTitle>
                <CardDescription>العملاء والعقود المُدارة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.clientPortfolio.map((client) => (
                    <div key={client.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{client.restaurantName}</h4>
                          <p className="text-sm text-gray-600">
                            الحصة الشهرية: {client.monthlyQuota.toLocaleString()} وحدة
                          </p>
                        </div>
                        <span className={`status-badge ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' : 
                          client.status === 'pending_renewal' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status === 'active' ? 'نشط' : 
                           client.status === 'pending_renewal' ? 'بحاجة تجديد' : 'غير محدد'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">قيمة العقد:</span> {formatCurrency(client.contractValue)}
                        </div>
                        <div>
                          <span className="font-medium">تاريخ التوقيع:</span> {formatDate(client.signDate)}
                        </div>
                        {client.nextRenewal && (
                          <div className="col-span-2">
                            <span className="font-medium">التجديد القادم:</span> {formatDate(client.nextRenewal)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 space-x-reverse mt-3">
                        <Button size="sm" variant="outline">
                          📞 اتصال
                        </Button>
                        <Button size="sm" variant="ghost">
                          📋 تفاصيل
                        </Button>
                        {client.status === 'pending_renewal' && (
                          <Button size="sm" variant="warning">
                            🔄 تجديد
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="ghost" className="w-full">
                    عرض جميع العملاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks and Activity */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  المهام القادمة
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {dashboardData.upcomingTasks.length}
                  </span>
                </CardTitle>
                <CardDescription>مهام تحتاج متابعة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.upcomingTasks.map((task) => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-sm">{getTaskIcon(task.type)}</span>
                        <h4 className="font-medium text-sm">{task.title}</h4>
                      </div>
                      <span className={`status-badge text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>🏪 {task.clientName}</p>
                      <p>📅 {formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع المهام
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>آخر العمليات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <span className="text-sm">{getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-600">{activity.clientName}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      {activity.value && (
                        <p className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.value)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button variant="ghost" className="w-full mt-4">
                  عرض جميع الأنشطة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leads Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>إدارة العملاء المحتملين</CardTitle>
              <CardDescription>قمع المبيعات ومعدلات التحويل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {dashboardData.leads.total}
                  </div>
                  <p className="text-sm text-blue-800">إجمالي العملاء المحتملين</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {dashboardData.leads.contacted}
                  </div>
                  <p className="text-sm text-green-800">تم التواصل معهم</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {dashboardData.leads.scheduled}
                  </div>
                  <p className="text-sm text-purple-800">مجدول اجتماع</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {dashboardData.leads.converted}
                  </div>
                  <p className="text-sm text-orange-800">تم التحويل</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {dashboardData.leads.conversionRate}%
                  </div>
                  <p className="text-sm text-red-800">معدل التحويل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
