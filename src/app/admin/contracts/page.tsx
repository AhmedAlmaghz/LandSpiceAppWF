'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DataTable from '@/components/dashboard/DataTable'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import StatCard from '@/components/dashboard/StatCard'
import ExportTools from '@/components/dashboard/ExportTools'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

// Types
interface Contract {
  id: string
  restaurantId: string
  bankId: string
  contractNumber?: string
  startDate: Date
  endDate: Date
  monthlyAmount: number
  status: string
  createdAt: Date
  updatedAt: Date
  restaurant: {
    id: string
    name: string
    businessName?: string
    city?: string
    user: {
      firstName?: string
      lastName?: string
      email?: string
    }
  }
  bank: {
    id: string
    name: string
    branch?: string
    user: {
      firstName?: string
      lastName?: string
    }
  }
  guarantees: Array<{
    id: string
    amount: number
    status: string
    type: string
  }>
  installments: Array<{
    id: string
    amount: number
    dueDate: Date
    status: string
  }>
  _count: {
    guarantees: number
    installments: number
  }
}

interface ContractFilters {
  search: string
  status: string
  bankId: string
  startDate: string
  endDate: string
}

interface ContractStats {
  total: number
  active: number
  expired: number
  draft: number
  totalValue: number
  averageValue: number
}

export default function ContractsManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    active: 0,
    expired: 0,
    draft: 0,
    totalValue: 0,
    averageValue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState<ContractFilters>({
    search: '',
    status: '',
    bankId: '',
    startDate: '',
    endDate: ''
  })
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [banks, setBanks] = useState<Array<{ id: string, name: string }>>([])

  // جلب العقود
  const fetchContracts = async (page = 1, limit = 10, searchParams: any = {}) => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...searchParams
      })

      const response = await fetch(`/api/admin/contracts?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setContracts(data.data.contracts)
          setPagination(data.data.pagination)
          
          // حساب الإحصائيات
          const contractStats = calculateStats(data.data.contracts)
          setStats(contractStats)
        }
      } else {
        // بيانات تجريبية
        const mockContracts: Contract[] = [
          {
            id: 'c1',
            restaurantId: 'r1',
            bankId: 'b1',
            contractNumber: 'CON-2025-0001',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-12-31'),
            monthlyAmount: 15000,
            status: 'active',
            createdAt: new Date('2025-01-10'),
            updatedAt: new Date(),
            restaurant: {
              id: 'r1',
              name: 'مطعم البيك',
              businessName: 'شركة البيك للمأكولات السريعة',
              city: 'الرياض',
              user: {
                firstName: 'محمد',
                lastName: 'العتيبي',
                email: 'manager@albaik.com'
              }
            },
            bank: {
              id: 'b1',
              name: 'بنك القاسمي',
              branch: 'الفرع الرئيسي',
              user: {
                firstName: 'أحمد',
                lastName: 'القاسمي'
              }
            },
            guarantees: [
              {
                id: 'g1',
                amount: 50000,
                status: 'approved',
                type: 'bank_guarantee'
              }
            ],
            installments: [
              {
                id: 'i1',
                amount: 15000,
                dueDate: new Date('2025-01-31'),
                status: 'paid'
              },
              {
                id: 'i2',
                amount: 15000,
                dueDate: new Date('2025-02-28'),
                status: 'pending'
              }
            ],
            _count: {
              guarantees: 1,
              installments: 12
            }
          },
          {
            id: 'c2',
            restaurantId: 'r2',
            bankId: 'b1',
            contractNumber: 'CON-2025-0002',
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-12-31'),
            monthlyAmount: 12000,
            status: 'draft',
            createdAt: new Date('2025-01-18'),
            updatedAt: new Date(),
            restaurant: {
              id: 'r2',
              name: 'مطعم الطازج',
              businessName: 'مؤسسة الطازج التجارية',
              city: 'جدة',
              user: {
                firstName: 'علي',
                lastName: 'الغامدي',
                email: 'info@altazaj.com'
              }
            },
            bank: {
              id: 'b1',
              name: 'بنك القاسمي',
              branch: 'فرع جدة',
              user: {
                firstName: 'سعد',
                lastName: 'المالكي'
              }
            },
            guarantees: [],
            installments: [],
            _count: {
              guarantees: 0,
              installments: 0
            }
          }
        ]
        
        setContracts(mockContracts)
        setStats(calculateStats(mockContracts))
      }
    } catch (error) {
      console.error('خطأ في جلب العقود:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // حساب الإحصائيات
  const calculateStats = (contracts: Contract[]): ContractStats => {
    const total = contracts.length
    const active = contracts.filter(c => c.status === 'active').length
    const expired = contracts.filter(c => c.status === 'expired').length
    const draft = contracts.filter(c => c.status === 'draft').length
    
    const totalValue = contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + Number(c.monthlyAmount), 0)
    
    const averageValue = active > 0 ? totalValue / active : 0

    return {
      total,
      active,
      expired,
      draft,
      totalValue,
      averageValue: Math.round(averageValue)
    }
  }

  // جلب البنوك للفلترة
  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/admin/users?role=bank&limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const banksList = data.data.users
            .filter((user: any) => user.bank)
            .map((user: any) => ({
              id: user.bank.id,
              name: user.bank.name
            }))
          setBanks(banksList)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب البنوك:', error)
    }
  }

  useEffect(() => {
    fetchContracts(pagination.page, pagination.limit, filters)
    fetchBanks()
  }, [])

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || !['admin', 'landspice_employee'].includes(session.user.role)) {
    redirect('/auth/signin')
  }

  // تحديث حالة العقد
  const handleStatusUpdate = async (contractId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contractId,
          status: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchContracts(pagination.page, pagination.limit, filters)
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة العقد:', error)
    }
  }

  // التصفية والبحث
  const handleSearch = (searchParams: any) => {
    setFilters(prev => ({ ...prev, ...searchParams }))
    fetchContracts(1, pagination.limit, { ...filters, ...searchParams })
  }

  // حساب عدد الأيام المتبقية للعقد
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'contract',
      label: 'العقد',
      render: (contract: Contract) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {contract.contractNumber || `عقد-${contract.id.slice(-4)}`}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
          </div>
          <div className="text-xs text-gray-400">
            {getDaysRemaining(contract.endDate) > 0 
              ? `${getDaysRemaining(contract.endDate)} يوم متبقي`
              : 'منتهي'
            }
          </div>
        </div>
      )
    },
    {
      key: 'restaurant',
      label: 'المطعم',
      render: (contract: Contract) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">🏪</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{contract.restaurant.name}</div>
            <div className="text-sm text-gray-500">{contract.restaurant.businessName}</div>
            <div className="text-xs text-gray-400">
              {contract.restaurant.city && `📍 ${contract.restaurant.city}`}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'bank',
      label: 'البنك',
      render: (contract: Contract) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">🏦</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{contract.bank.name}</div>
            <div className="text-sm text-gray-500">{contract.bank.branch}</div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'القيمة الشهرية',
      render: (contract: Contract) => (
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {formatCurrency(contract.monthlyAmount)}
          </div>
          <div className="text-sm text-gray-500">شهرياً</div>
        </div>
      )
    },
    {
      key: 'guarantees_installments',
      label: 'الضمانات والأقساط',
      render: (contract: Contract) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ضمانات:</span>
            <span className="font-medium">{contract._count.guarantees}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">أقساط:</span>
            <span className="font-medium">{contract._count.installments}</span>
          </div>
          {contract.guarantees.length > 0 && (
            <div className="text-xs text-green-600">
              ضمانة: {formatCurrency(contract.guarantees[0].amount)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (contract: Contract) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(contract.status)}`}>
            {getStatusText(contract.status)}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (contract: Contract) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/admin/contracts/${contract.id}`)}
          >
            👁️ عرض
          </Button>
          
          {contract.status === 'draft' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusUpdate(contract.id, 'active')}
            >
              ✅ تفعيل
            </Button>
          )}
          
          {contract.status === 'active' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => handleStatusUpdate(contract.id, 'terminated')}
            >
              ⏸️ إنهاء
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/admin/contracts/${contract.id}/edit`)}
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
          <p className="text-gray-600">جاري تحميل العقود...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">إدارة العقود</h1>
                <p className="text-gray-600">
                  إجمالي {stats.total} عقد، {stats.active} نشط
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <ExportTools
                  data={contracts}
                  filename="contracts"
                  title="تصدير العقود"
                />
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/admin/contracts/create')}
                >
                  ➕ إنشاء عقد
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
              title="إجمالي العقود"
              value={stats.total}
              icon="📝"
              color="blue"
              onClick={() => handleSearch({ status: '' })}
            />
            
            <StatCard
              title="العقود النشطة"
              value={stats.active}
              icon="✅"
              color="green"
              onClick={() => handleSearch({ status: 'active' })}
            />
            
            <StatCard
              title="مسودات"
              value={stats.draft}
              icon="📄"
              color="yellow"
              onClick={() => handleSearch({ status: 'draft' })}
            />
            
            <StatCard
              title="القيمة الإجمالية"
              value={formatCurrency(stats.totalValue)}
              subtitle="شهرياً"
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
                    placeholder: 'البحث في العقود...',
                    label: 'البحث العام'
                  },
                  {
                    key: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'active', label: 'نشط' },
                      { value: 'draft', label: 'مسودة' },
                      { value: 'expired', label: 'منتهي' },
                      { value: 'terminated', label: 'منهي' }
                    ]
                  },
                  {
                    key: 'bankId',
                    type: 'select',
                    label: 'البنك',
                    options: [
                      { value: '', label: 'جميع البنوك' },
                      ...banks.map(bank => ({ value: bank.id, label: bank.name }))
                    ]
                  },
                  {
                    key: 'startDate',
                    type: 'date',
                    label: 'تاريخ البداية من'
                  },
                  {
                    key: 'endDate',
                    type: 'date',
                    label: 'تاريخ النهاية إلى'
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedContracts.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedContracts.length} عقد
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="success">
                      ✅ تفعيل المحددة
                    </Button>
                    <Button size="sm" variant="outline">
                      📤 تصدير المحددة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contracts Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة العقود</CardTitle>
              <CardDescription>
                إدارة شاملة لجميع عقود المطاعم مع البنوك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={contracts}
                columns={columns}
                searchKey="contractNumber"
                pagination={pagination}
                onPageChange={(page) => {
                  setPagination(prev => ({ ...prev, page }))
                  fetchContracts(page, pagination.limit, filters)
                }}
                onSelectionChange={setSelectedContracts}
                selectedItems={selectedContracts}
                emptyMessage="لا توجد عقود"
                emptyDescription="لم يتم العثور على عقود تطابق معايير البحث"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
