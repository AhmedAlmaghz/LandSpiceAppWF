'use client'

import React, { useState, useEffect } from 'react'
import { BankGuarantee, GuaranteeFormData, BankInfo } from '@/lib/bank-guarantees/types'
import { validateGuaranteeForm } from '@/lib/bank-guarantees/validation'
import { bankGuaranteeService } from '@/lib/bank-guarantees/guarantee-service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface BankGuaranteeFormProps {
  guarantee?: BankGuarantee
  onSubmit: (data: GuaranteeFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function BankGuaranteeForm({
  guarantee,
  onSubmit,
  onCancel,
  isLoading = false
}: BankGuaranteeFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [banks, setBanks] = useState<BankInfo[]>([])
  const [formData, setFormData] = useState<GuaranteeFormData>({
    basic: {
      type: 'performance',
      title: '',
      description: '',
      priority: 'medium',
      amount: 0,
      currency: 'USD'
    },
    parties: {
      applicant: {
        type: 'restaurant',
        name: '',
        legalName: '',
        address: {
          street: '',
          district: '',
          city: '',
          governorate: 'صنعاء',
          country: 'اليمن'
        },
        contact: {
          primaryContact: '',
          position: '',
          phone: '',
          email: ''
        }
      },
      beneficiary: {
        type: 'landspice',
        name: 'شركة لاند سبايس اليمنية',
        legalName: 'شركة لاند سبايس للتجارة والتسويق المحدودة',
        address: {
          street: 'شارع الحديدة',
          district: 'الصافية',
          city: 'صنعاء',
          governorate: 'صنعاء',
          country: 'اليمن'
        },
        contact: {
          primaryContact: 'علي سالم العبدلي',
          position: 'مدير المبيعات',
          phone: '+967-1-789012',
          email: 'sales@landspice.ye'
        }
      }
    },
    timeline: {
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isRenewable: true,
      renewalNoticeDays: 30,
      autoRenewal: false
    },
    bank: {
      bankId: '',
      requestedBy: '',
      urgentProcessing: false
    },
    documents: [],
    relatedEntities: {},
    tags: []
  })

  const [errors, setErrors] = useState<any[]>([])

  const steps = [
    { id: 'basic', title: 'المعلومات الأساسية', icon: '📋' },
    { id: 'parties', title: 'بيانات الأطراف', icon: '🏢' },
    { id: 'bank', title: 'اختيار البنك', icon: '🏦' },
    { id: 'review', title: 'المراجعة', icon: '✅' }
  ]

  const yemeniGovernorates = [
    'صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حجة', 'صعدة'
  ]

  useEffect(() => {
    const loadBanks = async () => {
      const availableBanks = bankGuaranteeService.getBanks()
      setBanks(availableBanks)
      
      if (availableBanks.length > 0 && !formData.bank.bankId) {
        setFormData(prev => ({
          ...prev,
          bank: { ...prev.bank, bankId: availableBanks[0].id }
        }))
      }
    }
    
    loadBanks()
  }, [])

  const validateCurrentStep = (): boolean => {
    const validation = validateGuaranteeForm(formData)
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
        console.error('Error submitting guarantee:', error)
      }
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <Input
              label="عنوان الضمانة *"
              value={formData.basic.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                basic: { ...prev.basic, title: e.target.value }
              }))}
              placeholder="ضمان حسن تنفيذ عقد التصميم"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الضمانة *</label>
                <select
                  value={formData.basic.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, type: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="performance">ضمان حسن التنفيذ</option>
                  <option value="advance_payment">ضمان دفع مقدم</option>
                  <option value="maintenance">ضمان صيانة</option>
                  <option value="bid_bond">ضمان دخول مناقصة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                <select
                  value={formData.basic.currency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basic: { ...prev.basic, currency: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="YER">ريال يمني</option>
                  <option value="USD">دولار أمريكي</option>
                  <option value="SAR">ريال سعودي</option>
                </select>
              </div>
            </div>

            <Input
              label="قيمة الضمانة *"
              type="number"
              value={formData.basic.amount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                basic: { ...prev.basic, amount: Number(e.target.value) }
              }))}
              placeholder="50000"
            />
          </div>
        )

      case 1: // Parties
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">بيانات مقدم الطلب</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="اسم المؤسسة *"
                value={formData.parties.applicant.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parties: {
                    ...prev.parties,
                    applicant: { ...prev.parties.applicant, name: e.target.value }
                  }
                }))}
                placeholder="مطعم الذواقة اليمني"
              />

              <Input
                label="الاسم القانوني *"
                value={formData.parties.applicant.legalName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parties: {
                    ...prev.parties,
                    applicant: { ...prev.parties.applicant, legalName: e.target.value }
                  }
                }))}
                placeholder="شركة الذواقة للمطاعم المحدودة"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="جهة الاتصال"
                value={formData.parties.applicant.contact.primaryContact}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parties: {
                    ...prev.parties,
                    applicant: {
                      ...prev.parties.applicant,
                      contact: { ...prev.parties.applicant.contact, primaryContact: e.target.value }
                    }
                  }
                }))}
                placeholder="محمد أحمد الشامي"
              />

              <Input
                label="رقم الهاتف"
                value={formData.parties.applicant.contact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parties: {
                    ...prev.parties,
                    applicant: {
                      ...prev.parties.applicant,
                      contact: { ...prev.parties.applicant.contact, phone: e.target.value }
                    }
                  }
                }))}
                placeholder="+967-1-456789"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="المدينة"
                value={formData.parties.applicant.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parties: {
                    ...prev.parties,
                    applicant: {
                      ...prev.parties.applicant,
                      address: { ...prev.parties.applicant.address, city: e.target.value }
                    }
                  }
                }))}
                placeholder="صنعاء"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة</label>
                <select
                  value={formData.parties.applicant.address.governorate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parties: {
                      ...prev.parties,
                      applicant: {
                        ...prev.parties.applicant,
                        address: { ...prev.parties.applicant.address, governorate: e.target.value }
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {yemeniGovernorates.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 2: // Bank
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">اختيار البنك</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البنك *</label>
              <select
                value={formData.bank.bankId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bank: { ...prev.bank, bankId: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر البنك</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} - {bank.branchName}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="مقدم الطلب *"
              value={formData.bank.requestedBy}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bank: { ...prev.bank, requestedBy: e.target.value }
              }))}
              placeholder="علي سالم العبدلي"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ انتهاء الضمانة *</label>
              <input
                type="date"
                value={formData.timeline.expiryDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, expiryDate: new Date(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )

      case 3: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">مراجعة طلب الضمانة</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">عنوان الضمانة:</span>
                  <p className="text-gray-900">{formData.basic.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">نوع الضمانة:</span>
                  <p className="text-gray-900">{formData.basic.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">قيمة الضمانة:</span>
                  <p className="text-gray-900">{formData.basic.amount.toLocaleString()} {formData.basic.currency}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">مقدم الطلب:</span>
                  <p className="text-gray-900">{formData.parties.applicant.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">البنك:</span>
                  <p className="text-gray-900">{banks.find(b => b.id === formData.bank.bankId)?.name}</p>
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6">
        <h1 className="text-2xl font-bold text-white">
          {guarantee ? 'تحرير طلب الضمانة' : 'طلب ضمانة بنكية جديدة'}
        </h1>
        <p className="text-green-100 mt-1">
          {guarantee ? 'تحديث بيانات الضمانة' : 'تقديم طلب ضمانة بنكية للبنك'}
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
                  ? 'border-green-500 text-green-600 bg-white'
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
                {guarantee ? 'تحديث الطلب' : 'تقديم الطلب'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
