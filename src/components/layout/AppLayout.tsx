'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { data: session } = useSession()
  const pathname = usePathname()

  // الصفحات التي لا تحتاج Navigation
  const excludeNavigationRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']
  const showNavigation = !excludeNavigationRoutes.includes(pathname) && pathname !== '/'

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && session && <Navigation />}
      <main className={showNavigation && session ? '' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
