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
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Commission {
  id: string
  clientType: 'restaurant' | 'supplier'
  clientName: string
  clientId: string
  contractValue: number
  commissionRate: number
  commissionAmount: number
  commissionType: 'acquisition' | 'renewal' | 'upsell' | 'referral'
  status: 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled'
  earnedDate: Date
  approvalDate?: Date
  paymentDate?: Date
  paymentMethod?: string
  notes?: string
  bonusEligible: boolean
  bonusAmount?: number
}

interface CommissionStats {
  totalEarned: number
  pendingAmount: number
  paidAmount: number
  monthlyTotal: number
  avgCommissionRate: number
  totalClients: number
  bestMonth: string
  bonusTotal: number
}

interface TierInfo {
  currentTier: string
  tierProgress: number
  nextTier: string
  requirementForNext: number
  tierBenefits: string[]
}

export default function MarketerCommissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<CommissionStats>({
    totalEarned: 0,
    pendingAmount: 0,
    paidAmount: 0,
    monthlyTotal: 0,
    avgCommissionRate: 0,
    totalClients: 0,
    bestMonth: '',
    bonusTotal: 0
  })
  const [tierInfo, setTierInfo] = useState<TierInfo>({
    currentTier: '',
    tierProgress: 0,
    nextTier: '',
    requirementForNext: 0,
    tierBenefits: []
  })
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      setIsLoading(true)
      
      const mockCommissions: Commission[] = [
        {
          id: '1',
          clientType: 'restaurant',
          clientName: 'مطعم البيك الجديد',
          clientId: 'rest_001',
          contractValue: 240000,
          commissionRate: 8.5,
          commissionAmount: 20400,
          commissionType: 'acquisition',
          status: 'paid',
          earnedDate: new Date('2025-01-15'),
          approvalDate: new Date('2025-01-18'),
          paymentDate: new Date('2025-01-20'),
          paymentMethod: 'تحويل بنكي',
          notes: 'عميل جديد - أداء ممتاز',
          bonusEligible: true,
          bonusAmount: 2500
        },
        {
          id: '2',
          clientType: 'supplier',
          clientName: 'شركة الذهب للتوابل',
          clientId: 'sup_001',
          contractValue: 180000,
          commissionRate: 6.0,
          commissionType: 'acquisition',
          commissionAmount: 10800,
          status: 'approved',
          earnedDate: new Date('2025-01-10'),
          approvalDate: new Date('2025-01-12'),
          notes: 'مورد استراتيجي مهم',
          bonusEligible: false
        },
        {
          id: '3',
          clientType: 'restaurant',
          clientName: 'مطعم الطازج - تجديد',
          clientId: 'rest_002',
          contractValue: 150000,
          commissionRate: 5.0,
          commissionAmount: 7500,
          commissionType: 'renewal',
          status: 'pending',
          earnedDate: new Date('2025-01-18'),
          notes: 'تجديد العقد السنوي',
          bonusEligible: false
        },
        {
          id: '4',
          clientType: 'restaurant',
          clientName: 'مطعم الشام - ترقية',
          clientId: 'rest_003',
          contractValue: 80000,
          commissionRate: 12.0,
          commissionAmount: 9600,
          commissionType: 'upsell',
          status: 'pending',
          earnedDate: new Date('2025-01-19'),
          notes: 'ترقية للباقة الذهبية',
          bonusEligible: true,
          bonusAmount: 1500
        },
        {
          id: '5',
          clientType: 'supplier',
          clientName: 'مخازن الأصيل للمواد الغذائية',
          clientId: 'sup_002',
          contractValue: 200000,
          commissionRate: 7.5,
          commissionAmount: 15000,
          commissionType: 'referral',
          status: 'paid',
          earnedDate: new Date('2025-01-05'),
          approvalDate: new Date('2025-01-08'),
          paymentDate: new Date('2025-01-12'),
          paymentMethod: 'شيك',
          notes: 'إحالة من عميل سابق',
          bonusEligible: true,
          bonusAmount: 3000
        }
      ]

      setCommissions(mockCommissions)
      
      // حساب الإحصائيات
      const totalEarned = mockCommissions.reduce((sum, c) => sum + c.commissionAmount + (c.bonusAmount || 0), 0)
      const pendingAmount = mockCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount + (c.bonusAmount || 0), 0)
      const paidAmount = mockCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount + (c.bonusAmount || 0), 0)
      const bonusTotal = mockCommissions.reduce((sum, c) => sum + (c.bonusAmount || 0), 0)

      setStats({
        totalEarned,
        pendingAmount,
        paidAmount,
        monthlyTotal: totalEarned,
        avgCommissionRate: 7.6,
        totalClients: mockCommissions.length,
        bestMonth: 'يناير 2025',
        bonusTotal
      })

      // معلومات الطبقات
      setTierInfo({
        currentTier: 'ذهبي',
        tierProgress: 78,
        nextTier: 'بلاتيني',
        requirementForNext: 100000,
        tierBenefits: [
          'معدل عمولة 8.5% للمطاعم الجديدة',
          'معدل عمولة 6% للموردين الجدد', 
          'مكافأة شهرية تصل إلى 5000 ريال',
          'أولوية في العملاء المميزين',
          'تدريب متقدم مجاني'
        ]
      })

      // بيانات المخططات
      setChartData({
        commissionTypes: {
          labels: ['اكتساب جديد', 'تجديد', 'ترقية', 'إحالة'],
          datasets: [{
            data: [2, 1, 1, 1],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(147, 51, 234, 0.8)'
            ]
          }]
        },
        monthlyEarnings: {
          labels: ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير'],
          datasets: [{
            label: 'العمولات',
            data: [25000, 32000, 28000, 41000, 63300],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
          }, {
            label: 'المكافآت',
            data: [2000, 3500, 1500, 4000, 7000],
            backgroundColor: 'rgba(251, 191, 36, 0.8)',
            borderColor: 'rgb(251, 191, 36)',
            borderWidth: 2
          }]
        }
      })
    } catch (error) {
      console.error('خطأ في جلب العمولات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'marketer') redirect('/auth/signin')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '✅ مدفوعة'
      case 'approved': return '👍 معتمدة'
      case 'pending': return '⏳ معلقة'
      case 'disputed': return '⚠️ متنازع عليها'
      case 'cancelled': return '❌ ملغية'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'acquisition': return 'bg-blue-100 text-blue-800'
      case 'renewal': return 'bg-green-100 text-green-800'
      case 'upsell': return 'bg-orange-100 text-orange-800'
      case 'referral': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'acquisition': return '🎯 اكتساب'
      case 'renewal': return '🔄 تجديد'
      case 'upsell': return '⬆️ ترقية'
      case 'referral': return '👥 إحالة'
      default: return type
    }
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'client',
      label: 'العميل',
      render: (commission: Commission) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{commission.clientName}</div>
          <div className="text-sm text-gray-500">
            {commission.clientType === 'restaurant' ? '🏪 مطعم' : '🏭 مورد'}
          </div>
          <span className={`status-badge text-xs ${getTypeColor(commission.commissionType)}`}>
            {getTypeText(commission.commissionType)}
          </span>
        </div>
      )
    },
    {
      key: 'contract',
      label: 'قيمة العقد',
      render: (commission: Commission) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(commission.contractValue)}
          </div>
          <div className="text-sm text-gray-600">
            معدل: {commission.commissionRate}%
          </div>
        </div>
      )
    },
    {
      key: 'commission',
      label: 'العمولة',
      render: (commission: Commission) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(commission.commissionAmount)}
          </div>
          {commission.bonusEligible && commission.bonusAmount && (
            <div className="text-sm font-medium text-orange-600">
              مكافأة: {formatCurrency(commission.bonusAmount)}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            إجمالي: {formatCurrency(commission.commissionAmount + (commission.bonusAmount || 0))}
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'التواريخ',
      render: (commission: Commission) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            الكسب: {formatDate(commission.earnedDate)}
          </div>
          {commission.approvalDate && (
            <div className="text-sm text-blue-600">
              الاعتماد: {formatDate(commission.approvalDate)}
            </div>
          )}
          {commission.paymentDate && (
            <div className="text-sm text-green-600">
              الدفع: {formatDate(commission.paymentDate)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (commission: Commission) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(commission.status)}`}>
            {getStatusText(commission.status)}
          </span>
          {commission.paymentMethod && (
            <div className="text-xs text-gray-500 mt-1">
              {commission.paymentMethod}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (commission: Commission) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/marketer/commissions/${commission.id}`)}
          >
            👁️ تفاصيل
          </Button>
          
          {commission.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* طلب الاعتماد */}}
            >
              📝 طلب اعتماد
            </Button>
          )}
          
          {commission.status === 'approved' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {/* طلب السحب */}}
            >
              💸 طلب سحب
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل العمولات...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">💰 نظام العمولات والحوافز</h1>
                <p className="text-gray-600">
                  إجمالي العمولات: {formatCurrency(stats.totalEarned)} • معلق: {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/marketer/commissions/calculator')}
                >
                  🧮 حاسبة العمولات
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/marketer/commissions/withdrawal')}
                >
                  💸 طلب سحب
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tier Status */}
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏆 مستوى المسوق: {tierInfo.currentTier}</span>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  {tierInfo.tierProgress}% للمستوى التالي
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">التقدم للمستوى التالي ({tierInfo.nextTier})</h4>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full" 
                      style={{ width: `${tierInfo.tierProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    تحتاج {formatCurrency(tierInfo.requirementForNext)} لبلوغ المستوى التالي
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">مزايا المستوى الحالي</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tierInfo.tierBenefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي العمولات"
              value={formatCurrency(stats.totalEarned)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="معلق الدفع"
              value={formatCurrency(stats.pendingAmount)}
              icon="⏳"
              color="yellow"
            />
            
            <StatCard
              title="مدفوع هذا الشهر"
              value={formatCurrency(stats.paidAmount)}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="إجمالي المكافآت"
              value={formatCurrency(stats.bonusTotal)}
              icon="🎁"
              color="orange"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="متوسط معدل العمولة"
              value={`${stats.avgCommissionRate}%`}
              icon="📊"
              color="blue"
            />
            
            <StatCard
              title="إجمالي العملاء"
              value={stats.totalClients}
              icon="👥"
              color="purple"
            />
            
            <StatCard
              title="أفضل شهر"
              value={stats.bestMonth}
              icon="🏆"
              color="gold"
            />
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>أنواع العمولات</CardTitle>
                  <CardDescription>توزيع العمولات حسب النوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="doughnut"
                    data={chartData.commissionTypes}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الأرباح الشهرية</CardTitle>
                  <CardDescription>العمولات والمكافآت عبر الوقت</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="bar"
                    data={chartData.monthlyEarnings}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Commission Rates Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>📋 جدول معدلات العمولات</CardTitle>
              <CardDescription>معدلات العمولة لكل نوع عميل ونوع عملية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع العميل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اكتساب جديد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تجديد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ترقية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🏪 مطاعم</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8.5%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5.0%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12.0%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6.0%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🏭 موردين</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6.0%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3.5%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8.0%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">7.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>سجل العمولات</CardTitle>
              <CardDescription>
                جميع عمولاتك مع تفاصيل الحالة والدفع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={commissions}
                columns={columns}
                searchKey="clientName"
                emptyMessage="لا توجد عمولات"
                emptyDescription="لم يتم كسب أي عمولات بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
