// Design Management Service for Yemeni Context
// خدمة إدارة التصميم للسياق اليمني

import {
  DesignRequest,
  DesignRequestFormData,
  DesignFilter,
  DesignSortOption,
  DesignStats,
  DesignEvent,
  DesignStatus,
  Designer,
  DesignType
} from './types'

import {
  validateDesignRequest,
  validateDesignRequestForm,
  generateRequestNumber,
  getEstimatedDeliveryDays,
  getDefaultFileFormats
} from './validation'

export class DesignService {
  private static instance: DesignService
  private requests: DesignRequest[] = []
  private designers: Designer[] = []
  private eventListeners: ((event: DesignEvent) => void)[] = []

  private constructor() {
    this.initializeDesigners()
    this.initializeMockData()
  }

  public static getInstance(): DesignService {
    if (!DesignService.instance) {
      DesignService.instance = new DesignService()
    }
    return DesignService.instance
  }

  // Event System
  public addEventListener(listener: (event: DesignEvent) => void): void {
    this.eventListeners.push(listener)
  }

  private emitEvent(event: DesignEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  // Designer Management
  private initializeDesigners(): void {
    this.designers = [
      {
        id: 'designer_001',
        name: 'أحمد محمد الحداد',
        email: 'ahmed.designer@landspice.ye',
        phone: '+967-1-234567',
        specialties: ['logo', 'business_card', 'complete_identity', 'brochure'],
        skillLevel: 'senior',
        yemeniCulturalExpertise: true,
        averageRating: 4.8,
        completedProjects: 156,
        onTimeDeliveryRate: 95,
        clientSatisfactionRate: 92,
        isAvailable: true,
        currentWorkload: 3,
        maxWorkload: 8,
        portfolioItems: [],
        isActive: true
      },
      {
        id: 'designer_002',
        name: 'فاطمة علي الزهراني',
        email: 'fatima.designer@landspice.ye',
        specialties: ['social_media', 'banner', 'website'],
        skillLevel: 'mid',
        yemeniCulturalExpertise: true,
        averageRating: 4.6,
        completedProjects: 89,
        onTimeDeliveryRate: 88,
        clientSatisfactionRate: 90,
        isAvailable: true,
        currentWorkload: 2,
        maxWorkload: 6,
        portfolioItems: [],
        isActive: true
      }
    ]
  }

  public getDesigners(): Designer[] {
    return this.designers.filter(designer => designer.isActive)
  }

  public getAvailableDesigners(designType?: DesignType): Designer[] {
    return this.designers.filter(designer => 
      designer.isActive && 
      designer.isAvailable &&
      designer.currentWorkload < designer.maxWorkload &&
      (!designType || designer.specialties.includes(designType))
    )
  }

  // CRUD Operations
  public async createDesignRequest(formData: DesignRequestFormData): Promise<{
    success: boolean
    request?: DesignRequest
    errors?: any[]
  }> {
    try {
      const validation = validateDesignRequestForm(formData)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const estimatedDays = getEstimatedDeliveryDays(formData.basic.type, 'medium')
      const defaultDeliveryDate = new Date()
      defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + estimatedDays)

      const request: DesignRequest = {
        id: this.generateId(),
        requestNumber: generateRequestNumber(),
        title: formData.basic.title,
        description: formData.basic.description,
        
        type: formData.basic.type,
        category: formData.basic.category,
        status: 'draft',
        priority: formData.basic.priority,
        complexity: 'medium',
        
        client: formData.client,
        requirements: {
          ...formData.requirements,
          fileFormats: getDefaultFileFormats(formData.basic.type)
        },
        culturalPreferences: formData.culturalPreferences,
        
        requestDate: new Date(),
        expectedDeliveryDate: formData.basic.expectedDeliveryDate || defaultDeliveryDate,
        deadlineExtensions: [],
        
        referenceFiles: [],
        draftFiles: [],
        finalFiles: [],
        
        revisions: [],
        feedback: [],
        statusHistory: [{
          id: this.generateId(),
          status: 'draft',
          timestamp: new Date(),
          changedBy: 'current-user',
          reason: 'إنشاء طلب تصميم جديد',
          automaticChange: false
        }],
        approvals: [],
        
        estimatedCost: formData.budget?.estimatedCost,
        currency: formData.budget?.currency || 'USD',
        billingStatus: 'pending',
        
        tags: formData.tags,
        notes: formData.notes ? [{
          id: this.generateId(),
          content: formData.notes,
          noteType: 'general',
          isPrivate: false,
          createdBy: 'current-user',
          createdDate: new Date(),
          visibleTo: []
        }] : [],
        
        isArchived: false,
        createdDate: new Date(),
        lastModified: new Date(),
        createdBy: 'current-user',
        lastModifiedBy: 'current-user',
        version: '1.0'
      }

      this.requests.push(request)
      this.emitEvent({ 
        type: 'request_created', 
        payload: request, 
        timestamp: new Date() 
      })

      return { success: true, request }
    } catch (error) {
      console.error('Error creating design request:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'حدث خطأ أثناء إنشاء طلب التصميم' }]
      }
    }
  }

  public async getDesignRequest(id: string): Promise<DesignRequest | null> {
    return this.requests.find(r => r.id === id && !r.isArchived) || null
  }

  public async getDesignRequests(
    filter: DesignFilter = {},
    sort: DesignSortOption = { field: 'requestDate', direction: 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    requests: DesignRequest[]
    total: number
    page: number
    limit: number
    stats: DesignStats
  }> {
    let filteredRequests = this.applyFilters(this.requests, filter)
    filteredRequests = this.applySorting(filteredRequests, sort)
    
    const stats = this.calculateStats(filteredRequests)
    
    const total = filteredRequests.length
    const startIndex = (page - 1) * limit
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + limit)

    return {
      requests: paginatedRequests,
      total,
      page,
      limit,
      stats
    }
  }

  // Search functionality
  public async searchRequests(query: string): Promise<DesignRequest[]> {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return []

    return this.requests.filter(request =>
      request.title.toLowerCase().includes(searchTerm) ||
      request.requestNumber.toLowerCase().includes(searchTerm) ||
      request.client.restaurantName.toLowerCase().includes(searchTerm)
    )
  }

  // Utility methods
  private generateId(): string {
    return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private applyFilters(requests: DesignRequest[], filter: DesignFilter): DesignRequest[] {
    return requests.filter(request => {
      if (filter.status && !filter.status.includes(request.status)) return false
      if (filter.type && !filter.type.includes(request.type)) return false
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        const matchesTitle = request.title.toLowerCase().includes(searchTerm)
        const matchesNumber = request.requestNumber.toLowerCase().includes(searchTerm)
        if (!matchesTitle && !matchesNumber) return false
      }
      return true
    })
  }

  private applySorting(requests: DesignRequest[], sort: DesignSortOption): DesignRequest[] {
    return [...requests].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sort.field) {
        case 'requestDate':
          aValue = a.requestDate
          bValue = b.requestDate
          break
        case 'deadline':
          aValue = a.expectedDeliveryDate
          bValue = b.expectedDeliveryDate
          break
        default:
          return 0
      }
      
      return sort.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })
  }

  private calculateStats(requests: DesignRequest[]): DesignStats {
    const stats: DesignStats = {
      total: requests.length,
      active: requests.filter(r => !['delivered', 'archived', 'cancelled'].includes(r.status)).length,
      completed: requests.filter(r => r.status === 'delivered').length,
      overdue: 0,
      
      byStatus: {
        draft: 0, submitted: 0, under_review: 0, assigned: 0, in_progress: 0,
        draft_ready: 0, client_review: 0, revision_requested: 0, revision_in_progress: 0,
        approved: 0, final_files_ready: 0, delivered: 0, archived: 0, cancelled: 0, on_hold: 0
      },
      byType: {
        logo: 0, business_card: 0, letterhead: 0, brochure: 0, banner: 0, menu: 0,
        packaging: 0, sticker: 0, social_media: 0, website: 0, complete_identity: 0
      },
      byCategory: {
        branding: 0, marketing: 0, print: 0, digital: 0, packaging: 0
      },
      byDesigner: {},
      
      averageCompletionTime: 0,
      onTimeDeliveryRate: 0,
      averageRevisions: 0,
      averageQualityRating: 0,
      averageClientSatisfaction: 0,
      
      totalRevenue: 0,
      averageProjectValue: 0,
      
      yemeniElementsUsage: 0,
      islamicComplianceRate: 0
    }

    requests.forEach(request => {
      stats.byStatus[request.status]++
      stats.byType[request.type]++
      stats.byCategory[request.category]++
    })

    return stats
  }

  private initializeMockData(): void {
    // Mock design request
    const mockRequest: DesignRequest = {
      id: 'design_001',
      requestNumber: 'DR-202409-123456',
      title: 'تصميم هوية بصرية - مطعم الأصالة اليمنية',
      type: 'complete_identity',
      category: 'branding',
      status: 'in_progress',
      priority: 'high',
      complexity: 'complex',
      
      client: {
        restaurantId: 'restaurant_001',
        restaurantName: 'مطعم الأصالة اليمنية',
        contactPerson: 'محمد أحمد الشامي',
        phone: '+967-1-456789',
        email: 'info@alasalah.ye'
      },
      
      requirements: {
        primaryText: 'مطعم الأصالة اليمنية',
        preferredColors: ['#8B4513', '#228B22'],
        avoidColors: [],
        styleDirection: 'تصميم تراثي يمني',
        moodKeywords: ['أصالة', 'تراث'],
        inspirationReferences: [],
        fileFormats: ['ai', 'png'],
        colorMode: 'RGB',
        usageContext: ['طباعة'],
        includeQRCode: false,
        includeContactInfo: true,
        multiLanguage: false,
        accessibilityRequirements: [],
        colorBlindFriendly: false
      },
      
      culturalPreferences: {
        arabicFont: 'خط النسخ',
        colorScheme: ['#8B4513'],
        includeTraditionalElements: true,
        islamicCompliant: true,
        yemeniCulturalElements: true
      },
      
      requestDate: new Date('2024-09-01'),
      expectedDeliveryDate: new Date('2024-09-15'),
      deadlineExtensions: [],
      
      referenceFiles: [],
      draftFiles: [],
      finalFiles: [],
      
      revisions: [],
      feedback: [],
      statusHistory: [],
      approvals: [],
      
      currency: 'USD',
      billingStatus: 'pending',
      
      tags: ['تراث', 'يمني'],
      notes: [],
      
      isArchived: false,
      createdDate: new Date(),
      lastModified: new Date(),
      createdBy: 'user',
      lastModifiedBy: 'user',
      version: '1.0'
    }

    this.requests.push(mockRequest)
  }
}

// Export singleton instance
export const designService = DesignService.getInstance()
