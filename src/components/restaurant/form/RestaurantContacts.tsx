// Restaurant Contacts Form Component
// مكون نموذج جهات اتصال المطعم

import React from 'react'
import { RestaurantFormData } from '@/lib/restaurant/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface RestaurantContactsProps {
  data: RestaurantFormData['contacts']
  errors: { [key: string]: string }
  onChange: (data: RestaurantFormData['contacts']) => void
}

export default function RestaurantContacts({
  data,
  errors,
  onChange
}: RestaurantContactsProps) {
  const addContact = () => {
    onChange([
      ...data,
      {
        name: '',
        position: '',
        phone: '',
        email: '',
        isPrimary: false,
        isActive: true
      }
    ])
  }

  const removeContact = (index: number) => {
    if (data.length > 1) {
      onChange(data.filter((_, i) => i !== index))
    }
  }

  const updateContact = (index: number, field: string, value: any) => {
    const newContacts = [...data]
    
    // If setting this contact as primary, unset all others
    if (field === 'isPrimary' && value === true) {
      newContacts.forEach((contact, i) => {
        if (i !== index) {
          contact.isPrimary = false
        }
      })
    }
    
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    }
    
    onChange(newContacts)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            جهات الاتصال
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            أضف الأشخاص المخولين للتواصل باسم المطعم
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addContact}
          className="flex items-center gap-2"
        >
          <span>+</span>
          إضافة جهة اتصال
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((contact, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                جهة الاتصال {index + 1}
                {contact.isPrimary && (
                  <span className="ml-2 px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded-full">
                    رئيسي
                  </span>
                )}
              </h4>
              {data.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  color="red"
                  size="sm"
                  onClick={() => removeContact(index)}
                >
                  حذف
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  placeholder="أحمد محمد العلي"
                  error={errors[`contacts.${index}.name`]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصب <span className="text-red-500">*</span>
                </label>
                <Input
                  value={contact.position}
                  onChange={(e) => updateContact(index, 'position', e.target.value)}
                  placeholder="مدير، مالك، مسؤول العمليات..."
                  error={errors[`contacts.${index}.position`]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <Input
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  error={errors[`contacts.${index}.phone`]}
                />
                <p className="mt-1 text-xs text-gray-500">
                  رقم الجوال السعودي
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                  placeholder="ahmed@restaurant.com"
                  dir="ltr"
                  error={errors[`contacts.${index}.email`]}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contact.isPrimary}
                  onChange={(e) => updateContact(index, 'isPrimary', e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="mr-2 text-sm text-gray-700">
                  جهة الاتصال الرئيسية
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={contact.isActive}
                  onChange={(e) => updateContact(index, 'isActive', e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="mr-2 text-sm text-gray-700">
                  نشط
                </span>
              </label>
            </div>

            {contact.isPrimary && (
              <div className="mt-3 p-3 bg-brand-50 border border-brand-200 rounded-lg">
                <p className="text-sm text-brand-800">
                  <strong>ملاحظة:</strong> جهة الاتصال الرئيسية ستكون الشخص الأول الذي نتواصل معه للأمور المهمة والعاجلة.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>لم يتم إضافة أي جهة اتصال بعد</p>
          <Button
            type="button"
            variant="outline"
            onClick={addContact}
            className="mt-2"
          >
            إضافة أول جهة اتصال
          </Button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">معلومات مهمة:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• يجب إضافة جهة اتصال رئيسية واحدة على الأقل</li>
          <li>• يمكنك إضافة عدة جهات اتصال للتواصل مع أشخاص مختلفين</li>
          <li>• جهة الاتصال الرئيسية ستتلقى جميع الإشعارات المهمة</li>
          <li>• يمكن إلغاء تفعيل جهة اتصال دون حذفها</li>
        </ul>
      </div>
    </div>
  )
}
