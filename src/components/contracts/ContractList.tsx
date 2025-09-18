// Contract List Component
// مكون قائمة العقود

'use client'

import React, { useState, useEffect } from 'react'
import { Contract, ContractFilter, ContractSortOption, ContractStatus, ContractType, ContractPriority } from '@/lib/contracts/types'
import { Button } from '@/components/ui/Button'
import ContractCard from './ContractCard'

interface ContractListProps {
  contracts: Contract[]
  loading?: boolean
  onContractClick?: (contract: Contract) => void
  onCreateNew?: () => void
  selectedContract?: Contract
  variant?: 'card' | 'compact' | 'detailed'
  showCreateButton?: boolean
  showSearch?: boolean
  showFilters?: boolean
}

export default function ContractList({
  contracts,
  loading = false,
  onContractClick,
  onCreateNew,
  selectedContract,
  variant = 'card',
  showCreateButton = true,
  showSearch = true,
  showFilters = true
}: ContractListProps) {
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(contracts)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<ContractSortOption>({
    field: 'createdAt',
    direction: 'desc'
  })
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ContractType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<ContractPriority | 'all'>('all')

  // Update filtered contracts when props change
  useEffect(() => {
    setFilteredContracts(contracts)
  }, [contracts])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...contracts]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchLower) ||
        contract.description.toLowerCase().includes(searchLower) ||
        contract.contractNumber.toLowerCase().includes(searchLower) ||
        contract.parties.some(party => 
          party.name.toLowerCase().includes(searchLower)
        ) ||
        contract.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contract => contract.type === typeFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(contract => contract.priority === priorityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any
      let valueB: any

      switch (sortOption.field) {
        case 'title':
          valueA = a.title.toLowerCase()
          valueB = b.title.toLowerCase()
          break
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime()
          valueB = new Date(b.createdAt).getTime()
          break
        case 'startDate':
          valueA = new Date(a.startDate).getTime()
          valueB = new Date(b.startDate).getTime()
          break
        case 'endDate':
          valueA = new Date(a.endDate).getTime()
          valueB = new Date(b.endDate).getTime()
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
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
          valueA = priorityOrder[a.priority]
          valueB = priorityOrder[b.priority]
          break
        default:
          valueA = new Date(a.createdAt).getTime()
          valueB = new Date(b.createdAt).getTime()
      }

      if (valueA < valueB) return sortOption.direction === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOption.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredContracts(filtered)
  }, [contracts, searchTerm, sortOption, statusFilter, typeFilter, priorityFilter])

  const getStatusText = (status: ContractStatus) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'pending_review': return 'قيد المراجعة'
      case 'under_negotiation': return 'قيد التفاوض'
      case 'approved': return 'معتمد'
      case 'signed': return 'موقع'
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      case 'terminated': return 'منتهي'
      case 'expired': return 'منتهي الصلاحية'
      default: return 'غير معروف'
    }
  }

  const getTypeText = (type: ContractType) => {
    switch (type) {
      case 'design': return 'تصميم'
      case 'printing': return 'طباعة'
      case 'supply': return 'توريد'
      case 'maintenance': return 'صيانة'
      case 'marketing': return 'تسويق'
      default: return 'غير محدد'
    }
  }

  const getPriorityText = (priority: ContractPriority) => {
    switch (priority) {
      case 'low': return 'منخفضة'
      case 'medium': return 'متوسطة'
      case 'high': return 'عالية'
      case 'urgent': return 'عاجلة'
      default: return 'غير محدد'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading Header */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة العقود</h2>
          <p className="text-gray-600 mt-1">
            {filteredContracts.length} عقد من أصل {contracts.length}
          </p>
        </div>
        {showCreateButton && onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <span>+</span>
            إنشاء عقد جديد
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          {showSearch && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="البحث في العقود... (العنوان، رقم العقد، الأطراف، العلامات)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={`${sortOption.field}-${sortOption.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-')
                    setSortOption({
                      field: field as ContractSortOption['field'],
                      direction: direction as 'asc' | 'desc'
                    })
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="createdAt-desc">الأحدث</option>
                  <option value="createdAt-asc">الأقدم</option>
                  <option value="title-asc">العنوان (أ-ي)</option>
                  <option value="title-desc">العنوان (ي-أ)</option>
                  <option value="startDate-desc">تاريخ البداية (الأحدث)</option>
                  <option value="endDate-asc">تاريخ الانتهاء (الأقرب)</option>
                  <option value="totalValue-desc">القيمة (الأعلى)</option>
                  <option value="priority-desc">الأولوية (الأعلى)</option>
                </select>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="draft">مسودة</option>
                  <option value="pending_review">قيد المراجعة</option>
                  <option value="under_negotiation">قيد التفاوض</option>
                  <option value="approved">معتمد</option>
                  <option value="signed">موقع</option>
                  <option value="active">نشط</option>
                  <option value="completed">مكتمل</option>
                  <option value="terminated">منتهي</option>
                  <option value="expired">منتهي الصلاحية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع العقد
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="design">تصميم</option>
                  <option value="printing">طباعة</option>
                  <option value="supply">توريد</option>
                  <option value="maintenance">صيانة</option>
                  <option value="marketing">تسويق</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الأولوية
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                >
                  <option value="all">جميع الأولويات</option>
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setTypeFilter('all')
                      setPriorityFilter('all')
                    }}
                    className="text-sm"
                  >
                    إزالة الفلاتر
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {filteredContracts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-brand-600">
              {filteredContracts.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">عقود نشطة</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredContracts.filter(c => c.status === 'pending_review').length}
            </div>
            <div className="text-sm text-gray-600">قيد المراجعة</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredContracts.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">مكتملة</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Intl.NumberFormat('ar-SA', { 
                style: 'currency', 
                currency: 'SAR',
                minimumFractionDigits: 0 
              }).format(filteredContracts.reduce((sum, c) => sum + c.totalValue, 0))}
            </div>
            <div className="text-sm text-gray-600">إجمالي القيمة</div>
          </div>
        </div>
      )}

      {/* Contract Grid */}
      {filteredContracts.length > 0 ? (
        <div className={`grid gap-4 ${
          variant === 'compact' 
            ? 'grid-cols-1' 
            : variant === 'detailed'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              variant={variant}
              onClick={() => onContractClick?.(contract)}
              selected={selectedContract?.id === contract.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {contracts.length === 0 ? 'لا توجد عقود مسجلة' : 'لم يتم العثور على نتائج'}
          </h3>
          <p className="text-gray-600 mb-4">
            {contracts.length === 0 
              ? 'ابدأ بإنشاء أول عقد في النظام'
              : 'جرب تعديل معايير البحث أو الفلتر'
            }
          </p>
          {contracts.length === 0 && showCreateButton && onCreateNew && (
            <Button onClick={onCreateNew}>
              إنشاء أول عقد
            </Button>
          )}
        </div>
      )}

      {/* Results Summary */}
      {filteredContracts.length > 0 && contracts.length !== filteredContracts.length && (
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          عرض {filteredContracts.length} من أصل {contracts.length} عقد
        </div>
      )}
    </div>
  )
}
