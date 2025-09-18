// Workflow Task List Component
// مكون عرض قائمة المهام

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { WorkflowTask, WorkflowParticipant } from '@/lib/workflow/types'
import { formatDate, cn } from '@/lib/utils'

interface WorkflowTaskListProps {
  tasks: WorkflowTask[]
  currentUser?: WorkflowParticipant
  onCompleteTask?: (taskId: string) => void
  onAssignTask?: (taskId: string, assignee: WorkflowParticipant) => void
  onAddComment?: (taskId: string, comment: string) => void
  showCompleted?: boolean
  className?: string
}

const WorkflowTaskList: React.FC<WorkflowTaskListProps> = ({
  tasks,
  currentUser,
  onCompleteTask,
  onAssignTask,
  onAddComment,
  showCompleted = true,
  className
}) => {
  const [filter, setFilter] = useState<'all' | 'my_tasks' | 'pending'>('all')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const getTaskIcon = (type: WorkflowTask['type']) => {
    const icons = {
      approval: '✋',
      review: '👀',
      data_entry: '📝',
      file_upload: '📎',
      custom: '⚙️'
    }
    return icons[type] || '📋'
  }

  const getStatusColor = (status: WorkflowTask['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status]
  }

  const getStatusText = (status: WorkflowTask['status']) => {
    const texts = {
      pending: 'معلقة',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
      overdue: 'متأخرة'
    }
    return texts[status]
  }

  const getPriorityColor = (priority: WorkflowTask['priority']) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority]
  }

  const isTaskOverdue = (task: WorkflowTask) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  }

  const canUserCompleteTask = (task: WorkflowTask) => {
    if (!currentUser || task.status === 'completed') return false
    if (!task.assignee) return true // Unassigned tasks can be completed by anyone
    return task.assignee.id === currentUser.id
  }

  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.status === 'completed') return false
    
    switch (filter) {
      case 'my_tasks':
        return currentUser && task.assignee?.id === currentUser.id
      case 'pending':
        return task.status === 'pending' || task.status === 'in_progress'
      default:
        return true
    }
  })

  const getTaskProgress = (task: WorkflowTask) => {
    if (task.status === 'completed') return 100
    if (task.status === 'in_progress') return 50
    return 0
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>المهام</CardTitle>
            <CardDescription>
              {filteredTasks.length} مهمة
              {currentUser && filter === 'my_tasks' && ' - مهامي'}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">جميع المهام</option>
              {currentUser && <option value="my_tasks">مهامي</option>}
              <option value="pending">المعلقة</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">📋</div>
            <p>لا توجد مهام</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'border rounded-lg p-4 transition-all duration-200',
                  isTaskOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200',
                  expandedTask === task.id && 'shadow-md'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 space-x-reverse flex-1">
                    {/* Task Icon */}
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {getTaskIcon(task.type)}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 space-x-reverse mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </h4>
                        
                        <span className={cn(
                          'px-2 py-1 text-xs rounded-full border whitespace-nowrap',
                          getStatusColor(task.status)
                        )}>
                          {getStatusText(task.status)}
                        </span>

                        <span className={cn('text-xs', getPriorityColor(task.priority))}>
                          {task.priority === 'urgent' && '🔥'}
                          {task.priority === 'high' && '⚡'}
                          {task.priority === 'medium' && '⚠️'}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}

                      {/* Task Details */}
                      <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                        {task.assignee && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <span>👤</span>
                            <span>{task.assignee.name}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className={cn(
                            'flex items-center space-x-1 space-x-reverse',
                            isTaskOverdue(task) && 'text-red-600 font-medium'
                          )}>
                            <span>📅</span>
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        
                        {task.estimatedDuration && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <span>⏱️</span>
                            <span>{task.estimatedDuration} دقيقة</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {task.status !== 'pending' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={cn(
                                'h-1.5 rounded-full transition-all duration-300',
                                task.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                              )}
                              style={{ width: `${getTaskProgress(task)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 space-x-reverse ml-4">
                    {canUserCompleteTask(task) && task.status !== 'completed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onCompleteTask?.(task.id)}
                      >
                        إكمال
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedTask(
                        expandedTask === task.id ? null : task.id
                      )}
                    >
                      {expandedTask === task.id ? 'إخفاء' : 'تفاصيل'}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTask === task.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Requirements */}
                    {task.requirements && task.requirements.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">المتطلبات:</h5>
                        <div className="space-y-1">
                          {task.requirements.map(req => (
                            <div key={req.id} className="flex items-center space-x-2 space-x-reverse text-sm">
                              <span className={req.isRequired ? '🔴' : '🔵'}></span>
                              <span className={req.isRequired ? 'font-medium' : ''}>{req.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    {task.results && task.results.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">النتائج:</h5>
                        <div className="space-y-2">
                          {task.results.map(result => (
                            <div key={result.id} className="bg-gray-50 p-2 rounded text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{result.type}</span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(result.timestamp)}
                                </span>
                              </div>
                              {result.comment && (
                                <p className="text-gray-600">{result.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">التبعيات:</h5>
                        <div className="text-sm text-gray-600">
                          يعتمد على {task.dependencies.length} مهمة أخرى
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WorkflowTaskList
