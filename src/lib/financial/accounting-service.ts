// Accounting Management Service for Yemeni Context
// خدمة إدارة النظام المحاسبي للسياق اليمني

import {
  Account,
  JournalEntry,
  AccountEntry,
  YemeniInvoice,
  PaymentRecord,
  BankAccount,
  TrialBalance,
  TrialBalanceItem,
  IncomeStatement,
  BalanceSheet,
  CurrencyCode,
  AccountType,
  TransactionStatus,
  FinancialEvent,
  FinancialEventType,
  FinancialFilter,
  FinancialSortOption,
  FinancialStats
} from './types'

import {
  validateJournalEntryBalance,
  generateJournalEntryNumber,
  validateAccountCode,
  generateAccountCode,
  getCurrentExchangeRate,
  calculateFinancialRatios,
  getDefaultChartOfAccounts
} from './validation'

export class AccountingService {
  private static instance: AccountingService
  private accounts: Account[] = []
  private journalEntries: JournalEntry[] = []
  private eventListeners: ((event: FinancialEvent) => void)[] = []
  private nextJournalEntrySequence = 1
  private baseCurrency: CurrencyCode = 'YER'

  private constructor() {
    this.initializeDefaultAccounts()
    this.initializeMockData()
  }

  public static getInstance(): AccountingService {
    if (!AccountingService.instance) {
      AccountingService.instance = new AccountingService()
    }
    return AccountingService.instance
  }

  // Event Management
  public addEventListener(listener: (event: FinancialEvent) => void): void {
    this.eventListeners.push(listener)
  }

  public removeEventListener(listener: (event: FinancialEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private emitEvent(type: FinancialEventType, data: any, severity: 'info' | 'warning' | 'error' | 'success' = 'info'): void {
    const event: FinancialEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: this.getEventTitle(type),
      description: this.getEventDescription(type, data),
      severity,
      data,
      isRead: false,
      createdAt: new Date()
    }

    this.eventListeners.forEach(listener => listener(event))
  }

  private getEventTitle(type: FinancialEventType): string {
    const titles: Record<FinancialEventType, string> = {
      'invoice_created': 'تم إنشاء فاتورة جديدة',
      'invoice_paid': 'تم سداد فاتورة',
      'payment_received': 'تم استلام دفعة',
      'payment_overdue': 'دفعة متأخرة',
      'budget_exceeded': 'تجاوز الموازنة',
      'low_cash_balance': 'رصيد نقدي منخفض',
      'high_receivables': 'ذمم مدينة مرتفعة',
      'bank_transaction': 'معاملة بنكية',
      'journal_entry_posted': 'تم ترحيل قيد محاسبي',
      'month_end_close': 'إغلاق نهاية الشهر',
      'financial_report_generated': 'تم إنتاج تقرير مالي',
      'reconciliation_complete': 'تمت مطابقة الحسابات'
    }
    return titles[type] || type
  }

  private getEventDescription(type: FinancialEventType, data: any): string {
    switch (type) {
      case 'journal_entry_posted':
        return `تم ترحيل القيد رقم ${data.entryNumber} بمبلغ ${data.totalDebit} ${data.currency}`
      case 'invoice_created':
        return `فاتورة رقم ${data.invoiceNumber} بمبلغ ${data.totalAmount} ${data.currency}`
      case 'payment_received':
        return `دفعة بمبلغ ${data.amount} ${data.currency} بطريقة ${data.method}`
      default:
        return `حدث مالي: ${type}`
    }
  }

  // Account Management
  public async getAccounts(
    filter?: FinancialFilter,
    sort?: FinancialSortOption,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    accounts: Account[]
    total: number
    stats: FinancialStats
  }> {
    let filteredAccounts = [...this.accounts]

    // Apply filters
    if (filter) {
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        filteredAccounts = filteredAccounts.filter(account =>
          account.name.toLowerCase().includes(searchTerm) ||
          account.code.includes(searchTerm) ||
          account.nameEnglish?.toLowerCase().includes(searchTerm)
        )
      }

      if (filter.accountType) {
        filteredAccounts = filteredAccounts.filter(account => account.type === filter.accountType)
      }

      if (filter.accountCategory) {
        filteredAccounts = filteredAccounts.filter(account => account.category === filter.accountCategory)
      }

      if (filter.currency) {
        filteredAccounts = filteredAccounts.filter(account => account.currency === filter.currency)
      }
    }

    // Apply sorting
    if (sort) {
      filteredAccounts.sort((a, b) => {
        let aValue: any = a[sort.field as keyof Account]
        let bValue: any = b[sort.field as keyof Account]

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sort.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + limit)

    // Calculate statistics
    const stats = this.calculateAccountStats(this.accounts)

    return {
      accounts: paginatedAccounts,
      total: filteredAccounts.length,
      stats
    }
  }

  public async getAccountById(id: string): Promise<Account | null> {
    return this.accounts.find(account => account.id === id) || null
  }

  public async createAccount(accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'subAccounts'>): Promise<Account> {
    // Validate account code
    if (!validateAccountCode(accountData.code, accountData.type)) {
      throw new Error('رمز الحساب غير صحيح لنوع الحساب المحدد')
    }

    // Check for duplicate code
    if (this.accounts.some(account => account.code === accountData.code)) {
      throw new Error('رمز الحساب موجود بالفعل')
    }

    const account: Account = {
      ...accountData,
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subAccounts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.accounts.push(account)

    // Update parent account if specified
    if (account.parentAccountId) {
      const parentAccount = this.accounts.find(acc => acc.id === account.parentAccountId)
      if (parentAccount) {
        parentAccount.subAccounts.push(account)
        parentAccount.allowDirectPosting = false // Parent accounts typically don't allow direct posting
      }
    }

    return account
  }

  public async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const accountIndex = this.accounts.findIndex(account => account.id === id)
    if (accountIndex === -1) {
      throw new Error('الحساب غير موجود')
    }

    const account = this.accounts[accountIndex]
    const updatedAccount = {
      ...account,
      ...updates,
      id: account.id, // Prevent ID change
      updatedAt: new Date()
    }

    this.accounts[accountIndex] = updatedAccount
    return updatedAccount
  }

  public async deleteAccount(id: string): Promise<boolean> {
    const accountIndex = this.accounts.findIndex(account => account.id === id)
    if (accountIndex === -1) {
      throw new Error('الحساب غير موجود')
    }

    const account = this.accounts[accountIndex]

    // Check if account has sub-accounts
    if (account.subAccounts.length > 0) {
      throw new Error('لا يمكن حذف حساب يحتوي على حسابات فرعية')
    }

    // Check if account has transactions
    const hasTransactions = this.journalEntries.some(entry =>
      entry.accounts.some(acc => acc.accountId === id)
    )

    if (hasTransactions) {
      throw new Error('لا يمكن حذف حساب يحتوي على معاملات')
    }

    this.accounts.splice(accountIndex, 1)

    // Remove from parent's sub-accounts
    if (account.parentAccountId) {
      const parentAccount = this.accounts.find(acc => acc.id === account.parentAccountId)
      if (parentAccount) {
        parentAccount.subAccounts = parentAccount.subAccounts.filter(sub => sub.id !== id)
      }
    }

    return true
  }

  // Journal Entry Management
  public async getJournalEntries(
    filter?: FinancialFilter,
    sort?: FinancialSortOption,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    entries: JournalEntry[]
    total: number
    stats: any
  }> {
    let filteredEntries = [...this.journalEntries]

    // Apply filters
    if (filter) {
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase()
        filteredEntries = filteredEntries.filter(entry =>
          entry.description.toLowerCase().includes(searchTerm) ||
          entry.entryNumber.includes(searchTerm) ||
          entry.reference?.toLowerCase().includes(searchTerm)
        )
      }

      if (filter.status) {
        filteredEntries = filteredEntries.filter(entry => entry.status === filter.status)
      }

      if (filter.dateFrom && filter.dateTo) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.date >= filter.dateFrom! && entry.date <= filter.dateTo!
        )
      }

      if (filter.createdBy) {
        filteredEntries = filteredEntries.filter(entry => entry.createdBy === filter.createdBy)
      }
    }

    // Apply sorting
    if (sort) {
      filteredEntries.sort((a, b) => {
        let aValue: any = a[sort.field as keyof JournalEntry]
        let bValue: any = b[sort.field as keyof JournalEntry]

        if (aValue instanceof Date) {
          aValue = aValue.getTime()
          bValue = bValue.getTime()
        }

        if (sort.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + limit)

    return {
      entries: paginatedEntries,
      total: filteredEntries.length,
      stats: this.calculateJournalEntryStats(this.journalEntries)
    }
  }

  public async createJournalEntry(entryData: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'updatedAt' | 'isBalanced' | 'totalDebit' | 'totalCredit'>): Promise<JournalEntry> {
    // Validate journal entry balance
    if (!validateJournalEntryBalance(entryData.accounts)) {
      throw new Error('القيد المحاسبي غير متوازن')
    }

    // Calculate totals
    const totalDebit = entryData.accounts.reduce((sum, acc) => sum + acc.debitAmount, 0)
    const totalCredit = entryData.accounts.reduce((sum, acc) => sum + acc.creditAmount, 0)

    const entry: JournalEntry = {
      ...entryData,
      id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryNumber: generateJournalEntryNumber(entryData.date, this.nextJournalEntrySequence++),
      totalDebit: Math.round(totalDebit * 1000) / 1000,
      totalCredit: Math.round(totalCredit * 1000) / 1000,
      isBalanced: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.journalEntries.push(entry)

    // Update account balances
    this.updateAccountBalances(entry.accounts)

    // Emit event
    this.emitEvent('journal_entry_posted', {
      entryNumber: entry.entryNumber,
      totalDebit: entry.totalDebit,
      currency: entry.baseCurrency
    }, 'success')

    return entry
  }

  public async postJournalEntry(id: string, postedBy: string): Promise<JournalEntry> {
    const entry = this.journalEntries.find(e => e.id === id)
    if (!entry) {
      throw new Error('القيد المحاسبي غير موجود')
    }

    if (entry.status === 'posted') {
      throw new Error('القيد المحاسبي مرحل بالفعل')
    }

    entry.status = 'posted'
    entry.postedBy = postedBy
    entry.postedAt = new Date()
    entry.updatedAt = new Date()

    return entry
  }

  public async reverseJournalEntry(id: string, reversedBy: string, reason: string): Promise<JournalEntry> {
    const originalEntry = this.journalEntries.find(e => e.id === id)
    if (!originalEntry) {
      throw new Error('القيد المحاسبي غير موجود')
    }

    if (originalEntry.status !== 'posted') {
      throw new Error('لا يمكن عكس قيد غير مرحل')
    }

    // Create reverse entry with swapped debits and credits
    const reverseAccounts: AccountEntry[] = originalEntry.accounts.map(acc => ({
      ...acc,
      debitAmount: acc.creditAmount,
      creditAmount: acc.debitAmount
    }))

    const reverseEntry: JournalEntry = {
      id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryNumber: generateJournalEntryNumber(new Date(), this.nextJournalEntrySequence++),
      date: new Date(),
      description: `عكس قيد: ${originalEntry.description} - السبب: ${reason}`,
      reference: `REV-${originalEntry.entryNumber}`,
      type: 'adjustment',
      status: 'posted',
      accounts: reverseAccounts,
      totalDebit: originalEntry.totalCredit,
      totalCredit: originalEntry.totalDebit,
      baseCurrency: originalEntry.baseCurrency,
      isBalanced: true,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: reversedBy,
      postedBy: reversedBy,
      postedAt: new Date()
    }

    this.journalEntries.push(reverseEntry)

    // Mark original entry as reversed
    originalEntry.status = 'reversed'
    originalEntry.reversedBy = reversedBy
    originalEntry.reversedAt = new Date()
    originalEntry.reversingEntryId = reverseEntry.id

    // Update account balances
    this.updateAccountBalances(reverseEntry.accounts)

    return reverseEntry
  }

  // Balance and Report Generation
  public async getTrialBalance(asOfDate: Date = new Date()): Promise<TrialBalance> {
    const trialBalanceItems: TrialBalanceItem[] = []

    for (const account of this.accounts) {
      if (!account.allowDirectPosting) continue // Skip parent accounts

      const balance = this.calculateAccountBalance(account.id, asOfDate)
      
      trialBalanceItems.push({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        debitBalance: balance.debit,
        creditBalance: balance.credit,
        netBalance: balance.net
      })
    }

    const totalDebits = trialBalanceItems.reduce((sum, item) => sum + item.debitBalance, 0)
    const totalCredits = trialBalanceItems.reduce((sum, item) => sum + item.creditBalance, 0)

    return {
      asOfDate,
      currency: this.baseCurrency,
      items: trialBalanceItems,
      totalDebits: Math.round(totalDebits * 1000) / 1000,
      totalCredits: Math.round(totalCredits * 1000) / 1000,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.001,
      variance: Math.round((totalDebits - totalCredits) * 1000) / 1000,
      generatedAt: new Date(),
      generatedBy: 'system'
    }
  }

  public async getIncomeStatement(startDate: Date, endDate: Date): Promise<IncomeStatement> {
    const revenueAccounts = this.accounts.filter(acc => acc.type === 'revenue')
    const expenseAccounts = this.accounts.filter(acc => acc.type === 'expenses')

    const revenueItems = revenueAccounts.map(account => {
      const balance = this.calculateAccountBalance(account.id, endDate, startDate)
      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        currentPeriod: Math.abs(balance.credit - balance.debit)
      }
    })

    const expenseItems = expenseAccounts.map(account => {
      const balance = this.calculateAccountBalance(account.id, endDate, startDate)
      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        currentPeriod: Math.abs(balance.debit - balance.credit)
      }
    })

    const totalRevenue = revenueItems.reduce((sum, item) => sum + item.currentPeriod, 0)
    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.currentPeriod, 0)
    const netProfit = totalRevenue - totalExpenses

    return {
      period: { startDate, endDate },
      currency: this.baseCurrency,
      sections: {
        revenue: {
          name: 'الإيرادات',
          items: revenueItems,
          subtotal: totalRevenue
        },
        costOfServices: {
          name: 'تكلفة الخدمات',
          items: [],
          subtotal: 0
        },
        operatingExpenses: {
          name: 'المصروفات التشغيلية',
          items: expenseItems,
          subtotal: totalExpenses
        },
        nonOperatingRevenue: {
          name: 'الإيرادات غير التشغيلية',
          items: [],
          subtotal: 0
        },
        nonOperatingExpenses: {
          name: 'المصروفات غير التشغيلية',
          items: [],
          subtotal: 0
        }
      },
      grossProfit: totalRevenue,
      operatingProfit: netProfit,
      netProfit,
      grossProfitMargin: totalRevenue > 0 ? (totalRevenue / totalRevenue) * 100 : 0,
      operatingProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      generatedAt: new Date(),
      generatedBy: 'system'
    }
  }

  // Private helper methods
  private updateAccountBalances(accounts: AccountEntry[]): void {
    for (const accountEntry of accounts) {
      const account = this.accounts.find(acc => acc.id === accountEntry.accountId)
      if (account) {
        account.debitBalance += accountEntry.debitAmount
        account.creditBalance += accountEntry.creditAmount
        
        // Calculate net balance based on account type
        if (account.type === 'assets' || account.type === 'expenses') {
          account.balance = account.debitBalance - account.creditBalance
        } else {
          account.balance = account.creditBalance - account.debitBalance
        }
        
        account.updatedAt = new Date()
      }
    }
  }

  private calculateAccountBalance(accountId: string, asOfDate: Date, fromDate?: Date) {
    let debitTotal = 0
    let creditTotal = 0

    const relevantEntries = this.journalEntries.filter(entry => {
      if (entry.status !== 'posted') return false
      if (entry.date > asOfDate) return false
      if (fromDate && entry.date < fromDate) return false
      return true
    })

    for (const entry of relevantEntries) {
      const accountEntry = entry.accounts.find(acc => acc.accountId === accountId)
      if (accountEntry) {
        debitTotal += accountEntry.debitAmount
        creditTotal += accountEntry.creditAmount
      }
    }

    return {
      debit: Math.round(debitTotal * 1000) / 1000,
      credit: Math.round(creditTotal * 1000) / 1000,
      net: Math.round((debitTotal - creditTotal) * 1000) / 1000
    }
  }

  private calculateAccountStats(accounts: Account[]): FinancialStats {
    const assetAccounts = accounts.filter(acc => acc.type === 'assets')
    const liabilityAccounts = accounts.filter(acc => acc.type === 'liabilities')
    const equityAccounts = accounts.filter(acc => acc.type === 'equity')
    const revenueAccounts = accounts.filter(acc => acc.type === 'revenue')
    const expenseAccounts = accounts.filter(acc => acc.type === 'expenses')

    const totalAssets = assetAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
    const totalEquity = equityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0)

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      grossProfitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
      totalAssets,
      totalLiabilities,
      totalEquity,
      cashBalance: 0, // Will be calculated from specific cash accounts
      bankBalance: 0, // Will be calculated from bank accounts
      accountsReceivable: 0,
      accountsPayable: 0,
      averageInvoiceValue: 0,
      averagePaymentPeriod: 0,
      overdueInvoices: 0,
      budgetVariance: 0,
      monthlyGrowthRate: 0,
      yearOverYearGrowth: 0,
      topCustomers: [],
      topExpenseCategories: expenseAccounts.slice(0, 5).map(acc => ({
        accountId: acc.id,
        accountName: acc.name,
        totalAmount: Math.abs(acc.balance),
        percentage: totalExpenses > 0 ? (Math.abs(acc.balance) / totalExpenses) * 100 : 0
      }))
    }
  }

  private calculateJournalEntryStats(entries: JournalEntry[]) {
    const postedEntries = entries.filter(e => e.status === 'posted')
    const draftEntries = entries.filter(e => e.status === 'draft')
    const reversedEntries = entries.filter(e => e.status === 'reversed')

    return {
      totalEntries: entries.length,
      postedEntries: postedEntries.length,
      draftEntries: draftEntries.length,
      reversedEntries: reversedEntries.length,
      totalValue: postedEntries.reduce((sum, entry) => sum + entry.totalDebit, 0)
    }
  }

  private initializeDefaultAccounts(): void {
    const defaultAccounts = getDefaultChartOfAccounts()
    
    for (const accountData of defaultAccounts) {
      const account: Account = {
        id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        code: accountData.code,
        name: accountData.name,
        type: accountData.type as AccountType,
        category: accountData.category as any,
        parentAccountId: undefined,
        subAccounts: [],
        level: 0,
        isActive: true,
        allowDirectPosting: true,
        balance: 0,
        debitBalance: 0,
        creditBalance: 0,
        currency: 'YER',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
      
      this.accounts.push(account)
    }
  }

  private initializeMockData(): void {
    // Add some sample journal entries
    const sampleEntries = [
      {
        description: 'إيراد من إدارة مطعم الأصالة',
        accounts: [
          { accountId: this.accounts[1].id, accountCode: '1002', accountName: 'حساب بنك القاسمي', debitAmount: 50000, creditAmount: 0, currency: 'YER' as CurrencyCode, amountInBaseCurrency: 50000 },
          { accountId: this.accounts[19].id, accountCode: '4001', accountName: 'إيرادات إدارة المطاعم', debitAmount: 0, creditAmount: 50000, currency: 'YER' as CurrencyCode, amountInBaseCurrency: 50000 }
        ],
        amount: 50000
      },
      {
        description: 'دفع راتب الموظفين',
        accounts: [
          { accountId: this.accounts[26].id, accountCode: '5101', accountName: 'الرواتب والأجور', debitAmount: 25000, creditAmount: 0, currency: 'YER' as CurrencyCode, amountInBaseCurrency: 25000 },
          { accountId: this.accounts[0].id, accountCode: '1001', accountName: 'النقدية', debitAmount: 0, creditAmount: 25000, currency: 'YER' as CurrencyCode, amountInBaseCurrency: 25000 }
        ],
        amount: 25000
      }
    ]

    for (const entryData of sampleEntries) {
      try {
        this.createJournalEntry({
          date: new Date(),
          description: entryData.description,
          type: 'debit',
          status: 'posted',
          accounts: entryData.accounts,
          baseCurrency: 'YER',
          attachments: [],
          createdBy: 'system'
        })
      } catch (error) {
        console.warn('Error creating sample journal entry:', error)
      }
    }
  }
}
