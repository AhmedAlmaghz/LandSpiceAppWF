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

interface Invoice {
  id: string
  invoiceNumber: string
  restaurantName: string
  restaurantId: string
  orderNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issuedDate: Date
  dueDate: Date
  paidDate?: Date
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod?: 'bank_transfer' | 'cash' | 'check'
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  notes?: string
}

interface InvoiceStats {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
  averagePaymentTime: number
}

export default function SupplierInvoicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    averagePaymentTime: 0
  })
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-SUP-2025-001',
          restaurantName: 'مطعم البيك',
          restaurantId: 'rest1',
          orderNumber: 'ORD-2025-001',
          status: 'paid',
          issuedDate: new Date('2025-01-22'),
          dueDate: new Date('2025-02-21'),
          paidDate: new Date('2025-01-25'),
          subtotal: 125000,
          taxAmount: 18750,
          discountAmount: 5000,
          totalAmount: 138750,
          paymentMethod: 'bank_transfer',
          items: [
            { productName: 'كمون مطحون فاخر', quantity: 50, unitPrice: 1200, totalPrice: 60000 },
            { productName: 'كاتشب حار يمني', quantity: 100, unitPrice: 650, totalPrice: 65000 }
          ],
          notes: 'دفع مبكر - خصم 5000 ريال'
        },
        {
          id: '2',
          invoiceNumber: 'INV-SUP-2025-002',
          restaurantName: 'مطعم الطازج',
          restaurantId: 'rest2',
          orderNumber: 'ORD-2025-002',
          status: 'sent',
          issuedDate: new Date('2025-01-20'),
          dueDate: new Date('2025-02-19'),
          subtotal: 89000,
          taxAmount: 13350,
          discountAmount: 0,
          totalAmount: 102350,
          items: [
            { productName: 'فلفل أسود مطحون', quantity: 25, unitPrice: 1800, totalPrice: 45000 },
            { productName: 'صلصة الزحف الحارة', quantity: 80, unitPrice: 750, totalPrice: 60000 }
          ]
        },
        {
          id: '3',
          invoiceNumber: 'INV-SUP-2025-003',
          restaurantName: 'مطعم الشام',
          restaurantId: 'rest3',
          orderNumber: 'ORD-2025-003',
          status: 'overdue',
          issuedDate: new Date('2025-01-10'),
          dueDate: new Date('2025-01-25'),
          subtotal: 156000,
          taxAmount: 23400,
          discountAmount: 0,
          totalAmount: 179400,
          items: [
            { productName: 'كمون مطحون فاخر', quantity: 80, unitPrice: 1200, totalPrice: 96000 },
            { productName: 'كاتشب حار يمني', quantity: 60, unitPrice: 650, totalPrice: 39000 }
          ],
          notes: 'متأخرة 15 يوم - تحتاج متابعة'
        }
      ]

      setInvoices(mockInvoices)
      
      // حساب الإحصائيات
      const totalInvoices = mockInvoices.length
      const paidInvoices = mockInvoices.filter(i => i.status === 'paid').length
      const pendingInvoices = mockInvoices.filter(i => i.status === 'sent').length
      const overdueInvoices = mockInvoices.filter(i => i.status === 'overdue').length
      const totalRevenue = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
      const pendingAmount = mockInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.totalAmount, 0)
      const overdueAmount = mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.totalAmount, 0)

      setStats({
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalRevenue,
        pendingAmount,
        overdueAmount,
        averagePaymentTime: 12
      })

      // بيانات المخططات
      setChartData({
        paymentStatus: {
          labels: ['مدفوعة', 'مُرسلة', 'متأخرة', 'ملغية'],
          datasets: [{
            data: [paidInvoices, pendingInvoices, overdueInvoices, 0],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(156, 163, 175, 0.8)'
            ]
          }]
        },
        monthlyRevenue: {
          labels: ['أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس'],
          datasets: [{
            label: 'الإيرادات الشهرية',
            data: [280000, 320000, 410000, 350000, 180000, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
          }]
        }
      })
    } catch (error) {
      console.error('خطأ في جلب الفواتير:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'supplier') redirect('/auth/signin')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const columns = [
    {
      key: 'invoice',
      label: 'الفاتورة',
      render: (invoice: Invoice) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
          <div className="text-sm text-gray-500">{invoice.restaurantName}</div>
          <div className="text-xs text-blue-600">{invoice.orderNumber}</div>
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
            قبل الضريبة: {formatCurrency(invoice.subtotal)}
          </div>
          {invoice.discountAmount > 0 && (
            <div className="text-xs text-green-600">
              خصم: {formatCurrency(invoice.discountAmount)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'dates',
      label: 'التواريخ',
      render: (invoice: Invoice) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            الإصدار: {formatDate(invoice.issuedDate)}
          </div>
          <div className="text-sm text-gray-600">
            الاستحقاق: {formatDate(invoice.dueDate)}
          </div>
          {invoice.paidDate && (
            <div className="text-sm text-green-600">
              الدفع: {formatDate(invoice.paidDate)}
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
          {invoice.paymentMethod && (
            <div className="text-xs text-gray-500 mt-1">
              {invoice.paymentMethod === 'bank_transfer' ? '🏦 تحويل' :
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
            onClick={() => router.push(`/supplier/invoices/${invoice.id}`)}
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
          
          {invoice.status === 'overdue' && (
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفواتير...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['supplier']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🧾 إدارة الفواتير</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalInvoices} فاتورة، {stats.pendingInvoices} في الانتظار
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/supplier/invoices/reports')}
                >
                  📊 التقارير المالية
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/supplier/invoices/create')}
                >
                  ➕ فاتورة جديدة
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overdue Alert */}
          {stats.overdueInvoices > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-red-800">فواتير متأخرة</h3>
                  <p className="text-sm text-red-700">
                    يوجد {stats.overdueInvoices} فاتورة متأخرة بقيمة {formatCurrency(stats.overdueAmount)}
                  </p>
                </div>
                <div className="mr-auto">
                  <Button variant="danger" size="sm">
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
              value={stats.totalInvoices}
              icon="🧾"
              color="blue"
            />
            
            <StatCard
              title="فواتير مدفوعة"
              value={stats.paidInvoices}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="في الانتظار"
              value={stats.pendingInvoices}
              icon="📤"
              color="yellow"
            />
            
            <StatCard
              title="متأخرة"
              value={stats.overdueInvoices}
              icon="⚠️"
              color="red"
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="إجمالي الإيرادات"
              value={formatCurrency(stats.totalRevenue)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="في الانتظار"
              value={formatCurrency(stats.pendingAmount)}
              icon="💳"
              color="blue"
            />
            
            <StatCard
              title="متأخر الدفع"
              value={formatCurrency(stats.overdueAmount)}
              icon="📉"
              color="red"
            />
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>حالة الفواتير</CardTitle>
                  <CardDescription>توزيع الفواتير حسب حالة الدفع</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="doughnut"
                    data={chartData.paymentStatus}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإيرادات الشهرية</CardTitle>
                  <CardDescription>تطور الإيرادات عبر الأشهر</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    type="line"
                    data={chartData.monthlyRevenue}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الفواتير</CardTitle>
              <CardDescription>
                جميع فواتير المبيعات مع حالات الدفع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={invoices}
                columns={columns}
                searchKey="invoiceNumber"
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
