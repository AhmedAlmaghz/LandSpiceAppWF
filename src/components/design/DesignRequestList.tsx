'use client'

import React, { useState, useEffect } from 'react'
import { DesignRequest, DesignFilter, DesignSortOption } from '@/lib/design/types'
import DesignRequestCard from './DesignRequestCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface DesignRequestListProps {
  onAddNew?: () => void
  onEdit?: (request: DesignRequest) => void
  onView?: (request: DesignRequest) => void
  onAssign?: (request: DesignRequest) => void
  onUploadDraft?: (request: DesignRequest) => void
  onApprove?: (request: DesignRequest) => void
  onRequestRevision?: (request: DesignRequest) => void
  viewMode?: 'grid' | 'table' | 'compact'
  userRole?: 'client' | 'designer' | 'manager' | 'admin'
}

export default function DesignRequestList({
  onAddNew,
  onEdit,
  onView,
  onAssign,
  onUploadDraft,
  onApprove,
  onRequestRevision,
  viewMode: initialViewMode = 'grid',
  userRole = 'client'
}: DesignRequestListProps) {
  const [requests, setRequests] = useState<DesignRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<DesignRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [filter, setFilter] = useState<DesignFilter>({})
  const [sortOption, setSortOption] = useState<DesignSortOption>({
    field: 'requestDate',
    direction: 'desc'
  })

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في عناوين المشاريع...'
    },
    {
      key: 'status',
      type: 'multiselect' as const,
      label: 'الحالة',
      options: [
        { value: 'draft', label: 'مسودة' },
        { value: 'submitted', label: 'مرسل' },
        { value: 'under_review', label: 'قيد المراجعة' },
        { value: 'assigned', label: 'مُعيّن' },
        { value: 'in_progress', label: 'قيد التنفيذ' },
        { value: 'draft_ready', label: 'مسودة جاهزة' },
        { value: 'client_review', label: 'مراجعة العميل' },
        { value: 'revision_requested', label: 'تعديل مطلوب' },
        { value: 'approved', label: 'موافق عليه' },
        { value: 'delivered', label: 'مُسلّم' }
      ]
    },
    {
      key: 'type',
      type: 'multiselect' as const,
      label: 'نوع التصميم',
      options: [
        { value: 'logo', label: 'شعار' },
        { value: 'business_card', label: 'بطاقة عمل' },
        { value: 'complete_identity', label: 'هوية بصرية كاملة' },
        { value: 'brochure', label: 'بروشور' },
        { value: 'menu', label: 'قائمة طعام' },
        { value: 'social_media', label: 'سوشيال ميديا' }
      ]
    },
    {
      key: 'priority',
      type: 'multiselect' as const,
      label: 'الأولوية',
      options: [
        { value: 'low', label: 'منخفض' },
        { value: 'medium', label: 'متوسط' },
        { value: 'high', label: 'عالي' },
        { value: 'urgent', label: 'عاجل' }
      ]
    },
    {
      key: 'includesYemeniElements',
      type: 'boolean' as const,
      label: 'عناصر يمنية',
      trueLabel: 'يتضمن عناصر يمنية',
      falseLabel: 'عادي'
    }
  ]

  useEffect(() => {
    loadRequests()
  }, [currentPage, filter, sortOption])

  const loadRequests = async () => {
    setLoading(true)
    try {
      // Mock data - في التطبيق الحقيقي سيكون API call
      const mockRequests: DesignRequest[] = [
        {
          id: 'design_001',
          requestNumber: 'DR-202409-123456',
          title: 'تصميم هوية بصرية شاملة - مطعم الأصالة اليمنية',
          description: 'تصميم هوية بصرية كاملة تعكس التراث اليمني الأصيل',
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
            secondaryText: 'نكهة أصيلة من قلب اليمن',
            englishText: 'Al-Asalah Yemeni Restaurant',
            preferredColors: ['#8B4513', '#228B22', '#FFD700'],
            avoidColors: [],
            styleDirection: 'تصميم تراثي يمني مع لمسة عصرية',
            moodKeywords: ['أصالة', 'تراث', 'يمني', 'دافئ'],
            inspirationReferences: [],
            fileFormats: ['ai', 'png', 'pdf'],
            colorMode: 'RGB',
            usageContext: ['طباعة', 'رقمي'],
            includeQRCode: true,
            includeContactInfo: true,
            multiLanguage: true,
            accessibilityRequirements: [],
            colorBlindFriendly: false
          },
          
          culturalPreferences: {
            arabicFont: 'خط النسخ',
            colorScheme: ['#8B4513', '#228B22'],
            includeTraditionalElements: true,
            islamicCompliant: true,
            yemeniCulturalElements: true
          },
          
          requestDate: new Date('2024-09-01'),
          expectedDeliveryDate: new Date('2024-09-15'),
          deadlineExtensions: [],
          
          assignedDesigner: 'أحمد محمد الحداد',
          assignedDate: new Date('2024-09-02'),
          estimatedHours: 40,
          
          referenceFiles: [],
          draftFiles: [],
          finalFiles: [],
          
          revisions: [],
          feedback: [],
          
          statusHistory: [
            {
              id: 'history_001',
              status: 'draft',
              timestamp: new Date('2024-09-01'),
              changedBy: 'client',
              reason: 'إنشاء طلب جديد',
              automaticChange: false
            },
            {
              id: 'history_002',
              status: 'in_progress',
              previousStatus: 'assigned',
              timestamp: new Date('2024-09-02'),
              changedBy: 'designer',
              reason: 'بدء العمل على التصميم',
              automaticChange: false
            }
          ],
          
          approvals: [],
          
          estimatedCost: 800,
          currency: 'USD',
          billingStatus: 'pending',
          
          tags: ['تراث', 'يمني', 'هوية بصرية'],
          notes: [],
          
          isArchived: false,
          createdDate: new Date('2024-09-01'),
          lastModified: new Date(),
          createdBy: 'client',
          lastModifiedBy: 'designer',
          version: '1.2'
        },
        {
          id: 'design_002',
          requestNumber: 'DR-202409-123457',
          title: 'تصميم قائمة طعام - مطعم الذواقة',
          type: 'menu',
          category: 'print',
          status: 'draft_ready',
          priority: 'medium',
          complexity: 'medium',
          
          client: {
            restaurantId: 'restaurant_002',
            restaurantName: 'مطعم الذواقة',
            contactPerson: 'سالم عبدالله',
            phone: '+967-1-567890',
            email: 'info@althawaqah.ye'
          },
          
          requirements: {
            primaryText: 'مطعم الذواقة',
            preferredColors: ['#4169E1', '#FFD700'],
            avoidColors: [],
            styleDirection: 'تصميم عصري وأنيق',
            moodKeywords: ['عصري', 'أنيق'],
            inspirationReferences: [],
            fileFormats: ['pdf', 'png'],
            colorMode: 'CMYK',
            usageContext: ['طباعة'],
            includeQRCode: false,
            includeContactInfo: true,
            multiLanguage: false,
            accessibilityRequirements: [],
            colorBlindFriendly: false
          },
          
          culturalPreferences: {
            arabicFont: 'خط الثلث',
            colorScheme: ['#4169E1'],
            includeTraditionalElements: false,
            islamicCompliant: true,
            yemeniCulturalElements: false
          },
          
          requestDate: new Date('2024-09-10'),
          expectedDeliveryDate: new Date('2024-09-17'),
          deadlineExtensions: [],
          
          assignedDesigner: 'فاطمة علي الزهراني',
          assignedDate: new Date('2024-09-11'),
          estimatedHours: 12,
          
          referenceFiles: [],
          draftFiles: [],
          finalFiles: [],
          
          revisions: [],
          feedback: [],
          statusHistory: [],
          approvals: [],
          
          estimatedCost: 300,
          currency: 'USD',
          billingStatus: 'pending',
          
          tags: ['قائمة طعام', 'طباعة'],
          notes: [],
          
          isArchived: false,
          createdDate: new Date('2024-09-10'),
          lastModified: new Date(),
          createdBy: 'client',
          lastModifiedBy: 'designer',
          version: '1.0'
        }
      ]

      setRequests(mockRequests)
      setFilteredRequests(mockRequests)
      setTotalItems(mockRequests.length)
    } catch (error) {
      console.error('Error loading design requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: DesignFilter = {
      ...filter,
      ...searchFilters
    }
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRequests.map((request) => (
        <DesignRequestCard
          key={request.id}
          request={request}
          variant="default"
          onClick={() => onView && onView(request)}
          showActions={true}
          onEdit={() => onEdit && onEdit(request)}
          onView={() => onView && onView(request)}
          onAssign={() => onAssign && onAssign(request)}
          onUploadDraft={() => onUploadDraft && onUploadDraft(request)}
          onApprove={() => onApprove && onApprove(request)}
          onRequestRevision={() => onRequestRevision && onRequestRevision(request)}
          showDesignerInfo={userRole !== 'client'}
        />
      ))}
    </div>
  )

  const renderCompactView = () => (
    <div className="space-y-3">
      {filteredRequests.map((request) => (
        <DesignRequestCard
          key={request.id}
          request={request}
          variant="compact"
          onClick={() => onView && onView(request)}
          showActions={true}
          onEdit={() => onEdit && onEdit(request)}
          onView={() => onView && onView(request)}
          onAssign={() => onAssign && onAssign(request)}
          onUploadDraft={() => onUploadDraft && onUploadDraft(request)}
          onApprove={() => onApprove && onApprove(request)}
          onRequestRevision={() => onRequestRevision && onRequestRevision(request)}
          showDesignerInfo={userRole !== 'client'}
        />
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              المشروع
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              النوع
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              العميل
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              المصمم
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الحالة
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الموعد النهائي
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{request.title}</div>
                  <div className="text-sm text-gray-500">{request.requestNumber}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {request.type === 'logo' ? 'شعار' :
                   request.type === 'complete_identity' ? 'هوية كاملة' :
                   request.type === 'menu' ? 'قائمة طعام' : request.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.client.restaurantName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.assignedDesigner || 'غير معين'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'draft_ready' ? 'bg-green-100 text-green-800' :
                  request.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status === 'draft' ? 'مسودة' :
                   request.status === 'in_progress' ? 'قيد التنفيذ' :
                   request.status === 'draft_ready' ? 'مسودة جاهزة' :
                   request.status === 'delivered' ? 'مُسلّم' : request.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(request.expectedDeliveryDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2 space-x-reverse">
                  {onView && (
                    <button
                      onClick={() => onView(request)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      عرض
                    </button>
                  )}
                  {onEdit && request.status === 'draft' && (
                    <button
                      onClick={() => onEdit(request)}
                      className="text-green-600 hover:text-green-900"
                    >
                      تحرير
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )
    }

    if (filteredRequests.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🎨</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات تصميم</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على أي طلبات تطابق المعايير المحددة</p>
          {onAddNew && (
            <Button onClick={onAddNew} className="mx-auto">
              طلب تصميم جديد
            </Button>
          )}
        </div>
      )
    }

    switch (viewMode) {
      case 'table':
        return renderTableView()
      case 'compact':
        return renderCompactView()
      default:
        return renderGridView()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة طلبات التصميم</h1>
          <p className="text-gray-600">
            {totalItems} طلب • {filteredRequests.filter(r => r.status === 'in_progress').length} قيد التنفيذ
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔲 شبكة
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 مضغوط
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 جدول
            </button>
          </div>

          {onAddNew && (
            <Button onClick={onAddNew}>
              طلب تصميم جديد
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <AdvancedSearch
          filters={filterConfigs}
          onSearch={handleSearch}
          onClear={() => {
            setFilter({})
            setCurrentPage(1)
          }}
          compact={false}
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {viewMode === 'table' ? (
          renderContent()
        ) : (
          <div className="p-6">
            {renderContent()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * itemsPerPage) + 1} إلى{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} طلب
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            
            <span className="px-3 py-2 text-sm font-medium text-gray-900">
              صفحة {currentPage} من {Math.ceil(totalItems / itemsPerPage)}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
