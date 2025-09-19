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
import Chart from '@/components/dashboard/Chart'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface InventoryItem {
  id: string
  productName: string
  productType: 'ketchup' | 'chili' | 'mixed'
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  lastUpdated: Date
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  supplier: string
  expiryDate?: Date
}

interface InventoryMovement {
  id: string
  type: 'in' | 'out'
  productName: string
  quantity: number
  reason: string
  date: Date
  referenceNumber?: string
  notes?: string
}

interface InventoryStats {
  totalValue: number
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  lastDelivery: Date
  nextDelivery: Date
}

export default function RestaurantInventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true)
      
      // محاولة جلب البيانات من API
      const response = await fetch('/api/restaurant/inventory')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInventory(data.data.items)
          setMovements(data.data.movements)
          setStats(data.data.stats)
          setChartData(data.data.charts)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockInventory: InventoryItem[] = [
          {
            id: '1',
            productName: 'كاتشب عبوة 500مل',
            productType: 'ketchup',
            currentStock: 5000,
            minStock: 1000,
            maxStock: 10000,
            unitPrice: 2.5,
            totalValue: 12500,
            lastUpdated: new Date(),
            status: 'in_stock',
            supplier: 'مصنع لاند سبايس',
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            productName: 'شطة حارة عبوة 200مل',
            productType: 'chili',
            currentStock: 800,
            minStock: 1200,
            maxStock: 8000,
            unitPrice: 3.0,
            totalValue: 2400,
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'low_stock',
            supplier: 'مصنع لاند سبايس',
            expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000)
          },
          {
            id: '3',
            productName: 'صلصة مخلوطة عبوة 300مل',
            productType: 'mixed',
            currentStock: 0,
            minStock: 500,
            maxStock: 5000,
            unitPrice: 2.8,
            totalValue: 0,
            lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'out_of_stock',
            supplier: 'مصنع لاند سبايس'
          },
          {
            id: '4',
            productName: 'كاتشب عبوة 1لتر',
            productType: 'ketchup',
            currentStock: 2500,
            minStock: 800,
            maxStock: 6000,
            unitPrice: 4.2,
            totalValue: 10500,
            lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'in_stock',
            supplier: 'مصنع لاند سبايس',
            expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000)
          }
        ]

        const mockMovements: InventoryMovement[] = [
          {
            id: '1',
            type: 'in',
            productName: 'كاتشب عبوة 500مل',
            quantity: 2000,
            reason: 'استلام توريد جديد',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            referenceNumber: 'IN-2025-001',
            notes: 'توريد شهر يناير'
          },
          {
            id: '2',
            type: 'out',
            productName: 'شطة حارة عبوة 200مل',
            quantity: 1500,
            reason: 'استخدام المطعم',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            referenceNumber: 'OUT-2025-012'
          },
          {
            id: '3',
            type: 'out',
            productName: 'صلصة مخلوطة عبوة 300مل',
            quantity: 500,
            reason: 'استخدام المطعم',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            referenceNumber: 'OUT-2025-013'
          },
          {
            id: '4',
            type: 'in',
            productName: 'كاتشب عبوة 1لتر',
            quantity: 1000,
            reason: 'استلام توريد',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            referenceNumber: 'IN-2025-002'
          }
        ]

        const mockStats: InventoryStats = {
          totalValue: 25400,
          totalItems: 4,
          lowStockItems: 1,
          outOfStockItems: 1,
          lastDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }

        setInventory(mockInventory)
        setMovements(mockMovements)
        setStats(mockStats)

        // بيانات المخطط
        setChartData({
          stockLevels: {
            labels: mockInventory.map(item => item.productName),
            datasets: [
              {
                label: 'المخزون الحالي',
                data: mockInventory.map(item => item.currentStock),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
              },
              {
                label: 'الحد الأدنى',
                data: mockInventory.map(item => item.minStock),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1
              }
            ]
          }
        })
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المخزون:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'متوفر'
      case 'low_stock':
        return 'منخفض'
      case 'out_of_stock':
        return 'نفد'
      default:
        return 'غير معروف'
    }
  }

  const getStockIcon = (productType: string) => {
    switch (productType) {
      case 'ketchup':
        return '🍅'
      case 'chili':
        return '🌶️'
      case 'mixed':
        return '🥫'
      default:
        return '📦'
    }
  }

  // تصفية البيانات
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // إعداد أعمدة جدول المخزون
  const inventoryColumns = [
    {
      key: 'product',
      label: 'المنتج',
      render: (item: InventoryItem) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="text-2xl">{getStockIcon(item.productType)}</div>
          <div>
            <div className="font-medium text-gray-900">{item.productName}</div>
            <div className="text-sm text-gray-500">المورد: {item.supplier}</div>
            {item.expiryDate && (
              <div className="text-xs text-gray-400">
                انتهاء الصلاحية: {formatDate(item.expiryDate)}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'المخزون',
      render: (item: InventoryItem) => (
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {item.currentStock.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            الحد الأدنى: {item.minStock.toLocaleString()}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${
                item.currentStock <= item.minStock ? 'bg-red-500' :
                item.currentStock <= item.minStock * 1.5 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'القيمة',
      render: (item: InventoryItem) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(item.totalValue)}
          </div>
          <div className="text-sm text-gray-600">
            سعر الوحدة: {formatCurrency(item.unitPrice)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (item: InventoryItem) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(item.status)}`}>
            {getStatusText(item.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            آخر تحديث: {formatDate(item.lastUpdated)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item: InventoryItem) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/restaurant/orders/create?product=${item.id}`)}
            disabled={item.status !== 'low_stock' && item.status !== 'out_of_stock'}
          >
            📋 طلب توريد
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {/* فتح modal تفاصيل المنتج */}}
          >
            👁️ التفاصيل
          </Button>
        </div>
      )
    }
  ]

  // إعداد أعمدة جدول الحركات
  const movementColumns = [
    {
      key: 'date',
      label: 'التاريخ',
      render: (movement: InventoryMovement) => (
        <div>
          <div className="font-medium">{formatDate(movement.date)}</div>
          <div className="text-sm text-gray-500">
            {movement.referenceNumber}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'النوع',
      render: (movement: InventoryMovement) => (
        <div className="text-center">
          <span className={`status-badge ${
            movement.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {movement.type === 'in' ? '⬇️ دخول' : '⬆️ خروج'}
          </span>
        </div>
      )
    },
    {
      key: 'product',
      label: 'المنتج',
      render: (movement: InventoryMovement) => (
        <div>
          <div className="font-medium">{movement.productName}</div>
          <div className="text-sm text-gray-600">الكمية: {movement.quantity.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'السبب',
      render: (movement: InventoryMovement) => (
        <div>
          <div className="text-sm">{movement.reason}</div>
          {movement.notes && (
            <div className="text-xs text-gray-500 mt-1">{movement.notes}</div>
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
          <p className="text-gray-600">جاري تحميل المخزون...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">📦 إدارة المخزون</h1>
                <p className="text-gray-600">
                  إجمالي المخزون: {stats?.totalItems} منتج
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('movements')}
                >
                  📈 حركات المخزون
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/restaurant/orders/create')}
                >
                  ➕ طلب توريد
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Low Stock Alerts */}
          {stats && (stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
            <div className="mb-6 space-y-4">
              {stats.lowStockItems > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400 text-xl">⚠️</span>
                    </div>
                    <div className="mr-3">
                      <h3 className="text-sm font-medium text-yellow-800">تنبيه: مخزون منخفض</h3>
                      <p className="text-sm text-yellow-700">
                        يوجد {stats.lowStockItems} منتج بمخزون منخفض. يُنصح بطلب توريد جديد.
                      </p>
                    </div>
                    <div className="mr-auto">
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
              )}
              
              {stats.outOfStockItems > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">🚨</span>
                    </div>
                    <div className="mr-3">
                      <h3 className="text-sm font-medium text-red-800">تنبيه: نفاد المخزون</h3>
                      <p className="text-sm text-red-700">
                        يوجد {stats.outOfStockItems} منتج نفد من المخزون. يجب طلب توريد عاجل.
                      </p>
                    </div>
                    <div className="mr-auto">
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => router.push('/restaurant/orders/create')}
                      >
                        طلب عاجل
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="إجمالي قيمة المخزون"
                value={formatCurrency(stats.totalValue)}
                icon="💰"
                color="blue"
              />
              
              <StatCard
                title="عدد المنتجات"
                value={stats.totalItems}
                subtitle="منتج"
                icon="📦"
                color="green"
              />
              
              <StatCard
                title="مخزون منخفض"
                value={stats.lowStockItems}
                subtitle="منتج"
                icon="⚠️"
                color="yellow"
                onClick={() => setFilterStatus('low_stock')}
              />
              
              <StatCard
                title="نفد المخزون"
                value={stats.outOfStockItems}
                subtitle="منتج"
                icon="🚨"
                color="red"
                onClick={() => setFilterStatus('out_of_stock')}
              />
            </div>
          )}

          {/* Chart */}
          {chartData && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>مستويات المخزون</CardTitle>
                  <CardDescription>مقارنة المخزون الحالي مع الحد الأدنى لكل منتج</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="bar"
                    data={chartData.stockLevels}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'current'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📦 المخزون الحالي
                </button>
                <button
                  onClick={() => setActiveTab('movements')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'movements'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📈 حركات المخزون
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'current' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>المخزون الحالي</CardTitle>
                    <CardDescription>عرض جميع المنتجات ومستويات المخزون</CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Input
                      placeholder="البحث في المنتجات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="in_stock">متوفر</option>
                      <option value="low_stock">منخفض</option>
                      <option value="out_of_stock">نفد</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={filteredInventory}
                  columns={inventoryColumns}
                  searchKey="productName"
                  emptyMessage="لا توجد منتجات"
                  emptyDescription="لم يتم العثور على منتجات تطابق معايير البحث"
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'movements' && (
            <Card>
              <CardHeader>
                <CardTitle>حركات المخزون</CardTitle>
                <CardDescription>سجل جميع حركات دخول وخروج المنتجات</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={movements}
                  columns={movementColumns}
                  searchKey="productName"
                  emptyMessage="لا توجد حركات مخزون"
                  emptyDescription="لم يتم تسجيل أي حركات مخزون بعد"
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedComponent>
  )
}
