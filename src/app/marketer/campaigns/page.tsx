'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import Chart from '@/components/dashboard/Chart'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface Campaign {
  id: string
  title: string
  titleArabic: string
  type: 'acquisition' | 'retention' | 'seasonal' | 'product_launch' | 'referral'
  status: 'draft' | 'active' | 'scheduled' | 'completed' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  targetAudience: 'restaurants' | 'suppliers' | 'both'
  startDate: Date
  endDate: Date
  budget: number
  spentAmount: number
  targets: {
    restaurants: number
    suppliers: number
    conversions: number
    revenue: number
  }
  achievements: {
    restaurantsAcquired: number
    suppliersAcquired: number  
    conversions: number
    revenue: number
  }
  channels: string[]
  offers: Array<{
    id: string
    title: string
    discountType: 'percentage' | 'fixed' | 'free_service'
    discountValue: number
    minSpend?: number
    validityDays: number
  }>
  performance: {
    impressions: number
    clicks: number
    ctr: number
    conversionRate: number
    roi: number
  }
  regions: string[]
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  scheduledCampaigns: number
  completedCampaigns: number
  totalBudget: number
  totalSpent: number
  totalRevenue: number
  avgConversionRate: number
}

export default function MarketerCampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    scheduledCampaigns: 0,
    completedCampaigns: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalRevenue: 0,
    avgConversionRate: 0
  })
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      
      // بيانات تجريبية شاملة
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Welcome New Restaurants',
          titleArabic: 'ترحيب المطاعم الجديدة',
          type: 'acquisition',
          status: 'active',
          priority: 'high',
          targetAudience: 'restaurants',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-02-28'),
          budget: 50000,
          spentAmount: 32000,
          targets: {
            restaurants: 25,
            suppliers: 0,
            conversions: 20,
            revenue: 500000
          },
          achievements: {
            restaurantsAcquired: 18,
            suppliersAcquired: 0,
            conversions: 15,
            revenue: 385000
          },
          channels: ['رقمي', 'زيارات ميدانية', 'معارض'],
          offers: [
            {
              id: 'off1',
              title: 'خصم شهر مجاني',
              discountType: 'free_service',
              discountValue: 100,
              validityDays: 30
            },
            {
              id: 'off2',
              title: 'خصم 25% على الرسوم',
              discountType: 'percentage',
              discountValue: 25,
              minSpend: 10000,
              validityDays: 60
            }
          ],
          performance: {
            impressions: 15500,
            clicks: 890,
            ctr: 5.74,
            conversionRate: 72,
            roi: 240
          },
          regions: ['صنعاء', 'عدن', 'تعز'],
          notes: 'حملة ناجحة جداً - تحقق نتائج أعلى من المتوقع',
          createdBy: 'عبدالله النجار',
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date('2025-01-20')
        },
        {
          id: '2',
          title: 'Ramadan Special Offers',
          titleArabic: 'عروض رمضان الخاصة',
          type: 'seasonal',
          status: 'scheduled',
          priority: 'high',
          targetAudience: 'both',
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-04-10'),
          budget: 80000,
          spentAmount: 0,
          targets: {
            restaurants: 40,
            suppliers: 15,
            conversions: 35,
            revenue: 750000
          },
          achievements: {
            restaurantsAcquired: 0,
            suppliersAcquired: 0,
            conversions: 0,
            revenue: 0
          },
          channels: ['إعلام تقليدي', 'رقمي', 'مساجد'],
          offers: [
            {
              id: 'off3',
              title: 'عرض إفطار مجاني',
              discountType: 'free_service',
              discountValue: 100,
              validityDays: 45
            }
          ],
          performance: {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            conversionRate: 0,
            roi: 0
          },
          regions: ['جميع المحافظات'],
          notes: 'حملة موسمية مهمة - التحضير مبكراً',
          createdBy: 'فاطمة الشامي',
          createdAt: new Date('2025-01-05'),
          updatedAt: new Date('2025-01-18')
        },
        {
          id: '3',
          title: 'Supplier Partnership Program',
          titleArabic: 'برنامج شراكة الموردين',
          type: 'acquisition',
          status: 'completed',
          priority: 'medium',
          targetAudience: 'suppliers',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2025-01-15'),
          budget: 35000,
          spentAmount: 33500,
          targets: {
            restaurants: 0,
            suppliers: 12,
            conversions: 10,
            revenue: 300000
          },
          achievements: {
            restaurantsAcquired: 0,
            suppliersAcquired: 14,
            conversions: 12,
            revenue: 340000
          },
          channels: ['زيارات ميدانية', 'شبكات أعمال'],
          offers: [
            {
              id: 'off4',
              title: 'رسوم تسجيل مخفضة',
              discountType: 'percentage',
              discountValue: 50,
              validityDays: 90
            }
          ],
          performance: {
            impressions: 8200,
            clicks: 456,
            ctr: 5.56,
            conversionRate: 120,
            roi: 304
          },
          regions: ['صنعاء', 'حضرموت'],
          notes: 'حملة مكتملة بنجاح - تجاوزت الأهداف',
          createdBy: 'محمد الحضرمي',
          createdAt: new Date('2024-11-15'),
          updatedAt: new Date('2025-01-16')
        }
      ]

      setCampaigns(mockCampaigns)
      
      // حساب الإحصائيات
      const totalCampaigns = mockCampaigns.length
      const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').length
      const scheduledCampaigns = mockCampaigns.filter(c => c.status === 'scheduled').length
      const completedCampaigns = mockCampaigns.filter(c => c.status === 'completed').length
      const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budget, 0)
      const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spentAmount, 0)
      const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.achievements.revenue, 0)
      const avgConversionRate = mockCampaigns.reduce((sum, c) => sum + c.performance.conversionRate, 0) / totalCampaigns

      setStats({
        totalCampaigns,
        activeCampaigns,
        scheduledCampaigns,
        completedCampaigns,
        totalBudget,
        totalSpent,
        totalRevenue,
        avgConversionRate
      })

      // بيانات المخططات
      setChartData({
        campaignTypes: {
          labels: ['اكتساب عملاء', 'الاحتفاظ', 'موسمية', 'إطلاق منتج', 'إحالات'],
          datasets: [{
            data: [2, 0, 1, 0, 0],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(147, 51, 234, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }]
        },
        monthlyPerformance: {
          labels: ['نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس'],
          datasets: [{
            label: 'الإنفاق',
            data: [0, 33500, 32000, 0, 0],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2
          }, {
            label: 'الإيرادات',
            data: [0, 340000, 385000, 0, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
          }]
        }
      })
    } catch (error) {
      console.error('خطأ في جلب الحملات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'marketer') redirect('/auth/signin')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '🟢 نشطة'
      case 'scheduled': return '📅 مجدولة'
      case 'completed': return '✅ مكتملة'
      case 'cancelled': return '❌ ملغية'
      case 'draft': return '📄 مسودة'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'acquisition': return 'bg-blue-100 text-blue-800'
      case 'retention': return 'bg-green-100 text-green-800'
      case 'seasonal': return 'bg-orange-100 text-orange-800'
      case 'product_launch': return 'bg-purple-100 text-purple-800'
      case 'referral': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'acquisition': return '🎯 اكتساب'
      case 'retention': return '🤝 احتفاظ'
      case 'seasonal': return '🎪 موسمية'
      case 'product_launch': return '🚀 إطلاق'
      case 'referral': return '👥 إحالة'
      default: return type
    }
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'campaign',
      label: 'الحملة',
      render: (campaign: Campaign) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{campaign.titleArabic}</div>
          <div className="text-sm text-gray-500">{campaign.title}</div>
          <div className="flex space-x-2 space-x-reverse">
            <span className={`status-badge text-xs ${getTypeColor(campaign.type)}`}>
              {getTypeText(campaign.type)}
            </span>
            <span className={`status-badge text-xs ${campaign.priority === 'high' ? 'bg-red-100 text-red-800' : campaign.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {campaign.priority === 'high' ? '🔴 عالي' : campaign.priority === 'medium' ? '🟡 متوسط' : '🟢 منخفض'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'targets',
      label: 'الأهداف',
      render: (campaign: Campaign) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {campaign.targetAudience === 'restaurants' ? '🏪 مطاعم' :
             campaign.targetAudience === 'suppliers' ? '🏭 موردين' : '🏪🏭 كلاهما'}
          </div>
          <div className="text-xs text-gray-600">
            {campaign.targets.restaurants > 0 && `${campaign.targets.restaurants} مطعم`}
            {campaign.targets.suppliers > 0 && ` ${campaign.targets.suppliers} مورد`}
          </div>
          <div className="text-xs text-green-600">
            {formatCurrency(campaign.targets.revenue)}
          </div>
        </div>
      )
    },
    {
      key: 'budget',
      label: 'الميزانية',
      render: (campaign: Campaign) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(campaign.budget)}
          </div>
          <div className="text-xs text-gray-600">
            مُنفق: {formatCurrency(campaign.spentAmount)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-orange-600 h-1 rounded-full" 
              style={{ width: `${(campaign.spentAmount / campaign.budget) * 100}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'performance',
      label: 'الأداء',
      render: (campaign: Campaign) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {campaign.achievements.restaurantsAcquired + campaign.achievements.suppliersAcquired}
          </div>
          <div className="text-xs text-gray-600">
            من {campaign.targets.restaurants + campaign.targets.suppliers} مستهدف
          </div>
          <div className="text-xs text-blue-600">
            تحويل: {campaign.performance.conversionRate}%
          </div>
          <div className="text-xs text-green-600">
            ROI: {campaign.performance.roi}%
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'الفترة',
      render: (campaign: Campaign) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            {formatDate(campaign.startDate)}
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(campaign.endDate)}
          </div>
          <div className="text-xs text-gray-500">
            {Math.ceil((campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24))} يوم
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (campaign: Campaign) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(campaign.status)}`}>
            {getStatusText(campaign.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(campaign.updatedAt)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (campaign: Campaign) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/marketer/campaigns/${campaign.id}`)}
          >
            👁️ عرض
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/marketer/campaigns/${campaign.id}/edit`)}
          >
            ✏️ تعديل
          </Button>
          
          {campaign.status === 'draft' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {/* تفعيل الحملة */}}
            >
              🚀 تفعيل
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الحملات التسويقية...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['marketer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🎯 إدارة الحملات التسويقية</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalCampaigns} حملة، {stats.activeCampaigns} نشطة
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/marketer/campaigns/templates')}
                >
                  📝 قوالب الحملات
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/marketer/campaigns/create')}
                >
                  ➕ حملة جديدة
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
              title="إجمالي الحملات"
              value={stats.totalCampaigns}
              icon="🎯"
              color="blue"
            />
            
            <StatCard
              title="حملات نشطة"
              value={stats.activeCampaigns}
              icon="🟢"
              color="green"
            />
            
            <StatCard
              title="حملات مجدولة"
              value={stats.scheduledCampaigns}
              icon="📅"
              color="purple"
            />
            
            <StatCard
              title="حملات مكتملة"
              value={stats.completedCampaigns}
              icon="✅"
              color="gray"
            />
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="إجمالي الميزانية"
              value={formatCurrency(stats.totalBudget)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="المبلغ المُنفق"
              value={formatCurrency(stats.totalSpent)}
              icon="💸"
              color="red"
            />
            
            <StatCard
              title="إجمالي الإيرادات"
              value={formatCurrency(stats.totalRevenue)}
              icon="📈"
              color="blue"
            />
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>أنواع الحملات</CardTitle>
                  <CardDescription>توزيع الحملات حسب النوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="doughnut"
                    data={chartData.campaignTypes}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الأداء الشهري</CardTitle>
                  <CardDescription>الإنفاق مقابل الإيرادات</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="bar"
                    data={chartData.monthlyPerformance}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الحملات التسويقية</CardTitle>
              <CardDescription>
                جميع حملاتك مع تفاصيل الأداء والنتائج
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={campaigns}
                columns={columns}
                searchKey="titleArabic"
                onSelectionChange={setSelectedCampaigns}
                selectedItems={selectedCampaigns}
                emptyMessage="لا توجد حملات"
                emptyDescription="لم يتم إنشاء أي حملات تسويقية بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
