// Restaurant Form - Main Component
// النموذج الرئيسي لإدارة بيانات المطعم

'use client'

import React, { useState } from 'react'
import { Restaurant, RestaurantFormData } from '@/lib/restaurant/types'
import { validateRestaurantForm } from '@/lib/restaurant/validation'
import { Button } from '@/components/ui/Button'
import RestaurantBasicInfo from './form/RestaurantBasicInfo'
import RestaurantContacts from './form/RestaurantContacts'
import RestaurantBranches from './form/RestaurantBranches'
import RestaurantFinancialInfo from './form/RestaurantFinancialInfo'

interface RestaurantFormProps {
  restaurant?: Restaurant
  onSubmit: (data: RestaurantFormData) => void
  onCancel: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
}

interface FormErrors {
  [key: string]: string
}

export default function RestaurantForm({
  restaurant,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}: RestaurantFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<RestaurantFormData>(() => {
    // Initialize form data based on restaurant or default values
    if (restaurant) {
      return {
        basic: {
          name: restaurant.name,
          legalName: restaurant.legalName,
          type: restaurant.type,
          businessInfo: restaurant.businessInfo
        },
        contacts: restaurant.contacts.map(contact => ({
          name: contact.name,
          position: contact.position,
          phone: contact.phone,
          email: contact.email,
          isPrimary: contact.isPrimary,
          isActive: contact.isActive
        })),
        branches: restaurant.branches.map(branch => ({
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          email: branch.email || '',
          manager: branch.manager,
          isActive: branch.isActive,
          openingDate: branch.openingDate
        })),
        financial: restaurant.financialInfo,
        preferences: restaurant.preferences,
        documents: [],
        tags: restaurant.tags,
        categories: restaurant.categories
      }
    }

    // Default form data for new restaurant
    return {
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
      contacts: [{
        name: '',
        position: '',
        phone: '',
        email: '',
        isPrimary: true,
        isActive: true
      }],
      branches: [{
        name: '',
        address: {
          street: '',
          city: '',
          region: '',
          country: 'السعودية'
        },
        phone: '',
        email: '',
        manager: '',
        isActive: true,
        openingDate: new Date()
      }],
      financial: {
        registrationNumber: '',
        taxId: '',
        capitalAmount: 0,
        currency: 'SAR',
        guaranteeRequired: 5000,
        paymentTerms: 30,
        preferredPaymentMethod: 'bank_transfer'
      },
      preferences: {
        cuisineType: [],
        servingCapacity: {
          dineIn: 0,
          takeaway: 0,
          delivery: 0
        },
        operatingHours: {},
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
    }
  })

  const steps = [
    { id: 1, title: 'المعلومات الأساسية', icon: '🏢' },
    { id: 2, title: 'جهات الاتصال', icon: '👥' },
    { id: 3, title: 'الفروع', icon: '📍' },
    { id: 4, title: 'المعلومات المالية', icon: '💰' }
  ]

  const validateCurrentStep = () => {
    const validation = validateRestaurantForm(formData)
    if (!validation.success) {
      const stepErrors: FormErrors = {}
      validation.errors?.forEach(error => {
        stepErrors[error.field] = error.message
      })
      setErrors(stepErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData)
    }
  }

  const updateFormData = (section: keyof RestaurantFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RestaurantBasicInfo
            data={formData.basic}
            errors={errors}
            onChange={(data) => updateFormData('basic', data)}
          />
        )
      case 2:
        return (
          <RestaurantContacts
            data={formData.contacts}
            errors={errors}
            onChange={(data) => updateFormData('contacts', data)}
          />
        )
      case 3:
        return (
          <RestaurantBranches
            data={formData.branches}
            errors={errors}
            onChange={(data) => updateFormData('branches', data)}
          />
        )
      case 4:
        return (
          <RestaurantFinancialInfo
            data={formData.financial}
            errors={errors}
            onChange={(data) => updateFormData('financial', data)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                currentStep === step.id
                  ? 'text-brand-600 font-semibold'
                  : currentStep > step.id
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                currentStep === step.id
                  ? 'bg-brand-600 text-white'
                  : currentStep > step.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <div className="text-sm">{step.title}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
            >
              السابق
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            إلغاء
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
            >
              التالي
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              loading={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {mode === 'create' ? 'إنشاء المطعم' : 'حفظ التغييرات'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
