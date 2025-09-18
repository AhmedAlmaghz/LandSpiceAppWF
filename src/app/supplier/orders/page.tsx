// Supplier Orders Management
// إدارة طلبات الموردين

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'

interface SupplierOrder {
  id: string
  orderNumber: string
  restaurant: {
    name: string
    contact: string
    phone: string
  }
  products: {
    chiliSauce: number
    ketchup: number
  }
  specifications: {
    design: string
    printQuality: string
    packaging: string
  }
  timeline: {
    orderDate: Date
    dueDate: Date
    estimatedCompletion: Date
    actualCompletion?: Date
  }
  status: 'received' | 'in_production' | 'quality_check' | 'packaging' | 'ready_for_delivery' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  value: number
  notes: string[]
}

interface SupplierDashboardData {
  overview: {
    activeOrders: number
    completedToday: number
    productionCapacity: number
    utilizationRate: number
    pendingOrders: number
    overdueOrders: number
  }
  production: {
    dailyOutput: number
    weeklyTarget: number
    monthlyTarget: number
    efficiency: number
    defectRate: number
    machineUptime: number
  }
  orders: SupplierOrder[]
  inventory: {
    rawMaterials: {
      plastic: { current: number; minimum: number }
      ink: { current: number; minimum: number }
      labels: { current: number; minimum: number }
    }
    finishedGoods: {
      chiliSauce: number
      ketchup: number
    }
  }
}

export default function SupplierOrdersManagement() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<SupplierDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgent' | 'in_production' | 'overdue'>('all')

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
      const mockData: SupplierDashboardData = {
        overview: {
          activeOrders: 24,
          completedToday: 8,
          productionCapacity: 50000,
          utilizationRate: 78,
          pendingOrders: 16,
          overdueOrders: 2
        },
        production: {
          dailyOutput: 12500,
          weeklyTarget: 85000,
          monthlyTarget: 350000,
          efficiency: 92,
          defectRate: 0.8,
          machineUptime: 96.5
        },
        orders: [
          {
            id: '1',
            orderNumber: 'LS-2025-001',
            restaurant: {
              name: 'مطعم الذوق الأصيل',
              contact: 'أحمد المطيري',
              phone: '0501234567'
            },
            products: {
              chiliSauce: 5000,
              ketchup: 7000
            },
            specifications: {
              design: 'تصميم جديد مع الشعار المحدث',
              printQuality: 'عالية الدقة - 300 DPI',
              packaging: 'صناديق كرتونية - 50 وحدة/صندوق'
            },
            timeline: {
              orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
              estimatedCompletion: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
            },
            status: 'in_production',
            priority: 'high',
            value: 45000,
            notes: ['تأكيد جودة الطباعة', 'فحص إضافي للشعار']
          },
          {
            id: '2',
            orderNumber: 'LS-2025-002',
            restaurant: {
              name: 'مطعم البيك',
              contact: 'فهد العتيبي',
              phone: '0509876543'
            },
            products: {
              chiliSauce: 3000,
              ketchup: 4500
            },
            specifications: {
              design: 'تصميم قياسي',
              printQuality: 'متوسطة - 200 DPI',
              packaging: 'أكياس بلاستيكية - 100 وحدة/كيس'
            },
            timeline: {
              orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
              estimatedCompletion: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
            },
            status: 'quality_check',
            priority: 'medium',
            value: 28500,
            notes: []
          },
          {
            id: '3',
            orderNumber: 'LS-2025-003',
            restaurant: {
              name: 'مطعم الوليمة',
              contact: 'سعد القحطاني',
              phone: '0556677889'
            },
            products: {
              chiliSauce: 8000,
              ketchup: 6000
            },
            specifications: {
              design: 'تصميم احترافي مع تأثيرات خاصة',
              printQuality: 'فائقة الجودة - 400 DPI',
              packaging: 'صناديق مقوية - 25 وحدة/صندوق'
            },
            timeline: {
              orderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
              dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            status: 'packaging',
            priority: 'urgent',
            value: 65000,
            notes: ['طلب عاجل - متأخر يوم واحد', 'تواصل مع العميل']
          }
        ],
        inventory: {
          rawMaterials: {
            plastic: { current: 15000, minimum: 5000 },
            ink: { current: 250, minimum: 100 },
            labels: { current: 8000, minimum: 2000 }
          },
          finishedGoods: {
            chiliSauce: 12000,
            ketchup: 18000
          }
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
      day: 'numeric'
    }).format(date)
  }

  const getStatusText = (status: SupplierOrder['status']) => {
    switch (status) {
      case 'received': return 'مستلم'
      case 'in_production': return 'قيد الإنتاج'
      case 'quality_check': return 'فحص الجودة'
      case 'packaging': return 'التعبئة'
      case 'ready_for_delivery': return 'جاهز للتسليم'
      case 'delivered': return 'مُسلّم'
      case 'cancelled': return 'ملغى'
      default: return 'غير محدد'
    }
  }

  const getStatusColor = (status: SupplierOrder['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800'
      case 'in_production': return 'bg-yellow-100 text-yellow-800'
      case 'quality_check': return 'bg-purple-100 text-purple-800'
      case 'packaging': return 'bg-orange-100 text-orange-800'
      case 'ready_for_delivery': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: SupplierOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredOrders = dashboardData?.orders.filter(order => {
    switch (selectedFilter) {
      case 'urgent':
        return order.priority === 'urgent'
      case 'in_production':
        return order.status === 'in_production'
      case 'overdue':
        return getDaysUntilDue(order.timeline.dueDate) < 0
      default:
        return true
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل طلبات الإنتاج...</p>
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
                🏭 إدارة طلبات الإنتاج
              </h1>
              <p className="text-gray-600">أهلاً بك، {session.user.name || session.user.username}</p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">جميع الطلبات</option>
                <option value="urgent">عاجل</option>
                <option value="in_production">قيد الإنتاج</option>
                <option value="overdue">متأخرة</option>
              </select>
              <Button variant="outline" size="sm">
                📊 التقارير
              </Button>
              <Button variant="primary" size="sm">
                ⚙️ الإنتاج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="الطلبات النشطة"
            value={dashboardData.overview.activeOrders.toString()}
            icon="📋"
            color="blue"
            subtitle={`${dashboardData.overview.pendingOrders} في الانتظار`}
          />
          <StatCard
            title="مُكتمل اليوم"
            value={dashboardData.overview.completedToday.toString()}
            icon="✅"
            color="green"
            subtitle="طلب مُنجز"
          />
          <StatCard
            title="معدل الاستغلال"
            value={`${dashboardData.overview.utilizationRate}%`}
            icon="⚙️"
            color="orange"
            subtitle="من الطاقة الإنتاجية"
          />
          <StatCard
            title="متأخرة"
            value={dashboardData.overview.overdueOrders.toString()}
            icon="⚠️"
            color="red"
            subtitle="تحتاج متابعة عاجلة"
          />
        </div>

        {/* Production Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الإنتاج</CardTitle>
                <CardDescription>الأداء الحالي والأهداف</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.production.dailyOutput.toLocaleString()}</div>
                    <p className="text-sm text-blue-800">الإنتاج اليومي</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.production.efficiency}%</div>
                    <p className="text-sm text-green-800">كفاءة الإنتاج</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{dashboardData.production.defectRate}%</div>
                    <p className="text-sm text-red-800">معدل العيوب</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>المخزون</CardTitle>
              <CardDescription>المواد الخام والمنتجات الجاهزة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">البلاستيك</span>
                  <span className="text-sm font-medium">{dashboardData.inventory.rawMaterials.plastic.current.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((dashboardData.inventory.rawMaterials.plastic.current / (dashboardData.inventory.rawMaterials.plastic.minimum * 3)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">الحبر</span>
                  <span className="text-sm font-medium">{dashboardData.inventory.rawMaterials.ink.current}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((dashboardData.inventory.rawMaterials.ink.current / (dashboardData.inventory.rawMaterials.ink.minimum * 3)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">المنتجات الجاهزة</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>شطة:</span>
                    <span>{dashboardData.inventory.finishedGoods.chiliSauce.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>كاتشب:</span>
                    <span>{dashboardData.inventory.finishedGoods.ketchup.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>قائمة الطلبات</CardTitle>
                <CardDescription>
                  عرض {filteredOrders?.length} من أصل {dashboardData.orders.length} طلب
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders?.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 space-x-reverse mb-2">
                        <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(order.priority)}`}>
                          {order.priority === 'urgent' ? 'عاجل' :
                           order.priority === 'high' ? 'عالي' :
                           order.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>المطعم:</strong> {order.restaurant.name}</p>
                          <p><strong>جهة الاتصال:</strong> {order.restaurant.contact}</p>
                          <p><strong>الهاتف:</strong> {order.restaurant.phone}</p>
                        </div>
                        <div>
                          <p><strong>شطة:</strong> {order.products.chiliSauce.toLocaleString()} وحدة</p>
                          <p><strong>كاتشب:</strong> {order.products.ketchup.toLocaleString()} وحدة</p>
                          <p><strong>القيمة:</strong> {formatCurrency(order.value)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="lg:w-64">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>تاريخ الطلب:</span>
                            <span>{formatDate(order.timeline.orderDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>تاريخ التسليم:</span>
                            <span className={getDaysUntilDue(order.timeline.dueDate) < 0 ? 'text-red-600 font-bold' : ''}>
                              {formatDate(order.timeline.dueDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>الإنجاز المتوقع:</span>
                            <span>{formatDate(order.timeline.estimatedCompletion)}</span>
                          </div>
                          {getDaysUntilDue(order.timeline.dueDate) < 0 && (
                            <div className="text-red-600 text-xs font-bold">
                              متأخر {Math.abs(getDaysUntilDue(order.timeline.dueDate))} يوم
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-48 flex flex-col space-y-2">
                      <Button size="sm" variant="primary" className="w-full">
                        عرض التفاصيل
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        تحديث الحالة
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">ملاحظات:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.notes.map((note, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredOrders?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد طلبات تطابق الفلتر المحدد</p>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
