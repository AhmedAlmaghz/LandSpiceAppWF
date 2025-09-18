'use client'

import React from 'react'
import { BankGuarantee } from '@/lib/bank-guarantees/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface BankGuaranteeCardProps {
  guarantee: BankGuarantee
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onView?: () => void
  onSubmit?: () => void
  onApprove?: () => void
  onReject?: () => void
}

export default function BankGuaranteeCard({
  guarantee,
  variant = 'default',
  onClick,
  showActions = false,
  onEdit,
  onView,
  onSubmit,
  onApprove,
  onReject
}: BankGuaranteeCardProps) {
  const getStatusColor = (status: BankGuarantee['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-orange-100 text-orange-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'issued':
        return 'bg-purple-100 text-purple-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: BankGuarantee['status']) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'submitted': return 'مرسل للبنك'
      case 'under_review': return 'قيد المراجعة'
      case 'approved': return 'موافق عليه'
      case 'issued': return 'صادر'
      case 'active': return 'نشط'
      case 'expired': return 'منتهي الصلاحية'
      case 'cancelled': return 'ملغي'
      case 'rejected': return 'مرفوض'
      default: return status
    }
  }

  const getTypeText = (type: BankGuarantee['type']) => {
    switch (type) {
      case 'performance': return 'حسن التنفيذ'
      case 'advance_payment': return 'دفع مقدم'
      case 'maintenance': return 'صيانة'
      case 'bid_bond': return 'دخول مناقصة'
      case 'customs': return 'جمركي'
      case 'final_payment': return 'دفع نهائي'
      default: return type
    }
  }

  const getCurrencySymbol = (currency: BankGuarantee['currency']) => {
    switch (currency) {
      case 'YER': return 'ر.ي'
      case 'USD': return '$'
      case 'SAR': return 'ر.س'
      case 'EUR': return '€'
      default: return currency
    }
  }

  const daysUntilExpiry = Math.ceil((guarantee.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
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
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            🏦
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {guarantee.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {guarantee.guaranteeNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guarantee.status)}`}>
            {getStatusText(guarantee.status)}
          </span>
          <span className="text-xs text-gray-500">
            {formatCurrency(guarantee.amount)} {getCurrencySymbol(guarantee.currency)}
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              🏦
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {guarantee.title}
              </h3>
              <p className="text-green-100">
                {guarantee.guaranteeNumber}
              </p>
              {guarantee.referenceNumber && (
                <p className="text-green-100 text-sm">
                  مرجع البنك: {guarantee.referenceNumber}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(guarantee.status)}`}>
              {getStatusText(guarantee.status)}
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
          {/* Guarantee Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات الضمانة</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">النوع:</span> {getTypeText(guarantee.type)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">المبلغ:</span> {formatCurrency(guarantee.amount)} {getCurrencySymbol(guarantee.currency)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">العمولة:</span> {guarantee.commissionRate}% ({formatCurrency(guarantee.commissionAmount)} {getCurrencySymbol(guarantee.currency)})
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الأولوية:</span>
                <span className={`px-2 py-1 text-xs rounded-full ml-1 ${
                  guarantee.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  guarantee.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  guarantee.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {guarantee.priority === 'urgent' ? 'عاجل' :
                   guarantee.priority === 'high' ? 'عالي' :
                   guarantee.priority === 'medium' ? 'متوسط' : 'منخفض'}
                </span>
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">أطراف الضمانة</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">مقدم الطلب:</span> {guarantee.applicant.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">المستفيد:</span> {guarantee.beneficiary.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">البنك:</span> {guarantee.bank.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الفرع:</span> {guarantee.bank.branchName}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">التواريخ المهمة</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">تاريخ التقديم:</span> {formatDate(guarantee.applicationDate)}
              </p>
              {guarantee.issueDate && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">تاريخ الإصدار:</span> {formatDate(guarantee.issueDate)}
                </p>
              )}
              {guarantee.effectiveDate && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">تاريخ السريان:</span> {formatDate(guarantee.effectiveDate)}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">تاريخ الانتهاء:</span> {formatDate(guarantee.expiryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Notes */}
        {guarantee.bankNotes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">ملاحظات البنك</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{guarantee.bankNotes}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {guarantee.alerts.filter(alert => alert.isActive).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">التنبيهات النشطة</h4>
            <div className="space-y-2">
              {guarantee.alerts.filter(alert => alert.isActive).slice(0, 2).map((alert) => (
                <div key={alert.id} className={`p-2 rounded-lg text-sm ${
                  alert.severity === 'critical' ? 'bg-red-50 text-red-800 border border-red-200' :
                  alert.severity === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                  alert.severity === 'warning' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
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
              
              {onEdit && guarantee.status === 'draft' && (
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
              
              {onSubmit && guarantee.status === 'draft' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSubmit()
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  إرسال للبنك
                </button>
              )}
              
              {onApprove && ['submitted', 'under_review'].includes(guarantee.status) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onApprove()
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  موافقة
                </button>
              )}
              
              {onReject && ['submitted', 'under_review'].includes(guarantee.status) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReject()
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                >
                  رفض
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              🏦
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {guarantee.title}
              </h3>
              <p className="text-green-100 text-lg mb-2">
                {guarantee.guaranteeNumber}
              </p>
              {guarantee.referenceNumber && (
                <p className="text-green-100 mb-2">
                  مرجع البنك: {guarantee.referenceNumber}
                </p>
              )}
              <div className="flex items-center space-x-4 space-x-reverse text-green-100">
                <span className="text-sm">
                  {getTypeText(guarantee.type)}
                </span>
                <span className="text-sm">•</span>
                <span className="text-sm">
                  {guarantee.bank.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(guarantee.status)}`}>
              {getStatusText(guarantee.status)}
            </span>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">
                {formatCurrency(guarantee.amount)}
              </div>
              <div className="text-green-100 text-sm">
                {getCurrencySymbol(guarantee.currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content - Similar to default but with more details */}
      <div className="p-6">
        {/* Status Timeline */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">سجل الحالة</h4>
          <div className="space-y-2">
            {guarantee.statusHistory.slice(-3).map((history, index) => (
              <div key={history.id} className="flex items-center space-x-3 space-x-reverse">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {getStatusText(history.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(history.timestamp)}
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-xs text-gray-600 mt-1">{history.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest of the content similar to default card but more detailed */}
        {renderDefaultCard()}
      </div>
    </div>
  )

  if (variant === 'compact') return renderCompactCard()
  if (variant === 'detailed') return renderDetailedCard()
  return renderDefaultCard()
}
