'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'range' | 'boolean' | 'multiselect'
  options?: { value: string; label: string }[]
  placeholder?: string
  defaultValue?: any
}

interface SearchFilter {
  [key: string]: any
}

interface AdvancedSearchProps {
  filters: FilterOption[]
  onSearch: (filters: SearchFilter) => void
  onReset: () => void
  initialFilters?: SearchFilter
  showQuickSearch?: boolean
  quickSearchPlaceholder?: string
  title?: string
  description?: string
  className?: string
  compact?: boolean
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onSearch,
  onReset,
  initialFilters = {},
  showQuickSearch = true,
  quickSearchPlaceholder = 'البحث السريع...',
  title = 'البحث المتقدم',
  description = 'استخدم الفلاتر للعثور على ما تبحث عنه',
  className,
  compact = false
}) => {
  const [searchFilters, setSearchFilters] = useState<SearchFilter>(initialFilters)
  const [quickSearch, setQuickSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // مرجع لتتبع آخر قيمة للمرشحات الأولية
  const prevInitialFiltersRef = useRef<SearchFilter>({})

  useEffect(() => {
    // فحص إذا كانت المرشحات الأولية تغيرت فعلاً
    const hasChanged = JSON.stringify(prevInitialFiltersRef.current) !== JSON.stringify(initialFilters)
    
    if (hasChanged) {
      setSearchFilters(initialFilters)
      prevInitialFiltersRef.current = initialFilters
    }
  }, [initialFilters])

  useEffect(() => {
    // Check if any filters are active
    const activeFilters = Object.entries(searchFilters).some(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'boolean') return value
      if (value !== null && value !== undefined) return true
      return false
    })
    setHasActiveFilters(activeFilters || quickSearch.trim() !== '')
  }, [searchFilters, quickSearch])

  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterId]: value
    }))
  }, [])

  const handleSearch = () => {
    const allFilters = { ...searchFilters }
    if (quickSearch.trim()) {
      allFilters._quickSearch = quickSearch.trim()
    }
    onSearch(allFilters)
  }

  const handleReset = () => {
    setSearchFilters({})
    setQuickSearch('')
    onReset()
  }

  const renderFilter = (filter: FilterOption) => {
    const value = searchFilters[filter.id] || filter.defaultValue

    switch (filter.type) {
      case 'text':
        return (
          <Input
            key={filter.id}
            placeholder={filter.placeholder || filter.label}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full"
          />
        )

      case 'select':
        return (
          <select
            key={filter.id}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">{filter.placeholder || `اختر ${filter.label}`}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div key={filter.id} className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((selectedValue: string) => {
                const option = filter.options?.find(opt => opt.value === selectedValue)
                return option ? (
                  <span
                    key={selectedValue}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {option.label}
                    <button
                      onClick={() => {
                        const newValues = selectedValues.filter((v: string) => v !== selectedValue)
                        handleFilterChange(filter.id, newValues)
                      }}
                      className="mr-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedValues.includes(e.target.value)) {
                  handleFilterChange(filter.id, [...selectedValues, e.target.value])
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">{filter.placeholder || `اختر ${filter.label}`}</option>
              {filter.options?.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={selectedValues.includes(option.value)}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'date':
        return (
          <input
            key={filter.id}
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        )

      case 'range':
        const rangeValue = value || { min: '', max: '' }
        return (
          <div key={filter.id} className="flex space-x-2 space-x-reverse">
            <Input
              placeholder="من"
              type="number"
              value={rangeValue.min || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...rangeValue, min: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="إلى"
              type="number"
              value={rangeValue.max || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...rangeValue, max: e.target.value })}
              className="flex-1"
            />
          </div>
        )

      case 'boolean':
        return (
          <div key={filter.id} className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id={filter.id}
              checked={value || false}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor={filter.id} className="text-sm font-medium text-gray-700">
              {filter.label}
            </label>
          </div>
        )

      default:
        return null
    }
  }

  if (compact) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Quick Search */}
        {showQuickSearch && (
          <div className="flex space-x-2 space-x-reverse">
            <Input
              placeholder={quickSearchPlaceholder}
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setIsExpanded(!isExpanded)} variant="outline">
              {isExpanded ? 'إخفاء الفلاتر' : 'فلاتر متقدمة'}
              {hasActiveFilters && (
                <span className="mr-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map(filter => (
                  <div key={filter.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {filter.label}
                    </label>
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 space-x-reverse mt-6">
                <Button onClick={handleSearch}>
                  🔍 البحث
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  🔄 إعادة تعيين
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isExpanded && hasActiveFilters && (
          <div className="text-sm text-gray-600">
            توجد فلاتر نشطة - انقر على "فلاتر متقدمة" لعرضها
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {hasActiveFilters && (
            <span className="text-sm text-blue-600 font-medium">
              فلاتر نشطة
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Search */}
        {showQuickSearch && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              البحث السريع
            </label>
            <Input
              placeholder={quickSearchPlaceholder}
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Advanced Filters */}
        {filters.length > 0 && (
          <>
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">الفلاتر المتقدمة</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filters.map(filter => (
                  <div key={filter.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {filter.label}
                    </label>
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 space-x-reverse pt-6 border-t">
              <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                🔍 البحث
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1 sm:flex-none"
                disabled={!hasActiveFilters}
              >
                🔄 إعادة تعيين
              </Button>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 mb-2">الفلاتر النشطة:</h5>
            <div className="flex flex-wrap gap-2">
              {quickSearch && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  بحث: "{quickSearch}"
                </span>
              )}
              {Object.entries(searchFilters).map(([key, value]) => {
                const filter = filters.find(f => f.id === key)
                if (!filter || !value) return null

                let displayValue = value
                if (Array.isArray(value)) {
                  if (value.length === 0) return null
                  displayValue = `${value.length} عنصر`
                } else if (typeof value === 'object' && value.min && value.max) {
                  displayValue = `${value.min} - ${value.max}`
                } else if (typeof value === 'boolean') {
                  displayValue = value ? 'نعم' : 'لا'
                }

                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {filter.label}: {displayValue}
                    <button
                      onClick={() => handleFilterChange(key, filter.type === 'multiselect' ? [] : '')}
                      className="mr-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdvancedSearch
