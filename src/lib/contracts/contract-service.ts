// Contract Management Service
// خدمات إدارة العقود

import { 
  Contract, 
  ContractFilter, 
  ContractSortOption, 
  ContractStats, 
  ContractFormData,
  ContractEvent,
  ContractTemplate
} from './types'
import { validateContract, validateContractForm, generateContractNumber } from './validation'
import { designContractTemplate } from './templates/design-contract'
import { printingContractTemplate } from './templates/printing-contract'

export class ContractService {
  private static instance: ContractService
  private contracts: Contract[] = []
  private templates: ContractTemplate[] = []
  private eventListeners: ((event: ContractEvent) => void)[] = []

  private constructor() {
    this.initializeTemplates()
    this.initializeMockData()
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  // Event system
  public addEventListener(listener: (event: ContractEvent) => void): void {
    this.eventListeners.push(listener)
  }

  public removeEventListener(listener: (event: ContractEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private emitEvent(event: ContractEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  // Template Management
  private initializeTemplates(): void {
    this.templates = [
      designContractTemplate,
      printingContractTemplate
    ]
  }

  public getTemplates(): ContractTemplate[] {
    return this.templates.filter(template => template.isActive)
  }

  public getTemplate(id: string): ContractTemplate | null {
    return this.templates.find(template => template.id === id) || null
  }

  // CRUD Operations
  public async createContract(formData: ContractFormData): Promise<{
    success: boolean
    contract?: Contract
    errors?: any[]
  }> {
    try {
      const validation = validateContractForm(formData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const contract: Contract = {
        id: this.generateId(),
        title: formData.basic.title,
        contractNumber: generateContractNumber(),
        type: formData.basic.type,
        category: formData.basic.category,
        parties: formData.parties.map(party => ({
          ...party,
          id: this.generateId()
        })),
        primaryParty: '', // Will be set after parties creation
        secondaryParty: '', // Will be set after parties creation
        status: 'draft',
        priority: formData.basic.priority,
        createdDate: new Date(),
        effectiveDate: formData.timeline.effectiveDate,
        expiryDate: formData.timeline.expiryDate,
        renewalDate: formData.timeline.renewalDate,
        lastModified: new Date(),
        terms: formData.terms.map((term, index) => ({
          ...term,
          id: this.generateId(),
          order: index + 1
        })),
        financials: formData.financials,
        deliverables: formData.deliverables.map(deliverable => ({
          ...deliverable,
          id: this.generateId()
        })),
        governingLaw: formData.metadata.governingLaw,
        jurisdiction: formData.metadata.jurisdiction,
        disputeResolution: 'arbitration',
        confidentialityLevel: formData.metadata.confidentialityLevel,
        documents: [],
        templateId: undefined,
        workflowInstanceId: undefined,
        approvalStatus: {
          step: 'initial_review',
          approvedBy: [],
          rejectedBy: [],
          pendingApprovers: [],
          comments: []
        },
        performance: {
          completionPercentage: 0,
          deliverablesCompleted: 0,
          totalDeliverables: formData.deliverables.length,
          onTimeDelivery: true,
          budgetUtilization: 0,
          qualityScore: undefined,
          clientSatisfaction: undefined
        },
        alerts: [],
        tags: formData.metadata.tags,
        notes: [],
        createdBy: 'current-user', // This would be dynamic
        lastModifiedBy: 'current-user',
        version: '1.0',
        isArchived: false
      }

      // Set primary and secondary parties
      if (contract.parties.length >= 2) {
        contract.primaryParty = contract.parties[0].id
        contract.secondaryParty = contract.parties[1].id
      }

      this.contracts.push(contract)
      this.emitEvent({ type: 'contract_created', payload: contract })

      return { success: true, contract }
    } catch (error) {
      console.error('Error creating contract:', error)
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'حدث خطأ أثناء إنشاء العقد' }]
      }
    }
  }

  public async getContract(id: string): Promise<Contract | null> {
    return this.contracts.find(c => c.id === id) || null
  }

  public async getContracts(
    filter: ContractFilter = {},
    sort: ContractSortOption = { field: 'createdDate', direction: 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    contracts: Contract[]
    total: number
    page: number
    limit: number
    stats: ContractStats
  }> {
    let filteredContracts = this.applyFilters(this.contracts, filter)
    
    // Apply sorting
    filteredContracts = this.applySorting(filteredContracts, sort)
    
    // Calculate stats
    const stats = this.calculateStats(filteredContracts)
    
    // Apply pagination
    const total = filteredContracts.length
    const startIndex = (page - 1) * limit
    const paginatedContracts = filteredContracts.slice(startIndex, startIndex + limit)

    return {
      contracts: paginatedContracts,
      total,
      page,
      limit,
      stats
    }
  }

  public async updateContract(id: string, updates: Partial<Contract>): Promise<{
    success: boolean
    contract?: Contract
    errors?: any[]
  }> {
    try {
      const contractIndex = this.contracts.findIndex(c => c.id === id)
      if (contractIndex === -1) {
        return { 
          success: false, 
          errors: [{ field: 'general', message: 'العقد غير موجود' }]
        }
      }

      const currentContract = this.contracts[contractIndex]
      const updatedContract = {
        ...currentContract,
        ...updates,
        lastModified: new Date(),
        lastModifiedBy: 'current-user'
      }

      const validation = validateContract(updatedContract)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      this.contracts[contractIndex] = updatedContract
      this.emitEvent({ 
        type: 'contract_updated', 
        payload: { id, changes: updates }
      })

      return { success: true, contract: updatedContract }
    } catch (error) {
      console.error('Error updating contract:', error)
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'حدث خطأ أثناء تحديث العقد' }]
      }
    }
  }

  public async updateContractStatus(id: string, newStatus: Contract['status']): Promise<{
    success: boolean
    contract?: Contract
  }> {
    const contract = await this.getContract(id)
    if (!contract) {
      return { success: false }
    }

    const oldStatus = contract.status
    const result = await this.updateContract(id, { status: newStatus })
    
    if (result.success) {
      this.emitEvent({
        type: 'contract_status_changed',
        payload: { id, oldStatus, newStatus }
      })

      // Handle special status changes
      if (newStatus === 'signed') {
        this.emitEvent({
          type: 'contract_signed',
          payload: { id, signedBy: 'current-user', timestamp: new Date() }
        })
      }

      if (newStatus === 'expired') {
        this.emitEvent({
          type: 'contract_expired',
          payload: { id, expiryDate: contract.expiryDate }
        })
      }
    }

    return result
  }

  public async deleteContract(id: string): Promise<boolean> {
    const index = this.contracts.findIndex(c => c.id === id)
    if (index === -1) return false

    // Archive instead of delete
    const contract = this.contracts[index]
    contract.isArchived = true
    contract.lastModified = new Date()

    return true
  }

  // Search functionality
  public async searchContracts(query: string): Promise<Contract[]> {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.contracts.filter(contract => 
      contract.title.toLowerCase().includes(searchTerm) ||
      contract.contractNumber.toLowerCase().includes(searchTerm) ||
      contract.parties.some(party => 
        party.name.toLowerCase().includes(searchTerm) ||
        party.legalName.toLowerCase().includes(searchTerm)
      ) ||
      contract.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // Contract lifecycle management
  public async approveContract(id: string, approver: string, comments?: string): Promise<boolean> {
    const contract = await this.getContract(id)
    if (!contract) return false

    if (!contract.approvalStatus.approvedBy) {
      contract.approvalStatus.approvedBy = []
    }

    if (!contract.approvalStatus.approvedBy.includes(approver)) {
      contract.approvalStatus.approvedBy.push(approver)
    }

    if (comments) {
      if (!contract.approvalStatus.comments) {
        contract.approvalStatus.comments = []
      }
      contract.approvalStatus.comments.push({
        id: this.generateId(),
        author: approver,
        content: comments,
        timestamp: new Date(),
        type: 'approval'
      })
    }

    // Update status if all approvers have approved
    if (contract.approvalStatus.pendingApprovers && 
        contract.approvalStatus.pendingApprovers.length === 0) {
      await this.updateContractStatus(id, 'approval')
    }

    return true
  }

  public async rejectContract(id: string, rejector: string, reason: string): Promise<boolean> {
    const contract = await this.getContract(id)
    if (!contract) return false

    if (!contract.approvalStatus.rejectedBy) {
      contract.approvalStatus.rejectedBy = []
    }

    if (!contract.approvalStatus.rejectedBy.includes(rejector)) {
      contract.approvalStatus.rejectedBy.push(rejector)
    }

    if (!contract.approvalStatus.comments) {
      contract.approvalStatus.comments = []
    }

    contract.approvalStatus.comments.push({
      id: this.generateId(),
      author: rejector,
      content: reason,
      timestamp: new Date(),
      type: 'rejection'
    })

    await this.updateContractStatus(id, 'negotiation')
    return true
  }

  // Performance tracking
  public async updateDeliverableStatus(contractId: string, deliverableId: string, completed: boolean): Promise<boolean> {
    const contract = await this.getContract(contractId)
    if (!contract) return false

    const deliverable = contract.deliverables.find(d => d.id === deliverableId)
    if (!deliverable) return false

    if (completed) {
      this.emitEvent({
        type: 'deliverable_completed',
        payload: { contractId, deliverableId }
      })

      // Update performance metrics
      contract.performance.deliverablesCompleted = contract.deliverables.filter(
        d => d.timeline.milestones?.every(m => m.status === 'completed')
      ).length

      contract.performance.completionPercentage = Math.round(
        (contract.performance.deliverablesCompleted / contract.performance.totalDeliverables) * 100
      )
    }

    return true
  }

  // Utility methods
  private generateId(): string {
    return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private applyFilters(contracts: Contract[], filter: ContractFilter): Contract[] {
    return contracts.filter(contract => {
      if (filter.status && !filter.status.includes(contract.status)) return false
      if (filter.type && !filter.type.includes(contract.type)) return false
      if (filter.category && !filter.category.includes(contract.category)) return false
      if (filter.priority && !filter.priority.includes(contract.priority)) return false
      if (filter.hasActiveAlerts !== undefined) {
        const hasAlerts = contract.alerts.some(alert => alert.isActive)
        if (filter.hasActiveAlerts !== hasAlerts) return false
      }
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const matchesTitle = contract.title.toLowerCase().includes(searchTerm)
        const matchesNumber = contract.contractNumber.toLowerCase().includes(searchTerm)
        const matchesParty = contract.parties.some(party => 
          party.name.toLowerCase().includes(searchTerm)
        )
        if (!matchesTitle && !matchesNumber && !matchesParty) return false
      }
      return true
    })
  }

  private applySorting(contracts: Contract[], sort: ContractSortOption): Contract[] {
    return [...contracts].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sort.field) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'contractNumber':
          aValue = a.contractNumber
          bValue = b.contractNumber
          break
        case 'createdDate':
          aValue = a.createdDate
          bValue = b.createdDate
          break
        case 'expiryDate':
          aValue = a.expiryDate
          bValue = b.expiryDate
          break
        case 'value':
          aValue = a.financials.totalValue
          bValue = b.financials.totalValue
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        default:
          return 0
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  private calculateStats(contracts: Contract[]): ContractStats {
    const stats: ContractStats = {
      total: contracts.length,
      active: 0,
      draft: 0,
      expired: 0,
      byStatus: { 
        draft: 0, review: 0, negotiation: 0, approval: 0, 
        signed: 0, active: 0, completed: 0, terminated: 0, expired: 0 
      },
      byType: { 
        service: 0, supply: 0, partnership: 0, 
        licensing: 0, maintenance: 0, consulting: 0 
      },
      byCategory: { 
        design: 0, printing: 0, supply_chain: 0, 
        marketing: 0, technology: 0, general: 0 
      },
      totalValue: 0,
      averageValue: 0,
      expiringThisMonth: 0,
      overduePayments: 0
    }

    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    contracts.forEach(contract => {
      // Status counts
      stats.byStatus[contract.status]++
      if (contract.status === 'active') stats.active++
      if (contract.status === 'draft') stats.draft++
      if (contract.status === 'expired') stats.expired++

      // Type and category counts
      stats.byType[contract.type]++
      stats.byCategory[contract.category]++

      // Financial stats
      stats.totalValue += contract.financials.totalValue

      // Expiring contracts
      if (contract.expiryDate <= nextMonth && contract.expiryDate > now) {
        stats.expiringThisMonth++
      }
    })

    stats.averageValue = contracts.length > 0 ? stats.totalValue / contracts.length : 0

    return stats
  }

  private initializeMockData(): void {
    // Add some mock data for testing
    const mockContract: Contract = {
      id: 'contract_001',
      title: 'عقد خدمات التصميم - مطعم البيك',
      contractNumber: 'CON-2024-001234',
      type: 'service',
      category: 'design',
      parties: [
        {
          id: 'party_landspice',
          type: 'landspice',
          name: 'شركة لاند سبايس',
          legalName: 'شركة لاند سبايس للتجارة والتسويق',
          registrationNumber: '1234567890',
          taxId: '987654321',
          address: {
            street: 'شارع الملك عبدالعزيز',
            city: 'الرياض',
            region: 'الرياض',
            country: 'السعودية'
          },
          contact: {
            name: 'أحمد محمد',
            position: 'مدير المبيعات',
            phone: '+966501234567',
            email: 'ahmed@landspice.com'
          },
          signatory: {
            name: 'محمد علي',
            position: 'المدير العام'
          }
        },
        {
          id: 'party_restaurant',
          type: 'restaurant',
          name: 'مطعم البيك',
          legalName: 'شركة البيك للمأكولات السريعة',
          registrationNumber: '1111111111',
          taxId: '2222222222',
          address: {
            street: 'شارع الملك فهد',
            city: 'جدة',
            region: 'مكة المكرمة',
            country: 'السعودية'
          },
          contact: {
            name: 'سالم أحمد',
            position: 'مدير المطعم',
            phone: '+966506789012',
            email: 'salem@albaik.com'
          },
          signatory: {
            name: 'عبدالله سالم',
            position: 'المالك'
          }
        }
      ],
      primaryParty: 'party_landspice',
      secondaryParty: 'party_restaurant',
      status: 'active',
      priority: 'high',
      createdDate: new Date('2024-01-15'),
      effectiveDate: new Date('2024-02-01'),
      expiryDate: new Date('2025-02-01'),
      lastModified: new Date(),
      terms: [
        {
          id: 'term_001',
          title: 'ضمان الجودة',
          content: 'يضمن الطرف الأول جودة التصاميم المقدمة ومطابقتها للمواصفات المتفق عليها',
          type: 'clause',
          isRequired: true,
          order: 1
        }
      ],
      financials: {
        totalValue: 50000,
        currency: 'SAR',
        paymentTerms: {
          method: 'milestone',
          dueDate: 30,
          penaltyRate: 1.5,
          discountRate: 2
        },
        guaranteeRequired: 5000,
        guaranteeType: 'bank_guarantee'
      },
      deliverables: [
        {
          id: 'deliverable_001',
          title: 'تصميم الهوية البصرية',
          description: 'تصميم الشعار والهوية البصرية الكاملة للمطعم',
          category: 'design',
          timeline: {
            endDate: new Date('2024-03-15')
          }
        }
      ],
      governingLaw: 'النظام السعودي',
      jurisdiction: 'المحاكم السعودية',
      disputeResolution: 'arbitration',
      confidentialityLevel: 'internal',
      documents: [],
      templateId: 'template_design_001',
      approvalStatus: {
        step: 'execution',
        approvedBy: ['user1', 'user2']
      },
      performance: {
        completionPercentage: 75,
        deliverablesCompleted: 3,
        totalDeliverables: 4,
        onTimeDelivery: true,
        budgetUtilization: 65
      },
      alerts: [
        {
          id: 'alert_001',
          type: 'deliverable_due',
          severity: 'warning',
          message: 'مخرج متوقع خلال 3 أيام',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          isActive: true,
          createdDate: new Date()
        }
      ],
      tags: ['تصميم', 'مطاعم', 'هوية بصرية'],
      notes: [],
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      version: '1.0',
      isArchived: false
    }

    this.contracts.push(mockContract)
  }
}

// Export singleton instance
export const contractService = ContractService.getInstance()
