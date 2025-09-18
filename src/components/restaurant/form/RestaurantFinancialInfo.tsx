// Restaurant Financial Information Form Component
// مكون نموذج المعلومات المالية للمطعم

import React from 'react'
import { RestaurantFormData } from '@/lib/restaurant/types'
import { Input } from '@/components/ui/Input'

interface RestaurantFinancialInfoProps {
  data: RestaurantFormData['financial']
  errors: { [key: string]: string }
  onChange: (data: RestaurantFormData['financial']) => void
}

export default function RestaurantFinancialInfo({
  data,
  errors,
  onChange
}: RestaurantFinancialInfoProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          المعلومات المالية والائتمانية
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          أدخل البيانات المالية والمعلومات اللازمة لتقييم الأهلية الائتمانية
        </p>
      </div>

      {/* Registration & Tax Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم السجل التجاري <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
            placeholder="1010123456"
            dir="ltr"
            error={errors['financial.registrationNumber']}
          />
          <p className="mt-1 text-xs text-gray-500">
            رقم السجل التجاري من وزارة التجارة
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الرقم الضريبي <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.taxId}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="300123456789003"
            dir="ltr"
            error={errors['financial.taxId']}
          />
          <p className="mt-1 text-xs text-gray-500">
            الرقم الضريبي من هيئة الزكاة والضريبة
          </p>
        </div>
      </div>

      {/* Capital & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رأس المال <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              value={data.capitalAmount}
              onChange={(e) => handleChange('capitalAmount', parseFloat(e.target.value) || 0)}
              placeholder="100000"
              dir="ltr"
              error={errors['financial.capitalAmount']}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">
                {data.currency === 'SAR' ? 'ر.س' : data.currency}
              </span>
            </div>
          </div>
          {data.capitalAmount > 0 && (
            <p className="mt-1 text-xs text-green-600">
              {formatCurrency(data.capitalAmount, data.currency)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العملة <span className="text-red-500">*</span>
          </label>
          <select
            value={data.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="EUR">يورو (EUR)</option>
          </select>
        </div>
      </div>

      {/* Guarantee & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مبلغ الضمان المطلوب <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              value={data.guaranteeRequired}
              onChange={(e) => handleChange('guaranteeRequired', parseFloat(e.target.value) || 0)}
              placeholder="5000"
              dir="ltr"
              error={errors['financial.guaranteeRequired']}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">
                {data.currency === 'SAR' ? 'ر.س' : data.currency}
              </span>
            </div>
          </div>
          {data.guaranteeRequired > 0 && (
            <p className="mt-1 text-xs text-blue-600">
              {formatCurrency(data.guaranteeRequired, data.currency)}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            الضمان البنكي المطلوب لتغطية تكاليف الطباعة
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            فترة الدفع (بالأيام) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={data.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', parseInt(e.target.value) || 0)}
            placeholder="30"
            dir="ltr"
            error={errors['financial.paymentTerms']}
            min="1"
            max="180"
          />
          <p className="mt-1 text-xs text-gray-500">
            عدد الأيام المسموحة لسداد الفواتير
          </p>
        </div>
      </div>

      {/* Payment Method & Credit Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            طريقة الدفع المفضلة <span className="text-red-500">*</span>
          </label>
          <select
            value={data.preferredPaymentMethod}
            onChange={(e) => handleChange('preferredPaymentMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="check">شيك</option>
            <option value="cash">نقد</option>
            <option value="online">دفع إلكتروني</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التصنيف الائتماني
          </label>
          <select
            value={data.creditRating || ''}
            onChange={(e) => handleChange('creditRating', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">غير محدد</option>
            <option value="A">A - ممتاز (أقل مخاطر)</option>
            <option value="B">B - جيد (مخاطر منخفضة)</option>
            <option value="C">C - متوسط (مخاطر متوسطة)</option>
            <option value="D">D - ضعيف (مخاطر عالية)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            التقييم الائتماني الداخلي (اختياري)
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      {data.capitalAmount > 0 && data.guaranteeRequired > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">ملخص مالي</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">رأس المال:</span>
              <div className="font-semibold text-green-700">
                {formatCurrency(data.capitalAmount, data.currency)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">مبلغ الضمان:</span>
              <div className="font-semibold text-blue-700">
                {formatCurrency(data.guaranteeRequired, data.currency)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">نسبة الضمان:</span>
              <div className="font-semibold text-purple-700">
                {((data.guaranteeRequired / data.capitalAmount) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">💡 معلومات مهمة</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• السجل التجاري يجب أن يكون ساري المفعول</li>
            <li>• الرقم الضريبي مطلوب للفوترة الرسمية</li>
            <li>• مبلغ الضمان يغطي تكاليف الطباعة المقدمة</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-900 mb-2">✅ تذكير</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• جميع المبالغ يتم احتسابها بالعملة المختارة</li>
            <li>• فترة الدفع تؤثر على شروط التعامل</li>
            <li>• التصنيف الائتماني يساعد في تقييم المخاطر</li>
          </ul>
        </div>
      </div>

      {/* Warning for high guarantee ratio */}
      {data.capitalAmount > 0 && data.guaranteeRequired > 0 && 
       (data.guaranteeRequired / data.capitalAmount) > 0.1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 text-xl mr-3">⚠️</div>
            <div>
              <h5 className="font-medium text-yellow-900">تنبيه</h5>
              <p className="text-sm text-yellow-800 mt-1">
                نسبة الضمان مرتفعة ({((data.guaranteeRequired / data.capitalAmount) * 100).toFixed(1)}%) 
                مقارنة برأس المال. يُنصح بمراجعة هذه النسبة مع الإدارة المالية.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
