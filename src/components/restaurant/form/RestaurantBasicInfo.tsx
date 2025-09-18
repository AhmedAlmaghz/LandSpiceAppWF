// Restaurant Basic Information Form Component
// مكون نموذج المعلومات الأساسية للمطعم

import React from 'react'
import { RestaurantFormData } from '@/lib/restaurant/types'
import { Input } from '@/components/ui/Input'

interface RestaurantBasicInfoProps {
  data: RestaurantFormData['basic']
  errors: { [key: string]: string }
  onChange: (data: RestaurantFormData['basic']) => void
}

export default function RestaurantBasicInfo({
  data,
  errors,
  onChange
}: RestaurantBasicInfoProps) {
  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      onChange({
        ...data,
        [parent]: {
          ...(data as any)[parent],
          [child]: value
        }
      })
    } else {
      onChange({
        ...data,
        [field]: value
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          المعلومات الأساسية للمطعم
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          أدخل المعلومات الأساسية للمطعم والبيانات التجارية المطلوبة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المطعم <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="اسم المطعم التجاري"
            error={errors['basic.name']}
          />
          <p className="mt-1 text-xs text-gray-500">
            الاسم التجاري الذي سيظهر للعملاء
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم القانوني <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.legalName}
            onChange={(e) => handleChange('legalName', e.target.value)}
            placeholder="الاسم القانوني المسجل"
            error={errors['basic.legalName']}
          />
          <p className="mt-1 text-xs text-gray-500">
            الاسم المسجل في السجل التجاري
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع المطعم <span className="text-red-500">*</span>
          </label>
          <select
            value={data.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="single">مطعم واحد</option>
            <option value="chain">سلسلة مطاعم</option>
            <option value="franchise">امتياز تجاري</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            هيكل ملكية المطعم
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع النشاط <span className="text-red-500">*</span>
          </label>
          <select
            value={data.businessInfo.businessType}
            onChange={(e) => handleChange('businessInfo.businessType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="restaurant">مطعم</option>
            <option value="cafe">مقهى</option>
            <option value="fast_food">وجبات سريعة</option>
            <option value="catering">تقديم طعام</option>
            <option value="food_truck">عربة طعام</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            نوع الخدمة المقدمة
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          وصف المطعم <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.businessInfo.description}
          onChange={(e) => handleChange('businessInfo.description', e.target.value)}
          placeholder="وصف مختصر عن المطعم ونوعية الطعام المقدم..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
        />
        {errors['basic.businessInfo.description'] && (
          <p className="mt-1 text-sm text-red-600">{errors['basic.businessInfo.description']}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          وصف شامل يساعد في فهم طبيعة المطعم وخدماته
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ التأسيس <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={data.businessInfo.establishedDate.toISOString().split('T')[0]}
            onChange={(e) => handleChange('businessInfo.establishedDate', new Date(e.target.value))}
            error={errors['basic.businessInfo.establishedDate']}
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="mt-1 text-xs text-gray-500">
            تاريخ بداية النشاط التجاري
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            موقع الإنترنت
          </label>
          <Input
            value={data.businessInfo.website || ''}
            onChange={(e) => handleChange('businessInfo.website', e.target.value || undefined)}
            placeholder="https://example.com"
            error={errors['basic.businessInfo.website']}
            dir="ltr"
          />
          <p className="mt-1 text-xs text-gray-500">
            موقع المطعم الإلكتروني (اختياري)
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">وسائل التواصل الاجتماعي</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <Input
              value={data.businessInfo.socialMedia?.instagram || ''}
              onChange={(e) => handleChange('businessInfo.socialMedia.instagram', e.target.value || undefined)}
              placeholder="https://instagram.com/username"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter/X
            </label>
            <Input
              value={data.businessInfo.socialMedia?.twitter || ''}
              onChange={(e) => handleChange('businessInfo.socialMedia.twitter', e.target.value || undefined)}
              placeholder="https://twitter.com/username"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <Input
              value={data.businessInfo.socialMedia?.facebook || ''}
              onChange={(e) => handleChange('businessInfo.socialMedia.facebook', e.target.value || undefined)}
              placeholder="https://facebook.com/pagename"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok
            </label>
            <Input
              value={data.businessInfo.socialMedia?.tiktok || ''}
              onChange={(e) => handleChange('businessInfo.socialMedia.tiktok', e.target.value || undefined)}
              placeholder="https://tiktok.com/@username"
              dir="ltr"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          روابط حسابات وسائل التواصل الاجتماعي (اختياري)
        </p>
      </div>
    </div>
  )
}
