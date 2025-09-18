// Lead Card Component
// مكون بطاقة العميل المحتمل

import React from 'react'

interface Lead {
  id: string
  restaurantName: string
  ownerName: string
  phone: string
  email: string
  location: string
  businessType: 'restaurant' | 'cafe' | 'fast_food' | 'catering'
  status: 'new' | 'contacted' | 'interested' | 'meeting_scheduled' | 'proposal_sent' | 'negotiating' | 'converted' | 'rejected'
  source: 'cold_call' | 'referral' | 'social_media' | 'website' | 'exhibition' | 'other'
  estimatedValue: number
  probability: number
  nextAction: string
  lastContact: Date
  notes: string[]
}

interface LeadCardProps {
  lead: Lead
  onClick?: () => void
  onContact?: () => void
  onUpdateStatus?: (status: Lead['status']) => void
  variant?: 'default' | 'compact'
  className?: string
}

export default function LeadCard({
  lead,
  onClick,
  onContact,
  onUpdateStatus,
  variant = 'default',
  className = ''
}: LeadCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interested': return 'bg-green-100 text-green-800 border-green-200'
      case 'meeting_scheduled': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'proposal_sent': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'negotiating': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'converted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'جديد'
      case 'contacted': return 'تم التواصل'
      case 'interested': return 'مهتم'
      case 'meeting_scheduled': return 'اجتماع مجدول'
      case 'proposal_sent': return 'عرض مُرسل'
      case 'negotiating': return 'تفاوض'
      case 'converted': return 'تم التحويل'
      case 'rejected': return 'مرفوض'
      default: return 'غير محدد'
    }
  }

  const getBusinessTypeText = (type: Lead['businessType']) => {
    switch (type) {
      case 'restaurant': return 'مطعم'
      case 'cafe': return 'مقهى'
      case 'fast_food': return 'وجبات سريعة'
      case 'catering': return 'تقديم طعام'
      default: return 'غير محدد'
    }
  }

  const getSourceText = (source: Lead['source']) => {
    switch (source) {
      case 'cold_call': return 'اتصال بارد'
      case 'referral': return 'إحالة'
      case 'social_media': return 'وسائل التواصل'
      case 'website': return 'الموقع الإلكتروني'
      case 'exhibition': return 'معرض'
      case 'other': return 'أخرى'
      default: return 'غير محدد'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600'
    if (probability >= 60) return 'text-blue-600'
    if (probability >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDaysAgo = (date: Date) => {
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'اليوم'
    if (diffDays === 1) return 'أمس'
    return `منذ ${diffDays} أيام`
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{lead.restaurantName}</h3>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(lead.status)}`}>
            {getStatusText(lead.status)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
          <div>المالك: {lead.ownerName}</div>
          <div>النوع: {getBusinessTypeText(lead.businessType)}</div>
          <div>القيمة: {formatCurrency(lead.estimatedValue)}</div>
          <div className={`font-medium ${getProbabilityColor(lead.probability)}`}>
            احتمالية: {lead.probability}%
          </div>
        </div>

        <div className="text-xs text-gray-500">
          آخر تواصل: {getDaysAgo(lead.lastContact)}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-6 rounded-lg border hover:shadow-lg transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{lead.restaurantName}</h3>
          <p className="text-sm text-gray-600">{lead.ownerName} • {getBusinessTypeText(lead.businessType)}</p>
          <p className="text-sm text-gray-500">{lead.location}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(lead.status)}`}>
            {getStatusText(lead.status)}
          </span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            lead.probability >= 70 ? 'bg-green-50 text-green-700' :
            lead.probability >= 50 ? 'bg-blue-50 text-blue-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>
            احتمالية {lead.probability}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">معلومات التواصل</div>
          <div className="text-sm font-medium">📱 {lead.phone}</div>
          <div className="text-sm font-medium">📧 {lead.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">تفاصيل العميل</div>
          <div className="text-sm font-medium">💰 {formatCurrency(lead.estimatedValue)}</div>
          <div className="text-sm font-medium">📊 {getSourceText(lead.source)}</div>
        </div>
      </div>

      {/* Next Action */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-900 mb-1">الإجراء التالي:</div>
        <div className="text-sm text-blue-700">{lead.nextAction}</div>
      </div>

      {/* Last Contact */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <span>آخر تواصل: {formatDate(lead.lastContact)}</span>
        <span>({getDaysAgo(lead.lastContact)})</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onContact?.()
          }}
          className="flex-1 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors"
        >
          📞 تواصل
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
        >
          📝 عرض التفاصيل
        </button>
      </div>

      {/* Notes Preview */}
      {lead.notes.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">ملاحظات:</div>
          <div className="text-sm text-gray-600">
            {lead.notes.slice(0, 2).map((note, index) => (
              <div key={index} className="flex items-start mb-1">
                <span className="text-pink-500 mr-2">•</span>
                <span>{note}</span>
              </div>
            ))}
            {lead.notes.length > 2 && (
              <div className="text-xs text-gray-500">
                +{lead.notes.length - 2} ملاحظة أخرى
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
