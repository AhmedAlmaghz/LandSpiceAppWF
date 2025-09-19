'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/dashboard/DataTable'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import StatCard from '@/components/dashboard/StatCard'
import ExportTools from '@/components/dashboard/ExportTools'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

// Types
interface Restaurant {
  id: string
  userId: string
  name: string
  businessName?: string
  commercialRegNo?: string
  address?: string
  city?: string
  district?: string
  phone?: string
  email?: string
  monthlyQuota: number
  status: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    email?: string
    status: string
    lastLoginAt?: Date
  }
  marketer?: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  contracts?: Array<{
    id: string
    status: string
    monthlyAmount: number
    startDate: Date
    endDate: Date
  }>
  inventory?: {
    currentStock: number
    minStock: number
    lastUpdated: Date
  }
  _count: {
    designs: number
    invoices: number
    productionBatches: number
  }
}

interface RestaurantFilters {
  search: string
  status: string
  city: string
  marketerId: string
}

interface RestaurantStats {
  total: number
  active: number
  pending: number
  suspended: number
  totalRevenue: number
  averageQuota: number
}

export default function RestaurantsManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [stats, setStats] = useState<RestaurantStats>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    totalRevenue: 0,
    averageQuota: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState<RestaurantFilters>({
    search: '',
    status: '',
    city: '',
    marketerId: ''
  })
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [marketers, setMarketers] = useState<Array<{ id: string, name: string }>>([])

  // جلب المطاعم
  const fetchRestaurants = async (page = 1, limit = 10, searchParams: any = {}) => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...searchParams
      })

      const response = await fetch(`/api/admin/restaurants?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRestaurants(data.data.restaurants)
          setPagination(data.data.pagination)
          
          // حساب الإحصائيات
          const restaurantStats = calculateStats(data.data.restaurants)
          setStats(restaurantStats)
        }
      } else {
        // بيانات تجريبية
        const mockRestaurants: Restaurant[] = [
          {
            id: 'r1',
            userId: 'u1',
            name: 'مطعم البيك',
            businessName: 'شركة البيك للمأكولات السريعة',
            commercialRegNo: '123456789',
            address: 'شارع الملك فهد، الرياض',
            city: 'الرياض',
            district: 'العليا',
            phone: '+966501234567',
            email: 'info@albaik.com',
            monthlyQuota: 18000,
            status: 'active',
            createdAt: new Date('2025-01-10'),
            updatedAt: new Date(),
            user: {
              id: 'u1',
              username: 'albaik_rest',
              firstName: 'مطعم',
              lastName: 'البيك',
              email: 'manager@albaik.com',
              status: 'active',
              lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            contracts: [
              {
                id: 'c1',
                status: 'active',
                monthlyAmount: 15000,
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-12-31')
              }
            ],
            inventory: {
              currentStock: 12500,
              minStock: 2000,
              lastUpdated: new Date()
            },
            _count: {
              designs: 8,
              invoices: 12,
              productionBatches: 5
            }
          },
          {
            id: 'r2',
            userId: 'u2',
            name: 'مطعم الطازج',
            businessName: 'مؤسسة الطازج التجارية',
            city: 'جدة',
            district: 'البلد',
            phone: '+966502345678',
            monthlyQuota: 15000,
            status: 'pending',
            createdAt: new Date('2025-01-18'),
            updatedAt: new Date(),
            user: {
              id: 'u2',
              username: 'altazaj_rest',
              firstName: 'مطعم',
              lastName: 'الطازج',
              email: 'info@altazaj.com',
              status: 'inactive'
            },
            _count: {
              designs: 2,
              invoices: 0,
              productionBatches: 0
            }
          }
        ]
        
        setRestaurants(mockRestaurants)
        setStats(calculateStats(mockRestaurants))
      }
    } catch (error) {
      console.error('خطأ في جلب المطاعم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // حساب الإحصائيات
  const calculateStats = (restaurants: Restaurant[]): RestaurantStats => {
    const total = restaurants.length
    const active = restaurants.filter(r => r.status === 'active').length
    const pending = restaurants.filter(r => r.status === 'pending').length
    const suspended = restaurants.filter(r => r.status === 'suspended').length
    
    const totalRevenue = restaurants
      .flatMap(r => r.contracts || [])
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + Number(c.monthlyAmount), 0)
    
    const averageQuota = total > 0 
      ? restaurants.reduce((sum, r) => sum + r.monthlyQuota, 0) / total 
      : 0

    return {
      total,
      active,
      pending,
      suspended,
      totalRevenue,
      averageQuota: Math.round(averageQuota)
    }
  }

  // جلب البيانات المساعدة
  const fetchSupportData = async () => {
    try {
      // جلب المدن
      const uniqueCities = [...new Set(restaurants.map(r => r.city).filter(Boolean))]
      setCities(uniqueCities)

      // جلب المسوقين
      const marketersResponse = await fetch('/api/admin/users?role=marketer&limit=100')
      if (marketersResponse.ok) {
        const data = await marketersResponse.json()
        if (data.success) {
          const marketersList = data.data.users.map((user: any) => ({
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
          }))
          setMarketers(marketersList)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات المساعدة:', error)
    }
  }

  useEffect(() => {
    fetchRestaurants(pagination.page, pagination.limit, filters)
  }, [])

  useEffect(() => {
    fetchSupportData()
  }, [restaurants])

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin')
  }

  // تحديث حالة المطعم
  const handleStatusUpdate = async (restaurantId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurantId,
          status: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchRestaurants(pagination.page, pagination.limit, filters)
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة المطعم:', error)
    }
  }

  // العمليات الجماعية
  const handleBulkAction = async (action: string) => {
    if (selectedRestaurants.length === 0) return

    try {
      for (const restaurantId of selectedRestaurants) {
        if (action === 'activate') {
          await handleStatusUpdate(restaurantId, 'active')
        } else if (action === 'suspend') {
          await handleStatusUpdate(restaurantId, 'suspended')
        }
      }
      setSelectedRestaurants([])
    } catch (error) {
      console.error('خطأ في العملية الجماعية:', error)
    }
  }

  // التصفية والبحث
  const handleSearch = (searchParams: any) => {
    setFilters(prev => ({ ...prev, ...searchParams }))
    fetchRestaurants(1, pagination.limit, { ...filters, ...searchParams })
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'restaurant',
      label: 'المطعم',
      render: (restaurant: Restaurant) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">🏪</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{restaurant.name}</div>
            <div className="text-sm text-gray-500">{restaurant.businessName}</div>
            <div className="text-xs text-gray-400">
              {restaurant.city && `📍 ${restaurant.city}`}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'معلومات الاتصال',
      render: (restaurant: Restaurant) => (
        <div className="text-sm">
          <div className="text-gray-900">{restaurant.user.firstName} {restaurant.user.lastName}</div>
          <div className="text-gray-500">{restaurant.phone}</div>
          <div className="text-gray-400">{restaurant.email}</div>
        </div>
      )
    },
    {
      key: 'quota_stock',
      label: 'الحصة والمخزون',
      render: (restaurant: Restaurant) => (
        <div className="text-sm">
          <div className="text-gray-900">
            حصة: {restaurant.monthlyQuota.toLocaleString()}
          </div>
          {restaurant.inventory && (
            <div className="text-gray-500">
              مخزون: {restaurant.inventory.currentStock.toLocaleString()}
            </div>
          )}
          <div className="text-xs text-gray-400">
            {restaurant._count.designs} تصاميم، {restaurant._count.invoices} فواتير
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (restaurant: Restaurant) => (
        <div className="space-y-1">
          <span className={`status-badge ${getStatusColor(restaurant.status)}`}>
            {getStatusText(restaurant.status)}
          </span>
          <div className="text-xs text-gray-500">
            {restaurant.user.lastLoginAt 
              ? `آخر دخول: ${formatDate(restaurant.user.lastLoginAt)}`
              : 'لم يدخل مطلقاً'
            }
          </div>
        </div>
      )
    },
    {
      key: 'contracts',
      label: 'العقود',
      render: (restaurant: Restaurant) => {
        const activeContracts = restaurant.contracts?.filter(c => c.status === 'active') || []
        const totalAmount = activeContracts.reduce((sum, c) => sum + Number(c.monthlyAmount), 0)
        
        return (
          <div className="text-sm">
            <div className="text-gray-900">
              {activeContracts.length} عقد نشط
            </div>
            {totalAmount > 0 && (
              <div className="text-green-600 font-medium">
                {totalAmount.toLocaleString()} ر.ي/شهر
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'created',
      label: 'تاريخ التسجيل',
      render: (restaurant: Restaurant) => (
        <span className="text-sm text-gray-600">
          {formatDate(restaurant.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (restaurant: Restaurant) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
          >
            👁️ عرض
          </Button>
          
          {restaurant.status === 'pending' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusUpdate(restaurant.id, 'active')}
            >
              ✅ قبول
            </Button>
          )}
          
          {restaurant.status === 'active' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => handleStatusUpdate(restaurant.id, 'suspended')}
            >
              ⏸️ إيقاف
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/admin/restaurants/${restaurant.id}/edit`)}
          >
            ✏️ تعديل
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المطاعم...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['admin', 'landspice_employee']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إدارة المطاعم</h1>
                <p className="text-gray-600">
                  إجمالي {stats.total} مطعم، {stats.active} نشط
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <ExportTools
                  data={restaurants}
                  filename="restaurants"
                  title="تصدير المطاعم"
                />
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/admin/restaurants/create')}
                >
                  ➕ إضافة مطعم
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي المطاعم"
              value={stats.total}
              icon="🏪"
              color="blue"
              onClick={() => handleSearch({ status: '' })}
            />
            
            <StatCard
              title="المطاعم النشطة"
              value={stats.active}
              icon="✅"
              color="green"
              onClick={() => handleSearch({ status: 'active' })}
            />
            
            <StatCard
              title="في الانتظار"
              value={stats.pending}
              icon="⏳"
              color="yellow"
              onClick={() => handleSearch({ status: 'pending' })}
            />
            
            <StatCard
              title="الإيرادات الشهرية"
              value={`${stats.totalRevenue.toLocaleString()} ر.ي`}
              icon="💰"
              color="green"
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
                    placeholder: 'البحث في المطاعم...',
                    label: 'البحث العام'
                  },
                  {
                    key: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'active', label: 'نشط' },
                      { value: 'pending', label: 'في الانتظار' },
                      { value: 'suspended', label: 'موقوف' },
                      { value: 'terminated', label: 'منتهي' }
                    ]
                  },
                  {
                    key: 'city',
                    type: 'select',
                    label: 'المدينة',
                    options: [
                      { value: '', label: 'جميع المدن' },
                      ...cities.map(city => ({ value: city, label: city }))
                    ]
                  },
                  {
                    key: 'marketerId',
                    type: 'select',
                    label: 'المسوق',
                    options: [
                      { value: '', label: 'جميع المسوقين' },
                      ...marketers.map(marketer => ({ value: marketer.id, label: marketer.name }))
                    ]
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRestaurants.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedRestaurants.length} مطعم
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="success" onClick={() => handleBulkAction('activate')}>
                      ✅ تفعيل
                    </Button>
                    <Button size="sm" variant="warning" onClick={() => handleBulkAction('suspend')}>
                      ⏸️ إيقاف
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                      📤 تصدير
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restaurants Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة المطاعم</CardTitle>
              <CardDescription>
                إدارة شاملة لجميع المطاعم المسجلة في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={restaurants}
                columns={columns}
                searchKey="name"
                pagination={pagination}
                onPageChange={(page) => {
                  setPagination(prev => ({ ...prev, page }))
                  fetchRestaurants(page, pagination.limit, filters)
                }}
                onSelectionChange={setSelectedRestaurants}
                selectedItems={selectedRestaurants}
                emptyMessage="لا توجد مطاعم"
                emptyDescription="لم يتم العثور على مطاعم تطابق معايير البحث"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
