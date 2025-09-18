/**
 * نموذج تسجيل المدفوعات - نظام لاند سبايس
 * الوحدة العاشرة: نظام الفوترة والمدفوعات
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Save,
  AlertCircle,
  CreditCard,
  Building,
  FileText,
  Receipt
} from 'lucide-react'

import { 
  PaymentRecord, 
  PaymentMethod,
  YemeniBank,
  CurrencyCode,
  YemeniInvoice
} from '@/lib/billing/types'
import { paymentService } from '@/lib/billing/payment-service'
import { invoiceService } from '@/lib/billing/invoice-service'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PaymentFormProps {
  payment?: PaymentRecord
  invoiceId?: string
  onSave?: (payment: PaymentRecord) => void
  onCancel?: () => void
  readOnly?: boolean
}

interface FormErrors {
  [key: string]: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  invoiceId,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<Partial<PaymentRecord>>({
    currency: 'YER',
    paymentMethod: 'bank_transfer',
    type: 'full',
    exchangeRate: 1
  })

  const [selectedInvoice, setSelectedInvoice] = useState<YemeniInvoice | null>(null)
  const [availableInvoices, setAvailableInvoices] = useState<YemeniInvoice[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())

  // تهيئة النموذج
  useEffect(() => {
    loadAvailableInvoices()
    
    if (payment) {
      setFormData(payment)
      setPaymentDate(new Date(payment.paymentDate))
      loadInvoiceDetails(payment.invoiceId)
    } else if (invoiceId) {
      setFormData(prev => ({ ...prev, invoiceId }))
      loadInvoiceDetails(invoiceId)
    }
  }, [payment, invoiceId])

  useEffect(() => {
    if (selectedInvoice && !formData.amount) {
      setFormData(prev => ({ 
        ...prev, 
        amount: selectedInvoice.total,
        amountInYER: selectedInvoice.total
      }))
    }
  }, [selectedInvoice])

  useEffect(() => {
    if (formData.amount && formData.currency && formData.exchangeRate) {
      const amountInYER = formData.currency === 'YER' 
        ? formData.amount 
        : formData.amount * formData.exchangeRate
      
      setFormData(prev => ({ ...prev, amountInYER }))
    }
  }, [formData.amount, formData.currency, formData.exchangeRate])

  // تحميل البيانات
  const loadAvailableInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const result = await invoiceService.searchInvoices({
        status: ['sent', 'delivered', 'partial_paid'],
        sortBy: 'issueDate',
        sortOrder: 'desc',
        limit: 100
      })
      setAvailableInvoices(result.invoices)
    } catch (error) {
      console.error('فشل في تحميل الفواتير:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const loadInvoiceDetails = async (invoiceId: string) => {
    try {
      const invoice = await invoiceService.getInvoice(invoiceId)
      if (invoice) {
        setSelectedInvoice(invoice)
        setFormData(prev => ({
          ...prev,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber
        }))
      }
    } catch (error) {
      console.error('فشل في تحميل تفاصيل الفاتورة:', error)
    }
  }

  // معالجة النموذج
  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = availableInvoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      setSelectedInvoice(invoice)
      setFormData(prev => ({
        ...prev,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        amountInYER: invoice.total
      }))
    }
  }

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }))
    
    if (!['bank_transfer', 'qasimi_bank', 'ahli_bank', 'saba_bank'].includes(method)) {
      setFormData(prev => ({
        ...prev,
        bankName: undefined,
        accountNumber: undefined,
        referenceNumber: generateReferenceNumber()
      }))
    }
  }

  const generateReferenceNumber = (): string => {
    return `REF${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  // التحقق من النموذج
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.invoiceId) {
      newErrors.invoiceId = 'يجب اختيار فاتورة'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'مبلغ الدفع مطلوب ويجب أن يكون أكبر من صفر'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'طريقة الدفع مطلوبة'
    }

    if (!formData.receivedBy) {
      newErrors.receivedBy = 'اسم مستلم المبلغ مطلوب'
    }

    const bankingMethods: PaymentMethod[] = ['bank_transfer', 'qasimi_bank', 'ahli_bank', 'saba_bank']
    if (bankingMethods.includes(formData.paymentMethod!)) {
      if (!formData.bankName) {
        newErrors.bankName = 'اسم البنك مطلوب للتحويلات البنكية'
      }
      if (!formData.referenceNumber) {
        newErrors.referenceNumber = 'الرقم المرجعي مطلوب للتحويلات البنكية'
      }
    }

    if (formData.paymentMethod === 'check' && !formData.checkNumber) {
      newErrors.checkNumber = 'رقم الشيك مطلوب'
    }

    if (formData.currency !== 'YER' && (!formData.exchangeRate || formData.exchangeRate <= 0)) {
      newErrors.exchangeRate = 'سعر الصرف مطلوب للعملات الأجنبية'
    }

    if (selectedInvoice && formData.amountInYER && formData.amountInYER > selectedInvoice.total) {
      newErrors.amount = 'مبلغ الدفع أكبر من إجمالي الفاتورة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // حفظ المدفوعة
  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const paymentData: Partial<PaymentRecord> = {
        ...formData,
        paymentDate,
        processedBy: formData.receivedBy,
        referenceNumber: formData.referenceNumber || generateReferenceNumber()
      }

      const savedPayment = await paymentService.recordPayment(paymentData)
      onSave?.(savedPayment)

    } catch (error) {
      console.error('فشل في حفظ المدفوعة:', error)
      setErrors({ general: 'فشل في حفظ المدفوعة. يرجى المحاولة مرة أخرى.' })
    } finally {
      setLoading(false)
    }
  }

  // دوال مساعدة
  const formatCurrency = (amount: number, currency: CurrencyCode = 'YER') => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'YER' ? 0 : 2
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ar })
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto" dir="rtl">
      {/* الترويسة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {payment ? 'عرض المدفوعة' : 'تسجيل مدفوعة جديدة'}
          </h1>
          {payment && (
            <p className="text-gray-600">رقم المدفوعة: {payment.paymentNumber}</p>
          )}
        </div>
        
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          )}
          {!readOnly && !payment && (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="ml-2 h-4 w-4" />
              {loading ? 'جاري الحفظ...' : 'تسجيل المدفوعة'}
            </Button>
          )}
        </div>
      </div>

      {/* رسائل الخطأ */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
            <p className="text-red-800">{errors.general}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* اختيار الفاتورة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!payment && (
                <div>
                  <Label htmlFor="invoice">اختيار الفاتورة *</Label>
                  <Select
                    value={formData.invoiceId}
                    onValueChange={handleInvoiceChange}
                    disabled={readOnly || !!invoiceId}
                  >
                    <SelectTrigger className={errors.invoiceId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="اختر الفاتورة">
                        {loadingInvoices ? 'جاري التحميل...' : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} - {invoice.restaurantName} - {formatCurrency(invoice.total)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.invoiceId && (
                    <p className="text-red-500 text-sm mt-1">{errors.invoiceId}</p>
                  )}
                </div>
              )}

              {selectedInvoice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">تفاصيل الفاتورة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">رقم الفاتورة:</span> {selectedInvoice.invoiceNumber}</div>
                    <div><span className="font-medium">المطعم:</span> {selectedInvoice.restaurantName}</div>
                    <div><span className="font-medium">تاريخ الإصدار:</span> {formatDate(selectedInvoice.issueDate)}</div>
                    <div><span className="font-medium">المبلغ الإجمالي:</span> {formatCurrency(selectedInvoice.total)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* معلومات المدفوعة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                تفاصيل المدفوعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">المبلغ *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className={errors.amount ? 'border-red-500' : ''}
                    readOnly={readOnly}
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: CurrencyCode) => setFormData(prev => ({ ...prev, currency: value }))}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YER">ريال يمني</SelectItem>
                      <SelectItem value="USD">دولار أمريكي</SelectItem>
                      <SelectItem value="SAR">ريال سعودي</SelectItem>
                      <SelectItem value="EUR">يورو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.currency !== 'YER' && (
                <div>
                  <Label htmlFor="exchangeRate">سعر الصرف (مقابل الريال اليمني) *</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    value={formData.exchangeRate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className={errors.exchangeRate ? 'border-red-500' : ''}
                    readOnly={readOnly}
                  />
                  {errors.exchangeRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.exchangeRate}</p>
                  )}
                  {formData.amountInYER && (
                    <p className="text-sm text-gray-600 mt-1">
                      المبلغ بالريال اليمني: {formatCurrency(formData.amountInYER)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  disabled={readOnly}
                >
                  <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقداً</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="qasimi_bank">بنك القاسمي</SelectItem>
                    <SelectItem value="ahli_bank">البنك الأهلي</SelectItem>
                    <SelectItem value="saba_bank">بنك سبأ</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                )}
              </div>

              <div>
                <Label htmlFor="paymentDate">تاريخ الدفع</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                      disabled={readOnly}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {paymentDate ? formatDate(paymentDate) : "اختر التاريخ"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(date) => date && setPaymentDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* البيانات المصرفية */}
          {['bank_transfer', 'qasimi_bank', 'ahli_bank', 'saba_bank'].includes(formData.paymentMethod!) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  البيانات المصرفية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">البنك *</Label>
                    <Select
                      value={formData.bankName}
                      onValueChange={(value: YemeniBank) => setFormData(prev => ({ ...prev, bankName: value }))}
                      disabled={readOnly}
                    >
                      <SelectTrigger className={errors.bankName ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر البنك" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qasimi_bank">بنك القاسمي</SelectItem>
                        <SelectItem value="ahli_bank">البنك الأهلي اليمني</SelectItem>
                        <SelectItem value="saba_bank">بنك سبأ الإسلامي</SelectItem>
                        <SelectItem value="commercial_bank">البنك التجاري اليمني</SelectItem>
                        <SelectItem value="yemen_kuwait_bank">بنك اليمن والكويت</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.bankName && (
                      <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="referenceNumber">الرقم المرجعي *</Label>
                    <Input
                      id="referenceNumber"
                      value={formData.referenceNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      placeholder="رقم العملية أو المرجع"
                      className={errors.referenceNumber ? 'border-red-500' : ''}
                      readOnly={readOnly}
                    />
                    {errors.referenceNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.referenceNumber}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="accountNumber">رقم الحساب (اختياري)</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    readOnly={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* بيانات الشيك */}
          {formData.paymentMethod === 'check' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  بيانات الشيك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkNumber">رقم الشيك *</Label>
                    <Input
                      id="checkNumber"
                      value={formData.checkNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkNumber: e.target.value }))}
                      className={errors.checkNumber ? 'border-red-500' : ''}
                      readOnly={readOnly}
                    />
                    {errors.checkNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.checkNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="checkBankName">البنك المسحوب عليه</Label>
                    <Input
                      id="checkBankName"
                      value={formData.bankName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value as YemeniBank }))}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* العمود الأيسر */}
        <div className="space-y-6">
          
          {/* معلومات المسؤولية */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات المسؤولية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receivedBy">مستلم المبلغ *</Label>
                <Input
                  id="receivedBy"
                  value={formData.receivedBy || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, receivedBy: e.target.value }))}
                  className={errors.receivedBy ? 'border-red-500' : ''}
                  readOnly={readOnly}
                />
                {errors.receivedBy && (
                  <p className="text-red-500 text-sm mt-1">{errors.receivedBy}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  readOnly={readOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* ملخص المدفوعة */}
          {formData.amount && (
            <Card>
              <CardHeader>
                <CardTitle>ملخص المدفوعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>المبلغ:</span>
                  <span className="font-medium">{formatCurrency(formData.amount, formData.currency)}</span>
                </div>
                
                {formData.currency !== 'YER' && (
                  <div className="flex justify-between">
                    <span>بالريال اليمني:</span>
                    <span className="font-medium">{formatCurrency(formData.amountInYER || 0)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="font-medium">
                    {formData.paymentMethod === 'cash' ? 'نقداً' :
                     formData.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                     formData.paymentMethod === 'qasimi_bank' ? 'بنك القاسمي' :
                     formData.paymentMethod === 'check' ? 'شيك' : formData.paymentMethod}
                  </span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span className="text-green-600">{formatCurrency(formData.amountInYER || formData.amount || 0)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
