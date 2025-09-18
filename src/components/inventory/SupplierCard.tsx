'use client'

import React from 'react'
import { YemeniSupplier } from '@/lib/inventory/types'
import { formatDate } from '@/lib/utils'

interface SupplierCardProps {
  supplier: YemeniSupplier
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onView?: () => void
  onContact?: () => void
  onTogglePreferred?: () => void
  onCreateOrder?: () => void
  userRole?: 'manager' | 'staff' | 'viewer'
}

export default function SupplierCard({
  supplier,
  variant = 'default',
  onClick,
  showActions = false,
  onEdit,
  onView,
  onContact,
  onTogglePreferred,
  onCreateOrder,
  userRole = 'staff'
}: SupplierCardProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSpecialtyIcon = (specialty: string) => {
    const icons: Record<string, string> = {
      'لحوم طازجة': '🥩',
      'خضروات وفواكه': '🥬',
      'منتجات ألبان': '🥛',
      'توابل وبهارات': '🌶️',
      'حبوب وبقوليات': '🌾',
      'مشروبات': '🥤',
      'معلبات': '🥫'
    }
    return icons[specialty] || '📦'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 3.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const renderRatingStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      )
    }
    return stars
  }

  const renderCompactCard = () => (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {supplier.businessName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {supplier.businessName}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {supplier.supplierCode} • {supplier.contactPerson}
            </p>
            <div className="flex items-center space-x-1 space-x-reverse">
              <span className="text-sm text-gray-500">{supplier.address.governorate}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{supplier.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-1 space-x-reverse">
            {renderRatingStars(Math.round(supplier.overallRating))}
            <span className={`text-sm font-semibold ${getRatingColor(supplier.overallRating)}`}>
              {supplier.overallRating}
            </span>
          </div>
          {supplier.isPreferred && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              ⭐ مفضل
            </span>
          )}
          {supplier.isLocalProducer && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              🇾🇪 محلي
            </span>
          )}
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              {supplier.businessName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{supplier.businessName}</h3>
              <p className="text-blue-100">{supplier.supplierCode}</p>
              <p className="text-blue-100 text-sm">{supplier.contactPerson}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-1 space-x-reverse">
              {renderRatingStars(Math.round(supplier.overallRating))}
              <span className="text-white font-bold text-lg ml-1">
                {supplier.overallRating}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {supplier.isPreferred && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  ⭐ مفضل
                </span>
              )}
              {supplier.isLocalProducer && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  🇾🇪 محلي
                </span>
              )}
              {supplier.isCertifiedHalal && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  ☪️ حلال
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات الاتصال</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">الهاتف:</span> {supplier.phone}
              </p>
              {supplier.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">البريد:</span> {supplier.email}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">المحافظة:</span> {supplier.address.governorate}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">المديرية:</span> {supplier.address.district}
              </p>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات النشاط</h4>
            <div className="space-y-1">
              <div>
                <span className="text-sm font-medium text-gray-500">التخصصات:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {supplier.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center space-x-1 space-x-reverse">
                      <span>{getSpecialtyIcon(specialty)}</span>
                      <span>{specialty}</span>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">شروط الدفع:</span> {supplier.paymentTerms}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">شروط التسليم:</span> {supplier.deliveryTerms}
              </p>
              {supplier.minimumOrderValue && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">الحد الأدنى للطلب:</span> {formatCurrency(supplier.minimumOrderValue)}
                </p>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">مؤشرات الأداء</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">الجودة</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(supplier.qualityRating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{supplier.qualityRating}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">الموثوقية</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(supplier.reliabilityRating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{supplier.reliabilityRating}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">التسليم</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(supplier.deliveryPerformance / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{supplier.deliveryPerformance}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">السعر</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(supplier.priceCompetitiveness / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{supplier.priceCompetitiveness}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Statistics */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{supplier.totalOrdersCount}</div>
              <div className="text-xs text-gray-500">إجمالي الطلبات</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatCurrency(supplier.totalOrderValue)}</div>
              <div className="text-xs text-gray-500">قيمة الطلبات</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{formatCurrency(supplier.averageOrderValue)}</div>
              <div className="text-xs text-gray-500">متوسط الطلب</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{supplier.averageDeliveryTime} يوم</div>
              <div className="text-xs text-gray-500">متوسط التسليم</div>
            </div>
          </div>
        </div>

        {/* Last Order Information */}
        {supplier.lastOrderDate && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">آخر طلب:</span>
              <span className="text-sm text-gray-900">{formatDate(supplier.lastOrderDate)}</span>
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
              
              {onEdit && userRole === 'manager' && (
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
              
              {onContact && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onContact()
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  اتصال
                </button>
              )}
              
              {onCreateOrder && (userRole === 'manager' || userRole === 'staff') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateOrder()
                  }}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors"
                >
                  إنشاء طلب
                </button>
              )}
              
              {onTogglePreferred && userRole === 'manager' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePreferred()
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    supplier.isPreferred
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {supplier.isPreferred ? '⭐ مفضل' : '☆ إضافة للمفضلة'}
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
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              {supplier.businessName.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{supplier.businessName}</h3>
              <p className="text-blue-100 text-lg mb-2">{supplier.supplierCode}</p>
              <div className="flex items-center space-x-4 space-x-reverse text-blue-100">
                <span className="text-sm">{supplier.contactPerson}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{supplier.phone}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{supplier.address.governorate}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 space-x-reverse mb-2">
              {renderRatingStars(Math.round(supplier.overallRating))}
              <span className="text-white font-bold text-xl mr-1">
                {supplier.overallRating}
              </span>
            </div>
            <div className="text-white text-lg font-bold">
              {formatCurrency(supplier.totalOrderValue)}
            </div>
            <div className="text-blue-100 text-sm">
              إجمالي المعاملات
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content - includes more detailed sections */}
      <div className="p-6">
        {/* Rest of the content similar to default but more detailed */}
        {renderDefaultCard()}
      </div>
    </div>
  )

  if (variant === 'compact') return renderCompactCard()
  if (variant === 'detailed') return renderDetailedCard()
  return renderDefaultCard()
}
