'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'
  disabled?: boolean
  badge?: {
    text: string
    color?: 'red' | 'green' | 'yellow' | 'blue'
  }
  onClick: () => void
  shortcut?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
  description?: string
  columns?: 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = 'إجراءات سريعة',
  description = 'الوصول السريع للعمليات المهمة',
  columns = 2,
  size = 'md',
  className
}) => {
  const colorVariants = {
    blue: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700',
    green: 'hover:bg-green-50 hover:border-green-200 hover:text-green-700',
    red: 'hover:bg-red-50 hover:border-red-200 hover:text-red-700',
    yellow: 'hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700',
    purple: 'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700',
    orange: 'hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700'
  }

  const badgeColors = {
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800'
  }

  const sizeVariants = {
    sm: {
      grid: 'gap-3',
      action: 'p-3',
      icon: 'text-lg',
      title: 'text-sm',
      description: 'text-xs'
    },
    md: {
      grid: 'gap-4',
      action: 'p-4',
      icon: 'text-xl',
      title: 'text-sm',
      description: 'text-xs'
    },
    lg: {
      grid: 'gap-6',
      action: 'p-6',
      icon: 'text-2xl',
      title: 'text-base',
      description: 'text-sm'
    }
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  const sizes = sizeVariants[size]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn(
          'grid',
          columnClasses[columns],
          sizes.grid
        )}>
          {actions.map((action) => (
            <div
              key={action.id}
              className={cn(
                'relative border border-gray-200 rounded-lg transition-all duration-200 cursor-pointer',
                'flex flex-col items-center text-center',
                action.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : cn(
                      'hover:scale-[1.02] hover:shadow-md',
                      colorVariants[action.color || 'blue']
                    ),
                sizes.action
              )}
              onClick={() => !action.disabled && action.onClick()}
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute -top-2 -left-2">
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    badgeColors[action.badge.color || 'red']
                  )}>
                    {action.badge.text}
                  </span>
                </div>
              )}

              {/* Shortcut */}
              {action.shortcut && (
                <div className="absolute top-2 left-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {action.shortcut}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'mb-3 flex items-center justify-center',
                sizes.icon
              )}>
                {action.icon}
              </div>

              {/* Title */}
              <h3 className={cn(
                'font-medium text-gray-900 mb-1',
                sizes.title
              )}>
                {action.title}
              </h3>

              {/* Description */}
              {action.description && (
                <p className={cn(
                  'text-gray-600 leading-relaxed',
                  sizes.description
                )}>
                  {action.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {actions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">⚡</div>
            <p>لا توجد إجراءات متاحة حالياً</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuickActions
