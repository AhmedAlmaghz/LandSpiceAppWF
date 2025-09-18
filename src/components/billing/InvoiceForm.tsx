/**
 * نموذج إنشاء وتحرير الفاتورة - نظام لاند سبايس
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
  Plus,
  Trash2,
  Calculator,
  Save,
  Send,
  AlertCircle,
  User,
  FileText
} from 'lucide-react'

import { 
  YemeniInvoice, 
  InvoiceItem,
  InvoiceType,
  PaymentMethod,
  ItemCategory,
  YEMEN_VAT_RATE,
  DEFAULT_PAYMENT_TERMS
} from '@/lib/billing/types'
import { invoiceService } from '@/lib/billing/invoice-service'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface InvoiceFormProps {
  invoice?: YemeniInvoice
  onSave?: (invoice: YemeniInvoice) => void
  onCancel?: () => void
  readOnly?: boolean
}

interface FormErrors {
  [key: string]: string
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<Partial<YemeniInvoice>>({
    type: 'monthly',
    period: 'monthly',
    priority: 'normal',
    currency: 'YER',
    vatRate: YEMEN_VAT_RATE,
    paymentMethod: 'bank_transfer',
    items: []
  })

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + DEFAULT_PAYMENT_TERMS * 24 * 60 * 60 * 1000)
  )

  // تهيئة النموذج
  useEffect(() => {
    if (invoice) {
      setFormData(invoice)
      setItems(invoice.items || [])
      setIssueDate(new Date(invoice.issueDate))
      setDueDate(new Date(invoice.dueDate))
    } else {
      addNewItem()
    }
  }, [invoice])

  useEffect(() => {
    calculateTotals()
  }, [items, formData.discountRate])

  // إدارة البنود
  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      description: '',
      category: 'management',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      discountAmount: 0,
      subtotal: 0,
      vatRate: YEMEN_VAT_RATE,
      vatAmount: 0,
      total: 0
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      if (['quantity', 'unitPrice', 'discount', 'vatRate'].includes(field)) {
        calculateItemAmounts(updated[index])
      }
      
      return updated
    })
  }

  const calculateItemAmounts = (item: InvoiceItem) => {
    item.subtotal = item.quantity * item.unitPrice
    item.discountAmount = item.subtotal * (item.discount / 100)
    const afterDiscount = item.subtotal - item.discountAmount
    item.vatAmount = afterDiscount * item.vatRate
    item.total = afterDiscount + item.vatAmount
  }

  // الحسابات الإجمالية
  const calculateTotals = () => {
    setCalculating(true)
    
    setTimeout(() => {
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
      const totalItemDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
      const generalDiscount = subtotal * ((formData.discountRate || 0) / 100)
      const totalDiscount = totalItemDiscount + generalDiscount
      const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0)
      const total = items.reduce((sum, item) => sum + item.total, 0) - generalDiscount

      setFormData(prev => ({
        ...prev,
        subtotal,
        discountAmount: totalDiscount,
        vatAmount: totalVat,
        total,
        items: items
      }))

      setCalculating(false)
    }, 100)
  }

  // التحقق من النموذج
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.restaurantName) {
      newErrors.restaurantName = 'اسم المطعم مطلوب'
    }
    if (!formData.restaurantPhone) {
      newErrors.restaurantPhone = 'رقم هاتف المطعم مطلوب'
    }
    if (!formData.contactPerson) {
      newErrors.contactPerson = 'الشخص المسؤول مطلوب'
    }
    if (items.length === 0) {
      newErrors.items = 'يجب إضافة بند واحد على الأقل'
    }

    items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`item_${index}_description`] = 'وصف البند مطلوب'
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'الكمية يجب أن تكون أكبر من صفر'
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'السعر يجب أن يكون أكبر من صفر'
      }
    })

    if (dueDate <= issueDate) {
      newErrors.dueDate = 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ الإصدار'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // حفظ الفاتورة
  const handleSave = async (asDraft = true) => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const invoiceData: Partial<YemeniInvoice> = {
        ...formData,
        issueDate,
        dueDate,
        items,
        createdBy: 'current_user',
        termsAndConditions: formData.termsAndConditions || getDefaultTerms()
      }

      let savedInvoice: YemeniInvoice

      if (invoice?.id) {
        savedInvoice = await invoiceService.updateInvoice(invoice.id, invoiceData)
      } else {
        savedInvoice = await invoiceService.createInvoice(invoiceData)
      }

      if (!asDraft && savedInvoice.status === 'draft') {
        savedInvoice = await invoiceService.sendInvoice(savedInvoice.id, 'current_user')
      }

      onSave?.(savedInvoice)

    } catch (error) {
      console.error('فشل في حفظ الفاتورة:', error)
      setErrors({ general: 'فشل في حفظ الفاتورة. يرجى المحاولة مرة أخرى.' })
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTerms = (): string => {
    return `
1. يستحق سداد هذه الفاتورة خلال ${DEFAULT_PAYMENT_TERMS} يوم من تاريخ الإصدار.
2. في حالة التأخير في السداد، قد تطبق غرامة تأخير 2% شهرياً.
3. جميع الأسعار شاملة ضريبة القيمة المضافة ${YEMEN_VAT_RATE * 100}%.
4. أي اعتراض على هذه الفاتورة يجب إبلاغه خلال 7 أيام من تاريخ الاستلام.
5. تخضع هذه الفاتورة للقوانين اليمنية النافذة.
    `.trim()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ar })
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto" dir="rtl">
      {/* الترويسة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {invoice ? 'تحرير الفاتورة' : 'إنشاء فاتورة جديدة'}
          </h1>
          {invoice && (
            <p className="text-gray-600">رقم الفاتورة: {invoice.invoiceNumber}</p>
          )}
        </div>
        
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          )}
          {!readOnly && (
            <>
              <Button
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ كمسودة
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ وإرسال'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* رسائل الخطأ العامة */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
            <p className="text-red-800">{errors.general}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات المطعم */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات المطعم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">اسم المطعم *</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className={errors.restaurantName ? 'border-red-500' : ''}
                    readOnly={readOnly}
                  />
                  {errors.restaurantName && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPerson">الشخص المسؤول *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className={errors.contactPerson ? 'border-red-500' : ''}
                    readOnly={readOnly}
                  />
                  {errors.contactPerson && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantPhone">رقم الهاتف *</Label>
                  <Input
                    id="restaurantPhone"
                    value={formData.restaurantPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantPhone: e.target.value }))}
                    placeholder="+967 1 234567"
                    className={errors.restaurantPhone ? 'border-red-500' : ''}
                    readOnly={readOnly}
                  />
                  {errors.restaurantPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.restaurantPhone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="restaurantEmail">البريد الإلكتروني</Label>
                  <Input
                    id="restaurantEmail"
                    type="email"
                    value={formData.restaurantEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantEmail: e.target.value }))}
                    readOnly={readOnly}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="restaurantAddress">العنوان</Label>
                <Textarea
                  id="restaurantAddress"
                  value={formData.restaurantAddress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                  rows={2}
                  readOnly={readOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* بنود الفاتورة */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  بنود الفاتورة
                </CardTitle>
                {!readOnly && (
                  <Button onClick={addNewItem} size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة بند
                  </Button>
                )}
              </div>
              {errors.items && (
                <p className="text-red-500 text-sm">{errors.items}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">البند {index + 1}</h4>
                    {!readOnly && items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>وصف البند *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className={errors[`item_${index}_description`] ? 'border-red-500' : ''}
                        readOnly={readOnly}
                      />
                      {errors[`item_${index}_description`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_description`]}</p>
                      )}
                    </div>

                    <div>
                      <Label>الكمية *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                        className={errors[`item_${index}_quantity`] ? 'border-red-500' : ''}
                        readOnly={readOnly}
                      />
                    </div>

                    <div>
                      <Label>سعر الوحدة (ر.ي) *</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className={errors[`item_${index}_unitPrice`] ? 'border-red-500' : ''}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>

                  {/* ملخص البند */}
                  <div className="bg-gray-50 rounded p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium">المجموع الفرعي:</span>
                        <p className="text-blue-600">{formatCurrency(item.subtotal)}</p>
                      </div>
                      <div>
                        <span className="font-medium">الخصم:</span>
                        <p className="text-orange-600">{formatCurrency(item.discountAmount)}</p>
                      </div>
                      <div>
                        <span className="font-medium">ض.ق.م:</span>
                        <p className="text-purple-600">{formatCurrency(item.vatAmount)}</p>
                      </div>
                      <div>
                        <span className="font-medium">الإجمالي:</span>
                        <p className="text-green-600 font-bold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ملخص الفاتورة */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>نوع الفاتورة</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: InvoiceType) => setFormData(prev => ({ ...prev, type: value }))}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">فاتورة شهرية</SelectItem>
                    <SelectItem value="service">فاتورة خدمة</SelectItem>
                    <SelectItem value="setup">فاتورة إعداد</SelectItem>
                    <SelectItem value="maintenance">فاتورة صيانة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>تاريخ الإصدار</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right font-normal"
                        disabled={readOnly}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {issueDate ? formatDate(issueDate) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={issueDate}
                        onSelect={(date) => date && setIssueDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>تاريخ الاستحقاق</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right font-normal"
                        disabled={readOnly}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {dueDate ? formatDate(dueDate) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ملخص المبالغ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                ملخص المبالغ
                {calculating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-medium">{formatCurrency(formData.subtotal || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span className="text-orange-600">-{formatCurrency(formData.discountAmount || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>ض.ق.م ({(formData.vatRate || YEMEN_VAT_RATE) * 100}%):</span>
                <span className="text-purple-600">{formatCurrency(formData.vatAmount || 0)}</span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع الإجمالي:</span>
                <span className="text-green-600">{formatCurrency(formData.total || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InvoiceForm
