'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: any, item: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  className?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: boolean
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  actions?: {
    label: string
    onClick: (selectedItems: T[]) => void
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: React.ReactNode
  }[]
  emptyState?: {
    icon?: React.ReactNode
    title: string
    description: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  loading?: boolean
  className?: string
  getItemId?: (item: T) => string
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchable = true,
  searchPlaceholder = 'البحث...',
  pagination = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  actions,
  emptyState,
  loading = false,
  className,
  getItemId = (item) => item.id || item.key || String(Math.random())
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(getItemId))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    )
  }

  const selectedItems = data.filter((item) => selectedIds.includes(getItemId(item)))

  React.useEffect(() => {
    onSelectionChange?.(selectedIds)
  }, [selectedIds, onSelectionChange])

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <span className="text-gray-400">↕</span>
    }
    return sortConfig.direction === 'asc' ? (
      <span className="text-blue-600">↑</span>
    ) : (
      <span className="text-blue-600">↓</span>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            
            {actions && selectedIds.length > 0 && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-600">
                  تم تحديد {selectedIds.length} عنصر
                </span>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    onClick={() => action.onClick(selectedItems)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent>
        {/* Search */}
        {searchable && (
          <div className="mb-4">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        {/* Table */}
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {emptyState?.icon || '📋'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState?.title || 'لا توجد بيانات'}
            </h3>
            <p className="text-gray-600 mb-4">
              {emptyState?.description || 'لم يتم العثور على أي عناصر'}
            </p>
            {emptyState?.action && (
              <Button onClick={emptyState.action.onClick}>
                {emptyState.action.label}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {selectable && (
                      <th className="text-right p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                    )}
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={cn(
                          'text-right p-3 text-sm font-medium text-gray-700',
                          column.sortable && 'cursor-pointer hover:bg-gray-50',
                          column.className
                        )}
                        style={{ width: column.width }}
                        onClick={() => column.sortable && handleSort(String(column.key))}
                      >
                        <div className={cn(
                          'flex items-center',
                          column.align === 'center' && 'justify-center',
                          column.align === 'left' && 'justify-start',
                          'justify-end' // default right align for Arabic
                        )}>
                          {column.title}
                          {column.sortable && (
                            <span className="mr-1">
                              {getSortIcon(String(column.key))}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => {
                    const itemId = getItemId(item)
                    const isSelected = selectedIds.includes(itemId)
                    
                    return (
                      <tr
                        key={itemId}
                        className={cn(
                          'border-b border-gray-100 hover:bg-gray-50',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        {selectable && (
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectItem(itemId)}
                              className="rounded border-gray-300"
                            />
                          </td>
                        )}
                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className={cn(
                              'p-3 text-sm text-gray-900',
                              column.className
                            )}
                            style={{ width: column.width }}
                          >
                            <div className={cn(
                              column.align === 'center' && 'text-center',
                              column.align === 'left' && 'text-left',
                              'text-right' // default right align for Arabic
                            )}>
                              {column.render
                                ? column.render(item[column.key], item, index)
                                : String(item[column.key] || '-')
                              }
                            </div>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, sortedData.length)} من أصل {sortedData.length}
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>
                  
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default DataTable
