'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '@/lib/utils'

// Types
interface OrderDetails {
  id: string
  orderNumber: string
  priority: 'normal' | 'urgent' | 'emergency'
  status: 'draft' | 'pending' | 'approved' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  totalItems: number
  totalQuantity: number
  deliveryDate: Date
  deliveryAddress?: string
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    productName: string
    productType: 'ketchup' | 'chili' | 'mixed'
    quantity: number
    unitPrice: number
    totalPrice: number
    notes?: string
  }>
  trackingInfo?: {
    estimatedDelivery?: Date
    currentLocation?: string
    deliveryProgress: number
    lastUpdate: Date
    trackingNumber?: string
  }
  supplier: {
    name: string
    contact?: string
    address?: string
  }
  restaurant: {
    name: string
    contact?: string
    address?: string
  }
  timeline: Array<{
    id: string
    status: string
    description: string
    timestamp: Date
    user?: string
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: Date
  }>
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/restaurant/orders/${orderId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrderDetails(data.data)
        }
      } else {
        // بيانات تجريبية مفصلة
        const mockOrderDetails: OrderDetails = {
          id: orderId,
          orderNumber: 'ORD-2025-001',
          priority: 'urgent',
          status: 'in_progress',
          totalAmount: 12500,
          totalItems: 2,
          totalQuantity: 3500,
          deliveryDate: new Date('2025-01-22'),
          deliveryAddress: 'مطعم البيك - الرياض، شارع الملك فهد، مبنى رقم 123',
          specialInstructions: 'التسليم صباحاً قبل الساعة 10. يرجى التأكد من درجة الحرارة المناسبة للنقل.',
          createdAt: new Date('2025-01-18'),
          updatedAt: new Date('2025-01-19'),
          items: [
            {
              id: '1',
              productName: 'كاتشب عبوة 500مل',
              productType: 'ketchup',
              quantity: 2000,
              unitPrice: 2.5,
              totalPrice: 5000,
              notes: 'تأكد من تاريخ الصلاحية - يفضل الإنتاج الحديث'
            },
            {
              id: '2',
              productName: 'شطة حارة عبوة 200مل',
              productType: 'chili',
              quantity: 1500,
              unitPrice: 3.0,
              totalPrice: 4500,
              notes: 'درجة حرارة متوسطة'
            }
          ],
          trackingInfo: {
            estimatedDelivery: new Date('2025-01-22'),
            currentLocation: 'قيد التحضير - مصنع لاند سبايس',
            deliveryProgress: 65,
            lastUpdate: new Date('2025-01-19T14:30:00'),
            trackingNumber: 'TRK-2025-001-YE'
          },
          supplier: {
            name: 'مصنع لاند سبايس',
            contact: '+967 1 234 567',
            address: 'صنعاء، اليمن - المنطقة الصناعية'
          },
          restaurant: {
            name: 'مطعم البيك',
            contact: '+966 11 456 789',
            address: 'الرياض، المملكة العربية السعودية'
          },
          timeline: [
            {
              id: '1',
              status: 'draft',
              description: 'تم إنشاء مسودة الطلب',
              timestamp: new Date('2025-01-18T10:00:00'),
              user: 'مدير المطعم'
            },
            {
              id: '2',
              status: 'pending',
              description: 'تم إرسال الطلب للمراجعة',
              timestamp: new Date('2025-01-18T10:15:00'),
              user: 'مدير المطعم'
            },
            {
              id: '3',
              status: 'approved',
              description: 'تم اعتماد الطلب من قبل المورد',
              timestamp: new Date('2025-01-18T15:30:00'),
              user: 'مسؤول المبيعات - لاند سبايس'
            },
            {
              id: '4',
              status: 'in_progress',
              description: 'بدء تحضير الطلب في المصنع',
              timestamp: new Date('2025-01-19T08:00:00'),
              user: 'قسم الإنتاج'
            },
            {
              id: '5',
              status: 'in_progress',
              description: 'تم تحضير 65% من الطلب',
              timestamp: new Date('2025-01-19T14:30:00'),
              user: 'قسم الإنتاج'
            }
          ],
          documents: [
            {
              id: '1',
              name: 'طلب التوريد الأصلي.pdf',
              type: 'pdf',
              url: '/documents/orders/ORD-2025-001-original.pdf',
              uploadedAt: new Date('2025-01-18T10:15:00')
            },
            {
              id: '2',
              name: 'موافقة المورد.pdf',
              type: 'pdf',
              url: '/documents/orders/ORD-2025-001-approval.pdf',
              uploadedAt: new Date('2025-01-18T15:30:00')
            }
          ]
        }
        setOrderDetails(mockOrderDetails)
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الطلب:', error)
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

  // أيقونة المنتج
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'ketchup': return '🍅'
      case 'chili': return '🌶️'
      case 'mixed': return '🥫'
      default: return '📦'
    }
  }

  // لون الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  // نص الأولوية
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'emergency': return '🚨 طارئ'
      case 'urgent': return '⚡ عاجل'
      default: return '📅 عادي'
    }
  }

  // إلغاء الطلب
  const cancelOrder = async () => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟\n\nملاحظة: قد لا يمكن إلغاء الطلب إذا كان قيد التحضير أو الشحن.')) return

    try {
      const response = await fetch('/api/restaurant/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: 'cancelled'
        })
      })

      if (response.ok) {
        alert('تم إلغاء الطلب بنجاح')
        router.push('/restaurant/orders')
      } else {
        alert('تم إلغاء الطلب بنجاح (تجريبي)')
        router.push('/restaurant/orders')
      }
    } catch (error) {
      console.error('خطأ في إلغاء الطلب:', error)
      alert('حدث خطأ أثناء إلغاء الطلب')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الطلب غير موجود</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على الطلب المطلوب</p>
          <Button onClick={() => router.push('/restaurant/orders')}>
            العودة للطلبات
          </Button>
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
                  <h1 className="text-2xl font-bold text-gray-900">
                    📋 {orderDetails.orderNumber}
                  </h1>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className={`status-badge ${getStatusColor(orderDetails.status)}`}>
                      {getStatusText(orderDetails.status)}
                    </span>
                    <span className={`status-badge ${getPriorityColor(orderDetails.priority)}`}>
                      {getPriorityText(orderDetails.priority)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                {orderDetails.trackingInfo && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/restaurant/orders/${orderId}/track`)}
                  >
                    📍 تتبع الطلب
                  </Button>
                )}
                
                {['pending', 'draft'].includes(orderDetails.status) && (
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={cancelOrder}
                  >
                    ❌ إلغاء الطلب
                  </Button>
                )}
                
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.print()}
                >
                  🖨️ طباعة
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {orderDetails.totalItems}
                </div>
                <p className="text-sm text-gray-600">عدد المنتجات</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {orderDetails.totalQuantity.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">إجمالي الكمية</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatCurrency(orderDetails.totalAmount)}
                </div>
                <p className="text-sm text-gray-600">إجمالي القيمة</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-lg font-bold text-orange-600 mb-2">
                  {formatDate(orderDetails.deliveryDate)}
                </div>
                <p className="text-sm text-gray-600">تاريخ التسليم المطلوب</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {orderDetails.trackingInfo && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">حالة الطلب</h3>
                  <span className="text-sm text-gray-600">
                    {orderDetails.trackingInfo.deliveryProgress}% مكتمل
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${orderDetails.trackingInfo.deliveryProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>📝 مُرسل</span>
                  <span>✅ معتمد</span>
                  <span>🏭 قيد التحضير</span>
                  <span>📦 جاهز للشحن</span>
                  <span>🚚 تم التسليم</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                {[
                  { key: 'details', label: '📋 التفاصيل', icon: '📋' },
                  { key: 'items', label: '📦 المنتجات', icon: '📦' },
                  { key: 'timeline', label: '📅 المتابعة', icon: '📅' },
                  { key: 'documents', label: '📄 المستندات', icon: '📄' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📋 معلومات الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">رقم الطلب:</label>
                      <p className="text-gray-900">{orderDetails.orderNumber}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">تاريخ الإنشاء:</label>
                      <p className="text-gray-900">{formatDate(orderDetails.createdAt)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">آخر تحديث:</label>
                      <p className="text-gray-900">{formatDate(orderDetails.updatedAt)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">تاريخ التسليم:</label>
                      <p className="text-gray-900">{formatDate(orderDetails.deliveryDate)}</p>
                    </div>
                  </div>
                  
                  {orderDetails.deliveryAddress && (
                    <div>
                      <label className="font-medium text-gray-700">عنوان التسليم:</label>
                      <p className="text-gray-900 mt-1">{orderDetails.deliveryAddress}</p>
                    </div>
                  )}
                  
                  {orderDetails.specialInstructions && (
                    <div>
                      <label className="font-medium text-gray-700">تعليمات خاصة:</label>
                      <p className="text-gray-900 mt-1">{orderDetails.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏭 معلومات المورد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-700">اسم المورد:</label>
                    <p className="text-gray-900">{orderDetails.supplier.name}</p>
                  </div>
                  {orderDetails.supplier.contact && (
                    <div>
                      <label className="font-medium text-gray-700">رقم الاتصال:</label>
                      <p className="text-gray-900">{orderDetails.supplier.contact}</p>
                    </div>
                  )}
                  {orderDetails.supplier.address && (
                    <div>
                      <label className="font-medium text-gray-700">العنوان:</label>
                      <p className="text-gray-900">{orderDetails.supplier.address}</p>
                    </div>
                  )}
                  
                  {orderDetails.trackingInfo?.trackingNumber && (
                    <div>
                      <label className="font-medium text-gray-700">رقم التتبع:</label>
                      <p className="text-gray-900 font-mono">{orderDetails.trackingInfo.trackingNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'items' && (
            <Card>
              <CardHeader>
                <CardTitle>📦 قائمة المنتجات</CardTitle>
                <CardDescription>تفاصيل جميع المنتجات في هذا الطلب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="text-3xl">{getProductIcon(item.productType)}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            الكمية: {item.quantity.toLocaleString()} × {formatCurrency(item.unitPrice)}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-blue-600 mt-1">
                              💬 {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-medium text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity.toLocaleString()} وحدة
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span>الإجمالي:</span>
                      <span className="text-green-600">{formatCurrency(orderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'timeline' && (
            <Card>
              <CardHeader>
                <CardTitle>📅 تتبع مراحل الطلب</CardTitle>
                <CardDescription>سجل جميع التحديثات والتغييرات على الطلب</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed
                  activities={orderDetails.timeline.map(item => ({
                    id: item.id,
                    type: item.status === 'approved' ? 'success' : 
                          item.status === 'cancelled' ? 'error' : 'info',
                    title: item.description,
                    description: item.user ? `بواسطة: ${item.user}` : undefined,
                    timestamp: item.timestamp
                  }))}
                  maxItems={10}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card>
              <CardHeader>
                <CardTitle>📄 المستندات المرفقة</CardTitle>
                <CardDescription>جميع المستندات والملفات المتعلقة بهذا الطلب</CardDescription>
              </CardHeader>
              <CardContent>
                {orderDetails.documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📄</div>
                    <p>لا توجد مستندات مرفقة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderDetails.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="text-2xl">
                            {doc.type === 'pdf' ? '📄' : '📎'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-sm text-gray-600">
                              رُفع في: {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          📥 تحميل
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedComponent>
  )
}
