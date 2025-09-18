// Contract Card Component
// مكون بطاقة العقد

import React from 'react'
import { Contract, ContractStatus, ContractType, ContractPriority } from '@/lib/contracts/types'

interface ContractCardProps {
  contract: Contract
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  selected?: boolean
  className?: string
}

export default function ContractCard({
  contract,
  variant = 'default',
  onClick,
  selected = false,
  className = ''
}: ContractCardProps) {
  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_negotiation':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: ContractStatus) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'pending_review': return 'قيد المراجعة'
      case 'under_negotiation': return 'قيد التفاوض'
      case 'approved': return 'معتمد'
      case 'signed': return 'موقع'
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      case 'terminated': return 'منتهي'
      case 'expired': return 'منتهي الصلاحية'
      default: return 'غير معروف'
    }
  }

  const getTypeText = (type: ContractType) => {
    switch (type) {
      case 'design': return 'تصميم'
      case 'printing': return 'طباعة'
      case 'supply': return 'توريد'
      case 'maintenance': return 'صيانة'
      case 'marketing': return 'تسويق'
      default: return 'غير محدد'
    }
  }

  const getPriorityColor = (priority: ContractPriority) => {
    switch (priority) {
      case 'low': return 'text-gray-600'
      case 'medium': return 'text-blue-600'
      case 'high': return 'text-orange-600'
      case 'urgent': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityText = (priority: ContractPriority) => {
    switch (priority) {
      case 'low': return 'منخفضة'
      case 'medium': return 'متوسطة'
      case 'high': return 'عالية'
      case 'urgent': return 'عاجلة'
      default: return 'غير محدد'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
          selected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 truncate">{contract.title}</h3>
            <p className="text-xs text-gray-500">{contract.contractNumber}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(contract.status)}`}>
            {getStatusText(contract.status)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{getTypeText(contract.type)}</span>
          <span>{formatCurrency(contract.totalValue, contract.currency)}</span>
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
            <h3 className="text-lg font-bold text-gray-900">{contract.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{contract.contractNumber}</p>
            <p className="text-sm text-gray-700 line-clamp-2">{contract.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(contract.status)}`}>
              {getStatusText(contract.status)}
            </span>
            <span className={`text-sm font-medium ${getPriorityColor(contract.priority)}`}>
              🔥 {getPriorityText(contract.priority)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-brand-600">
              {formatCurrency(contract.totalValue, contract.currency)}
            </div>
            <div className="text-xs text-gray-600">قيمة العقد</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {Math.round(contract.performance.overallScore)}%
            </div>
            <div className="text-xs text-gray-600">نسبة الإنجاز</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {contract.milestones.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">مراحل مكتملة</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {getDaysRemaining(contract.endDate)}
            </div>
            <div className="text-xs text-gray-600">يوم متبقي</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span>إنجاز المراحل</span>
            <span>{Math.round(contract.performance.milestoneCompletion)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(contract.performance.milestoneCompletion)}`}
              style={{ width: `${contract.performance.milestoneCompletion}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span>المدفوعات</span>
            <span>{Math.round(contract.performance.paymentCompletion)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(contract.performance.paymentCompletion)}`}
              style={{ width: `${contract.performance.paymentCompletion}%` }}
            ></div>
          </div>
        </div>

        {/* Parties */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">الأطراف: </span>
              <span className="font-medium">{contract.parties.length} أطراف</span>
            </div>
            <div>
              <span className="text-gray-500">من: </span>
              <span className="font-medium">{formatDate(contract.startDate)}</span>
              <span className="text-gray-500"> إلى: </span>
              <span className="font-medium">{formatDate(contract.endDate)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={`p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{contract.title}</h3>
          <p className="text-sm text-gray-600">{contract.contractNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(contract.status)}`}>
            {getStatusText(contract.status)}
          </span>
          <span className={`text-xs ${getPriorityColor(contract.priority)}`}>
            {getPriorityText(contract.priority)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span>📝 {getTypeText(contract.type)}</span>
        <span>💰 {formatCurrency(contract.totalValue, contract.currency)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {Math.round(contract.performance.overallScore)}%
          </div>
          <div className="text-xs text-gray-600">الإنجاز</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {contract.milestones.length}
          </div>
          <div className="text-xs text-gray-600">مرحلة</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {getDaysRemaining(contract.endDate)}
          </div>
          <div className="text-xs text-gray-600">يوم متبقي</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${getProgressColor(contract.performance.overallScore)}`}
          style={{ width: `${contract.performance.overallScore}%` }}
        ></div>
      </div>

      {contract.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {contract.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {contract.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{contract.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
