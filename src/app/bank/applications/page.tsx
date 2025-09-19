'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface Application {
  id: string
  applicationNumber: string
  restaurantName: string
  businessLicense: string
  type: 'new_partnership' | 'credit_facility' | 'guarantee_request' | 'installment_plan'
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'on_hold'
  priority: 'high' | 'medium' | 'low'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  requestedAmount: number
  creditScore: number
  riskRating: 'low' | 'medium' | 'high'
  documents: Array<{
    id: string
    name: string
    type: string
    status: 'pending' | 'verified' | 'rejected'
  }>
  businessInfo: {
    establishedYear: number
    monthlyRevenue: number
    employeeCount: number
    location: string
  }
  contactInfo: {
    ownerName: string
    phone: string
    email: string
  }
  notes?: string
}

interface ApplicationStats {
  totalApplications: number
  pendingReview: number
  approved: number
  rejected: number
  averageProcessingTime: number
  approvalRate: number
}

export default function BankApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    averageProcessingTime: 0,
    approvalRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    priority: '',
    riskRating: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/bank/applications')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApplications(data.data.applications)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockApplications: Application[] = [
          {
            id: '1',
            applicationNumber: 'APP-2025-001',
            restaurantName: 'مطعم الأصالة اليمنية',
            businessLicense: 'BL-2025-015',
            type: 'new_partnership',
            status: 'pending',
            priority: 'high',
            submittedAt: new Date('2025-01-20'),
            requestedAmount: 500000,
            creditScore: 720,
            riskRating: 'low',
            documents: [
              { id: '1', name: 'السجل التجاري', type: 'business_license', status: 'verified' },
              { id: '2', name: 'البيانات المالية', type: 'financial_statements', status: 'pending' },
              { id: '3', name: 'إثبات العنوان', type: 'address_proof', status: 'verified' }
            ],
            businessInfo: {
              establishedYear: 2020,
              monthlyRevenue: 250000,
              employeeCount: 15,
              location: 'صنعاء، اليمن'
            },
            contactInfo: {
              ownerName: 'أحمد محمد الزبيري',
              phone: '+967 1 234 567',
              email: 'ahmed@asala-restaurant.com'
            },
            notes: 'مطعم متخصص في الأكلات اليمنية التراثية'
          },
          {
            id: '2',
            applicationNumber: 'APP-2025-002',
            restaurantName: 'مطعم البحر الأحمر',
            businessLicense: 'BL-2025-016',
            type: 'credit_facility',
            status: 'under_review',
            priority: 'medium',
            submittedAt: new Date('2025-01-18'),
            reviewedAt: new Date('2025-01-19'),
            reviewedBy: 'محمد أحمد القاسمي',
            requestedAmount: 300000,
            creditScore: 680,
            riskRating: 'medium',
            documents: [
              { id: '4', name: 'السجل التجاري', type: 'business_license', status: 'verified' },
              { id: '5', name: 'كشف حساب بنكي', type: 'bank_statements', status: 'verified' },
              { id: '6', name: 'تقرير الضرائب', type: 'tax_reports', status: 'pending' }
            ],
            businessInfo: {
              establishedYear: 2018,
              monthlyRevenue: 180000,
              employeeCount: 12,
              location: 'الحديدة، اليمن'
            },
            contactInfo: {
              ownerName: 'فايز علي الحدادي',
              phone: '+967 3 456 789',
              email: 'fayz@redseaRestaurant.com'
            },
            notes: 'متخصص في المأكولات البحرية'
          },
          {
            id: '3',
            applicationNumber: 'APP-2025-003',
            restaurantName: 'مطعم الجبل الأخضر',
            businessLicense: 'BL-2024-089',
            type: 'guarantee_request',
            status: 'approved',
            priority: 'low',
            submittedAt: new Date('2025-01-15'),
            reviewedAt: new Date('2025-01-17'),
            reviewedBy: 'سارة محمد باصرة',
            requestedAmount: 150000,
            creditScore: 750,
            riskRating: 'low',
            documents: [
              { id: '7', name: 'السجل التجاري', type: 'business_license', status: 'verified' },
              { id: '8', name: 'عقد الإيجار', type: 'lease_agreement', status: 'verified' },
              { id: '9', name: 'تأمينات اجتماعية', type: 'social_insurance', status: 'verified' }
            ],
            businessInfo: {
              establishedYear: 2017,
              monthlyRevenue: 120000,
              employeeCount: 8,
              location: 'إب، اليمن'
            },
            contactInfo: {
              ownerName: 'خالد أحمد المقطري',
              phone: '+967 4 567 890',
              email: 'khalid@greenhill-restaurant.com'
            }
          },
          {
            id: '4',
            applicationNumber: 'APP-2025-004',
            restaurantName: 'مطعم النخيل الذهبي',
            businessLicense: 'BL-2024-156',
            type: 'installment_plan',
            status: 'rejected',
            priority: 'medium',
            submittedAt: new Date('2025-01-12'),
            reviewedAt: new Date('2025-01-16'),
            reviewedBy: 'علي حسن الشامي',
            requestedAmount: 800000,
            creditScore: 580,
            riskRating: 'high',
            documents: [
              { id: '10', name: 'السجل التجاري', type: 'business_license', status: 'verified' },
              { id: '11', name: 'البيانات المالية', type: 'financial_statements', status: 'rejected' },
              { id: '12', name: 'ضمانات إضافية', type: 'collateral', status: 'pending' }
            ],
            businessInfo: {
              establishedYear: 2021,
              monthlyRevenue: 85000,
              employeeCount: 6,
              location: 'تعز، اليمن'
            },
            contactInfo: {
              ownerName: 'ناصر عبدالله الحميري',
              phone: '+967 4 789 012',
              email: 'nasser@goldpalm-restaurant.com'
            },
            notes: 'تم الرفض بسبب عدم كفاية الضمانات'
          }
        ]

        setApplications(mockApplications)
        
        // حساب الإحصائيات
        const totalApplications = mockApplications.length
        const pendingReview = mockApplications.filter(app => app.status === 'pending' || app.status === 'under_review').length
        const approved = mockApplications.filter(app => app.status === 'approved').length
        const rejected = mockApplications.filter(app => app.status === 'rejected').length
        const approvalRate = (approved / totalApplications) * 100
        const averageProcessingTime = 3.5

        setStats({
          totalApplications,
          pendingReview,
          approved,
          rejected,
          averageProcessingTime,
          approvalRate
        })
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // التحقق من صلاحية البنك
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'bank') {
    redirect('/auth/signin')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '✅ موافق عليه'
      case 'pending': return '⏳ في الانتظار'
      case 'under_review': return '👁️ قيد المراجعة'
      case 'rejected': return '❌ مرفوض'
      case 'on_hold': return '⏸️ معلق'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 عالي'
      case 'medium': return '🟡 متوسط'
      case 'low': return '🟢 منخفض'
      default: return priority
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_partnership': return '🤝'
      case 'credit_facility': return '💳'
      case 'guarantee_request': return '🛡️'
      case 'installment_plan': return '💰'
      default: return '📋'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'new_partnership': return 'شراكة جديدة'
      case 'credit_facility': return 'تسهيل ائتماني'
      case 'guarantee_request': return 'طلب ضمانة'
      case 'installment_plan': return 'خطة تقسيط'
      default: return type
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'high': return '⚠️ عالي'
      case 'medium': return '⚡ متوسط'
      case 'low': return '✅ منخفض'
      default: return risk
    }
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'application',
      label: 'الطلب',
      render: (application: Application) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{application.applicationNumber}</div>
          <div className="text-sm text-gray-500">{application.restaurantName}</div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-lg">{getTypeIcon(application.type)}</span>
            <span className="text-xs text-gray-600">{getTypeText(application.type)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'المبلغ والتقييم',
      render: (application: Application) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {formatCurrency(application.requestedAmount)}
          </div>
          <div className="text-sm text-gray-600">
            نقاط ائتمانية: {application.creditScore}
          </div>
          <span className={`status-badge text-xs ${getRiskColor(application.riskRating)}`}>
            {getRiskText(application.riskRating)}
          </span>
        </div>
      )
    },
    {
      key: 'business',
      label: 'معلومات العمل',
      render: (application: Application) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{application.contactInfo.ownerName}</div>
          <div className="text-gray-600">{application.businessInfo.location}</div>
          <div className="text-gray-500">
            تأسس: {application.businessInfo.establishedYear}
          </div>
          <div className="text-green-600">
            إيرادات: {formatCurrency(application.businessInfo.monthlyRevenue)}/شهر
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة والأولوية',
      render: (application: Application) => (
        <div className="text-center space-y-2">
          <span className={`status-badge ${getStatusColor(application.status)}`}>
            {getStatusText(application.status)}
          </span>
          <div>
            <span className={`status-badge text-xs ${getPriorityColor(application.priority)}`}>
              {getPriorityText(application.priority)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(application.submittedAt)}
          </div>
        </div>
      )
    },
    {
      key: 'documents',
      label: 'المستندات',
      render: (application: Application) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {application.documents.length} مستند
          </div>
          <div className="text-xs text-green-600">
            {application.documents.filter(d => d.status === 'verified').length} تم التحقق
          </div>
          <div className="text-xs text-yellow-600">
            {application.documents.filter(d => d.status === 'pending').length} معلق
          </div>
          <div className="text-xs text-red-600">
            {application.documents.filter(d => d.status === 'rejected').length} مرفوض
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (application: Application) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/bank/applications/${application.id}`)}
          >
            👁️ مراجعة
          </Button>
          
          {application.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => {/* الموافقة السريعة */}}
              >
                ✅ موافقة
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {/* الرفض السريع */}}
              >
                ❌ رفض
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل طلبات المطاعم...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['bank']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📋 مراجعة طلبات المطاعم</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalApplications} طلب، {stats.pendingReview} يحتاج مراجعة
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/bank/applications/risk-assessment')}
                >
                  ⚠️ تقييم المخاطر
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/bank/applications/reports')}
                >
                  📊 تقارير الطلبات
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Pending Applications Alert */}
          {stats.pendingReview > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">📋</span>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-yellow-800">طلبات تحتاج مراجعة عاجلة</h3>
                  <p className="text-sm text-yellow-700">
                    يوجد {stats.pendingReview} طلب يحتاج مراجعة وموافقة.
                  </p>
                </div>
                <div className="mr-auto">
                  <Button 
                    variant="warning" 
                    size="sm"
                    onClick={() => {/* فلتر المعلقة */}}
                  >
                    عرض المعلقة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الطلبات"
              value={stats.totalApplications}
              icon="📋"
              color="blue"
            />
            
            <StatCard
              title="يحتاج مراجعة"
              value={stats.pendingReview}
              icon="⏳"
              color="yellow"
            />
            
            <StatCard
              title="موافق عليها"
              value={stats.approved}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="معدل الموافقة"
              value={`${stats.approvalRate.toFixed(1)}%`}
              icon="📊"
              color="purple"
            />
          </div>

          {/* Processing Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="متوسط وقت المعالجة"
              value={`${stats.averageProcessingTime} أيام`}
              icon="⏱️"
              color="orange"
            />
            
            <StatCard
              title="طلبات مرفوضة"
              value={stats.rejected}
              icon="❌"
              color="red"
            />
            
            <StatCard
              title="كفاءة المعالجة"
              value="95.2%"
              icon="📈"
              color="green"
            />
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <AdvancedSearch
                onSearch={(searchParams: any) => setFilters(prev => ({ ...prev, ...searchParams }))}
                filters={[
                  {
                    key: 'search',
                    type: 'text',
                    placeholder: 'البحث في الطلبات...',
                    label: 'البحث العام'
                  },
                  {
                    key: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'pending', label: 'في الانتظار' },
                      { value: 'under_review', label: 'قيد المراجعة' },
                      { value: 'approved', label: 'موافق عليه' },
                      { value: 'rejected', label: 'مرفوض' },
                      { value: 'on_hold', label: 'معلق' }
                    ]
                  },
                  {
                    key: 'type',
                    type: 'select',
                    label: 'نوع الطلب',
                    options: [
                      { value: '', label: 'جميع الأنواع' },
                      { value: 'new_partnership', label: 'شراكة جديدة' },
                      { value: 'credit_facility', label: 'تسهيل ائتماني' },
                      { value: 'guarantee_request', label: 'طلب ضمانة' },
                      { value: 'installment_plan', label: 'خطة تقسيط' }
                    ]
                  },
                  {
                    key: 'priority',
                    type: 'select',
                    label: 'الأولوية',
                    options: [
                      { value: '', label: 'جميع الأولويات' },
                      { value: 'high', label: 'عالي' },
                      { value: 'medium', label: 'متوسط' },
                      { value: 'low', label: 'منخفض' }
                    ]
                  },
                  {
                    key: 'riskRating',
                    type: 'select',
                    label: 'تقييم المخاطر',
                    options: [
                      { value: '', label: 'جميع المستويات' },
                      { value: 'low', label: 'منخفض' },
                      { value: 'medium', label: 'متوسط' },
                      { value: 'high', label: 'عالي' }
                    ]
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedApplications.length} طلب
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="success">
                      ✅ موافقة جماعية
                    </Button>
                    <Button size="sm" variant="danger">
                      ❌ رفض جماعي
                    </Button>
                    <Button size="sm" variant="outline">
                      📤 تصدير المحددة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة طلبات المطاعم</CardTitle>
              <CardDescription>
                جميع الطلبات مع حالاتها ومعلومات المراجعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={applications}
                columns={columns}
                searchKey="applicationNumber"
                onSelectionChange={setSelectedApplications}
                selectedItems={selectedApplications}
                emptyMessage="لا توجد طلبات"
                emptyDescription="لم يتم تقديم أي طلبات بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
