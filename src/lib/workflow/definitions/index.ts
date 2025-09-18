// Workflow Definitions Index - LandSpice System
// فهرس تعريفات تدفق العمل - نظام لاند سبايس

export * from './restaurant-order-workflow'
export * from './design-process-workflow' 
export * from './printing-workflow'
export * from './delivery-workflow'
export * from './payment-workflow'
export * from './guarantee-workflow'

// Re-export all workflow definitions
import { restaurantOrderWorkflow } from './restaurant-order-workflow'
import { designProcessWorkflow } from './design-process-workflow'
import { printingWorkflow } from './printing-workflow'
import { deliveryWorkflow } from './delivery-workflow'
import { paymentWorkflow } from './payment-workflow'
import { guaranteeWorkflow } from './guarantee-workflow'

export const allWorkflowDefinitions = [
  restaurantOrderWorkflow,
  designProcessWorkflow,
  printingWorkflow,
  deliveryWorkflow,
  paymentWorkflow,
  guaranteeWorkflow
]

export const workflowDefinitionMap = new Map([
  [restaurantOrderWorkflow.id, restaurantOrderWorkflow],
  [designProcessWorkflow.id, designProcessWorkflow],
  [printingWorkflow.id, printingWorkflow],
  [deliveryWorkflow.id, deliveryWorkflow],
  [paymentWorkflow.id, paymentWorkflow],
  [guaranteeWorkflow.id, guaranteeWorkflow]
])
