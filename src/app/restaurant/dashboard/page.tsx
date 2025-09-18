'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RestaurantDashboardData {
  restaurant: {
    id: string
    name: string
    status: string
    monthlyQuota: number
    contractEndDate?: Date
  }
  inventory: {
    ketchupRemaining: number
    chiliRemaining: number
    lastDelivery?: Date
    nextDelivery?: Date
    lowStockAlert: boolean
  }
  currentMonth: {
    ketchupUsed: number
    chiliUsed: number
    remainingQuota: number
    utilizationPercentage: number
  }
  recentOrders: Array<{
    id: string
    type: 'ketchup' | 'chili'
    quantity: number
    date: Date
    status: string
  }>
  pendingTasks: Array<{
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    dueDate?: Date
  }>
}

export default function RestaurantDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<RestaurantDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي
      const mockData: RestaurantDashboardData = {
        restaurant: {
          id: 'r1',
          name: 'مطعم البيك',
          status: 'active',
          monthlyQuota: 18000,
          contractEndDate: new Date('2025-12-31')
        },
        inventory: {
          ketchupRemaining: 5000,
          chiliRemaining: 4800,
          lastDelivery: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          nextDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          lowStockAlert: false
        },
        currentMonth: {
          ketchupUsed: 4000,
          chiliUsed: 4200,
          remainingQuota: 9800,
          utilizationPercentage: 45.6
        },
        recentOrders: [
          {
            id: '1',
            type: 'ketchup',
            quantity: 2000,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: 'completed'
          },
          {
            id: '2',
            type: 'chili',
            quantity: 1500,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            status: 'completed'
          }
        ],
        pendingTasks: [
          {
            id: '1',
            title: 'تحديث شعار المطعم',
            description: 'يرجى مراجعة وتحديث شعار المطعم للطباعة القادمة',
            priority: 'medium',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            title: 'مراجعة الفاتورة الشهرية',
            description: 'مراجعة وتأكيد الفاتورة لشهر يناير',
            priority: 'high',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
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

  // التحقق من صلاحية المطعم
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'restaurant') {
    redirect('/auth/signin')
  }

  const getInventoryStatus = (remaining: number, quota: number) => {
    const percentage = (remaining / quota) * 100
    if (percentage < 20) return { color: 'text-red-600', bg: 'bg-red-100', status: 'منخفض جداً' }
    if (percentage < 40) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'منخفض' }
    return { color: 'text-green-600', bg: 'bg-green-100', status: 'جيد' }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم المطعم...</p>
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
                🏪 {dashboardData.restaurant.name}
              </h1>
              <p className="text-gray-600">أهلاً بك، {session.user.name || session.user.username}</p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm">
                📋 طلب جديد
              </Button>
              <Button variant="primary" size="sm">
                🎨 إدارة التصاميم
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Alert */}
        {dashboardData.inventory.lowStockAlert && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-yellow-800">تنبيه: مخزون منخفض</h3>
                <p className="text-sm text-yellow-700">المخزون المتبقي أصبح منخفضاً. يُنصح بطلب توريد جديد.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Quota */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحصة الشهرية</CardTitle>
              <div className="text-2xl">📊</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.restaurant.monthlyQuota.toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                استُخدم {dashboardData.currentMonth.utilizationPercentage}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.currentMonth.utilizationPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Ketchup Inventory */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مخزون الكاتشب</CardTitle>
              <div className="text-2xl">🍅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.inventory.ketchupRemaining.toLocaleString()}</div>
              <p className={`text-xs ${getInventoryStatus(dashboardData.inventory.ketchupRemaining, 9000).color}`}>
                {getInventoryStatus(dashboardData.inventory.ketchupRemaining, 9000).status}
              </p>
            </CardContent>
          </Card>

          {/* Chili Inventory */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مخزون الشطة</CardTitle>
              <div className="text-2xl">🌶️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.inventory.chiliRemaining.toLocaleString()}</div>
              <p className={`text-xs ${getInventoryStatus(dashboardData.inventory.chiliRemaining, 9000).color}`}>
                {getInventoryStatus(dashboardData.inventory.chiliRemaining, 9000).status}
              </p>
            </CardContent>
          </Card>

          {/* Next Delivery */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التوريد القادم</CardTitle>
              <div className="text-2xl">🚚</div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {dashboardData.inventory.nextDelivery ? formatDate(dashboardData.inventory.nextDelivery) : 'غير محدد'}
              </div>
              <p className="text-xs text-gray-600">
                آخر توريد: {dashboardData.inventory.lastDelivery ? formatDate(dashboardData.inventory.lastDelivery) : 'لا يوجد'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات الأخيرة</CardTitle>
                <CardDescription>آخر طلبات التوريد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="text-2xl">
                          {order.type === 'ketchup' ? '🍅' : '🌶️'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {order.type === 'ketchup' ? 'كاتشب' : 'شطة'} - {order.quantity.toLocaleString()} وحدة
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.date)}
                          </p>
                        </div>
                      </div>
                      <span className="status-badge bg-green-100 text-green-800">
                        مكتمل
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="ghost" className="w-full">
                    عرض جميع الطلبات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>المهام المعلقة</CardTitle>
                <CardDescription>مهام تحتاج انتباهك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.pendingTasks.map((task) => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <span className={`status-badge text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500">
                        موعد الانتهاء: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع المهام
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contract Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العقد</CardTitle>
              <CardDescription>تفاصيل عقدك مع لاند سبايس</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {dashboardData.restaurant.monthlyQuota.toLocaleString()}
                  </div>
                  <p className="text-sm text-blue-800">الحصة الشهرية الإجمالية</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">نشط</div>
                  <p className="text-sm text-green-800">حالة العقد</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600 mb-2">
                    {dashboardData.restaurant.contractEndDate ? formatDate(dashboardData.restaurant.contractEndDate) : 'غير محدد'}
                  </div>
                  <p className="text-sm text-orange-800">تاريخ انتهاء العقد</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
