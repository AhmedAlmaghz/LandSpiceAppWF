'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface NavigationItem {
  name: string
  href: string
  icon?: string
  current?: boolean
  roles?: string[]
}

const Navigation = () => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // تحديد عناصر التنقل حسب الدور
  const getNavigationItems = (): NavigationItem[] => {
    if (!session?.user?.role) return []

    const commonItems: NavigationItem[] = [
      { name: 'الرئيسية', href: '/', icon: '🏠' },
    ]

    const roleBasedItems: Record<string, NavigationItem[]> = {
      admin: [
        { name: 'لوحة التحكم', href: '/admin/dashboard', icon: '📊' },
        { name: 'إدارة المستخدمين', href: '/admin/users', icon: '👥' },
        { name: 'المطاعم', href: '/admin/restaurants', icon: '🏪' },
        { name: 'العقود', href: '/admin/contracts', icon: '📝' },
        { name: 'الضمانات البنكية', href: '/admin/guarantees', icon: '🏦' },
        { name: 'أوامر الطباعة', href: '/admin/print-orders', icon: '🖨️' },
        { name: 'الفواتير', href: '/admin/invoices', icon: '💰' },
        { name: 'التقارير', href: '/admin/reports', icon: '📈' },
        { name: 'الإعدادات', href: '/admin/settings', icon: '⚙️' },
      ],
      restaurant: [
        { name: 'لوحة التحكم', href: '/restaurant/dashboard', icon: '📊' },
        { name: 'المخزون', href: '/restaurant/inventory', icon: '📦' },
        { name: 'التصاميم', href: '/restaurant/designs', icon: '🎨' },
        { name: 'الطلبات', href: '/restaurant/orders', icon: '📋' },
        { name: 'الفواتير', href: '/restaurant/invoices', icon: '💰' },
        { name: 'العقد', href: '/restaurant/contract', icon: '📝' },
        { name: 'الملف الشخصي', href: '/restaurant/profile', icon: '👤' },
      ],
      bank: [
        { name: 'لوحة التحكم', href: '/bank/dashboard', icon: '📊' },
        { name: 'الضمانات', href: '/bank/guarantees', icon: '🏦' },
        { name: 'العقود', href: '/bank/contracts', icon: '📝' },
        { name: 'الأقساط', href: '/bank/installments', icon: '💳' },
        { name: 'أوامر الطباعة', href: '/bank/print-orders', icon: '🖨️' },
        { name: 'التقارير', href: '/bank/reports', icon: '📈' },
        { name: 'الملف الشخصي', href: '/bank/profile', icon: '👤' },
      ],
      supplier: [
        { name: 'لوحة التحكم', href: '/supplier/dashboard', icon: '📊' },
        { name: 'أوامر الطباعة', href: '/supplier/print-orders', icon: '🖨️' },
        { name: 'الإنتاج', href: '/supplier/production', icon: '🏭' },
        { name: 'التقارير', href: '/supplier/reports', icon: '📈' },
        { name: 'الملف الشخصي', href: '/supplier/profile', icon: '👤' },
      ],
      marketer: [
        { name: 'لوحة التحكم', href: '/marketer/dashboard', icon: '📊' },
        { name: 'المطاعم', href: '/marketer/restaurants', icon: '🏪' },
        { name: 'العملاء المحتملين', href: '/marketer/leads', icon: '🎯' },
        { name: 'التقارير', href: '/marketer/reports', icon: '📈' },
        { name: 'الملف الشخصي', href: '/marketer/profile', icon: '👤' },
      ],
      landspace_staff: [
        { name: 'لوحة التحكم', href: '/staff/dashboard', icon: '📊' },
        { name: 'المطاعم', href: '/staff/restaurants', icon: '🏪' },
        { name: 'التصاميم', href: '/staff/designs', icon: '🎨' },
        { name: 'الإنتاج', href: '/staff/production', icon: '🏭' },
        { name: 'المخزون', href: '/staff/inventory', icon: '📦' },
        { name: 'الفواتير', href: '/staff/invoices', icon: '💰' },
        { name: 'التقارير', href: '/staff/reports', icon: '📈' },
      ],
    }

    return [...commonItems, ...(roleBasedItems[session.user.role] || [])]
  }

  const navigationItems = getNavigationItems()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LS</span>
              </div>
              <span className="mr-3 text-xl font-bold text-gray-900">لاند سبايس</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-red-100 text-red-700 border-b-2 border-red-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <span className="ml-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {session ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    {session.user.firstName} {session.user.lastName}
                  </span>
                  <div className="text-xs text-gray-500">
                    {session.user.role === 'admin' && 'مدير النظام'}
                    {session.user.role === 'restaurant' && 'مطعم'}
                    {session.user.role === 'bank' && 'بنك'}
                    {session.user.role === 'supplier' && 'مورد'}
                    {session.user.role === 'marketer' && 'مسوق'}
                    {session.user.role === 'landspace_staff' && 'موظف لاند سبايس'}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">تسجيل الدخول</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">إنشاء حساب</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="ml-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
