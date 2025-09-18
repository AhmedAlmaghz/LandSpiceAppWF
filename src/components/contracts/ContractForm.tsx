'use client'

import React, { useState, useEffect } from 'react'
import { Contract, ContractFormData, ContractTemplate } from '@/lib/contracts/types'
import { validateContractForm } from '@/lib/contracts/validation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ContractFormProps {
  contract?: Contract
  template?: ContractTemplate
  onSubmit: (data: ContractFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ContractForm({
  contract,
  template,
  onSubmit,
  onCancel,
  isLoading = false
}: ContractFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<ContractFormData>({
    basic: {
      title: '',
      type: 'service',
      category: 'general',
      priority: 'medium'
    },
    parties: [],
    timeline: {
      effectiveDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    financials: {
      totalValue: 0,
      currency: 'SAR',
      paymentTerms: {
        method: 'monthly',
        dueDate: 30,
        penaltyRate: 1.5,
        discountRate: 2
      },
      guaranteeRequired: 0,
      guaranteeType: 'none'
    },
    terms: [],
    deliverables: [],
    documents: [],
    metadata: {
      tags: [],
      governingLaw: 'القانون السعودي',
      jurisdiction: 'المحاكم السعودية',
      confidentialityLevel: 'internal'
    }
  })

  const [errors, setErrors] = useState<any[]>([])

  const steps = [
    { id: 'basic', title: 'المعلومات الأساسية', icon: '📋' },
    { id: 'parties', title: 'أطراف العقد', icon: '👥' },
    { id: 'financial', title: 'الأحكام المالية', icon: '💰' },
    { id: 'review', title: 'المراجعة', icon: '✅' }
  ]

  // Initialize form with template or existing contract data
  useEffect(() => {
    if (template) {
      setFormData(prev => ({
        ...prev,
        basic: {
          ...prev.basic,
          title: template.name,
          type: template.type,
          category: template.category
        },
        metadata: {
          ...prev.metadata,
          tags: template.tags
        }
      }))
    }
  }, [template])

  const validateCurrentStep = (): boolean => {
    const validation = validateContractForm(formData)
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
        console.error('Error submitting contract:', error)
      }
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <Input
              label="عنوان العقد *"
              value={formData.basic.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                basic: { ...prev.basic, title: e.target.value }
              }))}
              placeholder="عقد خدمات التصميم"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع العقد *</label>
                <select
                  value={formData.basic.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, type: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="service">خدمات</option>
                  <option value="supply">توريد</option>
                  <option value="partnership">شراكة</option>
                  <option value="licensing">ترخيص</option>
                  <option value="maintenance">صيانة</option>
                  <option value="consulting">استشارات</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة العقد *</label>
                <select
                  value={formData.basic.category}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, category: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="design">تصميم</option>
                  <option value="printing">طباعة</option>
                  <option value="supply_chain">سلسلة التوريد</option>
                  <option value="marketing">تسويق</option>
                  <option value="technology">تقنية</option>
                  <option value="general">عام</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
              <select
                value={formData.basic.priority}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  basic: { ...prev.basic, priority: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
                <option value="urgent">عاجل</option>
              </select>
            </div>
          </div>
        )

      case 1: // Parties
        return (
          <div className="space-y-6">
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">أطراف العقد</h3>
              <p className="text-gray-600 mb-4">سيتم إضافة أطراف العقد تلقائياً حسب نوع العقد</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900">الطرف الأول</h4>
                  <p className="text-sm text-gray-600">شركة لاند سبايس</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900">الطرف الثاني</h4>
                  <p className="text-sm text-gray-600">سيتم تحديده لاحقاً</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Financial
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="إجمالي قيمة العقد *"
                type="number"
                value={formData.financials.totalValue}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financials: { ...prev.financials, totalValue: Number(e.target.value) }
                }))}
                placeholder="50000"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                <select
                  value={formData.financials.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    financials: { ...prev.financials, currency: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ السريان *</label>
                <input
                  type="date"
                  value={formData.timeline.effectiveDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    timeline: { ...prev.timeline, effectiveDate: new Date(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء *</label>
                <input
                  type="date"
                  value={formData.timeline.expiryDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    timeline: { ...prev.timeline, expiryDate: new Date(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="مبلغ الضمان المطلوب"
                type="number"
                value={formData.financials.guaranteeRequired}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financials: { ...prev.financials, guaranteeRequired: Number(e.target.value) }
                }))}
                placeholder="5000"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الضمان</label>
                <select
                  value={formData.financials.guaranteeType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    financials: { ...prev.financials, guaranteeType: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="none">بدون ضمان</option>
                  <option value="bank_guarantee">ضمان بنكي</option>
                  <option value="cash_deposit">إيداع نقدي</option>
                  <option value="insurance">تأمين</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3: // Review
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص العقد</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">عنوان العقد:</span>
                  <p className="text-gray-900">{formData.basic.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">نوع العقد:</span>
                  <p className="text-gray-900">{formData.basic.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">الفئة:</span>
                  <p className="text-gray-900">{formData.basic.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">القيمة الإجمالية:</span>
                  <p className="text-gray-900">{formData.financials.totalValue.toLocaleString()} {formData.financials.currency}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">تاريخ السريان:</span>
                  <p className="text-gray-900">{formData.timeline.effectiveDate.toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">تاريخ الانتهاء:</span>
                  <p className="text-gray-900">{formData.timeline.expiryDate.toLocaleDateString('ar-SA')}</p>
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
          {contract ? 'تحرير العقد' : 'إنشاء عقد جديد'}
        </h1>
        <p className="text-red-100 mt-1">
          {contract ? 'تحديث بيانات العقد' : 'إنشاء عقد جديد في النظام'}
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
                disabled={isLoading}
                loading={isLoading}
              >
                {contract ? 'تحديث العقد' : 'إنشاء العقد'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
