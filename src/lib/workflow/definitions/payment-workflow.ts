// Payment Workflow Definition
// تعريف تدفق عمل المدفوعات والفوترة

import { WorkflowDefinition } from '../types'

export const paymentWorkflow: WorkflowDefinition = {
  id: 'payment_process_v1',
  name: 'عملية المدفوعات والفوترة',
  description: 'تدفق العمل لمعالجة المدفوعات وإدارة الفواتير',
  version: '1.0.0',
  category: 'payment',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  states: [
    {
      id: 'invoice_generation',
      name: 'invoice_generation',
      displayName: 'إنشاء الفاتورة',
      description: 'إنشاء فاتورة جديدة للعميل',
      type: 'start',
      category: 'waiting',
      color: '#3b82f6',
      icon: '📋',
      isInitial: true,
      requiredFields: ['amount', 'dueDate', 'paymentTerms', 'taxAmount']
    },
    {
      id: 'invoice_sent',
      name: 'invoice_sent',
      displayName: 'تم إرسال الفاتورة',
      description: 'تم إرسال الفاتورة للعميل',
      type: 'intermediate',
      category: 'waiting',
      color: '#f59e0b',
      icon: '📧',
      actions: [
        {
          id: 'send_invoice_email',
          type: 'email',
          name: 'إرسال الفاتورة بالبريد',
          parameters: {
            template: 'invoice_notification',
            includeAttachment: true
          }
        }
      ]
    },
    {
      id: 'payment_pending',
      name: 'payment_pending',
      displayName: 'في انتظار الدفع',
      description: 'الفاتورة في انتظار دفع العميل',
      type: 'intermediate',
      category: 'waiting',
      color: '#f59e0b',
      icon: '⏳',
      timeouts: [
        {
          duration: 7,
          unit: 'days',
          action: 'notify',
          target: 'accounts_manager',
          message: 'فاتورة متأخرة - مطلوب متابعة'
        }
      ]
    },
    {
      id: 'partial_payment',
      name: 'partial_payment',
      displayName: 'دفعة جزئية',
      description: 'تم استلام دفعة جزئية من المبلغ',
      type: 'intermediate',
      category: 'in_progress',
      color: '#8b5cf6',
      icon: '💰'
    },
    {
      id: 'payment_overdue',
      name: 'payment_overdue',
      displayName: 'دفعة متأخرة',
      description: 'الدفعة متأخرة عن موعد الاستحقاق',
      type: 'intermediate',
      category: 'waiting',
      color: '#ef4444',
      icon: '⚠️',
      actions: [
        {
          id: 'send_reminder',
          type: 'email',
          name: 'إرسال تذكير',
          parameters: {
            template: 'payment_reminder',
            urgency: 'high'
          }
        }
      ]
    },
    {
      id: 'payment_received',
      name: 'payment_received',
      displayName: 'تم استلام الدفعة',
      description: 'تم استلام كامل المبلغ المستحق',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '✅',
      requiredFields: ['paymentMethod', 'transactionId', 'receiptNumber']
    },
    {
      id: 'payment_failed',
      name: 'payment_failed',
      displayName: 'فشل في الدفع',
      description: 'فشلت عملية الدفع',
      type: 'intermediate',
      category: 'failed',
      color: '#ef4444',
      icon: '❌'
    },
    {
      id: 'refund_requested',
      name: 'refund_requested',
      displayName: 'طلب استرداد',
      description: 'تم طلب استرداد المبلغ',
      type: 'intermediate',
      category: 'review',
      color: '#f59e0b',
      icon: '↩️',
      permissions: [
        {
          role: 'finance_manager',
          actions: ['view', 'approve', 'reject', 'comment']
        }
      ]
    },
    {
      id: 'payment_completed',
      name: 'payment_completed',
      displayName: 'اكتمل الدفع',
      description: 'تم إكمال عملية الدفع بنجاح',
      type: 'end',
      category: 'completed',
      color: '#10b981',
      icon: '🎉',
      isFinal: true,
      actions: [
        {
          id: 'update_accounting',
          type: 'database_update',
          name: 'تحديث المحاسبة',
          parameters: {
            action: 'update_ledger',
            status: 'paid'
          }
        }
      ]
    },
    {
      id: 'payment_cancelled',
      name: 'payment_cancelled',
      displayName: 'تم إلغاء الدفع',
      description: 'تم إلغاء عملية الدفع',
      type: 'end',
      category: 'failed',
      color: '#ef4444',
      icon: '🚫',
      isFinal: true
    }
  ],

  transitions: [
    {
      id: 'send_invoice',
      from: 'invoice_generation',
      to: 'invoice_sent',
      name: 'send_invoice',
      displayName: 'إرسال الفاتورة',
      requiredRole: 'accounts_clerk'
    },
    {
      id: 'await_payment',
      from: 'invoice_sent',
      to: 'payment_pending',
      name: 'await_payment',
      displayName: 'انتظار الدفع',
      autoTrigger: true
    },
    {
      id: 'receive_partial_payment',
      from: 'payment_pending',
      to: 'partial_payment',
      name: 'receive_partial_payment',
      displayName: 'استلام دفعة جزئية',
      requiredRole: 'accounts_clerk'
    },
    {
      id: 'mark_overdue',
      from: 'payment_pending',
      to: 'payment_overdue',
      name: 'mark_overdue',
      displayName: 'تأخير في الدفع',
      autoTrigger: true,
      conditions: [
        {
          id: 'past_due_date',
          type: 'time_elapsed',
          field: 'dueDate',
          operator: 'greater_than',
          value: 0
        }
      ]
    },
    {
      id: 'receive_full_payment',
      from: 'payment_pending',
      to: 'payment_received',
      name: 'receive_full_payment',
      displayName: 'استلام كامل المبلغ',
      requiredRole: 'accounts_clerk'
    },
    {
      id: 'complete_partial_payment',
      from: 'partial_payment',
      to: 'payment_received',
      name: 'complete_partial_payment',
      displayName: 'إكمال الدفعات الجزئية',
      requiredRole: 'accounts_clerk'
    },
    {
      id: 'payment_fails',
      from: 'payment_pending',
      to: 'payment_failed',
      name: 'payment_fails',
      displayName: 'فشل الدفع',
      requiredRole: 'accounts_clerk'
    },
    {
      id: 'request_refund',
      from: 'payment_received',
      to: 'refund_requested',
      name: 'request_refund',
      displayName: 'طلب استرداد',
      requiredRole: 'customer_service'
    },
    {
      id: 'complete_payment',
      from: 'payment_received',
      to: 'payment_completed',
      name: 'complete_payment',
      displayName: 'إكمال الدفع',
      requiredRole: 'accounts_manager'
    },
    {
      id: 'cancel_payment',
      from: 'payment_failed',
      to: 'payment_cancelled',
      name: 'cancel_payment',
      displayName: 'إلغاء الدفع',
      requiredRole: 'accounts_manager'
    }
  ],

  roles: [
    {
      id: 'accounts_clerk',
      name: 'accounts_clerk',
      displayName: 'محاسب',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 1
    },
    {
      id: 'accounts_manager',
      name: 'accounts_manager',
      displayName: 'مدير الحسابات',
      permissions: ['view', 'edit', 'approve', 'comment', 'reassign'],
      hierarchy: 3
    },
    {
      id: 'finance_manager',
      name: 'finance_manager',
      displayName: 'مدير المالية',
      permissions: ['view', 'edit', 'approve', 'reject', 'comment'],
      hierarchy: 3
    },
    {
      id: 'customer_service',
      name: 'customer_service',
      displayName: 'خدمة العملاء',
      permissions: ['view', 'edit', 'comment'],
      hierarchy: 2
    }
  ],

  settings: {
    maxConcurrentInstances: 200,
    defaultTimeout: 168, // 7 days
    enableAuditLog: true,
    enableNotifications: true,
    businessHours: {
      timezone: 'Asia/Riyadh',
      workDays: [0, 1, 2, 3, 4], // Sunday to Thursday
      startTime: '09:00',
      endTime: '17:00'
    },
    escalationRules: [
      {
        id: 'overdue_payment',
        condition: {
          id: 'overdue_condition',
          type: 'time_elapsed',
          field: 'daysOverdue',
          operator: 'greater_than',
          value: 7
        },
        delay: 7 * 24 * 60, // 7 days
        action: 'notify',
        target: 'finance_manager',
        message: 'فاتورة متأخرة لأكثر من 7 أيام - مطلوب تدخل'
      }
    ]
  }
}
