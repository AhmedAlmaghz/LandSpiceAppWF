// Bank Guarantee Service for Yemeni Banks
// خدمة إدارة الضمانات البنكية للبنوك اليمنية

import {
  BankGuarantee,
  GuaranteeFormData,
  GuaranteeFilter,
  GuaranteeSortOption,
  GuaranteeStats,
  GuaranteeEvent,
  GuaranteeStatus,
  BankInfo
} from './types'

import {
  validateBankGuarantee,
  validateGuaranteeForm,
  generateGuaranteeNumber,
  calculateCommission,
  isNearExpiry,
  isExpired
} from './validation'

export class BankGuaranteeService {
  private static instance: BankGuaranteeService
  private guarantees: BankGuarantee[] = []
  private banks: BankInfo[] = []
  private eventListeners: ((event: GuaranteeEvent) => void)[] = []

  private constructor() {
    this.initializeYemeniBanks()
    this.initializeMockData()
  }

  public static getInstance(): BankGuaranteeService {
    if (!BankGuaranteeService.instance) {
      BankGuaranteeService.instance = new BankGuaranteeService()
    }
    return BankGuaranteeService.instance
  }

  // Event System
  public addEventListener(listener: (event: GuaranteeEvent) => void): void {
    this.eventListeners.push(listener)
  }

  private emitEvent(event: GuaranteeEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  // Bank Management
  private initializeYemeniBanks(): void {
    this.banks = [
      {
        id: 'bank_alqasimi',
        name: 'بنك القاسمي اليمني',
        branchName: 'الفرع الرئيسي - صنعاء',
        branchCode: 'QAS001',
        address: {
          street: 'شارع الزبيري',
          city: 'صنعاء',
          governorate: 'صنعاء',
          country: 'اليمن'
        },
        contact: {
          phone: '+967-1-234567',
          email: 'info@alqasimi-bank.ye',
          manager: 'أحمد محمد الحداد'
        },
        commissionRates: {
          performance: 2.5,
          advancePayment: 3.0,
          maintenance: 2.0,
          bidBond: 1.5,
          customs: 2.5,
          finalPayment: 2.0
        },
        processingDays: {
          standard: 7,
          urgent: 3
        },
        workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        workingHours: {
          start: '08:00',
          end: '14:00'
        },
        isActive: true
      }
    ]
  }

  public getBanks(): BankInfo[] {
    return this.banks.filter(bank => bank.isActive)
  }

  public getBank(id: string): BankInfo | null {
    return this.banks.find(bank => bank.id === id) || null
  }

  // CRUD Operations
  public async createGuarantee(formData: GuaranteeFormData): Promise<{
    success: boolean
    guarantee?: BankGuarantee
    errors?: any[]
  }> {
    try {
      const validation = validateGuaranteeForm(formData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const bank = this.getBank(formData.bank.bankId)
      if (!bank) {
        return {
          success: false,
          errors: [{ field: 'bank', message: 'البنك المحدد غير موجود' }]
        }
      }

      const guarantee: BankGuarantee = {
        id: this.generateId(),
        guaranteeNumber: generateGuaranteeNumber(),
        type: formData.basic.type,
        status: 'draft',
        priority: formData.basic.priority,
        title: formData.basic.title,
        description: formData.basic.description,
        
        applicant: { ...formData.parties.applicant, id: this.generateId() },
        beneficiary: { ...formData.parties.beneficiary, id: this.generateId() },
        bank,
        
        amount: formData.basic.amount,
        currency: formData.basic.currency,
        commissionRate: bank.commissionRates[formData.basic.type],
        commissionAmount: calculateCommission(
          formData.basic.amount,
          bank.commissionRates[formData.basic.type]
        ),
        
        applicationDate: new Date(),
        expiryDate: formData.timeline.expiryDate,
        
        relatedContract: formData.relatedEntities.contractId,
        relatedProject: formData.relatedEntities.projectId,
        
        documents: [],
        submittedBy: 'current-user',
        
        statusHistory: [{
          id: this.generateId(),
          status: 'draft',
          timestamp: new Date(),
          changedBy: 'current-user',
          reason: 'إنشاء ضمانة جديدة',
          automaticChange: false
        }],
        
        alerts: [],
        
        isRenewable: formData.timeline.isRenewable,
        autoRenewal: formData.timeline.autoRenewal,
        renewalNoticeDays: formData.timeline.renewalNoticeDays,
        
        tags: formData.tags,
        notes: formData.notes ? [{
          id: this.generateId(),
          content: formData.notes,
          type: 'general',
          isPrivate: false,
          createdBy: 'current-user',
          createdDate: new Date(),
          visibleTo: []
        }] : [],
        
        createdDate: new Date(),
        lastModified: new Date(),
        createdBy: 'current-user',
        lastModifiedBy: 'current-user',
        version: '1.0',
        isArchived: false
      }

      this.guarantees.push(guarantee)
      this.emitEvent({ type: 'guarantee_created', payload: guarantee, timestamp: new Date() })

      return { success: true, guarantee }
    } catch (error) {
      console.error('Error creating guarantee:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'حدث خطأ أثناء إنشاء الضمانة' }]
      }
    }
  }

  public async getGuarantee(id: string): Promise<BankGuarantee | null> {
    return this.guarantees.find(g => g.id === id && !g.isArchived) || null
  }

  public async getGuarantees(
    filter: GuaranteeFilter = {},
    sort: GuaranteeSortOption = { field: 'applicationDate', direction: 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    guarantees: BankGuarantee[]
    total: number
    page: number
    limit: number
    stats: GuaranteeStats
  }> {
    let filteredGuarantees = this.applyFilters(this.guarantees, filter)
    filteredGuarantees = this.applySorting(filteredGuarantees, sort)
    
    const stats = this.calculateStats(filteredGuarantees)
    
    const total = filteredGuarantees.length
    const startIndex = (page - 1) * limit
    const paginatedGuarantees = filteredGuarantees.slice(startIndex, startIndex + limit)

    return {
      guarantees: paginatedGuarantees,
      total,
      page,
      limit,
      stats
    }
  }

  // Manual Bank Processing (No API Integration)
  public async submitToBankManually(
    guaranteeId: string,
    bankReference: string,
    submissionNotes?: string
  ): Promise<{ success: boolean }> {
    const guarantee = await this.getGuarantee(guaranteeId)
    if (!guarantee) return { success: false }

    guarantee.status = 'submitted'
    guarantee.bankReference = bankReference
    guarantee.bankNotes = submissionNotes
    guarantee.statusHistory.push({
      id: this.generateId(),
      status: 'submitted',
      previousStatus: 'draft',
      timestamp: new Date(),
      changedBy: 'current-user',
      notes: `تم إرسال الضمانة للبنك برقم مرجع: ${bankReference}`,
      automaticChange: false
    })

    this.emitEvent({
      type: 'guarantee_status_changed',
      payload: { id: guaranteeId, oldStatus: 'draft', newStatus: 'submitted' },
      timestamp: new Date()
    })

    return { success: true }
  }

  public async recordBankResponse(
    guaranteeId: string,
    approved: boolean,
    bankNotes?: string,
    referenceNumber?: string
  ): Promise<{ success: boolean }> {
    const guarantee = await this.getGuarantee(guaranteeId)
    if (!guarantee) return { success: false }

    const newStatus: GuaranteeStatus = approved ? 'approved' : 'rejected'
    guarantee.status = newStatus
    guarantee.bankNotes = bankNotes
    if (approved && referenceNumber) {
      guarantee.referenceNumber = referenceNumber
    }

    guarantee.statusHistory.push({
      id: this.generateId(),
      status: newStatus,
      previousStatus: 'submitted',
      timestamp: new Date(),
      changedBy: 'bank-user',
      notes: bankNotes || (approved ? 'تمت الموافقة من البنك' : 'تم الرفض من البنك'),
      automaticChange: false
    })

    return { success: true }
  }

  // Search and Filter
  public async searchGuarantees(query: string): Promise<BankGuarantee[]> {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.guarantees.filter(guarantee =>
      guarantee.title.toLowerCase().includes(searchTerm) ||
      guarantee.guaranteeNumber.toLowerCase().includes(searchTerm) ||
      guarantee.applicant.name.toLowerCase().includes(searchTerm)
    )
  }

  // Utility methods
  private generateId(): string {
    return `guarantee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private applyFilters(guarantees: BankGuarantee[], filter: GuaranteeFilter): BankGuarantee[] {
    return guarantees.filter(guarantee => {
      if (filter.status && !filter.status.includes(guarantee.status)) return false
      if (filter.type && !filter.type.includes(guarantee.type)) return false
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const matchesTitle = guarantee.title.toLowerCase().includes(searchTerm)
        const matchesNumber = guarantee.guaranteeNumber.toLowerCase().includes(searchTerm)
        if (!matchesTitle && !matchesNumber) return false
      }
      return true
    })
  }

  private applySorting(guarantees: BankGuarantee[], sort: GuaranteeSortOption): BankGuarantee[] {
    return [...guarantees].sort((a, b) => {
      let aValue: any, bValue: any
      switch (sort.field) {
        case 'applicationDate':
          aValue = a.applicationDate
          bValue = b.applicationDate
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        default:
          return 0
      }
      return sort.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })
  }

  private calculateStats(guarantees: BankGuarantee[]): GuaranteeStats {
    const stats: GuaranteeStats = {
      total: guarantees.length,
      active: guarantees.filter(g => g.status === 'active').length,
      expired: guarantees.filter(g => g.status === 'expired').length,
      nearExpiry: guarantees.filter(g => g.status === 'active' && isNearExpiry(g.expiryDate, 30)).length,
      byStatus: {
        draft: 0, submitted: 0, under_review: 0, approved: 0,
        issued: 0, active: 0, expired: 0, cancelled: 0, rejected: 0, returned: 0
      },
      byType: {
        performance: 0, advance_payment: 0, maintenance: 0,
        bid_bond: 0, customs: 0, final_payment: 0
      },
      byCurrency: { YER: 0, USD: 0, SAR: 0, EUR: 0 },
      byBank: {},
      totalAmount: guarantees.reduce((sum, g) => sum + g.amount, 0),
      averageAmount: guarantees.length > 0 ? guarantees.reduce((sum, g) => sum + g.amount, 0) / guarantees.length : 0,
      totalCommission: guarantees.reduce((sum, g) => sum + g.commissionAmount, 0),
      processingTimes: { average: 0, fastest: 0, slowest: 0 },
      byGovernorate: {},
      byBankBranch: {}
    }

    guarantees.forEach(guarantee => {
      stats.byStatus[guarantee.status]++
      stats.byType[guarantee.type]++
      stats.byCurrency[guarantee.currency]++
    })

    return stats
  }

  private initializeMockData(): void {
    // Mock data for testing
    const mockGuarantee: BankGuarantee = {
      id: 'guarantee_001',
      guaranteeNumber: 'BG-202409-123456',
      referenceNumber: 'QAS-2024-789',
      type: 'performance',
      status: 'active',
      priority: 'high',
      title: 'ضمان حسن تنفيذ عقد التصميم - مطعم الذواقة',
      description: 'ضمان حسن التنفيذ لعقد خدمات التصميم والهوية البصرية',
      
      applicant: {
        id: 'applicant_001',
        type: 'restaurant',
        name: 'مطعم الذواقة اليمني',
        legalName: 'شركة الذواقة للمطاعم والضيافة المحدودة',
        address: {
          street: 'شارع الستين',
          district: 'التحرير',
          city: 'صنعاء',
          governorate: 'صنعاء',
          country: 'اليمن'
        },
        contact: {
          primaryContact: 'محمد أحمد الشامي',
          position: 'المدير العام',
          phone: '+967-1-456789',
          email: 'info@althawaqah.ye'
        }
      },
      
      beneficiary: {
        id: 'beneficiary_001',
        type: 'landspice',
        name: 'شركة لاند سبايس اليمنية',
        legalName: 'شركة لاند سبايس للتجارة والتسويق المحدودة',
        address: {
          street: 'شارع الحديدة',
          district: 'الصافية',
          city: 'صنعاء',
          governorate: 'صنعاء',
          country: 'اليمن'
        },
        contact: {
          primaryContact: 'علي سالم العبدلي',
          position: 'مدير المبيعات',
          phone: '+967-1-789012',
          email: 'sales@landspice.ye'
        }
      },
      
      bank: this.banks[0],
      
      amount: 50000,
      currency: 'USD',
      commissionRate: 2.5,
      commissionAmount: 1250,
      
      applicationDate: new Date('2024-09-01'),
      issueDate: new Date('2024-09-08'),
      effectiveDate: new Date('2024-09-10'),
      expiryDate: new Date('2025-09-10'),
      
      documents: [],
      submittedBy: 'user_restaurant',
      
      statusHistory: [{
        id: 'history_001',
        status: 'active',
        timestamp: new Date(),
        changedBy: 'system',
        automaticChange: false
      }],
      
      alerts: [],
      
      isRenewable: true,
      autoRenewal: false,
      renewalNoticeDays: 30,
      
      tags: ['تصميم', 'مطاعم'],
      notes: [],
      
      createdDate: new Date('2024-09-01'),
      lastModified: new Date(),
      createdBy: 'user_restaurant',
      lastModifiedBy: 'user_restaurant',
      version: '1.0',
      isArchived: false
    }

    this.guarantees.push(mockGuarantee)
  }
}

// Export singleton instance
export const bankGuaranteeService = BankGuaranteeService.getInstance()
