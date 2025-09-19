'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface TrackingOrder {
  id: string
  orderNumber: string
  status: string
  priority: 'normal' | 'urgent' | 'emergency'
  totalAmount: number
  deliveryDate: Date
  trackingInfo: {
    estimatedDelivery: Date
    currentLocation: string
    deliveryProgress: number
    lastUpdate: Date
    trackingNumber: string
    stages: Array<{
      id: string
      name: string
      status: 'completed' | 'current' | 'pending'
      timestamp?: Date
      location?: string
      description?: string
    }>
  }
  items: Array<{
    productName: string
    quantity: number
  }>
}

export default function OrderTrackingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<TrackingOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchTrackableOrders()
  }, [])

  const fetchTrackableOrders = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/restaurant/orders/trackable')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrders(data.data)
        }
      } else {
        // بيانات تجريبية للطلبات القابلة للتتبع
        const mockOrders: TrackingOrder[] = [
          {
            id: '1',
            orderNumber: 'ORD-2025-001',
            status: 'delivered',
            priority: 'urgent',
            totalAmount: 12500,
            deliveryDate: new Date('2025-01-15'),
            trackingInfo: {
              estimatedDelivery: new Date('2025-01-15'),
              currentLocation: 'تم التسليم - مطعم البيك',
              deliveryProgress: 100,
              lastUpdate: new Date('2025-01-15T09:30:00'),
              trackingNumber: 'TRK-2025-001-YE',
              stages: [
                {
                  id: '1',
                  name: 'تأكيد الطلب',
                  status: 'completed',
                  timestamp: new Date('2025-01-10T10:00:00'),
                  location: 'مصنع لاند سبايس - صنعاء',
                  description: 'تم تأكيد الطلب وبدء المعالجة'
                },
                {
                  id: '2',
                  name: 'تحضير المنتجات',
                  status: 'completed',
                  timestamp: new Date('2025-01-12T14:00:00'),
                  location: 'مصنع لاند سبايس - قسم الإنتاج',
                  description: 'تم تحضير جميع المنتجات وفحص الجودة'
                },
                {
                  id: '3',
                  name: 'التعبئة والتغليف',
                  status: 'completed',
                  timestamp: new Date('2025-01-13T11:00:00'),
                  location: 'مصنع لاند سبايس - قسم التعبئة',
                  description: 'تم تعبئة المنتجات بعناية مع ضمان السلامة'
                },
                {
                  id: '4',
                  name: 'الشحن',
                  status: 'completed',
                  timestamp: new Date('2025-01-14T08:00:00'),
                  location: 'شركة الشحن السريع',
                  description: 'تم تسليم الطلب لشركة الشحن'
                },
                {
                  id: '5',
                  name: 'في الطريق',
                  status: 'completed',
                  timestamp: new Date('2025-01-14T20:00:00'),
                  location: 'الطريق إلى الرياض',
                  description: 'الشحنة في طريقها للوجهة النهائية'
                },
                {
                  id: '6',
                  name: 'التسليم',
                  status: 'completed',
                  timestamp: new Date('2025-01-15T09:30:00'),
                  location: 'مطعم البيك - الرياض',
                  description: 'تم التسليم بنجاح واستلام التوقيع'
                }
              ]
            },
            items: [
              { productName: 'كاتشب عبوة 500مل', quantity: 2000 },
              { productName: 'شطة حارة عبوة 200مل', quantity: 1500 }
            ]
          },
          {
            id: '2',
            orderNumber: 'ORD-2025-002',
            status: 'in_progress',
            priority: 'normal',
            totalAmount: 8400,
            deliveryDate: new Date('2025-01-22'),
            trackingInfo: {
              estimatedDelivery: new Date('2025-01-22'),
              currentLocation: 'قيد التحضير - مصنع لاند سبايس',
              deliveryProgress: 65,
              lastUpdate: new Date('2025-01-19T14:20:00'),
              trackingNumber: 'TRK-2025-002-YE',
              stages: [
                {
                  id: '1',
                  name: 'تأكيد الطلب',
                  status: 'completed',
                  timestamp: new Date('2025-01-18T15:30:00'),
                  location: 'مصنع لاند سبايس - صنعاء',
                  description: 'تم تأكيد الطلب وبدء المعالجة'
                },
                {
                  id: '2',
                  name: 'تحضير المنتجات',
                  status: 'current',
                  timestamp: new Date('2025-01-19T09:00:00'),
                  location: 'مصنع لاند سبايس - قسم الإنتاج',
                  description: 'قيد التحضير - مكتمل 65%'
                },
                {
                  id: '3',
                  name: 'التعبئة والتغليف',
                  status: 'pending',
                  location: 'مصنع لاند سبايس - قسم التعبئة'
                },
                {
                  id: '4',
                  name: 'الشحن',
                  status: 'pending',
                  location: 'شركة الشحن السريع'
                },
                {
                  id: '5',
                  name: 'في الطريق',
                  status: 'pending'
                },
                {
                  id: '6',
                  name: 'التسليم',
                  status: 'pending',
                  location: 'مطعم البيك - الرياض'
                }
              ]
            },
            items: [
              { productName: 'كاتشب عبوة 1 لتر', quantity: 1000 },
              { productName: 'صلصة مخلوطة عبوة 300مل', quantity: 1500 }
            ]
          },
          {
            id: '3',
            orderNumber: 'ORD-2025-003',
            status: 'approved',
            priority: 'emergency',
            totalAmount: 15000,
            deliveryDate: new Date('2025-01-20'),
            trackingInfo: {
              estimatedDelivery: new Date('2025-01-20'),
              currentLocation: 'معتمد - في انتظار التحضير',
              deliveryProgress: 15,
              lastUpdate: new Date('2025-01-19T16:45:00'),
              trackingNumber: 'TRK-2025-003-YE',
              stages: [
                {
                  id: '1',
                  name: 'تأكيد الطلب',
                  status: 'completed',
                  timestamp: new Date('2025-01-19T16:45:00'),
                  location: 'مصنع لاند سبايس - صنعاء',
                  description: 'تم تأكيد الطلب العاجل'
                },
                {
                  id: '2',
                  name: 'تحضير المنتجات',
                  status: 'current',
                  location: 'مصنع لاند سبايس - قسم الإنتاج',
                  description: 'في انتظار بدء التحضير - أولوية عالية'
                },
                {
                  id: '3',
                  name: 'التعبئة والتغليف',
                  status: 'pending',
                  location: 'مصنع لاند سبايس - قسم التعبئة'
                },
                {
                  id: '4',
                  name: 'الشحن السريع',
                  status: 'pending',
                  location: 'شركة الشحن السريع'
                },
                {
                  id: '5',
                  name: 'التسليم العاجل',
                  status: 'pending',
                  location: 'مطعم البيك - الرياض'
                }
              ]
            },
            items: [
              { productName: 'كاتشب عبوة 500مل', quantity: 2000 },
              { productName: 'شطة حارة عبوة 200مل', quantity: 2000 },
              { productName: 'صلصة مخلوطة عبوة 300مل', quantity: 1000 }
            ]
          }
        ]
        setOrders(mockOrders)
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // البحث برقم التتبع
  const searchByTrackingNumber = async () => {
    if (!trackingNumber.trim()) {
      alert('يرجى إدخال رقم التتبع')
      return
    }

    setIsSearching(true)
    
    try {
      const response = await fetch(`/api/restaurant/orders/track/${trackingNumber}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSelectedOrder(data.data)
        } else {
          alert('لم يتم العثور على طلب بهذا الرقم')
        }
      } else {
        // البحث في البيانات التجريبية
        const foundOrder = orders.find(order => 
          order.trackingInfo.trackingNumber.toLowerCase().includes(trackingNumber.toLowerCase()) ||
          order.orderNumber.toLowerCase().includes(trackingNumber.toLowerCase())
        )
        
        if (foundOrder) {
          setSelectedOrder(foundOrder)
        } else {
          alert('لم يتم العثور على طلب بهذا الرقم')
        }
      }
    } catch (error) {
      console.error('خطأ في البحث:', error)
      alert('حدث خطأ أثناء البحث')
    } finally {
      setIsSearching(false)
    }
  }

  // التحقق من صلاحية المطعم
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'restaurant') {
    redirect('/auth/signin')
  }

  const getStageIcon = (stage: any) => {
    if (stage.status === 'completed') return '✅'
    if (stage.status === 'current') return '🔄'
    return '⏳'
  }

  const getStageColor = (stage: any) => {
    if (stage.status === 'completed') return 'text-green-600 bg-green-50 border-green-200'
    if (stage.status === 'current') return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-gray-400 bg-gray-50 border-gray-200'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل معلومات التتبع...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['restaurant']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  ← العودة
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📍 تتبع الطلبات</h1>
                  <p className="text-gray-600">تتبع حالة طلبات التوريد في الوقت الفعلي</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🔍 البحث برقم التتبع</CardTitle>
              <CardDescription>أدخل رقم التتبع أو رقم الطلب للحصول على معلومات مفصلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 space-x-reverse">
                <Input
                  placeholder="أدخل رقم التتبع أو رقم الطلب..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchByTrackingNumber()}
                  className="flex-1"
                />
                <Button
                  onClick={searchByTrackingNumber}
                  disabled={isSearching}
                  variant="primary"
                >
                  {isSearching ? '🔍 جاري البحث...' : '🔍 تتبع'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>📋 الطلبات النشطة</CardTitle>
                  <CardDescription>اختر طلب لعرض تفاصيل التتبع</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <p>لا توجد طلبات قابلة للتتبع</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedOrder?.id === order.id ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">{order.orderNumber}</div>
                            <span className={`status-badge text-xs ${getPriorityColor(order.priority)}`}>
                              {order.priority === 'emergency' ? '🚨 طارئ' :
                               order.priority === 'urgent' ? '⚡ عاجل' : '📅 عادي'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {order.items.length} منتج - {formatCurrency(order.totalAmount)}
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${order.trackingInfo.deliveryProgress}%` }}
                            ></div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {order.trackingInfo.currentLocation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tracking Details */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>📦 {selectedOrder.orderNumber}</CardTitle>
                          <CardDescription>
                            رقم التتبع: {selectedOrder.trackingInfo.trackingNumber}
                          </CardDescription>
                        </div>
                        <span className={`status-badge ${getPriorityColor(selectedOrder.priority)}`}>
                          {selectedOrder.priority === 'emergency' ? '🚨 طارئ' :
                           selectedOrder.priority === 'urgent' ? '⚡ عاجل' : '📅 عادي'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {selectedOrder.trackingInfo.deliveryProgress}%
                          </div>
                          <p className="text-sm text-blue-800">مكتمل</p>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {formatDate(selectedOrder.trackingInfo.estimatedDelivery)}
                          </div>
                          <p className="text-sm text-green-800">التسليم المتوقع</p>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600 mb-1">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </div>
                          <p className="text-sm text-orange-800">قيمة الطلب</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">تقدم التسليم</span>
                          <span className="text-sm text-gray-600">
                            آخر تحديث: {formatDate(selectedOrder.trackingInfo.lastUpdate)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${selectedOrder.trackingInfo.deliveryProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">الموقع الحالي</div>
                        <div className="text-gray-900">
                          📍 {selectedOrder.trackingInfo.currentLocation}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tracking Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📅 مراحل التسليم</CardTitle>
                      <CardDescription>تتبع مفصل لجميع مراحل الطلب</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder.trackingInfo.stages.map((stage, index) => (
                          <div 
                            key={stage.id} 
                            className={`flex items-start space-x-4 space-x-reverse p-4 border rounded-lg ${getStageColor(stage)}`}
                          >
                            <div className="flex-shrink-0 text-2xl">
                              {getStageIcon(stage)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{stage.name}</h4>
                                {stage.timestamp && (
                                  <span className="text-sm">
                                    {formatDate(stage.timestamp)}
                                  </span>
                                )}
                              </div>
                              
                              {stage.location && (
                                <p className="text-sm mb-1">📍 {stage.location}</p>
                              )}
                              
                              {stage.description && (
                                <p className="text-sm">{stage.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📦 محتويات الطلب</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-gray-600">
                              {item.quantity.toLocaleString()} وحدة
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📍</div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        اختر طلب للتتبع
                      </h3>
                      <p className="text-gray-600">
                        اختر طلب من القائمة أو ابحث برقم التتبع لعرض التفاصيل
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
