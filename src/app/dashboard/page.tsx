'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // توجيه المستخدم حسب دوره
    const roleRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      restaurant: '/restaurant/dashboard',
      bank: '/bank/dashboard',
      supplier: '/supplier/dashboard',
      marketer: '/marketer/dashboard',
      landspace_staff: '/staff/dashboard',
    }

    const targetRoute = roleRoutes[session.user.role]
    if (targetRoute) {
      router.push(targetRoute)
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // سيتم التوجيه لصفحة تسجيل الدخول
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            مرحباً، {session.user.firstName} {session.user.lastName}
          </h1>
          <p className="text-gray-600">لوحة التحكم الرئيسية - {session.user.role}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>جاري التوجيه...</CardTitle>
            <CardDescription>
              يتم توجيهك إلى لوحة التحكم المناسبة لدورك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
