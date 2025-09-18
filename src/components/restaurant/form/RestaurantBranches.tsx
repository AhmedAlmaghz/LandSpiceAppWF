// Restaurant Branches Form Component
// مكون نموذج فروع المطعم

import React from 'react'
import { RestaurantFormData } from '@/lib/restaurant/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface RestaurantBranchesProps {
  data: RestaurantFormData['branches']
  errors: { [key: string]: string }
  onChange: (data: RestaurantFormData['branches']) => void
}

export default function RestaurantBranches({
  data,
  errors,
  onChange
}: RestaurantBranchesProps) {
  const addBranch = () => {
    onChange([
      ...data,
      {
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
      }
    ])
  }

  const removeBranch = (index: number) => {
    if (data.length > 1) {
      onChange(data.filter((_, i) => i !== index))
    }
  }

  const updateBranch = (index: number, field: string, value: any) => {
    const newBranches = [...data]
    
    if (field.includes('address.')) {
      const addressField = field.split('.')[1]
      newBranches[index] = {
        ...newBranches[index],
        address: {
          ...newBranches[index].address,
          [addressField]: value
        }
      }
    } else {
      newBranches[index] = {
        ...newBranches[index],
        [field]: value
      }
    }
    
    onChange(newBranches)
  }

  const saudiCities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
    'تبوك', 'بريدة', 'خميس مشيط', 'حائل', 'نجران', 'الطائف', 'الجبيل', 'ينبع',
    'أبها', 'عرعر', 'سكاكا', 'القطيف', 'الباحة', 'الزلفي', 'رفحاء'
  ]

  const saudiRegions = [
    'منطقة الرياض', 'المنطقة الشرقية', 'منطقة مكة المكرمة', 'المنطقة المدينة المنورة',
    'منطقة القصيم', 'منطقة عسير', 'منطقة تبوك', 'منطقة حائل', 'المنطقة الحدود الشمالية',
    'منطقة جازان', 'منطقة نجران', 'منطقة الباحة', 'منطقة الجوف'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            فروع المطعم
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            أضف معلومات فروع المطعم والمواقع الجغرافية
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addBranch}
          className="flex items-center gap-2"
        >
          <span>+</span>
          إضافة فرع
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((branch, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                فرع {index + 1}
                {branch.name && ` - ${branch.name}`}
              </h4>
              {data.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  color="red"
                  size="sm"
                  onClick={() => removeBranch(index)}
                >
                  حذف
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Basic Branch Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الفرع <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={branch.name}
                    onChange={(e) => updateBranch(index, 'name', e.target.value)}
                    placeholder="الفرع الرئيسي، فرع الملز، فرع الشارع التجاري..."
                    error={errors[`branches.${index}.name`]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مدير الفرع <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={branch.manager}
                    onChange={(e) => updateBranch(index, 'manager', e.target.value)}
                    placeholder="اسم مدير الفرع"
                    error={errors[`branches.${index}.manager`]}
                  />
                </div>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branch.address.city}
                    onChange={(e) => updateBranch(index, 'address.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">اختر المدينة</option>
                    {saudiCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors[`branches.${index}.address.city`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`branches.${index}.address.city`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنطقة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branch.address.region}
                    onChange={(e) => updateBranch(index, 'address.region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">اختر المنطقة</option>
                    {saudiRegions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  {errors[`branches.${index}.address.region`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`branches.${index}.address.region`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرمز البريدي
                  </label>
                  <Input
                    value={branch.address.postalCode || ''}
                    onChange={(e) => updateBranch(index, 'address.postalCode', e.target.value)}
                    placeholder="12345"
                    dir="ltr"
                    error={errors[`branches.${index}.address.postalCode`]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان التفصيلي <span className="text-red-500">*</span>
                </label>
                <Input
                  value={branch.address.street}
                  onChange={(e) => updateBranch(index, 'address.street', e.target.value)}
                  placeholder="الشارع، الحي، رقم المبنى، وصف تفصيلي للموقع..."
                  error={errors[`branches.${index}.address.street`]}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هاتف الفرع <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={branch.phone}
                    onChange={(e) => updateBranch(index, 'phone', e.target.value)}
                    placeholder="05xxxxxxxx أو 01xxxxxxx"
                    dir="ltr"
                    error={errors[`branches.${index}.phone`]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني للفرع
                  </label>
                  <Input
                    type="email"
                    value={branch.email || ''}
                    onChange={(e) => updateBranch(index, 'email', e.target.value)}
                    placeholder="branch@restaurant.com"
                    dir="ltr"
                    error={errors[`branches.${index}.email`]}
                  />
                  <p className="mt-1 text-xs text-gray-500">اختياري</p>
                </div>
              </div>

              {/* Opening Date & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الافتتاح <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={branch.openingDate.toISOString().split('T')[0]}
                    onChange={(e) => updateBranch(index, 'openingDate', new Date(e.target.value))}
                    error={errors[`branches.${index}.openingDate`]}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={branch.isActive}
                      onChange={(e) => updateBranch(index, 'isActive', e.target.checked)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="mr-2 text-sm text-gray-700">
                      فرع نشط وقيد التشغيل
                    </span>
                  </label>
                </div>
              </div>

              {index === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>ملاحظة:</strong> الفرع الأول يعتبر الفرع الرئيسي ومقر المطعم الأساسي.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>لم يتم إضافة أي فرع بعد</p>
          <Button
            type="button"
            variant="outline"
            onClick={addBranch}
            className="mt-2"
          >
            إضافة الفرع الرئيسي
          </Button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">معلومات مهمة:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• يجب إضافة فرع رئيسي واحد على الأقل</li>
          <li>• الفرع الرئيسي هو مقر المطعم الأساسي</li>
          <li>• يمكن إضافة عدة فروع للمطاعم متعددة المواقع</li>
          <li>• تأكد من صحة العناوين لضمان سهولة التوصيل</li>
        </ul>
      </div>
    </div>
  )
}
