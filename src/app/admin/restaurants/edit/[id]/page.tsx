// Edit Restaurant Page
// صفحة تحرير بيانات المطعم

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Restaurant, RestaurantFormData } from '@/lib/restaurant/types'
import { RestaurantService } from '@/lib/restaurant/restaurant-service'
import RestaurantForm from '@/components/restaurant/RestaurantForm'
import { Button } from '@/components/ui/Button'

export default function EditRestaurantPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id as string
  
  const restaurantService = RestaurantService.getInstance()

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant()
    }
  }, [restaurantId])

  const loadRestaurant = async () => {
    setLoading(true)
    setError(null)

    try {
      const restaurant = await restaurantService.getRestaurant(restaurantId)
      
      if (restaurant) {
        setRestaurant(restaurant)
      } else {
        setNotFound(true)
        setError('المطعم المطلوب غير موجود في النظام')
      }
    } catch (error) {
      console.error('Error loading restaurant:', error)
      setError('حدث خطأ في تحميل بيانات المطعم')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: RestaurantFormData) => {
    if (!restaurant) return

    setSaving(true)
    setError(null)

    try {
      const result = await restaurantService.updateRestaurant(restaurant.id, {
        name: data.basic.name,
        legalName: data.basic.legalName,
        type: data.basic.type,
        businessInfo: data.basic.businessInfo,
        contacts: data.contacts.map(c => ({ ...c, id: `contact-${Date.now()}-${Math.random()}` })),
        branches: data.branches.map(b => ({ ...b, id: `branch-${Date.now()}-${Math.random()}` })),
        financialInfo: data.financial,
        preferences: data.preferences,
        tags: data.tags,
        categories: data.categories,
        updatedAt: new Date(),
        lastModifiedBy: 'current-user'
      })
      
      if (result.success) {
        // Success - redirect to restaurant profile with success message
        router.push(`/admin/restaurants?success=updated&id=${restaurant.id}`)
      } else {
        // Show validation errors
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(err => err.message).join(', ')
          setError(`خطأ في البيانات: ${errorMessages}`)
        } else {
          setError('حدث خطأ غير متوقع أثناء تحديث المطعم')
        }
      }
    } catch (error) {
      console.error('Error updating restaurant:', error)
      setError('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Navigate back to restaurants list
    router.push('/admin/restaurants')
  }

  const handleDelete = async () => {
    if (!restaurant) return

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المطعم "${restaurant.name}"؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع العقود والبيانات المرتبطة بهذا المطعم.`
    )

    if (!confirmed) return

    try {
      const result = await restaurantService.deleteRestaurant(restaurant.id)
      
      if (result.success) {
        router.push('/admin/restaurants?success=deleted')
      } else {
        setError('حدث خطأ أثناء حذف المطعم')
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المطعم...</p>
        </div>
      </div>
    )
  }

  if (notFound || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏪❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المطعم غير موجود</h1>
          <p className="text-gray-600 mb-6">
            المطعم الذي تحاول الوصول إليه غير موجود أو تم حذفه من النظام.
          </p>
          <Button onClick={() => router.push('/admin/restaurants')}>
            العودة لقائمة المطاعم
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200"
              >
                ← رجوع
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">تحرير بيانات المطعم</h1>
                <p className="text-gray-600 mt-1">
                  تحديث معلومات وبيانات "{restaurant.name}"
                </p>
              </div>
            </div>

            {/* Danger Zone - Delete Button */}
            <Button
              variant="outline"
              color="red"
              onClick={handleDelete}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              🗑️ حذف المطعم
            </Button>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{restaurant.name}</h2>
                  <p className="text-sm text-gray-600">{restaurant.legalName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                  restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
                  restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {restaurant.status === 'active' ? 'نشط' :
                   restaurant.status === 'pending' ? 'قيد المراجعة' :
                   restaurant.status === 'inactive' ? 'غير نشط' :
                   restaurant.status === 'suspended' ? 'معلق' :
                   'منتهي'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  آخر تحديث: {new Date(restaurant.updatedAt).toLocaleDateString('ar-SA')}
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
                <h3 className="font-medium text-red-900">خطأ في تحديث المطعم</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Change Log Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">📝 معلومات التحديث</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">تاريخ الإنشاء:</span>
              <div className="font-medium text-blue-900">
                {new Date(restaurant.createdAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
            <div>
              <span className="text-blue-700">آخر تحديث:</span>
              <div className="font-medium text-blue-900">
                {new Date(restaurant.updatedAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
            <div>
              <span className="text-blue-700">عدد الفروع:</span>
              <div className="font-medium text-blue-900">
                {restaurant.branches.length} فرع
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <RestaurantForm
            restaurant={restaurant}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
            mode="edit"
          />
        </div>

        {/* Additional Actions */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">🔧 إجراءات إضافية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => window.open(`/restaurants/${restaurant.id}`, '_blank')}>
              👁️ عرض الملف الشخصي
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/contracts?restaurant=${restaurant.id}`)}>
              📄 عرض العقود المرتبطة
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              🖨️ طباعة البيانات
            </Button>
          </div>
        </div>

        {/* Warning for Deletion */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-medium text-red-900 mb-2">⚠️ تنبيه مهم</h3>
          <p className="text-sm text-red-700">
            حذف المطعم سيؤثر على جميع البيانات المرتبطة به بما في ذلك العقود والطلبات والتقارير.
            تأكد من عمل نسخة احتياطية من البيانات المهمة قبل الحذف.
          </p>
        </div>
      </div>
    </div>
  )
}
