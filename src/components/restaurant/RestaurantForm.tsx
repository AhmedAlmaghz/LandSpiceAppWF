'use client'

import React, { useState, useEffect } from 'react'
import { Restaurant, RestaurantFormData } from '@/lib/restaurant/types'
import { validateRestaurantForm } from '@/lib/restaurant/validation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface RestaurantFormProps {
  restaurant?: Restaurant
  onSubmit: (data: RestaurantFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function RestaurantForm({
  restaurant,
  onSubmit,
  onCancel,
  isLoading = false
}: RestaurantFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<RestaurantFormData>({
    basic: {
      name: '',
      legalName: '',
      type: 'single',
      businessInfo: {
        establishedDate: new Date(),
        businessType: 'restaurant',
        description: '',
        website: '',
        socialMedia: {}
      }
    },
    contacts: [],
    branches: [],
    financial: {
      registrationNumber: '',
      taxId: '',
      capitalAmount: 0,
      currency: 'SAR',
      guaranteeRequired: 0,
      paymentTerms: 30,
      preferredPaymentMethod: 'bank_transfer'
    },
    preferences: {
      cuisineType: [],
      servingCapacity: { dineIn: 0, takeaway: 0, delivery: 0 },
      operatingHours: {
        sunday: { open: '11:00', close: '23:00', isOpen: true },
        monday: { open: '11:00', close: '23:00', isOpen: true },
        tuesday: { open: '11:00', close: '23:00', isOpen: true },
        wednesday: { open: '11:00', close: '23:00', isOpen: true },
        thursday: { open: '11:00', close: '23:00', isOpen: true },
        friday: { open: '14:00', close: '23:00', isOpen: true },
        saturday: { open: '11:00', close: '23:00', isOpen: true }
      },
      specialRequirements: [],
      marketingPreferences: {
        allowMarketing: true,
        preferredChannels: [],
        targetAudience: []
      }
    },
    documents: [],
    tags: [],
    categories: []
  })

  const [errors, setErrors] = useState<any[]>([])

  const steps = [
    { id: 'basic', title: 'المعلومات الأساسية', icon: '🏢' },
    { id: 'contacts', title: 'جهات الاتصال', icon: '👥' },
    { id: 'branches', title: 'الفروع', icon: '📍' },
    { id: 'financial', title: 'المعلومات المالية', icon: '💰' },
    { id: 'review', title: 'مراجعة', icon: '✅' }
  ]

  // Initialize form with existing restaurant data
  useEffect(() => {
    if (restaurant) {
      setFormData({
        basic: {
          name: restaurant.name,
          legalName: restaurant.legalName,
          type: restaurant.type,
          businessInfo: restaurant.businessInfo
        },
        contacts: restaurant.contacts.map(({ id, ...contact }) => contact),
        branches: restaurant.branches.map(({ id, ...branch }) => branch),
        financial: restaurant.financialInfo,
        preferences: restaurant.preferences,
        documents: [],
        tags: restaurant.tags,
        categories: restaurant.categories
      })
    }
  }, [restaurant])

  const validateCurrentStep = (): boolean => {
    const validation = validateRestaurantForm(formData)
    if (!validation.success) {
      setErrors(validation.errors || [])
      return false
    }
    setErrors([])
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep() && activeStep < steps.length - 1) {
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
        console.error('Error submitting form:', error)
      }
    }
  }

  const addContact = (contact: any) => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, contact]
    }))
  }

  const addBranch = (branch: any) => {
    setFormData(prev => ({
      ...prev,
      branches: [...prev.branches, branch]
    }))
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="اسم المطعم *"
                value={formData.basic.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  basic: { ...prev.basic, name: e.target.value }
                }))}
                error={errors.find(e => e.field === 'name')?.message}
                placeholder="مطعم الذواقة"
              />
              <Input
                label="الاسم القانوني *"
                value={formData.basic.legalName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  basic: { ...prev.basic, legalName: e.target.value }
                }))}
                error={errors.find(e => e.field === 'legalName')?.message}
                placeholder="شركة الذواقة للمأكولات المحدودة"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المطعم *</label>
                <select
                  value={formData.basic.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, type: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="single">مطعم واحد</option>
                  <option value="chain">سلسلة مطاعم</option>
                  <option value="franchise">فرنشايز</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط *</label>
                <select
                  value={formData.basic.businessInfo.businessType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: {
                      ...prev.basic,
                      businessInfo: {
                        ...prev.basic.businessInfo,
                        businessType: e.target.value as any
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="restaurant">مطعم</option>
                  <option value="cafe">مقهى</option>
                  <option value="fast_food">وجبات سريعة</option>
                  <option value="catering">خدمات طعام</option>
                  <option value="food_truck">عربة طعام</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف النشاط *</label>
              <textarea
                value={formData.basic.businessInfo.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  basic: {
                    ...prev.basic,
                    businessInfo: {
                      ...prev.basic.businessInfo,
                      description: e.target.value
                    }
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="وصف تفصيلي عن نشاط المطعم والخدمات المقدمة..."
              />
            </div>
          </div>
        )

      case 1: // Contacts
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">إضافة جهة اتصال</h3>
              <p className="text-blue-700 text-sm mb-4">يجب إضافة جهة اتصال واحدة على الأقل</p>
              <Button
                onClick={() => addContact({
                  name: 'أحمد محمد',
                  position: 'مدير المطعم',
                  phone: '+966501234567',
                  email: 'ahmed@restaurant.com',
                  isPrimary: true,
                  isActive: true
                })}
                variant="secondary"
              >
                إضافة جهة اتصال تجريبية
              </Button>
            </div>

            {formData.contacts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  جهات الاتصال ({formData.contacts.length})
                </h3>
                <div className="space-y-3">
                  {formData.contacts.map((contact, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        {contact.isPrimary && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            رئيسي
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{contact.position}</p>
                      <p className="text-gray-600 text-sm">{contact.phone}</p>
                      <p className="text-gray-600 text-sm">{contact.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 2: // Branches
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4">إضافة فرع</h3>
              <p className="text-green-700 text-sm mb-4">يجب إضافة فرع واحد على الأقل</p>
              <Button
                onClick={() => addBranch({
                  name: 'الفرع الرئيسي',
                  address: {
                    street: 'شارع الملك عبدالعزيز',
                    city: 'جدة',
                    region: 'مكة المكرمة',
                    postalCode: '23432',
                    country: 'السعودية'
                  },
                  phone: '+966126789012',
                  manager: 'سالم أحمد',
                  isActive: true,
                  openingDate: new Date()
                })}
                variant="secondary"
              >
                إضافة فرع تجريبي
              </Button>
            </div>

            {formData.branches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  الفروع ({formData.branches.length})
                </h3>
                <div className="space-y-4">
                  {formData.branches.map((branch, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{branch.name}</h4>
                      <p className="text-gray-600 text-sm mb-1">
                        {branch.address.street}, {branch.address.city}
                      </p>
                      <p className="text-gray-600 text-sm mb-1">المدير: {branch.manager}</p>
                      <p className="text-gray-600 text-sm">الهاتف: {branch.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Financial
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="رقم السجل التجاري *"
                value={formData.financial.registrationNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financial: { ...prev.financial, registrationNumber: e.target.value }
                }))}
                placeholder="1234567890"
              />
              <Input
                label="الرقم الضريبي *"
                value={formData.financial.taxId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financial: { ...prev.financial, taxId: e.target.value }
                }))}
                placeholder="987654321"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="رأس المال *"
                type="number"
                value={formData.financial.capitalAmount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financial: { ...prev.financial, capitalAmount: Number(e.target.value) }
                }))}
                placeholder="5000000"
              />
              <Input
                label="الضمان المطلوب *"
                type="number"
                value={formData.financial.guaranteeRequired}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financial: { ...prev.financial, guaranteeRequired: Number(e.target.value) }
                }))}
                placeholder="100000"
              />
            </div>
          </div>
        )

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص المطعم</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">اسم المطعم:</span>
                  <p className="text-gray-900">{formData.basic.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">الاسم القانوني:</span>
                  <p className="text-gray-900">{formData.basic.legalName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">نوع المطعم:</span>
                  <p className="text-gray-900">{formData.basic.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">جهات الاتصال:</span>
                  <p className="text-gray-900">{formData.contacts.length}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">الفروع:</span>
                  <p className="text-gray-900">{formData.branches.length}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">رأس المال:</span>
                  <p className="text-gray-900">{formData.financial.capitalAmount.toLocaleString()} {formData.financial.currency}</p>
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
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6">
        <h1 className="text-2xl font-bold text-white">
          {restaurant ? 'تحرير المطعم' : 'إضافة مطعم جديد'}
        </h1>
        <p className="text-red-100 mt-1">
          {restaurant ? 'تحديث بيانات المطعم' : 'إنشاء ملف مطعم جديد في النظام'}
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
                  ? 'border-red-500 text-red-600 bg-white'
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
                disabled={isLoading || formData.contacts.length === 0 || formData.branches.length === 0}
                loading={isLoading}
              >
                {restaurant ? 'تحديث المطعم' : 'إنشاء المطعم'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
