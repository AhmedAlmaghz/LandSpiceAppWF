'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { hasPermission, hasAnyPermission, canAccessRoute, UserRole, Resource, Permission } from '@/lib/permissions'

interface ProtectedComponentProps {
  children: React.ReactNode
  roles?: UserRole[]
  resource?: Resource
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  route?: string
  fallback?: React.ReactNode
  showFallback?: boolean
}

/**
 * مكون حماية للتحكم في عرض العناصر حسب الصلاحيات
 */
export default function ProtectedComponent({
  children,
  roles = [],
  resource,
  permission,
  permissions = [],
  requireAll = false,
  route,
  fallback = null,
  showFallback = true
}: ProtectedComponentProps) {
  const { data: session, status } = useSession()

  // إذا كان التحميل جارياً
  if (status === 'loading') {
    return showFallback ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    ) : null
  }

  // إذا لم يكن هناك جلسة
  if (!session) {
    return showFallback ? fallback : null
  }

  const userRole = session.user.role as UserRole

  // التحقق من الأدوار المسموحة
  if (roles.length > 0 && !roles.includes(userRole)) {
    return showFallback ? fallback : null
  }

  // التحقق من صلاحية الوصول للمسار
  if (route && !canAccessRoute(userRole, route)) {
    return showFallback ? fallback : null
  }

  // التحقق من الصلاحيات على المورد
  if (resource) {
    // التحقق من صلاحية واحدة
    if (permission && !hasPermission(userRole, resource, permission)) {
      return showFallback ? fallback : null
    }

    // التحقق من صلاحيات متعددة
    if (permissions.length > 0) {
      const hasRequired = requireAll
        ? permissions.every(p => hasPermission(userRole, resource, p))
        : hasAnyPermission(userRole, resource, permissions)

      if (!hasRequired) {
        return showFallback ? fallback : null
      }
    }
  }

  return <>{children}</>
}

/**
 * Higher-Order Component للحماية
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  protectionProps: Omit<ProtectedComponentProps, 'children'>
) {
  return function ProtectedComponentWrapper(props: P) {
    return (
      <ProtectedComponent {...protectionProps}>
        <Component {...props} />
      </ProtectedComponent>
    )
  }
}

/**
 * Hook للتحقق من الصلاحيات
 */
export function usePermissions() {
  const { data: session } = useSession()

  const checkPermission = (resource: Resource, permission: Permission): boolean => {
    if (!session) return false
    return hasPermission(session.user.role as UserRole, resource, permission)
  }

  const checkAnyPermission = (resource: Resource, permissions: Permission[]): boolean => {
    if (!session) return false
    return hasAnyPermission(session.user.role as UserRole, resource, permissions)
  }

  const checkRoute = (route: string): boolean => {
    if (!session) return false
    return canAccessRoute(session.user.role as UserRole, route)
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!session) return false
    return roles.includes(session.user.role as UserRole)
  }

  return {
    checkPermission,
    checkAnyPermission,
    checkRoute,
    hasRole,
    userRole: session?.user.role as UserRole,
    isAuthenticated: !!session
  }
}

/**
 * مكون لعرض رسالة عدم وجود صلاحية
 */
export function NoPermissionFallback({ message = 'ليس لديك صلاحية للوصول لهذا المحتوى' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a2 2 0 00-2-2H8a2 2 0 00-2 2v2m8 0V7a2 2 0 00-2-2H8a2 2 0 00-2 2v2m8 0v2H6V9h12z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        محتوى محمي
      </h3>
      <p className="text-gray-500 max-w-md">
        {message}
      </p>
    </div>
  )
}

/**
 * مكون لعرض قائمة الإجراءات المسموحة
 */
interface ActionButtonProps {
  resource: Resource
  permission: Permission
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
}

export function PermissionButton({
  resource,
  permission,
  onClick,
  children,
  className = '',
  disabled = false,
  variant = 'primary'
}: ActionButtonProps) {
  const { checkPermission } = usePermissions()

  if (!checkPermission(resource, permission)) {
    return null
  }

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-md font-medium transition-colors
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

/**
 * مكون لعرض المحتوى حسب الدور
 */
interface RoleBasedContentProps {
  role: UserRole | UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleBasedContent({ role, children, fallback = null }: RoleBasedContentProps) {
  const { hasRole } = usePermissions()
  const roles = Array.isArray(role) ? role : [role]

  if (!hasRole(roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * مكون لعرض معلومات الصلاحيات للتطوير
 */
export function PermissionDebugger() {
  const { userRole, isAuthenticated } = usePermissions()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
      <div>Role: {userRole || 'None'}</div>
      <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
    </div>
  )
}
