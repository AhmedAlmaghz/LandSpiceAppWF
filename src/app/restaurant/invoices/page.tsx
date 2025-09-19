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
interface Invoice {
  id: string
  invoiceNumber: string
  type: 'monthly_fee' | 'order_payment' | 'additional_service' | 'penalty'
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  amount: number
  taxAmount: number
  totalAmount: number
  dueDate: Date
  paidDate?: Date
  issuedAt: Date
  description: string
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  paymentMethod?: 'bank_transfer' | 'cash' | 'check'
  bankDetails?: {
    bankName: string
    accountNumber: string
    transferReference?: string
  }
  notes?: string
}

interface InvoiceStats {
  total: number
  paid: number
  pending: number
  overdue: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
}

export default function RestaurantInvoicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/restaurant/invoices')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInvoices(data.data.invoices)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoiceNumber: 'INV-2025-001',
            type: 'monthly_fee',
            status: 'paid',
            amount: 15000,
            taxAmount: 2250,
            totalAmount: 17250,
            dueDate: new Date('2025-01-31'),
            paidDate: new Date('2025-01-28'),
            issuedAt: new Date('2025-01-01'),
            description: 'رسوم الاشتراك الشهري - يناير 2025',
            items: [
              {
                id: '1',
                description: 'رسوم الاشتراك الشهري',
                quantity: 1,
                unitPrice: 15000,
                totalPrice: 15000
              }
            ],
            paymentMethod: 'bank_transfer',
            bankDetails: {
              bankName: 'بنك القاسمي',
              accountNumber: '1234567890',
              transferReference: 'TR-2025-001'
            }
          },
          {
            id: '2',
            invoiceNumber: 'INV-2025-002',
            type: 'order_payment',
            status: 'paid',
            amount: 12500,
            taxAmount: 1875,
            totalAmount: 14375,
            dueDate: new Date('2025-01-20'),
            paidDate: new Date('2025-01-18'),
            issuedAt: new Date('2025-01-15'),
            description: 'دفعة طلب توريد ORD-2025-001',
            items: [
              {
                id: '1',
                description: 'كاتشب عبوة 500مل',
                quantity: 2000,
                unitPrice: 2.5,
                totalPrice: 5000
              },
              {
                id: '2',
                description: 'شطة حارة عبوة 200مل',
                quantity: 1500,
                unitPrice: 3.0,
                totalPrice: 4500
              },
              {
                id: '3',
                description: 'رسوم الشحن والتوصيل',
                quantity: 1,
                unitPrice: 3000,
                totalPrice: 3000
              }
            ],
            paymentMethod: 'bank_transfer',
            bankDetails: {
              bankName: 'بنك القاسمي',
              accountNumber: '1234567890',
              transferReference: 'TR-2025-002'
            }
          },
          {
            id: '3',
            invoiceNumber: 'INV-2025-003',
            type: 'monthly_fee',
            status: 'sent',
            amount: 15000,
            taxAmount: 2250,
            totalAmount: 17250,
            dueDate: new Date('2025-02-28'),
            issuedAt: new Date('2025-02-01'),
            description: 'رسوم الاشتراك الشهري - فبراير 2025',
            items: [
              {
                id: '1',
                description: 'رسوم الاشتراك الشهري',
                quantity: 1,
                unitPrice: 15000,
                totalPrice: 15000
              }
            ]
          },
          {
            id: '4',
            invoiceNumber: 'INV-2025-004',
            type: 'additional_service',
            status: 'overdue',
            amount: 5000,
            taxAmount: 750,
            totalAmount: 5750,
            dueDate: new Date('2025-01-10'),
            issuedAt: new Date('2024-12-25'),
            description: 'خدمة تصميم إضافية',
            items: [
              {
                id: '1',
                description: 'تصميم شعار إضافي',
                quantity: 2,
                unitPrice: 2500,
                totalPrice: 5000
              }
            ],
            notes: 'متأخر عن الموعد المحدد'
          }
        ]

        setInvoices(mockInvoices)
        
        // حساب الإحصائيات
        const total = mockInvoices.length
        const paid = mockInvoices.filter(inv => inv.status === 'paid').length
        const pending = mockInvoices.filter(inv => inv.status === 'sent').length
        const overdue = mockInvoices.filter(inv => inv.status === 'overdue').length
        const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
        const paidAmount = mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
        const pendingAmount = totalAmount - paidAmount

        setStats({
          total,
          paid,
          pending,
          overdue,
          totalAmount,
          paidAmount,
          pendingAmount
        })
      }
    } catch (error) {
      console.error('خطأ في جلب الفواتير:', error)
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
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '✅ مدفوعة'
      case 'sent': return '📤 مُرسلة'
      case 'overdue': return '⚠️ متأخرة'
      case 'cancelled': return '❌ ملغية'
      case 'draft': return '📄 مسودة'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly_fee': return '📅'
      case 'order_payment': return '🛒'
      case 'additional_service': return '⚙️'
      case 'penalty': return '⚠️'
      default: return '📄'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'monthly_fee': return 'رسوم شهرية'
      case 'order_payment': return 'دفعة طلب'
      case 'additional_service': return 'خدمة إضافية'
      case 'penalty': return 'غرامة'
      default: return type
    }
  }

  // التصفية والبحث
  const handleSearch = (searchParams: any) => {
    setFilters(prev => ({ ...prev, ...searchParams }))
    // هنا يمكن إضافة منطق التصفية المتقدم
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'invoice',
      label: 'الفاتورة',
      render: (invoice: Invoice) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
          <div className="text-sm text-gray-500">
            {formatDate(invoice.issuedAt)}
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-lg">{getTypeIcon(invoice.type)}</span>
            <span className="text-xs text-gray-600">{getTypeText(invoice.type)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (invoice: Invoice) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{invoice.description}</div>
          <div className="text-sm text-gray-600">
            {invoice.items.length} بند
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (invoice: Invoice) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(invoice.totalAmount)}
          </div>
          <div className="text-sm text-gray-600">
            شامل الضريبة: {formatCurrency(invoice.taxAmount)}
          </div>
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'تاريخ الاستحقاق',
      render: (invoice: Invoice) => (
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {formatDate(invoice.dueDate)}
          </div>
          {invoice.paidDate && (
            <div className="text-sm text-green-600">
              دُفعت: {formatDate(invoice.paidDate)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (invoice: Invoice) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(invoice.status)}`}>
            {getStatusText(invoice.status)}
          </span>
          {invoice.paymentMethod && invoice.status === 'paid' && (
            <div className="text-xs text-gray-500 mt-1">
              {invoice.paymentMethod === 'bank_transfer' ? '🏦 تحويل بنكي' :
               invoice.paymentMethod === 'cash' ? '💰 نقدي' : '📝 شيك'}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (invoice: Invoice) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/restaurant/invoices/${invoice.id}`)}
          >
            👁️ عرض
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
          >
            📄 PDF
          </Button>
          
          {invoice.status === 'sent' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push(`/restaurant/invoices/${invoice.id}/pay`)}
            >
              💳 دفع
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفواتير...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">🧾 إدارة الفواتير</h1>
                <p className="text-gray-600">
                  إجمالي {stats.total} فاتورة، {stats.paid} مدفوعة
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/restaurant/invoices/payments')}
                >
                  💳 المدفوعات
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/restaurant/invoices/create')}
                >
                  ➕ فاتورة جديدة
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Outstanding Invoices Alert */}
          {stats.overdue > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">تنبيه: فواتير متأخرة</h3>
                  <p className="text-sm text-red-700">
                    يوجد {stats.overdue} فاتورة متأخرة عن موعد الاستحقاق. يرجى المراجعة والدفع.
                  </p>
                </div>
                <div className="mr-auto">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleSearch({ status: 'overdue' })}
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
              title="إجمالي الفواتير"
              value={stats.total}
              icon="🧾"
              color="blue"
            />
            
            <StatCard
              title="مدفوعة"
              value={stats.paid}
              icon="✅"
              color="green"
              onClick={() => handleSearch({ status: 'paid' })}
            />
            
            <StatCard
              title="في الانتظار"
              value={stats.pending}
              icon="📤"
              color="blue"
              onClick={() => handleSearch({ status: 'sent' })}
            />
            
            <StatCard
              title="متأخرة"
              value={stats.overdue}
              icon="⚠️"
              color="red"
              onClick={() => handleSearch({ status: 'overdue' })}
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="إجمالي المبالغ"
              value={formatCurrency(stats.totalAmount)}
              icon="💰"
              color="purple"
            />
            
            <StatCard
              title="المبالغ المدفوعة"
              value={formatCurrency(stats.paidAmount)}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="المبالغ المعلقة"
              value={formatCurrency(stats.pendingAmount)}
              icon="⏳"
              color="yellow"
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
                    placeholder: 'البحث في الفواتير...',
                    label: 'البحث العام'
                  },
                  {
                    key: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'paid', label: 'مدفوعة' },
                      { value: 'sent', label: 'مُرسلة' },
                      { value: 'overdue', label: 'متأخرة' },
                      { value: 'cancelled', label: 'ملغية' }
                    ]
                  },
                  {
                    key: 'type',
                    type: 'select',
                    label: 'النوع',
                    options: [
                      { value: '', label: 'جميع الأنواع' },
                      { value: 'monthly_fee', label: 'رسوم شهرية' },
                      { value: 'order_payment', label: 'دفعة طلب' },
                      { value: 'additional_service', label: 'خدمة إضافية' },
                      { value: 'penalty', label: 'غرامة' }
                    ]
                  },
                  {
                    key: 'dateFrom',
                    type: 'date',
                    label: 'من تاريخ'
                  },
                  {
                    key: 'dateTo',
                    type: 'date',
                    label: 'إلى تاريخ'
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedInvoices.length} فاتورة
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="outline">
                      📤 تصدير المحددة
                    </Button>
                    <Button size="sm" variant="primary">
                      💳 دفع دفعي
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الفواتير</CardTitle>
              <CardDescription>
                جميع فواتيرك مع حالات الدفع والاستحقاق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={invoices}
                columns={columns}
                searchKey="invoiceNumber"
                onSelectionChange={setSelectedInvoices}
                selectedItems={selectedInvoices}
                emptyMessage="لا توجد فواتير"
                emptyDescription="لم يتم إنشاء أي فواتير بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
