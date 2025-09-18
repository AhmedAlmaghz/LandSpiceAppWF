'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import QuickActions from '@/components/dashboard/QuickActions'
import DataTable from '@/components/dashboard/DataTable'

// Types
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  totalRestaurants: number
  activeContracts: number
  monthlyRevenue: number
  pendingOrders: number
  lowStockAlerts: number
}

interface RecentActivity {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  timestamp: Date
  user?: {
    name: string
    role?: string
  }
}

interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'
  onClick: () => void
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.roleName !== 'admin') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي لاحقاً
      setStats({
        totalUsers: 156,
        activeUsers: 142,
        pendingUsers: 14,
        totalRestaurants: 89,
        activeContracts: 76,
        monthlyRevenue: 485750,
        pendingOrders: 23,
        lowStockAlerts: 8
      })

      setActivities([
        {
          id: '1',
          type: 'success',
          title: 'تسجيل مطعم جديد',
          description: 'مطعم الطازج قام بالتسجيل بنجاح في النظام',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user: { name: 'مطعم الطازج', role: 'مطعم' }
        },
        {
          id: '2',
          type: 'success',
          title: 'توقيع عقد جديد',
          description: 'تم توقيع عقد مع مطعم البيك الجديد بنجاح',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          user: { name: 'مطعم البيك', role: 'مطعم' }
        },
        {
          id: '3',
          type: 'info',
          title: 'اكتمال طلب طباعة',
          description: 'تم إنجاز طلب طباعة لـ 5 مطاعم بنجاح',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
          id: '4',
          type: 'success',
          title: 'استلام دفعة',
          description: 'تم استلام دفعة 15,500 ريال من مطعم الدانة',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          user: { name: 'مطعم الدانة', role: 'مطعم' }
        },
        {
          id: '5',
          type: 'warning',
          title: 'مخزون منخفض',
          description: 'مستوى المخزون منخفض لعبوات الشطة الحارة',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
        }
      ])
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }


  // إعداد الإجراءات السريعة
  const quickActions: QuickAction[] = [
    {
      id: 'add-user',
      title: 'إضافة مستخدم',
      description: 'إضافة مستخدم جديد للنظام',
      icon: '👤',
      color: 'blue',
      onClick: () => window.location.href = '/admin/users'
    },
    {
      id: 'manage-restaurants',
      title: 'إدارة المطاعم',
      description: 'عرض وإدارة المطاعم',
      icon: '🏪',
      color: 'green',
      onClick: () => console.log('إدارة المطاعم')
    },
    {
      id: 'contracts',
      title: 'العقود والضمانات',
      description: 'متابعة العقود والضمانات',
      icon: '📝',
      color: 'purple',
      onClick: () => console.log('العقود والضمانات')
    },
    {
      id: 'print-orders',
      title: 'أوامر الطباعة',
      description: 'إدارة أوامر الطباعة',
      icon: '🖨️',
      color: 'orange',
      onClick: () => console.log('أوامر الطباعة')
    },
    {
      id: 'invoices',
      title: 'الفواتير والمدفوعات',
      description: 'متابعة الفواتير والمدفوعات',
      icon: '💰',
      color: 'green',
      onClick: () => console.log('الفواتير والمدفوعات')
    },
    {
      id: 'reports',
      title: 'التقارير والإحصائيات',
      description: 'عرض التقارير المفصلة',
      icon: '📊',
      color: 'blue',
      onClick: () => console.log('التقارير والإحصائيات')
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
              <p className="text-gray-600">أهلاً بك، {session.user.name || session.user.username}</p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm">
                📊 التقارير
              </Button>
              <Button variant="primary" size="sm">
                ⚙️ الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المستخدمين"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.activeUsers} نشط، ${stats?.pendingUsers} في الانتظار`}
            icon="👥"
            color="blue"
            trend={{ value: 8.5, label: 'من الشهر الماضي', isPositive: true }}
            onClick={() => window.location.href = '/admin/users'}
          />
          
          <StatCard
            title="المطاعم المسجلة"
            value={stats?.totalRestaurants || 0}
            subtitle={`${stats?.activeContracts} عقد نشط`}
            icon="🏪"
            color="green"
            trend={{ value: 12.3, label: 'من الشهر الماضي', isPositive: true }}
            onClick={() => console.log('إدارة المطاعم')}
          />
          
          <StatCard
            title="الإيرادات الشهرية"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            subtitle="السعودي الريال"
            icon="💰"
            color="green"
            trend={{ value: 15.7, label: 'من الشهر الماضي', isPositive: true }}
          />
          
          <StatCard
            title="التنبيهات"
            value={(stats?.pendingOrders || 0) + (stats?.lowStockAlerts || 0)}
            subtitle={`${stats?.pendingOrders} طلبات، ${stats?.lowStockAlerts} مخزون منخفض`}
            icon="🚨"
            color="yellow"
            trend={{ value: 3.2, label: 'من الأسبوع الماضي', isPositive: false }}
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ActivityFeed
              activities={activities}
              autoRefresh={true}
              refreshInterval={30000}
              onRefresh={fetchDashboardData}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions
              actions={quickActions}
              columns={1}
              size="md"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>حالة النظام</CardTitle>
              <CardDescription>مراقبة صحة النظام والخدمات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                    <span className="text-sm font-medium">قاعدة البيانات</span>
                  </div>
                  <span className="text-xs text-green-600">متصلة</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                    <span className="text-sm font-medium">خدمة المصادقة</span>
                  </div>
                  <span className="text-xs text-green-600">تعمل</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full ml-3"></div>
                    <span className="text-sm font-medium">النسخ الاحتياطي</span>
                  </div>
                  <span className="text-xs text-yellow-600">قيد التشغيل</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
