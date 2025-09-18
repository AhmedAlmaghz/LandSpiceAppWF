'use client'

import React from 'react'
import { InventoryItem } from '@/lib/inventory/types'
import { isLowStock, isExpiringSoon, isExpired } from '@/lib/inventory/validation'
import { formatDate } from '@/lib/utils'

interface InventoryItemCardProps {
  item: InventoryItem
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onUpdateStock?: () => void
  onView?: () => void
  onReorder?: () => void
  showSupplierInfo?: boolean
  userRole?: 'manager' | 'staff' | 'viewer'
}

export default function InventoryItemCard({
  item,
  variant = 'default',
  onClick,
  showActions = false,
  onEdit,
  onUpdateStock,
  onView,
  onReorder,
  showSupplierInfo = true,
  userRole = 'staff'
}: InventoryItemCardProps) {
  
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: currency === 'YER' ? 'YER' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    return formatter.format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'اللحوم والدواجن': '🥩',
      'منتجات الألبان': '🥛',
      'الخضروات': '🥬',
      'الفواكه': '🍎',
      'الحبوب والبقوليات': '🌾',
      'التوابل والبهارات': '🌶️',
      'الزيوت والدهون': '🫒',
      'المشروبات': '🥤',
      'المعلبات والمحفوظات': '🥫',
      'منتجات المخابز': '🍞'
    }
    return icons[category] || '📦'
  }

  const getOriginFlag = (origin: string) => {
    const flags: Record<string, string> = {
      'محلي يمني': '🇾🇪',
      'مستورد من السعودية': '🇸🇦',
      'مستورد من الهند': '🇮🇳',
      'مستورد من الصين': '🇨🇳',
      'غير محدد': '❓'
    }
    return flags[origin] || '🌍'
  }

  const getQualityColor = (grade: string) => {
    const colors: Record<string, string> = {
      'ممتاز': 'bg-green-100 text-green-800',
      'جيد جداً': 'bg-blue-100 text-blue-800',
      'جيد': 'bg-yellow-100 text-yellow-800',
      'مقبول': 'bg-orange-100 text-orange-800',
      'ضعيف': 'bg-red-100 text-red-800'
    }
    return colors[grade] || 'bg-gray-100 text-gray-800'
  }

  const getStockStatus = () => {
    const lowStock = isLowStock(item.currentQuantity, item.minimumThreshold, item.reorderPoint)
    const stockPercentage = (item.currentQuantity / item.maximumCapacity) * 100

    if (item.currentQuantity === 0) {
      return { status: 'نفد المخزون', color: 'bg-red-100 text-red-800', severity: 'critical' }
    } else if (lowStock) {
      return { status: 'مخزون منخفض', color: 'bg-orange-100 text-orange-800', severity: 'warning' }
    } else if (stockPercentage > 80) {
      return { status: 'مخزون كافي', color: 'bg-green-100 text-green-800', severity: 'normal' }
    } else {
      return { status: 'مخزون متوسط', color: 'bg-blue-100 text-blue-800', severity: 'normal' }
    }
  }

  const getExpiryStatus = () => {
    if (!item.expiryDate) return null
    
    if (isExpired(item.expiryDate)) {
      return { status: 'منتهي الصلاحية', color: 'bg-red-100 text-red-800', severity: 'critical' }
    } else if (isExpiringSoon(item.expiryDate, 7)) {
      const daysLeft = Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return { 
        status: `${daysLeft} يوم متبقي`, 
        color: 'bg-orange-100 text-orange-800', 
        severity: 'warning' 
      }
    }
    return null
  }

  const stockStatus = getStockStatus()
  const expiryStatus = getExpiryStatus()

  const renderCompactCard = () => (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-2xl">
            {getCategoryIcon(item.category)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {item.sku} • {item.subcategory}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{item.currentQuantity}</div>
            <div className="text-sm text-gray-500">{item.unit}</div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
            {stockStatus.status}
          </span>
          {expiryStatus && (
            <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
              {expiryStatus.status}
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white text-3xl">
              {getCategoryIcon(item.category)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{item.name}</h3>
              {item.nameEnglish && (
                <p className="text-green-100 text-sm">{item.nameEnglish}</p>
              )}
              <p className="text-green-100">{item.sku}</p>
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-100">
                <span>{getOriginFlag(item.origin)}</span>
                <span>{item.origin}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-white">
            <div className="text-3xl font-bold">{item.currentQuantity}</div>
            <div className="text-green-100">{item.unit}</div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.status}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Alerts */}
        {(stockStatus.severity !== 'normal' || expiryStatus) && (
          <div className="mb-4 space-y-2">
            {stockStatus.severity !== 'normal' && (
              <div className={`p-3 rounded-lg ${stockStatus.color}`}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span>⚠️</span>
                  <span className="font-medium">{stockStatus.status}</span>
                </div>
              </div>
            )}
            {expiryStatus && (
              <div className={`p-3 rounded-lg ${expiryStatus.color}`}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span>📅</span>
                  <span className="font-medium">{expiryStatus.status}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stock Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات المخزون</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">الكمية الحالية:</span> {item.currentQuantity} {item.unit}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الحد الأدنى:</span> {item.minimumThreshold} {item.unit}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">نقطة إعادة الطلب:</span> {item.reorderPoint} {item.unit}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الحد الأقصى:</span> {item.maximumCapacity} {item.unit}
              </p>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات المنتج</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">الفئة:</span> {item.category}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الفئة الفرعية:</span> {item.subcategory}
              </p>
              <span className={`px-2 py-1 text-xs rounded-full ${getQualityColor(item.qualityGrade)}`}>
                جودة {item.qualityGrade}
              </span>
              {item.isTraditionalYemeni && (
                <div className="flex items-center space-x-1 space-x-reverse">
                  <span className="text-green-600">🇾🇪</span>
                  <span className="text-xs text-green-700 font-medium">منتج يمني تقليدي</span>
                </div>
              )}
              {item.religionCompliant && (
                <div className="flex items-center space-x-1 space-x-reverse">
                  <span className="text-blue-600">☪️</span>
                  <span className="text-xs text-blue-700 font-medium">حلال</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">المعلومات المالية</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">تكلفة الوحدة:</span>
                <span className="mr-1 font-bold text-green-600">
                  {formatCurrency(item.costPerUnit, item.currency)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">سعر البيع:</span>
                <span className="mr-1 font-bold text-blue-600">
                  {formatCurrency(item.sellingPrice, item.currency)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">قيمة المخزون:</span>
                <span className="mr-1 font-bold text-purple-600">
                  {formatCurrency(item.currentQuantity * item.costPerUnit, item.currency)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Expiry and Storage */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.expiryDate && (
              <div>
                <span className="text-sm font-medium text-gray-500">تاريخ الانتهاء:</span>
                <p className={`text-sm ${expiryStatus ? 'text-orange-600 font-semibold' : 'text-gray-900'}`}>
                  {formatDate(item.expiryDate)}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500">ظروف التخزين:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.storageConditions.map((condition, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        {showSupplierInfo && item.supplierName && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">المورد:</span>
                <p className="text-sm text-gray-900">{item.supplierName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">مدة التوريد:</span>
                <p className="text-sm text-gray-900">{item.leadTimeDays} يوم</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">آخر تزويد:</span>
                <p className="text-sm text-gray-900">{formatDate(item.lastRestockDate)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Traditional Uses */}
        {item.isTraditionalYemeni && item.traditionalUses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500 block mb-2">الاستخدامات التقليدية:</span>
            <div className="flex flex-wrap gap-2">
              {item.traditionalUses.map((use, index) => (
                <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500 block mb-2">العلامات:</span>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {tag}
                </span>
              ))}
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
              
              {onUpdateStock && (userRole === 'manager' || userRole === 'staff') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateStock()
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  تحديث المخزون
                </button>
              )}
              
              {onReorder && stockStatus.severity !== 'normal' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReorder()
                  }}
                  className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg hover:bg-orange-100 transition-colors"
                >
                  إعادة طلب
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
      {/* Enhanced Header with more details */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white text-4xl">
              {getCategoryIcon(item.category)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{item.name}</h3>
              {item.nameEnglish && (
                <p className="text-green-100 text-lg mb-2">{item.nameEnglish}</p>
              )}
              <div className="flex items-center space-x-4 space-x-reverse text-green-100">
                <span className="text-sm">{item.sku}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{item.subcategory}</span>
                <span className="text-sm">•</span>
                <span className="text-sm flex items-center space-x-1 space-x-reverse">
                  <span>{getOriginFlag(item.origin)}</span>
                  <span>{item.origin}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-white">
            <div className="text-4xl font-bold">{item.currentQuantity}</div>
            <div className="text-green-100 text-lg">{item.unit}</div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.status}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Content with more sections */}
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
