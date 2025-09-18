'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate, cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: {
    id: string
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
  priority: 'low' | 'medium' | 'high'
  category?: string
  metadata?: Record<string, any>
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: string) => void
  onClearAll: () => void
  maxItems?: number
  showCategories?: boolean
  allowActions?: boolean
  className?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  maxItems = 10,
  showCategories = true,
  allowActions = true,
  className
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.read
      if (filter === 'read') return notification.read
      return true
    })
    .filter(notification => {
      if (categoryFilter === 'all') return true
      return notification.category === categoryFilter
    })
    .slice(0, maxItems)

  const unreadCount = notifications.filter(n => !n.read).length

  const categories = Array.from(new Set(notifications.map(n => n.category).filter(Boolean)))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }
    return icons[type]
  }

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      info: 'border-r-blue-500 bg-blue-50',
      success: 'border-r-green-500 bg-green-50',
      warning: 'border-r-yellow-500 bg-yellow-50',
      error: 'border-r-red-500 bg-red-50'
    }
    return colors[type]
  }

  const getPriorityIcon = (priority: Notification['priority']) => {
    const icons = {
      low: '⬇️',
      medium: '➡️',
      high: '⬆️'
    }
    return icons[priority]
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

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute left-0 top-full mt-2 w-96 max-h-[80vh] overflow-hidden shadow-lg border z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الإشعارات</CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                  >
                    قراءة الكل
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-red-600 hover:text-red-700"
                >
                  مسح الكل
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 space-x-reverse mt-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="all">الكل ({notifications.length})</option>
                <option value="unread">غير مقروءة ({unreadCount})</option>
                <option value="read">مقروءة ({notifications.length - unreadCount})</option>
              </select>

              {showCategories && categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="all">جميع الفئات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">📭</div>
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-r-4 transition-all duration-200',
                        getNotificationColor(notification.type),
                        !notification.read && 'shadow-sm',
                        notification.read && 'opacity-75'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 space-x-reverse flex-1">
                          <div className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 space-x-reverse mb-1">
                              <h4 className={cn(
                                'text-sm font-medium',
                                !notification.read && 'font-semibold'
                              )}>
                                {notification.title}
                              </h4>
                              <span className="text-xs">
                                {getPriorityIcon(notification.priority)}
                              </span>
                              {notification.category && (
                                <span className="text-xs bg-gray-200 px-1 rounded">
                                  {notification.category}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              
                              <div className="flex items-center space-x-2 space-x-reverse">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="text-xs"
                                  >
                                    تمت القراءة
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteNotification(notification.id)}
                                  className="text-xs text-red-600 hover:text-red-700"
                                >
                                  حذف
                                </Button>
                              </div>
                            </div>

                            {/* Action buttons */}
                            {allowActions && notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-2 space-x-reverse mt-3">
                                {notification.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    variant={action.variant || 'secondary'}
                                    size="sm"
                                    onClick={action.onClick}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredNotifications.length > 0 && notifications.length > maxItems && (
              <div className="p-4 border-t bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => console.log('عرض جميع الإشعارات')}
                >
                  عرض جميع الإشعارات ({notifications.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NotificationCenter
