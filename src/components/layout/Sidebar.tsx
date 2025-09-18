import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  roles?: string[]
}

interface SidebarProps {
  items: SidebarItem[]
  userRole?: string
  isCollapsed?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ items, userRole = '', isCollapsed = false }) => {
  const pathname = usePathname()

  const filteredItems = items.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <aside className={cn(
      'bg-white border-l border-gray-200 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                isActive 
                  ? 'bg-red-50 text-red-700 border-l-4 border-red-500' 
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive ? 'text-red-500' : 'text-gray-500',
                isCollapsed ? '' : 'ml-3'
              )} />
              {!isCollapsed && (
                <>
                  <span className="mr-3 truncate">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
