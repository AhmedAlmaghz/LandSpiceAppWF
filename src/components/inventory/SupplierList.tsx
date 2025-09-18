'use client'

import React, { useState, useEffect } from 'react'
import { YemeniSupplier, SupplierFilter, SupplierSortOption } from '@/lib/inventory/types'
import { supplierService } from '@/lib/inventory/supplier-service'
import SupplierCard from './SupplierCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface SupplierListProps {
  onAddNew?: () => void
  onEdit?: (supplier: YemeniSupplier) => void
  onView?: (supplier: YemeniSupplier) => void
  onContact?: (supplier: YemeniSupplier) => void
  onCreateOrder?: (supplier: YemeniSupplier) => void
  viewMode?: 'grid' | 'table' | 'compact'
  userRole?: 'manager' | 'staff' | 'viewer'
}

export default function SupplierList({
  onAddNew,
  onEdit,
  onView,
  onContact,
  onCreateOrder,
  viewMode: initialViewMode = 'grid',
  userRole = 'staff'
}: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<YemeniSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalSuppliers, setTotalSuppliers] = useState(0)
  const [filter, setFilter] = useState<SupplierFilter>({})
  const [sortOption, setSortOption] = useState<SupplierSortOption>({
    field: 'businessName',
    direction: 'asc'
  })
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    localProducers: 0,
    halalCertified: 0,
    averageRating: 0
  })

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في أسماء الموردين، جهات الاتصال، أو أرقام الهواتف...'
    },
    {
      key: 'governorates',
      type: 'multiselect' as const,
      label: 'المحافظة',
      options: [
        { value: 'صنعاء', label: 'صنعاء' },
        { value: 'عدن', label: 'عدن' },
        { value: 'تعز', label: 'تعز' },
        { value: 'الحديدة', label: 'الحديدة' },
        { value: 'إب', label: 'إب' },
        { value: 'ذمار', label: 'ذمار' },
        { value: 'صعدة', label: 'صعدة' },
        { value: 'مأرب', label: 'مأرب' },
        { value: 'لحج', label: 'لحج' },
        { value: 'أبين', label: 'أبين' }
      ]
    },
    {
      key: 'specialties',
      type: 'multiselect' as const,
      label: 'التخصص',
      options: [
        { value: 'لحوم طازجة', label: 'لحوم طازجة' },
        { value: 'خضروات وفواكه', label: 'خضروات وفواكه' },
        { value: 'منتجات ألبان', label: 'منتجات ألبان' },
        { value: 'توابل وبهارات', label: 'توابل وبهارات' },
        { value: 'حبوب وبقوليات', label: 'حبوب وبقوليات' },
        { value: 'مشروبات', label: 'مشروبات' },
        { value: 'معلبات', label: 'معلبات' }
      ]
    },
    {
      key: 'isLocalProducer',
      type: 'boolean' as const,
      label: 'منتج محلي',
      trueLabel: 'عرض المنتجين المحليين فقط',
      falseLabel: 'عرض جميع الموردين'
    },
    {
      key: 'isPreferred',
      type: 'boolean' as const,
      label: 'مورد مفضل',
      trueLabel: 'عرض الموردين المفضلين فقط',
      falseLabel: 'عرض جميع الموردين'
    },
    {
      key: 'minRating',
      type: 'range' as const,
      label: 'التقييم الأدنى',
      min: 1,
      max: 5,
      step: 0.5
    }
  ]

  useEffect(() => {
    loadSuppliers()
  }, [currentPage, filter, sortOption])

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const result = await supplierService.getSuppliers(
        filter,
        sortOption,
        currentPage,
        itemsPerPage
      )
      
      setSuppliers(result.suppliers)
      setTotalSuppliers(result.total)
      setStats(result.stats)
    } catch (error) {
      console.error('Error loading suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: SupplierFilter = {
      ...filter,
      ...searchFilters
    }
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    const newSort: SupplierSortOption = {
      field: field as any,
      direction: sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc'
    }
    setSortOption(newSort)
  }

  const handleTogglePreferred = async (supplier: YemeniSupplier) => {
    try {
      await supplierService.togglePreferredStatus(supplier.id)
      // Reload data after updating preferred status
      loadSuppliers()
    } catch (error) {
      console.error('Error toggling preferred status:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          variant="default"
          onClick={() => onView && onView(supplier)}
          showActions={true}
          onEdit={() => onEdit && onEdit(supplier)}
          onView={() => onView && onView(supplier)}
          onContact={() => onContact && onContact(supplier)}
          onCreateOrder={() => onCreateOrder && onCreateOrder(supplier)}
          onTogglePreferred={() => handleTogglePreferred(supplier)}
          userRole={userRole}
        />
      ))}
    </div>
  )

  const renderCompactView = () => (
    <div className="space-y-3">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          variant="compact"
          onClick={() => onView && onView(supplier)}
          showActions={true}
          onEdit={() => onEdit && onEdit(supplier)}
          onView={() => onView && onView(supplier)}
          onContact={() => onContact && onContact(supplier)}
          onCreateOrder={() => onCreateOrder && onCreateOrder(supplier)}
          onTogglePreferred={() => handleTogglePreferred(supplier)}
          userRole={userRole}
        />
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('businessName')}
            >
              المورد
              {sortOption.field === 'businessName' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              التخصص
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الموقع
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الاتصال
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('overallRating')}
            >
              التقييم
              {sortOption.field === 'overallRating' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('totalOrderValue')}
            >
              إجمالي الطلبات
              {sortOption.field === 'totalOrderValue' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('lastOrderDate')}
            >
              آخر طلب
              {sortOption.field === 'lastOrderDate' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الحالة
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg mr-3 font-bold">
                    {supplier.businessName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{supplier.businessName}</div>
                    <div className="text-sm text-gray-500">{supplier.supplierCode}</div>
                    <div className="text-sm text-gray-500">{supplier.contactPerson}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {supplier.specialties.slice(0, 2).map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                  {supplier.specialties.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{supplier.specialties.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>{supplier.address.governorate}</div>
                <div className="text-xs text-gray-500">{supplier.address.district}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>{supplier.phone}</div>
                {supplier.email && (
                  <div className="text-xs text-gray-500">{supplier.email}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= supplier.overallRating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{supplier.overallRating}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(supplier.totalOrderValue)}
                </div>
                <div className="text-xs text-gray-500">
                  {supplier.totalOrdersCount} طلب
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {supplier.lastOrderDate ? formatDate(supplier.lastOrderDate) : 'لا يوجد'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  {supplier.isActive ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      نشط
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      غير نشط
                    </span>
                  )}
                  {supplier.isPreferred && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ مفضل
                    </span>
                  )}
                  {supplier.isLocalProducer && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🇾🇪 محلي
                    </span>
                  )}
                  {supplier.isCertifiedHalal && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ☪️ حلال
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2 space-x-reverse">
                  {onView && (
                    <button
                      onClick={() => onView(supplier)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      عرض
                    </button>
                  )}
                  {onEdit && userRole === 'manager' && (
                    <button
                      onClick={() => onEdit(supplier)}
                      className="text-green-600 hover:text-green-900"
                    >
                      تحرير
                    </button>
                  )}
                  {onContact && (
                    <button
                      onClick={() => onContact(supplier)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      اتصال
                    </button>
                  )}
                  {onCreateOrder && (userRole === 'manager' || userRole === 'staff') && (
                    <button
                      onClick={() => onCreateOrder(supplier)}
                      className="text-orange-600 hover:text-orange-900"
                    >
                      طلب
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (suppliers.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🏪</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد موردين</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على موردين يطابقون المعايير المحددة</p>
          {onAddNew && userRole === 'manager' && (
            <Button onClick={onAddNew} className="mx-auto">
              إضافة مورد جديد
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-gray-600">
            {totalSuppliers} مورد • {stats.activeSuppliers} نشط • متوسط التقييم: {stats.averageRating.toFixed(1)} ⭐
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

          {onAddNew && userRole === 'manager' && (
            <Button onClick={onAddNew}>
              إضافة مورد جديد
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">🏪</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">إجمالي الموردين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">🇾🇪</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">منتجين محليين</p>
              <p className="text-2xl font-bold text-green-600">{stats.localProducers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">☪️</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">معتمد حلال</p>
              <p className="text-2xl font-bold text-blue-600">{stats.halalCertified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⭐</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">متوسط التقييم</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
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
      {suppliers.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * itemsPerPage) + 1} إلى{' '}
            {Math.min(currentPage * itemsPerPage, totalSuppliers)} من {totalSuppliers} مورد
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
              صفحة {currentPage} من {Math.ceil(totalSuppliers / itemsPerPage)}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalSuppliers / itemsPerPage)}
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
