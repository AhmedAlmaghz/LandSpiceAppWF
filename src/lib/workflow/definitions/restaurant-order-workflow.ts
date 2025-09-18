// Restaurant Order Workflow Definition
// تعريف تدفق عمل طلبات المطاعم

import { WorkflowDefinition } from '../types'

export const restaurantOrderWorkflow: WorkflowDefinition = {
  id: 'restaurant_order_v1',
  name: 'طلب مطعم جديد',
  description: 'تدفق العمل الكامل لمعالجة طلبات المطاعم من التسجيل حتى التسليم',
  version: '1.0.0',
  category: 'restaurant_order',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  // States - الحالات
  states: [
    {
      id: 'initial_request',
      name: 'initial_request',
      displayName: 'طلب أولي',
      description: 'المطعم يقدم طلب جديد',
      type: 'start',
      category: 'waiting',
      color: '#3b82f6',
      icon: '📝',
      isInitial: true,
      requiredFields: ['restaurantName', 'contactInfo', 'productType', 'quantity'],
      actions: [
        {
          id: 'notify_landspice_team',
          type: 'notification',
          name: 'إشعار فريق لاند سبايس',
          description: 'إرسال إشعار للفريق بوجود طلب جديد',
          parameters: {
            recipients: ['admin', 'sales_manager'],
            template: 'new_restaurant_request',
            message: 'طلب جديد من مطعم يحتاج للمراجعة'
          },
          order: 1
        }
      ]
    },
    {
      id: 'under_review',
      name: 'under_review',
      displayName: 'قيد المراجعة',
      description: 'فريق لاند سبايس يراجع الطلب',
      type: 'intermediate',
      category: 'in_progress',
      color: '#f59e0b',
      icon: '🔍',
      permissions: [
        {
          role: 'admin',
          actions: ['view', 'edit', 'approve', 'reject']
        },
        {
          role: 'sales_manager',
          actions: ['view', 'edit', 'approve', 'reject']
        }
      ],
      timeouts: [
        {
          duration: 24,
          unit: 'hours',
          action: 'escalate',
          target: 'admin',
          message: 'طلب المطعم لم يتم مراجعته خلال 24 ساعة'
        }
      ]
    },
    {
      id: 'approved',
      name: 'approved',
      displayName: 'معتمد',
      description: 'تم اعتماد الطلب وجاهز للمتابعة',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '✅',
      actions: [
        {
          id: 'create_contract_task',
          type: 'database_update',
          name: 'إنشاء مهمة العقد',
          description: 'إنشاء مهمة لتحضير العقد',
          parameters: {
            action: 'create_task',
            taskType: 'contract_preparation',
            assigneeRole: 'legal_team'
          },
          order: 1
        }
      ]
    },
    {
      id: 'rejected',
      name: 'rejected',
      displayName: 'مرفوض',
      description: 'تم رفض الطلب',
      type: 'end',
      category: 'failed',
      color: '#ef4444',
      icon: '❌',
      isFinal: true,
      actions: [
        {
          id: 'notify_restaurant_rejection',
          type: 'email',
          name: 'إشعار المطعم بالرفض',
          description: 'إرسال بريد إلكتروني للمطعم بسبب الرفض',
          parameters: {
            template: 'order_rejection',
            includeReason: true
          },
          order: 1
        }
      ]
    },
    {
      id: 'contract_ready',
      name: 'contract_ready',
      displayName: 'العقد جاهز',
      description: 'تم تحضير العقد وجاهز للتوقيع',
      type: 'intermediate',
      category: 'waiting',
      color: '#8b5cf6',
      icon: '📄'
    },
    {
      id: 'contract_signed',
      name: 'contract_signed',
      displayName: 'العقد موقع',
      description: 'تم توقيع العقد من جميع الأطراف',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '✍️'
    },
    {
      id: 'order_completed',
      name: 'order_completed',
      displayName: 'الطلب مكتمل',
      description: 'تم إكمال جميع مراحل الطلب بنجاح',
      type: 'end',
      category: 'completed',
      color: '#10b981',
      icon: '🎉',
      isFinal: true
    }
  ],

  // Transitions - الانتقالات
  transitions: [
    {
      id: 'submit_for_review',
      from: 'initial_request',
      to: 'under_review',
      name: 'submit_for_review',
      displayName: 'تقديم للمراجعة',
      description: 'تقديم الطلب لفريق المراجعة',
      autoTrigger: true,
      priority: 1
    },
    {
      id: 'approve_request',
      from: 'under_review',
      to: 'approved',
      name: 'approve_request',
      displayName: 'اعتماد الطلب',
      description: 'اعتماد طلب المطعم',
      requiredRole: 'admin',
      conditions: [
        {
          id: 'has_approval',
          type: 'approval_status',
          value: 'approved'
        }
      ]
    },
    {
      id: 'reject_request',
      from: 'under_review',
      to: 'rejected',
      name: 'reject_request',
      displayName: 'رفض الطلب',
      description: 'رفض طلب المطعم',
      requiredRole: 'admin',
      conditions: [
        {
          id: 'has_rejection',
          type: 'approval_status',
          value: 'rejected'
        }
      ]
    },
    {
      id: 'contract_prepared',
      from: 'approved',
      to: 'contract_ready',
      name: 'contract_prepared',
      displayName: 'العقد محضر',
      description: 'تم تحضير العقد',
      requiredRole: 'legal_team'
    },
    {
      id: 'contract_signed',
      from: 'contract_ready',
      to: 'contract_signed',
      name: 'contract_signed',
      displayName: 'توقيع العقد',
      description: 'توقيع العقد من جميع الأطراف',
      conditions: [
        {
          id: 'all_signatures_collected',
          type: 'field_value',
          field: 'signaturesComplete',
          operator: 'equals',
          value: true
        }
      ]
    },
    {
      id: 'complete_order',
      from: 'contract_signed',
      to: 'order_completed',
      name: 'complete_order',
      displayName: 'إكمال الطلب',
      description: 'إكمال جميع مراحل الطلب',
      requiredRole: 'admin'
    }
  ],

  // Roles - الأدوار
  roles: [
    {
      id: 'restaurant',
      name: 'restaurant',
      displayName: 'مطعم',
      description: 'صاحب المطعم أو المسؤول',
      permissions: ['view', 'comment'],
      hierarchy: 1
    },
    {
      id: 'sales_manager',
      name: 'sales_manager',
      displayName: 'مدير المبيعات',
      description: 'مدير المبيعات في لاند سبايس',
      permissions: ['view', 'edit', 'approve', 'reject', 'comment'],
      hierarchy: 2
    },
    {
      id: 'legal_team',
      name: 'legal_team',
      displayName: 'الفريق القانوني',
      description: 'فريق إعداد العقود والشؤون القانونية',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 2
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'مدير النظام',
      description: 'مدير النظام الرئيسي',
      permissions: ['view', 'edit', 'approve', 'reject', 'comment', 'reassign'],
      hierarchy: 3
    }
  ],

  // Settings - الإعدادات
  settings: {
    maxConcurrentInstances: 100,
    defaultTimeout: 48, // 48 hours
    autoCleanup: true,
    cleanupAfterDays: 90,
    enableAuditLog: true,
    enableNotifications: true,
    businessHours: {
      timezone: 'Asia/Riyadh',
      workDays: [0, 1, 2, 3, 4], // Sunday to Thursday
      startTime: '08:00',
      endTime: '17:00'
    },
    escalationRules: [
      {
        id: 'review_timeout',
        condition: {
          id: 'timeout_condition',
          type: 'time_elapsed',
          field: 'timeInState',
          operator: 'greater_than',
          value: 24 // hours
        },
        delay: 24 * 60, // 24 hours in minutes
        action: 'notify',
        target: 'admin',
        message: 'طلب مطعم عالق في مرحلة المراجعة لأكثر من 24 ساعة'
      }
    ]
  }
}
