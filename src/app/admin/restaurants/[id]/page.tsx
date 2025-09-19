'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import Chart from '@/components/dashboard/Chart'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

// Types
interface RestaurantDetails {
  id: string
  userId: string
  name: string
  businessName?: string
  commercialRegNo?: string
  taxNumber?: string
  address?: string
  city?: string
  district?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
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
    phone?: string
    status: string
    lastLoginAt?: Date
  }
  marketer?: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  contracts: Array<{
    id: string
    contractNumber?: string
    status: string
    monthlyAmount: number
    startDate: Date
    endDate: Date
    bank: {
      id: string
      name: string
    }
  }>
  inventory?: {
    id: string
    currentStock: number
    minStock: number
    maxStock: number
    lastUpdated: Date
  }
  designs: Array<{
    id: string
    title?: string
    status: string
    designType: string
    createdAt: Date
  }>
  invoices: Array<{
    id: string
    totalAmount: number
    status: string
    dueDate: Date
    createdAt: Date
  }>
  _count: {
    designs: number
    invoices: number
    productionBatches: number
  }
}

interface RestaurantStats {
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
  stockLevel: number
  contractsValue: number
  paymentRate: number
}

export default function RestaurantDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const restaurantId = params?.id as string

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null)
  const [stats, setStats] = useState<RestaurantStats | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'inventory' | 'designs' | 'invoices'>('overview')

  // جلب تفاصيل المطعم
  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRestaurant(data.data.restaurant)
          setStats(data.data.stats)
          setActivities(data.data.activities || [])
        }
      } else {
        // بيانات تجريبية في حال عدم توفر API
        const mockRestaurant: RestaurantDetails = {
          id: restaurantId,
          userId: 'u1',
          name: 'مطعم البيك التجريبي',
          businessName: 'شركة البيك للمأكولات السريعة المحدودة',
          commercialRegNo: '1234567890',
          taxNumber: '300123456789003',
          address: 'شارع الملك فهد، حي العليا',
          city: 'الرياض',
          district: 'العليا',
          postalCode: '12345',
          phone: '+966501234567',
          email: 'info@albaik.com',
          website: 'https://albaik.com',
          monthlyQuota: 18000,
          status: 'active',
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date(),
          user: {
            id: 'u1',
            username: 'albaik_manager',
            firstName: 'محمد',
            lastName: 'العتيبي',
            email: 'manager@albaik.com',
            phone: '+966501234567',
            status: 'active',
            lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          contracts: [
            {
              id: 'c1',
              contractNumber: 'CON-2025-0001',
              status: 'active',
              monthlyAmount: 15000,
              startDate: new Date('2025-01-15'),
              endDate: new Date('2025-12-31'),
              bank: {
                id: 'b1',
                name: 'بنك القاسمي'
              }
            }
          ],
          inventory: {
            id: 'inv1',
            currentStock: 12500,
            minStock: 2000,
            maxStock: 20000,
            lastUpdated: new Date()
          },
          designs: [
            {
              id: 'd1',
              title: 'تصميم العبوة الجديدة',
              status: 'approved',
              designType: 'packaging',
              createdAt: new Date('2025-01-15')
            },
            {
              id: 'd2',
              title: 'شعار المطعم المحدث',
              status: 'under_review',
              designType: 'logo',
              createdAt: new Date('2025-01-18')
            }
          ],
          invoices: [
            {
              id: 'inv1',
              totalAmount: 15000,
              status: 'paid',
              dueDate: new Date('2025-01-31'),
              createdAt: new Date('2025-01-15')
            }
          ],
          _count: {
            designs: 8,
            invoices: 12,
            productionBatches: 5
          }
        }

        const mockStats: RestaurantStats = {
          totalOrders: 25,
          completedOrders: 22,
          totalRevenue: 180000,
          averageOrderValue: 7200,
          stockLevel: 65,
          contractsValue: 15000,
          paymentRate: 95
        }

        setRestaurant(mockRestaurant)
        setStats(mockStats)
        setActivities([
          {
            id: '1',
            type: 'success',
            title: 'دفع فاتورة',
            description: 'تم دفع فاتورة شهر يناير بقيمة 15,000 ريال',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'info',
            title: 'تحديث المخزون',
            description: 'تم استلام شحنة جديدة - 5000 عبوة',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ])
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المطعم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails()
    }
  }, [restaurantId])

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || !['admin', 'landspice_employee'].includes(session.user.role)) {
    redirect('/auth/signin')
  }

  // تحديث حالة المطعم
  const handleStatusUpdate = async (newStatus: string) => {
    if (!restaurant) return
    
    try {
      const response = await fetch('/api/admin/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurant.id,
          status: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRestaurant(prev => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error)
    }
  }

  const getStockLevelColor = (level: number) => {
    if (level >= 70) return 'text-green-600'
    if (level >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل المطعم...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">المطعم غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على المطعم المطلوب</p>
          <Button onClick={() => router.back()}>العودة</Button>
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
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="ghost" 
                  onClick={() => router.back()}
                >
                  ← العودة
                </Button>
                <div className="border-r border-gray-200 h-6"></div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  {restaurant.logo ? (
                    <img 
                      src={restaurant.logo} 
                      alt={restaurant.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">🏪</span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                    <p className="text-gray-600">{restaurant.businessName}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <span className={`status-badge ${getStatusColor(restaurant.status)}`}>
                  {getStatusText(restaurant.status)}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/restaurants/${restaurant.id}/edit`)}
                >
                  ✏️ تعديل
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                >
                  📧 إرسال رسالة
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 space-x-reverse">
              {[
                { key: 'overview', label: 'نظرة عامة', icon: '📊' },
                { key: 'contracts', label: 'العقود', icon: '📝' },
                { key: 'inventory', label: 'المخزون', icon: '📦' },
                { key: 'designs', label: 'التصاميم', icon: '🎨' },
                { key: 'invoices', label: 'الفواتير', icon: '🧾' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse ${
                    activeTab === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* الإحصائيات */}
              <div className="lg:col-span-2 space-y-6">
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="إجمالي الطلبات"
                    value={stats?.totalOrders || 0}
                    subtitle={`${stats?.completedOrders || 0} مكتمل`}
                    icon="📋"
                    color="blue"
                  />
                  
                  <StatCard
                    title="إجمالي الإيرادات"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    subtitle="هذا الشهر"
                    icon="💰"
                    color="green"
                  />
                  
                  <StatCard
                    title="مستوى المخزون"
                    value={`${stats?.stockLevel || 0}%`}
                    subtitle={`${restaurant.inventory?.currentStock.toLocaleString() || 0} عبوة`}
                    icon="📦"
                    color={stats?.stockLevel && stats.stockLevel >= 70 ? "green" : stats?.stockLevel && stats.stockLevel >= 30 ? "yellow" : "red"}
                  />
                </div>

                {/* معلومات المطعم */}
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات المطعم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">اسم المطعم</label>
                          <p className="font-medium">{restaurant.name}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500">الاسم التجاري</label>
                          <p className="font-medium">{restaurant.businessName || 'غير محدد'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500">رقم السجل التجاري</label>
                          <p className="font-medium">{restaurant.commercialRegNo || 'غير محدد'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500">الرقم الضريبي</label>
                          <p className="font-medium">{restaurant.taxNumber || 'غير محدد'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">العنوان</label>
                          <p className="font-medium">
                            {restaurant.address || 'غير محدد'}
                            {restaurant.city && `, ${restaurant.city}`}
                            {restaurant.district && `, ${restaurant.district}`}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500">الهاتف</label>
                          <p className="font-medium">{restaurant.phone || 'غير محدد'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500">البريد الإلكتروني</label>
                          <p className="font-medium">{restaurant.email || 'غير محدد'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-500">الموقع الإلكتروني</label>
                          <p className="font-medium">
                            {restaurant.website ? (
                              <a href={restaurant.website} target="_blank" className="text-blue-600 hover:underline">
                                {restaurant.website}
                              </a>
                            ) : 'غير محدد'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* معلومات المدير */}
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات مدير المطعم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500">اسم المدير</label>
                        <p className="font-medium">
                          {restaurant.user.firstName} {restaurant.user.lastName}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">اسم المستخدم</label>
                        <p className="font-medium">@{restaurant.user.username}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">البريد الإلكتروني</label>
                        <p className="font-medium">{restaurant.user.email}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">آخر دخول</label>
                        <p className="font-medium">
                          {restaurant.user.lastLoginAt 
                            ? formatDate(restaurant.user.lastLoginAt)
                            : 'لم يدخل مطلقاً'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* الشريط الجانبي */}
              <div className="space-y-6">
                {/* إجراءات سريعة */}
                <Card>
                  <CardHeader>
                    <CardTitle>إجراءات سريعة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {restaurant.status === 'pending' && (
                      <Button
                        variant="success"
                        className="w-full"
                        onClick={() => handleStatusUpdate('active')}
                      >
                        ✅ قبول المطعم
                      </Button>
                    )}

                    {restaurant.status === 'active' ? (
                      <Button
                        variant="warning"
                        className="w-full"
                        onClick={() => handleStatusUpdate('suspended')}
                      >
                        ⏸️ إيقاف المطعم
                      </Button>
                    ) : restaurant.status === 'suspended' && (
                      <Button
                        variant="success"
                        className="w-full"
                        onClick={() => handleStatusUpdate('active')}
                      >
                        ✅ تفعيل المطعم
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/admin/restaurants/${restaurant.id}/edit`)}
                    >
                      ✏️ تعديل المعلومات
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/admin/contracts/create?restaurantId=${restaurant.id}`)}
                    >
                      📝 إنشاء عقد جديد
                    </Button>

                    <Button
                      variant="outline" 
                      className="w-full"
                    >
                      📊 عرض التقارير
                    </Button>
                  </CardContent>
                </Card>

                {/* النشاط الأخير */}
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

                {/* معلومات النظام */}
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات النظام</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">تاريخ التسجيل</label>
                      <p className="font-medium">{formatDate(restaurant.createdAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500">آخر تحديث</label>
                      <p className="font-medium">{formatDate(restaurant.updatedAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500">الحصة الشهرية</label>
                      <p className="font-medium">{restaurant.monthlyQuota.toLocaleString()} عبوة</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-500">معرف النظام</label>
                      <p className="font-mono text-sm text-gray-600">{restaurant.id}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* باقي التبويبات ستأتي هنا */}
          {activeTab !== 'overview' && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">قيد التطوير</h3>
              <p className="text-gray-600">
                هذا القسم قيد التطوير وسيكون متاحاً قريباً
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedComponent>
  )
}
