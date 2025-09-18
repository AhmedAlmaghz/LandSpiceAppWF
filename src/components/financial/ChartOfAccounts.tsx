'use client'

import React, { useState, useEffect } from 'react'
import { Account, AccountType, AccountCategory, FinancialFilter, FinancialSortOption } from '@/lib/financial/types'
import { AccountingService } from '@/lib/financial/accounting-service'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ChartOfAccountsProps {
  onAddAccount?: () => void
  onEditAccount?: (account: Account) => void
  onViewAccount?: (account: Account) => void
  onDeleteAccount?: (account: Account) => void
  userRole?: 'manager' | 'accountant' | 'staff' | 'viewer'
  viewMode?: 'tree' | 'table' | 'compact'
}

export default function ChartOfAccounts({
  onAddAccount,
  onEditAccount,
  onViewAccount,
  onDeleteAccount,
  userRole = 'accountant',
  viewMode: initialViewMode = 'tree'
}: ChartOfAccountsProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'compact'>(initialViewMode)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FinancialFilter>({})
  const [sortOption, setSortOption] = useState<FinancialSortOption>({
    field: 'code',
    direction: 'asc'
  })

  const accountingService = AccountingService.getInstance()

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في أسماء الحسابات أو الرموز...'
    },
    {
      key: 'accountType',
      type: 'select' as const,
      label: 'نوع الحساب',
      options: [
        { value: 'assets', label: 'الأصول' },
        { value: 'liabilities', label: 'الخصوم' },
        { value: 'equity', label: 'حقوق الملكية' },
        { value: 'revenue', label: 'الإيرادات' },
        { value: 'expenses', label: 'المصروفات' }
      ]
    },
    {
      key: 'accountCategory',
      type: 'select' as const,
      label: 'فئة الحساب',
      options: [
        { value: 'current', label: 'متداول' },
        { value: 'non-current', label: 'غير متداول' },
        { value: 'fixed', label: 'ثابت' },
        { value: 'liquid', label: 'سائل' },
        { value: 'operating', label: 'تشغيلي' },
        { value: 'non-operating', label: 'غير تشغيلي' }
      ]
    },
    {
      key: 'isActive',
      type: 'boolean' as const,
      label: 'حسابات نشطة',
      trueLabel: 'عرض الحسابات النشطة فقط',
      falseLabel: 'عرض جميع الحسابات'
    }
  ]

  useEffect(() => {
    loadAccounts()
  }, [filter, sortOption])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const result = await accountingService.getAccounts(filter, sortOption)
      setAccounts(result.accounts)
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: FinancialFilter = {
      ...filter,
      ...searchFilters
    }
    setFilter(newFilter)
  }

  const handleSort = (field: string) => {
    const newSort: FinancialSortOption = {
      field,
      direction: sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc'
    }
    setSortOption(newSort)
  }

  const toggleNodeExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedNodes(newExpanded)
  }

  const getAccountTypeIcon = (type: AccountType) => {
    const icons: Record<AccountType, string> = {
      'assets': '🏢',
      'liabilities': '💳',
      'equity': '👥',
      'revenue': '💰',
      'expenses': '📊'
    }
    return icons[type] || '📋'
  }

  const getAccountTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      'assets': 'bg-green-100 text-green-800',
      'liabilities': 'bg-red-100 text-red-800',
      'equity': 'bg-blue-100 text-blue-800',
      'revenue': 'bg-purple-100 text-purple-800',
      'expenses': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getAccountTypeName = (type: AccountType) => {
    const names: Record<AccountType, string> = {
      'assets': 'الأصول',
      'liabilities': 'الخصوم',
      'equity': 'حقوق الملكية',
      'revenue': 'الإيرادات',
      'expenses': 'المصروفات'
    }
    return names[type] || type
  }

  const formatCurrencyValue = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const buildAccountTree = (accounts: Account[]): Account[] => {
    const accountMap = new Map<string, Account>()
    const rootAccounts: Account[] = []

    // Create a map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, subAccounts: [] })
    })

    // Build the tree structure
    accounts.forEach(account => {
      const accountNode = accountMap.get(account.id)!
      if (account.parentAccountId) {
        const parent = accountMap.get(account.parentAccountId)
        if (parent) {
          parent.subAccounts.push(accountNode)
        } else {
          rootAccounts.push(accountNode)
        }
      } else {
        rootAccounts.push(accountNode)
      }
    })

    return rootAccounts
  }

  const renderAccountNode = (account: Account, level: number = 0): React.ReactNode => {
    const hasChildren = account.subAccounts.length > 0
    const isExpanded = expandedNodes.has(account.id)
    const indentWidth = level * 24

    return (
      <div key={account.id}>
        <div 
          className={`flex items-center py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${
            !account.isActive ? 'opacity-60' : ''
          }`}
          style={{ paddingRight: `${indentWidth + 16}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleNodeExpansion(account.id)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 mr-2"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <div className="w-6 h-6 mr-2"></div>
          )}

          {/* Account Icon */}
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg mr-3">
            <span className="text-lg">{getAccountTypeIcon(account.type)}</span>
          </div>

          {/* Account Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 space-x-reverse">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {account.name}
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                {account.code}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getAccountTypeColor(account.type)}`}>
                {getAccountTypeName(account.type)}
              </span>
              {!account.isActive && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  غير نشط
                </span>
              )}
            </div>
            {account.nameEnglish && (
              <p className="text-xs text-gray-500 mt-1">{account.nameEnglish}</p>
            )}
          </div>

          {/* Account Balance */}
          <div className="text-right mr-4">
            <div className="text-sm font-medium text-gray-900">
              {formatCurrencyValue(account.balance)}
            </div>
            <div className="text-xs text-gray-500">
              الرصيد الحالي
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {onViewAccount && (
              <button
                onClick={() => onViewAccount(account)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="عرض التفاصيل"
              >
                👁️
              </button>
            )}
            
            {onEditAccount && (userRole === 'manager' || userRole === 'accountant') && (
              <button
                onClick={() => onEditAccount(account)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="تحرير"
              >
                ✏️
              </button>
            )}
            
            {onDeleteAccount && userRole === 'manager' && account.subAccounts.length === 0 && (
              <button
                onClick={() => onDeleteAccount(account)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="حذف"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Render sub-accounts */}
        {hasChildren && isExpanded && (
          <div>
            {account.subAccounts.map(subAccount => 
              renderAccountNode(subAccount, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const renderTreeView = () => {
    const accountTree = buildAccountTree(accounts)
    
    if (accountTree.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🌳</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على حسابات تطابق المعايير المحددة</p>
          {onAddAccount && userRole === 'manager' && (
            <Button onClick={onAddAccount}>
              إضافة حساب جديد
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {accountTree.map(account => renderAccountNode(account))}
        </div>
      </div>
    )
  }

  const renderTableView = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('code')}
              >
                رمز الحساب
                {sortOption.field === 'code' && (
                  <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                اسم الحساب
                {sortOption.field === 'name' && (
                  <span className="ml-1">{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الفئة
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('balance')}
              >
                الرصيد
                {sortOption.field === 'balance' && (
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
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {account.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm">{getAccountTypeIcon(account.type)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{account.name}</div>
                      {account.nameEnglish && (
                        <div className="text-sm text-gray-500">{account.nameEnglish}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getAccountTypeColor(account.type)}`}>
                    {getAccountTypeName(account.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {account.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrencyValue(account.balance)}
                  </div>
                  <div className="text-sm text-gray-500">
                    مدين: {formatCurrencyValue(account.debitBalance)} | 
                    دائن: {formatCurrencyValue(account.creditBalance)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    account.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    {onViewAccount && (
                      <button
                        onClick={() => onViewAccount(account)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        عرض
                      </button>
                    )}
                    {onEditAccount && (userRole === 'manager' || userRole === 'accountant') && (
                      <button
                        onClick={() => onEditAccount(account)}
                        className="text-green-600 hover:text-green-900"
                      >
                        تحرير
                      </button>
                    )}
                    {onDeleteAccount && userRole === 'manager' && account.subAccounts.length === 0 && (
                      <button
                        onClick={() => onDeleteAccount(account)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCompactView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <div
          key={account.id}
          className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${
            !account.isActive ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">{getAccountTypeIcon(account.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {account.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono">{account.code}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${getAccountTypeColor(account.type)}`}>
              {getAccountTypeName(account.type)}
            </span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">الرصيد الحالي</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrencyValue(account.balance)}
              </span>
            </div>
          </div>
          
          {(onViewAccount || onEditAccount) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2 space-x-reverse">
              {onViewAccount && (
                <button
                  onClick={() => onViewAccount(account)}
                  className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors"
                >
                  عرض
                </button>
              )}
              {onEditAccount && (userRole === 'manager' || userRole === 'accountant') && (
                <button
                  onClick={() => onEditAccount(account)}
                  className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-lg hover:bg-green-100 transition-colors"
                >
                  تحرير
                </button>
              )}
            </div>
          )}
        </div>
      ))}
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

    switch (viewMode) {
      case 'table':
        return renderTableView()
      case 'compact':
        return renderCompactView()
      default:
        return renderTreeView()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">شجرة الحسابات</h1>
          <p className="text-gray-600">
            إدارة دليل الحسابات المحاسبية للشركة
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🌳 شجرة
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
          </div>

          {onAddAccount && (userRole === 'manager' || userRole === 'accountant') && (
            <Button onClick={onAddAccount}>
              إضافة حساب جديد
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
          }}
          compact={false}
        />
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(['assets', 'liabilities', 'equity', 'revenue', 'expenses'] as AccountType[]).map(type => {
          const typeAccounts = accounts.filter(acc => acc.type === type)
          const totalBalance = typeAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
          
          return (
            <div key={type} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getAccountTypeColor(type)}`}>
                  <span className="text-lg">{getAccountTypeIcon(type)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{getAccountTypeName(type)}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrencyValue(totalBalance)}</p>
                  <p className="text-xs text-gray-500">{typeAccounts.length} حساب</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}
