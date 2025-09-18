'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils'

// Types
interface User {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  role: {
    id: number
    name: string
    displayName: string
  }
  status: string
  isVerified: boolean
  createdAt: Date
  lastLoginAt?: Date
  restaurant?: {
    id: string
    name: string
    status: string
  }
}

interface UserFilters {
  search: string
  role: string
  status: string
}

export default function UsersManagementPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: ''
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // التحقق من صلاحية المدير
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.roleName !== 'admin') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, filters])

  const fetchUsers = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@landspace.com',
          firstName: 'مدير',
          lastName: 'النظام',
          role: { id: 1, name: 'admin', displayName: 'مدير النظام' },
          status: 'active',
          isVerified: true,
          createdAt: new Date('2025-01-01'),
          lastLoginAt: new Date()
        },
        {
          id: '2',
          username: 'albaik_rest',
          email: 'manager@albaik.com',
          firstName: 'مطعم',
          lastName: 'البيك',
          phone: '+966501234567',
          role: { id: 2, name: 'restaurant', displayName: 'مطعم' },
          status: 'active',
          isVerified: true,
          createdAt: new Date('2025-01-10'),
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          restaurant: {
            id: 'r1',
            name: 'مطعم البيك',
            status: 'active'
          }
        },
        {
          id: '3',
          username: 'alqasemi_bank',
          email: 'bank@alqasemi.com',
          firstName: 'بنك',
          lastName: 'القاسمي',
          role: { id: 3, name: 'bank', displayName: 'بنك' },
          status: 'active',
          isVerified: true,
          createdAt: new Date('2025-01-05'),
          lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '4',
          username: 'print_supplier',
          email: 'orders@printsupplier.com',
          firstName: 'مؤسسة',
          lastName: 'الطباعة المتقدمة',
          role: { id: 4, name: 'supplier', displayName: 'مورد' },
          status: 'active',
          isVerified: true,
          createdAt: new Date('2025-01-08'),
          lastLoginAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          id: '5',
          username: 'ahmed_marketer',
          email: 'ahmed@landspace.com',
          firstName: 'أحمد',
          lastName: 'المسوق',
          phone: '+966505678901',
          role: { id: 5, name: 'marketer', displayName: 'مسوق' },
          status: 'active',
          isVerified: true,
          createdAt: new Date('2025-01-12')
        },
        {
          id: '6',
          username: 'new_restaurant',
          email: 'info@newrest.com',
          firstName: 'مطعم',
          lastName: 'جديد',
          role: { id: 2, name: 'restaurant', displayName: 'مطعم' },
          status: 'inactive',
          isVerified: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          restaurant: {
            id: 'r2',
            name: 'مطعم جديد',
            status: 'pending'
          }
        }
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (filters.search) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role.name === filters.role)
    }

    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    setFilteredUsers(filtered)
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'verify' | 'delete') => {
    try {
      // محاكاة API call
      console.log(`تنفيذ ${action} للمستخدم ${userId}`)
      
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            switch (action) {
              case 'activate':
                return { ...user, status: 'active' }
              case 'deactivate':
                return { ...user, status: 'inactive' }
              case 'verify':
                return { ...user, isVerified: true }
              case 'delete':
                return user // سيتم إزالته من القائمة
              default:
                return user
            }
          }
          return user
        }).filter(user => action !== 'delete' || user.id !== userId)
      )
    } catch (error) {
      console.error(`خطأ في ${action}:`, error)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return
    
    try {
      console.log(`تنفيذ ${action} للمستخدمين:`, selectedUsers)
      // تنفيذ العملية على المستخدمين المحددين
      setSelectedUsers([])
    } catch (error) {
      console.error(`خطأ في العملية الجماعية:`, error)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    )
  }

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, string> = {
      admin: '👑',
      restaurant: '🏪',
      bank: '🏦',
      supplier: '📦',
      marketer: '📈',
      landspace_staff: '👥'
    }
    return icons[roleName] || '👤'
  }

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'لم يدخل مطلقاً'
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return 'منذ لحظات'
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    
    const diffInDays = Math.floor(diffInMinutes / 1440)
    return `منذ ${diffInDays} يوم`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
              <p className="text-gray-600">
                إجمالي {users.length} مستخدم، يظهر {filteredUsers.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm">
                📤 تصدير
              </Button>
              <Button variant="primary" size="sm">
                ➕ إضافة مستخدم
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="البحث (اسم المستخدم، البريد، الاسم)"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              
              <select
                className="input"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">جميع الأدوار</option>
                <option value="admin">مدير النظام</option>
                <option value="restaurant">مطعم</option>
                <option value="bank">بنك</option>
                <option value="supplier">مورد</option>
                <option value="marketer">مسوق</option>
                <option value="landspace_staff">موظف لاند سبايس</option>
              </select>
              
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="suspended">موقوف</option>
              </select>
              
              <Button variant="secondary" onClick={() => setFilters({ search: '', role: '', status: '' })}>
                🔄 مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  تم تحديد {selectedUsers.length} مستخدم
                </span>
                <div className="flex space-x-2 space-x-reverse">
                  <Button size="sm" variant="success" onClick={() => handleBulkAction('activate')}>
                    ✅ تفعيل
                  </Button>
                  <Button size="sm" variant="warning" onClick={() => handleBulkAction('deactivate')}>
                    ⏸️ إلغاء تفعيل
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>
                    🗑️ حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr className="table-row">
                    <th className="table-head">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectAllUsers}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="table-head">المستخدم</th>
                    <th className="table-head">الدور</th>
                    <th className="table-head">الحالة</th>
                    <th className="table-head">آخر دخول</th>
                    <th className="table-head">تاريخ التسجيل</th>
                    <th className="table-head">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td className="table-cell">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-medium text-sm">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex items-center">
                          <span className="ml-2 text-lg">{getRoleIcon(user.role.name)}</span>
                          <span className="text-sm font-medium">{user.role.displayName}</span>
                        </div>
                        {user.restaurant && (
                          <div className="text-xs text-gray-500 mt-1">
                            🏪 {user.restaurant.name}
                          </div>
                        )}
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex flex-col space-y-1">
                          <span className={`status-badge ${getStatusColor(user.status)}`}>
                            {getStatusText(user.status)}
                          </span>
                          {!user.isVerified && (
                            <span className="status-badge bg-yellow-100 text-yellow-800 text-xs">
                              غير مُحقق
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="table-cell">
                        <span className="text-sm text-gray-600">
                          {formatLastLogin(user.lastLoginAt)}
                        </span>
                      </td>
                      
                      <td className="table-cell">
                        <span className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      
                      <td className="table-cell">
                        <div className="flex space-x-2 space-x-reverse">
                          {user.status === 'inactive' && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleUserAction(user.id, 'activate')}
                            >
                              تفعيل
                            </Button>
                          )}
                          
                          {user.status === 'active' && (
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleUserAction(user.id, 'deactivate')}
                            >
                              إيقاف
                            </Button>
                          )}
                          
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleUserAction(user.id, 'verify')}
                            >
                              تحقق
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                          >
                            ⋮
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600">
                  لم يتم العثور على مستخدمين يطابقون معايير البحث
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
