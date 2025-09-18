// Restaurant Card Component
// مكون بطاقة المطعم

import React from 'react'
import { Restaurant } from '@/lib/restaurant/types'

interface RestaurantCardProps {
  restaurant: Restaurant
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  selected?: boolean
  className?: string
}

export default function RestaurantCard({
  restaurant,
  variant = 'default',
  onClick,
  selected = false,
  className = ''
}: RestaurantCardProps) {
  const getStatusColor = (status: Restaurant['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Restaurant['status']) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'inactive':
        return 'غير نشط'
      case 'pending':
        return 'قيد المراجعة'
      case 'suspended':
        return 'معلق'
      case 'terminated':
        return 'منتهي'
      default:
        return 'غير معروف'
    }
  }

  const getTypeText = (type: Restaurant['type']) => {
    switch (type) {
      case 'single':
        return 'مطعم واحد'
      case 'chain':
        return 'سلسلة مطاعم'
      case 'franchise':
        return 'امتياز تجاري'
      default:
        return 'غير محدد'
    }
  }

  const getBusinessTypeText = (businessType: Restaurant['businessInfo']['businessType']) => {
    switch (businessType) {
      case 'restaurant':
        return 'مطعم'
      case 'cafe':
        return 'مقهى'
      case 'fast_food':
        return 'وجبات سريعة'
      case 'catering':
        return 'تقديم طعام'
      case 'food_truck':
        return 'عربة طعام'
      default:
        return 'غير محدد'
    }
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
          selected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
            <p className="text-sm text-gray-600">
              {getBusinessTypeText(restaurant.businessInfo.businessType)} • {getTypeText(restaurant.type)}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(restaurant.status)}`}>
            {getStatusText(restaurant.status)}
          </span>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>{restaurant.branches.length} فرع</span>
          <span>{restaurant.relationshipHistory.totalOrders} طلب</span>
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div
        className={`p-6 rounded-lg border hover:shadow-lg transition-all cursor-pointer ${
          selected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{restaurant.legalName}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {getBusinessTypeText(restaurant.businessInfo.businessType)}
              </span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-sm text-gray-600">
                {getTypeText(restaurant.type)}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(restaurant.status)}`}>
            {getStatusText(restaurant.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-600">{restaurant.branches.length}</div>
            <div className="text-sm text-gray-600">فرع</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{restaurant.relationshipHistory.totalOrders}</div>
            <div className="text-sm text-gray-600">طلب</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{restaurant.relationshipHistory.contractsCount}</div>
            <div className="text-sm text-gray-600">عقد</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Intl.NumberFormat('ar-SA', { 
                style: 'currency', 
                currency: restaurant.financialInfo.currency,
                minimumFractionDigits: 0 
              }).format(restaurant.relationshipHistory.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.preferences.cuisineType.slice(0, 3).map((cuisine, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {cuisine}
            </span>
          ))}
          {restaurant.preferences.cuisineType.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{restaurant.preferences.cuisineType.length - 3} المزيد
            </span>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>آخر تحديث: {new Date(restaurant.updatedAt).toLocaleDateString('ar-SA')}</span>
            {restaurant.relationshipHistory.lastOrderDate && (
              <span>آخر طلب: {new Date(restaurant.relationshipHistory.lastOrderDate).toLocaleDateString('ar-SA')}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={`p-5 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
          <p className="text-sm text-gray-600">{restaurant.legalName}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(restaurant.status)}`}>
          {getStatusText(restaurant.status)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span>{getBusinessTypeText(restaurant.businessInfo.businessType)}</span>
        <span>{getTypeText(restaurant.type)}</span>
        <span>{restaurant.branches.length} فرع</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <div className="font-medium text-gray-900">{restaurant.relationshipHistory.totalOrders}</div>
          <div className="text-xs text-gray-600">طلب</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">{restaurant.relationshipHistory.contractsCount}</div>
          <div className="text-xs text-gray-600">عقد</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {new Intl.NumberFormat('ar-SA', { 
              style: 'currency', 
              currency: restaurant.financialInfo.currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(restaurant.relationshipHistory.totalRevenue)}
          </div>
          <div className="text-xs text-gray-600">إيرادات</div>
        </div>
      </div>

      {restaurant.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {restaurant.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {restaurant.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{restaurant.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
