/**
 * لوحة تحكم الفواتير - نظام لاند سبايس
 * الوحدة العاشرة: نظام الفوترة والمدفوعات
 * 
 * لوحة تحكم شاملة لإدارة الفواتير مع مراعاة البيئة اليمنية
 * والعمليات اليدوية مع تصميم بديهي وسهل الاستخدام
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CalendarDays } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Search, 
  FileText, 
  Plus, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Send,
  Trash2
} from 'lucide-react'

import { 
  YemeniInvoice, 
  InvoiceStatus, 
  InvoiceType,
  InvoiceSearchCriteria,
  InvoiceSearchResult
} from '@/lib/billing/types'
import { invoiceService } from '@/lib/billing/invoice-service'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ===============================
// واجهات ومكونات مساعدة
// ===============================

interface InvoiceStats {
  total: number
  draft: number
  sent: number
  paid: number
  overdue: number
  totalAmount: number
  paidAmount: number
  overdueAmount: number
}

const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const getStatusInfo = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'مسودة', color: 'bg-gray-100 text-gray-800' }
      case 'sent':
        return { label: 'مرسلة', color: 'bg-blue-100 text-blue-800' }
      case 'delivered':
        return { label: 'مُسلمة', color: 'bg-cyan-100 text-cyan-800' }
      case 'paid':
        return { label: 'مدفوعة', color: 'bg-green-100 text-green-800' }
      case 'partial_paid':
        return { label: 'مدفوعة جزئياً', color: 'bg-yellow-100 text-yellow-800' }
      case 'overdue':
        return { label: 'متأخرة', color: 'bg-red-100 text-red-800' }
      case 'disputed':
        return { label: 'محل خلاف', color: 'bg-orange-100 text-orange-800' }
      case 'cancelled':
        return { label: 'ملغاة', color: 'bg-gray-100 text-gray-600' }
      case 'refunded':
        return { label: 'مسترجعة', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const { label, color } = getStatusInfo(status)
  return <Badge className={color}>{label}</Badge>
}

const InvoiceTypeIcon: React.FC<{ type: InvoiceType }> = ({ type }) => {
  switch (type) {
    case 'monthly':
      return <Calendar className="h-4 w-4 text-blue-600" />
    case 'service':
      return <FileText className="h-4 w-4 text-green-600" />
    case 'setup':
      return <Receipt className="h-4 w-4 text-purple-600" />
    case 'maintenance':
      return <AlertCircle className="h-4 w-4 text-orange-600" />
    default:
      return <FileText className="h-4 w-4 text-gray-600" />
  }
}

// ===============================
// المكون الرئيسي
// ===============================

const InvoiceDashboard: React.FC = () => {
  // الحالة الأساسية
  const [invoices, setInvoices] = useState<YemeniInvoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // معايير البحث والفلترة
  const [searchCriteria, setSearchCriteria] = useState<InvoiceSearchCriteria>({
    sortBy: 'issueDate',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  })
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<InvoiceType | 'all'>('all')
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null)

  // معلومات الترقيم
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  // ===============================
  // تحميل البيانات
  // ===============================

  useEffect(() => {
    loadInvoices()
  }, [searchCriteria])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      setError(null)

      const criteria: InvoiceSearchCriteria = {
        ...searchCriteria,
        searchText: searchText || undefined,
        status: selectedStatus !== 'all' ? [selectedStatus] : undefined,
        type: selectedType !== 'all' ? [selectedType] : undefined,
        dateRange: dateRange ? {
          field: 'issueDate',
          start: dateRange.start,
          end: dateRange.end
        } : undefined
      }

      const result = await invoiceService.searchInvoices(criteria)
      
      setInvoices(result.invoices)
      setTotalPages(result.totalPages)
      setCurrentPage(result.currentPage)

      // حساب الإحصائيات
      calculateStats(result.invoices, result.summary)

    } catch (err) {
      setError('فشل في تحميل الفواتير')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (invoicesData: YemeniInvoice[], summary: any) => {
    const newStats: InvoiceStats = {
      total: invoicesData.length,
      draft: invoicesData.filter(inv => inv.status === 'draft').length,
      sent: invoicesData.filter(inv => inv.status === 'sent' || inv.status === 'delivered').length,
      paid: invoicesData.filter(inv => inv.status === 'paid').length,
      overdue: invoicesData.filter(inv => inv.status === 'overdue').length,
      totalAmount: summary.totalAmount || 0,
      paidAmount: summary.paidAmount || 0,
      overdueAmount: summary.overdueAmount || 0
    }

    setStats(newStats)
  }

  // ===============================
  // إدارة الفواتير
  // ===============================

  const handleCreateInvoice = () => {
    // سيتم ربطه مع نموذج إنشاء الفاتورة
    console.log('إنشاء فاتورة جديدة')
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await invoiceService.sendInvoice(invoiceId, 'current_user')
      await loadInvoices()
    } catch (err) {
      console.error('فشل في إرسال الفاتورة:', err)
    }
  }

  const handleViewInvoice = (invoice: YemeniInvoice) => {
    // سيتم ربطه مع صفحة عرض الفاتورة
    console.log('عرض الفاتورة:', invoice.invoiceNumber)
  }

  const handleEditInvoice = (invoice: YemeniInvoice) => {
    if (invoice.status === 'draft') {
      // سيتم ربطه مع نموذج تحرير الفاتورة
      console.log('تحرير الفاتورة:', invoice.invoiceNumber)
    }
  }

  // ===============================
  // البحث والفلترة
  // ===============================

  const handleSearch = () => {
    setSearchCriteria(prev => ({
      ...prev,
      page: 1
    }))
  }

  const handleFilterChange = () => {
    setSearchCriteria(prev => ({
      ...prev,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      page
    }))
  }

  const resetFilters = () => {
    setSearchText('')
    setSelectedStatus('all')
    setSelectedType('all')
    setDateRange(null)
    setSearchCriteria({
      sortBy: 'issueDate',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    })
  }

  // ===============================
  // واجهة المستخدم
  // ===============================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ar })
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الفواتير</h1>
          <p className="text-gray-600">إدارة شاملة لفواتير المطاعم والعملاء</p>
        </div>
        <Button onClick={handleCreateInvoice} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="ml-2 h-4 w-4" />
          فاتورة جديدة
        </Button>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} مسودة، {stats.sent} مرسلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المدفوعة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.paidAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.overdueAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              معدل الدفع: {stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0}%
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
                placeholder="بحث في الفواتير..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* فلتر الحالة */}
            <Select value={selectedStatus} onValueChange={(value: InvoiceStatus | 'all') => setSelectedStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="sent">مرسلة</SelectItem>
                <SelectItem value="delivered">مُسلمة</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
              </SelectContent>
            </Select>

            {/* فلتر النوع */}
            <Select value={selectedType} onValueChange={(value: InvoiceType | 'all') => setSelectedType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="monthly">شهرية</SelectItem>
                <SelectItem value="service">خدمة</SelectItem>
                <SelectItem value="setup">إعداد</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
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

      {/* قائمة الفواتير */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>الفواتير ({stats.total})</CardTitle>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p>{error}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>لا توجد فواتير متطابقة مع المعايير المحددة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <InvoiceTypeIcon type={invoice.type} />
                        <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">المطعم:</span> {invoice.restaurantName}
                        </div>
                        <div>
                          <span className="font-medium">تاريخ الإصدار:</span> {formatDate(invoice.issueDate)}
                        </div>
                        <div>
                          <span className="font-medium">تاريخ الاستحقاق:</span> {formatDate(invoice.dueDate)}
                        </div>
                        <div>
                          <span className="font-medium">المبلغ:</span> {formatCurrency(invoice.total)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {invoice.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice.id)}
                          >
                            <Send className="h-4 w-4" />
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
            onClick={() => handlePageChange(currentPage - 1)}
          >
            السابق
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            )
          })}
          
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  )
}

export default InvoiceDashboard
