// Restaurant List Component
// مكون قائمة المطاعم

'use client'

import React, { useState, useEffect } from 'react'
import { Restaurant, RestaurantFilter, RestaurantSortOption } from '@/lib/restaurant/types'
import { Button } from '@/components/ui/Button'
import RestaurantCard from './RestaurantCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'

interface RestaurantListProps {
  restaurants: Restaurant[]
  loading?: boolean
  onRestaurantClick?: (restaurant: Restaurant) => void
  onCreateNew?: () => void
  selectedRestaurant?: Restaurant
  variant?: 'card' | 'compact' | 'detailed'
  showCreateButton?: boolean
  showSearch?: boolean
  showFilters?: boolean
}

export default function RestaurantList({
  restaurants,
  loading = false,
  onRestaurantClick,
  onCreateNew,
  selectedRestaurant,
  variant = 'card',
  showCreateButton = true,
  showSearch = true,
  showFilters = true
}: RestaurantListProps) {
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<RestaurantSortOption>({
    field: 'name',
    direction: 'asc'
  })
  const [statusFilter, setStatusFilter] = useState<Restaurant['status'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<Restaurant['type'] | 'all'>('all')

  // Update filtered restaurants when props change
  useEffect(() => {
    setFilteredRestaurants(restaurants)
  }, [restaurants])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...restaurants]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchLower) ||
        restaurant.legalName.toLowerCase().includes(searchLower) ||
        restaurant.branches.some(branch => 
          branch.address.city.toLowerCase().includes(searchLower) ||
          branch.address.region.toLowerCase().includes(searchLower)
        ) ||
        restaurant.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.type === typeFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any
      let valueB: any

      switch (sortOption.field) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime()
          valueB = new Date(b.createdAt).getTime()
          break
        case 'lastUpdate':
          valueA = new Date(a.relationshipHistory.lastUpdate).getTime()
          valueB = new Date(b.relationshipHistory.lastUpdate).getTime()
          break
        case 'totalRevenue':
          valueA = a.relationshipHistory.totalRevenue
          valueB = b.relationshipHistory.totalRevenue
          break
        case 'totalOrders':
          valueA = a.relationshipHistory.totalOrders
          valueB = b.relationshipHistory.totalOrders
          break
        default:
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
      }

      if (valueA < valueB) return sortOption.direction === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOption.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredRestaurants(filtered)
  }, [restaurants, searchTerm, sortOption, statusFilter, typeFilter])

  const getStatusText = (status: Restaurant['status']) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'pending': return 'قيد المراجعة'
      case 'suspended': return 'معلق'
      case 'terminated': return 'منتهي'
      default: return 'غير معروف'
    }
  }

  const getTypeText = (type: Restaurant['type']) => {
    switch (type) {
      case 'single': return 'مطعم واحد'
      case 'chain': return 'سلسلة مطاعم'
      case 'franchise': return 'امتياز تجاري'
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
          <h2 className="text-2xl font-bold text-gray-900">قائمة المطاعم</h2>
          <p className="text-gray-600 mt-1">
            {filteredRestaurants.length} مطعم من أصل {restaurants.length}
          </p>
        </div>
        {showCreateButton && onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <span>+</span>
            إضافة مطعم جديد
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
                  placeholder="البحث في المطاعم... (الاسم، المدينة، العلامات)"
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
                      field: field as RestaurantSortOption['field'],
                      direction: direction as 'asc' | 'desc'
                    })
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="name-asc">الاسم (أ-ي)</option>
                  <option value="name-desc">الاسم (ي-أ)</option>
                  <option value="createdAt-desc">الأحدث</option>
                  <option value="createdAt-asc">الأقدم</option>
                  <option value="totalRevenue-desc">أعلى إيرادات</option>
                  <option value="totalOrders-desc">أكثر طلبات</option>
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
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="suspended">معلق</option>
                  <option value="terminated">منتهي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النوع
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="single">مطعم واحد</option>
                  <option value="chain">سلسلة مطاعم</option>
                  <option value="franchise">امتياز تجاري</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setTypeFilter('all')
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

      {/* Restaurant Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className={`grid gap-4 ${
          variant === 'compact' 
            ? 'grid-cols-1' 
            : variant === 'detailed'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              variant={variant}
              onClick={() => onRestaurantClick?.(restaurant)}
              selected={selectedRestaurant?.id === restaurant.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {restaurants.length === 0 ? 'لا توجد مطاعم مسجلة' : 'لم يتم العثور على نتائج'}
          </h3>
          <p className="text-gray-600 mb-4">
            {restaurants.length === 0 
              ? 'ابدأ بإضافة أول مطعم في النظام'
              : 'جرب تعديل معايير البحث أو الفلتر'
            }
          </p>
          {restaurants.length === 0 && showCreateButton && onCreateNew && (
            <Button onClick={onCreateNew}>
              إضافة أول مطعم
            </Button>
          )}
        </div>
      )}

      {/* Results Summary */}
      {filteredRestaurants.length > 0 && restaurants.length !== filteredRestaurants.length && (
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          عرض {filteredRestaurants.length} من أصل {restaurants.length} مطعم
        </div>
      )}
    </div>
  )
}
