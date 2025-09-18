'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrialBalance, 
  IncomeStatement, 
  BalanceSheet, 
  ReportType, 
  ReportPeriod,
  CurrencyCode 
} from '@/lib/financial/types'
import { AccountingService } from '@/lib/financial/accounting-service'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface FinancialReportsProps {
  onExportReport?: (reportType: ReportType, format: 'pdf' | 'excel' | 'csv') => void
  userRole?: 'manager' | 'accountant' | 'staff' | 'viewer'
}

export default function FinancialReports({
  onExportReport,
  userRole = 'accountant'
}: FinancialReportsProps) {
  const [activeReportType, setActiveReportType] = useState<ReportType>('trial_balance')
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly')
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  
  // Report Data
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null)
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)

  const accountingService = AccountingService.getInstance()

  useEffect(() => {
    generateReport()
  }, [activeReportType, reportPeriod, customStartDate, customEndDate])

  const generateReport = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getReportDates()
      
      switch (activeReportType) {
        case 'trial_balance':
          const trialBalanceData = await accountingService.getTrialBalance(endDate)
          setTrialBalance(trialBalanceData)
          break
          
        case 'income_statement':
          const incomeStatementData = await accountingService.getIncomeStatement(startDate, endDate)
          setIncomeStatement(incomeStatementData)
          break
          
        case 'balance_sheet':
          // For balance sheet, we need the balance as of the end date
          // Implementation would be similar to trial balance but formatted differently
          break
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReportDates = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    if (reportPeriod === 'custom') {
      return { startDate: customStartDate, endDate: customEndDate }
    }
    
    switch (reportPeriod) {
      case 'monthly':
        return {
          startDate: new Date(currentYear, currentMonth, 1),
          endDate: new Date(currentYear, currentMonth + 1, 0)
        }
      case 'quarterly':
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3
        return {
          startDate: new Date(currentYear, quarterStartMonth, 1),
          endDate: new Date(currentYear, quarterStartMonth + 3, 0)
        }
      case 'yearly':
        return {
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear, 11, 31)
        }
      default:
        return { startDate: customStartDate, endDate: customEndDate }
    }
  }

  const formatCurrencyValue = (amount: number, currency: CurrencyCode = 'YER') => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: currency === 'YER' ? 'YER' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getReportTypeName = (type: ReportType) => {
    const names: Record<ReportType, string> = {
      'trial_balance': 'ميزان المراجعة',
      'income_statement': 'قائمة الدخل',
      'balance_sheet': 'الميزانية العمومية',
      'cash_flow': 'قائمة التدفقات النقدية',
      'aging_report': 'تقرير أعمار الديون',
      'budget_analysis': 'تحليل الموازنة'
    }
    return names[type] || type
  }

  const reportTypes: ReportType[] = [
    'trial_balance',
    'income_statement', 
    'balance_sheet',
    'cash_flow',
    'aging_report',
    'budget_analysis'
  ]

  const renderTrialBalance = () => {
    if (!trialBalance) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Report Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">ميزان المراجعة</h2>
              <p className="text-gray-600">كما في {formatDate(trialBalance.asOfDate)}</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                trialBalance.isBalanced 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {trialBalance.isBalanced ? 'متوازن' : 'غير متوازن'}
              </span>
              
              {onExportReport && (
                <div className="flex space-x-1 space-x-reverse">
                  <button
                    onClick={() => onExportReport('trial_balance', 'pdf')}
                    className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded hover:bg-red-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => onExportReport('trial_balance', 'excel')}
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded hover:bg-green-100"
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trial Balance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رمز الحساب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم الحساب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مدين
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  دائن
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرصيد الصافي
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trialBalance.items.map((item) => (
                <tr key={item.accountId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {item.accountCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.accountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.accountType === 'assets' ? 'أصول' :
                     item.accountType === 'liabilities' ? 'خصوم' :
                     item.accountType === 'equity' ? 'حقوق ملكية' :
                     item.accountType === 'revenue' ? 'إيرادات' : 'مصروفات'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.debitBalance > 0 ? formatCurrencyValue(item.debitBalance) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.creditBalance > 0 ? formatCurrencyValue(item.creditBalance) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrencyValue(Math.abs(item.netBalance))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="font-bold">
                <td colSpan={3} className="px-6 py-4 text-sm text-gray-900 text-right">
                  الإجمالي:
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrencyValue(trialBalance.totalDebits)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrencyValue(trialBalance.totalCredits)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {trialBalance.variance !== 0 && (
                    <span className="text-red-600">
                      فرق: {formatCurrencyValue(Math.abs(trialBalance.variance))}
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  const renderIncomeStatement = () => {
    if (!incomeStatement) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Report Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">قائمة الدخل</h2>
              <p className="text-gray-600">
                من {formatDate(incomeStatement.period.startDate)} إلى {formatDate(incomeStatement.period.endDate)}
              </p>
            </div>
            {onExportReport && (
              <div className="flex space-x-1 space-x-reverse">
                <button
                  onClick={() => onExportReport('income_statement', 'pdf')}
                  className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded hover:bg-red-100"
                >
                  PDF
                </button>
                <button
                  onClick={() => onExportReport('income_statement', 'excel')}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded hover:bg-green-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Income Statement Content */}
        <div className="p-6 space-y-6">
          {/* Revenue Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              الإيرادات
            </h3>
            <div className="space-y-2">
              {incomeStatement.sections.revenue.items.map((item) => (
                <div key={item.accountId} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.accountName}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrencyValue(item.currentPeriod)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold">
                <span className="text-gray-900">إجمالي الإيرادات</span>
                <span className="text-green-600 text-lg">
                  {formatCurrencyValue(incomeStatement.sections.revenue.subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              المصروفات التشغيلية
            </h3>
            <div className="space-y-2">
              {incomeStatement.sections.operatingExpenses.items.map((item) => (
                <div key={item.accountId} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.accountName}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrencyValue(item.currentPeriod)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold">
                <span className="text-gray-900">إجمالي المصروفات</span>
                <span className="text-red-600 text-lg">
                  {formatCurrencyValue(incomeStatement.sections.operatingExpenses.subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Income Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900">الربح الإجمالي</span>
              <span className={`${incomeStatement.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrencyValue(incomeStatement.grossProfit)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900">الربح التشغيلي</span>
              <span className={`${incomeStatement.operatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrencyValue(incomeStatement.operatingProfit)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-3">
              <span className="text-gray-900">صافي الربح</span>
              <span className={`${incomeStatement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrencyValue(incomeStatement.netProfit)}
              </span>
            </div>

            {/* Profit Margins */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-600">هامش الربح الإجمالي</div>
                <div className="text-lg font-semibold text-gray-900">
                  {incomeStatement.grossProfitMargin.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">هامش الربح التشغيلي</div>
                <div className="text-lg font-semibold text-gray-900">
                  {incomeStatement.operatingProfitMargin.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">هامش الربح الصافي</div>
                <div className="text-lg font-semibold text-gray-900">
                  {incomeStatement.netProfitMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderComingSoon = (reportName: string) => (
    <div className="bg-white rounded-lg border border-gray-200 p-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-400">📊</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{reportName}</h3>
        <p className="text-gray-500 mb-4">هذا التقرير قيد التطوير وسيكون متاحاً قريباً</p>
        <div className="text-xs text-gray-400">
          سيتم إضافة هذا التقرير في التحديث القادم
        </div>
      </div>
    </div>
  )

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )
    }

    switch (activeReportType) {
      case 'trial_balance':
        return renderTrialBalance()
      case 'income_statement':
        return renderIncomeStatement()
      case 'balance_sheet':
        return renderComingSoon('الميزانية العمومية')
      case 'cash_flow':
        return renderComingSoon('قائمة التدفقات النقدية')
      case 'aging_report':
        return renderComingSoon('تقرير أعمار الديون')
      case 'budget_analysis':
        return renderComingSoon('تحليل الموازنة')
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-600">
            تقارير مالية شاملة ومفصلة للوضع المحاسبي
          </p>
        </div>

        <Button onClick={generateReport} loading={loading}>
          تحديث التقرير
        </Button>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير
            </label>
            <select
              value={activeReportType}
              onChange={(e) => setActiveReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {reportTypes.map(type => (
                <option key={type} value={type}>
                  {getReportTypeName(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفترة الزمنية
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="monthly">شهري</option>
              <option value="quarterly">ربع سنوي</option>
              <option value="yearly">سنوي</option>
              <option value="custom">فترة مخصصة</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {reportPeriod === 'custom' && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفترة المخصصة
              </label>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="date"
                  value={customStartDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="date"
                  value={customEndDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  )
}
