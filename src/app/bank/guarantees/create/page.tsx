'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatCurrency } from '@/lib/utils'

interface RestaurantOption {
  id: string
  name: string
  businessLicense: string
  creditRating: 'excellent' | 'good' | 'fair' | 'poor'
  address: string
  phone: string
}

interface GuaranteeForm {
  restaurantId: string
  type: 'performance' | 'payment' | 'advance' | 'maintenance'
  amount: number
  currency: 'YER' | 'USD' | 'SAR'
  durationMonths: number
  beneficiary: string
  purpose: string
  commissionRate: number
  documents: File[]
}

export default function CreateGuaranteePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([])
  const [guaranteeForm, setGuaranteeForm] = useState<GuaranteeForm>({
    restaurantId: '',
    type: 'performance',
    amount: 0,
    currency: 'YER',
    durationMonths: 12,
    beneficiary: 'شركة لاند سبايس للتوابل والصلصات',
    purpose: '',
    commissionRate: 2.5,
    documents: []
  })
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    if (guaranteeForm.restaurantId) {
      const restaurant = restaurants.find(r => r.id === guaranteeForm.restaurantId)
      setSelectedRestaurant(restaurant || null)
      
      if (restaurant) {
        let newCommissionRate = 2.5
        switch (restaurant.creditRating) {
          case 'excellent': newCommissionRate = 1.5; break
          case 'good': newCommissionRate = 2.0; break
          case 'fair': newCommissionRate = 2.5; break
          case 'poor': newCommissionRate = 3.5; break
        }
        setGuaranteeForm(prev => ({ ...prev, commissionRate: newCommissionRate }))
      }
    }
  }, [guaranteeForm.restaurantId, restaurants])

  const fetchRestaurants = async () => {
    try {
      const mockRestaurants: RestaurantOption[] = [
        {
          id: 'rest1',
          name: 'مطعم البيك',
          businessLicense: 'BL-2024-001',
          creditRating: 'excellent',
          address: 'الرياض، المملكة العربية السعودية',
          phone: '+966 11 456 789'
        },
        {
          id: 'rest2',
          name: 'مطعم الطازج',
          businessLicense: 'BL-2024-002',
          creditRating: 'good',
          address: 'جدة، المملكة العربية السعودية',
          phone: '+966 12 789 012'
        },
        {
          id: 'rest3',
          name: 'مطعم السلام',
          businessLicense: 'BL-2024-003',
          creditRating: 'fair',
          address: 'صنعاء، اليمن',
          phone: '+967 1 345 678'
        }
      ]
      setRestaurants(mockRestaurants)
    } catch (error) {
      console.error('خطأ في جلب المطاعم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'bank') redirect('/auth/signin')

  const calculateCommission = () => {
    return (guaranteeForm.amount * guaranteeForm.commissionRate) / 100
  }

  const calculateExpiryDate = () => {
    const today = new Date()
    const expiryDate = new Date(today.setMonth(today.getMonth() + guaranteeForm.durationMonths))
    return expiryDate.toLocaleDateString('ar-SA')
  }

  const submitGuarantee = async () => {
    if (!guaranteeForm.restaurantId || !guaranteeForm.purpose || guaranteeForm.amount <= 0) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setIsSubmitting(true)
    
    try {
      alert(`تم إنشاء الضمانة بنجاح!

تفاصيل الضمانة:
• المطعم: ${selectedRestaurant?.name}
• النوع: ${getTypeText(guaranteeForm.type)}
• القيمة: ${formatCurrency(guaranteeForm.amount)} ${guaranteeForm.currency}
• المدة: ${guaranteeForm.durationMonths} شهر
• العمولة: ${formatCurrency(calculateCommission())} (${guaranteeForm.commissionRate}%)
• تاريخ الانتهاء: ${calculateExpiryDate()}

سيتم إصدار شهادة الضمانة خلال 24 ساعة.`)
      
      router.push('/bank/guarantees')
    } catch (error) {
      console.error('خطأ في إنشاء الضمانة:', error)
      alert('حدث خطأ أثناء إنشاء الضمانة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'performance': return 'ضمان حسن التنفيذ'
      case 'payment': return 'ضمان دفع'
      case 'advance': return 'ضمان دفعة مقدمة'
      case 'maintenance': return 'ضمان صيانة'
      default: return type
    }
  }

  const getCreditRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCreditRatingText = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'ممتاز'
      case 'good': return 'جيد'
      case 'fair': return 'مقبول'
      case 'poor': return 'ضعيف'
      default: return rating
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المطاعم...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['bank']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button variant="ghost" onClick={() => router.back()}>← العودة</Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🛡️ إنشاء ضمانة بنكية جديدة</h1>
                  <p className="text-gray-600">إصدار ضمانة بنكية للمطاعم الشريكة</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Restaurant Selection */}
            <Card>
              <CardHeader>
                <CardTitle>🏪 اختيار المطعم</CardTitle>
                <CardDescription>اختر المطعم المراد إصدار الضمانة له</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المطعم *</label>
                  <select
                    value={guaranteeForm.restaurantId}
                    onChange={(e) => setGuaranteeForm(prev => ({ ...prev, restaurantId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">اختر المطعم</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name} - {restaurant.businessLicense}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRestaurant && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">معلومات المطعم</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">الاسم:</span>
                        <span className="mr-2 text-gray-900">{selectedRestaurant.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">التقييم الائتماني:</span>
                        <span className={`mr-2 px-2 py-1 rounded text-xs ${getCreditRatingColor(selectedRestaurant.creditRating)}`}>
                          {getCreditRatingText(selectedRestaurant.creditRating)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guarantee Details */}
            <Card>
              <CardHeader>
                <CardTitle>📋 تفاصيل الضمانة</CardTitle>
                <CardDescription>أدخل المعلومات الأساسية للضمانة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الضمانة *</label>
                    <select
                      value={guaranteeForm.type}
                      onChange={(e) => setGuaranteeForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="performance">🎯 ضمان حسن التنفيذ</option>
                      <option value="payment">💳 ضمان دفع</option>
                      <option value="advance">💰 ضمان دفعة مقدمة</option>
                      <option value="maintenance">🔧 ضمان صيانة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المدة (بالأشهر) *</label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={guaranteeForm.durationMonths}
                      onChange={(e) => setGuaranteeForm(prev => ({ ...prev, durationMonths: parseInt(e.target.value) || 12 }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">قيمة الضمانة *</label>
                    <Input
                      type="number"
                      min="1000"
                      value={guaranteeForm.amount || ''}
                      onChange={(e) => setGuaranteeForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="مثال: 150000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                    <select
                      value={guaranteeForm.currency}
                      onChange={(e) => setGuaranteeForm(prev => ({ ...prev, currency: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="YER">ريال يمني (YER)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الغرض من الضمانة *</label>
                  <textarea
                    value={guaranteeForm.purpose}
                    onChange={(e) => setGuaranteeForm(prev => ({ ...prev, purpose: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="اشرح الغرض من إصدار هذه الضمانة..."
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Terms */}
            <Card>
              <CardHeader>
                <CardTitle>💰 الشروط المالية</CardTitle>
                <CardDescription>العمولات والشروط المالية للضمانة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">معدل العمولة (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10"
                      value={guaranteeForm.commissionRate}
                      onChange={(e) => setGuaranteeForm(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 2.5 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">يتم تحديد المعدل تلقائياً حسب التقييم الائتماني</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">قيمة العمولة</label>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(calculateCommission())} {guaranteeForm.currency}
                    </div>
                    <p className="text-xs text-gray-500">مستحقة عند الإصدار</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">📊 ملخص الضمانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">المطعم:</span>
                      <span className="font-medium">{selectedRestaurant?.name || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">نوع الضمانة:</span>
                      <span className="font-medium">{getTypeText(guaranteeForm.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">قيمة الضمانة:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(guaranteeForm.amount)} {guaranteeForm.currency}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">المدة:</span>
                      <span className="font-medium">{guaranteeForm.durationMonths} شهر</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">تاريخ الانتهاء:</span>
                      <span className="font-medium">{calculateExpiryDate()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">العمولة:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(calculateCommission())} ({guaranteeForm.commissionRate}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                إلغاء
              </Button>
              
              <div className="flex space-x-4 space-x-reverse">
                <Button variant="ghost" disabled={isSubmitting}>
                  💾 حفظ كمسودة
                </Button>
                
                <Button
                  variant="primary"
                  onClick={submitGuarantee}
                  disabled={isSubmitting || !guaranteeForm.restaurantId || !guaranteeForm.purpose || guaranteeForm.amount <= 0}
                >
                  {isSubmitting ? '⏳ جاري الإنشاء...' : '🛡️ إصدار الضمانة'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
