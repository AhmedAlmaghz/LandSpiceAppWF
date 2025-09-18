// Delivery Workflow Definition
// تعريف تدفق عمل التسليم والتوزيع

import { WorkflowDefinition } from '../types'

export const deliveryWorkflow: WorkflowDefinition = {
  id: 'delivery_process_v1',
  name: 'عملية التسليم والتوزيع',
  description: 'تدفق العمل لتسليم المنتجات للمطاعم',
  version: '1.0.0',
  category: 'delivery',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  states: [
    {
      id: 'delivery_scheduled',
      name: 'delivery_scheduled',
      displayName: 'مجدول للتسليم',
      description: 'تم جدولة الطلب للتسليم',
      type: 'start',
      category: 'waiting',
      color: '#3b82f6',
      icon: '📅',
      isInitial: true,
      requiredFields: ['deliveryDate', 'deliveryAddress', 'contactPerson']
    },
    {
      id: 'route_planned',
      name: 'route_planned',
      displayName: 'تخطيط المسار',
      description: 'تم تخطيط مسار التسليم وتعيين السائق',
      type: 'intermediate',
      category: 'in_progress',
      color: '#f59e0b',
      icon: '🗺️',
      permissions: [
        {
          role: 'delivery_manager',
          actions: ['view', 'edit', 'approve']
        }
      ]
    },
    {
      id: 'out_for_delivery',
      name: 'out_for_delivery',
      displayName: 'في الطريق للتسليم',
      description: 'السائق في الطريق لتسليم الطلب',
      type: 'intermediate',
      category: 'in_progress',
      color: '#8b5cf6',
      icon: '🚛',
      permissions: [
        {
          role: 'driver',
          actions: ['view', 'edit', 'comment']
        }
      ],
      actions: [
        {
          id: 'send_tracking_update',
          type: 'notification',
          name: 'تحديث التتبع',
          parameters: {
            recipients: ['restaurant'],
            template: 'delivery_tracking_update'
          }
        }
      ]
    },
    {
      id: 'delivery_attempted',
      name: 'delivery_attempted',
      displayName: 'محاولة تسليم',
      description: 'تم محاولة التسليم لكن لم يتم الاستلام',
      type: 'intermediate',
      category: 'waiting',
      color: '#f59e0b',
      icon: '🚪',
      actions: [
        {
          id: 'notify_failed_delivery',
          type: 'notification',
          name: 'إشعار فشل التسليم',
          parameters: {
            recipients: ['restaurant', 'delivery_manager'],
            template: 'delivery_attempt_failed'
          }
        }
      ]
    },
    {
      id: 'delivery_successful',
      name: 'delivery_successful',
      displayName: 'تم التسليم بنجاح',
      description: 'تم تسليم الطلب بنجاح للعميل',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '✅',
      requiredFields: ['receiverName', 'receiverSignature', 'deliveryTime']
    },
    {
      id: 'delivery_cancelled',
      name: 'delivery_cancelled',
      displayName: 'تم إلغاء التسليم',
      description: 'تم إلغاء عملية التسليم',
      type: 'end',
      category: 'failed',
      color: '#ef4444',
      icon: '❌',
      isFinal: true
    },
    {
      id: 'delivery_completed',
      name: 'delivery_completed',
      displayName: 'اكتمل التسليم',
      description: 'تم إكمال عملية التسليم وتأكيدها',
      type: 'end',
      category: 'completed',
      color: '#10b981',
      icon: '🎉',
      isFinal: true,
      actions: [
        {
          id: 'generate_delivery_invoice',
          type: 'database_update',
          name: 'إنشاء فاتورة التسليم',
          parameters: {
            action: 'create_invoice',
            type: 'delivery_invoice'
          }
        }
      ]
    }
  ],

  transitions: [
    {
      id: 'plan_route',
      from: 'delivery_scheduled',
      to: 'route_planned',
      name: 'plan_route',
      displayName: 'تخطيط المسار',
      requiredRole: 'delivery_manager'
    },
    {
      id: 'start_delivery',
      from: 'route_planned',
      to: 'out_for_delivery',
      name: 'start_delivery',
      displayName: 'بدء التسليم',
      requiredRole: 'driver',
      conditions: [
        {
          id: 'vehicle_ready',
          type: 'field_value',
          field: 'vehicleChecked',
          operator: 'equals',
          value: true
        }
      ]
    },
    {
      id: 'delivery_attempt',
      from: 'out_for_delivery',
      to: 'delivery_attempted',
      name: 'delivery_attempt',
      displayName: 'محاولة التسليم',
      requiredRole: 'driver'
    },
    {
      id: 'successful_delivery',
      from: 'out_for_delivery',
      to: 'delivery_successful',
      name: 'successful_delivery',
      displayName: 'تسليم ناجح',
      requiredRole: 'driver'
    },
    {
      id: 'retry_delivery',
      from: 'delivery_attempted',
      to: 'route_planned',
      name: 'retry_delivery',
      displayName: 'إعادة محاولة التسليم',
      requiredRole: 'delivery_manager'
    },
    {
      id: 'cancel_delivery',
      from: 'delivery_attempted',
      to: 'delivery_cancelled',
      name: 'cancel_delivery',
      displayName: 'إلغاء التسليم',
      requiredRole: 'delivery_manager'
    },
    {
      id: 'confirm_completion',
      from: 'delivery_successful',
      to: 'delivery_completed',
      name: 'confirm_completion',
      displayName: 'تأكيد الإكمال',
      requiredRole: 'delivery_manager'
    }
  ],

  roles: [
    {
      id: 'delivery_manager',
      name: 'delivery_manager',
      displayName: 'مدير التسليم',
      permissions: ['view', 'edit', 'approve', 'comment', 'reassign'],
      hierarchy: 3
    },
    {
      id: 'driver',
      name: 'driver',
      displayName: 'السائق',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 1
    },
    {
      id: 'restaurant',
      name: 'restaurant',
      displayName: 'مطعم',
      permissions: ['view', 'comment'],
      hierarchy: 1
    }
  ],

  settings: {
    maxConcurrentInstances: 100,
    defaultTimeout: 48, // 2 days
    enableAuditLog: true,
    enableNotifications: true,
    businessHours: {
      timezone: 'Asia/Riyadh',
      workDays: [0, 1, 2, 3, 4, 5], // Sunday to Friday
      startTime: '08:00',
      endTime: '20:00'
    },
    escalationRules: [
      {
        id: 'delivery_delay',
        condition: {
          id: 'delay_condition',
          type: 'time_elapsed',
          field: 'timeInState',
          operator: 'greater_than',
          value: 24 // hours
        },
        delay: 24 * 60, // 24 hours
        action: 'notify',
        target: 'delivery_manager',
        message: 'تأخير في عملية التسليم لأكثر من 24 ساعة'
      }
    ]
  }
}
