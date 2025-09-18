// Workflow Timeline Component
// مكون عرض الخط الزمني للـ Workflow

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WorkflowHistory, WorkflowInstance } from '@/lib/workflow/types'
import { formatDate, cn } from '@/lib/utils'

interface WorkflowTimelineProps {
  workflow: WorkflowInstance
  showAll?: boolean
  maxItems?: number
  className?: string
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  workflow,
  showAll = false,
  maxItems = 10,
  className
}) => {
  const getActionIcon = (action: WorkflowHistory['action']) => {
    const icons = {
      created: '🆕',
      state_changed: '🔄',
      assigned: '👤',
      approved: '✅',
      rejected: '❌',
      commented: '💬',
      updated: '📝',
      completed: '🎉'
    }
    return icons[action] || '📋'
  }

  const getActionColor = (action: WorkflowHistory['action']) => {
    const colors = {
      created: 'text-blue-600 bg-blue-50 border-blue-200',
      state_changed: 'text-purple-600 bg-purple-50 border-purple-200',
      assigned: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      approved: 'text-green-600 bg-green-50 border-green-200',
      rejected: 'text-red-600 bg-red-50 border-red-200',
      commented: 'text-gray-600 bg-gray-50 border-gray-200',
      updated: 'text-orange-600 bg-orange-50 border-orange-200',
      completed: 'text-green-600 bg-green-50 border-green-200'
    }
    return colors[action] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getActionTitle = (action: WorkflowHistory['action']) => {
    const titles = {
      created: 'تم الإنشاء',
      state_changed: 'تغيير الحالة',
      assigned: 'تم التعيين',
      approved: 'تم الاعتماد',
      rejected: 'تم الرفض',
      commented: 'تم التعليق',
      updated: 'تم التحديث',
      completed: 'تم الإكمال'
    }
    return titles[action] || 'عملية'
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'منذ لحظات'
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 30) return `منذ ${diffDays} يوم`
    
    return formatDate(date)
  }

  const displayedHistory = showAll 
    ? workflow.history 
    : workflow.history.slice(0, maxItems)

  const sortedHistory = [...displayedHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <span>🕒</span>
          <span>الخط الزمني</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sortedHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📋</div>
            <p>لا توجد أحداث بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedHistory.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index !== sortedHistory.length - 1 && (
                  <div className="absolute top-10 right-6 w-px h-8 bg-gray-200" />
                )}

                <div className="flex items-start space-x-4 space-x-reverse">
                  {/* Icon */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm border flex-shrink-0',
                    getActionColor(event.action)
                  )}>
                    {getActionIcon(event.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {getActionTitle(event.action)}
                          </h4>
                          {event.fromState && event.toState && (
                            <span className="text-xs text-gray-500">
                              من {event.fromState} إلى {event.toState}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>

                        {/* Actor info */}
                        <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                          <span>👤</span>
                          <span>{event.actor.name}</span>
                          {event.actor.role && (
                            <span className="text-gray-400">({event.actor.role})</span>
                          )}
                        </div>

                        {/* Changes details */}
                        {event.changes && Object.keys(event.changes).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="text-gray-600 font-medium mb-1">التغييرات:</div>
                            {Object.entries(event.changes).map(([key, change]) => (
                              <div key={key} className="text-gray-700">
                                <span className="font-medium">{key}:</span>
                                <span className="text-red-600 mx-1">{change.from}</span>
                                <span className="text-gray-400">←</span>
                                <span className="text-green-600 mx-1">{change.to}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-gray-500 text-left flex-shrink-0 mr-4">
                        <div>{getTimeAgo(event.timestamp)}</div>
                        <div className="text-gray-400 mt-1">
                          {formatDate(event.timestamp, 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Show more button */}
            {!showAll && workflow.history.length > maxItems && (
              <div className="text-center pt-4 border-t">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  عرض جميع الأحداث ({workflow.history.length})
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WorkflowTimeline
