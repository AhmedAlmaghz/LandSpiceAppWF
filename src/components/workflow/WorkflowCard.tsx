// Workflow Card Component
// مكون عرض بطاقة Workflow

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { WorkflowInstance } from '@/lib/workflow/types'
import { formatDate, cn } from '@/lib/utils'

interface WorkflowCardProps {
  workflow: WorkflowInstance
  onViewDetails?: (workflowId: string) => void
  onTakeAction?: (workflowId: string, action: string) => void
  compact?: boolean
  showActions?: boolean
  className?: string
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onViewDetails,
  onTakeAction,
  compact = false,
  showActions = true,
  className
}) => {
  const getStatusColor = (status: WorkflowInstance['status']) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || colors.running
  }

  const getPriorityColor = (priority: WorkflowInstance['priority']) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority]
  }

  const getPriorityIcon = (priority: WorkflowInstance['priority']) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    }
    return icons[priority]
  }

  const getTimeElapsed = () => {
    const now = new Date()
    const diffMs = now.getTime() - workflow.createdAt.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) return `${diffDays} يوم`
    if (diffHours > 0) return `${diffHours} ساعة`
    return 'أقل من ساعة'
  }

  const getCurrentStateInfo = () => {
    // This would typically come from the workflow definition
    // For now, we'll create a simple mapping
    const stateDisplayNames: Record<string, string> = {
      initial_request: 'طلب أولي',
      under_review: 'قيد المراجعة',
      approved: 'معتمد',
      rejected: 'مرفوض',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل'
    }
    
    return stateDisplayNames[workflow.currentState] || workflow.currentState
  }

  const getAvailableActions = () => {
    // This would be determined by the current state and user permissions
    const actions = []
    
    if (workflow.status === 'running') {
      actions.push({ id: 'view', label: 'عرض التفاصيل', variant: 'outline' as const })
      
      if (workflow.currentState === 'under_review') {
        actions.push({ id: 'approve', label: 'اعتماد', variant: 'primary' as const })
        actions.push({ id: 'reject', label: 'رفض', variant: 'danger' as const })
      }
    }
    
    return actions
  }

  if (compact) {
    return (
      <div className={cn(
        'flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow',
        className
      )}>
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span>{getPriorityIcon(workflow.priority)}</span>
            <span className="font-medium text-sm">{workflow.title}</span>
          </div>
          <span className={cn(
            'px-2 py-1 text-xs rounded-full border',
            getStatusColor(workflow.status)
          )}>
            {getCurrentStateInfo()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
          <span>{getTimeElapsed()}</span>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(workflow.id)}
            >
              عرض
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{workflow.title}</CardTitle>
            <CardDescription className="mt-1">
              {workflow.description || 'لا يوجد وصف'}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse ml-4">
            <span className={getPriorityColor(workflow.priority)}>
              {getPriorityIcon(workflow.priority)}
            </span>
            <span className={cn(
              'px-2 py-1 text-xs rounded-full border whitespace-nowrap',
              getStatusColor(workflow.status)
            )}>
              {getCurrentStateInfo()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Workflow Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">المبادر:</span>
            <span className="mr-2 font-medium">{workflow.initiator.name}</span>
          </div>
          <div>
            <span className="text-gray-600">تاريخ الإنشاء:</span>
            <span className="mr-2">{formatDate(workflow.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-600">الوقت المنقضي:</span>
            <span className="mr-2">{getTimeElapsed()}</span>
          </div>
          {workflow.dueDate && (
            <div>
              <span className="text-gray-600">موعد الاستحقاق:</span>
              <span className={cn(
                'mr-2',
                new Date(workflow.dueDate) < new Date() ? 'text-red-600 font-medium' : ''
              )}>
                {formatDate(workflow.dueDate)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Info */}
        {workflow.tasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">المهام:</span>
              <span>{workflow.tasks.filter(t => t.status === 'completed').length} / {workflow.tasks.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(workflow.tasks.filter(t => t.status === 'completed').length / workflow.tasks.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Participants */}
        {workflow.participants.length > 1 && (
          <div>
            <span className="text-sm text-gray-600">المشاركون:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {workflow.participants.slice(0, 3).map(participant => (
                <span 
                  key={participant.id}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {participant.name}
                </span>
              ))}
              {workflow.participants.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{workflow.participants.length - 3} آخرين
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex space-x-2 space-x-reverse">
              {getAvailableActions().map(action => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => onTakeAction?.(workflow.id, action.id)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(workflow.id)}
              >
                عرض التفاصيل
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WorkflowCard
