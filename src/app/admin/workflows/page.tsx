'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import WorkflowStatusBoard from '@/components/workflow/WorkflowStatusBoard'
import WorkflowCard from '@/components/workflow/WorkflowCard'
import Button from '@/components/ui/Button'
import { WorkflowInstance, WorkflowState } from '@/lib/workflow/types'
import { allWorkflowDefinitions } from '@/lib/workflow/definitions'

export default function WorkflowsPage() {
  const { data: session, status } = useSession()
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([])
  const [view, setView] = useState<'board' | 'list'>('board')

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user?.role !== 'admin') redirect('/auth/signin')

  useEffect(() => {
    // Mock workflows data
    const mockWorkflows: WorkflowInstance[] = [
      {
        id: 'wf-001',
        workflowDefinitionId: 'restaurant_order_v1',
        title: 'طلب مطعم البيك',
        currentState: 'under_review',
        status: 'running',
        priority: 'high',
        initiator: {
          id: 'rest-001',
          type: 'user',
          name: 'مطعم البيك',
          role: 'restaurant',
          permissions: [],
          isActive: true
        },
        participants: [],
        data: { formData: {}, files: [], customFields: {}, approvals: [], comments: [] },
        history: [],
        tasks: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    setWorkflows(mockWorkflows)
  }, [])

  const sampleStates: WorkflowState[] = allWorkflowDefinitions[0]?.states || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة Workflows</h1>
        <div className="flex space-x-3 space-x-reverse">
          <div className="flex border rounded">
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 ${view === 'board' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              لوحة
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              قائمة
            </button>
          </div>
          <Button variant="primary">إنشاء Workflow</Button>
        </div>
      </div>

      {view === 'board' ? (
        <WorkflowStatusBoard
          workflows={workflows}
          states={sampleStates}
          onViewWorkflow={(id) => console.log('View:', id)}
          onTakeAction={(id, action) => console.log('Action:', action, id)}
        />
      ) : (
        <div className="space-y-4">
          {workflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onViewDetails={(id) => console.log('Details:', id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
