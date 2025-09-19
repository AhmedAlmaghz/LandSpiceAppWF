'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '@/lib/utils'

// Types
interface Order {
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
  }
  supplier: {
    name: string
    contact?: string
  }
}

interface OrderStats {
  total: number
  pending: number
  approved: number
  inProgress: number
  delivered: number
  totalValue: number
  avgOrderValue: number
}

interface OrderFilters {
  search: string
  status: string
  priority: string
  dateFrom: string
  dateTo: string
}

export default function RestaurantOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    delivered: 0,
    totalValue: 0,
    avgOrderValue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  })
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  useEffect(() => {
    fetchOrders(pagination.page, pagination.limit, filters)
  }, [])

  const fetchOrders = async (page = 1, limit = 10, searchParams: any = {}) => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...searchParams
      })

      const response = await fetch(`/api/restaurant/orders?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrders(data.data.orders)
          setPagination(data.data.pagination)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-2025-001',
            priority: 'urgent',
            status: 'delivered',
            totalAmount: 12500,
            totalItems: 2,
            totalQuantity: 3500,
            deliveryDate: new Date('2025-01-15'),
            deliveryAddress: 'مطعم البيك - الرياض، شارع الملك فهد',
            specialInstructions: 'التسليم صباحاً قبل الساعة 10',
            createdAt: new Date('2025-01-10'),
            updatedAt: new Date('2025-01-16'),
            items: [
              {
                id: '1',
                productName: 'كاتشب عبوة 500مل',
                quantity: 2000,
                unitPrice: 2.5,
                totalPrice: 5000,
                notes: 'تأكد من تاريخ الصلاحية'
              },
              {
                id: '2',
                productName: 'شطة حارة عبوة 200مل',
                quantity: 1500,
                unitPrice: 3.0,
                totalPrice: 4500
              }
            ],
            trackingInfo: {
              estimatedDelivery: new Date('2025-01-15'),
              currentLocation: 'تم التسليم - مطعم البيك',
              deliveryProgress: 100,
              lastUpdate: new Date('2025-01-15T09:30:00')
            },
            supplier: {
              name: 'مصنع لاند سبايس',
              contact: '+967 1 234 567'
            }
          },
          {
            id: '2',
            orderNumber: 'ORD-2025-002',
            priority: 'normal',
            status: 'in_progress',
            totalAmount: 8400,
            totalItems: 2,
            totalQuantity: 2800,
            deliveryDate: new Date('2025-01-22'),
            deliveryAddress: 'مطعم البيك - الرياض، شارع الملك فهد',
            createdAt: new Date('2025-01-18'),
            updatedAt: new Date('2025-01-19'),
            items: [
              {
                id: '3',
                productName: 'كاتشب عبوة 1 لتر',
                quantity: 1000,
                unitPrice: 4.2,
                totalPrice: 4200
              },
              {
                id: '4',
                productName: 'صلصة مخلوطة عبوة 300مل',
                quantity: 1500,
                unitPrice: 2.8,
                totalPrice: 4200
              }
            ],
            trackingInfo: {
              estimatedDelivery: new Date('2025-01-22'),
              currentLocation: 'قيد التحضير - المصنع',
              deliveryProgress: 45,
              lastUpdate: new Date('2025-01-19T14:20:00')
            },
            supplier: {
              name: 'مصنع لاند سبايس',
              contact: '+967 1 234 567'
            }
          },
          {
            id: '3',
            orderNumber: 'ORD-2025-003',
            priority: 'emergency',
            status: 'approved',
            totalAmount: 15000,
            totalItems: 3,
            totalQuantity: 5000,
            deliveryDate: new Date('2025-01-20'),
            deliveryAddress: 'مطعم البيك - الرياض، شارع الملك فهد',
            specialInstructions: 'طلب عاجل - نفاد مخزون',
            createdAt: new Date('2025-01-19'),
            updatedAt: new Date('2025-01-19'),
            items: [
              {
                id: '5',
                productName: 'كاتشب عبوة 500مل',
                quantity: 2000,
                unitPrice: 2.5,
                totalPrice: 5000
              },
              {
                id: '6',
                productName: 'شطة حارة عبوة 200مل',
                quantity: 2000,
                unitPrice: 3.0,
                totalPrice: 6000
              },
              {
                id: '7',
                productName: 'صلصة مخلوطة عبوة 300مل',
                quantity: 1000,
                unitPrice: 2.8,
                totalPrice: 2800
              }
            ],
            trackingInfo: {
              estimatedDelivery: new Date('2025-01-20'),
              currentLocation: 'معتمد - في انتظار التحضير',
              deliveryProgress: 15,
              lastUpdate: new Date('2025-01-19T16:45:00')
            },
            supplier: {
              name: 'مصنع لاند سبايس',
              contact: '+967 1 234 567'
            }
          },
          {
            id: '4',
            orderNumber: 'ORD-2025-004',
            priority: 'normal',
            status: 'pending',
            totalAmount: 6300,
            totalItems: 1,
            totalQuantity: 1500,
            deliveryDate: new Date('2025-01-25'),
            deliveryAddress: 'مطعم البيك - الرياض، شارع الملك فهد',
            createdAt: new Date('2025-01-19'),
            updatedAt: new Date('2025-01-19'),
            items: [
              {
                id: '8',
                productName: 'كاتشب عبوة 1 لتر',
                quantity: 1500,
                unitPrice: 4.2,
                totalPrice: 6300
              }
            ],
            supplier: {
              name: 'مصنع لاند سبايس',
              contact: '+967 1 234 567'
            }
          }
        ]

        setOrders(mockOrders)
        
        // حساب الإحصائيات
        const totalOrders = mockOrders.length
        const pendingOrders = mockOrders.filter(o => o.status === 'pending').length
        const approvedOrders = mockOrders.filter(o => o.status === 'approved').length
        const inProgressOrders = mockOrders.filter(o => o.status === 'in_progress').length
        const deliveredOrders = mockOrders.filter(o => o.status === 'delivered').length
        const totalValue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        
        setStats({
          total: totalOrders,
          pending: pendingOrders,
          approved: approvedOrders,
          inProgress: inProgressOrders,
          delivered: deliveredOrders,
          totalValue,
          avgOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0
        })
        
        setPagination({
          page: 1,
          limit: 10,
          total: mockOrders.length,
          pages: Math.ceil(mockOrders.length / 10)
        })
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error)
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

  // التصفية والبحث
  const handleSearch = (searchParams: any) => {
    setFilters(prev => ({ ...prev, ...searchParams }))
    fetchOrders(1, pagination.limit, { ...filters, ...searchParams })
  }

  // إلغاء الطلب
  const cancelOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return

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
        await fetchOrders(pagination.page, pagination.limit, filters)
        alert('تم إلغاء الطلب بنجاح')
      }
    } catch (error) {
      console.error('خطأ في إلغاء الطلب:', error)
      alert('حدث خطأ أثناء إلغاء الطلب')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'emergency': return '🚨 طارئ'
      case 'urgent': return '⚡ عاجل'
      default: return '📅 عادي'
    }
  }

  const getDeliveryStatus = (order: Order) => {
    if (!order.trackingInfo) return 'غير متاح'
    
    const progress = order.trackingInfo.deliveryProgress
    if (progress === 100) return '✅ تم التسليم'
    if (progress >= 80) return '🚚 في الطريق'
    if (progress >= 50) return '📦 قيد الشحن'
    if (progress >= 20) return '🏭 قيد التحضير'
    return '⏳ معتمد'
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'order',
      label: 'الطلب',
      render: (order: Order) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{order.orderNumber}</div>
          <div className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </div>
          <span className={`status-badge text-xs ${getPriorityColor(order.priority)}`}>
            {getPriorityText(order.priority)}
          </span>
        </div>
      )
    },
    {
      key: 'items',
      label: 'المنتجات',
      render: (order: Order) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {order.totalItems} منتج ({order.totalQuantity.toLocaleString()} وحدة)
          </div>
          <div className="text-sm text-gray-600">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index}>
                • {item.productName} ({item.quantity.toLocaleString()})
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="text-blue-600">+ {order.items.length - 2} منتج آخر</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'القيمة',
      render: (order: Order) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(order.totalAmount)}
          </div>
          <div className="text-sm text-gray-500">
            متوسط: {formatCurrency(order.totalAmount / order.totalQuantity)}
          </div>
        </div>
      )
    },
    {
      key: 'delivery',
      label: 'التسليم',
      render: (order: Order) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {formatDate(order.deliveryDate)}
          </div>
          <div className="text-sm text-gray-600">
            {getDeliveryStatus(order)}
          </div>
          {order.trackingInfo && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${order.trackingInfo.deliveryProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (order: Order) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            آخر تحديث: {formatDate(order.updatedAt)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (order: Order) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/restaurant/orders/${order.id}`)}
          >
            👁️ عرض
          </Button>
          
          {order.trackingInfo && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/restaurant/orders/${order.id}/track`)}
            >
              📍 تتبع
            </Button>
          )}
          
          {['pending', 'draft'].includes(order.status) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => cancelOrder(order.id)}
            >
              ❌ إلغاء
            </Button>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الطلبات...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📋 طلبات التوريد</h1>
                <p className="text-gray-600">
                  إجمالي {stats.total} طلب، {stats.pending} في الانتظار
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/restaurant/orders/track')}
                >
                  📍 تتبع الطلبات
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/restaurant/orders/create')}
                >
                  ➕ طلب جديد
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الطلبات"
              value={stats.total}
              icon="📋"
              color="blue"
              onClick={() => handleSearch({ status: '' })}
            />
            
            <StatCard
              title="في الانتظار"
              value={stats.pending}
              icon="⏳"
              color="yellow"
              onClick={() => handleSearch({ status: 'pending' })}
            />
            
            <StatCard
              title="قيد التنفيذ"
              value={stats.inProgress}
              icon="🔄"
              color="blue"
              onClick={() => handleSearch({ status: 'in_progress' })}
            />
            
            <StatCard
              title="تم التسليم"
              value={stats.delivered}
              icon="✅"
              color="green"
              onClick={() => handleSearch({ status: 'delivered' })}
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="إجمالي قيمة الطلبات"
              value={formatCurrency(stats.totalValue)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="متوسط قيمة الطلب"
              value={formatCurrency(stats.avgOrderValue)}
              icon="📊"
              color="purple"
            />
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <AdvancedSearch
                onSearch={handleSearch}
                filters={[
                  {
                    key: 'search',
                    type: 'text',
                    placeholder: 'البحث في الطلبات...',
                    label: 'البحث العام'
                  },
                  {
                    key: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'pending', label: 'في الانتظار' },
                      { value: 'approved', label: 'معتمد' },
                      { value: 'in_progress', label: 'قيد التنفيذ' },
                      { value: 'shipped', label: 'تم الشحن' },
                      { value: 'delivered', label: 'تم التسليم' },
                      { value: 'cancelled', label: 'ملغي' }
                    ]
                  },
                  {
                    key: 'priority',
                    type: 'select',
                    label: 'الأولوية',
                    options: [
                      { value: '', label: 'جميع الأولويات' },
                      { value: 'normal', label: 'عادي' },
                      { value: 'urgent', label: 'عاجل' },
                      { value: 'emergency', label: 'طارئ' }
                    ]
                  },
                  {
                    key: 'dateFrom',
                    type: 'date',
                    label: 'من تاريخ'
                  },
                  {
                    key: 'dateTo',
                    type: 'date',
                    label: 'إلى تاريخ'
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedOrders.length} طلب
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="outline">
                      📤 تصدير المحددة
                    </Button>
                    <Button size="sm" variant="danger">
                      ❌ إلغاء المحددة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الطلبات</CardTitle>
              <CardDescription>
                جميع طلبات التوريد مع حالاتها وتفاصيلها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={orders}
                columns={columns}
                searchKey="orderNumber"
                pagination={pagination}
                onPageChange={(page) => {
                  setPagination(prev => ({ ...prev, page }))
                  fetchOrders(page, pagination.limit, filters)
                }}
                onSelectionChange={setSelectedOrders}
                selectedItems={selectedOrders}
                emptyMessage="لا توجد طلبات"
                emptyDescription="لم يتم إنشاء أي طلبات توريد بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
