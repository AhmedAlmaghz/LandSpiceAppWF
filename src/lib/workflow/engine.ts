// Workflow Engine Core Implementation
// محرك تدفق العمل الأساسي لنظام لاند سبايس

import { 
  WorkflowDefinition, 
  WorkflowInstance, 
  WorkflowState, 
  WorkflowTransition,
  WorkflowEvent,
  WorkflowTask,
  WorkflowParticipant,
  TransitionCondition,
  WorkflowAction,
  WorkflowEngineConfig
} from './types'

export class WorkflowEngine {
  private config: WorkflowEngineConfig
  private definitions: Map<string, WorkflowDefinition> = new Map()
  private instances: Map<string, WorkflowInstance> = new Map()
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor(config: WorkflowEngineConfig) {
    this.config = config
    this.initializeEngine()
  }

  // Engine Initialization
  private initializeEngine() {
    console.log('🚀 تهيئة محرك Workflow...')
    
    // Setup cleanup interval
    if (this.config.cleanupInterval > 0) {
      setInterval(() => {
        this.cleanupCompletedWorkflows()
      }, this.config.cleanupInterval * 60 * 1000)
    }
    
    console.log('✅ تم تهيئة محرك Workflow بنجاح')
  }

  // Workflow Definition Management
  public registerWorkflow(definition: WorkflowDefinition): void {
    this.validateWorkflowDefinition(definition)
    this.definitions.set(definition.id, definition)
    console.log(`📝 تم تسجيل workflow: ${definition.name}`)
  }

  public getWorkflowDefinition(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id)
  }

  public getAllWorkflowDefinitions(): WorkflowDefinition[] {
    return Array.from(this.definitions.values())
  }

  // Workflow Instance Management
  public async startWorkflow(
    definitionId: string, 
    data: any = {}, 
    initiator: WorkflowParticipant,
    options?: {
      title?: string
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      dueDate?: Date
    }
  ): Promise<string> {
    const definition = this.definitions.get(definitionId)
    if (!definition) {
      throw new Error(`Workflow definition not found: ${definitionId}`)
    }

    const initialState = definition.states.find(s => s.isInitial)
    if (!initialState) {
      throw new Error(`No initial state found for workflow: ${definitionId}`)
    }

    const instanceId = this.generateId()
    const now = new Date()

    const instance: WorkflowInstance = {
      id: instanceId,
      workflowDefinitionId: definitionId,
      title: options?.title || definition.name,
      currentState: initialState.id,
      status: 'running',
      priority: options?.priority || 'medium',
      initiator,
      participants: [initiator],
      data: {
        restaurantId: data.restaurantId,
        orderId: data.orderId,
        designId: data.designId,
        contractId: data.contractId,
        formData: data,
        files: [],
        customFields: {},
        approvals: [],
        comments: []
      },
      history: [{
        id: this.generateId(),
        timestamp: now,
        action: 'created',
        toState: initialState.id,
        actor: initiator,
        description: `تم إنشاء workflow جديد: ${instance.title}`
      }],
      tasks: [],
      tags: [],
      dueDate: options?.dueDate,
      metadata: {},
      createdAt: now,
      updatedAt: now
    }

    this.instances.set(instanceId, instance)

    // Emit workflow started event
    await this.emitEvent({
      id: this.generateId(),
      type: 'workflow_started',
      workflowInstanceId: instanceId,
      workflowDefinitionId: definitionId,
      timestamp: now,
      actor: initiator,
      data: { initialState: initialState.id }
    })

    // Execute initial state actions
    await this.executeStateActions(instance, initialState)

    console.log(`🚀 تم بدء workflow جديد: ${instance.title} (${instanceId})`)
    return instanceId
  }

  public getWorkflowInstance(id: string): WorkflowInstance | undefined {
    return this.instances.get(id)
  }

  public getAllWorkflowInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values())
  }

  public getWorkflowsByStatus(status: WorkflowInstance['status']): WorkflowInstance[] {
    return this.getAllWorkflowInstances().filter(w => w.status === status)
  }

  public getWorkflowsByParticipant(participantId: string): WorkflowInstance[] {
    return this.getAllWorkflowInstances().filter(w => 
      w.participants.some(p => p.id === participantId) || 
      w.assignee?.id === participantId
    )
  }

  // State Transitions
  public async transitionWorkflow(
    instanceId: string,
    transitionId: string,
    actor: WorkflowParticipant,
    data?: any
  ): Promise<boolean> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`)
    }

    const definition = this.definitions.get(instance.workflowDefinitionId)
    if (!definition) {
      throw new Error(`Workflow definition not found: ${instance.workflowDefinitionId}`)
    }

    const transition = definition.transitions.find(t => 
      t.id === transitionId && t.from === instance.currentState
    )
    if (!transition) {
      throw new Error(`Transition not found or not available: ${transitionId}`)
    }

    // Check permissions
    if (!this.hasPermission(actor, transition)) {
      throw new Error(`User does not have permission to execute this transition`)
    }

    // Evaluate conditions
    if (transition.conditions && !await this.evaluateConditions(transition.conditions, instance, data)) {
      throw new Error(`Transition conditions not met`)
    }

    // Find target state
    const targetState = definition.states.find(s => s.id === transition.to)
    if (!targetState) {
      throw new Error(`Target state not found: ${transition.to}`)
    }

    const fromState = instance.currentState
    const now = new Date()

    // Update instance
    instance.currentState = targetState.id
    instance.updatedAt = now

    // Add to history
    instance.history.push({
      id: this.generateId(),
      timestamp: now,
      action: 'state_changed',
      fromState,
      toState: targetState.id,
      actor,
      description: `انتقال من ${fromState} إلى ${targetState.id}`,
      changes: {
        state: { from: fromState, to: targetState.id }
      },
      metadata: data
    })

    // Check if workflow is completed
    if (targetState.isFinal) {
      instance.status = 'completed'
      instance.completedAt = now
    }

    // Execute transition actions
    if (transition.actions) {
      await this.executeActions(transition.actions, instance, actor)
    }

    // Execute new state actions
    await this.executeStateActions(instance, targetState)

    // Emit state changed event
    await this.emitEvent({
      id: this.generateId(),
      type: 'state_changed',
      workflowInstanceId: instanceId,
      workflowDefinitionId: definition.id,
      timestamp: now,
      actor,
      data: { fromState, toState: targetState.id, transitionId }
    })

    console.log(`🔄 انتقال workflow ${instanceId} من ${fromState} إلى ${targetState.id}`)
    return true
  }

  // Task Management
  public async createTask(
    instanceId: string,
    task: Omit<WorkflowTask, 'id' | 'workflowInstanceId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`)
    }

    const taskId = this.generateId()
    const now = new Date()

    const newTask: WorkflowTask = {
      ...task,
      id: taskId,
      workflowInstanceId: instanceId,
      createdAt: now,
      updatedAt: now
    }

    instance.tasks.push(newTask)
    instance.updatedAt = now

    // Add to history
    instance.history.push({
      id: this.generateId(),
      timestamp: now,
      action: 'created',
      actor: { id: 'system', type: 'system', name: 'النظام', role: 'system', permissions: [], isActive: true },
      description: `تم إنشاء مهمة جديدة: ${task.name}`
    })

    // Emit task created event
    await this.emitEvent({
      id: this.generateId(),
      type: 'task_created',
      workflowInstanceId: instanceId,
      workflowDefinitionId: instance.workflowDefinitionId,
      timestamp: now,
      data: { taskId, taskName: task.name }
    })

    console.log(`📋 تم إنشاء مهمة جديدة: ${task.name} (${taskId})`)
    return taskId
  }

  public async completeTask(
    instanceId: string,
    taskId: string,
    actor: WorkflowParticipant,
    result?: any
  ): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`Workflow instance not found: ${instanceId}`)
    }

    const task = instance.tasks.find(t => t.id === taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    if (task.status === 'completed') {
      throw new Error(`Task already completed: ${taskId}`)
    }

    const now = new Date()

    // Update task
    task.status = 'completed'
    task.completedAt = now
    task.updatedAt = now
    task.actualDuration = task.createdAt ? Math.floor((now.getTime() - task.createdAt.getTime()) / (1000 * 60)) : undefined

    // Add result if provided
    if (result) {
      if (!task.results) task.results = []
      task.results.push({
        id: this.generateId(),
        type: 'completed',
        value: result,
        actor,
        timestamp: now
      })
    }

    instance.updatedAt = now

    // Add to history
    instance.history.push({
      id: this.generateId(),
      timestamp: now,
      action: 'completed',
      actor,
      description: `تم إكمال المهمة: ${task.name}`
    })

    // Emit task completed event
    await this.emitEvent({
      id: this.generateId(),
      type: 'task_completed',
      workflowInstanceId: instanceId,
      workflowDefinitionId: instance.workflowDefinitionId,
      timestamp: now,
      actor,
      data: { taskId, taskName: task.name, result }
    })

    console.log(`✅ تم إكمال المهمة: ${task.name} (${taskId})`)
  }

  // Helper Methods
  private validateWorkflowDefinition(definition: WorkflowDefinition): void {
    if (!definition.id || !definition.name) {
      throw new Error('Workflow definition must have id and name')
    }

    if (!definition.states || definition.states.length === 0) {
      throw new Error('Workflow definition must have at least one state')
    }

    const initialStates = definition.states.filter(s => s.isInitial)
    if (initialStates.length !== 1) {
      throw new Error('Workflow definition must have exactly one initial state')
    }

    const finalStates = definition.states.filter(s => s.isFinal)
    if (finalStates.length === 0) {
      throw new Error('Workflow definition must have at least one final state')
    }
  }

  private hasPermission(actor: WorkflowParticipant, transition: WorkflowTransition): boolean {
    if (!transition.requiredRole && !transition.requiredPermissions) {
      return true
    }

    if (transition.requiredRole && actor.role !== transition.requiredRole) {
      return false
    }

    if (transition.requiredPermissions) {
      return transition.requiredPermissions.every(perm => 
        actor.permissions.includes(perm)
      )
    }

    return true
  }

  private async evaluateConditions(
    conditions: TransitionCondition[],
    instance: WorkflowInstance,
    data?: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition, instance, data)) {
        return false
      }
    }
    return true
  }

  private async evaluateCondition(
    condition: TransitionCondition,
    instance: WorkflowInstance,
    data?: any
  ): Promise<boolean> {
    switch (condition.type) {
      case 'field_value':
        return this.evaluateFieldValue(condition, instance.data.formData, data)
      
      case 'user_role':
        // Implementation for user role condition
        return true
      
      case 'time_elapsed':
        // Implementation for time elapsed condition
        return true
      
      case 'approval_status':
        return this.evaluateApprovalStatus(condition, instance)
      
      case 'custom_function':
        // Implementation for custom function
        return true
      
      default:
        return true
    }
  }

  private evaluateFieldValue(
    condition: TransitionCondition,
    formData: any,
    data?: any
  ): boolean {
    const value = formData[condition.field!] || data?.[condition.field!]
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'greater_than':
        return Number(value) > Number(condition.value)
      case 'less_than':
        return Number(value) < Number(condition.value)
      case 'contains':
        return String(value).includes(String(condition.value))
      case 'exists':
        return value !== undefined && value !== null
      default:
        return true
    }
  }

  private evaluateApprovalStatus(
    condition: TransitionCondition,
    instance: WorkflowInstance
  ): boolean {
    const approvals = instance.data.approvals
    if (!approvals || approvals.length === 0) {
      return condition.value === 'none'
    }

    const latestApproval = approvals[approvals.length - 1]
    return latestApproval.decision === condition.value
  }

  private async executeStateActions(instance: WorkflowInstance, state: WorkflowState): Promise<void> {
    if (state.actions && state.actions.length > 0) {
      await this.executeActions(state.actions, instance)
    }
  }

  private async executeActions(
    actions: WorkflowAction[],
    instance: WorkflowInstance,
    actor?: WorkflowParticipant
  ): Promise<void> {
    const sortedActions = actions.sort((a, b) => (a.order || 0) - (b.order || 0))

    for (const action of sortedActions) {
      try {
        await this.executeAction(action, instance, actor)
      } catch (error) {
        console.error(`خطأ في تنفيذ الإجراء ${action.name}:`, error)
        
        if (action.retryPolicy) {
          // Implement retry logic
        }
      }
    }
  }

  private async executeAction(
    action: WorkflowAction,
    instance: WorkflowInstance,
    actor?: WorkflowParticipant
  ): Promise<void> {
    console.log(`🔧 تنفيذ الإجراء: ${action.name}`)

    switch (action.type) {
      case 'notification':
        await this.sendNotification(action.parameters, instance, actor)
        break
      
      case 'email':
        await this.sendEmail(action.parameters, instance, actor)
        break
      
      case 'database_update':
        await this.updateDatabase(action.parameters, instance, actor)
        break
      
      case 'approval_request':
        await this.requestApproval(action.parameters, instance, actor)
        break
      
      default:
        console.log(`نوع الإجراء غير مدعوم: ${action.type}`)
    }
  }

  private async sendNotification(parameters: any, instance: WorkflowInstance, actor?: WorkflowParticipant): Promise<void> {
    // Implementation for sending in-app notifications
    console.log(`🔔 إرسال إشعار: ${parameters.message}`)
  }

  private async sendEmail(parameters: any, instance: WorkflowInstance, actor?: WorkflowParticipant): Promise<void> {
    // Implementation for sending emails
    console.log(`📧 إرسال بريد إلكتروني: ${parameters.subject}`)
  }

  private async updateDatabase(parameters: any, instance: WorkflowInstance, actor?: WorkflowParticipant): Promise<void> {
    // Implementation for database updates
    console.log(`💾 تحديث قاعدة البيانات: ${parameters.table}`)
  }

  private async requestApproval(parameters: any, instance: WorkflowInstance, actor?: WorkflowParticipant): Promise<void> {
    // Implementation for approval requests
    console.log(`✋ طلب موافقة من: ${parameters.approver}`)
  }

  private cleanupCompletedWorkflows(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - (this.config.cleanupInterval || 30))

    let cleanedCount = 0
    for (const [id, instance] of this.instances) {
      if (instance.status === 'completed' && 
          instance.completedAt && 
          instance.completedAt < cutoffDate) {
        this.instances.delete(id)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 تم تنظيف ${cleanedCount} workflow مكتمل`)
    }
  }

  private async emitEvent(event: WorkflowEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || []
    
    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (error) {
        console.error(`خطأ في معالج الحدث ${event.type}:`, error)
      }
    }

    // Log event if audit logging is enabled
    if (this.config.enableAuditLog) {
      console.log(`📝 حدث workflow: ${event.type} - ${event.workflowInstanceId}`)
    }
  }

  // Event Handling
  public on(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  public off(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

export default WorkflowEngine
