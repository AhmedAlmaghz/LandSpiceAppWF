// Financial and Accounting System Types for Yemeni Context
// أنواع بيانات النظام المالي والمحاسبي للسياق اليمني

// Basic Financial Types
export type CurrencyCode = 'YER' | 'USD' | 'SAR' | 'EUR' | 'AED'
export type AccountType = 'assets' | 'liabilities' | 'equity' | 'revenue' | 'expenses'
export type AccountCategory = 'current' | 'non-current' | 'fixed' | 'liquid' | 'operating' | 'non-operating'
export type TransactionType = 'debit' | 'credit' | 'transfer' | 'adjustment' | 'opening' | 'closing'
export type TransactionStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'cancelled' | 'reversed'
export type InvoiceType = 'sales' | 'purchase' | 'service' | 'return' | 'credit_note' | 'debit_note'
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'void'
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit' | 'mobile_money' | 'cryptocurrency'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
export type BudgetPeriod = 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'custom'
export type BudgetStatus = 'draft' | 'active' | 'locked' | 'closed' | 'archived'
export type ReportType = 'income_statement' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'aging_report' | 'budget_analysis'
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

// Yemeni-specific types
export type YemeniGovernorate = 
  | 'صنعاء' | 'عدن' | 'تعز' | 'الحديدة' | 'إب' 
  | 'ذمار' | 'صعدة' | 'مأرب' | 'لحج' | 'أبين'
  | 'شبوة' | 'حضرموت' | 'المهرة' | 'الجوف' 
  | 'ريمة' | 'الضالع' | 'البيضاء' | 'عمران'
  | 'حجة' | 'المحويت'

export type YemeniBankName = 
  | 'بنك القاسمي' | 'البنك الأهلي اليمني' | 'بنك سبأ الإسلامي'
  | 'البنك التجاري اليمني' | 'بنك اليمن والكويت' | 'بنك اليمن الدولي'
  | 'البنك العربي' | 'بنك الكريمي للتمويل الأصغر'
  | 'بنك التضامن الإسلامي الدولي' | 'مصرف الرافدين'

export type TaxType = 
  | 'ضريبة_القيمة_المضافة' | 'ضريبة_الدخل' | 'ضريبة_المبيعات'
  | 'رسوم_جمركية' | 'ضريبة_الأرباح_التجارية' | 'ضريبة_الخدمات'

export type YemeniPaymentMethod = 
  | 'نقدي' | 'شيك' | 'تحويل_بنكي' | 'ائتمان' 
  | 'حوالة_محلية' | 'صرافة' | 'عملة_أجنبية'

// Exchange Rate Information
export interface ExchangeRate {
  id: string
  baseCurrency: CurrencyCode
  targetCurrency: CurrencyCode
  rate: number
  date: Date
  source: 'central_bank' | 'commercial_bank' | 'black_market' | 'manual'
  isOfficial: boolean
  createdBy: string
  notes?: string
}

// Chart of Accounts Structure
export interface Account {
  id: string
  code: string
  name: string
  nameEnglish?: string
  type: AccountType
  category: AccountCategory
  parentAccountId?: string
  subAccounts: Account[]
  level: number
  isActive: boolean
  allowDirectPosting: boolean
  balance: number
  debitBalance: number
  creditBalance: number
  currency: CurrencyCode
  description?: string
  taxType?: TaxType
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Journal Entry and Transaction Types
export interface AccountEntry {
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  currency: CurrencyCode
  exchangeRate?: number
  amountInBaseCurrency: number
  description?: string
}

export interface JournalEntry {
  id: string
  entryNumber: string
  date: Date
  description: string
  reference?: string
  type: TransactionType
  status: TransactionStatus
  accounts: AccountEntry[]
  totalDebit: number
  totalCredit: number
  baseCurrency: CurrencyCode
  isBalanced: boolean
  attachments: string[]
  sourceDocument?: string
  sourceDocumentType?: 'invoice' | 'receipt' | 'payment' | 'adjustment' | 'manual'
  restaurantId?: string
  branchId?: string
  departmentId?: string
  projectId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
  postedBy?: string
  postedAt?: Date
  reversedBy?: string
  reversedAt?: Date
  reversingEntryId?: string
  notes?: JournalEntryNote[]
}

export interface JournalEntryNote {
  id: string
  entryId: string
  note: string
  type: 'general' | 'approval' | 'correction' | 'system'
  priority: 'low' | 'medium' | 'high'
  createdBy: string
  createdAt: Date
  isInternal: boolean
}

// Customer and Vendor Information
export interface YemeniCustomer {
  id: string
  customerCode: string
  type: 'individual' | 'business' | 'restaurant' | 'government'
  name: string
  businessName?: string
  taxId?: string
  commercialRegistration?: string
  contact: {
    person: string
    title?: string
    phone: string
    mobile?: string
    email?: string
    whatsapp?: string
  }
  address: {
    street: string
    district: string
    city: string
    governorate: YemeniGovernorate
    postalCode?: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  financial: {
    creditLimit: number
    paymentTerms: string
    currency: CurrencyCode
    taxExempt: boolean
    vatNumber?: string
    discountRate: number
    currentBalance: number
    totalSales: number
    lastPaymentDate?: Date
    lastTransactionDate?: Date
  }
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface YemeniVendor {
  id: string
  vendorCode: string
  type: 'supplier' | 'contractor' | 'service_provider' | 'consultant'
  businessName: string
  legalName?: string
  taxId?: string
  commercialRegistration?: string
  contact: {
    person: string
    title?: string
    phone: string
    mobile?: string
    email?: string
    whatsapp?: string
  }
  address: {
    street: string
    district: string
    city: string
    governorate: YemeniGovernorate
    postalCode?: string
    country: string
  }
  financial: {
    paymentTerms: string
    currency: CurrencyCode
    taxWithholding: boolean
    vatNumber?: string
    currentBalance: number
    totalPurchases: number
    lastPaymentDate?: Date
    lastTransactionDate?: Date
  }
  bankDetails?: {
    bankName: YemeniBankName
    accountNumber: string
    accountName: string
    branchName: string
    swiftCode?: string
    iban?: string
  }
  isActive: boolean
  isPreferred: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Invoice and Payment Types
export interface InvoiceItem {
  id: string
  itemCode?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discountRate: number
  discountAmount: number
  netAmount: number
  taxRate: number
  taxAmount: number
  finalAmount: number
  accountId?: string
  notes?: string
}

export interface YemeniInvoice {
  id: string
  invoiceNumber: string
  type: InvoiceType
  date: Date
  dueDate: Date
  currency: CurrencyCode
  exchangeRate?: number
  
  // Customer/Vendor Information
  customerId?: string
  customer?: YemeniCustomer
  vendorId?: string
  vendor?: YemeniVendor
  
  // Invoice Details
  items: InvoiceItem[]
  subtotal: number
  totalDiscount: number
  netAmount: number
  
  // Tax Information
  vatRate: number
  vatAmount: number
  withholdingTaxRate: number
  withholdingTaxAmount: number
  otherTaxes: {
    type: TaxType
    rate: number
    amount: number
  }[]
  
  // Final Amounts
  totalTax: number
  totalAmount: number
  amountInBaseCurrency: number
  
  // Status and References
  status: InvoiceStatus
  reference?: string
  purchaseOrderNumber?: string
  contractNumber?: string
  projectId?: string
  
  // Payment Information
  payments: PaymentRecord[]
  paidAmount: number
  remainingAmount: number
  
  // Additional Information
  terms?: string
  notes?: string
  attachments: string[]
  
  // Audit Trail
  createdAt: Date
  updatedAt: Date
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
  sentAt?: Date
  
  // Related Journal Entries
  journalEntryId?: string
  paymentJournalEntries: string[]
}

export interface PaymentRecord {
  id: string
  paymentNumber: string
  invoiceId: string
  date: Date
  amount: number
  currency: CurrencyCode
  exchangeRate?: number
  amountInBaseCurrency: number
  method: YemeniPaymentMethod
  status: PaymentStatus
  
  // Bank/Cash Information
  bankAccountId?: string
  checkNumber?: string
  transferReference?: string
  cashierName?: string
  
  // Additional Details
  notes?: string
  attachments: string[]
  journalEntryId?: string
  
  // Audit Trail
  createdAt: Date
  createdBy: string
  processedBy?: string
  processedAt?: Date
}

// Bank Account Management
export interface BankAccount {
  id: string
  accountNumber: string
  accountName: string
  bankName: YemeniBankName
  branchName: string
  branchCode?: string
  currency: CurrencyCode
  type: 'checking' | 'savings' | 'fixed_deposit' | 'foreign_currency'
  
  // Balance Information
  currentBalance: number
  availableBalance: number
  lastStatementBalance: number
  lastStatementDate?: Date
  
  // Bank Details
  swiftCode?: string
  iban?: string
  routingNumber?: string
  
  // Qasimi Bank Specific
  isQasimiBank: boolean
  qasimiAccountType?: 'business' | 'corporate' | 'government'
  qasimiServiceLevel?: 'basic' | 'premium' | 'vip'
  
  // Contact Information
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  
  // Status and Settings
  isActive: boolean
  isDefault: boolean
  allowOnlineTransactions: boolean
  dailyTransactionLimit?: number
  monthlyTransactionLimit?: number
  
  // Reconciliation
  lastReconciledDate?: Date
  lastReconciledBalance?: number
  unreconciledItems: number
  
  // Audit Information
  createdAt: Date
  updatedAt: Date
  createdBy: string
  notes?: string
}

export interface BankTransaction {
  id: string
  bankAccountId: string
  transactionDate: Date
  valueDate: Date
  description: string
  reference: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest' | 'adjustment'
  amount: number
  balance: number
  
  // Reconciliation
  isReconciled: boolean
  reconciledAt?: Date
  reconciledBy?: string
  journalEntryId?: string
  
  // Import Information
  importedAt?: Date
  statementLineNumber?: number
  originalDescription?: string
  
  notes?: string
}

// Budget Management
export interface BudgetCategory {
  id: string
  code: string
  name: string
  type: 'revenue' | 'expense'
  parentCategoryId?: string
  accountIds: string[]
  level: number
  isActive: boolean
}

export interface BudgetItem {
  id: string
  categoryId: string
  accountId?: string
  description: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  notes?: string
}

export interface Budget {
  id: string
  name: string
  description?: string
  fiscalYear: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date
  currency: CurrencyCode
  status: BudgetStatus
  
  // Budget Structure
  categories: BudgetCategory[]
  items: BudgetItem[]
  
  // Totals
  totalBudgetedRevenue: number
  totalActualRevenue: number
  revenueVariance: number
  
  totalBudgetedExpenses: number
  totalActualExpenses: number
  expenseVariance: number
  
  budgetedNetIncome: number
  actualNetIncome: number
  netIncomeVariance: number
  
  // Restaurant/Branch Specific
  restaurantId?: string
  branchId?: string
  departmentId?: string
  
  // Approval and Versioning
  version: number
  previousVersionId?: string
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: Date
  
  // Audit Trail
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  
  notes?: string
  attachments: string[]
}

// Financial Reports
export interface ReportParameter {
  name: string
  value: any
  type: 'date' | 'string' | 'number' | 'boolean' | 'array'
  label: string
  required: boolean
}

export interface FinancialReport {
  id: string
  name: string
  type: ReportType
  description?: string
  
  // Report Configuration
  parameters: ReportParameter[]
  period: ReportPeriod
  startDate: Date
  endDate: Date
  currency: CurrencyCode
  includeZeroBalances: boolean
  includeInactiveAccounts: boolean
  
  // Filters
  restaurantIds?: string[]
  branchIds?: string[]
  departmentIds?: string[]
  accountIds?: string[]
  
  // Report Data
  data: any
  totals: any
  summary: any
  
  // Generation Information
  generatedAt: Date
  generatedBy: string
  executionTime: number
  status: 'generating' | 'completed' | 'failed'
  
  // Export Options
  exportFormats: ('pdf' | 'excel' | 'csv' | 'json')[]
  templateId?: string
  
  notes?: string
}

// Trial Balance
export interface TrialBalanceItem {
  accountId: string
  accountCode: string
  accountName: string
  accountType: AccountType
  debitBalance: number
  creditBalance: number
  netBalance: number
}

export interface TrialBalance {
  asOfDate: Date
  currency: CurrencyCode
  items: TrialBalanceItem[]
  totalDebits: number
  totalCredits: number
  isBalanced: boolean
  variance: number
  generatedAt: Date
  generatedBy: string
}

// Income Statement (Profit & Loss)
export interface IncomeStatementItem {
  accountId: string
  accountCode: string
  accountName: string
  currentPeriod: number
  previousPeriod?: number
  variance?: number
  variancePercentage?: number
}

export interface IncomeStatementSection {
  name: string
  items: IncomeStatementItem[]
  subtotal: number
  previousSubtotal?: number
}

export interface IncomeStatement {
  period: {
    startDate: Date
    endDate: Date
  }
  currency: CurrencyCode
  
  sections: {
    revenue: IncomeStatementSection
    costOfServices: IncomeStatementSection
    operatingExpenses: IncomeStatementSection
    nonOperatingRevenue: IncomeStatementSection
    nonOperatingExpenses: IncomeStatementSection
  }
  
  grossProfit: number
  operatingProfit: number
  netProfit: number
  
  // Previous Period Comparison
  previousGrossProfit?: number
  previousOperatingProfit?: number
  previousNetProfit?: number
  
  // Ratios and Percentages
  grossProfitMargin: number
  operatingProfitMargin: number
  netProfitMargin: number
  
  generatedAt: Date
  generatedBy: string
}

// Balance Sheet
export interface BalanceSheetItem {
  accountId: string
  accountCode: string
  accountName: string
  amount: number
  previousAmount?: number
  variance?: number
  variancePercentage?: number
}

export interface BalanceSheetSection {
  name: string
  items: BalanceSheetItem[]
  subtotal: number
  previousSubtotal?: number
}

export interface BalanceSheet {
  asOfDate: Date
  currency: CurrencyCode
  
  assets: {
    currentAssets: BalanceSheetSection
    nonCurrentAssets: BalanceSheetSection
    totalAssets: number
    previousTotalAssets?: number
  }
  
  liabilities: {
    currentLiabilities: BalanceSheetSection
    nonCurrentLiabilities: BalanceSheetSection
    totalLiabilities: number
    previousTotalLiabilities?: number
  }
  
  equity: {
    equity: BalanceSheetSection
    totalEquity: number
    previousTotalEquity?: number
  }
  
  totalLiabilitiesAndEquity: number
  isBalanced: boolean
  variance: number
  
  // Financial Ratios
  currentRatio: number
  quickRatio: number
  debtToEquityRatio: number
  returnOnAssets: number
  returnOnEquity: number
  
  generatedAt: Date
  generatedBy: string
}

// Financial Events and Notifications
export type FinancialEventType = 
  | 'invoice_created' | 'invoice_paid' | 'payment_received' | 'payment_overdue'
  | 'budget_exceeded' | 'low_cash_balance' | 'high_receivables'
  | 'bank_transaction' | 'journal_entry_posted' | 'month_end_close'
  | 'financial_report_generated' | 'reconciliation_complete'

export interface FinancialEvent {
  id: string
  type: FinancialEventType
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'success'
  data: any
  relatedEntityId?: string
  relatedEntityType?: string
  restaurantId?: string
  branchId?: string
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}

// Form Data Types for UI
export interface AccountFormData {
  code: string
  name: string
  nameEnglish?: string
  type: AccountType
  category: AccountCategory
  parentAccountId?: string
  allowDirectPosting: boolean
  currency: CurrencyCode
  description?: string
  taxType?: TaxType
}

export interface JournalEntryFormData {
  date: Date
  description: string
  reference?: string
  type: TransactionType
  accounts: {
    accountId: string
    debitAmount: number
    creditAmount: number
    description?: string
  }[]
  attachments?: File[]
  notes?: string
}

export interface InvoiceFormData {
  type: InvoiceType
  date: Date
  dueDate: Date
  currency: CurrencyCode
  customerId?: string
  vendorId?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    discountRate: number
    taxRate: number
  }[]
  vatRate: number
  withholdingTaxRate: number
  reference?: string
  notes?: string
  attachments?: File[]
}

export interface PaymentFormData {
  invoiceId: string
  date: Date
  amount: number
  currency: CurrencyCode
  method: YemeniPaymentMethod
  bankAccountId?: string
  checkNumber?: string
  transferReference?: string
  notes?: string
  attachments?: File[]
}

// Filter and Search Types
export interface FinancialFilter {
  searchTerm?: string
  accountType?: AccountType
  accountCategory?: AccountCategory
  currency?: CurrencyCode
  status?: TransactionStatus | InvoiceStatus | PaymentStatus
  dateFrom?: Date
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
  customerId?: string
  vendorId?: string
  restaurantId?: string
  branchId?: string
  createdBy?: string
  isReconciled?: boolean
  hasAttachments?: boolean
}

export interface FinancialSortOption {
  field: string
  direction: 'asc' | 'desc'
}

// Statistics and Analytics
export interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossProfitMargin: number
  
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  
  cashBalance: number
  bankBalance: number
  accountsReceivable: number
  accountsPayable: number
  
  averageInvoiceValue: number
  averagePaymentPeriod: number
  overdueInvoices: number
  
  budgetVariance: number
  monthlyGrowthRate: number
  yearOverYearGrowth: number
  
  topCustomers: {
    customerId: string
    customerName: string
    totalSales: number
  }[]
  
  topExpenseCategories: {
    accountId: string
    accountName: string
    totalAmount: number
    percentage: number
  }[]
}
