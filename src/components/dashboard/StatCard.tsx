'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  size = 'md',
  className,
  onClick,
  loading = false
}) => {
  const colorVariants = {
    blue: {
      icon: 'text-blue-600 bg-blue-100',
      trend: 'text-blue-600',
      accent: 'border-r-blue-500'
    },
    green: {
      icon: 'text-green-600 bg-green-100',
      trend: 'text-green-600',
      accent: 'border-r-green-500'
    },
    red: {
      icon: 'text-red-600 bg-red-100',
      trend: 'text-red-600',
      accent: 'border-r-red-500'
    },
    yellow: {
      icon: 'text-yellow-600 bg-yellow-100',
      trend: 'text-yellow-600',
      accent: 'border-r-yellow-500'
    },
    purple: {
      icon: 'text-purple-600 bg-purple-100',
      trend: 'text-purple-600',
      accent: 'border-r-purple-500'
    },
    orange: {
      icon: 'text-orange-600 bg-orange-100',
      trend: 'text-orange-600',
      accent: 'border-r-orange-500'
    },
    gray: {
      icon: 'text-gray-600 bg-gray-100',
      trend: 'text-gray-600',
      accent: 'border-r-gray-500'
    }
  }

  const sizeVariants = {
    sm: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-xl',
      icon: 'w-8 h-8',
      iconText: 'text-base'
    },
    md: {
      card: 'p-6',
      title: 'text-sm',
      value: 'text-2xl',
      icon: 'w-10 h-10',
      iconText: 'text-lg'
    },
    lg: {
      card: 'p-8',
      title: 'text-base',
      value: 'text-3xl',
      icon: 'w-12 h-12',
      iconText: 'text-xl'
    }
  }

  const colors = colorVariants[color] || colorVariants.blue // fallback to blue if color not found
  const sizes = sizeVariants[size] || sizeVariants.md   // fallback to md if size not found

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className={sizes.card}>
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className={cn('rounded-full bg-gray-200', sizes.icon)}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-all duration-200 border-r-4',
        colors.accent,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={sizes.card}>
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className={cn('font-medium text-gray-600', sizes.title)}>
              {title}
            </CardTitle>
            
            <div className={cn('font-bold text-gray-900', sizes.value)}>
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </div>
            
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
            
            {trend && (
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className={cn(
                  'text-xs font-medium',
                  trend.isPositive !== false ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.isPositive !== false ? '↗' : '↘'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              'rounded-full flex items-center justify-center flex-shrink-0',
              colors.icon,
              sizes.icon
            )}>
              <div className={sizes.iconText}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
