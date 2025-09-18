'use client'

import React, { useState, useEffect } from 'react'
import { Restaurant, RestaurantFilter, RestaurantSortOption } from '@/lib/restaurant/types'
import { restaurantService } from '@/lib/restaurant/restaurant-service'
import RestaurantCard from './RestaurantCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import DataTable from '@/components/dashboard/DataTable'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RestaurantListProps {
  onAddNew?: () => void
  onEdit?: (restaurant: Restaurant) => void
  onView?: (restaurant: Restaurant) => void
  onStatusChange?: (restaurant: Restaurant, status: Restaurant['status']) => void
  viewMode?: 'grid' | 'table' | 'compact'
}

export default function RestaurantList({
  onAddNew,
  onEdit,
  onView,
  onStatusChange,
  viewMode: initialViewMode = 'grid'
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<RestaurantFilter>({})
  const [sortOption, setSortOption] = useState<RestaurantSortOption>({
    field: 'name',
    direction: 'asc'
  })

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في أسماء المطاعم...'
    },
    {
      key: 'status',
      type: 'multiselect' as const,
      label: 'الحالة',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'pending', label: 'معلق' },
        { value: 'suspended', label: 'موقوف' },
        { value: 'terminated', label: 'منتهي' }
      ]
    },
    {
      key: 'type',
      type: 'multiselect' as const,
      label: 'نوع المطعم',
      options: [
        { value: 'single', label: 'مطعم واحد' },
        { value: 'chain', label: 'سلسلة مطاعم' },
        { value: 'franchise', label: 'فرنشايز' }
      ]
    },
    {
      key: 'businessType',
      type: 'multiselect' as const,
      label: 'نوع النشاط',
      options: [
        { value: 'restaurant', label: 'مطعم' },
        { value: 'cafe', label: 'مقهى' },
        { value: 'fast_food', label: 'وجبات سريعة' },
        { value: 'catering', label: 'خدمات طعام' },
        { value: 'food_truck', label: 'عربة طعام' }
      ]
    },
    {
      key: 'hasActiveContracts',
      type: 'boolean' as const,
      label: 'عقود نشطة',
      trueLabel: 'لديه عقود نشطة',
      falseLabel: 'بدون عقود نشطة'
    }
  ]

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      title: 'اسم المطعم',
      sortable: true,
      render: (restaurant: Restaurant) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
            {restaurant.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{restaurant.name}</div>
            <div className="text-sm text-gray-500">{restaurant.legalName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'النوع',
      sortable: true,
      render: (restaurant: Restaurant) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {restaurant.type === 'single' && 'مطعم واحد'}
          {restaurant.type === 'chain' && 'سلسلة مطاعم'}
          {restaurant.type === 'franchise' && 'فرنشايز'}
        </span>
      )
    },
    {
      key: 'businessType',
      title: 'نوع النشاط',
      render: (restaurant: Restaurant) => (
        <span className="text-sm text-gray-600">
          {restaurant.businessInfo.businessType === 'restaurant' && 'مطعم'}
          {restaurant.businessInfo.businessType === 'cafe' && 'مقهى'}
          {restaurant.businessInfo.businessType === 'fast_food' && 'وجبات سريعة'}
          {restaurant.businessInfo.businessType === 'catering' && 'خدمات طعام'}
          {restaurant.businessInfo.businessType === 'food_truck' && 'عربة طعام'}
        </span>
      )
    },
    {
      key: 'contacts',
      title: 'جهة الاتصال',
      render: (restaurant: Restaurant) => {
        const primaryContact = restaurant.contacts.find(c => c.isPrimary) || restaurant.contacts[0]
        return primaryContact ? (
          <div>
            <div className="text-sm font-medium text-gray-900">{primaryContact.name}</div>
            <div className="text-sm text-gray-500">{primaryContact.phone}</div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">لا يوجد</span>
        )
      }
    },
    {
      key: 'location',
      title: 'الموقع',
      render: (restaurant: Restaurant) => {
        const mainBranch = restaurant.branches.find(b => b.isActive) || restaurant.branches[0]
        return mainBranch ? (
          <div>
            <div className="text-sm text-gray-900">{mainBranch.address.city}</div>
            <div className="text-sm text-gray-500">{mainBranch.address.region}</div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">لا يوجد</span>
        )
      }
    },
    {
      key: 'revenue',
      title: 'الإيرادات',
      sortable: true,
      render: (restaurant: Restaurant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(restaurant.relationshipHistory.totalRevenue)}
          </div>
          <div className="text-sm text-gray-500">
            {restaurant.relationshipHistory.totalOrders} طلب
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (restaurant: Restaurant) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
          restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          restaurant.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
          restaurant.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {restaurant.status === 'active' && 'نشط'}
          {restaurant.status === 'pending' && 'معلق'}
          {restaurant.status === 'inactive' && 'غير نشط'}
          {restaurant.status === 'suspended' && 'موقوف'}
          {restaurant.status === 'terminated' && 'منتهي'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (restaurant: Restaurant) => (
        <div className="flex space-x-2 space-x-reverse">
          {onView && (
            <button
              onClick={() => onView(restaurant)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="عرض التفاصيل"
            >
              👁️
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(restaurant)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="تحرير"
            >
              ✏️
            </button>
          )}
          {onStatusChange && restaurant.status !== 'active' && (
            <button
              onClick={() => onStatusChange(restaurant, 'active')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="تفعيل"
            >
              ✅
            </button>
          )}
          {onStatusChange && restaurant.status === 'active' && (
            <button
              onClick={() => onStatusChange(restaurant, 'inactive')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="إلغاء تفعيل"
            >
              ❌
            </button>
          )}
        </div>
      )
    }
  ]

  // Load restaurants
  useEffect(() => {
    loadRestaurants()
  }, [currentPage, itemsPerPage, filter, sortOption])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const result = await restaurantService.getRestaurants(
        filter,
        sortOption,
        currentPage,
        itemsPerPage
      )
      setRestaurants(result.restaurants)
      setFilteredRestaurants(result.restaurants)
      setTotalItems(result.total)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: RestaurantFilter = {
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

  // Handle status change
  const handleStatusChange = async (restaurant: Restaurant, newStatus: Restaurant['status']) => {
    try {
      await restaurantService.updateRestaurantStatus(restaurant.id, newStatus)
      if (onStatusChange) {
        onStatusChange(restaurant, newStatus)
      }
      // Reload data
      loadRestaurants()
    } catch (error) {
      console.error('Error updating restaurant status:', error)
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          variant="default"
          onClick={() => onView && onView(restaurant)}
          showActions={true}
          onEdit={() => onEdit && onEdit(restaurant)}
          onView={() => onView && onView(restaurant)}
          onStatusChange={(status) => handleStatusChange(restaurant, status)}
        />
      ))}
    </div>
  )

  const renderCompactView = () => (
    <div className="space-y-3">
      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          variant="compact"
          onClick={() => onView && onView(restaurant)}
          showActions={true}
          onEdit={() => onEdit && onEdit(restaurant)}
          onView={() => onView && onView(restaurant)}
          onStatusChange={(status) => handleStatusChange(restaurant, status)}
        />
      ))}
    </div>
  )

  const renderTableView = () => (
    <DataTable
      data={filteredRestaurants}
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

    if (filteredRestaurants.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🏪</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مطاعم</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على أي مطاعم تطابق المعايير المحددة</p>
          {onAddNew && (
            <Button onClick={onAddNew} className="mx-auto">
              إضافة مطعم جديد
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المطاعم</h1>
          <p className="text-gray-600">
            {totalItems} مطعم • {filteredRestaurants.filter(r => r.status === 'active').length} نشط
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
              إضافة مطعم جديد
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
      {viewMode !== 'table' && filteredRestaurants.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * itemsPerPage) + 1} إلى{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} مطعم
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            
            <div className="flex items-center space-x-1 space-x-reverse">
              {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === Math.ceil(totalItems / itemsPerPage) ||
                         (page >= currentPage - 1 && page <= currentPage + 1)
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
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
