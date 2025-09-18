// Contract Management Service
// خدمات إدارة العقود

import { 
  Contract, 
  ContractFilter, 
  ContractSortOption, 
  ContractStats, 
  ContractFormData,
  ContractEvent,
  ContractTemplate,
  ContractStatus,
  ContractMilestone,
  ContractPayment
} from './types'
import { validateContract, validateContractForm } from './validation'
import { designContractTemplate } from './templates/design-contract'
import { printingContractTemplate } from './templates/printing-contract'
import { supplyContractTemplate } from './templates/supply-contract'

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
        console.error('Error in contract event listener:', error)
      }
    })
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        ...designContractTemplate,
        id: 'design-template-1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        createdBy: 'system',
        usageCount: 0
      },
      {
        ...printingContractTemplate,
        id: 'printing-template-1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        createdBy: 'system',
        usageCount: 0
      },
      {
        ...supplyContractTemplate,
        id: 'supply-template-1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        createdBy: 'system',
        usageCount: 0
      }
    ]
  }

  private initializeMockData(): void {
    // إضافة بيانات تجريبية للعقود
    this.contracts = [
      {
        id: 'contract-1',
        contractNumber: 'LSC-2025-001',
        title: 'عقد تصميم عبوات مطعم الذوق الأصيل',
        description: 'تصميم وإعداد عبوات الشطة والكاتشب المخصصة',
        type: 'design',
        status: 'active',
        priority: 'medium',
        parties: [
          {
            id: 'party-landspice',
            type: 'landspice',
            name: 'شركة لاند سبايس',
            legalName: 'شركة لاند سبايس للصناعات الغذائية المحدودة',
            representative: {
              name: 'أحمد محمد العلي',
              position: 'مدير العمليات',
              email: 'ahmed@landspice.sa',
              phone: '+966501234567'
            },
            signatureAuthority: true,
            signedAt: new Date('2025-01-15'),
            signatureMethod: 'digital'
          },
          {
            id: 'party-restaurant',
            type: 'restaurant',
            name: 'مطعم الذوق الأصيل',
            legalName: 'مؤسسة الذوق الأصيل للمطاعم',
            representative: {
              name: 'عبدالله سالم المطيري',
              position: 'المدير العام',
              email: 'info@originalflavor.sa',
              phone: '+966507654321'
            },
            signatureAuthority: true,
            signedAt: new Date('2025-01-15'),
            signatureMethod: 'digital'
          }
        ],
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-15'),
        renewalDate: undefined,
        autoRenewal: false,
        renewalPeriod: undefined,
        noticePeriod: 30,
        totalValue: 15000,
        currency: 'SAR',
        paymentTerms: [
          {
            id: 'payment-1',
            description: 'دفعة مقدمة',
            amount: 7500,
            currency: 'SAR',
            dueDate: new Date('2025-01-15'),
            paidDate: new Date('2025-01-15'),
            paidAmount: 7500,
            status: 'paid',
            paymentMethod: 'bank_transfer'
          },
          {
            id: 'payment-2',
            description: 'دفعة التسليم النهائي',
            amount: 7500,
            currency: 'SAR',
            dueDate: new Date('2025-02-15'),
            status: 'pending'
          }
        ],
        terms: [
          {
            id: 'term-1',
            title: 'جودة التصميم',
            description: 'التزام بمعايير الجودة العالية',
            category: 'quality',
            mandatory: true,
            negotiable: false,
            defaultValue: 'مطابقة 100%',
            acceptedValue: 'مطابقة 100%'
          }
        ],
        milestones: [
          {
            id: 'milestone-1',
            title: 'استلام المتطلبات',
            description: 'تجميع وتحليل متطلبات التصميم',
            dueDate: new Date('2025-01-17'),
            completedDate: new Date('2025-01-17'),
            status: 'completed',
            responsible: 'landspice',
            deliverables: ['وثيقة المتطلبات']
          },
          {
            id: 'milestone-2',
            title: 'التصميم الأولي',
            description: 'إعداد التصاميم الأولية',
            dueDate: new Date('2025-01-25'),
            status: 'in_progress',
            responsible: 'landspice',
            deliverables: ['تصميم أولي للشطة', 'تصميم أولي للكاتشب'],
            dependencies: ['milestone-1']
          }
        ],
        documents: [],
        workflowInstanceId: 'workflow-1',
        approvalHistory: [
          {
            id: 'approval-1',
            action: 'approve',
            performedBy: 'admin-1',
            performedAt: new Date('2025-01-15'),
            comments: 'موافقة على العقد',
            level: 1
          }
        ],
        riskLevel: 'low',
        complianceChecks: [
          {
            id: 'check-1',
            checkType: 'legal_review',
            status: 'passed',
            checkedAt: new Date('2025-01-14'),
            checkedBy: 'legal-team'
          }
        ],
        performance: {
          milestoneCompletion: 50,
          paymentCompletion: 50,
          overallScore: 85,
          lastReviewDate: new Date('2025-01-20'),
          nextReviewDate: new Date('2025-02-01')
        },
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-20'),
        createdBy: 'user-1',
        lastModifiedBy: 'user-1',
        template: 'design-template-1',
        tags: ['تصميم', 'عبوات', 'مطعم'],
        categories: ['design'],
        restaurantId: 'restaurant-1',
        notes: [
          {
            id: 'note-1',
            content: 'تم الاتفاق على التصميم الأولي',
            author: 'user-1',
            createdAt: new Date('2025-01-17'),
            isPrivate: false,
            category: 'general'
          }
        ],
        alerts: [
          {
            id: 'alert-1',
            type: 'milestone_due',
            title: 'موعد استحقاق المرحلة',
            description: 'مرحلة التصميم الأولي مستحقة خلال 3 أيام',
            dueDate: new Date('2025-01-25'),
            acknowledged: false
          }
        ]
      }
    ]
  }

  // Contract CRUD operations
  public async createContract(contractData: ContractFormData): Promise<{ success: boolean; contract?: Contract; errors?: any[] }> {
    try {
      const validation = validateContractForm(contractData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const contractNumber = this.generateContractNumber(contractData.basic.type)
      
      const contract: Contract = {
        id: `contract-${Date.now()}`,
        contractNumber,
        title: contractData.basic.title,
        description: contractData.basic.description,
        type: contractData.basic.type,
        status: 'draft',
        priority: contractData.basic.priority,
        parties: contractData.parties.map(p => ({ ...p, id: `party-${Date.now()}-${Math.random()}` })),
        startDate: contractData.basic.startDate,
        endDate: contractData.basic.endDate,
        renewalDate: undefined,
        autoRenewal: contractData.basic.autoRenewal,
        renewalPeriod: contractData.basic.renewalPeriod,
        noticePeriod: contractData.basic.noticePeriod,
        totalValue: contractData.financial.totalValue,
        currency: contractData.financial.currency,
        paymentTerms: contractData.financial.paymentSchedule.map(p => ({ 
          ...p, 
          id: `payment-${Date.now()}-${Math.random()}`,
          status: 'pending' as const
        })),
        terms: contractData.terms.map(t => ({ ...t, id: `term-${Date.now()}-${Math.random()}` })),
        milestones: contractData.milestones?.map(m => ({ ...m, id: `milestone-${Date.now()}-${Math.random()}` })) || [],
        documents: [],
        workflowInstanceId: undefined,
        approvalHistory: [],
        riskLevel: 'medium',
        complianceChecks: [],
        performance: {
          milestoneCompletion: 0,
          paymentCompletion: 0,
          overallScore: 0,
          lastReviewDate: undefined,
          nextReviewDate: undefined
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        lastModifiedBy: 'current-user',
        tags: contractData.tags,
        categories: contractData.categories,
        notes: [],
        alerts: []
      }

      this.contracts.push(contract)
      this.emitEvent({ type: 'contract_created', payload: contract })

      return { success: true, contract }
    } catch (error) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'خطأ في إنشاء العقد' }] 
      }
    }
  }

  public async updateContract(contractId: string, updates: Partial<Contract>): Promise<{ success: boolean; contract?: Contract; errors?: any[] }> {
    try {
      const contractIndex = this.contracts.findIndex(c => c.id === contractId)
      if (contractIndex === -1) {
        return { success: false, errors: [{ field: 'general', message: 'العقد غير موجود' }] }
      }

      const oldContract = this.contracts[contractIndex]
      const updatedContract = {
        ...oldContract,
        ...updates,
        updatedAt: new Date(),
        lastModifiedBy: 'current-user'
      }

      this.contracts[contractIndex] = updatedContract
      this.emitEvent({ type: 'contract_updated', payload: { id: contractId, changes: updates } })

      return { success: true, contract: updatedContract }
    } catch (error) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'خطأ في تحديث العقد' }] 
      }
    }
  }

  public async getContract(contractId: string): Promise<Contract | null> {
    return this.contracts.find(c => c.id === contractId) || null
  }

  public async getContracts(filter: ContractFilter = {}, sort: ContractSortOption = { field: 'createdAt', direction: 'desc' }): Promise<{
    contracts: Contract[]
    total: number
    stats: ContractStats
  }> {
    let filteredContracts = [...this.contracts]

    // Apply filters
    if (filter.status?.length) {
      filteredContracts = filteredContracts.filter(c => filter.status!.includes(c.status))
    }
    if (filter.type?.length) {
      filteredContracts = filteredContracts.filter(c => filter.type!.includes(c.type))
    }
    if (filter.priority?.length) {
      filteredContracts = filteredContracts.filter(c => filter.priority!.includes(c.priority))
    }
    if (filter.restaurantId) {
      filteredContracts = filteredContracts.filter(c => c.restaurantId === filter.restaurantId)
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      filteredContracts = filteredContracts.filter(c => 
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.contractNumber.toLowerCase().includes(term)
      )
    }

    // Apply sorting
    filteredContracts.sort((a, b) => {
      let valueA: any, valueB: any

      switch (sort.field) {
        case 'title':
          valueA = a.title.toLowerCase()
          valueB = b.title.toLowerCase()
          break
        case 'createdAt':
          valueA = a.createdAt.getTime()
          valueB = b.createdAt.getTime()
          break
        case 'startDate':
          valueA = a.startDate.getTime()
          valueB = b.startDate.getTime()
          break
        case 'endDate':
          valueA = a.endDate.getTime()
          valueB = b.endDate.getTime()
          break
        case 'totalValue':
          valueA = a.totalValue
          valueB = b.totalValue
          break
        case 'status':
          valueA = a.status
          valueB = b.status
          break
        case 'priority':
          valueA = a.priority
          valueB = b.priority
          break
        default:
          valueA = a.createdAt.getTime()
          valueB = b.createdAt.getTime()
      }

      if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1
      if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1
      return 0
    })

    // Calculate stats
    const stats = this.calculateStats(this.contracts)

    return {
      contracts: filteredContracts,
      total: filteredContracts.length,
      stats
    }
  }

  // Contract status management
  public async updateContractStatus(contractId: string, newStatus: ContractStatus, comments?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const contract = this.contracts.find(c => c.id === contractId)
      if (!contract) {
        return { success: false, error: 'العقد غير موجود' }
      }

      const oldStatus = contract.status
      contract.status = newStatus
      contract.updatedAt = new Date()
      contract.lastModifiedBy = 'current-user'

      // Add approval history
      contract.approvalHistory.push({
        id: `approval-${Date.now()}`,
        action: 'approve',
        performedBy: 'current-user',
        performedAt: new Date(),
        comments: comments || `تغيير الحالة من ${oldStatus} إلى ${newStatus}`,
        level: contract.approvalHistory.length + 1
      })

      this.emitEvent({ 
        type: 'contract_status_changed', 
        payload: { id: contractId, oldStatus, newStatus } 
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'خطأ في تحديث حالة العقد' }
    }
  }

  // Milestone management
  public async updateMilestone(contractId: string, milestoneId: string, updates: Partial<ContractMilestone>): Promise<{ success: boolean; error?: string }> {
    try {
      const contract = this.contracts.find(c => c.id === contractId)
      if (!contract) {
        return { success: false, error: 'العقد غير موجود' }
      }

      const milestone = contract.milestones.find(m => m.id === milestoneId)
      if (!milestone) {
        return { success: false, error: 'المرحلة غير موجودة' }
      }

      Object.assign(milestone, updates)
      contract.updatedAt = new Date()

      // Emit milestone completed event if status changed to completed
      if (updates.status === 'completed' && updates.completedDate) {
        this.emitEvent({
          type: 'milestone_completed',
          payload: { contractId, milestoneId, completedAt: updates.completedDate }
        })
      }

      // Recalculate performance
      this.updateContractPerformance(contract)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'خطأ في تحديث المرحلة' }
    }
  }

  // Payment management
  public async updatePayment(contractId: string, paymentId: string, updates: Partial<ContractPayment>): Promise<{ success: boolean; error?: string }> {
    try {
      const contract = this.contracts.find(c => c.id === contractId)
      if (!contract) {
        return { success: false, error: 'العقد غير موجود' }
      }

      const payment = contract.paymentTerms.find(p => p.id === paymentId)
      if (!payment) {
        return { success: false, error: 'الدفعة غير موجودة' }
      }

      Object.assign(payment, updates)
      contract.updatedAt = new Date()

      // Emit payment made event if payment completed
      if (updates.status === 'paid' && updates.paidDate) {
        this.emitEvent({
          type: 'payment_made',
          payload: { 
            contractId, 
            paymentId, 
            amount: updates.paidAmount || payment.amount,
            paidAt: updates.paidDate 
          }
        })
      }

      // Recalculate performance
      this.updateContractPerformance(contract)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'خطأ في تحديث الدفعة' }
    }
  }

  // Template management
  public getTemplates(): ContractTemplate[] {
    return this.templates.filter(t => t.isActive)
  }

  public getTemplate(templateId: string): ContractTemplate | null {
    return this.templates.find(t => t.id === templateId) || null
  }

  // Helper methods
  private generateContractNumber(type: string): string {
    const year = new Date().getFullYear()
    const typeCode = type.toUpperCase().substring(0, 3)
    const sequence = this.contracts.filter(c => c.type === type).length + 1
    return `LSC-${year}-${typeCode}-${sequence.toString().padStart(3, '0')}`
  }

  private calculateStats(contracts: Contract[]): ContractStats {
    const stats: ContractStats = {
      total: contracts.length,
      byStatus: {
        draft: 0, pending_review: 0, under_negotiation: 0, approved: 0,
        signed: 0, active: 0, completed: 0, terminated: 0, expired: 0
      },
      byType: { design: 0, printing: 0, supply: 0, maintenance: 0, marketing: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      totalValue: 0,
      averageValue: 0,
      completionRate: 0,
      overdueMilestones: 0,
      overduePayments: 0
    }

    contracts.forEach(contract => {
      stats.byStatus[contract.status]++
      stats.byType[contract.type]++
      stats.byPriority[contract.priority]++
      stats.totalValue += contract.totalValue

      // Count overdue items
      const now = new Date()
      stats.overdueMilestones += contract.milestones.filter(m => 
        m.status !== 'completed' && new Date(m.dueDate) < now
      ).length

      stats.overduePayments += contract.paymentTerms.filter(p => 
        p.status === 'pending' && new Date(p.dueDate) < now
      ).length
    })

    stats.averageValue = contracts.length > 0 ? stats.totalValue / contracts.length : 0
    stats.completionRate = contracts.length > 0 ? 
      (stats.byStatus.completed / contracts.length) * 100 : 0

    return stats
  }

  private updateContractPerformance(contract: Contract): void {
    const totalMilestones = contract.milestones.length
    const completedMilestones = contract.milestones.filter(m => m.status === 'completed').length
    const milestoneCompletion = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

    const totalPayments = contract.paymentTerms.length
    const paidPayments = contract.paymentTerms.filter(p => p.status === 'paid').length
    const paymentCompletion = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0

    contract.performance.milestoneCompletion = milestoneCompletion
    contract.performance.paymentCompletion = paymentCompletion
    contract.performance.overallScore = Math.round((milestoneCompletion + paymentCompletion) / 2)
    contract.performance.lastReviewDate = new Date()
  }
}
