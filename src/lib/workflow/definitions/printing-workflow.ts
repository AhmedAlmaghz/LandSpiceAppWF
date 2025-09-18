// Printing Workflow Definition
// تعريف تدفق عمل عملية الطباعة

import { WorkflowDefinition } from '../types'

export const printingWorkflow: WorkflowDefinition = {
  id: 'printing_process_v1',
  name: 'عملية الطباعة والإنتاج',
  description: 'تدفق العمل لطباعة وإنتاج عبوات الشطة والكاتشب',
  version: '1.0.0',
  category: 'printing',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  states: [
    {
      id: 'production_planning',
      name: 'production_planning',
      displayName: 'تخطيط الإنتاج',
      description: 'تخطيط عملية الإنتاج وتحديد المواد المطلوبة',
      type: 'start',
      category: 'waiting',
      color: '#3b82f6',
      icon: '📊',
      isInitial: true,
      requiredFields: ['quantity', 'deliveryDate', 'specifications']
    },
    {
      id: 'material_preparation',
      name: 'material_preparation',
      displayName: 'تحضير المواد',
      description: 'تحضير وفحص المواد الخام المطلوبة',
      type: 'intermediate',
      category: 'in_progress',
      color: '#f59e0b',
      icon: '📦',
      permissions: [
        {
          role: 'warehouse_manager',
          actions: ['view', 'edit', 'approve']
        }
      ]
    },
    {
      id: 'printing_setup',
      name: 'printing_setup',
      displayName: 'إعداد الطباعة',
      description: 'إعداد آلات الطباعة والمعايرة',
      type: 'intermediate',
      category: 'in_progress',
      color: '#f59e0b',
      icon: '⚙️',
      permissions: [
        {
          role: 'print_operator',
          actions: ['view', 'edit']
        },
        {
          role: 'production_manager',
          actions: ['view', 'edit', 'approve']
        }
      ]
    },
    {
      id: 'printing_in_progress',
      name: 'printing_in_progress',
      displayName: 'الطباعة جارية',
      description: 'عملية الطباعة قيد التنفيذ',
      type: 'intermediate',
      category: 'in_progress',
      color: '#8b5cf6',
      icon: '🖨️'
    },
    {
      id: 'quality_control',
      name: 'quality_control',
      displayName: 'مراقبة الجودة',
      description: 'فحص جودة المنتجات المطبوعة',
      type: 'intermediate',
      category: 'review',
      color: '#06b6d4',
      icon: '🔍',
      permissions: [
        {
          role: 'quality_inspector',
          actions: ['view', 'approve', 'reject', 'comment']
        }
      ],
      requiredFields: ['qualityCheckResults', 'samplesApproved']
    },
    {
      id: 'rework_required',
      name: 'rework_required',
      displayName: 'إعادة عمل مطلوبة',
      description: 'المنتج لا يلبي معايير الجودة ويحتاج إعادة عمل',
      type: 'intermediate',
      category: 'waiting',
      color: '#f59e0b',
      icon: '🔄'
    },
    {
      id: 'packaging',
      name: 'packaging',
      displayName: 'التعبئة والتغليف',
      description: 'تعبئة وتغليف المنتجات النهائية',
      type: 'intermediate',
      category: 'in_progress',
      color: '#84cc16',
      icon: '📦'
    },
    {
      id: 'ready_for_delivery',
      name: 'ready_for_delivery',
      displayName: 'جاهز للتسليم',
      description: 'المنتج جاهز للتسليم للعميل',
      type: 'end',
      category: 'completed',
      color: '#10b981',
      icon: '✅',
      isFinal: true,
      actions: [
        {
          id: 'notify_delivery_team',
          type: 'notification',
          name: 'إشعار فريق التسليم',
          parameters: {
            recipients: ['delivery_manager'],
            template: 'order_ready_for_delivery'
          }
        }
      ]
    }
  ],

  transitions: [
    {
      id: 'start_material_prep',
      from: 'production_planning',
      to: 'material_preparation',
      name: 'start_material_prep',
      displayName: 'بدء تحضير المواد',
      requiredRole: 'production_manager'
    },
    {
      id: 'materials_ready',
      from: 'material_preparation',
      to: 'printing_setup',
      name: 'materials_ready',
      displayName: 'المواد جاهزة',
      requiredRole: 'warehouse_manager',
      conditions: [
        {
          id: 'materials_checked',
          type: 'field_value',
          field: 'materialsVerified',
          operator: 'equals',
          value: true
        }
      ]
    },
    {
      id: 'start_printing',
      from: 'printing_setup',
      to: 'printing_in_progress',
      name: 'start_printing',
      displayName: 'بدء الطباعة',
      requiredRole: 'print_operator'
    },
    {
      id: 'printing_complete',
      from: 'printing_in_progress',
      to: 'quality_control',
      name: 'printing_complete',
      displayName: 'انتهاء الطباعة',
      requiredRole: 'print_operator'
    },
    {
      id: 'quality_approved',
      from: 'quality_control',
      to: 'packaging',
      name: 'quality_approved',
      displayName: 'اعتماد الجودة',
      requiredRole: 'quality_inspector'
    },
    {
      id: 'quality_rejected',
      from: 'quality_control',
      to: 'rework_required',
      name: 'quality_rejected',
      displayName: 'رفض الجودة',
      requiredRole: 'quality_inspector'
    },
    {
      id: 'restart_printing',
      from: 'rework_required',
      to: 'printing_setup',
      name: 'restart_printing',
      displayName: 'إعادة الطباعة',
      requiredRole: 'production_manager'
    },
    {
      id: 'packaging_complete',
      from: 'packaging',
      to: 'ready_for_delivery',
      name: 'packaging_complete',
      displayName: 'انتهاء التعبئة',
      requiredRole: 'packaging_operator'
    }
  ],

  roles: [
    {
      id: 'production_manager',
      name: 'production_manager',
      displayName: 'مدير الإنتاج',
      permissions: ['view', 'edit', 'approve', 'comment', 'reassign'],
      hierarchy: 3
    },
    {
      id: 'warehouse_manager',
      name: 'warehouse_manager',
      displayName: 'مدير المستودع',
      permissions: ['view', 'edit', 'approve', 'comment'],
      hierarchy: 2
    },
    {
      id: 'print_operator',
      name: 'print_operator',
      displayName: 'مشغل الطباعة',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 1
    },
    {
      id: 'quality_inspector',
      name: 'quality_inspector',
      displayName: 'مفتش الجودة',
      permissions: ['view', 'approve', 'reject', 'comment'],
      hierarchy: 2
    },
    {
      id: 'packaging_operator',
      name: 'packaging_operator',
      displayName: 'مشغل التعبئة',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 1
    }
  ],

  settings: {
    maxConcurrentInstances: 30,
    defaultTimeout: 24, // 1 day
    enableAuditLog: true,
    enableNotifications: true,
    businessHours: {
      timezone: 'Asia/Riyadh',
      workDays: [0, 1, 2, 3, 4],
      startTime: '07:00',
      endTime: '15:00'
    },
    escalationRules: [
      {
        id: 'production_delay',
        condition: {
          id: 'delay_condition',
          type: 'time_elapsed',
          field: 'timeInState',
          operator: 'greater_than',
          value: 8 // hours
        },
        delay: 8 * 60, // 8 hours
        action: 'notify',
        target: 'production_manager',
        message: 'تأخير في عملية الإنتاج'
      }
    ]
  }
}
