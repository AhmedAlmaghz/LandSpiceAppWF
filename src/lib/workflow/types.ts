// Workflow Engine Types
// نظام إدارة تدفق العمل المتقدم لنظام لاند سبايس

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  category: 'restaurant_order' | 'design_process' | 'printing' | 'delivery' | 'payment' | 'guarantee'
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  roles: WorkflowRole[]
  settings: WorkflowSettings
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowState {
  id: string
  name: string
  displayName: string
  description?: string
  type: 'start' | 'intermediate' | 'end' | 'conditional' | 'parallel'
  category?: 'waiting' | 'in_progress' | 'review' | 'completed' | 'failed'
  color?: string
  icon?: string
  isInitial?: boolean
  isFinal?: boolean
  requiredFields?: string[]
  actions?: WorkflowAction[]
  timeouts?: StateTimeout[]
  permissions?: StatePermission[]
  notifications?: StateNotification[]
}

export interface WorkflowTransition {
  id: string
  from: string // state id
  to: string // state id
  name: string
  displayName: string
  description?: string
  conditions?: TransitionCondition[]
  actions?: WorkflowAction[]
  requiredRole?: string
  requiredPermissions?: string[]
  autoTrigger?: boolean
  priority?: number
  metadata?: Record<string, any>
}

export interface WorkflowAction {
  id: string
  type: 'email' | 'sms' | 'webhook' | 'database_update' | 'file_generation' | 'approval_request' | 'notification'
  name: string
  description?: string
  parameters: Record<string, any>
  condition?: string
  order?: number
  isAsync?: boolean
  retryPolicy?: RetryPolicy
}

export interface TransitionCondition {
  id: string
  type: 'field_value' | 'user_role' | 'time_elapsed' | 'approval_status' | 'custom_function'
  field?: string
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'custom'
  value?: any
  customFunction?: string
}

export interface WorkflowRole {
  id: string
  name: string
  displayName: string
  description?: string
  permissions: string[]
  hierarchy?: number
  inheritsFrom?: string[]
}

export interface WorkflowSettings {
  maxConcurrentInstances?: number
  defaultTimeout?: number
  autoCleanup?: boolean
  cleanupAfterDays?: number
  enableAuditLog?: boolean
  enableNotifications?: boolean
  escalationRules?: EscalationRule[]
  businessHours?: BusinessHours
}

export interface StateTimeout {
  duration: number // in minutes
  unit: 'minutes' | 'hours' | 'days'
  action: 'escalate' | 'auto_approve' | 'auto_reject' | 'notify'
  target?: string // user, role, or workflow state
  message?: string
}

export interface StatePermission {
  role: string
  actions: ('view' | 'edit' | 'approve' | 'reject' | 'comment' | 'reassign')[]
  conditions?: TransitionCondition[]
}

export interface StateNotification {
  trigger: 'on_enter' | 'on_exit' | 'timeout' | 'manual'
  recipients: string[] // user ids, roles, or 'all'
  template: string
  channel: 'email' | 'sms' | 'in_app' | 'webhook'
  delay?: number // minutes
}

export interface EscalationRule {
  id: string
  condition: TransitionCondition
  delay: number // minutes
  action: 'notify' | 'reassign' | 'auto_approve'
  target: string // user id or role
  message?: string
}

export interface BusinessHours {
  timezone: string
  workDays: number[] // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  holidays?: Date[]
}

export interface RetryPolicy {
  maxRetries: number
  backoffStrategy: 'fixed' | 'exponential' | 'linear'
  backoffDelay: number // base delay in milliseconds
  maxDelay?: number
}

// Workflow Instance Types
export interface WorkflowInstance {
  id: string
  workflowDefinitionId: string
  title: string
  description?: string
  currentState: string
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  initiator: WorkflowParticipant
  assignee?: WorkflowParticipant
  participants: WorkflowParticipant[]
  data: WorkflowData
  history: WorkflowHistory[]
  tasks: WorkflowTask[]
  attachments?: WorkflowAttachment[]
  tags?: string[]
  dueDate?: Date
  estimatedDuration?: number // in minutes
  actualDuration?: number // in minutes
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface WorkflowParticipant {
  id: string
  type: 'user' | 'role' | 'system'
  name: string
  email?: string
  phone?: string
  avatar?: string
  role: string
  permissions: string[]
  isActive: boolean
  lastActivity?: Date
}

export interface WorkflowData {
  // Core business data
  restaurantId?: string
  orderId?: string
  designId?: string
  contractId?: string
  
  // Form data
  formData: Record<string, any>
  
  // File references
  files: string[]
  
  // Custom fields
  customFields: Record<string, any>
  
  // Validation results
  validationResults?: ValidationResult[]
  
  // Approval history
  approvals: ApprovalRecord[]
  
  // Comments and notes
  comments: WorkflowComment[]
}

export interface WorkflowHistory {
  id: string
  timestamp: Date
  action: 'created' | 'state_changed' | 'assigned' | 'approved' | 'rejected' | 'commented' | 'updated' | 'completed'
  fromState?: string
  toState?: string
  actor: WorkflowParticipant
  description: string
  changes?: Record<string, { from: any; to: any }>
  metadata?: Record<string, any>
}

export interface WorkflowTask {
  id: string
  workflowInstanceId: string
  name: string
  description?: string
  type: 'approval' | 'review' | 'data_entry' | 'file_upload' | 'custom'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee?: WorkflowParticipant
  dueDate?: Date
  estimatedDuration?: number // in minutes
  actualDuration?: number // in minutes
  dependencies?: string[] // other task ids
  requirements?: TaskRequirement[]
  results?: TaskResult[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface TaskRequirement {
  id: string
  type: 'file_upload' | 'form_completion' | 'approval' | 'signature' | 'payment'
  description: string
  isRequired: boolean
  validation?: ValidationRule[]
  metadata?: Record<string, any>
}

export interface TaskResult {
  id: string
  type: 'approved' | 'rejected' | 'completed' | 'data' | 'file'
  value: any
  comment?: string
  actor: WorkflowParticipant
  timestamp: Date
}

export interface ValidationRule {
  field: string
  type: 'required' | 'email' | 'phone' | 'number' | 'date' | 'file_type' | 'custom'
  value?: any
  message: string
  customFunction?: string
}

export interface ValidationResult {
  field: string
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ApprovalRecord {
  id: string
  approver: WorkflowParticipant
  decision: 'approved' | 'rejected' | 'pending'
  comment?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface WorkflowComment {
  id: string
  author: WorkflowParticipant
  content: string
  type: 'comment' | 'question' | 'issue' | 'resolution'
  isPrivate?: boolean
  attachments?: string[]
  timestamp: Date
  editedAt?: Date
}

export interface WorkflowAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedBy: WorkflowParticipant
  uploadedAt: Date
  category?: 'document' | 'image' | 'design' | 'contract' | 'other'
  metadata?: Record<string, any>
}

// Engine Events
export interface WorkflowEvent {
  id: string
  type: 'workflow_started' | 'state_changed' | 'task_created' | 'task_completed' | 'approval_requested' | 'timeout_reached'
  workflowInstanceId: string
  workflowDefinitionId: string
  timestamp: Date
  actor?: WorkflowParticipant
  data: Record<string, any>
  metadata?: Record<string, any>
}

// Engine Configuration
export interface WorkflowEngineConfig {
  enableAuditLog: boolean
  enableMetrics: boolean
  defaultRetryPolicy: RetryPolicy
  maxConcurrentWorkflows: number
  cleanupInterval: number // in minutes
  notificationSettings: NotificationSettings
  integrations: IntegrationConfig[]
}

export interface NotificationSettings {
  enabled: boolean
  channels: {
    email: EmailConfig
    sms: SmsConfig
    webhook: WebhookConfig
  }
  templates: NotificationTemplate[]
}

export interface EmailConfig {
  enabled: boolean
  provider: 'smtp' | 'sendgrid' | 'ses'
  settings: Record<string, any>
}

export interface SmsConfig {
  enabled: boolean
  provider: 'twilio' | 'sns'
  settings: Record<string, any>
}

export interface WebhookConfig {
  enabled: boolean
  endpoints: WebhookEndpoint[]
}

export interface WebhookEndpoint {
  url: string
  events: string[]
  headers?: Record<string, string>
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key'
    credentials: Record<string, string>
  }
}

export interface NotificationTemplate {
  id: string
  name: string
  event: string
  channel: 'email' | 'sms' | 'in_app'
  template: {
    subject?: string
    body: string
    variables: string[]
  }
  isActive: boolean
}

export interface IntegrationConfig {
  name: string
  type: 'api' | 'database' | 'file_system' | 'email' | 'sms'
  endpoint?: string
  credentials?: Record<string, any>
  settings?: Record<string, any>
  isActive: boolean
}

// Performance Metrics
export interface WorkflowMetrics {
  totalWorkflows: number
  activeWorkflows: number
  completedWorkflows: number
  failedWorkflows: number
  averageCompletionTime: number // in minutes
  averageTasksPerWorkflow: number
  bottleneckStates: string[]
  performanceByState: Record<string, StateMetrics>
  userProductivity: Record<string, UserMetrics>
}

export interface StateMetrics {
  totalInstances: number
  averageTime: number // in minutes
  minTime: number
  maxTime: number
  successRate: number
  escalationRate: number
}

export interface UserMetrics {
  tasksCompleted: number
  averageTaskTime: number // in minutes
  onTimeCompletion: number
  overdueRate: number
  workloadScore: number
}
