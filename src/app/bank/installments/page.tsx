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
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface Installment {
  id: string
  contractNumber: string
  restaurantName: string
  restaurantId: string
  totalAmount: number
  installmentAmount: number
  installmentNumber: number
  totalInstallments: number
  dueDate: Date
  paidDate?: Date
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  interestRate: number
  lateFee: number
  notes?: string
  paymentMethod?: 'bank_transfer' | 'cash' | 'check'
}

interface InstallmentContract {
  id: string
  contractNumber: string
  restaurantName: string
  totalAmount: number
  installmentAmount: number
  totalInstallments: number
  paidInstallments: number
  remainingAmount: number
  startDate: Date
  endDate: Date
  interestRate: number
  status: 'active' | 'completed' | 'defaulted' | 'cancelled'
  collateral?: string
}

interface InstallmentStats {
  totalContracts: number
  activeContracts: number
  totalFinanced: number
  monthlyCollections: number
  overdueInstallments: number
  overdueAmount: number
  collectionRate: number
  averageInstallment: number
}

export default function BankInstallmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [installments, setInstallments] = useState<Installment[]>([])
  const [contracts, setContracts] = useState<InstallmentContract[]>([])
  const [stats, setStats] = useState<InstallmentStats>({
    totalContracts: 0,
    activeContracts: 0,
    totalFinanced: 0,
    monthlyCollections: 0,
    overdueInstallments: 0,
    overdueAmount: 0,
    collectionRate: 0,
    averageInstallment: 0
  })
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('installments')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    fetchInstallmentsData()
  }, [])

  const fetchInstallmentsData = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/bank/installments')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInstallments(data.data.installments)
          setContracts(data.data.contracts)
          setStats(data.data.stats)
          setChartData(data.data.charts)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockInstallments: Installment[] = [
          {
            id: '1',
            contractNumber: 'CNT-2025-001',
            restaurantName: 'مطعم البيك',
            restaurantId: 'rest1',
            totalAmount: 500000,
            installmentAmount: 45000,
            installmentNumber: 3,
            totalInstallments: 12,
            dueDate: new Date('2025-02-15'),
            status: 'pending',
            interestRate: 8.5,
            lateFee: 0,
            notes: 'قسط شهر فبراير'
          },
          {
            id: '2',
            contractNumber: 'CNT-2025-001',
            restaurantName: 'مطعم البيك',
            restaurantId: 'rest1',
            totalAmount: 500000,
            installmentAmount: 45000,
            installmentNumber: 2,
            totalInstallments: 12,
            dueDate: new Date('2025-01-15'),
            paidDate: new Date('2025-01-10'),
            status: 'paid',
            interestRate: 8.5,
            lateFee: 0,
            paymentMethod: 'bank_transfer',
            notes: 'قسط شهر يناير - مدفوع مبكراً'
          },
          {
            id: '3',
            contractNumber: 'CNT-2024-089',
            restaurantName: 'مطعم الطازج',
            restaurantId: 'rest2',
            totalAmount: 300000,
            installmentAmount: 28000,
            installmentNumber: 8,
            totalInstallments: 12,
            dueDate: new Date('2025-01-05'),
            status: 'overdue',
            interestRate: 9.0,
            lateFee: 1400,
            notes: 'متأخر 15 يوم'
          },
          {
            id: '4',
            contractNumber: 'CNT-2024-067',
            restaurantName: 'مطعم السلام',
            restaurantId: 'rest3',
            totalAmount: 200000,
            installmentAmount: 22000,
            installmentNumber: 10,
            totalInstallments: 10,
            dueDate: new Date('2025-01-20'),
            paidDate: new Date('2025-01-18'),
            status: 'paid',
            interestRate: 7.5,
            lateFee: 0,
            paymentMethod: 'bank_transfer',
            notes: 'القسط الأخير - مكتمل'
          }
        ]

        const mockContracts: InstallmentContract[] = [
          {
            id: 'cnt1',
            contractNumber: 'CNT-2025-001',
            restaurantName: 'مطعم البيك',
            totalAmount: 500000,
            installmentAmount: 45000,
            totalInstallments: 12,
            paidInstallments: 2,
            remainingAmount: 410000,
            startDate: new Date('2024-12-15'),
            endDate: new Date('2025-11-15'),
            interestRate: 8.5,
            status: 'active',
            collateral: 'ضمانة بنكية بقيمة 150,000 ريال'
          },
          {
            id: 'cnt2',
            contractNumber: 'CNT-2024-089',
            restaurantName: 'مطعم الطازج',
            totalAmount: 300000,
            installmentAmount: 28000,
            totalInstallments: 12,
            paidInstallments: 7,
            remainingAmount: 140000,
            startDate: new Date('2024-06-01'),
            endDate: new Date('2025-05-01'),
            interestRate: 9.0,
            status: 'active',
            collateral: 'معدات المطعم'
          },
          {
            id: 'cnt3',
            contractNumber: 'CNT-2024-067',
            restaurantName: 'مطعم السلام',
            totalAmount: 200000,
            installmentAmount: 22000,
            totalInstallments: 10,
            paidInstallments: 10,
            remainingAmount: 0,
            startDate: new Date('2024-04-20'),
            endDate: new Date('2025-01-20'),
            interestRate: 7.5,
            status: 'completed'
          }
        ]

        setInstallments(mockInstallments)
        setContracts(mockContracts)

        // حساب الإحصائيات
        const totalContracts = mockContracts.length
        const activeContracts = mockContracts.filter(c => c.status === 'active').length
        const totalFinanced = mockContracts.reduce((sum, c) => sum + c.totalAmount, 0)
        const monthlyCollections = mockInstallments
          .filter(i => i.status === 'paid' && i.paidDate && i.paidDate.getMonth() === new Date().getMonth())
          .reduce((sum, i) => sum + i.installmentAmount, 0)
        const overdueInstallments = mockInstallments.filter(i => i.status === 'overdue').length
        const overdueAmount = mockInstallments
          .filter(i => i.status === 'overdue')
          .reduce((sum, i) => sum + i.installmentAmount, 0)
        const collectionRate = 85.5
        const averageInstallment = mockInstallments.reduce((sum, i) => sum + i.installmentAmount, 0) / mockInstallments.length

        setStats({
          totalContracts,
          activeContracts,
          totalFinanced,
          monthlyCollections,
          overdueInstallments,
          overdueAmount,
          collectionRate,
          averageInstallment
        })

        // بيانات المخططات
        setChartData({
          monthlyCollections: {
            labels: ['ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'],
            datasets: [{
              label: 'التحصيلات الشهرية',
              data: [67000, 73000, 45000, 89000, 76000, 82000],
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 2
            }]
          },
          paymentStatus: {
            labels: ['مدفوع', 'معلق', 'متأخر'],
            datasets: [{
              data: [2, 1, 1],
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ]
            }]
          }
        })
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الأقساط:', error)
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
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '✅ مدفوع'
      case 'pending': return '⏳ معلق'
      case 'overdue': return '⚠️ متأخر'
      case 'cancelled': return '❌ ملغي'
      default: return status
    }
  }

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'defaulted': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'active': return '🔄 نشط'
      case 'completed': return '✅ مكتمل'
      case 'defaulted': return '⚠️ متعثر'
      case 'cancelled': return '❌ ملغي'
      default: return status
    }
  }

  // إعداد أعمدة جدول الأقساط
  const installmentColumns = [
    {
      key: 'installment',
      label: 'القسط',
      render: (installment: Installment) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{installment.contractNumber}</div>
          <div className="text-sm text-gray-500">{installment.restaurantName}</div>
          <div className="text-xs text-blue-600">
            قسط {installment.installmentNumber} من {installment.totalInstallments}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (installment: Installment) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(installment.installmentAmount)}
          </div>
          {installment.lateFee > 0 && (
            <div className="text-sm text-red-600">
              غرامة: {formatCurrency(installment.lateFee)}
            </div>
          )}
          <div className="text-xs text-gray-500">
            فائدة: {installment.interestRate}%
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'التواريخ',
      render: (installment: Installment) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            الاستحقاق: {formatDate(installment.dueDate)}
          </div>
          {installment.paidDate && (
            <div className="text-sm text-green-600">
              الدفع: {formatDate(installment.paidDate)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (installment: Installment) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(installment.status)}`}>
            {getStatusText(installment.status)}
          </span>
          {installment.paymentMethod && (
            <div className="text-xs text-gray-500 mt-1">
              {installment.paymentMethod === 'bank_transfer' ? '🏦 تحويل' :
               installment.paymentMethod === 'cash' ? '💰 نقدي' : '📝 شيك'}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (installment: Installment) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/bank/installments/${installment.id}`)}
          >
            👁️ عرض
          </Button>
          
          {installment.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {/* تسجيل الدفع */}}
            >
              💳 دفع
            </Button>
          )}
          
          {installment.status === 'overdue' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => {/* إرسال تذكير */}}
            >
              📧 تذكير
            </Button>
          )}
        </div>
      )
    }
  ]

  // إعداد أعمدة جدول العقود
  const contractColumns = [
    {
      key: 'contract',
      label: 'العقد',
      render: (contract: InstallmentContract) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{contract.contractNumber}</div>
          <div className="text-sm text-gray-500">{contract.restaurantName}</div>
          <span className={`status-badge text-xs ${getContractStatusColor(contract.status)}`}>
            {getContractStatusText(contract.status)}
          </span>
        </div>
      )
    },
    {
      key: 'financial',
      label: 'المالية',
      render: (contract: InstallmentContract) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(contract.totalAmount)}
          </div>
          <div className="text-sm text-gray-600">
            قسط: {formatCurrency(contract.installmentAmount)}
          </div>
          <div className="text-xs text-gray-500">
            فائدة: {contract.interestRate}%
          </div>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'التقدم',
      render: (contract: InstallmentContract) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {contract.paidInstallments} / {contract.totalInstallments}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(contract.paidInstallments / contract.totalInstallments) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            متبقي: {formatCurrency(contract.remainingAmount)}
          </div>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'المدة',
      render: (contract: InstallmentContract) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            من: {formatDate(contract.startDate)}
          </div>
          <div className="text-sm text-gray-900">
            إلى: {formatDate(contract.endDate)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (contract: InstallmentContract) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/bank/contracts/${contract.id}`)}
          >
            👁️ عرض
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/api/contracts/${contract.id}/schedule`, '_blank')}
          >
            📅 جدولة
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
          <p className="text-gray-600">جاري تحميل بيانات الأقساط...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">💰 إدارة الأقساط البنكية</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalContracts} عقد، {stats.activeContracts} نشط
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/bank/installments/plans')}
                >
                  📋 خطط التمويل
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/bank/installments/create')}
                >
                  ➕ عقد جديد
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overdue Alert */}
          {stats.overdueInstallments > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">تنبيه: أقساط متأخرة</h3>
                  <p className="text-sm text-red-700">
                    يوجد {stats.overdueInstallments} قسط متأخر بقيمة {formatCurrency(stats.overdueAmount)}
                  </p>
                </div>
                <div className="mr-auto">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => {/* فلتر المتأخرة */}}
                  >
                    عرض المتأخرة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي العقود"
              value={stats.totalContracts}
              icon="📋"
              color="blue"
            />
            
            <StatCard
              title="عقود نشطة"
              value={stats.activeContracts}
              icon="🔄"
              color="green"
            />
            
            <StatCard
              title="أقساط متأخرة"
              value={stats.overdueInstallments}
              icon="⚠️"
              color="red"
            />
            
            <StatCard
              title="معدل التحصيل"
              value={`${stats.collectionRate}%`}
              icon="📊"
              color="purple"
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="إجمالي التمويل"
              value={formatCurrency(stats.totalFinanced)}
              icon="💎"
              color="blue"
            />
            
            <StatCard
              title="التحصيل الشهري"
              value={formatCurrency(stats.monthlyCollections)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="متوسط القسط"
              value={formatCurrency(stats.averageInstallment)}
              icon="📈"
              color="orange"
            />
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>التحصيلات الشهرية</CardTitle>
                  <CardDescription>تطور التحصيلات عبر الأشهر</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={chartData.monthlyCollections}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>حالة الأقساط</CardTitle>
                  <CardDescription>توزيع الأقساط حسب الحالة</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="doughnut"
                    data={chartData.paymentStatus}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                {[
                  { key: 'installments', label: '💰 الأقساط المستحقة' },
                  { key: 'contracts', label: '📋 عقود التمويل' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'installments' && (
            <Card>
              <CardHeader>
                <CardTitle>الأقساط المستحقة</CardTitle>
                <CardDescription>جميع الأقساط مع حالات الدفع</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={installments}
                  columns={installmentColumns}
                  searchKey="contractNumber"
                  onSelectionChange={setSelectedItems}
                  selectedItems={selectedItems}
                  emptyMessage="لا توجد أقساط"
                  emptyDescription="لم يتم تسجيل أي أقساط بعد"
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'contracts' && (
            <Card>
              <CardHeader>
                <CardTitle>عقود التمويل</CardTitle>
                <CardDescription>جميع عقود التمويل والتقسيط</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={contracts}
                  columns={contractColumns}
                  searchKey="contractNumber"
                  emptyMessage="لا توجد عقود"
                  emptyDescription="لم يتم إنشاء أي عقود تمويل بعد"
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedComponent>
  )
}
