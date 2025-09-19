'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

interface InvoiceDetails {
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
  companyInfo: {
    name: string
    address: string
    taxNumber: string
    phone: string
  }
  restaurantInfo: {
    name: string
    address: string
    phone: string
    taxNumber?: string
  }
  notes?: string
  terms?: string
}

export default function InvoiceDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails()
    }
  }, [invoiceId])

  const fetchInvoiceDetails = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/restaurant/invoices/${invoiceId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInvoiceDetails(data.data)
        }
      } else {
        // بيانات تجريبية مفصلة
        const mockInvoiceDetails: InvoiceDetails = {
          id: invoiceId,
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
          },
          companyInfo: {
            name: 'شركة لاند سبايس للتوابل والصلصات',
            address: 'صنعاء، اليمن - المنطقة الصناعية، شارع الستين',
            taxNumber: 'YE-TAX-123456789',
            phone: '+967 1 234 567'
          },
          restaurantInfo: {
            name: 'مطعم البيك',
            address: 'الرياض، المملكة العربية السعودية - شارع الملك فهد',
            phone: '+966 11 456 789',
            taxNumber: 'SA-TAX-987654321'
          },
          notes: 'شكراً لكم على التعامل معنا',
          terms: 'الدفع خلال 30 يوم من تاريخ الإصدار'
        }
        setInvoiceDetails(mockInvoiceDetails)
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الفاتورة:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'restaurant') redirect('/auth/signin')

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

  const printInvoice = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الفاتورة...</p>
        </div>
      </div>
    )
  }

  if (!invoiceDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الفاتورة غير موجودة</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على الفاتورة المطلوبة</p>
          <Button onClick={() => router.push('/restaurant/invoices')}>
            العودة للفواتير
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['restaurant']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button variant="ghost" onClick={() => router.back()}>← العودة</Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    🧾 {invoiceDetails.invoiceNumber}
                  </h1>
                  <span className={`status-badge ${getStatusColor(invoiceDetails.status)}`}>
                    {getStatusText(invoiceDetails.status)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={printInvoice}
                >
                  🖨️ طباعة
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/api/invoices/${invoiceId}/pdf`, '_blank')}
                >
                  📄 تحميل PDF
                </Button>
                
                {invoiceDetails.status === 'sent' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => router.push(`/restaurant/invoices/${invoiceId}/pay`)}
                  >
                    💳 دفع الآن
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Invoice Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Invoice Header */}
            <div className="px-6 py-8 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">فاتورة</h2>
                  <div className="text-lg text-gray-600">{invoiceDetails.invoiceNumber}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 mb-2">لاند سبايس</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{invoiceDetails.companyInfo.address}</div>
                    <div>📞 {invoiceDetails.companyInfo.phone}</div>
                    <div>🏢 الرقم الضريبي: {invoiceDetails.companyInfo.taxNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="px-6 py-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">إلى:</h4>
                  <div className="text-gray-700 space-y-1">
                    <div className="font-medium">{invoiceDetails.restaurantInfo.name}</div>
                    <div>{invoiceDetails.restaurantInfo.address}</div>
                    <div>📞 {invoiceDetails.restaurantInfo.phone}</div>
                    {invoiceDetails.restaurantInfo.taxNumber && (
                      <div>🏢 الرقم الضريبي: {invoiceDetails.restaurantInfo.taxNumber}</div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">تاريخ الإصدار:</span>
                      <span className="font-medium mr-2">{formatDate(invoiceDetails.issuedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ الاستحقاق:</span>
                      <span className="font-medium mr-2">{formatDate(invoiceDetails.dueDate)}</span>
                    </div>
                    {invoiceDetails.paidDate && (
                      <div>
                        <span className="text-gray-600">تاريخ الدفع:</span>
                        <span className="font-medium mr-2 text-green-600">{formatDate(invoiceDetails.paidDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="px-6 py-6">
              <h4 className="font-medium text-gray-900 mb-4">تفاصيل الفاتورة</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-right font-medium text-gray-700">الوصف</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">الكمية</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">السعر</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetails.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-4">{item.description}</td>
                        <td className="px-4 py-4 text-center">{item.quantity}</td>
                        <td className="px-4 py-4 text-center">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-4 text-center font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ الأساسي:</span>
                    <span className="font-medium">{formatCurrency(invoiceDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة (15%):</span>
                    <span className="font-medium">{formatCurrency(invoiceDetails.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-lg font-medium">الإجمالي:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(invoiceDetails.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {invoiceDetails.status === 'paid' && invoiceDetails.bankDetails && (
              <div className="px-6 py-6 bg-green-50 border-t">
                <h4 className="font-medium text-green-800 mb-3">معلومات الدفع</h4>
                <div className="text-green-700 space-y-1">
                  <div>طريقة الدفع: 
                    {invoiceDetails.paymentMethod === 'bank_transfer' ? ' 🏦 تحويل بنكي' :
                     invoiceDetails.paymentMethod === 'cash' ? ' 💰 نقدي' : ' 📝 شيك'}
                  </div>
                  <div>البنك: {invoiceDetails.bankDetails.bankName}</div>
                  <div>رقم الحساب: {invoiceDetails.bankDetails.accountNumber}</div>
                  {invoiceDetails.bankDetails.transferReference && (
                    <div>رقم المرجع: {invoiceDetails.bankDetails.transferReference}</div>
                  )}
                </div>
              </div>
            )}

            {/* Notes and Terms */}
            {(invoiceDetails.notes || invoiceDetails.terms) && (
              <div className="px-6 py-6 border-t bg-gray-50">
                {invoiceDetails.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">ملاحظات:</h4>
                    <p className="text-gray-700">{invoiceDetails.notes}</p>
                  </div>
                )}
                
                {invoiceDetails.terms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">شروط الدفع:</h4>
                    <p className="text-gray-700">{invoiceDetails.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-100 text-center text-sm text-gray-600">
              شكراً لكم على تعاملكم مع شركة لاند سبايس
            </div>
          </div>

          {/* Action Buttons - Print Hidden */}
          <div className="mt-8 flex justify-center space-x-4 space-x-reverse print:hidden">
            <Button
              variant="outline"
              onClick={() => router.push('/restaurant/invoices')}
            >
              📋 عرض جميع الفواتير
            </Button>
            
            {invoiceDetails.status === 'sent' && (
              <Button
                variant="primary"
                onClick={() => router.push(`/restaurant/invoices/${invoiceId}/pay`)}
              >
                💳 دفع الفاتورة
              </Button>
            )}
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
