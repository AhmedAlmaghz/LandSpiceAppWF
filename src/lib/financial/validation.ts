// Financial and Accounting Validation for Yemeni Context
// نظام التحقق من البيانات المالية والمحاسبية للسياق اليمني

import { z } from 'zod'
import {
  CurrencyCode,
  AccountType,
  AccountCategory,
  TransactionType,
  InvoiceType,
  YemeniBankName,
  YemeniPaymentMethod,
  Account,
  AccountEntry,
  InvoiceItem,
  ExchangeRate
} from './types'

// Yemeni business validation functions
export const validateYemeniPhoneNumber = (phone: string): boolean => {
  const yemeniPhoneRegex = /^(\+?967|0)?[17][0-9]{7}$/
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  return yemeniPhoneRegex.test(cleanPhone)
}

export const validateYemeniTaxId = (taxId: string): boolean => {
  const taxIdRegex = /^[0-9]{10}$/
  return taxIdRegex.test(taxId)
}

export const validateYemeniAccountNumber = (bankName: YemeniBankName, accountNumber: string): boolean => {
  const patterns: Record<string, RegExp> = {
    'بنك القاسمي': /^[0-9]{10,15}$/,
    'البنك الأهلي اليمني': /^[0-9]{10,14}$/,
    'بنك سبأ الإسلامي': /^[0-9]{12,16}$/
  }
  const pattern = patterns[bankName] || /^[0-9]{8,16}$/
  return pattern.test(accountNumber)
}

// Account validation functions
export const validateAccountCode = (code: string, type: AccountType): boolean => {
  const accountCodePatterns: Record<AccountType, RegExp> = {
    'assets': /^1[0-9]{3,4}$/,
    'liabilities': /^2[0-9]{3,4}$/,
    'equity': /^3[0-9]{3,4}$/,
    'revenue': /^4[0-9]{3,4}$/,
    'expenses': /^5[0-9]{3,4}$/
  }
  return accountCodePatterns[type].test(code)
}

export const generateAccountCode = (type: AccountType, category: AccountCategory, sequence: number): string => {
  const typePrefix: Record<AccountType, string> = {
    'assets': '1',
    'liabilities': '2',
    'equity': '3',
    'revenue': '4',
    'expenses': '5'
  }
  
  const categoryInfix: Record<AccountCategory, string> = {
    'current': '0',
    'non-current': '1',
    'fixed': '2',
    'liquid': '3',
    'operating': '0',
    'non-operating': '9'
  }
  
  return `${typePrefix[type]}${categoryInfix[category]}${sequence.toString().padStart(2, '0')}`
}

// Journal entry validation functions
export const validateJournalEntryBalance = (entries: AccountEntry[]): boolean => {
  const totalDebits = entries.reduce((sum, entry) => sum + entry.debitAmount, 0)
  const totalCredits = entries.reduce((sum, entry) => sum + entry.creditAmount, 0)
  const tolerance = 0.001
  return Math.abs(totalDebits - totalCredits) <= tolerance
}

export const generateJournalEntryNumber = (date: Date, sequence: number): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const seq = sequence.toString().padStart(4, '0')
  return `JE${year}${month}${seq}`
}

// Invoice validation functions
export const validateInvoiceNumber = (invoiceNumber: string, type: InvoiceType): boolean => {
  const patterns: Record<InvoiceType, RegExp> = {
    'sales': /^INV-\d{4}-\d{6}$/,
    'purchase': /^PUR-\d{4}-\d{6}$/,
    'service': /^SRV-\d{4}-\d{6}$/,
    'return': /^RET-\d{4}-\d{6}$/,
    'credit_note': /^CN-\d{4}-\d{6}$/,
    'debit_note': /^DN-\d{4}-\d{6}$/
  }
  return patterns[type].test(invoiceNumber)
}

export const generateInvoiceNumber = (type: InvoiceType, date: Date, sequence: number): string => {
  const prefixes: Record<InvoiceType, string> = {
    'sales': 'INV',
    'purchase': 'PUR',
    'service': 'SRV',
    'return': 'RET',
    'credit_note': 'CN',
    'debit_note': 'DN'
  }
  
  const year = date.getFullYear()
  const seq = sequence.toString().padStart(6, '0')
  return `${prefixes[type]}-${year}-${seq}`
}

export const calculateInvoiceVAT = (subtotal: number, vatRate: number): number => {
  return Math.round((subtotal * vatRate / 100) * 1000) / 1000
}

export const calculateInvoiceTotals = (items: InvoiceItem[], vatRate: number, withholdingTaxRate: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.finalAmount, 0)
  const vatAmount = calculateInvoiceVAT(subtotal, vatRate)
  const withholdingTaxAmount = Math.round((subtotal * withholdingTaxRate / 100) * 1000) / 1000
  const total = subtotal + vatAmount - withholdingTaxAmount
  
  return {
    subtotal: Math.round(subtotal * 1000) / 1000,
    vatAmount: Math.round(vatAmount * 1000) / 1000,
    withholdingTaxAmount: Math.round(withholdingTaxAmount * 1000) / 1000,
    total: Math.round(total * 1000) / 1000
  }
}

// Payment validation functions
export const validatePaymentMethod = (method: YemeniPaymentMethod, amount: number): boolean => {
  if (method === 'نقدي' && amount > 500000) return false
  if (method === 'عملة_أجنبية' && amount > 1000) return false
  return true
}

export const generatePaymentNumber = (method: YemeniPaymentMethod, date: Date, sequence: number): string => {
  const prefixes: Record<YemeniPaymentMethod, string> = {
    'نقدي': 'CASH',
    'شيك': 'CHK',
    'تحويل_بنكي': 'TRF',
    'ائتمان': 'CRD',
    'حوالة_محلية': 'LOC',
    'صرافة': 'EXC',
    'عملة_أجنبية': 'FX'
  }
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const seq = sequence.toString().padStart(4, '0')
  return `${prefixes[method]}-${year}${month}-${seq}`
}

// Exchange rate validation
export const validateExchangeRate = (rate: ExchangeRate): boolean => {
  if (rate.rate <= 0) return false
  if (rate.baseCurrency === rate.targetCurrency) return false
  
  if (rate.baseCurrency === 'YER') {
    if (rate.targetCurrency === 'USD' && (rate.rate < 100 || rate.rate > 2000)) return false
    if (rate.targetCurrency === 'SAR' && (rate.rate < 30 || rate.rate > 600)) return false
  }
  
  return true
}

export const getCurrentExchangeRate = (from: CurrencyCode, to: CurrencyCode): number => {
  const rates: Record<string, Record<string, number>> = {
    'YER': {
      'USD': 530,
      'SAR': 141,
      'EUR': 580,
      'AED': 144
    },
    'USD': {
      'YER': 1/530,
      'SAR': 0.266,
      'EUR': 0.92,
      'AED': 0.272
    }
  }
  
  if (from === to) return 1
  return rates[from]?.[to] || 1
}

// Financial ratios calculation
export const calculateFinancialRatios = (
  currentAssets: number,
  currentLiabilities: number,
  totalAssets: number,
  totalLiabilities: number,
  totalEquity: number,
  netIncome: number
) => {
  return {
    currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
    quickRatio: currentLiabilities > 0 ? (currentAssets * 0.8) / currentLiabilities : 0,
    debtToEquityRatio: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
    returnOnAssets: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
    returnOnEquity: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
    debtRatio: totalAssets > 0 ? totalLiabilities / totalAssets : 0
  }
}

export const validateFinancialRatios = (ratios: ReturnType<typeof calculateFinancialRatios>): boolean => {
  return (
    ratios.currentRatio >= 1.0 &&
    ratios.debtToEquityRatio <= 2.0 &&
    ratios.debtRatio <= 0.7
  )
}

// Zod schemas for validation
export const currencyCodeSchema = z.enum(['YER', 'USD', 'SAR', 'EUR', 'AED'])
export const accountTypeSchema = z.enum(['assets', 'liabilities', 'equity', 'revenue', 'expenses'])
export const yemeniPhoneSchema = z.string().refine(validateYemeniPhoneNumber, {
  message: 'رقم الهاتف اليمني غير صحيح'
})

export const accountEntrySchema = z.object({
  accountId: z.string(),
  accountCode: z.string(),
  accountName: z.string(),
  debitAmount: z.number().min(0),
  creditAmount: z.number().min(0),
  currency: currencyCodeSchema,
  exchangeRate: z.number().positive().optional(),
  amountInBaseCurrency: z.number(),
  description: z.string().optional()
}).refine(data => {
  const hasDebit = data.debitAmount > 0
  const hasCredit = data.creditAmount > 0
  return (hasDebit && !hasCredit) || (!hasDebit && hasCredit)
}, {
  message: 'يجب أن يكون للقيد إما مدين أو دائن وليس كلاهما'
})

export const journalEntrySchema = z.object({
  id: z.string(),
  entryNumber: z.string(),
  date: z.date(),
  description: z.string().min(3).max(500),
  accounts: z.array(accountEntrySchema).min(2),
  totalDebit: z.number().min(0),
  totalCredit: z.number().min(0),
  isBalanced: z.boolean(),
  createdBy: z.string()
}).refine(data => validateJournalEntryBalance(data.accounts), {
  message: 'إجمالي المدين يجب أن يساوي إجمالي الدائن'
})

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(2).max(200),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  discountRate: z.number().min(0).max(100),
  discountAmount: z.number().min(0),
  netAmount: z.number().min(0),
  taxRate: z.number().min(0).max(50),
  taxAmount: z.number().min(0),
  finalAmount: z.number().min(0)
})

// Form validation schemas
export const accountFormSchema = z.object({
  code: z.string().min(4).max(6),
  name: z.string().min(2).max(100),
  type: accountTypeSchema,
  allowDirectPosting: z.boolean(),
  currency: currencyCodeSchema,
  description: z.string().optional()
})

export const journalEntryFormSchema = z.object({
  date: z.date(),
  description: z.string().min(3).max(500),
  accounts: z.array(z.object({
    accountId: z.string(),
    debitAmount: z.number().min(0),
    creditAmount: z.number().min(0),
    description: z.string().optional()
  })).min(2)
})

export const invoiceFormSchema = z.object({
  type: z.enum(['sales', 'purchase', 'service']),
  date: z.date(),
  dueDate: z.date(),
  currency: currencyCodeSchema,
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(2),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    discountRate: z.number().min(0).max(100),
    taxRate: z.number().min(0).max(50)
  })).min(1),
  vatRate: z.number().min(0).max(50),
  withholdingTaxRate: z.number().min(0).max(30),
  notes: z.string().optional()
}).refine(data => data.customerId || data.vendorId, {
  message: 'يجب تحديد عميل أو مورد'
})

export const paymentFormSchema = z.object({
  invoiceId: z.string(),
  date: z.date(),
  amount: z.number().positive(),
  currency: currencyCodeSchema,
  method: z.enum(['نقدي', 'شيك', 'تحويل_بنكي', 'ائتمان']),
  checkNumber: z.string().optional(),
  transferReference: z.string().optional(),
  notes: z.string().optional()
})

// Default chart of accounts for Yemeni restaurants
export const getDefaultChartOfAccounts = () => {
  return [
    // Assets - الأصول
    { code: '1001', name: 'النقدية', type: 'assets', category: 'current' },
    { code: '1002', name: 'حساب بنك القاسمي', type: 'assets', category: 'current' },
    { code: '1003', name: 'حساب البنك الأهلي', type: 'assets', category: 'current' },
    { code: '1101', name: 'الذمم المدينة', type: 'assets', category: 'current' },
    { code: '1201', name: 'المخزون', type: 'assets', category: 'current' },
    { code: '1301', name: 'المصروفات المدفوعة مقدماً', type: 'assets', category: 'current' },
    { code: '1501', name: 'المعدات', type: 'assets', category: 'fixed' },
    { code: '1502', name: 'الأثاث', type: 'assets', category: 'fixed' },
    { code: '1503', name: 'أجهزة الكمبيوتر', type: 'assets', category: 'fixed' },
    
    // Liabilities - الخصوم
    { code: '2001', name: 'الذمم الدائنة', type: 'liabilities', category: 'current' },
    { code: '2002', name: 'القروض قصيرة المدى', type: 'liabilities', category: 'current' },
    { code: '2101', name: 'المصروفات المستحقة', type: 'liabilities', category: 'current' },
    { code: '2102', name: 'ضريبة القيمة المضافة المستحقة', type: 'liabilities', category: 'current' },
    { code: '2103', name: 'رواتب الموظفين المستحقة', type: 'liabilities', category: 'current' },
    { code: '2201', name: 'القروض طويلة المدى', type: 'liabilities', category: 'non-current' },
    
    // Equity - حقوق الملكية
    { code: '3001', name: 'رأس المال', type: 'equity', category: 'current' },
    { code: '3002', name: 'الأرباح المحتجزة', type: 'equity', category: 'current' },
    { code: '3003', name: 'أرباح السنة الجارية', type: 'equity', category: 'current' },
    
    // Revenue - الإيرادات
    { code: '4001', name: 'إيرادات إدارة المطاعم', type: 'revenue', category: 'operating' },
    { code: '4002', name: 'إيرادات خدمات التصميم', type: 'revenue', category: 'operating' },
    { code: '4003', name: 'إيرادات الخدمات الاستشارية', type: 'revenue', category: 'operating' },
    { code: '4004', name: 'إيرادات الضمانات البنكية', type: 'revenue', category: 'operating' },
    { code: '4901', name: 'إيرادات الفوائد', type: 'revenue', category: 'non-operating' },
    { code: '4902', name: 'أرباح صرف العملات', type: 'revenue', category: 'non-operating' },
    
    // Expenses - المصروفات
    { code: '5001', name: 'تكلفة الخدمات', type: 'expenses', category: 'operating' },
    { code: '5101', name: 'الرواتب والأجور', type: 'expenses', category: 'operating' },
    { code: '5102', name: 'إيجار المكتب', type: 'expenses', category: 'operating' },
    { code: '5103', name: 'الكهرباء والماء', type: 'expenses', category: 'operating' },
    { code: '5104', name: 'الهاتف والإنترنت', type: 'expenses', category: 'operating' },
    { code: '5105', name: 'مصروفات التسويق', type: 'expenses', category: 'operating' },
    { code: '5106', name: 'الأتعاب المهنية', type: 'expenses', category: 'operating' },
    { code: '5107', name: 'مصروفات السفر', type: 'expenses', category: 'operating' },
    { code: '5108', name: 'مصروفات الصيانة', type: 'expenses', category: 'operating' },
    { code: '5109', name: 'مصروفات التأمين', type: 'expenses', category: 'operating' },
    { code: '5110', name: 'الاستهلاك', type: 'expenses', category: 'operating' },
    { code: '5901', name: 'مصروفات الفوائد', type: 'expenses', category: 'non-operating' },
    { code: '5902', name: 'خسائر صرف العملات', type: 'expenses', category: 'non-operating' }
  ]
}
