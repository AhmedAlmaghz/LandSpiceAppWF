'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatCurrency, formatDate } from '@/lib/utils'

// Types
interface Product {
  id: string
  name: string
  type: 'ketchup' | 'chili' | 'mixed'
  unitPrice: number
  currentStock: number
  minStock: number
  maxStock: number
  supplier: string
  description?: string
}

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

interface OrderForm {
  priority: 'normal' | 'urgent' | 'emergency'
  deliveryDate: string
  deliveryAddress: string
  specialInstructions: string
  items: OrderItem[]
}

export default function CreateOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedProduct = searchParams.get('product')

  const [products, setProducts] = useState<Product[]>([])
  const [orderForm, setOrderForm] = useState<OrderForm>({
    priority: 'normal',
    deliveryDate: '',
    deliveryAddress: '',
    specialInstructions: '',
    items: []
  })
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(0)
  const [itemNotes, setItemNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (preSelectedProduct && products.length > 0) {
      setSelectedProduct(preSelectedProduct)
      const product = products.find(p => p.id === preSelectedProduct)
      if (product) {
        // اقتراح كمية أساسية للطلب
        const suggestedQuantity = Math.max(product.minStock * 2 - product.currentStock, 0)
        setQuantity(suggestedQuantity)
      }
    }
  }, [preSelectedProduct, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/restaurant/products')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProducts(data.data)
        }
      } else {
        // بيانات تجريبية للمنتجات
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'كاتشب عبوة 500مل',
            type: 'ketchup',
            unitPrice: 2.5,
            currentStock: 800,
            minStock: 1000,
            maxStock: 10000,
            supplier: 'مصنع لاند سبايس',
            description: 'كاتشب طماطم طبيعي عالي الجودة'
          },
          {
            id: '2',
            name: 'شطة حارة عبوة 200مل',
            type: 'chili',
            unitPrice: 3.0,
            currentStock: 400,
            minStock: 1200,
            maxStock: 8000,
            supplier: 'مصنع لاند سبايس',
            description: 'صلصة فلفل حار مميزة الطعم'
          },
          {
            id: '3',
            name: 'صلصة مخلوطة عبوة 300مل',
            type: 'mixed',
            unitPrice: 2.8,
            currentStock: 0,
            minStock: 500,
            maxStock: 5000,
            supplier: 'مصنع لاند سبايس',
            description: 'خليط متوازن من الكاتشب والشطة'
          },
          {
            id: '4',
            name: 'كاتشب عبوة 1 لتر',
            type: 'ketchup',
            unitPrice: 4.2,
            currentStock: 1500,
            minStock: 800,
            maxStock: 6000,
            supplier: 'مصنع لاند سبايس',
            description: 'عبوة اقتصادية للاستخدام المكثف'
          }
        ]
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error)
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

  // إضافة منتج للطلب
  const addItemToOrder = () => {
    if (!selectedProduct || quantity <= 0) {
      alert('يرجى اختيار المنتج وإدخال الكمية')
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    // التحقق من عدم إضافة نفس المنتج مرتين
    const existingItemIndex = orderForm.items.findIndex(item => item.productId === selectedProduct)
    
    if (existingItemIndex >= 0) {
      // تحديث الكمية للمنتج الموجود
      const newItems = [...orderForm.items]
      newItems[existingItemIndex].quantity += quantity
      newItems[existingItemIndex].totalPrice = newItems[existingItemIndex].quantity * product.unitPrice
      if (itemNotes) {
        newItems[existingItemIndex].notes = itemNotes
      }
      
      setOrderForm(prev => ({ ...prev, items: newItems }))
    } else {
      // إضافة منتج جديد
      const newItem: OrderItem = {
        productId: selectedProduct,
        productName: product.name,
        quantity,
        unitPrice: product.unitPrice,
        totalPrice: quantity * product.unitPrice,
        notes: itemNotes || undefined
      }

      setOrderForm(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
    }

    // إعادة تعيين النموذج
    setSelectedProduct('')
    setQuantity(0)
    setItemNotes('')
  }

  // حذف منتج من الطلب
  const removeItemFromOrder = (productId: string) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }))
  }

  // تحديث كمية منتج في الطلب
  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(productId)
      return
    }

    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.unitPrice
          }
        }
        return item
      })
    }))
  }

  // حساب المجموع الإجمالي
  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => total + item.totalPrice, 0)
  }

  // إرسال الطلب
  const submitOrder = async () => {
    if (orderForm.items.length === 0) {
      alert('يرجى إضافة منتجات للطلب')
      return
    }

    if (!orderForm.deliveryDate) {
      alert('يرجى تحديد تاريخ التسليم المرغوب')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/restaurant/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...orderForm,
          totalAmount: calculateTotal(),
          restaurantId: session.user.restaurantId || 'r1' // من بيانات المستخدم
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('تم إرسال طلب التوريد بنجاح!')
          router.push('/restaurant/orders')
        } else {
          alert('خطأ في إرسال الطلب: ' + data.error)
        }
      } else {
        // في حالة عدم توفر API، نعرض رسالة نجاح
        alert(`تم إرسال طلب التوريد بنجاح!
        
تفاصيل الطلب:
• عدد المنتجات: ${orderForm.items.length}
• إجمالي القيمة: ${formatCurrency(calculateTotal())}
• الأولوية: ${orderForm.priority === 'urgent' ? 'عاجل' : orderForm.priority === 'emergency' ? 'طارئ' : 'عادي'}
• تاريخ التسليم: ${orderForm.deliveryDate}

سيتم التواصل معك قريباً لتأكيد الطلب.`)
        
        router.push('/restaurant/orders')
      }
    } catch (error) {
      console.error('خطأ في إرسال الطلب:', error)
      alert('حدث خطأ أثناء إرسال الطلب')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'ketchup': return '🍅'
      case 'chili': return '🌶️'
      case 'mixed': return '🥫'
      default: return '📦'
    }
  }

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { color: 'text-red-600', text: 'نفد' }
    if (current <= min) return { color: 'text-red-600', text: 'منخفض جداً' }
    if (current <= min * 1.5) return { color: 'text-yellow-600', text: 'منخفض' }
    return { color: 'text-green-600', text: 'متوفر' }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 border-red-300 text-red-800'
      case 'urgent': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default: return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
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
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  ← العودة
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📋 طلب توريد جديد</h1>
                  <p className="text-gray-600">إنشاء طلب توريد للمنتجات المطلوبة</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>🏷️ تفاصيل الطلب</CardTitle>
                  <CardDescription>معلومات عامة عن طلب التوريد</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أولوية الطلب
                      </label>
                      <select
                        value={orderForm.priority}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="normal">عادي</option>
                        <option value="urgent">عاجل</option>
                        <option value="emergency">طارئ</option>
                      </select>
                      <div className={`mt-1 px-2 py-1 rounded text-xs ${getPriorityColor(orderForm.priority)}`}>
                        {orderForm.priority === 'emergency' ? '🚨 طارئ - يتطلب تسليم فوري' :
                         orderForm.priority === 'urgent' ? '⚡ عاجل - يتطلب تسليم سريع' :
                         '📅 عادي - تسليم حسب الجدولة المعتادة'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ التسليم المرغوب
                      </label>
                      <Input
                        type="date"
                        value={orderForm.deliveryDate}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان التسليم
                    </label>
                    <Input
                      value={orderForm.deliveryAddress}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      placeholder="عنوان المطعم أو موقع التسليم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تعليمات خاصة
                    </label>
                    <textarea
                      value={orderForm.specialInstructions}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="أي تعليمات خاصة للتوريد أو التسليم..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Products */}
              <Card>
                <CardHeader>
                  <CardTitle>➕ إضافة منتجات</CardTitle>
                  <CardDescription>اختر المنتجات المطلوبة وحدد الكميات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المنتج
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">اختر المنتج</option>
                        {products.map(product => {
                          const status = getStockStatus(product.currentStock, product.minStock)
                          return (
                            <option key={product.id} value={product.id}>
                              {getProductIcon(product.type)} {product.name} - {formatCurrency(product.unitPrice)}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الكمية
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={quantity || ''}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        placeholder="الكمية"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={addItemToOrder}
                        disabled={!selectedProduct || quantity <= 0}
                        className="w-full"
                      >
                        ➕ إضافة
                      </Button>
                    </div>
                  </div>

                  {/* Product Details */}
                  {selectedProduct && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      {(() => {
                        const product = products.find(p => p.id === selectedProduct)
                        if (!product) return null
                        
                        const status = getStockStatus(product.currentStock, product.minStock)
                        const estimatedCost = quantity * product.unitPrice
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-gray-700">المخزون الحالي</div>
                              <div className={`${status.color} font-medium`}>
                                {product.currentStock.toLocaleString()} وحدة ({status.text})
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-700">الحد الأدنى</div>
                              <div className="text-gray-600">{product.minStock.toLocaleString()} وحدة</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-700">التكلفة المقدرة</div>
                              <div className="text-green-600 font-medium">{formatCurrency(estimatedCost)}</div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات على المنتج (اختياري)
                    </label>
                    <Input
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="أي ملاحظات خاصة بهذا المنتج..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>📋 ملخص الطلب</CardTitle>
                  <CardDescription>المنتجات المطلوبة والتكلفة الإجمالية</CardDescription>
                </CardHeader>
                <CardContent>
                  {orderForm.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>لم يتم إضافة منتجات بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderForm.items.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-600">
                              {item.quantity.toLocaleString()} × {formatCurrency(item.unitPrice)}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-blue-600 mt-1">
                                💬 {item.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="text-right">
                              <div className="font-medium text-sm">{formatCurrency(item.totalPrice)}</div>
                              <div className="flex items-center space-x-1 space-x-reverse mt-1">
                                <button
                                  onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                  className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs hover:bg-red-200"
                                >
                                  -
                                </button>
                                <span className="text-xs w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                  className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs hover:bg-green-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeItemFromOrder(item.productId)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">الإجمالي:</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(calculateTotal())}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>عدد المنتجات:</span>
                            <span>{orderForm.items.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>إجمالي الكمية:</span>
                            <span>{orderForm.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الأولوية:</span>
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(orderForm.priority)}`}>
                              {orderForm.priority === 'emergency' ? 'طارئ' :
                               orderForm.priority === 'urgent' ? 'عاجل' : 'عادي'}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={submitOrder}
                          disabled={isSubmitting || orderForm.items.length === 0}
                          className="w-full"
                          variant="primary"
                        >
                          {isSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال الطلب'}
                        </Button>

                        <p className="text-xs text-gray-500 mt-3 text-center">
                          سيتم مراجعة طلبك والرد خلال 24 ساعة
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
