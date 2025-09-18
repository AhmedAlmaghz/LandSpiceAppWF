// Create Restaurant Page
// صفحة إنشاء مطعم جديد

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RestaurantFormData } from '@/lib/restaurant/types'
import { RestaurantService } from '@/lib/restaurant/restaurant-service'
import RestaurantForm from '@/components/restaurant/RestaurantForm'
import { Button } from '@/components/ui/Button'

export default function CreateRestaurantPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const restaurantService = RestaurantService.getInstance()

  const handleSubmit = async (data: RestaurantFormData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await restaurantService.createRestaurant(data)
      
      if (result.success && result.restaurant) {
        // Success - redirect to restaurant profile
        router.push(`/admin/restaurants?success=created&id=${result.restaurant.id}`)
      } else {
        // Show validation errors
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(err => err.message).join(', ')
          setError(`خطأ في البيانات: ${errorMessages}`)
        } else {
          setError('حدث خطأ غير متوقع أثناء إنشاء المطعم')
        }
      }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      setError('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Navigate back to restaurants list
    router.push('/admin/restaurants')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="p-2 hover:bg-gray-200"
            >
              ← رجوع
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة مطعم جديد</h1>
              <p className="text-gray-600 mt-1">
                أضف مطعم جديد إلى النظام مع جميع المعلومات والتفاصيل المطلوبة
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-blue-900">إنشاء ملف المطعم</h3>
                <p className="text-sm text-blue-700">
                  املأ جميع المعلومات المطلوبة لإنشاء ملف شامل للمطعم
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
              <div>
                <h3 className="font-medium text-red-900">خطأ في إنشاء المطعم</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 إرشادات مهمة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🏢 المعلومات الأساسية</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• اسم المطعم كما سيظهر للعملاء</li>
                <li>• الاسم القانوني المسجل رسمياً</li>
                <li>• نوع المطعم ونشاطه التجاري</li>
                <li>• وصف شامل للمطعم وخدماته</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">👥 جهات الاتصال</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• يجب إضافة جهة اتصال رئيسية واحدة على الأقل</li>
                <li>• تأكد من صحة أرقام الهواتف والايميلات</li>
                <li>• حدد الأشخاص المخولين للتواصل</li>
                <li>• يمكن إضافة عدة أشخاص للاتصال</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📍 معلومات الفروع</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• أضف الفرع الرئيسي كحد أدنى</li>
                <li>• تأكد من دقة العناوين للتوصيل</li>
                <li>• حدد مدير كل فرع ووسائل التواصل</li>
                <li>• يمكن إضافة فروع متعددة</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">💰 المعلومات المالية</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• رقم السجل التجاري وهو مطلوب</li>
                <li>• الرقم الضريبي من هيئة الزكاة</li>
                <li>• مبلغ رأس المال والضمان المطلوب</li>
                <li>• طريقة الدفع المفضلة وشروطها</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <RestaurantForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            mode="create"
          />
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-3">💡 نصائح مفيدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>للحصول على أفضل النتائج:</strong>
              <ul className="mt-2 space-y-1">
                <li>• تأكد من صحة جميع البيانات قبل الحفظ</li>
                <li>• استخدم أسماء واضحة ومفهومة</li>
                <li>• أضف علامات (Tags) لسهولة البحث</li>
              </ul>
            </div>
            <div>
              <strong>في حالة واجهتك مشكلة:</strong>
              <ul className="mt-2 space-y-1">
                <li>• تحقق من الحقول الإجبارية المميزة بـ (*)</li>
                <li>• تأكد من صيغة البريد الإلكتروني</li>
                <li>• اتصل بالدعم الفني للمساعدة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
