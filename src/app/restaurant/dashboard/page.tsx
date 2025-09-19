'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import Chart from '@/components/dashboard/Chart'
import NotificationCenter from '@/components/dashboard/NotificationCenter'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RestaurantDashboardData {
  restaurant: {
    id: string
    name: string
    businessName?: string
    status: string
    monthlyQuota: number
    contractEndDate?: Date
  }
  inventory: {
    currentStock: number
    minStock: number
    maxStock: number
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
    totalRevenue: number
    totalOrders: number
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
  contracts: Array<{
    id: string
    status: string
    monthlyAmount: number
    endDate: Date
  }>
}

export default function RestaurantDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<RestaurantDashboardData | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // جلب بيانات لوحة التحكم من API
      const response = await fetch('/api/dashboard/stats')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDashboardData(data.data)
          setActivities(data.data.activities || [])
          setNotifications(data.data.notifications || [])
          setChartData(data.data.charts)
        }
      } else {
        // بيانات تجريبية محسنة في حال عدم توفر API
        const mockData: RestaurantDashboardData = {
          restaurant: {
            id: 'r1',
            name: 'مطعم البيك',
            businessName: 'شركة البيك للمأكولات السريعة',
            status: 'active',
            monthlyQuota: 18000,
            contractEndDate: new Date('2025-12-31')
          },
          inventory: {
            currentStock: 9800,
            minStock: 2000,
            maxStock: 20000,
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
            utilizationPercentage: 45.6,
            totalRevenue: 25000,
            totalOrders: 18
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
            },
            {
              id: '3',
              type: 'ketchup',
              quantity: 1000,
              date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
              status: 'in_progress'
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
            },
            {
              id: '3',
              title: 'تحديث معلومات المطعم',
              description: 'تحديث العنوان ومعلومات الاتصال',
              priority: 'low',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
          ],
          contracts: [
            {
              id: 'c1',
              status: 'active',
              monthlyAmount: 15000,
              endDate: new Date('2025-12-31')
            }
          ]
        }

        setDashboardData(mockData)
        
        // بيانات تجريبية للنشاطات
        setActivities([
          {
            id: '1',
            type: 'success',
            title: 'تم استلام طلب توريد',
            description: 'تم استلام 2000 عبوة كاتشب بنجاح',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'info',
            title: 'تحديث التصميم',
            description: 'تم رفع تصميم جديد للمراجعة',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'success',
            title: 'دفع فاتورة',
            description: 'تم دفع فاتورة شهر يناير بقيمة 15,000 ريال',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            id: '4',
            type: 'warning',
            title: 'تنبيه مخزون',
            description: 'مخزون الشطة اقترب من الحد الأدنى',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ])

        // بيانات تجريبية للإشعارات
        setNotifications([
          {
            id: '1',
            type: 'warning',
            title: 'مخزون منخفض',
            message: 'مخزون الشطة أصبح أقل من الحد الأدنى - يُنصح بطلب توريد جديد',
            timestamp: new Date(),
            isRead: false
          },
          {
            id: '2',
            type: 'info',
            title: 'تصميم جديد',
            message: 'تم اعتماد التصميم الجديد للعبوات',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false
          }
        ])

        // بيانات تجريبية للمخططات
        setChartData({
          monthly: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [
              {
                label: 'الاستهلاك الشهري',
                data: [8200, 7800, 8500, 8100, 7900, 8300],
                borderColor: 'rgb(220, 38, 38)',
                backgroundColor: 'rgba(220, 38, 38, 0.1)'
              }
            ]
          }
        })
      }
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

  const getStockLevelColor = (current: number, min: number) => {
    if (current <= min) return 'text-red-600'
    if (current <= min * 1.5) return 'text-yellow-600'
    return 'text-green-600'
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
    <ProtectedComponent roles={['restaurant']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xl">🏪</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {dashboardData.restaurant.name}
                  </h1>
                  <p className="text-gray-600">أهلاً بك، {session.user.firstName || session.user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <NotificationCenter notifications={notifications} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/restaurant/orders/create')}
                >
                  📋 طلب جديد
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/restaurant/designs')}
                >
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
                  <div className="mt-2">
                    <Button 
                      variant="warning" 
                      size="sm"
                      onClick={() => router.push('/restaurant/orders/create')}
                    >
                      طلب توريد الآن
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="الحصة الشهرية"
              value={dashboardData.restaurant.monthlyQuota.toLocaleString()}
              subtitle={`استُخدم ${dashboardData.currentMonth.utilizationPercentage}%`}
              icon="📊"
              color="blue"
              trend={{
                value: dashboardData.currentMonth.utilizationPercentage,
                label: `${dashboardData.currentMonth.remainingQuota.toLocaleString()} متبقي`,
                isPositive: dashboardData.currentMonth.utilizationPercentage < 80
              }}
              onClick={() => router.push('/restaurant/inventory')}
            />
            
            <StatCard
              title="المخزون الحالي"
              value={dashboardData.inventory.currentStock.toLocaleString()}
              subtitle="عبوة"
              icon="📦"
              color={dashboardData.inventory.currentStock > dashboardData.inventory.minStock ? "green" : "red"}
              trend={{
                value: Math.round((dashboardData.inventory.currentStock / dashboardData.inventory.maxStock) * 100),
                label: getInventoryStatus(dashboardData.inventory.currentStock, dashboardData.inventory.maxStock).status,
                isPositive: dashboardData.inventory.currentStock > dashboardData.inventory.minStock
              }}
              onClick={() => router.push('/restaurant/inventory')}
            />

            <StatCard
              title="الطلبات هذا الشهر"
              value={dashboardData.currentMonth.totalOrders}
              subtitle="طلب"
              icon="🛒"
              color="purple"
              trend={{
                value: 12,
                label: 'من الشهر الماضي',
                isPositive: true
              }}
              onClick={() => router.push('/restaurant/orders')}
            />

            <StatCard
              title="التوريد القادم"
              value={dashboardData.inventory.nextDelivery ? formatDate(dashboardData.inventory.nextDelivery) : 'غير محدد'}
              subtitle={`آخر توريد: ${dashboardData.inventory.lastDelivery ? formatDate(dashboardData.inventory.lastDelivery) : 'لا يوجد'}`}
              icon="🚚"
              color="orange"
              onClick={() => router.push('/restaurant/orders/track')}
            />
          </div>

          {/* Charts Section */}
          {chartData && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>الاستهلاك الشهري</CardTitle>
                  <CardDescription>نظرة عامة على استهلاك المنتجات خلال الأشهر السابقة</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={chartData.monthly}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>الطلبات الأخيرة</CardTitle>
                    <CardDescription>آخر طلبات التوريد وحالتها</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/restaurant/orders')}
                  >
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                        <span className={`status-badge ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'completed' ? 'مكتمل' :
                           order.status === 'in_progress' ? 'قيد التنفيذ' : 'معلق'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => router.push('/restaurant/orders/create')}
                    >
                      ➕ إنشاء طلب جديد
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>المهام المعلقة</CardTitle>
                  <CardDescription>مهام تحتاج انتباهك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardData.pendingTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
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

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>النشاط الأخير</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed
                    activities={activities}
                    maxItems={5}
                    showFilters={false}
                  />
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {formatCurrency(dashboardData.contracts[0]?.monthlyAmount || 0)}
                    </div>
                    <p className="text-sm text-purple-800">القسط الشهري</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/restaurant/contracts')}
                  >
                    عرض تفاصيل العقد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
