'use client'

import React from 'react'
import { Contract } from '@/lib/contracts/types'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface ContractCardProps {
  contract: Contract
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onView?: () => void
  onStatusChange?: (status: Contract['status']) => void
  onSign?: () => void
}

export default function ContractCard({
  contract,
  variant = 'default',
  onClick,
  showActions = false,
  onEdit,
  onView,
  onStatusChange,
  onSign
}: ContractCardProps) {
  const getContractStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'review':
        return 'bg-blue-100 text-blue-800'
      case 'negotiation':
        return 'bg-orange-100 text-orange-800'
      case 'approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'signed':
        return 'bg-purple-100 text-purple-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'terminated':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContractStatusText = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'review': return 'قيد المراجعة'
      case 'negotiation': return 'قيد التفاوض'
      case 'approval': return 'قيد الموافقة'
      case 'signed': return 'موقع'
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      case 'terminated': return 'منتهي'
      case 'expired': return 'منتهي الصلاحية'
      default: return status
    }
  }

  const getContractTypeText = (type: Contract['type']) => {
    switch (type) {
      case 'service': return 'خدمات'
      case 'supply': return 'توريد'
      case 'partnership': return 'شراكة'
      case 'licensing': return 'ترخيص'
      case 'maintenance': return 'صيانة'
      case 'consulting': return 'استشارات'
      default: return type
    }
  }

  const getCategoryText = (category: Contract['category']) => {
    switch (category) {
      case 'design': return 'تصميم'
      case 'printing': return 'طباعة'
      case 'supply_chain': return 'سلسلة التوريد'
      case 'marketing': return 'تسويق'
      case 'technology': return 'تقنية'
      case 'general': return 'عام'
      default: return category
    }
  }

  const primaryParty = contract.parties.find(p => p.id === contract.primaryParty)
  const secondaryParty = contract.parties.find(p => p.id === contract.secondaryParty)

  const daysUntilExpiry = Math.ceil((contract.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0
  const isExpired = daysUntilExpiry <= 0

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
            📄
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {contract.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {contract.contractNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(contract.status)}`}>
            {getContractStatusText(contract.status)}
          </span>
          <span className="text-xs text-gray-500">
            {formatCurrency(contract.financials.totalValue)}
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
              📄
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {contract.title}
              </h3>
              <p className="text-red-100">
                {contract.contractNumber}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              contract.status === 'active' ? 'bg-green-100 text-green-800' :
              contract.status === 'signed' ? 'bg-purple-100 text-purple-800' :
              contract.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {getContractStatusText(contract.status)}
            </span>
            {(isExpiringSoon || isExpired) && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isExpired ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {isExpired ? 'منتهي' : `${daysUntilExpiry} يوم متبقي`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contract Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات العقد</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">النوع:</span> {getContractTypeText(contract.type)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الفئة:</span> {getCategoryText(contract.category)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الأولوية:</span>
                <span className={`px-2 py-1 text-xs rounded-full ml-1 ${
                  contract.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  contract.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  contract.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {contract.priority === 'urgent' ? 'عاجل' :
                   contract.priority === 'high' ? 'عالي' :
                   contract.priority === 'medium' ? 'متوسط' : 'منخفض'}
                </span>
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">أطراف العقد</h4>
            <div className="space-y-1">
              {primaryParty && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">الطرف الأول:</span> {primaryParty.name}
                </p>
              )}
              {secondaryParty && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">الطرف الثاني:</span> {secondaryParty.name}
                </p>
              )}
            </div>
          </div>

          {/* Financial & Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">التفاصيل المالية</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">القيمة:</span> {formatCurrency(contract.financials.totalValue)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">تاريخ السريان:</span> {formatDate(contract.effectiveDate)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">تاريخ الانتهاء:</span> {formatDate(contract.expiryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">التقدم</span>
            <span className="text-sm text-gray-600">{contract.performance.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${contract.performance.completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{contract.performance.deliverablesCompleted} من {contract.performance.totalDeliverables} مُكتمل</span>
            <span>الميزانية: {contract.performance.budgetUtilization}%</span>
          </div>
        </div>

        {/* Alerts */}
        {contract.alerts.filter(alert => alert.isActive).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">التنبيهات النشطة</h4>
            <div className="space-y-2">
              {contract.alerts.filter(alert => alert.isActive).slice(0, 2).map((alert) => (
                <div key={alert.id} className={`p-2 rounded-lg text-sm ${
                  alert.severity === 'error' ? 'bg-red-50 text-red-800' :
                  alert.severity === 'warning' ? 'bg-orange-50 text-orange-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  {alert.message}
                </div>
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
              {onEdit && contract.status === 'draft' && (
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
              {onSign && contract.status === 'approval' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSign()
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  توقيع
                </button>
              )}
              {onStatusChange && contract.status === 'signed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange('active')
                  }}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors"
                >
                  تفعيل
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
              📄
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {contract.title}
              </h3>
              <p className="text-red-100 text-lg mb-2">
                {contract.contractNumber}
              </p>
              <div className="flex items-center space-x-4 space-x-reverse text-red-100">
                <span className="text-sm">
                  {getContractTypeText(contract.type)} • {getCategoryText(contract.category)}
                </span>
                <span className="text-sm">
                  {formatDate(contract.effectiveDate)} - {formatDate(contract.expiryDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getContractStatusColor(contract.status)}`}>
              {getContractStatusText(contract.status)}
            </span>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">
                {formatCurrency(contract.financials.totalValue)}
              </div>
              <div className="text-red-100 text-sm">
                {contract.financials.currency}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Parties Details */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">أطراف العقد</h4>
            {contract.parties.map((party, index) => (
              <div key={party.id} className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">
                      {party.type === 'landspice' ? '🏢' : 
                       party.type === 'restaurant' ? '🍽️' : 
                       party.type === 'bank' ? '🏦' : 
                       party.type === 'supplier' ? '📦' : '👤'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{party.name}</p>
                    <p className="text-xs text-gray-500">
                      الطرف {index === 0 ? 'الأول' : index === 1 ? 'الثاني' : `رقم ${index + 1}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline & Deliverables */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">المخرجات والمهام</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{contract.performance.deliverablesCompleted}</p>
                  <p className="text-xs text-gray-500">مخرجات مكتملة</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-sm">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {contract.performance.totalDeliverables - contract.performance.deliverablesCompleted}
                  </p>
                  <p className="text-xs text-gray-500">مخرجات متبقية</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{contract.performance.completionPercentage}%</p>
                  <p className="text-xs text-gray-500">نسبة الإنجاز</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">الملخص المالي</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(contract.financials.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">إجمالي القيمة</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">🛡️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(contract.financials.guaranteeRequired)}
                  </p>
                  <p className="text-xs text-gray-500">الضمان المطلوب</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📈</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{contract.performance.budgetUtilization}%</p>
                  <p className="text-xs text-gray-500">استخدام الميزانية</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Alerts */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">الحالة والتنبيهات</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-1">حالة العقد</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(contract.status)}`}>
                  {getContractStatusText(contract.status)}
                </span>
              </div>
              
              {contract.alerts.filter(alert => alert.isActive).length > 0 && (
                <div className="space-y-1">
                  {contract.alerts.filter(alert => alert.isActive).slice(0, 3).map((alert) => (
                    <div key={alert.id} className={`p-2 rounded-lg text-xs ${
                      alert.severity === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                      alert.severity === 'warning' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                      'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {alert.message}
                    </div>
                  ))}
                </div>
              )}
              
              {(isExpiringSoon || isExpired) && (
                <div className={`p-2 rounded-lg text-xs ${
                  isExpired ? 'bg-red-50 text-red-800 border border-red-200' : 
                  'bg-orange-50 text-orange-800 border border-orange-200'
                }`}>
                  {isExpired ? 'العقد منتهي الصلاحية' : `${daysUntilExpiry} يوم متبقي على انتهاء العقد`}
                </div>
              )}
            </div>
          </div>
        </div>

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
              {onEdit && ['draft', 'review'].includes(contract.status) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  تحرير العقد
                </button>
              )}
              {onSign && contract.status === 'approval' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSign()
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  توقيع العقد
                </button>
              )}
              {onStatusChange && contract.status === 'signed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange('active')
                  }}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  تفعيل العقد
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
