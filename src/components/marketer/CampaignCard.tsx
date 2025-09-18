// Campaign Card Component
// مكون بطاقة الحملة التسويقية

import React from 'react'

interface Campaign {
  id: string
  name: string
  type: 'cold_calling' | 'digital_ads' | 'social_media' | 'referral_program' | 'exhibition' | 'email_marketing'
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget: number
  spent: number
  leads: number
  conversions: number
  roi: number
  startDate: Date
  endDate: Date
}

interface CampaignCardProps {
  campaign: Campaign
  onClick?: () => void
  variant?: 'default' | 'compact'
  className?: string
}

export default function CampaignCard({
  campaign,
  onClick,
  variant = 'default',
  className = ''
}: CampaignCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getCampaignTypeText = (type: Campaign['type']) => {
    switch (type) {
      case 'cold_calling': return 'اتصال بارد'
      case 'digital_ads': return 'إعلانات رقمية'
      case 'social_media': return 'وسائل التواصل'
      case 'referral_program': return 'برنامج إحالة'
      case 'exhibition': return 'معارض'
      case 'email_marketing': return 'تسويق بالبريد'
      default: return 'غير محدد'
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'planning': return 'تخطيط'
      case 'paused': return 'متوقف'
      case 'completed': return 'مكتمل'
      case 'cancelled': return 'ملغى'
      default: return 'غير محدد'
    }
  }

  const getRoiColor = (roi: number) => {
    if (roi >= 200) return 'text-green-600'
    if (roi >= 150) return 'text-blue-600'
    if (roi >= 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
            {getStatusText(campaign.status)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
          <div>النوع: {getCampaignTypeText(campaign.type)}</div>
          <div>الميزانية: {formatCurrency(campaign.budget)}</div>
          <div>العملاء: {campaign.leads}</div>
          <div>التحويلات: {campaign.conversions}</div>
        </div>

        <div className="text-right">
          <span className={`text-sm font-bold ${getRoiColor(campaign.roi)}`}>
            ROI: {campaign.roi}%
          </span>
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">{campaign.name}</h3>
          <p className="text-sm text-gray-600">{getCampaignTypeText(campaign.type)}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(campaign.status)}`}>
          {getStatusText(campaign.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{formatCurrency(campaign.budget)}</div>
          <div className="text-xs text-gray-600">الميزانية</div>
          <div className="text-xs text-gray-500">مُستخدم: {formatCurrency(campaign.spent)}</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">{campaign.leads}</div>
          <div className="text-xs text-gray-600">عملاء محتملين</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">{campaign.conversions}</div>
          <div className="text-xs text-gray-600">تحويلات</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${getRoiColor(campaign.roi)}`}>{campaign.roi}%</div>
          <div className="text-xs text-gray-600">العائد على الاستثمار</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>معدل التحويل</span>
          <span>{campaign.leads > 0 ? Math.round((campaign.conversions / campaign.leads) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-pink-600 h-2 rounded-full transition-all" 
            style={{ 
              width: `${campaign.leads > 0 ? Math.min((campaign.conversions / campaign.leads) * 100, 100) : 0}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Budget Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>استهلاك الميزانية</span>
          <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
