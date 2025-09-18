// Transaction Card Component
// مكون بطاقة المعاملة المالية

import React from 'react'

interface Transaction {
  id: string
  type: 'guarantee_collection' | 'supplier_payment' | 'fee_collection' | 'refund'
  restaurant: string
  supplier?: string
  amount: number
  currency: string
  date: Date
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  reference?: string
  description?: string
}

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
  variant?: 'default' | 'compact'
  className?: string
}

export default function TransactionCard({
  transaction,
  onClick,
  variant = 'default',
  className = ''
}: TransactionCardProps) {
  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTransactionTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'guarantee_collection': return 'تحصيل ضمان'
      case 'supplier_payment': return 'دفع للمورد'
      case 'fee_collection': return 'رسوم خدمة'
      case 'refund': return 'استرداد'
      default: return 'غير محدد'
    }
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'guarantee_collection': return '🔒'
      case 'supplier_payment': return '💸'
      case 'fee_collection': return '💰'
      case 'refund': return '↩️'
      default: return '💳'
    }
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'مكتمل'
      case 'pending': return 'معلق'
      case 'failed': return 'فاشل'
      case 'cancelled': return 'ملغى'
      default: return 'غير محدد'
    }
  }

  const getAmountColor = (type: Transaction['type'], status: Transaction['status']) => {
    if (status !== 'completed') return 'text-gray-600'
    
    switch (type) {
      case 'guarantee_collection':
      case 'fee_collection':
        return 'text-green-600' // مبلغ داخل
      case 'supplier_payment':
      case 'refund':
        return 'text-red-600' // مبلغ خارج
      default:
        return 'text-gray-600'
    }
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-xl">{getTransactionIcon(transaction.type)}</div>
            <div>
              <p className="font-medium text-sm">{getTransactionTypeText(transaction.type)}</p>
              <p className="text-xs text-gray-600">{transaction.restaurant}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold text-sm ${getAmountColor(transaction.type, transaction.status)}`}>
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
              {getStatusText(transaction.status)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{getTransactionTypeText(transaction.type)}</h3>
            <p className="text-sm text-gray-600">{transaction.restaurant}</p>
            {transaction.supplier && (
              <p className="text-xs text-gray-500">المورد: {transaction.supplier}</p>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(transaction.status)}`}>
          {getStatusText(transaction.status)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">التاريخ</div>
          <div className="font-medium">{formatDate(transaction.date)}</div>
          {transaction.reference && (
            <div className="text-xs text-gray-500">مرجع: {transaction.reference}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">المبلغ</div>
          <div className={`text-xl font-bold ${getAmountColor(transaction.type, transaction.status)}`}>
            {transaction.type === 'supplier_payment' || transaction.type === 'refund' ? '-' : '+'}
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
        </div>
      </div>

      {transaction.description && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-gray-700">{transaction.description}</div>
        </div>
      )}
    </div>
  )
}
