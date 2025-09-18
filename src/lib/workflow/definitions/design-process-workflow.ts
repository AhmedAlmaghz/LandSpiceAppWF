// Design Process Workflow Definition
// تعريف تدفق عمل عملية التصميم

import { WorkflowDefinition } from '../types'

export const designProcessWorkflow: WorkflowDefinition = {
  id: 'design_process_v1',
  name: 'عملية التصميم',
  description: 'تدفق العمل لعملية تصميم العبوات والشطة حسب متطلبات المطعم',
  version: '1.0.0',
  category: 'design_process',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  states: [
    {
      id: 'design_brief_collection',
      name: 'design_brief_collection',
      displayName: 'جمع متطلبات التصميم',
      description: 'جمع المتطلبات والمواصفات من المطعم',
      type: 'start',
      category: 'waiting',
      color: '#3b82f6',
      icon: '📋',
      isInitial: true,
      requiredFields: ['brandColors', 'logo', 'designPreferences', 'packagingType']
    },
    {
      id: 'initial_design',
      name: 'initial_design',
      displayName: 'التصميم الأولي',
      description: 'إنشاء التصميم الأولي بناء على المتطلبات',
      type: 'intermediate',
      category: 'in_progress',
      color: '#f59e0b',
      icon: '🎨',
      permissions: [
        {
          role: 'designer',
          actions: ['view', 'edit']
        },
        {
          role: 'design_manager',
          actions: ['view', 'edit', 'approve']
        }
      ],
      timeouts: [
        {
          duration: 3,
          unit: 'days',
          action: 'escalate',
          target: 'design_manager'
        }
      ]
    },
    {
      id: 'client_review',
      name: 'client_review',
      displayName: 'مراجعة العميل',
      description: 'المطعم يراجع التصميم المقترح',
      type: 'intermediate',
      category: 'review',
      color: '#8b5cf6',
      icon: '👀',
      permissions: [
        {
          role: 'restaurant',
          actions: ['view', 'approve', 'reject', 'comment']
        }
      ],
      timeouts: [
        {
          duration: 5,
          unit: 'days',
          action: 'auto_approve',
          message: 'تم اعتماد التصميم تلقائياً بعد انتهاء فترة المراجعة'
        }
      ]
    },
    {
      id: 'revision_required',
      name: 'revision_required',
      displayName: 'تعديل مطلوب',
      description: 'المطعم طلب تعديلات على التصميم',
      type: 'intermediate',
      category: 'waiting',
      color: '#f59e0b',
      icon: '🔄'
    },
    {
      id: 'design_approved',
      name: 'design_approved',
      displayName: 'التصميم معتمد',
      description: 'تم اعتماد التصميم النهائي',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '✅'
    },
    {
      id: 'design_finalized',
      name: 'design_finalized',
      displayName: 'التصميم نهائي',
      description: 'تم إنهاء التصميم وجاهز للإنتاج',
      type: 'end',
      category: 'completed',
      color: '#10b981',
      icon: '🎯',
      isFinal: true,
      actions: [
        {
          id: 'prepare_production_files',
          type: 'file_generation',
          name: 'تحضير ملفات الإنتاج',
          description: 'تحضير الملفات للطباعة والإنتاج',
          parameters: {
            formats: ['pdf', 'ai', 'png'],
            resolution: '300dpi',
            colorProfile: 'CMYK'
          }
        }
      ]
    }
  ],

  transitions: [
    {
      id: 'start_design',
      from: 'design_brief_collection',
      to: 'initial_design',
      name: 'start_design',
      displayName: 'بدء التصميم',
      requiredRole: 'design_manager',
      conditions: [
        {
          id: 'brief_complete',
          type: 'field_value',
          field: 'briefComplete',
          operator: 'equals',
          value: true
        }
      ]
    },
    {
      id: 'submit_for_review',
      from: 'initial_design',
      to: 'client_review',
      name: 'submit_for_review',
      displayName: 'تقديم للمراجعة',
      requiredRole: 'designer'
    },
    {
      id: 'request_revision',
      from: 'client_review',
      to: 'revision_required',
      name: 'request_revision',
      displayName: 'طلب تعديل',
      requiredRole: 'restaurant',
      conditions: [
        {
          id: 'has_feedback',
          type: 'field_value',
          field: 'feedback',
          operator: 'exists'
        }
      ]
    },
    {
      id: 'approve_design',
      from: 'client_review',
      to: 'design_approved',
      name: 'approve_design',
      displayName: 'اعتماد التصميم',
      requiredRole: 'restaurant'
    },
    {
      id: 'revise_design',
      from: 'revision_required',
      to: 'client_review',
      name: 'revise_design',
      displayName: 'تعديل التصميم',
      requiredRole: 'designer'
    },
    {
      id: 'finalize_design',
      from: 'design_approved',
      to: 'design_finalized',
      name: 'finalize_design',
      displayName: 'إنهاء التصميم',
      requiredRole: 'design_manager'
    }
  ],

  roles: [
    {
      id: 'restaurant',
      name: 'restaurant',
      displayName: 'مطعم',
      permissions: ['view', 'comment', 'approve', 'reject'],
      hierarchy: 1
    },
    {
      id: 'designer',
      name: 'designer',
      displayName: 'مصمم',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 2
    },
    {
      id: 'design_manager',
      name: 'design_manager',
      displayName: 'مدير التصميم',
      permissions: ['view', 'edit', 'approve', 'comment', 'reassign'],
      hierarchy: 3
    }
  ],

  settings: {
    maxConcurrentInstances: 50,
    defaultTimeout: 72, // 3 days
    enableAuditLog: true,
    enableNotifications: true,
    businessHours: {
      timezone: 'Asia/Riyadh',
      workDays: [0, 1, 2, 3, 4],
      startTime: '09:00',
      endTime: '18:00'
    }
  }
}
