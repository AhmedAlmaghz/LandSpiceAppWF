'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate, cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
    role?: string
  }
  metadata?: Record<string, any>
  actionable?: {
    label: string
    onClick: () => void
  }
}

interface ActivityFeedProps {
  activities: Activity[]
  title?: string
  description?: string
  showLoadMore?: boolean
  maxItems?: number
  autoRefresh?: boolean
  refreshInterval?: number
  onLoadMore?: () => void
  onRefresh?: () => void
  className?: string
  emptyState?: {
    icon?: React.ReactNode
    title: string
    description: string
  }
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'النشاطات الأخيرة',
  description = 'آخر العمليات في النظام',
  showLoadMore = true,
  maxItems = 10,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  onLoadMore,
  onRefresh,
  className,
  emptyState
}) => {
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setDisplayedActivities(activities.slice(0, maxItems))
  }, [activities, maxItems])

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(async () => {
        setIsRefreshing(true)
        await onRefresh()
        setIsRefreshing(false)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, onRefresh, refreshInterval])

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️',
      error: '❌'
    }
    return icons[type]
  }

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      success: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200',
      error: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[type]
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'منذ لحظات'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `منذ ${diffInDays} يوم`
  }

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore()
    } else {
      const currentLength = displayedActivities.length
      const newActivities = activities.slice(0, currentLength + maxItems)
      setDisplayedActivities(newActivities)
    }
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
  }

  if (activities.length === 0 && emptyState) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">
              {emptyState.icon || '📋'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState.title}
            </h3>
            <p className="text-gray-600 max-w-sm">
              {emptyState.description}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {autoRefresh && (
              <div className={cn(
                'w-2 h-2 rounded-full',
                isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              )} />
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <div className="animate-spin ml-1">⟳</div>
                ) : (
                  '🔄'
                )}
                تحديث
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {index !== displayedActivities.length - 1 && (
                <div className="absolute top-10 right-6 w-px h-8 bg-gray-200" />
              )}
              
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm border',
                  getActivityColor(activity.type)
                )}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      
                      {activity.user && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="ml-1">👤</span>
                          {activity.user.name}
                          {activity.user.role && (
                            <span className="mr-2">({activity.user.role})</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {activity.actionable && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={activity.actionable.onClick}
                      >
                        {activity.actionable.label}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {showLoadMore && displayedActivities.length < activities.length && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleLoadMore}
              className="w-full"
            >
              عرض المزيد ({activities.length - displayedActivities.length} متبقي)
            </Button>
          </div>
        )}
        
        {displayedActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📋</div>
            <p>لا توجد نشاطات حديثة</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
