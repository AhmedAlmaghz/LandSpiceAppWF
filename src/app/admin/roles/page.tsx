'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/dashboard/DataTable'
import StatCard from '@/components/dashboard/StatCard'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate } from '@/lib/utils'

// Types
interface Role {
  id: number
  name: string
  displayName: string
  description?: string
  permissions?: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    users: number
  }
  users?: Array<{
    id: string
    username: string
    firstName?: string
    lastName?: string
    status: string
  }>
}

interface RoleFormData {
  name: string
  displayName: string
  description: string
  permissions: Record<string, string[]>
}

export default function RolesManagementPage() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    displayName: '',
    description: '',
    permissions: {}
  })

  // جلب الأدوار
  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/roles?includeUsers=true')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRoles(data.data)
        }
      } else {
        // بيانات تجريبية
        const mockRoles: Role[] = [
          {
            id: 1,
            name: 'admin',
            displayName: 'مدير النظام',
            description: 'صلاحيات كاملة لإدارة النظام',
            isActive: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            _count: { users: 2 },
            permissions: {
              users: ['create', 'read', 'update', 'delete'],
              restaurants: ['create', 'read', 'update', 'delete'],
              contracts: ['create', 'read', 'update', 'delete'],
              reports: ['read', 'export']
            }
          },
          {
            id: 2,
            name: 'restaurant',
            displayName: 'مطعم',
            description: 'صلاحيات المطعم لإدارة حسابه',
            isActive: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            _count: { users: 45 },
            permissions: {
              profile: ['read', 'update'],
              designs: ['create', 'read', 'update'],
              contracts: ['read'],
              invoices: ['read', 'pay']
            }
          },
          {
            id: 3,
            name: 'bank',
            displayName: 'بنك',
            description: 'صلاحيات البنك لإدارة الضمانات والتمويل',
            isActive: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            _count: { users: 5 },
            permissions: {
              guarantees: ['create', 'read', 'update', 'approve', 'reject'],
              contracts: ['read'],
              installments: ['create', 'read', 'update']
            }
          },
          {
            id: 4,
            name: 'supplier',
            displayName: 'مورد',
            description: 'صلاحيات المورد لإدارة الطلبات والإنتاج',
            isActive: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            _count: { users: 8 },
            permissions: {
              print_orders: ['read', 'update'],
              production_batches: ['create', 'read', 'update']
            }
          }
        ]
        setRoles(mockRoles)
      }
    } catch (error) {
      console.error('خطأ في جلب الأدوار:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin')
  }

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, string> = {
      admin: '👑',
      restaurant: '🏪',
      bank: '🏦',
      supplier: '📦',
      marketer: '📈',
      landspice_employee: '👥'
    }
    return icons[roleName] || '👤'
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: {}
    })
    setShowCreateModal(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: role.permissions || {}
    })
    setShowCreateModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = selectedRole ? '/api/admin/roles' : '/api/admin/roles'
      const method = selectedRole ? 'PUT' : 'POST'
      const body = selectedRole 
        ? { ...formData, id: selectedRole.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setShowCreateModal(false)
          fetchRoles()
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ الدور:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return

    try {
      const response = await fetch(`/api/admin/roles?id=${roleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchRoles()
      }
    } catch (error) {
      console.error('خطأ في حذف الدور:', error)
    }
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'role', 
      label: 'الدور',
      render: (role: Role) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="text-2xl">{getRoleIcon(role.name)}</span>
          <div>
            <div className="font-medium text-gray-900">{role.displayName}</div>
            <div className="text-sm text-gray-500">@{role.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (role: Role) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600">
            {role.description || 'لا يوجد وصف'}
          </p>
        </div>
      )
    },
    {
      key: 'users',
      label: 'عدد المستخدمين',
      render: (role: Role) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {role._count.users} مستخدم
          </span>
        </div>
      )
    },
    {
      key: 'permissions',
      label: 'الصلاحيات',
      render: (role: Role) => {
        const permissionCount = role.permissions 
          ? Object.keys(role.permissions).length 
          : 0
        
        return (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {permissionCount} مورد
            </span>
          </div>
        )
      }
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (role: Role) => (
        <span className="text-sm text-gray-600">
          {formatDate(role.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (role: Role) => {
        const isSystemRole = ['admin', 'restaurant', 'bank', 'supplier', 'marketer', 'landspice_employee'].includes(role.name)
        
        return (
          <div className="flex space-x-2 space-x-reverse">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditRole(role)}
            >
              👁️ عرض
            </Button>
            
            {!isSystemRole && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditRole(role)}
                >
                  ✏️ تعديل
                </Button>
                
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteRole(role.id)}
                >
                  🗑️ حذف
                </Button>
              </>
            )}
          </div>
        )
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الأدوار...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إدارة الأدوار والصلاحيات</h1>
                <p className="text-gray-600">
                  إجمالي {roles.length} دور في النظام
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button variant="outline" size="sm">
                  📤 تصدير
                </Button>
                <Button variant="primary" size="sm" onClick={handleCreateRole}>
                  ➕ إضافة دور
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الأدوار"
              value={roles.length}
              icon="👥"
              color="blue"
            />
            
            <StatCard
              title="الأدوار النشطة"
              value={roles.filter(r => r.isActive).length}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="إجمالي المستخدمين"
              value={roles.reduce((sum, role) => sum + role._count.users, 0)}
              icon="👤"
              color="purple"
            />
            
            <StatCard
              title="الأدوار المخصصة"
              value={roles.filter(r => !['admin', 'restaurant', 'bank', 'supplier', 'marketer', 'landspice_employee'].includes(r.name)).length}
              icon="⚙️"
              color="orange"
            />
          </div>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الأدوار</CardTitle>
              <CardDescription>
                إدارة أدوار المستخدمين وصلاحياتهم في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={roles}
                columns={columns}
                searchKey="displayName"
                searchPlaceholder="البحث في الأدوار..."
                emptyMessage="لا توجد أدوار"
                emptyDescription="لم يتم العثور على أي أدوار في النظام"
              />
            </CardContent>
          </Card>
        </main>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {selectedRole ? 'تعديل الدور' : 'إضافة دور جديد'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الدور (تقني)
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="admin, manager, etc"
                      disabled={!!selectedRole}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم المعروض
                    </label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="مدير النظام"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    className="w-full input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر للدور وصلاحياته"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصلاحيات
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      سيتم تحديد الصلاحيات تلقائياً حسب نوع الدور
                    </p>
                    {selectedRole && selectedRole.permissions && (
                      <div className="space-y-2">
                        {Object.entries(selectedRole.permissions).map(([resource, permissions]) => (
                          <div key={resource} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{resource}</span>
                            <div className="flex space-x-1 space-x-reverse">
                              {(permissions as string[]).map(permission => (
                                <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري الحفظ...' : (selectedRole ? 'تحديث' : 'إنشاء')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedComponent>
  )
}
