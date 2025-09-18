/**
 * لوحة تحكم المدفوعات - نظام لاند سبايس
 * الوحدة العاشرة: نظام الفوترة والمدفوعات
 * 
 * لوحة تحكم شاملة لإدارة المدفوعات مع التركيز على العمليات اليدوية
 * والتكامل مع النظام المصرفي اليمني
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  AlertCircle,
  Eye,
  Check,
  X,
  RefreshCw
} from 'lucide-react'

import { 
  PaymentRecord, 
  PaymentStatus, 
  PaymentMethod,
  PaymentType,
  PaymentSearchCriteria,
  YemeniBank
} from '@/lib/billing/types'
import { paymentService } from '@/lib/billing/payment-service'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ===============================
// واجهات ومكونات مساعدة
// ===============================

interface PaymentStats {
  totalPayments: number
  confirmedPayments: number
  pendingPayments: number
  failedPayments: number
  totalAmount: number
  confirmedAmount: number
  pendingAmount: number
}

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const getStatusInfo = (status: PaymentStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'معلق', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'processing':
        return { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-800', icon: RefreshCw }
      case 'confirmed':
        return { label: 'مؤكد', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'failed':
        return { label: 'فاشل', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 'cancelled':
        return { label: 'ملغي', color: 'bg-gray-100 text-gray-600', icon: X }
      case 'refunded':
        return { label: 'مسترد', color: 'bg-purple-100 text-purple-800', icon: RefreshCw }
      case 'disputed':
        return { label: 'محل خلاف', color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock }
    }
  }

  const { label, color, icon: Icon } = getStatusInfo(status)
  return (
    <Badge className={color}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  )
}

const PaymentMethodIcon: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  switch (method) {
    case 'cash':
      return <Banknote className="h-4 w-4 text-green-600" />
    case 'bank_transfer':
    case 'qasimi_bank':
    case 'ahli_bank':
    case 'saba_bank':
      return <CreditCard className="h-4 w-4 text-blue-600" />
    case 'check':
      return <Receipt className="h-4 w-4 text-purple-600" />
    default:
      return <DollarSign className="h-4 w-4 text-gray-600" />
  }
}

const PaymentMethodLabel: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'نقداً'
      case 'bank_transfer': return 'تحويل بنكي'
      case 'check': return 'شيك'
      case 'qasimi_bank': return 'بنك القاسمي'
      case 'ahli_bank': return 'البنك الأهلي'
      case 'saba_bank': return 'بنك سبأ'
      case 'credit': return 'آجل'
      case 'exchange_house': return 'صرافة'
      case 'installments': return 'أقساط'
      default: return method
    }
  }

  return <span>{getMethodLabel(method)}</span>
}

// ===============================
// المكون الرئيسي
// ===============================

const PaymentDashboard: React.FC = () => {
  // الحالة الأساسية
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    confirmedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    totalAmount: 0,
    confirmedAmount: 0,
    pendingAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // معايير البحث والفلترة
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | 'all'>('all')
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null)

  // معلومات الترقيم
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // ===============================
  // تحميل البيانات
  // ===============================

  useEffect(() => {
    loadPayments()
  }, [currentPage, selectedStatus, selectedMethod])

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      const criteria: PaymentSearchCriteria = {
        searchText: searchText || undefined,
        status: selectedStatus !== 'all' ? [selectedStatus] : undefined,
        paymentMethod: selectedMethod !== 'all' ? [selectedMethod] : undefined,
        dateRange: dateRange ? {
          start: dateRange.start,
          end: dateRange.end
        } : undefined,
        sortBy: 'paymentDate',
        sortOrder: 'desc',
        page: currentPage,
        limit: 20
      }

      const result = await paymentService.searchPayments(criteria)
      
      setPayments(result.payments)
      setTotalCount(result.totalCount)
      setTotalPages(Math.ceil(result.totalCount / 20))

      // حساب الإحصائيات
      calculateStats(result.payments, result.totalAmount)

    } catch (err) {
      setError('فشل في تحميل المدفوعات')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentsData: PaymentRecord[], totalAmount: number) => {
    const newStats: PaymentStats = {
      totalPayments: paymentsData.length,
      confirmedPayments: paymentsData.filter(pay => pay.status === 'confirmed').length,
      pendingPayments: paymentsData.filter(pay => pay.status === 'pending').length,
      failedPayments: paymentsData.filter(pay => pay.status === 'failed').length,
      totalAmount: totalAmount,
      confirmedAmount: paymentsData.filter(pay => pay.status === 'confirmed').reduce((sum, pay) => sum + pay.amountInYER, 0),
      pendingAmount: paymentsData.filter(pay => pay.status === 'pending').reduce((sum, pay) => sum + pay.amountInYER, 0)
    }

    setStats(newStats)
  }

  // ===============================
  // إدارة المدفوعات
  // ===============================

  const handleRecordPayment = () => {
    // سيتم ربطه مع نموذج تسجيل مدفوعة
    console.log('تسجيل مدفوعة جديدة')
  }

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      await paymentService.confirmPayment(paymentId, 'current_user')
      await loadPayments()
    } catch (err) {
      console.error('فشل في تأكيد المدفوعة:', err)
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt('سبب الرفض:')
    if (reason) {
      try {
        await paymentService.rejectPayment(paymentId, 'current_user', reason)
        await loadPayments()
      } catch (err) {
        console.error('فشل في رفض المدفوعة:', err)
      }
    }
  }

  const handleViewPayment = (payment: PaymentRecord) => {
    // سيتم ربطه مع صفحة عرض تفاصيل المدفوعة
    console.log('عرض المدفوعة:', payment.paymentNumber)
  }

  // ===============================
  // البحث والفلترة
  // ===============================

  const handleSearch = () => {
    setCurrentPage(1)
    loadPayments()
  }

  const resetFilters = () => {
    setSearchText('')
    setSelectedStatus('all')
    setSelectedMethod('all')
    setDateRange(null)
    setCurrentPage(1)
    loadPayments()
  }

  // ===============================
  // دوال مساعدة
  // ===============================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ar })
  }

  const getPaymentTypeColor = (type: PaymentType) => {
    switch (type) {
      case 'full': return 'text-green-600'
      case 'partial': return 'text-yellow-600'
      case 'advance': return 'text-blue-600'
      case 'refund': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // ===============================
  // واجهة المستخدم
  // ===============================

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المدفوعات</h1>
          <p className="text-gray-600">متابعة وإدارة مدفوعات الفواتير والعمليات المالية</p>
        </div>
        <Button onClick={handleRecordPayment} className="bg-green-600 hover:bg-green-700">
          <Plus className="ml-2 h-4 w-4" />
          تسجيل مدفوعة
        </Button>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المؤكدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedPayments}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.confirmedAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPayments > 0 ? Math.round((stats.confirmedPayments / stats.totalPayments) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.failedPayments} فاشلة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* البحث النصي */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث في المدفوعات..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* فلتر الحالة */}
            <Select value={selectedStatus} onValueChange={(value: PaymentStatus | 'all') => setSelectedStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="failed">فاشل</SelectItem>
                <SelectItem value="refunded">مسترد</SelectItem>
              </SelectContent>
            </Select>

            {/* فلتر طريقة الدفع */}
            <Select value={selectedMethod} onValueChange={(value: PaymentMethod | 'all') => setSelectedMethod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="جميع طرق الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطرق</SelectItem>
                <SelectItem value="cash">نقداً</SelectItem>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                <SelectItem value="qasimi_bank">بنك القاسمي</SelectItem>
                <SelectItem value="check">شيك</SelectItem>
              </SelectContent>
            </Select>

            {/* أزرار الإجراءات */}
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="default">
                <Search className="ml-2 h-4 w-4" />
                بحث
              </Button>
              <Button onClick={resetFilters} variant="outline">
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة المدفوعات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>المدفوعات ({totalCount})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p>{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="mx-auto h-12 w-12 mb-4" />
              <p>لا توجد مدفوعات متطابقة مع المعايير المحددة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <PaymentMethodIcon method={payment.paymentMethod} />
                        <h3 className="font-semibold text-lg">{payment.paymentNumber}</h3>
                        <PaymentStatusBadge status={payment.status} />
                        <Badge variant="outline" className={getPaymentTypeColor(payment.type)}>
                          {payment.type === 'full' ? 'دفع كامل' : 
                           payment.type === 'partial' ? 'دفع جزئي' :
                           payment.type === 'refund' ? 'استرداد' : payment.type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">رقم الفاتورة:</span> {payment.invoiceNumber}
                        </div>
                        <div>
                          <span className="font-medium">المبلغ:</span> {formatCurrency(payment.amountInYER)}
                        </div>
                        <div>
                          <span className="font-medium">طريقة الدفع:</span> <PaymentMethodLabel method={payment.paymentMethod} />
                        </div>
                        <div>
                          <span className="font-medium">تاريخ الدفع:</span> {formatDate(payment.paymentDate)}
                        </div>
                      </div>

                      {/* معلومات إضافية للتحويلات البنكية */}
                      {(payment.bankName || payment.referenceNumber) && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                          {payment.bankName && (
                            <div>
                              <span className="font-medium">البنك:</span> {payment.bankName}
                            </div>
                          )}
                          {payment.referenceNumber && (
                            <div>
                              <span className="font-medium">الرقم المرجعي:</span> {payment.referenceNumber}
                            </div>
                          )}
                        </div>
                      )}

                      {/* معلومات الإيصال */}
                      {payment.receiptIssued && (
                        <div className="mt-2 text-sm text-green-600">
                          <CheckCircle className="inline h-3 w-3 mr-1" />
                          تم إصدار الإيصال رقم: {payment.receiptNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {payment.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleConfirmPayment(payment.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectPayment(payment.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* الترقيم */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            السابق
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          })}
          
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  )
}

export default PaymentDashboard
