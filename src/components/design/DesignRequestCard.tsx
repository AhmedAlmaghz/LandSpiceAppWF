'use client'

import React from 'react'
import { DesignRequest } from '@/lib/design/types'
import { formatDate } from '@/lib/utils'

interface DesignRequestCardProps {
  request: DesignRequest
  variant?: 'default' | 'compact' | 'detailed'
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onView?: () => void
  onAssign?: () => void
  onApprove?: () => void
  onReject?: () => void
  onUploadDraft?: () => void
  onRequestRevision?: () => void
  showDesignerInfo?: boolean
}

export default function DesignRequestCard({
  request,
  variant = 'default',
  onClick,
  showActions = false,
  onEdit,
  onView,
  onAssign,
  onApprove,
  onReject,
  onUploadDraft,
  onRequestRevision,
  showDesignerInfo = true
}: DesignRequestCardProps) {
  const getStatusColor = (status: DesignRequest['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-orange-100 text-orange-800'
      case 'assigned':
        return 'bg-purple-100 text-purple-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'draft_ready':
        return 'bg-green-100 text-green-800'
      case 'client_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800'
      case 'revision_in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'final_files_ready':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: DesignRequest['status']) => {
    const statusMap = {
      'draft': 'مسودة',
      'submitted': 'مرسل',
      'under_review': 'قيد المراجعة',
      'assigned': 'مُعيّن',
      'in_progress': 'قيد التنفيذ',
      'draft_ready': 'مسودة جاهزة',
      'client_review': 'مراجعة العميل',
      'revision_requested': 'تعديل مطلوب',
      'revision_in_progress': 'تعديل قيد التنفيذ',
      'approved': 'موافق عليه',
      'final_files_ready': 'ملفات نهائية جاهزة',
      'delivered': 'مُسلّم',
      'archived': 'مؤرشف',
      'cancelled': 'ملغي',
      'on_hold': 'معلق'
    }
    return statusMap[status] || status
  }

  const getTypeText = (type: DesignRequest['type']) => {
    const typeMap = {
      'logo': 'شعار',
      'business_card': 'بطاقة عمل',
      'letterhead': 'ورق مراسلات',
      'brochure': 'بروشور',
      'banner': 'بانر',
      'menu': 'قائمة طعام',
      'packaging': 'عبوات',
      'sticker': 'ملصقات',
      'social_media': 'سوشيال ميديا',
      'website': 'موقع ويب',
      'complete_identity': 'هوية بصرية كاملة'
    }
    return typeMap[type] || type
  }

  const getCategoryText = (category: DesignRequest['category']) => {
    const categoryMap = {
      'branding': 'العلامة التجارية',
      'marketing': 'التسويق',
      'print': 'الطباعة',
      'digital': 'الرقمي',
      'packaging': 'التعبئة والتغليف'
    }
    return categoryMap[category] || category
  }

  const getPriorityColor = (priority: DesignRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityText = (priority: DesignRequest['priority']) => {
    const priorityMap = {
      'urgent': 'عاجل',
      'high': 'عالي',
      'medium': 'متوسط',
      'low': 'منخفض'
    }
    return priorityMap[priority] || priority
  }

  const daysUntilDeadline = Math.ceil(
    (request.expectedDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const isOverdue = daysUntilDeadline < 0
  const isDueSoon = daysUntilDeadline <= 3 && daysUntilDeadline >= 0

  const getDesignIcon = (type: DesignRequest['type']) => {
    const iconMap = {
      'logo': '🎨',
      'business_card': '💼',
      'letterhead': '📄',
      'brochure': '📖',
      'banner': '🚩',
      'menu': '📋',
      'packaging': '📦',
      'sticker': '🏷️',
      'social_media': '📱',
      'website': '🌐',
      'complete_identity': '✨'
    }
    return iconMap[type] || '🎨'
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {getDesignIcon(request.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {request.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {request.requestNumber} • {request.client.restaurantName}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {getStatusText(request.status)}
          </span>
          <span className="text-xs text-gray-500">
            {getTypeText(request.type)}
          </span>
          {(isOverdue || isDueSoon) && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              isOverdue ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {isOverdue ? `متأخر ${Math.abs(daysUntilDeadline)} يوم` : `${daysUntilDeadline} يوم متبقي`}
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
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              {getDesignIcon(request.type)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {request.title}
              </h3>
              <p className="text-purple-100">
                {request.requestNumber}
              </p>
              <p className="text-purple-100 text-sm">
                {request.client.restaurantName}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusText(request.status)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
              {getPriorityText(request.priority)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Design Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات التصميم</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">النوع:</span> {getTypeText(request.type)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الفئة:</span> {getCategoryText(request.category)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">التعقيد:</span> 
                <span className={`px-2 py-1 text-xs rounded-full ml-1 ${
                  request.complexity === 'very_complex' ? 'bg-red-100 text-red-800' :
                  request.complexity === 'complex' ? 'bg-orange-100 text-orange-800' :
                  request.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.complexity === 'very_complex' ? 'معقد جداً' :
                   request.complexity === 'complex' ? 'معقد' :
                   request.complexity === 'medium' ? 'متوسط' : 'بسيط'}
                </span>
              </p>
              {request.estimatedCost && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">التكلفة المقدرة:</span> {request.estimatedCost} {request.currency}
                </p>
              )}
            </div>
          </div>

          {/* Client & Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">العميل والتوقيت</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">جهة الاتصال:</span> {request.client.contactPerson}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الهاتف:</span> {request.client.phone}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">تاريخ الطلب:</span> {formatDate(request.requestDate)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">الموعد النهائي:</span> 
                <span className={`mr-1 ${
                  isOverdue ? 'text-red-600 font-semibold' :
                  isDueSoon ? 'text-orange-600 font-semibold' : ''
                }`}>
                  {formatDate(request.expectedDeliveryDate)}
                </span>
              </p>
              {(isOverdue || isDueSoon) && (
                <p className={`text-sm font-medium ${
                  isOverdue ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {isOverdue ? `متأخر ${Math.abs(daysUntilDeadline)} يوم` : `${daysUntilDeadline} يوم متبقي`}
                </p>
              )}
            </div>
          </div>

          {/* Designer & Progress */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">المصمم والتقدم</h4>
            <div className="space-y-1">
              {request.assignedDesigner && showDesignerInfo ? (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">المصمم:</span> {request.assignedDesigner}
                </p>
              ) : (
                <p className="text-sm text-gray-500">لم يتم تعيين مصمم بعد</p>
              )}
              
              {request.estimatedHours && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">الساعات المقدرة:</span> {request.estimatedHours} ساعة
                </p>
              )}
              
              <p className="text-sm text-gray-600">
                <span className="font-medium">الإصدار:</span> {request.version}
              </p>
              
              {request.revisions.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">التعديلات:</span> {request.revisions.length} تعديل
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cultural Preferences */}
        {request.culturalPreferences && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">التفضيلات الثقافية</h4>
            <div className="flex flex-wrap gap-2">
              {request.culturalPreferences.yemeniCulturalElements && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  🇾🇪 عناصر يمنية
                </span>
              )}
              {request.culturalPreferences.islamicCompliant && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  ☪️ متوافق إسلامياً
                </span>
              )}
              {request.culturalPreferences.includeTraditionalElements && (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  🏛️ عناصر تراثية
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                خط: {request.culturalPreferences.arabicFont}
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {request.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">العلامات</h4>
            <div className="flex flex-wrap gap-2">
              {request.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
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
              
              {onEdit && request.status === 'draft' && (
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
              
              {onAssign && ['submitted', 'under_review'].includes(request.status) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssign()
                  }}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors"
                >
                  تعيين مصمم
                </button>
              )}
              
              {onUploadDraft && request.status === 'in_progress' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUploadDraft()
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors"
                >
                  رفع مسودة
                </button>
              )}
              
              {onApprove && request.status === 'draft_ready' && (
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
              
              {onRequestRevision && request.status === 'draft_ready' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRequestRevision()
                  }}
                  className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg hover:bg-orange-100 transition-colors"
                >
                  طلب تعديل
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
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              {getDesignIcon(request.type)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {request.title}
              </h3>
              <p className="text-purple-100 text-lg mb-2">
                {request.requestNumber}
              </p>
              <div className="flex items-center space-x-4 space-x-reverse text-purple-100">
                <span className="text-sm">
                  {request.client.restaurantName}
                </span>
                <span className="text-sm">•</span>
                <span className="text-sm">
                  {getTypeText(request.type)}
                </span>
                <span className="text-sm">•</span>
                <span className="text-sm">
                  {getCategoryText(request.category)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusText(request.status)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
              {getPriorityText(request.priority)}
            </span>
            {request.estimatedCost && (
              <div className="text-right">
                <div className="text-white text-lg font-bold">
                  {request.estimatedCost}
                </div>
                <div className="text-purple-100 text-sm">
                  {request.currency}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content - includes status timeline and more details */}
      <div className="p-6">
        {/* Status Timeline */}
        {request.statusHistory.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">سجل الحالة</h4>
            <div className="space-y-2">
              {request.statusHistory.slice(-3).map((history, index) => (
                <div key={history.id} className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-purple-500' : 'bg-gray-300'
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
                    {history.reason && (
                      <p className="text-xs text-gray-600 mt-1">{history.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rest of the content similar to default card but more detailed */}
        {renderDefaultCard()}
      </div>
    </div>
  )

  if (variant === 'compact') return renderCompactCard()
  if (variant === 'detailed') return renderDetailedCard()
  return renderDefaultCard()
}
