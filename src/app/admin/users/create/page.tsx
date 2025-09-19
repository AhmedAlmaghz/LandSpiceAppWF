'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent, { usePermissions } from '@/components/auth/ProtectedComponent'

// Types
interface Role {
  id: number
  name: string
  displayName: string
  description?: string
}

interface UserFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  roleId: number
  status: 'active' | 'inactive' | 'suspended'
}

interface FormErrors {
  [key: string]: string
}

export default function CreateUserPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: 0,
    status: 'active'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})

  // جلب الأدوار المتاحة
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRoles(data.data)
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الأدوار:', error)
      // الأدوار الافتراضية
      setRoles([
        { id: 1, name: 'admin', displayName: 'مدير النظام' },
        { id: 2, name: 'restaurant', displayName: 'مطعم' },
        { id: 3, name: 'bank', displayName: 'بنك' },
        { id: 4, name: 'supplier', displayName: 'مورد' },
        { id: 5, name: 'marketer', displayName: 'مسوق' },
        { id: 6, name: 'landspice_employee', displayName: 'موظف لاند سبايس' }
      ])
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

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب'
    } else if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب'
    }

    if (!formData.roleId) {
      newErrors.roleId = 'الدور مطلوب'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // إرسال البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          roleId: formData.roleId,
          status: formData.status
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/admin/users?success=created')
      } else {
        setErrors({ submit: data.error || 'حدث خطأ أثناء إنشاء المستخدم' })
      }
    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error)
      setErrors({ submit: 'حدث خطأ في الاتصال بالخادم' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // تحديث قيم النموذج
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // إزالة رسالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  return (
    <ProtectedComponent roles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إضافة مستخدم جديد</h1>
                <p className="text-gray-600">إنشاء حساب مستخدم جديد في النظام</p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => router.back()}
              >
                ← العودة
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* معلومات أساسية */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات الأساسية</CardTitle>
                    <CardDescription>
                      أدخل البيانات الأساسية للمستخدم الجديد
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* اسم المستخدم */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم المستخدم *
                      </label>
                      <Input
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="أدخل اسم المستخدم"
                        error={!!errors.username}
                      />
                      {errors.username && (
                        <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                      )}
                    </div>

                    {/* البريد الإلكتروني */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@domain.com"
                        error={!!errors.email}
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* الاسم الأول والأخير */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الأول *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="الاسم الأول"
                          error={!!errors.firstName}
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الأخير *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="الاسم الأخير"
                          error={!!errors.lastName}
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* رقم الهاتف */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+967xxxxxxxxx"
                        direction="ltr"
                      />
                    </div>

                    {/* كلمة المرور */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          كلمة المرور *
                        </label>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="كلمة المرور"
                          error={!!errors.password}
                        />
                        {errors.password && (
                          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تأكيد كلمة المرور *
                        </label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="تأكيد كلمة المرور"
                          error={!!errors.confirmPassword}
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* إعدادات الحساب */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الحساب</CardTitle>
                    <CardDescription>
                      تحديد دور المستخدم وحالة الحساب
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* الدور */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الدور *
                      </label>
                      <select
                        className="w-full input"
                        value={formData.roleId}
                        onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
                      >
                        <option value={0}>اختر الدور</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {getRoleIcon(role.name)} {role.displayName}
                          </option>
                        ))}
                      </select>
                      {errors.roleId && (
                        <p className="text-red-600 text-sm mt-1">{errors.roleId}</p>
                      )}
                    </div>

                    {/* حالة الحساب */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة الحساب
                      </label>
                      <select
                        className="w-full input"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="suspended">موقوف</option>
                      </select>
                    </div>

                    {/* معلومات إضافية */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">ملاحظة</h4>
                      <p className="text-sm text-blue-700">
                        سيتم إنشاء الكيان المرتبط تلقائياً حسب نوع الدور (مطعم، بنك، مورد، إلخ)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* أزرار الإجراءات */}
                <div className="mt-6 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        ✅ إنشاء المستخدم
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                </div>

                {/* رسائل الخطأ العامة */}
                {errors.submit && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </ProtectedComponent>
  )
}
