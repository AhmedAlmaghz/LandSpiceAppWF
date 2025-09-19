// نظام الصلاحيات المتقدم لنظام إدارة لاند سبايس

export type UserRole = 'admin' | 'restaurant' | 'bank' | 'supplier' | 'marketer' | 'landspice_employee'

export type Permission = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'approve' | 'reject' | 'review'
  | 'export' | 'import' | 'manage'
  | 'pay' | 'cancel' | 'archive'

export type Resource = 
  | 'users' | 'restaurants' | 'contracts' | 'guarantees'
  | 'designs' | 'print_orders' | 'inventory' | 'invoices'
  | 'installments' | 'reports' | 'system' | 'workflow'
  | 'commissions' | 'production_batches'

// مصفوفة الصلاحيات الشاملة
export const PERMISSION_MATRIX: Record<UserRole, Record<Resource, Permission[]>> = {
  admin: {
    users: ['create', 'read', 'update', 'delete', 'manage'],
    restaurants: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    contracts: ['create', 'read', 'update', 'delete', 'approve', 'cancel'],
    guarantees: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    designs: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'review'],
    print_orders: ['create', 'read', 'update', 'delete', 'cancel'],
    inventory: ['create', 'read', 'update', 'delete', 'manage'],
    invoices: ['create', 'read', 'update', 'delete', 'cancel'],
    installments: ['create', 'read', 'update', 'delete'],
    reports: ['read', 'export', 'manage'],
    system: ['manage', 'import', 'export'],
    workflow: ['create', 'read', 'update', 'delete', 'manage'],
    commissions: ['create', 'read', 'update', 'delete'],
    production_batches: ['read', 'manage']
  },

  restaurant: {
    users: [],
    restaurants: ['read', 'update'], // البيانات الخاصة فقط
    contracts: ['read'], // العقود الخاصة فقط
    guarantees: ['read'], // الضمانات المرتبطة فقط
    designs: ['create', 'read', 'update'], // التصاميم الخاصة فقط
    print_orders: ['read'], // أوامر الطباعة الخاصة فقط
    inventory: ['read'], // المخزون الخاص فقط
    invoices: ['read', 'pay'], // الفواتير الخاصة فقط
    installments: ['read'], // الأقساط الخاصة فقط
    reports: ['read'], // التقارير الخاصة فقط
    system: [],
    workflow: ['read'], // عرض حالة العمليات الخاصة
    commissions: [],
    production_batches: ['read'] // الدفعات المرتبطة فقط
  },

  bank: {
    users: [],
    restaurants: ['read'], // المطاعم المرتبطة فقط
    contracts: ['create', 'read', 'update'], // العقود المرتبطة فقط
    guarantees: ['create', 'read', 'update', 'approve', 'reject'],
    designs: ['read'], // التصاميم للمطاعم المرتبطة
    print_orders: ['create', 'read', 'update', 'cancel'],
    inventory: [],
    invoices: ['read'], // الفواتير المرتبطة
    installments: ['create', 'read', 'update'],
    reports: ['read', 'export'], // تقارير البنك
    system: [],
    workflow: ['read'],
    commissions: [],
    production_batches: []
  },

  supplier: {
    users: [],
    restaurants: [],
    contracts: [],
    guarantees: [],
    designs: ['read'], // التصاميم لأوامر الطباعة المُعيّنة
    print_orders: ['read', 'update'], // أوامر الطباعة المُعيّنة فقط
    inventory: [],
    invoices: [],
    installments: [],
    reports: ['read'], // تقارير الأداء الخاصة
    system: [],
    workflow: ['read', 'update'], // تحديث حالة الإنتاج
    commissions: [],
    production_batches: ['create', 'read', 'update'] // إدارة دفعات الإنتاج
  },

  marketer: {
    users: [],
    restaurants: ['create', 'read', 'update'], // المطاعم المُسوّقة فقط
    contracts: ['read'], // عقود المطاعم المُسوّقة
    guarantees: [],
    designs: [],
    print_orders: [],
    inventory: [],
    invoices: [],
    installments: [],
    reports: ['read'], // تقارير المبيعات والعمولات
    system: [],
    workflow: [],
    commissions: ['read'], // العمولات الخاصة
    production_batches: []
  },

  landspice_employee: {
    users: ['read'],
    restaurants: ['read', 'update', 'approve', 'reject'],
    contracts: ['read', 'update', 'review'],
    guarantees: ['read', 'review'],
    designs: ['create', 'read', 'update', 'approve', 'reject', 'review'],
    print_orders: ['create', 'read', 'update'],
    inventory: ['read', 'update'],
    invoices: ['create', 'read', 'update'],
    installments: ['read'],
    reports: ['read', 'export'],
    system: ['manage'],
    workflow: ['create', 'read', 'update', 'manage'],
    commissions: ['create', 'read', 'update'],
    production_batches: ['read', 'review']
  }
}

/**
 * التحقق من وجود صلاحية معينة للمستخدم
 */
export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  permission: Permission
): boolean {
  const rolePermissions = PERMISSION_MATRIX[userRole]
  if (!rolePermissions) return false

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(permission)
}

/**
 * التحقق من صلاحيات متعددة
 */
export function hasAnyPermission(
  userRole: UserRole,
  resource: Resource,
  permissions: Permission[]
): boolean {
  return permissions.some(permission => hasPermission(userRole, resource, permission))
}

/**
 * التحقق من جميع الصلاحيات المطلوبة
 */
export function hasAllPermissions(
  userRole: UserRole,
  resource: Resource,
  permissions: Permission[]
): boolean {
  return permissions.every(permission => hasPermission(userRole, resource, permission))
}

/**
 * الحصول على جميع صلاحيات المستخدم لمورد معين
 */
export function getUserPermissions(
  userRole: UserRole,
  resource: Resource
): Permission[] {
  const rolePermissions = PERMISSION_MATRIX[userRole]
  if (!rolePermissions) return []

  return rolePermissions[resource] || []
}

/**
 * التحقق من صلاحية الوصول للمسار
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // مسارات عامة متاحة للجميع
  const publicRoutes = ['/auth', '/api/auth', '/']
  if (publicRoutes.some(publicRoute => route.startsWith(publicRoute))) {
    return true
  }

  // مسارات خاصة بالمدير
  const adminRoutes = ['/admin']
  if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
    return userRole === 'admin'
  }

  // مسارات خاصة بالمطاعم
  const restaurantRoutes = ['/restaurant']
  if (restaurantRoutes.some(restaurantRoute => route.startsWith(restaurantRoute))) {
    return userRole === 'restaurant'
  }

  // مسارات خاصة بالبنوك
  const bankRoutes = ['/bank']
  if (bankRoutes.some(bankRoute => route.startsWith(bankRoute))) {
    return userRole === 'bank'
  }

  // مسارات خاصة بالموردين
  const supplierRoutes = ['/supplier']
  if (supplierRoutes.some(supplierRoute => route.startsWith(supplierRoute))) {
    return userRole === 'supplier'
  }

  // مسارات خاصة بالمسوقين
  const marketerRoutes = ['/marketer']
  if (marketerRoutes.some(marketerRoute => route.startsWith(marketerRoute))) {
    return userRole === 'marketer'
  }

  // مسارات لوحة التحكم العامة
  const dashboardRoutes = ['/dashboard']
  if (dashboardRoutes.some(dashboardRoute => route.startsWith(dashboardRoute))) {
    return ['admin', 'restaurant', 'bank', 'supplier', 'marketer', 'landspice_employee'].includes(userRole)
  }

  return false
}

/**
 * Middleware للتحقق من الصلاحيات في API Routes
 */
export function requirePermission(
  userRole: UserRole,
  resource: Resource,
  permission: Permission
) {
  if (!hasPermission(userRole, resource, permission)) {
    throw new Error(`ليس لديك صلاحية ${permission} على ${resource}`)
  }
}

/**
 * فلترة البيانات حسب الدور (Data Scoping)
 */
export function scopeDataByRole(userRole: UserRole, userId: string) {
  const scopes: any = {}

  switch (userRole) {
    case 'restaurant':
      scopes.restaurant = { userId }
      break
    case 'bank':
      scopes.bank = { userId }
      break
    case 'supplier':
      scopes.supplier = { userId }
      break
    case 'marketer':
      scopes.marketer = { marketerId: userId }
      break
    case 'admin':
    case 'landspice_employee':
      // بدون قيود - يمكن الوصول لجميع البيانات
      break
  }

  return scopes
}

/**
 * التحقق من ملكية المورد
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  resourceOwnerId: string,
  resourceType: Resource
): boolean {
  // المدير يمكنه الوصول لجميع الموارد
  if (userRole === 'admin') return true

  // موظف لاند سبايس يمكنه الوصول للموارد المحددة
  if (userRole === 'landspice_employee') {
    return ['restaurants', 'designs', 'workflow', 'reports'].includes(resourceType)
  }

  // الآخرون يمكنهم الوصول للموارد التي يملكونها فقط
  return userId === resourceOwnerId
}

/**
 * قائمة الإجراءات المسموحة للمستخدم على مورد معين
 */
export function getAvailableActions(
  userRole: UserRole,
  resource: Resource
): { label: string; action: Permission; disabled?: boolean }[] {
  const permissions = getUserPermissions(userRole, resource)
  
  const actionMap: Record<Permission, string> = {
    create: 'إنشاء',
    read: 'عرض',
    update: 'تحديث',
    delete: 'حذف',
    approve: 'موافقة',
    reject: 'رفض',
    review: 'مراجعة',
    export: 'تصدير',
    import: 'استيراد',
    manage: 'إدارة',
    pay: 'دفع',
    cancel: 'إلغاء',
    archive: 'أرشفة'
  }

  return permissions.map(action => ({
    label: actionMap[action] || action,
    action,
    disabled: false
  }))
}
