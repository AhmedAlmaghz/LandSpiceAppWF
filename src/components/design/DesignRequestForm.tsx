'use client'

import React, { useState, useEffect } from 'react'
import { DesignRequest, DesignRequestFormData, DesignType } from '@/lib/design/types'
import { validateDesignRequestForm } from '@/lib/design/validation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface DesignRequestFormProps {
  request?: DesignRequest
  onSubmit: (data: DesignRequestFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function DesignRequestForm({
  request,
  onSubmit,
  onCancel,
  isLoading = false
}: DesignRequestFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<DesignRequestFormData>({
    basic: {
      title: '',
      type: 'logo',
      category: 'branding',
      priority: 'medium',
      description: '',
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    client: {
      restaurantId: '',
      contactPerson: '',
      phone: '',
      email: ''
    },
    requirements: {
      primaryText: '',
      secondaryText: '',
      englishText: '',
      preferredColors: [],
      avoidColors: [],
      styleDirection: '',
      moodKeywords: [],
      inspirationReferences: [],
      fileFormats: ['png', 'pdf'],
      colorMode: 'RGB',
      usageContext: [],
      includeQRCode: false,
      includeContactInfo: true,
      multiLanguage: false,
      accessibilityRequirements: [],
      colorBlindFriendly: false
    },
    culturalPreferences: {
      arabicFont: 'خط النسخ',
      colorScheme: ['#8B4513'],
      includeTraditionalElements: false,
      islamicCompliant: true,
      yemeniCulturalElements: false
    },
    referenceFiles: [],
    notes: '',
    tags: []
  })

  const [errors, setErrors] = useState<any[]>([])

  const steps = [
    { id: 'basic', title: 'المعلومات الأساسية', icon: '📋' },
    { id: 'requirements', title: 'متطلبات التصميم', icon: '🎨' },
    { id: 'cultural', title: 'التفضيلات الثقافية', icon: '🇾🇪' },
    { id: 'review', title: 'المراجعة', icon: '✅' }
  ]

  const yemeniRestaurants = [
    { id: 'rest_001', name: 'مطعم الأصالة اليمنية' },
    { id: 'rest_002', name: 'مطعم الذواقة' },
    { id: 'rest_003', name: 'مطعم التراث اليمني' }
  ]

  const validateCurrentStep = (): boolean => {
    const validation = validateDesignRequestForm(formData)
    if (!validation.success) {
      setErrors(validation.errors || [])
      return false
    }
    setErrors([])
    return true
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      try {
        await onSubmit(formData)
      } catch (error) {
        console.error('Error submitting design request:', error)
      }
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <Input
              label="عنوان المشروع *"
              value={formData.basic.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                basic: { ...prev.basic, title: e.target.value }
              }))}
              placeholder="تصميم هوية بصرية - مطعم الأصالة"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع التصميم *</label>
                <select
                  value={formData.basic.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, type: e.target.value as DesignType }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="logo">شعار</option>
                  <option value="business_card">بطاقة عمل</option>
                  <option value="complete_identity">هوية بصرية كاملة</option>
                  <option value="brochure">بروشور</option>
                  <option value="menu">قائمة طعام</option>
                  <option value="social_media">سوشيال ميديا</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                <select
                  value={formData.basic.priority}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, priority: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المطعم *</label>
              <select
                value={formData.client.restaurantId}
                onChange={(e) => {
                  const restaurant = yemeniRestaurants.find(r => r.id === e.target.value)
                  setFormData(prev => ({
                    ...prev,
                    client: {
                      ...prev.client,
                      restaurantId: e.target.value,
                      restaurantName: restaurant?.name || ''
                    }
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر المطعم</option>
                {yemeniRestaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="جهة الاتصال *"
              value={formData.client.contactPerson}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, contactPerson: e.target.value }
              }))}
              placeholder="محمد أحمد الشامي"
            />

            <Input
              label="رقم الهاتف *"
              value={formData.client.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, phone: e.target.value }
              }))}
              placeholder="+967-1-456789"
            />
          </div>
        )

      case 1: // Requirements
        return (
          <div className="space-y-6">
            <Input
              label="النص الأساسي *"
              value={formData.requirements.primaryText}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                requirements: { ...prev.requirements, primaryText: e.target.value }
              }))}
              placeholder="اسم المطعم بالعربية"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">توجه التصميم *</label>
              <textarea
                value={formData.requirements.styleDirection}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  requirements: { ...prev.requirements, styleDirection: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="تصميم عصري مع لمسة تراثية يمنية، أنيق وبسيط..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="includeContact"
                  checked={formData.requirements.includeContactInfo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requirements: { ...prev.requirements, includeContactInfo: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                />
                <label htmlFor="includeContact" className="text-sm text-gray-700">
                  تضمين معلومات الاتصال
                </label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="multiLang"
                  checked={formData.requirements.multiLanguage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requirements: { ...prev.requirements, multiLanguage: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                />
                <label htmlFor="multiLang" className="text-sm text-gray-700">
                  متعدد اللغات (عربي + إنجليزي)
                </label>
              </div>
            </div>
          </div>
        )

      case 2: // Cultural
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">التفضيلات الثقافية اليمنية</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الخط العربي المفضل</label>
              <select
                value={formData.culturalPreferences.arabicFont}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  culturalPreferences: { ...prev.culturalPreferences, arabicFont: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="خط النسخ">خط النسخ</option>
                <option value="خط الثلث">خط الثلث</option>
                <option value="خط الكوفي">خط الكوفي</option>
                <option value="Dubai">Dubai</option>
                <option value="Cairo">Cairo</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="yemeniElements"
                  checked={formData.culturalPreferences.yemeniCulturalElements}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    culturalPreferences: { ...prev.culturalPreferences, yemeniCulturalElements: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="yemeniElements" className="text-sm text-gray-700">
                  🇾🇪 تضمين عناصر ثقافية يمنية
                </label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="islamicCompliant"
                  checked={formData.culturalPreferences.islamicCompliant}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    culturalPreferences: { ...prev.culturalPreferences, islamicCompliant: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="islamicCompliant" className="text-sm text-gray-700">
                  ☪️ متوافق مع القيم الإسلامية
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="أي ملاحظات أو متطلبات خاصة..."
              />
            </div>
          </div>
        )

      case 3: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">مراجعة طلب التصميم</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">عنوان المشروع:</span>
                  <p className="text-gray-900">{formData.basic.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">نوع التصميم:</span>
                  <p className="text-gray-900">{formData.basic.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">المطعم:</span>
                  <p className="text-gray-900">{yemeniRestaurants.find(r => r.id === formData.client.restaurantId)?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">جهة الاتصال:</span>
                  <p className="text-gray-900">{formData.client.contactPerson}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">النص الأساسي:</span>
                  <p className="text-gray-900">{formData.requirements.primaryText}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">الخط العربي:</span>
                  <p className="text-gray-900">{formData.culturalPreferences.arabicFont}</p>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-medium mb-2">يرجى تصحيح الأخطاء التالية:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-6">
        <h1 className="text-2xl font-bold text-white">
          {request ? 'تحرير طلب التصميم' : 'طلب تصميم جديد'}
        </h1>
        <p className="text-purple-100 mt-1">
          {request ? 'تحديث بيانات طلب التصميم' : 'إنشاء طلب تصميم جديد للمطعم'}
        </p>
      </div>

      {/* Steps Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeStep === index
                  ? 'border-purple-500 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="ml-2">{step.icon}</span>
              {step.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-between">
          <div>
            {activeStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="secondary"
                disabled={isLoading}
              >
                السابق
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3 space-x-reverse">
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={isLoading}
            >
              إلغاء
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={isLoading}
              >
                التالي
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
              >
                {request ? 'تحديث الطلب' : 'إرسال الطلب'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
