'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

// Types
interface UserDetails {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  role: {
    id: number
    name: string
    displayName: string
  }
  status: string
  isVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  restaurant?: {
    id: string
    name: string
    businessName?: string
    status: string
    monthlyQuota: number
    currentStock?: number
  }
  bank?: {
    id: string
    name: string
    branch?: string
  }
  supplier?: {
    id: string
    name: string
    specialization?: string
    rating?: number
    totalOrders: number
  }
}

interface UserStats {
  loginCount: number
  lastActivityDays: number
  relatedEntities: number
  activeContracts?: number
  totalOrders?: number
  monthlyRevenue?: number
}

interface UserActivity {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  timestamp: Date
}

export default function UserDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  const [user, setUser] = useState<UserDetails | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // جلب تفاصيل المستخدم
  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data.user)
          setUserStats(data.data.stats)
          setActivities(data.data.activities || [])
        }
      } else {
        // بيانات تجريبية في حال عدم توفر API
        const mockUser: UserDetails = {
          id: userId,
          username: 'test_user',
          email: 'test@example.com',
          firstName: 'مستخدم',
          lastName: 'تجريبي',
          phone: '+967771234567',
          role: { id: 2, name: 'restaurant', displayName: 'مطعم' },
          status: 'active',
          isVerified: true,
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date(),
          restaurant: {
            id: 'r1',
            name: 'مطعم تجريبي',
            businessName: 'شركة المطعم التجريبي المحدودة',
            status: 'active',
            monthlyQuota: 18000,
            currentStock: 12500
          }
        }

        const mockStats: UserStats = {
          loginCount: 45,
          lastActivityDays: 2,
          relatedEntities: 1,
          activeContracts: 2,
          totalOrders: 18,
          monthlyRevenue: 25000
        }

        const mockActivities: UserActivity[] = [
          {
            id: '1',
            type: 'success',
            title: 'تسجيل دخول',
            description: 'دخل المستخدم إلى النظام',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'info',
            title: 'تحديث الملف الشخصي',
            description: 'تم تحديث معلومات الحساب',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]

        setUser(mockUser)
        setUserStats(mockStats)
        setActivities(mockActivities)
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المستخدم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin')
  }

  // تحديث حالة المستخدم
  const handleStatusUpdate = async (newStatus: string) => {
    if (!user) return
    
    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          status: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(prev => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, string> = {
      admin: '👑',
      restaurant: '🏪',
      bank: '🏦',
      supplier: '📦',
      marketer: '📈',
      landspice_employee: '👥'
    }
    return icons[roleName] || '👤'
  }

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'لم يدخل مطلقاً'
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return 'منذ لحظات'
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    
    const diffInDays = Math.floor(diffInMinutes / 1440)
    return `منذ ${diffInDays} يوم`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل المستخدم...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">المستخدم غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على المستخدم المطلوب</p>
          <Button onClick={() => router.back()}>العودة</Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['admin']}>
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/users/${user.id}/edit`)}
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* معلومات المستخدم الأساسية */}
            <div className="lg:col-span-2 space-y-6">
              {/* بطاقة المعلومات الشخصية */}
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6 space-x-reverse">
                    {/* صورة المستخدم */}
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-red-600 font-bold text-2xl">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* المعلومات */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">الاسم الكامل</label>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">البريد الإلكتروني</label>
                        <p className="font-medium">{user.email || 'غير محدد'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">رقم الهاتف</label>
                        <p className="font-medium">{user.phone || 'غير محدد'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">الدور</label>
                        <div className="flex items-center">
                          <span className="ml-2 text-lg">{getRoleIcon(user.role.name)}</span>
                          <span className="font-medium">{user.role.displayName}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">حالة الحساب</label>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className={`status-badge ${getStatusColor(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                          {!user.isVerified && (
                            <span className="status-badge bg-yellow-100 text-yellow-800 text-xs">
                              غير مُحقق
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500">آخر نشاط</label>
                        <p className="font-medium">{formatLastActivity(user.lastLoginAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* معلومات الكيان المرتبط */}
              {(user.restaurant || user.bank || user.supplier) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {user.restaurant && 'معلومات المطعم'}
                      {user.bank && 'معلومات البنك'}
                      {user.supplier && 'معلومات المورد'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.restaurant && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">اسم المطعم</label>
                          <p className="font-medium">{user.restaurant.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">الاسم التجاري</label>
                          <p className="font-medium">{user.restaurant.businessName || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">الحصة الشهرية</label>
                          <p className="font-medium">{user.restaurant.monthlyQuota.toLocaleString()} عبوة</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">المخزون الحالي</label>
                          <p className="font-medium">{user.restaurant.currentStock?.toLocaleString() || 0} عبوة</p>
                        </div>
                      </div>
                    )}

                    {user.bank && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">اسم البنك</label>
                          <p className="font-medium">{user.bank.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">الفرع</label>
                          <p className="font-medium">{user.bank.branch || 'غير محدد'}</p>
                        </div>
                      </div>
                    )}

                    {user.supplier && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">اسم المورد</label>
                          <p className="font-medium">{user.supplier.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">التخصص</label>
                          <p className="font-medium">{user.supplier.specialization || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">التقييم</label>
                          <p className="font-medium">
                            {user.supplier.rating ? `${user.supplier.rating}/5 ⭐` : 'غير مقيم'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">إجمالي الطلبات</label>
                          <p className="font-medium">{user.supplier.totalOrders}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* النشاط الأخير */}
              <Card>
                <CardHeader>
                  <CardTitle>النشاط الأخير</CardTitle>
                  <CardDescription>آخر الأنشطة المسجلة للمستخدم</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityFeed
                    activities={activities}
                    maxItems={10}
                    showFilters={false}
                  />
                </CardContent>
              </Card>
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 gap-4">
                <StatCard
                  title="مرات الدخول"
                  value={userStats?.loginCount || 0}
                  icon="🔑"
                  color="blue"
                />
                
                <StatCard
                  title="آخر نشاط"
                  value={`${userStats?.lastActivityDays || 0} يوم`}
                  icon="📅"
                  color="green"
                />
                
                <StatCard
                  title="الكيانات المرتبطة"
                  value={userStats?.relatedEntities || 0}
                  icon="🔗"
                  color="purple"
                />

                {userStats?.activeContracts !== undefined && (
                  <StatCard
                    title="العقود النشطة"
                    value={userStats.activeContracts}
                    icon="📝"
                    color="orange"
                  />
                )}
              </div>

              {/* إجراءات سريعة */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.status === 'active' ? (
                    <Button
                      variant="warning"
                      className="w-full"
                      onClick={() => handleStatusUpdate('inactive')}
                      disabled={isUpdating}
                    >
                      ⏸️ إيقاف الحساب
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => handleStatusUpdate('active')}
                      disabled={isUpdating}
                    >
                      ✅ تفعيل الحساب
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                  >
                    ✏️ تعديل المعلومات
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    🔄 إعادة تعيين كلمة المرور
                  </Button>

                  <Button
                    variant="outline" 
                    className="w-full"
                  >
                    📄 عرض السجل الكامل
                  </Button>
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
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">آخر تحديث</label>
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">معرف النظام</label>
                    <p className="font-mono text-sm text-gray-600">{user.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
