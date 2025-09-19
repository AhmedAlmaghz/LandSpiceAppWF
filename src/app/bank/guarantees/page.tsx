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
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface Guarantee {
  id: string
  guaranteeNumber: string
  restaurantName: string
  restaurantId: string
  type: 'performance' | 'payment' | 'advance' | 'maintenance'
  status: 'active' | 'pending' | 'expired' | 'cancelled' | 'claimed'
  amount: number
  currency: 'YER' | 'USD' | 'SAR'
  issuedDate: Date
  expiryDate: Date
  beneficiary: string
  purpose: string
  commissionRate: number
  commissionAmount: number
  documents: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  notes?: string
  riskRating: 'low' | 'medium' | 'high'
  renewalHistory: Array<{
    id: string
    renewedDate: Date
    newExpiryDate: Date
    reason: string
  }>
}

interface GuaranteeStats {
  totalGuarantees: number
  activeGuarantees: number
  pendingGuarantees: number
  expiredGuarantees: number
  totalValue: number
  totalCommission: number
  expiringThisMonth: number
  riskHigh: number
}

export default function BankGuaranteesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [guarantees, setGuarantees] = useState<Guarantee[]>([])
  const [stats, setStats] = useState<GuaranteeStats>({
    totalGuarantees: 0,
    activeGuarantees: 0,
    pendingGuarantees: 0,
    expiredGuarantees: 0,
    totalValue: 0,
    totalCommission: 0,
    expiringThisMonth: 0,
    riskHigh: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGuarantees, setSelectedGuarantees] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    riskRating: '',
    expiringOnly: false
  })

  useEffect(() => {
    fetchGuarantees()
  }, [])

  const fetchGuarantees = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/bank/guarantees')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setGuarantees(data.data.guarantees)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockGuarantees: Guarantee[] = [
          {
            id: '1',
            guaranteeNumber: 'GRN-2025-001',
            restaurantName: 'مطعم البيك',
            restaurantId: 'rest1',
            type: 'performance',
            status: 'active',
            amount: 150000,
            currency: 'YER',
            issuedDate: new Date('2025-01-15'),
            expiryDate: new Date('2026-01-15'),
            beneficiary: 'شركة لاند سبايس للتوابل',
            purpose: 'ضمان حسن التنفيذ لعقد التوريد',
            commissionRate: 2.5,
            commissionAmount: 3750,
            documents: [
              {
                id: '1',
                name: 'نسخة العقد الأصلي.pdf',
                type: 'contract',
                url: '/documents/contracts/contract-001.pdf'
              }
            ],
            notes: 'ضمانة سارية وفعالة',
            riskRating: 'low',
            renewalHistory: []
          },
          {
            id: '2',
            guaranteeNumber: 'GRN-2025-002',
            restaurantName: 'مطعم الطازج',
            restaurantId: 'rest2',
            type: 'advance',
            status: 'active',
            amount: 200000,
            currency: 'YER',
            issuedDate: new Date('2025-01-20'),
            expiryDate: new Date('2025-07-20'),
            beneficiary: 'شركة لاند سبايس للتوابل',
            purpose: 'ضمان الدفعة المقدمة لتجهيز المعدات',
            commissionRate: 3.0,
            commissionAmount: 6000,
            documents: [
              {
                id: '2',
                name: 'طلب الضمانة.pdf',
                type: 'application',
                url: '/documents/applications/app-002.pdf'
              }
            ],
            riskRating: 'medium',
            renewalHistory: []
          },
          {
            id: '3',
            guaranteeNumber: 'GRN-2024-089',
            restaurantName: 'مطعم السلام',
            restaurantId: 'rest3',
            type: 'payment',
            status: 'expired',
            amount: 100000,
            currency: 'YER',
            issuedDate: new Date('2024-06-01'),
            expiryDate: new Date('2024-12-31'),
            beneficiary: 'شركة لاند سبايس للتوابل',
            purpose: 'ضمان دفع مستحقات التوريد',
            commissionRate: 2.0,
            commissionAmount: 2000,
            documents: [],
            notes: 'انتهت الصلاحية ولم يتم التجديد',
            riskRating: 'high',
            renewalHistory: [
              {
                id: '1',
                renewedDate: new Date('2024-11-01'),
                newExpiryDate: new Date('2024-12-31'),
                reason: 'تمديد لإنهاء التزامات العقد'
              }
            ]
          },
          {
            id: '4',
            guaranteeNumber: 'GRN-2025-003',
            restaurantName: 'مطعم الرياض',
            restaurantId: 'rest4',
            type: 'maintenance',
            status: 'pending',
            amount: 80000,
            currency: 'YER',
            issuedDate: new Date('2025-01-25'),
            expiryDate: new Date('2027-01-25'),
            beneficiary: 'شركة لاند سبايس للتوابل',
            purpose: 'ضمان صيانة المعدات المورّدة',
            commissionRate: 1.5,
            commissionAmount: 1200,
            documents: [],
            notes: 'في انتظار اعتماد الوثائق',
            riskRating: 'low',
            renewalHistory: []
          }
        ]

        setGuarantees(mockGuarantees)
        
        // حساب الإحصائيات
        const totalGuarantees = mockGuarantees.length
        const activeGuarantees = mockGuarantees.filter(g => g.status === 'active').length
        const pendingGuarantees = mockGuarantees.filter(g => g.status === 'pending').length
        const expiredGuarantees = mockGuarantees.filter(g => g.status === 'expired').length
        const totalValue = mockGuarantees.reduce((sum, g) => sum + g.amount, 0)
        const totalCommission = mockGuarantees.reduce((sum, g) => sum + g.commissionAmount, 0)
        const riskHigh = mockGuarantees.filter(g => g.riskRating === 'high').length

        // الضمانات المنتهية هذا الشهر
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const expiringThisMonth = mockGuarantees.filter(g => 
          g.expiryDate.getMonth() === currentMonth && 
          g.expiryDate.getFullYear() === currentYear &&
          g.status === 'active'
        ).length

        setStats({
          totalGuarantees,
          activeGuarantees,
          pendingGuarantees,
          expiredGuarantees,
          totalValue,
          totalCommission,
          expiringThisMonth,
          riskHigh
        })
      }
    } catch (error) {
      console.error('خطأ في جلب الضمانات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // التحقق من صلاحية البنك
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'bank') {
    redirect('/auth/signin')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'claimed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '✅ نشطة'
      case 'pending': return '⏳ في الانتظار'
      case 'expired': return '❌ منتهية'
      case 'cancelled': return '🚫 ملغية'
      case 'claimed': return '⚠️ مطالب بها'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '🎯'
      case 'payment': return '💳'
      case 'advance': return '💰'
      case 'maintenance': return '🔧'
      default: return '🛡️'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'performance': return 'حسن التنفيذ'
      case 'payment': return 'ضمان دفع'
      case 'advance': return 'دفعة مقدمة'
      case 'maintenance': return 'صيانة'
      default: return type
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'high': return '⚠️ عالي'
      case 'medium': return '⚡ متوسط'
      case 'low': return '✅ منخفض'
      default: return risk
    }
  }

  // التصفية والبحث
  const handleSearch = (searchParams: any) => {
    setFilters(prev => ({ ...prev, ...searchParams }))
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'guarantee',
      label: 'الضمانة',
      render: (guarantee: Guarantee) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{guarantee.guaranteeNumber}</div>
          <div className="text-sm text-gray-500">
            {guarantee.restaurantName}
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-lg">{getTypeIcon(guarantee.type)}</span>
            <span className="text-xs text-gray-600">{getTypeText(guarantee.type)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'القيمة',
      render: (guarantee: Guarantee) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(guarantee.amount)}
          </div>
          <div className="text-sm text-gray-600">
            عمولة: {formatCurrency(guarantee.commissionAmount)}
          </div>
          <div className="text-xs text-gray-500">
            معدل: {guarantee.commissionRate}%
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'التواريخ',
      render: (guarantee: Guarantee) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            الإصدار: {formatDate(guarantee.issuedDate)}
          </div>
          <div className="text-sm text-gray-600">
            الانتهاء: {formatDate(guarantee.expiryDate)}
          </div>
          <div className="text-xs text-gray-500">
            المدة: {Math.ceil((guarantee.expiryDate.getTime() - guarantee.issuedDate.getTime()) / (1000 * 60 * 60 * 24))} يوم
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة والمخاطر',
      render: (guarantee: Guarantee) => (
        <div className="text-center space-y-2">
          <span className={`status-badge ${getStatusColor(guarantee.status)}`}>
            {getStatusText(guarantee.status)}
          </span>
          <div>
            <span className={`status-badge text-xs ${getRiskColor(guarantee.riskRating)}`}>
              {getRiskText(guarantee.riskRating)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (guarantee: Guarantee) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/bank/guarantees/${guarantee.id}`)}
          >
            👁️ عرض
          </Button>
          
          {guarantee.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/bank/guarantees/${guarantee.id}/renew`)}
            >
              🔄 تجديد
            </Button>
          )}
          
          <Button
            size="sm"
            variant="primary"
            onClick={() => window.open(`/api/guarantees/${guarantee.id}/certificate`, '_blank')}
          >
            📄 شهادة
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الضمانات...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['bank']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🛡️ إدارة الضمانات البنكية</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalGuarantees} ضمانة، {stats.activeGuarantees} نشطة
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/bank/guarantees/reports')}
                >
                  📊 التقارير
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/bank/guarantees/create')}
                >
                  ➕ ضمانة جديدة
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Expiring Guarantees Alert */}
          {stats.expiringThisMonth > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⏰</span>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-yellow-800">تنبيه: ضمانات منتهية هذا الشهر</h3>
                  <p className="text-sm text-yellow-700">
                    يوجد {stats.expiringThisMonth} ضمانة تنتهي هذا الشهر. يرجى مراجعة التجديد.
                  </p>
                </div>
                <div className="mr-auto">
                  <Button 
                    variant="warning" 
                    size="sm"
                    onClick={() => handleSearch({ expiringOnly: true })}
                  >
                    عرض المنتهية
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الضمانات"
              value={stats.totalGuarantees}
              icon="🛡️"
              color="blue"
            />
            
            <StatCard
              title="ضمانات نشطة"
              value={stats.activeGuarantees}
              icon="✅"
              color="green"
              onClick={() => handleSearch({ status: 'active' })}
            />
            
            <StatCard
              title="في الانتظار"
              value={stats.pendingGuarantees}
              icon="⏳"
              color="yellow"
              onClick={() => handleSearch({ status: 'pending' })}
            />
            
            <StatCard
              title="مخاطر عالية"
              value={stats.riskHigh}
              icon="⚠️"
              color="red"
              onClick={() => handleSearch({ riskRating: 'high' })}
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="إجمالي قيمة الضمانات"
              value={formatCurrency(stats.totalValue)}
              icon="💎"
              color="purple"
            />
            
            <StatCard
              title="إجمالي العمولات"
              value={formatCurrency(stats.totalCommission)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="منتهية هذا الشهر"
              value={stats.expiringThisMonth}
              icon="⏰"
              color="orange"
              onClick={() => handleSearch({ expiringOnly: true })}
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
                    placeholder: 'البحث في الضمانات...',
                    label: 'البحث العام'
                  },
                  {
                    key: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'active', label: 'نشطة' },
                      { value: 'pending', label: 'في الانتظار' },
                      { value: 'expired', label: 'منتهية' },
                      { value: 'cancelled', label: 'ملغية' },
                      { value: 'claimed', label: 'مطالب بها' }
                    ]
                  },
                  {
                    key: 'type',
                    type: 'select',
                    label: 'النوع',
                    options: [
                      { value: '', label: 'جميع الأنواع' },
                      { value: 'performance', label: 'حسن التنفيذ' },
                      { value: 'payment', label: 'ضمان دفع' },
                      { value: 'advance', label: 'دفعة مقدمة' },
                      { value: 'maintenance', label: 'صيانة' }
                    ]
                  },
                  {
                    key: 'riskRating',
                    type: 'select',
                    label: 'تقييم المخاطر',
                    options: [
                      { value: '', label: 'جميع المستويات' },
                      { value: 'low', label: 'منخفض' },
                      { value: 'medium', label: 'متوسط' },
                      { value: 'high', label: 'عالي' }
                    ]
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedGuarantees.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedGuarantees.length} ضمانة
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="outline">
                      📤 تصدير المحددة
                    </Button>
                    <Button size="sm" variant="primary">
                      🔄 تجديد جماعي
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guarantees Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الضمانات</CardTitle>
              <CardDescription>
                جميع الضمانات البنكية مع حالاتها وتفاصيلها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={guarantees}
                columns={columns}
                searchKey="guaranteeNumber"
                onSelectionChange={setSelectedGuarantees}
                selectedItems={selectedGuarantees}
                emptyMessage="لا توجد ضمانات"
                emptyDescription="لم يتم إصدار أي ضمانات بنكية بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
