'use client'

import React, { useState, useEffect } from 'react'
import { Contract, ContractFilter, ContractSortOption } from '@/lib/contracts/types'
import ContractCard from './ContractCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import DataTable from '@/components/dashboard/DataTable'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ContractListProps {
  onAddNew?: () => void
  onEdit?: (contract: Contract) => void
  onView?: (contract: Contract) => void
  onStatusChange?: (contract: Contract, status: Contract['status']) => void
  onSign?: (contract: Contract) => void
  viewMode?: 'grid' | 'table' | 'compact'
}

export default function ContractList({
  onAddNew,
  onEdit,
  onView,
  onStatusChange,
  onSign,
  viewMode: initialViewMode = 'grid'
}: ContractListProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [filter, setFilter] = useState<ContractFilter>({})
  const [sortOption, setSortOption] = useState<ContractSortOption>({
    field: 'createdDate',
    direction: 'desc'
  })

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في أسماء العقود...'
    },
    {
      key: 'status',
      type: 'multiselect' as const,
      label: 'الحالة',
      options: [
        { value: 'draft', label: 'مسودة' },
        { value: 'review', label: 'قيد المراجعة' },
        { value: 'negotiation', label: 'قيد التفاوض' },
        { value: 'approval', label: 'قيد الموافقة' },
        { value: 'signed', label: 'موقع' },
        { value: 'active', label: 'نشط' },
        { value: 'completed', label: 'مكتمل' },
        { value: 'terminated', label: 'منتهي' },
        { value: 'expired', label: 'منتهي الصلاحية' }
      ]
    },
    {
      key: 'type',
      type: 'multiselect' as const,
      label: 'نوع العقد',
      options: [
        { value: 'service', label: 'خدمات' },
        { value: 'supply', label: 'توريد' },
        { value: 'partnership', label: 'شراكة' },
        { value: 'licensing', label: 'ترخيص' },
        { value: 'maintenance', label: 'صيانة' },
        { value: 'consulting', label: 'استشارات' }
      ]
    },
    {
      key: 'category',
      type: 'multiselect' as const,
      label: 'فئة العقد',
      options: [
        { value: 'design', label: 'تصميم' },
        { value: 'printing', label: 'طباعة' },
        { value: 'supply_chain', label: 'سلسلة التوريد' },
        { value: 'marketing', label: 'تسويق' },
        { value: 'technology', label: 'تقنية' },
        { value: 'general', label: 'عام' }
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
      key: 'hasActiveAlerts',
      type: 'boolean' as const,
      label: 'تنبيهات نشطة',
      trueLabel: 'لديه تنبيهات نشطة',
      falseLabel: 'بدون تنبيهات'
    }
  ]

  // Table columns configuration
  const tableColumns = [
    {
      key: 'title',
      title: 'العقد',
      sortable: true,
      render: (contract: Contract) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            📄
          </div>
          <div>
            <div className="font-medium text-gray-900">{contract.title}</div>
            <div className="text-sm text-gray-500">{contract.contractNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'parties',
      title: 'الأطراف',
      render: (contract: Contract) => {
        const primaryParty = contract.parties.find(p => p.id === contract.primaryParty)
        const secondaryParty = contract.parties.find(p => p.id === contract.secondaryParty)
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {primaryParty?.name || 'غير محدد'}
            </div>
            <div className="text-sm text-gray-500">
              مع {secondaryParty?.name || 'غير محدد'}
            </div>
          </div>
        )
      }
    },
    {
      key: 'type',
      title: 'النوع',
      sortable: true,
      render: (contract: Contract) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {contract.type === 'service' ? 'خدمات' :
           contract.type === 'supply' ? 'توريد' :
           contract.type === 'partnership' ? 'شراكة' :
           contract.type === 'licensing' ? 'ترخيص' :
           contract.type === 'maintenance' ? 'صيانة' : 'استشارات'}
        </span>
      )
    },
    {
      key: 'value',
      title: 'القيمة',
      sortable: true,
      render: (contract: Contract) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(contract.financials.totalValue)}
          </div>
          <div className="text-sm text-gray-500">
            {contract.financials.currency}
          </div>
        </div>
      )
    },
    {
      key: 'timeline',
      title: 'التوقيت',
      render: (contract: Contract) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDate(contract.effectiveDate)}
          </div>
          <div className="text-sm text-gray-500">
            إلى {formatDate(contract.expiryDate)}
          </div>
        </div>
      )
    },
    {
      key: 'progress',
      title: 'التقدم',
      render: (contract: Contract) => (
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">{contract.performance.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${contract.performance.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (contract: Contract) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          contract.status === 'active' ? 'bg-green-100 text-green-800' :
          contract.status === 'signed' ? 'bg-purple-100 text-purple-800' :
          contract.status === 'draft' ? 'bg-gray-100 text-gray-600' :
          contract.status === 'review' ? 'bg-blue-100 text-blue-800' :
          contract.status === 'approval' ? 'bg-yellow-100 text-yellow-800' :
          contract.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {contract.status === 'draft' ? 'مسودة' :
           contract.status === 'review' ? 'مراجعة' :
           contract.status === 'approval' ? 'موافقة' :
           contract.status === 'signed' ? 'موقع' :
           contract.status === 'active' ? 'نشط' :
           contract.status === 'completed' ? 'مكتمل' : 'منتهي'}
        </span>
      )
    },
    {
      key: 'alerts',
      title: 'التنبيهات',
      render: (contract: Contract) => {
        const activeAlerts = contract.alerts.filter(alert => alert.isActive)
        return activeAlerts.length > 0 ? (
          <div className="flex items-center space-x-1 space-x-reverse">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-xs text-red-600">{activeAlerts.length}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">لا يوجد</span>
        )
      }
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (contract: Contract) => (
        <div className="flex space-x-2 space-x-reverse">
          {onView && (
            <button
              onClick={() => onView(contract)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="عرض التفاصيل"
            >
              👁️
            </button>
          )}
          {onEdit && ['draft', 'review'].includes(contract.status) && (
            <button
              onClick={() => onEdit(contract)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="تحرير"
            >
              ✏️
            </button>
          )}
          {onSign && contract.status === 'approval' && (
            <button
              onClick={() => onSign(contract)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="توقيع"
            >
              ✍️
            </button>
          )}
        </div>
      )
    }
  ]

  // Mock data - في التطبيق الحقيقي سيكون هذا API call
  useEffect(() => {
    loadContracts()
  }, [currentPage, itemsPerPage, filter, sortOption])

  const loadContracts = async () => {
    setLoading(true)
    try {
      // Mock contracts data
      const mockContracts: Contract[] = [
        {
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
              address: { street: 'شارع الملك عبدالعزيز', city: 'الرياض', region: 'الرياض', country: 'السعودية' },
              contact: { name: 'أحمد محمد', position: 'مدير المبيعات', phone: '+966501234567', email: 'ahmed@landspice.com' },
              signatory: { name: 'محمد علي', position: 'المدير العام' }
            },
            {
              id: 'party_restaurant',
              type: 'restaurant',
              name: 'مطعم البيك',
              legalName: 'شركة البيك للمأكولات السريعة',
              address: { street: 'شارع الملك فهد', city: 'جدة', region: 'مكة', country: 'السعودية' },
              contact: { name: 'سالم أحمد', position: 'مدير المطعم', phone: '+966506789012', email: 'salem@albaik.com' },
              signatory: { name: 'عبدالله سالم', position: 'المالك' }
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
          terms: [],
          financials: {
            totalValue: 50000,
            currency: 'SAR',
            paymentTerms: { method: 'milestone', dueDate: 30 },
            guaranteeRequired: 5000,
            guaranteeType: 'bank_guarantee'
          },
          deliverables: [],
          governingLaw: 'النظام السعودي',
          jurisdiction: 'المحاكم السعودية',
          disputeResolution: 'arbitration',
          confidentialityLevel: 'internal',
          documents: [],
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
              id: 'alert1',
              type: 'deliverable_due',
              severity: 'warning',
              message: 'مخرج متوقع خلال 3 أيام',
              isActive: true,
              createdDate: new Date()
            }
          ],
          tags: ['تصميم', 'مطاعم'],
          notes: [],
          createdBy: 'user1',
          lastModifiedBy: 'user1',
          version: '1.0',
          isArchived: false
        }
      ]

      setContracts(mockContracts)
      setFilteredContracts(mockContracts)
      setTotalItems(mockContracts.length)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: ContractFilter = {
      ...filter,
      ...searchFilters
    }
    setFilter(newFilter)
    setCurrentPage(1)
  }

  // Handle sort
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortOption({ field: field as any, direction })
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredContracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          variant="default"
          onClick={() => onView && onView(contract)}
          showActions={true}
          onEdit={() => onEdit && onEdit(contract)}
          onView={() => onView && onView(contract)}
          onStatusChange={(status) => onStatusChange && onStatusChange(contract, status)}
          onSign={() => onSign && onSign(contract)}
        />
      ))}
    </div>
  )

  const renderCompactView = () => (
    <div className="space-y-3">
      {filteredContracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          variant="compact"
          onClick={() => onView && onView(contract)}
          showActions={true}
          onEdit={() => onEdit && onEdit(contract)}
          onView={() => onView && onView(contract)}
          onStatusChange={(status) => onStatusChange && onStatusChange(contract, status)}
          onSign={() => onSign && onSign(contract)}
        />
      ))}
    </div>
  )

  const renderTableView = () => (
    <DataTable
      data={filteredContracts}
      columns={tableColumns}
      loading={loading}
      onSort={handleSort}
      currentSort={sortOption}
      pagination={{
        currentPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        itemsPerPage,
        totalItems,
        onPageChange: setCurrentPage,
        onItemsPerPageChange: setItemsPerPage
      }}
    />
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )
    }

    if (filteredContracts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📄</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقود</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على أي عقود تطابق المعايير المحددة</p>
          {onAddNew && (
            <Button onClick={onAddNew} className="mx-auto">
              إنشاء عقد جديد
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة العقود</h1>
          <p className="text-gray-600">
            {totalItems} عقد • {filteredContracts.filter(c => c.status === 'active').length} نشط
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
              إنشاء عقد جديد
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

      {/* Pagination for non-table views */}
      {viewMode !== 'table' && filteredContracts.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * itemsPerPage) + 1} إلى{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} عقد
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
