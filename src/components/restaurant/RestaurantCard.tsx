'use client'

import React from 'react'
import { Restaurant } from '@/lib/restaurant/types'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/utils'

interface RestaurantCardProps {
  restaurant: Restaurant
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onView?: () => void
  onStatusChange?: (status: Restaurant['status']) => void
}

export default function RestaurantCard({
  restaurant,
  variant = 'default',
  onClick,
  showActions = false,
  onEdit,
  onView,
  onStatusChange
}: RestaurantCardProps) {
  const statusColor = getStatusColor(restaurant.status)
  const statusText = getStatusText(restaurant.status, 'restaurant')

  const primaryContact = restaurant.contacts.find(c => c.isPrimary) || restaurant.contacts[0]
  const mainBranch = restaurant.branches.find(b => b.isActive) || restaurant.branches[0]

  const renderCompactCard = () => (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {restaurant.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {restaurant.businessInfo.businessType === 'restaurant' && 'مطعم'}
              {restaurant.businessInfo.businessType === 'cafe' && 'مقهى'}
              {restaurant.businessInfo.businessType === 'fast_food' && 'وجبات سريعة'}
              {restaurant.businessInfo.businessType === 'catering' && 'خدمات طعام'}
              {restaurant.businessInfo.businessType === 'food_truck' && 'عربة طعام'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
          <span className="text-xs text-gray-500">
            {restaurant.relationshipHistory.totalOrders} طلب
          </span>
        </div>
      </div>
    </div>
  )

  const renderDefaultCard = () => (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {restaurant.name}
              </h3>
              <p className="text-red-100">
                {restaurant.legalName}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
            restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            restaurant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات الاتصال</h4>
            {primaryContact && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{primaryContact.name}</span>
                  <span className="text-gray-500"> - {primaryContact.position}</span>
                </p>
                <p className="text-sm text-gray-600">{primaryContact.phone}</p>
                <p className="text-sm text-gray-600">{primaryContact.email}</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">الموقع</h4>
            {mainBranch && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600 font-medium">{mainBranch.name}</p>
                <p className="text-sm text-gray-600">{mainBranch.address.city}</p>
                <p className="text-sm text-gray-600">{mainBranch.address.region}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">إحصائيات</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{restaurant.relationshipHistory.totalOrders}</span> طلب
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{formatCurrency(restaurant.relationshipHistory.totalRevenue)}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{restaurant.relationshipHistory.contractsCount}</span> عقد
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {restaurant.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {restaurant.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{restaurant.tags.length - 3} المزيد
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onView()
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                >
                  عرض التفاصيل
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  تحرير
                </button>
              )}
              {onStatusChange && restaurant.status !== 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange('active')
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  تفعيل
                </button>
              )}
              {onStatusChange && restaurant.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange('inactive')
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                >
                  إلغاء تفعيل
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderDetailedCard = () => (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {restaurant.name}
              </h3>
              <p className="text-red-100 mb-2">
                {restaurant.legalName}
              </p>
              <div className="flex items-center space-x-4 space-x-reverse text-red-100">
                <span className="text-sm">
                  تأسس: {formatDate(restaurant.businessInfo.establishedDate)}
                </span>
                <span className="text-sm">
                  {restaurant.branches.length} فرع
                </span>
              </div>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
            restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            restaurant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">معلومات الاتصال</h4>
            {primaryContact && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{primaryContact.name}</p>
                    <p className="text-xs text-gray-500">{primaryContact.position}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">📞</span>
                  </div>
                  <p className="text-sm text-gray-700">{primaryContact.phone}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">📧</span>
                  </div>
                  <p className="text-sm text-gray-700">{primaryContact.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">تفاصيل الموقع</h4>
            {mainBranch && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm">🏢</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{mainBranch.name}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-sm">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{mainBranch.address.city}</p>
                    <p className="text-xs text-gray-500">{mainBranch.address.region}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-sm">👨‍💼</span>
                  </div>
                  <p className="text-sm text-gray-700">{mainBranch.manager}</p>
                </div>
              </div>
            )}
          </div>

          {/* Financial Info */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">المعلومات المالية</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(restaurant.financialInfo.capitalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">رأس المال</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">⭐</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {restaurant.financialInfo.creditRating || 'غير محدد'}
                  </p>
                  <p className="text-xs text-gray-500">التصنيف الائتماني</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">🛡️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(restaurant.financialInfo.guaranteeRequired)}
                  </p>
                  <p className="text-xs text-gray-500">الضمان المطلوب</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">إحصائيات العلاقة</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📦</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {restaurant.relationshipHistory.totalOrders}
                  </p>
                  <p className="text-xs text-gray-500">إجمالي الطلبات</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">💵</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(restaurant.relationshipHistory.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">إجمالي الإيرادات</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-sm">📄</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {restaurant.relationshipHistory.contractsCount}
                  </p>
                  <p className="text-xs text-gray-500">العقود النشطة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.businessInfo.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">وصف النشاط</h4>
            <p className="text-gray-600 leading-relaxed">
              {restaurant.businessInfo.description}
            </p>
          </div>
        )}

        {/* Tags & Categories */}
        {(restaurant.tags.length > 0 || restaurant.categories.length > 0) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurant.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">العلامات</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {restaurant.categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">التصنيفات</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onView()
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  عرض التفاصيل الكاملة
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  تحرير البيانات
                </button>
              )}
              {onStatusChange && restaurant.status !== 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange('active')
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  تفعيل المطعم
                </button>
              )}
              {onStatusChange && restaurant.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange('inactive')
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  إلغاء تفعيل
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (variant === 'compact') return renderCompactCard()
  if (variant === 'detailed') return renderDetailedCard()
  return renderDefaultCard()
}
