'use client'

import React, { useState, useEffect } from 'react'
import { Account, JournalEntry, AccountEntry, TransactionType, CurrencyCode } from '@/lib/financial/types'
import { AccountingService } from '@/lib/financial/accounting-service'
import { validateJournalEntryBalance, getCurrentExchangeRate } from '@/lib/financial/validation'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface JournalEntryFormProps {
  entry?: JournalEntry
  onSave?: (entry: JournalEntry) => void
  onCancel?: () => void
  userRole?: 'manager' | 'accountant' | 'staff'
  mode?: 'create' | 'edit' | 'view'
}

interface EntryLine {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  description: string
  currency: CurrencyCode
  exchangeRate?: number
}

export default function JournalEntryForm({
  entry,
  onSave,
  onCancel,
  userRole = 'accountant',
  mode = 'create'
}: JournalEntryFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [formData, setFormData] = useState({
    date: entry?.date || new Date(),
    description: entry?.description || '',
    reference: entry?.reference || '',
    type: entry?.type || 'debit' as TransactionType,
    baseCurrency: entry?.baseCurrency || 'YER' as CurrencyCode
  })
  const [entryLines, setEntryLines] = useState<EntryLine[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const accountingService = AccountingService.getInstance()
  const isReadOnly = mode === 'view'
  const canEdit = mode !== 'view' && (userRole === 'manager' || userRole === 'accountant')

  useEffect(() => {
    loadAccounts()
    if (entry) {
      initializeFromEntry(entry)
    } else {
      // Initialize with two empty lines
      setEntryLines([
        createEmptyLine(),
        createEmptyLine()
      ])
    }
  }, [entry])

  const loadAccounts = async () => {
    try {
      const result = await accountingService.getAccounts()
      // Filter to only accounts that allow direct posting
      const postableAccounts = result.accounts.filter(acc => acc.allowDirectPosting && acc.isActive)
      setAccounts(postableAccounts)
    } catch (error) {
      console.error('Error loading accounts:', error)
    }
  }

  const initializeFromEntry = (entry: JournalEntry) => {
    const lines: EntryLine[] = entry.accounts.map(acc => ({
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      accountId: acc.accountId,
      accountCode: acc.accountCode,
      accountName: acc.accountName,
      debitAmount: acc.debitAmount,
      creditAmount: acc.creditAmount,
      description: acc.description || '',
      currency: acc.currency,
      exchangeRate: acc.exchangeRate
    }))
    setEntryLines(lines)
  }

  const createEmptyLine = (): EntryLine => ({
    id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    accountId: '',
    accountCode: '',
    accountName: '',
    debitAmount: 0,
    creditAmount: 0,
    description: '',
    currency: formData.baseCurrency,
    exchangeRate: 1
  })

  const addEntryLine = () => {
    setEntryLines(prev => [...prev, createEmptyLine()])
  }

  const removeEntryLine = (lineId: string) => {
    if (entryLines.length <= 2) return // Must have at least 2 lines
    setEntryLines(prev => prev.filter(line => line.id !== lineId))
  }

  const updateEntryLine = (lineId: string, updates: Partial<EntryLine>) => {
    setEntryLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, ...updates }
        
        // If account is selected, update account info
        if (updates.accountId && updates.accountId !== line.accountId) {
          const account = accounts.find(acc => acc.id === updates.accountId)
          if (account) {
            updatedLine.accountCode = account.code
            updatedLine.accountName = account.name
            updatedLine.currency = account.currency
            updatedLine.exchangeRate = account.currency === formData.baseCurrency 
              ? 1 
              : getCurrentExchangeRate(account.currency, formData.baseCurrency)
          }
        }

        // Ensure only debit OR credit has value
        if (updates.debitAmount !== undefined && updates.debitAmount > 0) {
          updatedLine.creditAmount = 0
        }
        if (updates.creditAmount !== undefined && updates.creditAmount > 0) {
          updatedLine.debitAmount = 0
        }

        return updatedLine
      }
      return line
    }))
  }

  const calculateTotals = () => {
    const totalDebit = entryLines.reduce((sum, line) => {
      const amountInBaseCurrency = line.debitAmount * (line.exchangeRate || 1)
      return sum + amountInBaseCurrency
    }, 0)

    const totalCredit = entryLines.reduce((sum, line) => {
      const amountInBaseCurrency = line.creditAmount * (line.exchangeRate || 1)
      return sum + amountInBaseCurrency
    }, 0)

    return {
      totalDebit: Math.round(totalDebit * 1000) / 1000,
      totalCredit: Math.round(totalCredit * 1000) / 1000,
      difference: Math.round((totalDebit - totalCredit) * 1000) / 1000,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.001
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.description.trim()) {
      newErrors.description = 'وصف القيد مطلوب'
    }

    if (!formData.date) {
      newErrors.date = 'تاريخ القيد مطلوب'
    }

    // Entry lines validation
    const validLines = entryLines.filter(line => 
      line.accountId && (line.debitAmount > 0 || line.creditAmount > 0)
    )

    if (validLines.length < 2) {
      newErrors.entries = 'يجب أن يحتوي القيد على حسابين على الأقل'
    }

    // Check for duplicate accounts
    const accountIds = validLines.map(line => line.accountId)
    const duplicateAccounts = accountIds.filter((id, index) => accountIds.indexOf(id) !== index)
    if (duplicateAccounts.length > 0) {
      newErrors.entries = 'لا يمكن استخدام نفس الحساب أكثر من مرة في نفس القيد'
    }

    // Balance validation
    const { isBalanced } = calculateTotals()
    if (!isBalanced) {
      newErrors.balance = 'القيد المحاسبي غير متوازن - يجب أن يكون إجمالي المدين مساوياً لإجمالي الدائن'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const validLines = entryLines.filter(line => 
        line.accountId && (line.debitAmount > 0 || line.creditAmount > 0)
      )

      const accountEntries: AccountEntry[] = validLines.map(line => ({
        accountId: line.accountId,
        accountCode: line.accountCode,
        accountName: line.accountName,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        currency: line.currency,
        exchangeRate: line.exchangeRate,
        amountInBaseCurrency: (line.debitAmount + line.creditAmount) * (line.exchangeRate || 1),
        description: line.description
      }))

      const entryData = {
        date: formData.date,
        description: formData.description,
        reference: formData.reference,
        type: formData.type,
        status: 'draft' as const,
        accounts: accountEntries,
        baseCurrency: formData.baseCurrency,
        attachments: [],
        createdBy: 'current-user' // Should come from auth context
      }

      const newEntry = await accountingService.createJournalEntry(entryData)
      
      if (onSave) {
        onSave(newEntry)
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
      setErrors({ submit: 'حدث خطأ أثناء حفظ القيد المحاسبي' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrencyValue = (amount: number, currency: CurrencyCode = formData.baseCurrency) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: currency === 'YER' ? 'YER' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(amount)
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'إنشاء قيد محاسبي جديد' : 
               mode === 'edit' ? 'تحرير قيد محاسبي' : 'عرض قيد محاسبي'}
            </h1>
            {entry && (
              <p className="text-gray-600">رقم القيد: {entry.entryNumber}</p>
            )}
          </div>
          
          {entry?.status && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              entry.status === 'posted' ? 'bg-green-100 text-green-800' :
              entry.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              entry.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {entry.status === 'posted' ? 'مرحل' :
               entry.status === 'approved' ? 'معتمد' :
               entry.status === 'cancelled' ? 'ملغي' : 'مسودة'}
            </span>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ القيد *
            </label>
            <input
              type="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع القيد
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TransactionType }))}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            >
              <option value="debit">قيد عادي</option>
              <option value="adjustment">قيد تسوية</option>
              <option value="opening">قيد افتتاحي</option>
              <option value="closing">قيد إقفال</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المرجع
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              disabled={isReadOnly}
              placeholder="رقم المرجع أو الوثيقة"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وصف القيد *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            disabled={isReadOnly}
            placeholder="وصف مفصل للقيد المحاسبي"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Entry Lines */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">تفاصيل القيد</h2>
          {canEdit && (
            <Button
              onClick={addEntryLine}
              variant="outline"
              size="sm"
            >
              إضافة سطر
            </Button>
          )}
        </div>

        {errors.entries && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.entries}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحساب
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مدين
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  دائن
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العملة
                </th>
                {canEdit && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entryLines.map((line, index) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    {canEdit ? (
                      <select
                        value={line.accountId}
                        onChange={(e) => updateEntryLine(line.id, { accountId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">اختر الحساب</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">{line.accountName}</div>
                        <div className="text-sm text-gray-500">{line.accountCode}</div>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    {canEdit ? (
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateEntryLine(line.id, { description: e.target.value })}
                        placeholder="وصف اختياري"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <span className="text-gray-900">{line.description}</span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    {canEdit ? (
                      <input
                        type="number"
                        value={line.debitAmount || ''}
                        onChange={(e) => updateEntryLine(line.id, { debitAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.001"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {line.debitAmount > 0 ? formatCurrencyValue(line.debitAmount, line.currency) : '-'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    {canEdit ? (
                      <input
                        type="number"
                        value={line.creditAmount || ''}
                        onChange={(e) => updateEntryLine(line.id, { creditAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.001"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {line.creditAmount > 0 ? formatCurrencyValue(line.creditAmount, line.currency) : '-'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{line.currency}</span>
                    {line.exchangeRate && line.exchangeRate !== 1 && (
                      <div className="text-xs text-gray-500">
                        معدل: {line.exchangeRate}
                      </div>
                    )}
                  </td>
                  
                  {canEdit && (
                    <td className="px-4 py-4">
                      {entryLines.length > 2 && (
                        <button
                          onClick={() => removeEntryLine(line.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="حذف السطر"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">إجمالي المدين:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrencyValue(totals.totalDebit)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">إجمالي الدائن:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrencyValue(totals.totalCredit)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">الفرق:</span>
                <span className={`text-lg font-semibold ${
                  totals.isBalanced ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrencyValue(Math.abs(totals.difference))}
                </span>
              </div>
              
              <div className="flex justify-center pt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  totals.isBalanced 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {totals.isBalanced ? '✓ متوازن' : '✗ غير متوازن'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {errors.balance && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.balance}</p>
          </div>
        )}

        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(canEdit || mode === 'view') && (
        <div className="flex justify-end space-x-3 space-x-reverse">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={loading}
            >
              {mode === 'view' ? 'إغلاق' : 'إلغاء'}
            </Button>
          )}
          
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={loading || !totals.isBalanced}
              loading={loading}
            >
              {mode === 'create' ? 'حفظ القيد' : 'تحديث القيد'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
