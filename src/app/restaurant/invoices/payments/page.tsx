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
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  method: 'bank_transfer' | 'cash' | 'check'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paidAt: Date
  reference?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    transferReference: string
  }
  notes?: string
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  thisMonth: number
  lastMonth: number
  bankTransfers: number
  cashPayments: number
  checkPayments: number
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    thisMonth: 0,
    lastMonth: 0,
    bankTransfers: 0,
    cashPayments: 0,
    checkPayments: 0
  })
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/restaurant/payments')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPayments(data.data.payments)
          setStats(data.data.stats)
          setChartData(data.data.charts)
        }
      } else {
        // بيانات تجريبية
        const mockPayments: Payment[] = [
          {
            id: '1',
            invoiceId: 'inv1',
            invoiceNumber: 'INV-2025-001',
            amount: 17250,
            method: 'bank_transfer',
            status: 'completed',
            paidAt: new Date('2025-01-28'),
            reference: 'PAY-2025-001',
            bankDetails: {
              bankName: 'بنك القاسمي',
              accountNumber: '1234567890',
              transferReference: 'TR-2025-001'
            },
            notes: 'رسوم الاشتراك الشهري - يناير'
          },
          {
            id: '2',
            invoiceId: 'inv2',
            invoiceNumber: 'INV-2025-002',
            amount: 14375,
            method: 'bank_transfer',
            status: 'completed',
            paidAt: new Date('2025-01-18'),
            reference: 'PAY-2025-002',
            bankDetails: {
              bankName: 'بنك القاسمي',
              accountNumber: '1234567890',
              transferReference: 'TR-2025-002'
            },
            notes: 'دفعة طلب توريد ORD-2025-001'
          },
          {
            id: '3',
            invoiceId: 'inv3',
            invoiceNumber: 'INV-2024-012',
            amount: 8500,
            method: 'cash',
            status: 'completed',
            paidAt: new Date('2024-12-30'),
            reference: 'PAY-2024-025',
            notes: 'دفع نقدي في المكتب'
          },
          {
            id: '4',
            invoiceId: 'inv4',
            invoiceNumber: 'INV-2025-003',
            amount: 17250,
            method: 'bank_transfer',
            status: 'pending',
            paidAt: new Date('2025-02-01'),
            reference: 'PAY-2025-003',
            bankDetails: {
              bankName: 'بنك القاسمي',
              accountNumber: '1234567890',
              transferReference: 'TR-2025-003'
            },
            notes: 'رسوم الاشتراك الشهري - فبراير (قيد المعالجة)'
          }
        ]

        setPayments(mockPayments)
        
        // حساب الإحصائيات
        const totalPayments = mockPayments.length
        const totalAmount = mockPayments.reduce((sum, p) => sum + p.amount, 0)
        const thisMonth = mockPayments.filter(p => p.paidAt.getMonth() === new Date().getMonth()).length
        const lastMonth = mockPayments.filter(p => p.paidAt.getMonth() === new Date().getMonth() - 1).length
        const bankTransfers = mockPayments.filter(p => p.method === 'bank_transfer').length
        const cashPayments = mockPayments.filter(p => p.method === 'cash').length
        const checkPayments = mockPayments.filter(p => p.method === 'check').length

        setStats({
          totalPayments,
          totalAmount,
          thisMonth,
          lastMonth,
          bankTransfers,
          cashPayments,
          checkPayments
        })

        // بيانات المخططات
        setChartData({
          monthlyPayments: {
            labels: ['ديسمبر', 'يناير', 'فبراير'],
            datasets: [{
              label: 'المدفوعات الشهرية',
              data: [8500, 31625, 17250],
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 2
            }]
          },
          paymentMethods: {
            labels: ['تحويل بنكي', 'نقدي', 'شيك'],
            datasets: [{
              data: [bankTransfers, cashPayments, checkPayments],
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)'
              ]
            }]
          }
        })
      }
    } catch (error) {
      console.error('خطأ في جلب المدفوعات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'restaurant') redirect('/auth/signin')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '✅ مكتملة'
      case 'pending': return '⏳ قيد المعالجة'
      case 'failed': return '❌ فشلت'
      case 'cancelled': return '🚫 ملغية'
      default: return status
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return '🏦'
      case 'cash': return '💰'
      case 'check': return '📝'
      default: return '💳'
    }
  }

  const getMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'تحويل بنكي'
      case 'cash': return 'نقدي'
      case 'check': return 'شيك'
      default: return method
    }
  }

  // تصفية المدفوعات
  const filteredPayments = payments.filter(payment => {
    const methodMatch = selectedMethod === 'all' || payment.method === selectedMethod
    const searchMatch = payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    return methodMatch && searchMatch
  })

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'payment',
      label: 'المدفوعة',
      render: (payment: Payment) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{payment.reference}</div>
          <div className="text-sm text-gray-500">
            فاتورة: {payment.invoiceNumber}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(payment.paidAt)}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (payment: Payment) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(payment.amount)}
          </div>
        </div>
      )
    },
    {
      key: 'method',
      label: 'طريقة الدفع',
      render: (payment: Payment) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <span className="text-xl">{getMethodIcon(payment.method)}</span>
            <span className="text-sm">{getMethodText(payment.method)}</span>
          </div>
          {payment.bankDetails && (
            <div className="text-xs text-gray-500 mt-1">
              {payment.bankDetails.bankName}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (payment: Payment) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(payment.status)}`}>
            {getStatusText(payment.status)}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (payment: Payment) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/restaurant/invoices/${payment.invoiceId}`)}
          >
            🧾 الفاتورة
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`/api/payments/${payment.id}/receipt`, '_blank')}
          >
            📄 إيصال
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
          <p className="text-gray-600">جاري تحميل المدفوعات...</p>
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
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button variant="ghost" onClick={() => router.back()}>← العودة</Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">💳 سجل المدفوعات</h1>
                  <p className="text-gray-600">
                    إجمالي {stats.totalPayments} مدفوعة بقيمة {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي المدفوعات"
              value={stats.totalPayments}
              icon="💳"
              color="blue"
            />
            
            <StatCard
              title="هذا الشهر"
              value={stats.thisMonth}
              icon="📅"
              color="green"
            />
            
            <StatCard
              title="تحويلات بنكية"
              value={stats.bankTransfers}
              icon="🏦"
              color="blue"
              onClick={() => setSelectedMethod('bank_transfer')}
            />
            
            <StatCard
              title="مدفوعات نقدية"
              value={stats.cashPayments}
              icon="💰"
              color="green"
              onClick={() => setSelectedMethod('cash')}
            />
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>المدفوعات الشهرية</CardTitle>
                  <CardDescription>تطور المدفوعات عبر الأشهر</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={chartData.monthlyPayments}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طرق الدفع</CardTitle>
                  <CardDescription>توزيع المدفوعات حسب الطريقة</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="doughnut"
                    data={chartData.paymentMethods}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex space-x-4 space-x-reverse">
                  {['all', 'bank_transfer', 'cash', 'check'].map(method => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedMethod === method
                          ? 'bg-red-100 text-red-600 border border-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {method === 'all' ? '💳 الكل' :
                       method === 'bank_transfer' ? '🏦 بنكي' :
                       method === 'cash' ? '💰 نقدي' :
                       '📝 شيك'}
                    </button>
                  ))}
                </div>
                
                <Input
                  placeholder="البحث في المدفوعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>سجل المدفوعات</CardTitle>
              <CardDescription>
                جميع المدفوعات مع تفاصيل الطرق والحالات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredPayments}
                columns={columns}
                searchKey="reference"
                emptyMessage="لا توجد مدفوعات"
                emptyDescription="لم يتم تسجيل أي مدفوعات بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
