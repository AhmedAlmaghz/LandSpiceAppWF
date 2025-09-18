// Contract Management Types
// أنواع بيانات إدارة العقود

export interface ContractParty {
  id: string
  type: 'landspice' | 'restaurant' | 'bank' | 'supplier' | 'other'
  name: string
  legalName: string
  registrationNumber?: string
  taxId?: string
  address: {
    street: string
    city: string
    region: string
    postalCode?: string
    country: string
  }
  contact: {
    name: string
    position: string
    phone: string
    email: string
  }
  signatory: {
    name: string
    position: string
    nationalId?: string
    signature?: string
  }
}

export interface ContractTerm {
  id: string
  title: string
  content: string
  type: 'clause' | 'condition' | 'obligation' | 'penalty' | 'termination'
  isRequired: boolean
  order: number
  variables?: Record<string, any>
}

export interface ContractFinancials {
  totalValue: number
  currency: 'SAR' | 'USD' | 'EUR'
  paymentTerms: {
    method: 'monthly' | 'quarterly' | 'annually' | 'milestone' | 'custom'
    dueDate: number // days from invoice
    penaltyRate?: number // percentage per day
    discountRate?: number // early payment discount
  }
  guaranteeRequired: number
  guaranteeType: 'bank_guarantee' | 'cash_deposit' | 'insurance' | 'none'
  installments?: {
    id: string
    amount: number
    dueDate: Date
    description: string
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  }[]
}

export interface ContractDeliverable {
  id: string
  title: string
  description: string
  category: 'design' | 'printing' | 'delivery' | 'training' | 'support' | 'other'
  quantity?: number
  unit?: string
  specifications?: Record<string, any>
  timeline: {
    startDate?: Date
    endDate: Date
    milestones?: {
      id: string
      title: string
      date: Date
      status: 'pending' | 'completed' | 'delayed' | 'cancelled'
    }[]
  }
  dependencies?: string[] // other deliverable IDs
  assignedTo?: string // user ID
}

export interface ContractDocument {
  id: string
  title: string
  type: 'contract' | 'amendment' | 'attachment' | 'invoice' | 'receipt' | 'report' | 'correspondence'
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  uploadDate: Date
  uploadedBy: string
  version: string
  isActive: boolean
  digitalSignatures?: {
    partyId: string
    signatureData: string
    timestamp: Date
    ipAddress: string
    certificateId?: string
  }[]
}

export interface Contract {
  id: string
  title: string
  contractNumber: string
  type: 'service' | 'supply' | 'partnership' | 'licensing' | 'maintenance' | 'consulting'
  category: 'design' | 'printing' | 'supply_chain' | 'marketing' | 'technology' | 'general'
  
  // Parties
  parties: ContractParty[]
  primaryParty: string // party ID (usually LandSpice)
  secondaryParty: string // party ID (usually Restaurant)
  
  // Status and Timeline
  status: 'draft' | 'review' | 'negotiation' | 'approval' | 'signed' | 'active' | 'completed' | 'terminated' | 'expired'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Dates
  createdDate: Date
  effectiveDate: Date
  expiryDate: Date
  renewalDate?: Date
  terminationDate?: Date
  lastModified: Date
  
  // Contract Content
  terms: ContractTerm[]
  financials: ContractFinancials
  deliverables: ContractDeliverable[]
  
  // Legal and Compliance
  governingLaw: string
  jurisdiction: string
  disputeResolution: 'arbitration' | 'litigation' | 'mediation'
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  
  // Documents
  documents: ContractDocument[]
  templateId?: string
  
  // Workflow Integration
  workflowInstanceId?: string
  approvalStatus: {
    step: string
    approvedBy?: string[]
    rejectedBy?: string[]
    pendingApprovers?: string[]
    comments?: {
      id: string
      author: string
      content: string
      timestamp: Date
      type: 'approval' | 'rejection' | 'comment' | 'question'
    }[]
  }
  
  // Performance Tracking
  performance: {
    completionPercentage: number
    deliverablesCompleted: number
    totalDeliverables: number
    onTimeDelivery: boolean
    budgetUtilization: number
    qualityScore?: number
    clientSatisfaction?: number
  }
  
  // Notifications and Alerts
  alerts: {
    id: string
    type: 'renewal_due' | 'payment_due' | 'deliverable_due' | 'expiry_warning' | 'compliance_issue'
    severity: 'info' | 'warning' | 'error'
    message: string
    dueDate?: Date
    isActive: boolean
    createdDate: Date
  }[]
  
  // Metadata
  tags: string[]
  notes: {
    id: string
    content: string
    author: string
    timestamp: Date
    isPrivate: boolean
    category: 'general' | 'legal' | 'financial' | 'technical' | 'compliance'
  }[]
  
  // System Fields
  createdBy: string
  lastModifiedBy: string
  version: string
  isArchived: boolean
}

export interface ContractTemplate {
  id: string
  name: string
  description: string
  category: Contract['category']
  type: Contract['type']
  language: 'ar' | 'en'
  version: string
  isActive: boolean
  
  // Template Structure
  structure: {
    header: string
    sections: {
      id: string
      title: string
      content: string
      order: number
      isRequired: boolean
      variables?: string[]
    }[]
    footer: string
  }
  
  // Default Values
  defaultTerms: Omit<ContractTerm, 'id'>[]
  defaultFinancials: Partial<ContractFinancials>
  defaultDeliverables: Omit<ContractDeliverable, 'id'>[]
  
  // Template Metadata
  createdDate: Date
  lastModified: Date
  createdBy: string
  usageCount: number
  tags: string[]
}

// Filter and Search Types
export interface ContractFilter {
  status?: Contract['status'][]
  type?: Contract['type'][]
  category?: Contract['category'][]
  priority?: Contract['priority'][]
  parties?: string[]
  createdDateFrom?: Date
  createdDateTo?: Date
  expiryDateFrom?: Date
  expiryDateTo?: Date
  valueFrom?: number
  valueTo?: number
  tags?: string[]
  searchTerm?: string
  hasActiveAlerts?: boolean
}

export interface ContractSortOption {
  field: 'title' | 'contractNumber' | 'createdDate' | 'expiryDate' | 'value' | 'status' | 'priority'
  direction: 'asc' | 'desc'
}

export interface ContractStats {
  total: number
  active: number
  draft: number
  expired: number
  byStatus: Record<Contract['status'], number>
  byType: Record<Contract['type'], number>
  byCategory: Record<Contract['category'], number>
  totalValue: number
  averageValue: number
  expiringThisMonth: number
  overduePayments: number
}

// Form Types
export interface ContractFormData {
  basic: Pick<Contract, 'title' | 'type' | 'category' | 'priority'>
  parties: Omit<ContractParty, 'id'>[]
  timeline: {
    effectiveDate: Date
    expiryDate: Date
    renewalDate?: Date
  }
  financials: ContractFinancials
  terms: Omit<ContractTerm, 'id'>[]
  deliverables: Omit<ContractDeliverable, 'id'>[]
  documents: File[]
  metadata: {
    tags: string[]
    governingLaw: string
    jurisdiction: string
    confidentialityLevel: Contract['confidentialityLevel']
  }
}

// API Response Types
export interface ContractListResponse {
  contracts: Contract[]
  total: number
  page: number
  limit: number
  stats: ContractStats
}

export interface ContractResponse {
  contract: Contract
  success: boolean
  message?: string
}

// Event Types
export type ContractEvent = 
  | { type: 'contract_created'; payload: Contract }
  | { type: 'contract_updated'; payload: { id: string; changes: Partial<Contract> } }
  | { type: 'contract_status_changed'; payload: { id: string; oldStatus: Contract['status']; newStatus: Contract['status'] } }
  | { type: 'contract_signed'; payload: { id: string; signedBy: string; timestamp: Date } }
  | { type: 'deliverable_completed'; payload: { contractId: string; deliverableId: string } }
  | { type: 'payment_received'; payload: { contractId: string; amount: number; installmentId?: string } }
  | { type: 'contract_expired'; payload: { id: string; expiryDate: Date } }
  | { type: 'renewal_due'; payload: { id: string; renewalDate: Date } }

// Workflow Integration Types
export interface ContractWorkflowData {
  contractId: string
  type: 'approval' | 'execution' | 'renewal' | 'termination'
  currentStep: string
  metadata: Record<string, any>
}
