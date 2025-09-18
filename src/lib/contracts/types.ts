// Contract Management Types
// أنواع بيانات إدارة العقود

export type ContractType = 'design' | 'printing' | 'supply' | 'maintenance' | 'marketing'
export type ContractStatus = 'draft' | 'pending_review' | 'under_negotiation' | 'approved' | 'signed' | 'active' | 'completed' | 'terminated' | 'expired'
export type ContractPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ContractParty {
  id: string
  type: 'restaurant' | 'bank' | 'supplier' | 'landspice' | 'marketer'
  name: string
  legalName: string
  representative: {
    name: string
    position: string
    email: string
    phone: string
  }
  signatureAuthority: boolean
  signedAt?: Date
  signatureMethod?: 'physical' | 'digital' | 'electronic'
}

export interface ContractTerm {
  id: string
  title: string
  description: string
  category: 'payment' | 'delivery' | 'quality' | 'liability' | 'termination' | 'other'
  mandatory: boolean
  negotiable: boolean
  defaultValue?: string
  acceptedValue?: string
}

export interface ContractMilestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completedDate?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  responsible: string // User ID or party ID
  deliverables: string[]
  dependencies?: string[] // Other milestone IDs
}

export interface ContractPayment {
  id: string
  description: string
  amount: number
  currency: 'SAR' | 'USD' | 'EUR'
  dueDate: Date
  paidDate?: Date
  paidAmount?: number
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'waived'
  paymentMethod?: 'bank_transfer' | 'check' | 'cash' | 'online'
  invoiceId?: string
  notes?: string
}

export interface ContractDocument {
  id: string
  title: string
  type: 'contract' | 'amendment' | 'attachment' | 'specification' | 'drawing' | 'certificate' | 'other'
  fileName: string
  filePath: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: string
  version: string
  status: 'draft' | 'final' | 'archived'
  signatures?: {
    partyId: string
    signedAt: Date
    signatureHash: string
  }[]
}

export interface Contract {
  id: string
  contractNumber: string
  title: string
  description: string
  type: ContractType
  status: ContractStatus
  priority: ContractPriority
  
  // Parties involved
  parties: ContractParty[]
  
  // Contract details
  startDate: Date
  endDate: Date
  renewalDate?: Date
  autoRenewal: boolean
  renewalPeriod?: number // in months
  noticePeriod: number // days before termination
  
  // Financial terms
  totalValue: number
  currency: 'SAR' | 'USD' | 'EUR'
  paymentTerms: ContractPayment[]
  
  // Contract terms and conditions
  terms: ContractTerm[]
  
  // Project milestones
  milestones: ContractMilestone[]
  
  // Documents and attachments
  documents: ContractDocument[]
  
  // Workflow and approvals
  workflowInstanceId?: string
  approvalHistory: {
    id: string
    action: 'submit' | 'approve' | 'reject' | 'sign' | 'amend'
    performedBy: string
    performedAt: Date
    comments?: string
    level: number
  }[]
  
  // Risk and compliance
  riskLevel: 'low' | 'medium' | 'high'
  complianceChecks: {
    id: string
    checkType: string
    status: 'passed' | 'failed' | 'pending'
    checkedAt?: Date
    checkedBy?: string
    notes?: string
  }[]
  
  // Performance tracking
  performance: {
    milestoneCompletion: number // percentage
    paymentCompletion: number // percentage
    overallScore: number // 0-100
    lastReviewDate?: Date
    nextReviewDate?: Date
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  template?: string // Template ID used
  
  // Tags and categories
  tags: string[]
  categories: string[]
  
  // Related entities
  restaurantId?: string
  projectId?: string
  parentContractId?: string
  childContractIds?: string[]
  
  // Internal notes and communications
  notes: {
    id: string
    content: string
    author: string
    createdAt: Date
    isPrivate: boolean
    category: 'general' | 'legal' | 'financial' | 'technical'
    attachments?: string[]
  }[]
  
  // Notifications and alerts
  alerts: {
    id: string
    type: 'milestone_due' | 'payment_due' | 'renewal_due' | 'termination_notice' | 'compliance_issue'
    title: string
    description: string
    dueDate: Date
    acknowledged: boolean
    acknowledgedAt?: Date
    acknowledgedBy?: string
  }[]
}

// Contract Templates
export interface ContractTemplate {
  id: string
  name: string
  description: string
  type: ContractType
  version: string
  isActive: boolean
  
  // Template structure
  sections: {
    id: string
    title: string
    order: number
    required: boolean
    content: string
    variables: string[] // Placeholder variables like {{restaurant.name}}
  }[]
  
  // Default terms
  defaultTerms: Omit<ContractTerm, 'id'>[]
  
  // Default milestones
  defaultMilestones: Omit<ContractMilestone, 'id'>[]
  
  // Template metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  usageCount: number
  
  // Legal compliance
  approvedBy?: string
  approvedAt?: Date
  legalReview: boolean
}

// Form types
export interface ContractFormData {
  basic: {
    title: string
    description: string
    type: ContractType
    priority: ContractPriority
    startDate: Date
    endDate: Date
    autoRenewal: boolean
    renewalPeriod?: number
    noticePeriod: number
  }
  parties: Omit<ContractParty, 'id'>[]
  financial: {
    totalValue: number
    currency: 'SAR' | 'USD' | 'EUR'
    paymentSchedule: Omit<ContractPayment, 'id'>[]
  }
  terms: Omit<ContractTerm, 'id'>[]
  milestones: Omit<ContractMilestone, 'id'>[]
  documents: File[]
  tags: string[]
  categories: string[]
}

// Filter and sort types
export interface ContractFilter {
  status?: ContractStatus[]
  type?: ContractType[]
  priority?: ContractPriority[]
  parties?: string[]
  startDateFrom?: Date
  startDateTo?: Date
  endDateFrom?: Date
  endDateTo?: Date
  valueMin?: number
  valueMax?: number
  tags?: string[]
  searchTerm?: string
  restaurantId?: string
  overdueMilestones?: boolean
  overduePayments?: boolean
}

export interface ContractSortOption {
  field: 'title' | 'createdAt' | 'startDate' | 'endDate' | 'totalValue' | 'status' | 'priority'
  direction: 'asc' | 'desc'
}

// Statistics and reporting
export interface ContractStats {
  total: number
  byStatus: Record<ContractStatus, number>
  byType: Record<ContractType, number>
  byPriority: Record<ContractPriority, number>
  totalValue: number
  averageValue: number
  completionRate: number
  overdueMilestones: number
  overduePayments: number
}

// API Response types
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

// Event types
export type ContractEvent = 
  | { type: 'contract_created'; payload: Contract }
  | { type: 'contract_updated'; payload: { id: string; changes: Partial<Contract> } }
  | { type: 'contract_status_changed'; payload: { id: string; oldStatus: ContractStatus; newStatus: ContractStatus } }
  | { type: 'contract_signed'; payload: { id: string; partyId: string; signedAt: Date } }
  | { type: 'milestone_completed'; payload: { contractId: string; milestoneId: string; completedAt: Date } }
  | { type: 'payment_made'; payload: { contractId: string; paymentId: string; amount: number; paidAt: Date } }
  | { type: 'contract_expired'; payload: { id: string; expiredAt: Date } }
  | { type: 'alert_created'; payload: { contractId: string; alertType: Contract['alerts'][0]['type'] } }
