// Workflow Status Board Component (Kanban Style)
// مكون لوحة حالات Workflow (نمط كانبان)

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { WorkflowInstance, WorkflowState } from '@/lib/workflow/types'
import { cn } from '@/lib/utils'
import WorkflowCard from './WorkflowCard'

interface WorkflowStatusBoardProps {
  workflows: WorkflowInstance[]
  states: WorkflowState[]
  onMoveWorkflow?: (workflowId: string, newState: string) => void
  onViewWorkflow?: (workflowId: string) => void
  onTakeAction?: (workflowId: string, action: string) => void
  className?: string
}

const WorkflowStatusBoard: React.FC<WorkflowStatusBoardProps> = ({
  workflows,
  states,
  onMoveWorkflow,
  onViewWorkflow,
  onTakeAction,
  className
}) => {
  const [filter, setFilter] = useState<string>('all')

  const getStateColor = (category?: string) => {
    const colors = {
      waiting: 'border-t-yellow-500 bg-yellow-50',
      in_progress: 'border-t-blue-500 bg-blue-50',
      review: 'border-t-purple-500 bg-purple-50',
      completed: 'border-t-green-500 bg-green-50',
      failed: 'border-t-red-500 bg-red-50'
    }
    return colors[category as keyof typeof colors] || 'border-t-gray-500 bg-gray-50'
  }

  const getWorkflowsForState = (stateId: string) => {
    return workflows.filter(w => w.currentState === stateId)
  }

  const getStateIcon = (category?: string) => {
    const icons = {
      waiting: '⏳',
      in_progress: '🔄',
      review: '👀',
      completed: '✅',
      failed: '❌'
    }
    return icons[category as keyof typeof icons] || '📋'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">لوحة حالات Workflows</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="all">جميع Workflows</option>
          <option value="high_priority">أولوية عالية</option>
          <option value="my_workflows">Workflows الخاصة بي</option>
        </select>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {states.map(state => {
          const stateWorkflows = getWorkflowsForState(state.id)
          
          return (
            <Card key={state.id} className={cn('border-t-4', getStateColor(state.category))}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span>{getStateIcon(state.category)}</span>
                    <span>{state.displayName}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {stateWorkflows.length}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {stateWorkflows.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-lg mb-1">📭</div>
                    <p className="text-xs">لا توجد workflows</p>
                  </div>
                ) : (
                  stateWorkflows.map(workflow => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onViewDetails={onViewWorkflow}
                      onTakeAction={onTakeAction}
                      compact={true}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{workflows.length}</div>
            <div className="text-sm text-gray-600">إجمالي Workflows</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {workflows.filter(w => w.status === 'running').length}
            </div>
            <div className="text-sm text-gray-600">قيد التنفيذ</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter(w => w.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">مكتملة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {workflows.filter(w => w.priority === 'urgent').length}
            </div>
            <div className="text-sm text-gray-600">عاجلة</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WorkflowStatusBoard
