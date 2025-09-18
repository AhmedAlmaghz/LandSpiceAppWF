// Risk Alert Component
// مكون تنبيه المخاطر

import React from 'react'

interface RiskAlert {
  id: string
  type: 'late_payment' | 'credit_limit' | 'fraud_suspicious' | 'contract_expiry' | 'high_volume'
  restaurant: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  date: Date
  acknowledged: boolean
  dueDate?: Date
  amount?: number
  recommendedAction?: string
}

interface RiskAlertProps {
  alert: RiskAlert
  onAcknowledge?: () => void
  onAction?: () => void
  variant?: 'default' | 'compact'
  className?: string
}

export default function RiskAlert({
  alert,
  onAcknowledge,
  onAction,
  variant = 'default',
  className = ''
}: RiskAlertProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getSeverityColor = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSeverityText = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'حرج'
      case 'high': return 'عالي'
      case 'medium': return 'متوسط'
      case 'low': return 'منخفض'
      default: return 'غير محدد'
    }
  }

  const getTypeIcon = (type: RiskAlert['type']) => {
    switch (type) {
      case 'late_payment': return '⏰'
      case 'credit_limit': return '📊'
      case 'fraud_suspicious': return '🚨'
      case 'contract_expiry': return '📋'
      case 'high_volume': return '📈'
      default: return '⚠️'
    }
  }

  const getTypeText = (type: RiskAlert['type']) => {
    switch (type) {
      case 'late_payment': return 'تأخر دفع'
      case 'credit_limit': return 'حد ائتماني'
      case 'fraud_suspicious': return 'نشاط مشبوه'
      case 'contract_expiry': return 'انتهاء عقد'
      case 'high_volume': return 'حجم عالي'
      default: return 'تنبيه عام'
    }
  }

  const getUrgencyLevel = (severity: RiskAlert['severity'], dueDate?: Date) => {
    if (severity === 'critical') return 'فوري'
    if (dueDate) {
      const now = new Date()
      const diffHours = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      if (diffHours <= 24) return 'خلال 24 ساعة'
      if (diffHours <= 72) return 'خلال 3 أيام'
    }
    return 'غير محدد'
  }

  if (variant === 'compact') {
    return (
      <div className={`p-3 rounded-lg border-l-4 ${
        alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
        alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
        alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-blue-500 bg-blue-50'
      } ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-lg">{getTypeIcon(alert.type)}</span>
            <div>
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-gray-600">{alert.restaurant}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
            {getSeverityText(alert.severity)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border ${
      alert.acknowledged 
        ? 'bg-gray-50 border-gray-200' 
        : alert.severity === 'critical' 
          ? 'bg-red-50 border-red-200' 
          : 'bg-white border-gray-200'
    } ${className}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="text-2xl">{getTypeIcon(alert.type)}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{alert.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{alert.restaurant}</p>
              <p className="text-sm text-gray-700">{alert.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 text-sm rounded-full border ${getSeverityColor(alert.severity)}`}>
              {getSeverityText(alert.severity)}
            </span>
            {alert.acknowledged && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                ✓ تم الإقرار
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">تاريخ التنبيه</div>
            <div className="text-sm font-medium">{formatDate(alert.date)}</div>
          </div>
          {alert.dueDate && (
            <div>
              <div className="text-xs text-gray-500">الموعد النهائي</div>
              <div className="text-sm font-medium">{formatDate(alert.dueDate)}</div>
              <div className={`text-xs ${
                alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
              }`}>
                {getUrgencyLevel(alert.severity, alert.dueDate)}
              </div>
            </div>
          )}
          {alert.amount && (
            <div>
              <div className="text-xs text-gray-500">المبلغ المتأثر</div>
              <div className="text-sm font-medium">{formatCurrency(alert.amount)}</div>
            </div>
          )}
        </div>

        {alert.recommendedAction && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">الإجراء المقترح:</div>
            <div className="text-sm text-blue-700">{alert.recommendedAction}</div>
          </div>
        )}

        <div className="flex gap-2">
          {!alert.acknowledged && onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              ✓ إقرار
            </button>
          )}
          {onAction && (
            <button
              onClick={onAction}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                alert.severity === 'critical'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : alert.severity === 'high'
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              اتخاذ إجراء
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
