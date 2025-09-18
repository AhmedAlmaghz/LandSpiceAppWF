// Restaurant Profile Component
// مكون الملف الشخصي المفصل للمطعم

'use client'

import React, { useState } from 'react'
import { Restaurant } from '@/lib/restaurant/types'
import { Button } from '@/components/ui/Button'

interface RestaurantProfileProps {
  restaurant: Restaurant
  onEdit?: () => void
  onClose?: () => void
  showActions?: boolean
}

export default function RestaurantProfile({
  restaurant,
  onEdit,
  onClose,
  showActions = true
}: RestaurantProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'branches' | 'financial' | 'history'>('overview')

  const getStatusColor = (status: Restaurant['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Restaurant['status']) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'pending': return 'قيد المراجعة'
      case 'suspended': return 'معلق'
      case 'terminated': return 'منتهي'
      default: return 'غير معروف'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'contacts', label: 'جهات الاتصال', icon: '👥' },
    { id: 'branches', label: 'الفروع', icon: '📍' },
    { id: 'financial', label: 'المعلومات المالية', icon: '💰' },
    { id: 'history', label: 'السجل التجاري', icon: '📈' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(restaurant.status)}`}>
                {getStatusText(restaurant.status)}
              </span>
            </div>
            <p className="text-gray-600 mb-1">{restaurant.legalName}</p>
            <p className="text-sm text-gray-500">
              {restaurant.businessInfo.businessType === 'restaurant' ? 'مطعم' :
               restaurant.businessInfo.businessType === 'cafe' ? 'مقهى' :
               restaurant.businessInfo.businessType === 'fast_food' ? 'وجبات سريعة' :
               restaurant.businessInfo.businessType === 'catering' ? 'تقديم طعام' :
               restaurant.businessInfo.businessType === 'food_truck' ? 'عربة طعام' : 'غير محدد'} •{' '}
              {restaurant.type === 'single' ? 'مطعم واحد' :
               restaurant.type === 'chain' ? 'سلسلة مطاعم' :
               restaurant.type === 'franchise' ? 'امتياز تجاري' : 'غير محدد'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {showActions && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                تعديل
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-brand-600">{restaurant.branches.length}</div>
            <div className="text-sm text-gray-600">فرع</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{restaurant.relationshipHistory.totalOrders}</div>
            <div className="text-sm text-gray-600">طلب</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{restaurant.relationshipHistory.contractsCount}</div>
            <div className="text-sm text-gray-600">عقد</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(restaurant.relationshipHistory.totalRevenue, restaurant.financialInfo.currency)}
            </div>
            <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" dir="ltr">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">معلومات أساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاريخ التأسيس</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(restaurant.businessInfo.establishedDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاريخ التسجيل في النظام</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(restaurant.createdAt)}</p>
                </div>
                {restaurant.businessInfo.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">الموقع الإلكتروني</label>
                    <a href={restaurant.businessInfo.website} target="_blank" rel="noopener noreferrer" 
                       className="mt-1 text-sm text-brand-600 hover:text-brand-800">
                      {restaurant.businessInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">الوصف</h3>
              <p className="text-gray-700 leading-relaxed">{restaurant.businessInfo.description}</p>
            </div>

            {restaurant.preferences.cuisineType.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">أنواع المطبخ</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.preferences.cuisineType.map((cuisine, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {restaurant.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">العلامات</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">جهات الاتصال</h3>
            {restaurant.contacts.map((contact, index) => (
              <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{contact.name}</h4>
                  <div className="flex gap-2">
                    {contact.isPrimary && (
                      <span className="px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded-full">
                        رئيسي
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      contact.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{contact.position}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">الهاتف: </span>
                    <a href={`tel:${contact.phone}`} className="text-brand-600 hover:text-brand-800">
                      {contact.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-500">البريد: </span>
                    <a href={`mailto:${contact.email}`} className="text-brand-600 hover:text-brand-800">
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">فروع المطعم</h3>
            {restaurant.branches.map((branch, index) => (
              <div key={branch.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{branch.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    branch.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {branch.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>العنوان:</strong> {branch.address.street}، {branch.address.city}، {branch.address.region}</p>
                  <p><strong>المدير:</strong> {branch.manager}</p>
                  <p><strong>الهاتف:</strong> {branch.phone}</p>
                  <p><strong>تاريخ الافتتاح:</strong> {formatDate(branch.openingDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">المعلومات المالية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">معلومات التسجيل</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">السجل التجاري: </span>
                    <span className="font-medium">{restaurant.financialInfo.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">الرقم الضريبي: </span>
                    <span className="font-medium">{restaurant.financialInfo.taxId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">رأس المال: </span>
                    <span className="font-medium">
                      {formatCurrency(restaurant.financialInfo.capitalAmount, restaurant.financialInfo.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">شروط التعامل</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">مبلغ الضمان: </span>
                    <span className="font-medium">
                      {formatCurrency(restaurant.financialInfo.guaranteeRequired, restaurant.financialInfo.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">فترة الدفع: </span>
                    <span className="font-medium">{restaurant.financialInfo.paymentTerms} يوم</span>
                  </div>
                  <div>
                    <span className="text-gray-500">طريقة الدفع المفضلة: </span>
                    <span className="font-medium">
                      {restaurant.financialInfo.preferredPaymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                       restaurant.financialInfo.preferredPaymentMethod === 'check' ? 'شيك' :
                       restaurant.financialInfo.preferredPaymentMethod === 'cash' ? 'نقد' :
                       restaurant.financialInfo.preferredPaymentMethod === 'online' ? 'دفع إلكتروني' : 'غير محدد'}
                    </span>
                  </div>
                  {restaurant.financialInfo.creditRating && (
                    <div>
                      <span className="text-gray-500">التصنيف الائتماني: </span>
                      <span className={`font-medium ${
                        restaurant.financialInfo.creditRating === 'A' ? 'text-green-600' :
                        restaurant.financialInfo.creditRating === 'B' ? 'text-blue-600' :
                        restaurant.financialInfo.creditRating === 'C' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {restaurant.financialInfo.creditRating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">السجل التجاري</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">الطلبات</h4>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {restaurant.relationshipHistory.totalOrders}
                </div>
                <div className="text-sm text-green-600">إجمالي الطلبات</div>
                <div className="text-xs text-green-600 mt-1">
                  متوسط القيمة: {formatCurrency(restaurant.relationshipHistory.averageOrderValue, restaurant.financialInfo.currency)}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">الإيرادات</h4>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {formatCurrency(restaurant.relationshipHistory.totalRevenue, restaurant.financialInfo.currency)}
                </div>
                <div className="text-sm text-blue-600">إجمالي الإيرادات</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">العقود</h4>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {restaurant.relationshipHistory.contractsCount}
                </div>
                <div className="text-sm text-purple-600">عدد العقود</div>
                <div className="text-xs text-purple-600 mt-1">
                  نشط: {restaurant.relationshipHistory.currentContracts.length}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">التواريخ المهمة</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">أول اتصال: </span>
                  <span className="font-medium">{formatDate(restaurant.relationshipHistory.firstContact)}</span>
                </div>
                <div>
                  <span className="text-gray-500">آخر تحديث: </span>
                  <span className="font-medium">{formatDate(restaurant.relationshipHistory.lastUpdate)}</span>
                </div>
                {restaurant.relationshipHistory.lastOrderDate && (
                  <div>
                    <span className="text-gray-500">آخر طلب: </span>
                    <span className="font-medium">{formatDate(restaurant.relationshipHistory.lastOrderDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
