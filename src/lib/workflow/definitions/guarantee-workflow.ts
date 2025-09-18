// Guarantee Workflow Definition
// تعريف تدفق عمل الضمانات البنكية

import { WorkflowDefinition } from '../types'

export const guaranteeWorkflow: WorkflowDefinition = {
  id: 'guarantee_process_v1',
  name: 'عملية الضمانات البنكية',
  description: 'تدفق العمل لإدارة الضمانات البنكية للمطاعم',
  version: '1.0.0',
  category: 'guarantee',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  states: [
    {
      id: 'guarantee_requested',
      name: 'guarantee_requested',
      displayName: 'طلب ضمان بنكي',
      description: 'تم طلب ضمان بنكي جديد',
      type: 'start',
      category: 'waiting',
      color: '#3b82f6',
      icon: '🏦',
      isInitial: true,
      requiredFields: ['guaranteeAmount', 'guaranteeType', 'bankName', 'validityPeriod']
    },
    {
      id: 'bank_review',
      name: 'bank_review',
      displayName: 'مراجعة البنك',
      description: 'البنك يراجع طلب الضمان',
      type: 'intermediate',
      category: 'review',
      color: '#f59e0b',
      icon: '🔍',
      permissions: [
        {
          role: 'bank_officer',
          actions: ['view', 'approve', 'reject', 'comment']
        }
      ],
      timeouts: [
        {
          duration: 3,
          unit: 'days',
          action: 'escalate',
          target: 'bank_manager',
          message: 'طلب ضمان بنكي يحتاج مراجعة عاجلة'
        }
      ]
    },
    {
      id: 'guarantee_approved',
      name: 'guarantee_approved',
      displayName: 'معتمد من البنك',
      description: 'تم اعتماد الضمان من البنك',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '✅'
    },
    {
      id: 'guarantee_rejected',
      name: 'guarantee_rejected',
      displayName: 'مرفوض من البنك',
      description: 'تم رفض طلب الضمان من البنك',
      type: 'intermediate',
      category: 'failed',
      color: '#ef4444',
      icon: '❌',
      actions: [
        {
          id: 'notify_rejection',
          type: 'notification',
          name: 'إشعار الرفض',
          parameters: {
            recipients: ['restaurant', 'landspice_manager'],
            template: 'guarantee_rejection_notice'
          }
        }
      ]
    },
    {
      id: 'guarantee_issued',
      name: 'guarantee_issued',
      displayName: 'تم إصدار الضمان',
      description: 'تم إصدار الضمان البنكي رسمياً',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '📜',
      requiredFields: ['guaranteeNumber', 'issuanceDate', 'expiryDate']
    },
    {
      id: 'guarantee_active',
      name: 'guarantee_active',
      displayName: 'ضمان نشط',
      description: 'الضمان البنكي نشط وساري المفعول',
      type: 'intermediate',
      category: 'in_progress',
      color: '#10b981',
      icon: '🟢'
    },
    {
      id: 'guarantee_renewal_due',
      name: 'guarantee_renewal_due',
      displayName: 'استحقاق التجديد',
      description: 'الضمان يحتاج تجديد قريباً',
      type: 'intermediate',
      category: 'waiting',
      color: '#f59e0b',
      icon: '🔄',
      actions: [
        {
          id: 'send_renewal_reminder',
          type: 'notification',
          name: 'تذكير التجديد',
          parameters: {
            recipients: ['restaurant', 'bank_officer'],
            template: 'guarantee_renewal_reminder'
          }
        }
      ]
    },
    {
      id: 'guarantee_renewed',
      name: 'guarantee_renewed',
      displayName: 'تم التجديد',
      description: 'تم تجديد الضمان البنكي',
      type: 'intermediate',
      category: 'completed',
      color: '#10b981',
      icon: '🔄'
    },
    {
      id: 'guarantee_expired',
      name: 'guarantee_expired',
      displayName: 'منتهي الصلاحية',
      description: 'انتهت صلاحية الضمان البنكي',
      type: 'intermediate',
      category: 'failed',
      color: '#ef4444',
      icon: '⏰'
    },
    {
      id: 'guarantee_released',
      name: 'guarantee_released',
      displayName: 'تم إلغاء الضمان',
      description: 'تم إلغاء وإرجاع الضمان البنكي',
      type: 'end',
      category: 'completed',
      color: '#10b981',
      icon: '🔓',
      isFinal: true,
      actions: [
        {
          id: 'update_financial_records',
          type: 'database_update',
          name: 'تحديث السجلات المالية',
          parameters: {
            action: 'release_guarantee',
            status: 'released'
          }
        }
      ]
    },
    {
      id: 'guarantee_cancelled',
      name: 'guarantee_cancelled',
      displayName: 'تم إلغاء الطلب',
      description: 'تم إلغاء طلب الضمان البنكي',
      type: 'end',
      category: 'failed',
      color: '#ef4444',
      icon: '🚫',
      isFinal: true
    }
  ],

  transitions: [
    {
      id: 'submit_to_bank',
      from: 'guarantee_requested',
      to: 'bank_review',
      name: 'submit_to_bank',
      displayName: 'تقديم للبنك',
      requiredRole: 'landspice_manager',
      conditions: [
        {
          id: 'documents_complete',
          type: 'field_value',
          field: 'documentsComplete',
          operator: 'equals',
          value: true
        }
      ]
    },
    {
      id: 'bank_approves',
      from: 'bank_review',
      to: 'guarantee_approved',
      name: 'bank_approves',
      displayName: 'اعتماد البنك',
      requiredRole: 'bank_officer'
    },
    {
      id: 'bank_rejects',
      from: 'bank_review',
      to: 'guarantee_rejected',
      name: 'bank_rejects',
      displayName: 'رفض البنك',
      requiredRole: 'bank_officer'
    },
    {
      id: 'issue_guarantee',
      from: 'guarantee_approved',
      to: 'guarantee_issued',
      name: 'issue_guarantee',
      displayName: 'إصدار الضمان',
      requiredRole: 'bank_officer'
    },
    {
      id: 'activate_guarantee',
      from: 'guarantee_issued',
      to: 'guarantee_active',
      name: 'activate_guarantee',
      displayName: 'تفعيل الضمان',
      requiredRole: 'landspice_manager'
    },
    {
      id: 'renewal_needed',
      from: 'guarantee_active',
      to: 'guarantee_renewal_due',
      name: 'renewal_needed',
      displayName: 'يحتاج تجديد',
      autoTrigger: true,
      conditions: [
        {
          id: 'near_expiry',
          type: 'time_elapsed',
          field: 'daysUntilExpiry',
          operator: 'less_than',
          value: 30
        }
      ]
    },
    {
      id: 'renew_guarantee',
      from: 'guarantee_renewal_due',
      to: 'guarantee_renewed',
      name: 'renew_guarantee',
      displayName: 'تجديد الضمان',
      requiredRole: 'bank_officer'
    },
    {
      id: 'guarantee_expires',
      from: 'guarantee_active',
      to: 'guarantee_expired',
      name: 'guarantee_expires',
      displayName: 'انتهاء الصلاحية',
      autoTrigger: true,
      conditions: [
        {
          id: 'past_expiry',
          type: 'time_elapsed',
          field: 'expiryDate',
          operator: 'greater_than',
          value: 0
        }
      ]
    },
    {
      id: 'release_guarantee',
      from: 'guarantee_active',
      to: 'guarantee_released',
      name: 'release_guarantee',
      displayName: 'إلغاء الضمان',
      requiredRole: 'bank_manager'
    },
    {
      id: 'cancel_request',
      from: 'guarantee_rejected',
      to: 'guarantee_cancelled',
      name: 'cancel_request',
      displayName: 'إلغاء الطلب',
      requiredRole: 'landspice_manager'
    }
  ],

  roles: [
    {
      id: 'restaurant',
      name: 'restaurant',
      displayName: 'مطعم',
      permissions: ['view', 'comment'],
      hierarchy: 1
    },
    {
      id: 'landspice_manager',
      name: 'landspice_manager',
      displayName: 'مدير لاند سبايس',
      permissions: ['view', 'edit', 'approve', 'comment', 'reassign'],
      hierarchy: 3
    },
    {
      id: 'bank_officer',
      name: 'bank_officer',
      displayName: 'موظف البنك',
      permissions: ['view', 'approve', 'reject', 'comment'],
      hierarchy: 2
    },
    {
      id: 'bank_manager',
      name: 'bank_manager',
      displayName: 'مدير البنك',
      permissions: ['view', 'edit', 'approve', 'reject', 'comment'],
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
      workDays: [0, 1, 2, 3, 4], // Sunday to Thursday
      startTime: '09:00',
      endTime: '15:00'
    },
    escalationRules: [
      {
        id: 'guarantee_expiry_warning',
        condition: {
          id: 'expiry_warning',
          type: 'time_elapsed',
          field: 'daysUntilExpiry',
          operator: 'less_than',
          value: 7
        },
        delay: 7 * 24 * 60, // 7 days
        action: 'notify',
        target: 'landspice_manager',
        message: 'ضمان بنكي سينتهي خلال أسبوع - مطلوب تجديد عاجل'
      }
    ]
  }
}
