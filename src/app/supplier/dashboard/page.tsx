'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface SupplierDashboardData {
  supplier: {
    id: string
    name: string
    specialization: string
    rating: number
  }
  printOrders: {
    total: number
    pending: number
    inProgress: number
    completed: number
    totalValue: number
  }
  production: {
    dailyCapacity: number
    currentLoad: number
    utilizationPercentage: number
    estimatedDelivery: Date
  }
  activeBatches: Array<{
    id: string
    orderCode: string
    restaurantCount: number
    ketchupQuantity: number
    chiliQuantity: number
    startDate: Date
    expectedCompletion: Date
    status: 'preparing' | 'printing' | 'quality_check' | 'packaging'
    progress: number
  }>
  recentDeliveries: Array<{
    id: string
    orderCode: string
    restaurantNames: string[]
    deliveryDate: Date
    totalQuantity: number
    status: string
  }>
}

export default function SupplierDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<SupplierDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // التحقق من صلاحية المورد
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.roleName !== 'supplier') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي
      const mockData: SupplierDashboardData = {
        supplier: {
          id: 's1',
          name: 'مؤسسة الطباعة المتقدمة',
          specialization: 'طباعة العبوات والتغليف',
          rating: 4.8
        },
        printOrders: {
          total: 156,
          pending: 12,
          inProgress: 8,
          completed: 136,
          totalValue: 2850000
        },
        production: {
          dailyCapacity: 50000,
          currentLoad: 35000,
          utilizationPercentage: 70,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        activeBatches: [
          {
            id: 'b1',
            orderCode: 'PO-2025-001',
            restaurantCount: 5,
            ketchupQuantity: 25000,
            chiliQuantity: 20000,
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            expectedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            status: 'printing',
            progress: 65
          },
          {
            id: 'b2',
            orderCode: 'PO-2025-002',
            restaurantCount: 3,
            ketchupQuantity: 15000,
            chiliQuantity: 18000,
            startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            expectedCompletion: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            status: 'preparing',
            progress: 25
          }
        ],
        recentDeliveries: [
          {
            id: 'd1',
            orderCode: 'PO-2025-000',
            restaurantNames: ['مطعم البيك', 'مطعم الطازج', 'مطعم الدانة'],
            deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            totalQuantity: 40000,
            status: 'delivered'
          },
          {
            id: 'd2',
            orderCode: 'PO-2024-098',
            restaurantNames: ['مطعم الشام', 'مطعم المدينة'],
            deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            totalQuantity: 28000,
            status: 'delivered'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return '📋'
      case 'printing': return '🖨️'
      case 'quality_check': return '🔍'
      case 'packaging': return '📦'
      default: return '⚙️'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'printing': return 'bg-yellow-100 text-yellow-800'
      case 'quality_check': return 'bg-purple-100 text-purple-800'
      case 'packaging': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return 'تحضير'
      case 'printing': return 'طباعة'
      case 'quality_check': return 'فحص الجودة'
      case 'packaging': return 'تعبئة'
      default: return 'غير محدد'
    }
  }

  const updateBatchStatus = async (batchId: string, newStatus: string) => {
    try {
      console.log(`تحديث حالة الدفعة ${batchId} إلى ${newStatus}`)
      // سيتم تنفيذ العملية عبر API
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم المورد...</p>
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
                📦 {dashboardData.supplier.name}
              </h1>
              <p className="text-gray-600">
                {dashboardData.supplier.specialization} - أهلاً بك، {session.user.name || session.user.username}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                <span className="text-yellow-600 ml-1">⭐</span>
                <span className="text-sm font-medium text-yellow-800">
                  {dashboardData.supplier.rating}/5.0
                </span>
              </div>
              <Button variant="outline" size="sm">
                📊 تقرير الإنتاج
              </Button>
              <Button variant="primary" size="sm">
                ➕ دفعة جديدة
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أوامر الطباعة</CardTitle>
              <div className="text-2xl">📋</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.printOrders.total}</div>
              <p className="text-xs text-gray-600">
                {dashboardData.printOrders.completed} مكتمل
              </p>
              <p className="text-xs text-blue-600">
                {dashboardData.printOrders.inProgress} قيد التنفيذ
              </p>
            </CardContent>
          </Card>

          {/* Production Capacity */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطاقة الإنتاجية</CardTitle>
              <div className="text-2xl">⚡</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.production.utilizationPercentage}%</div>
              <p className="text-xs text-gray-600">
                {dashboardData.production.currentLoad.toLocaleString()} من {dashboardData.production.dailyCapacity.toLocaleString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.production.utilizationPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
              <div className="text-2xl">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(dashboardData.printOrders.totalValue)}
              </div>
              <p className="text-xs text-green-600">عبر جميع الأوامر</p>
            </CardContent>
          </Card>

          {/* Next Delivery */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التسليم القادم</CardTitle>
              <div className="text-2xl">🚚</div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatDate(dashboardData.production.estimatedDelivery)}
              </div>
              <p className="text-xs text-orange-600">موعد مقدر</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Batches */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>الدفعات النشطة</CardTitle>
                <CardDescription>دفعات الإنتاج الحالية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.activeBatches.map((batch) => (
                    <div key={batch.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-lg">{getStatusIcon(batch.status)}</span>
                          <div>
                            <h4 className="font-medium">{batch.orderCode}</h4>
                            <p className="text-sm text-gray-600">
                              {batch.restaurantCount} مطعم - 
                              {(batch.ketchupQuantity + batch.chiliQuantity).toLocaleString()} وحدة
                            </p>
                          </div>
                        </div>
                        <span className={`status-badge ${getStatusColor(batch.status)}`}>
                          {getStatusText(batch.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>🍅 كاتشب: {batch.ketchupQuantity.toLocaleString()}</span>
                          <span>🌶️ شطة: {batch.chiliQuantity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>بدأ: {formatDate(batch.startDate)}</span>
                          <span>متوقع: {formatDate(batch.expectedCompletion)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>التقدم</span>
                          <span className="font-medium">{batch.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${batch.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 space-x-reverse mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateBatchStatus(batch.id, 'next_stage')}
                        >
                          المرحلة التالية
                        </Button>
                        <Button size="sm" variant="ghost">
                          تفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="ghost" className="w-full">
                    عرض جميع الدفعات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deliveries */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>التسليمات الأخيرة</CardTitle>
                <CardDescription>آخر الطلبات المسلمة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{delivery.orderCode}</h4>
                      <span className="status-badge bg-green-100 text-green-800 text-xs">
                        تم التسليم
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>🏪 المطاعم:</p>
                      <ul className="pr-4">
                        {delivery.restaurantNames.map((name, index) => (
                          <li key={index}>• {name}</li>
                        ))}
                      </ul>
                      <p>📦 الكمية: {delivery.totalQuantity.toLocaleString()} وحدة</p>
                      <p>📅 التسليم: {formatDate(delivery.deliveryDate)}</p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع التسليمات
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Production Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>نظرة عامة على الإنتاج</CardTitle>
              <CardDescription>إحصائيات الأداء واستغلال الطاقة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {dashboardData.production.dailyCapacity.toLocaleString()}
                  </div>
                  <p className="text-sm text-blue-800">الطاقة اليومية القصوى</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {dashboardData.production.currentLoad.toLocaleString()}
                  </div>
                  <p className="text-sm text-green-800">الحمولة الحالية</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {dashboardData.production.utilizationPercentage}%
                  </div>
                  <p className="text-sm text-purple-800">معدل الاستغلال</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {dashboardData.activeBatches.length}
                  </div>
                  <p className="text-sm text-orange-800">دفعات نشطة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
