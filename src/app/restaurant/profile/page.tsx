'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

interface RestaurantProfile {
  id: string
  name: string
  legalName: string
  description: string
  phone: string
  email: string
  address: {
    street: string
    city: string
    region: string
    country: string
  }
  manager: {
    name: string
    position: string
    phone: string
    email: string
  }
  business: {
    registrationNumber: string
    taxId: string
    establishedDate: Date
    cuisineType: string[]
    capacity: number
  }
  landspice: {
    partnerSince: Date
    accountManager: string
    contractId: string
    monthlySpending: number
    preferredProducts: string[]
  }
}

export default function RestaurantProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<RestaurantProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      
      // بيانات تجريبية يمنية
      const mockProfile: RestaurantProfile = {
        id: 'rest-001',
        name: 'مطعم البركة الشعبي',
        legalName: 'مؤسسة البركة للمأكولات الشعبية',
        description: 'مطعم شعبي يمني متخصص في تقديم أشهى المأكولات اليمنية التقليدية',
        phone: '+967-1-234567',
        email: 'info@albaraka-restaurant.ye',
        address: {
          street: 'شارع الستين - بجوار مجمع الستين التجاري',
          city: 'صنعاء',
          region: 'أمانة العاصمة',
          country: 'اليمن'
        },
        manager: {
          name: 'عبدالرحمن أحمد الشامي',
          position: 'المدير العام والمالك',
          phone: '+967-1-234567',
          email: 'manager@albaraka-restaurant.ye'
        },
        business: {
          registrationNumber: 'EST-2024-001234',
          taxId: 'TAX-YE-001234567',
          establishedDate: new Date('2024-01-15'),
          cuisineType: ['يمني', 'عربي', 'شعبي'],
          capacity: 80
        },
        landspice: {
          partnerSince: new Date('2024-01-15'),
          accountManager: 'أحمد محمد الحكيمي',
          contractId: 'LS-REST-2025-001',
          monthlySpending: 12000,
          preferredProducts: ['توابل مشكلة', 'صلصة طماطم', 'بهارات مطبخ']
        }
      }

      setProfile(mockProfile)
      setEditForm(mockProfile)
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setProfile(editForm)
      setIsEditing(false)
      alert('تم حفظ التغييرات بنجاح')
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error)
      alert('حدث خطأ في حفظ البيانات')
    }
  }

  const updateField = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const updateNestedField = (parent: string, field: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'restaurant') redirect('/auth/signin')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المطعم...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد بيانات</h3>
            <p className="text-gray-600 mb-6">لم يتم العثور على بيانات المطعم</p>
            <Button onClick={() => router.push('/restaurant/dashboard')}>
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['restaurant']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">👤 الملف الشخصي</h1>
                <p className="text-gray-600">إدارة معلومات المطعم والإعدادات</p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      إلغاء
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                      💾 حفظ التغييرات
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                    ✏️ تعديل المعلومات
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Restaurant Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                  🍽️
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-red-100 mt-1">{profile.legalName}</p>
                  <div className="flex items-center space-x-2 space-x-reverse mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      ⭐ مطعم مميز
                    </span>
                    <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm">
                      ✅ نشط
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المطعم</label>
                  <Input
                    value={isEditing ? editForm.name : profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم القانوني</label>
                  <Input
                    value={isEditing ? editForm.legalName : profile.legalName}
                    onChange={(e) => updateField('legalName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف المطعم</label>
                  <textarea
                    value={isEditing ? editForm.description : profile.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعة</label>
                  <Input
                    type="number"
                    value={isEditing ? editForm.business?.capacity : profile.business.capacity}
                    onChange={(e) => updateNestedField('business', 'capacity', parseInt(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <Input
                    value={isEditing ? editForm.phone : profile.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={isEditing ? editForm.email : profile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <Input
                    value={isEditing ? editForm.address?.street : profile.address.street}
                    onChange={(e) => updateNestedField('address', 'street', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                    <Input
                      value={isEditing ? editForm.address?.city : profile.address.city}
                      onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
                    <Input
                      value={isEditing ? editForm.address?.region : profile.address.region}
                      onChange={(e) => updateNestedField('address', 'region', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manager Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات المدير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المدير</label>
                  <Input
                    value={isEditing ? editForm.manager?.name : profile.manager.name}
                    onChange={(e) => updateNestedField('manager', 'name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المنصب</label>
                  <Input
                    value={isEditing ? editForm.manager?.position : profile.manager.position}
                    onChange={(e) => updateNestedField('manager', 'position', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">هاتف المدير</label>
                  <Input
                    value={isEditing ? editForm.manager?.phone : profile.manager.phone}
                    onChange={(e) => updateNestedField('manager', 'phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">بريد المدير</label>
                  <Input
                    type="email"
                    value={isEditing ? editForm.manager?.email : profile.manager.email}
                    onChange={(e) => updateNestedField('manager', 'email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات التجارية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم السجل التجاري</label>
                  <Input value={profile.business.registrationNumber} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي</label>
                  <Input value={profile.business.taxId} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ التأسيس</label>
                  <Input value={formatDate(profile.business.establishedDate)} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع المطبخ</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.business.cuisineType.map((type, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LandSpice Partnership */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>الشراكة مع لاند سبايس</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">تاريخ بداية الشراكة</h4>
                    <p className="text-gray-600">{formatDate(profile.landspice.partnerSince)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">مدير الحساب</h4>
                    <p className="text-gray-600">{profile.landspice.accountManager}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">رقم العقد</h4>
                    <p className="text-gray-600">{profile.landspice.contractId}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">الإنفاق الشهري</h4>
                    <p className="text-green-600 font-medium">{formatCurrency(profile.landspice.monthlySpending)}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">المنتجات المفضلة</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.landspice.preferredProducts.map((product, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card className="mt-8">
            <CardContent className="py-6">
              <div className="flex justify-center space-x-4 space-x-reverse">
                <Button variant="outline" onClick={() => router.push('/restaurant/contract')}>
                  📝 عرض العقد
                </Button>
                <Button variant="outline" onClick={() => router.push('/restaurant/support')}>
                  📞 تواصل مع الدعم
                </Button>
                <Button variant="primary" onClick={() => router.push('/restaurant/dashboard')}>
                  📊 العودة للوحة التحكم
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
