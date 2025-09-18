import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تنسيق التاريخ باللغة العربية
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj)
}

// تنسيق المبالغ المالية
export function formatCurrency(amount: number | string, currency: string = 'SAR'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

// تنسيق الأرقام
export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseFloat(num) : num
  return new Intl.NumberFormat('ar-SA').format(number)
}

// إنشاء رقم مرجعي فريد
export function generateReferenceNumber(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}${randomStr}`.toUpperCase()
}

// التحقق من صحة رقم الهاتف السعودي
export function isValidSaudiPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  const saudiPhoneRegex = /^(\+966|966|0)?5[0-9]{8}$/
  return saudiPhoneRegex.test(cleanPhone)
}

// تنسيق رقم الهاتف
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  if (cleanPhone.startsWith('+966')) {
    return cleanPhone
  } else if (cleanPhone.startsWith('966')) {
    return `+${cleanPhone}`
  } else if (cleanPhone.startsWith('05')) {
    return `+966${cleanPhone.substring(1)}`
  }
  return phone
}

// التحقق من صحة البريد الإلكتروني
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// تحويل النص إلى slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// حساب النسبة المئوية
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

// تحديد لون الحالة
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // حالات عامة
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    
    // حالات الفواتير
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800',
    'overdue': 'bg-red-100 text-red-800',
    
    // حالات الطباعة
    'in_production': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'delivered': 'bg-green-100 text-green-800',
    
    // حالات التصميم
    'draft': 'bg-gray-100 text-gray-800',
    'under_review': 'bg-yellow-100 text-yellow-800',
    'needs_revision': 'bg-orange-100 text-orange-800',
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

// تحديد أيقونة الحالة
export function getStatusIcon(status: string): string {
  const statusIcons: Record<string, string> = {
    'active': '✅',
    'inactive': '⭕',
    'pending': '⏳',
    'approved': '✅',
    'rejected': '❌',
    'cancelled': '🚫',
    'paid': '💰',
    'unpaid': '💸',
    'overdue': '🔴',
    'in_production': '🏭',
    'completed': '✅',
    'delivered': '📦',
    'draft': '📝',
    'under_review': '👁️',
    'needs_revision': '🔄',
  }
  
  return statusIcons[status] || '❓'
}

// تحويل الحالة إلى نص عربي
export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    // حالات عامة
    'active': 'نشط',
    'inactive': 'غير نشط',
    'pending': 'في الانتظار',
    'approved': 'معتمد',
    'rejected': 'مرفوض',
    'cancelled': 'ملغي',
    
    // حالات الفواتير
    'paid': 'مدفوع',
    'unpaid': 'غير مدفوع',
    'overdue': 'متأخر',
    
    // حالات الطباعة
    'in_production': 'قيد الإنتاج',
    'completed': 'مكتمل',
    'delivered': 'تم التسليم',
    
    // حالات التصميم
    'draft': 'مسودة',
    'submitted': 'مُرسل',
    'under_review': 'قيد المراجعة',
    'needs_revision': 'يحتاج تعديل',
    
    // حالات العقود
    'expired': 'منتهي الصلاحية',
    'terminated': 'مُنهى',
  }
  
  return statusTexts[status] || status
}

// حساب الفترة الزمنية المتبقية
export function getTimeRemaining(targetDate: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
} {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const difference = target - now

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, isExpired: false }
}

// تحديد مستوى الأولوية
export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800',
  }
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800'
}

// إنشاء أحرف أولى من الاسم
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// تحويل البايتات إلى حجم مقروء
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت'
  
  const k = 1024
  const sizes = ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// التحقق من نوع الملف
export function getFileType(fileName: string): 'image' | 'pdf' | 'document' | 'other' {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return 'image'
  } else if (extension === 'pdf') {
    return 'pdf'
  } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return 'document'
  }
  
  return 'other'
}
