'use client'

import React, { useState, useEffect } from 'react'
import { InventoryItem, InventoryFilter, InventorySortOption } from '@/lib/inventory/types'
import { inventoryService } from '@/lib/inventory/inventory-service'
import InventoryItemCard from './InventoryItemCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface InventoryListProps {
  onAddNew?: () => void
  onEdit?: (item: InventoryItem) => void
  onView?: (item: InventoryItem) => void
  onUpdateStock?: (item: InventoryItem) => void
  onReorder?: (item: InventoryItem) => void
  viewMode?: 'grid' | 'table' | 'compact'
  userRole?: 'manager' | 'staff' | 'viewer'
  restaurantId?: string
}

export default function InventoryList({
  onAddNew,
  onEdit,
  onView,
  onUpdateStock,
  onReorder,
  viewMode: initialViewMode = 'grid',
  userRole = 'staff',
  restaurantId
}: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [filter, setFilter] = useState<InventoryFilter>({})
  const [sortOption, setSortOption] = useState<InventorySortOption>({
    field: 'name',
    direction: 'asc'
  })
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiringSoonItems: 0,
    traditionalYemeniItems: 0
  })

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في أسماء المنتجات، الرموز، أو الموردين...'
    },
    {
      key: 'categories',
      type: 'multiselect' as const,
      label: 'الفئة',
      options: [
        { value: 'اللحوم والدواجن', label: 'اللحوم والدواجن' },
        { value: 'منتجات الألبان', label: 'منتجات الألبان' },
        { value: 'الخضروات', label: 'الخضروات' },
        { value: 'الفواكه', label: 'الفواكه' },
        { value: 'الحبوب والبقوليات', label: 'الحبوب والبقوليات' },
        { value: 'التوابل والبهارات', label: 'التوابل والبهارات' },
        { value: 'الزيوت والدهون', label: 'الزيوت والدهون' },
        { value: 'المشروبات', label: 'المشروبات' },
        { value: 'المعلبات والمحفوظات', label: 'المعلبات والمحفوظات' },
        { value: 'منتجات المخابز', label: 'منتجات المخابز' }
      ]
    },
    {
      key: 'origins',
      type: 'multiselect' as const,
      label: 'المنشأ',
      options: [
        { value: 'محلي يمني', label: 'محلي يمني' },
        { value: 'مستورد من السعودية', label: 'مستورد من السعودية' },
        { value: 'مستورد من الهند', label: 'مستورد من الهند' },
        { value: 'مستورد من الصين', label: 'مستورد من الصين' },
        { value: 'غير محدد', label: 'غير محدد' }
      ]
    },
    {
      key: 'lowStock',
      type: 'boolean' as const,
      label: 'مخزون منخفض',
      trueLabel: 'عرض المخزون المنخفض فقط',
      falseLabel: 'عرض جميع المنتجات'
    },
    {
      key: 'expiringSoon',
      type: 'boolean' as const,
      label: 'قريب الانتهاء',
      trueLabel: 'عرض المنتجات قريبة الانتهاء فقط',
      falseLabel: 'عرض جميع المنتجات'
    },
    {
      key: 'traditionalYemeni',
      type: 'boolean' as const,
      label: 'منتجات يمنية',
      trueLabel: 'عرض المنتجات اليمنية التقليدية فقط',
      falseLabel: 'عرض جميع المنتجات'
    }
  ]

  useEffect(() => {
    loadInventoryItems()
  }, [currentPage, filter, sortOption, restaurantId])

  const loadInventoryItems = async () => {
    setLoading(true)
    try {
      const result = await inventoryService.getInventoryItems(
        filter,
        sortOption,
        currentPage,
        itemsPerPage
      )
      
      setItems(result.items)
      setTotalItems(result.total)
      setStats(result.stats)
    } catch (error) {
      console.error('Error loading inventory items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: InventoryFilter = {
      ...filter,
      ...searchFilters
    }
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    const newSort: InventorySortOption = {
      field: field as any,
      direction: sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc'
    }
    setSortOption(newSort)
  }

  const handleUpdateStock = async (item: InventoryItem) => {
    if (onUpdateStock) {
      onUpdateStock(item)
      // Reload data after stock update
      setTimeout(() => loadInventoryItems(), 1000)
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          variant="default"
          onClick={() => onView && onView(item)}
          showActions={true}
          onEdit={() => onEdit && onEdit(item)}
          onView={() => onView && onView(item)}
          onUpdateStock={() => handleUpdateStock(item)}
          onReorder={() => onReorder && onReorder(item)}
          showSupplierInfo={userRole !== 'viewer'}
          userRole={userRole}
        />
      ))}
    </div>
  )

  const renderCompactView = () => (
    <div className="space-y-3">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          variant="compact"
          onClick={() => onView && onView(item)}
          showActions={true}
          onEdit={() => onEdit && onEdit(item)}
          onView={() => onView && onView(item)}
          onUpdateStock={() => handleUpdateStock(item)}
          onReorder={() => onReorder && onReorder(item)}
          showSupplierInfo={userRole !== 'viewer'}
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
              onClick={() => handleSort('name')}
            >
              المنتج
              {sortOption.field === 'name' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الفئة
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('quantity')}
            >
              الكمية
              {sortOption.field === 'quantity' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('costPerUnit')}
            >
              التكلفة
              {sortOption.field === 'costPerUnit' && (
                <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              المورد
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('expiryDate')}
            >
              تاريخ الانتهاء
              {sortOption.field === 'expiryDate' && (
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
          {items.map((item) => {
            const isLowStock = item.currentQuantity <= item.reorderPoint
            const isExpiring = item.expiryDate && 
              Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg mr-3">
                      {item.category === 'اللحوم والدواجن' ? '🥩' :
                       item.category === 'منتجات الألبان' ? '🥛' :
                       item.category === 'الخضروات' ? '🥬' :
                       item.category === 'الفواكه' ? '🍎' :
                       item.category === 'التوابل والبهارات' ? '🌶️' : '📦'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.sku}</div>
                      {item.isTraditionalYemeni && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          🇾🇪 يمني
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.currentQuantity}
                    </span>
                    <span className="text-gray-500 mr-1">{item.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    الحد الأدنى: {item.minimumThreshold}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.NumberFormat('ar-YE', {
                    style: 'currency',
                    currency: item.currency === 'YER' ? 'YER' : 'USD',
                    minimumFractionDigits: 0
                  }).format(item.costPerUnit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.supplierName || 'غير محدد'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.expiryDate ? (
                    <span className={isExpiring ? 'text-orange-600 font-semibold' : ''}>
                      {formatDate(item.expiryDate)}
                    </span>
                  ) : (
                    'غير محدد'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {isLowStock && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        مخزون منخفض
                      </span>
                    )}
                    {isExpiring && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        قريب الانتهاء
                      </span>
                    )}
                    {!isLowStock && !isExpiring && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        جيد
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        عرض
                      </button>
                    )}
                    {onEdit && userRole === 'manager' && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-green-600 hover:text-green-900"
                      >
                        تحرير
                      </button>
                    )}
                    {onUpdateStock && (userRole === 'manager' || userRole === 'staff') && (
                      <button
                        onClick={() => handleUpdateStock(item)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        تحديث
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عناصر في المخزون</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على منتجات تطابق المعايير المحددة</p>
          {onAddNew && userRole === 'manager' && (
            <Button onClick={onAddNew} className="mx-auto">
              إضافة منتج جديد
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-gray-600">
            {totalItems} منتج • قيمة إجمالية: {formatCurrency(stats.totalValue)}
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
              إضافة منتج جديد
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">📦</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-lg">⚠️</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">مخزون منخفض</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-lg">📅</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">قريب الانتهاء</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiringSoonItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">🇾🇪</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-600">منتجات يمنية</p>
              <p className="text-2xl font-bold text-green-600">{stats.traditionalYemeniItems}</p>
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
      {items.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * itemsPerPage) + 1} إلى{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} منتج
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
