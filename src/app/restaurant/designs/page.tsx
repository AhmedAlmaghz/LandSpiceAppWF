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
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate } from '@/lib/utils'

// Types
interface Design {
  id: string
  name: string
  type: 'logo' | 'label' | 'packaging' | 'promotional'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_requested'
  fileUrl?: string
  thumbnailUrl?: string
  description?: string
  notes?: string
  submittedAt?: Date
  reviewedAt?: Date
  approvedAt?: Date
  reviewer?: string
  version: number
  createdAt: Date
  updatedAt: Date
}

interface DesignStats {
  total: number
  approved: number
  underReview: number
  rejected: number
  draft: number
}

export default function RestaurantDesignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [stats, setStats] = useState<DesignStats>({
    total: 0,
    approved: 0,
    underReview: 0,
    rejected: 0,
    draft: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchDesigns()
  }, [])

  const fetchDesigns = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/restaurant/designs')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDesigns(data.data.designs)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية
        const mockDesigns: Design[] = [
          {
            id: '1',
            name: 'شعار المطعم الجديد',
            type: 'logo',
            status: 'approved',
            fileUrl: '/uploads/designs/logo-v2.png',
            thumbnailUrl: '/uploads/designs/thumbnails/logo-v2.png',
            description: 'شعار محدث للمطعم بألوان جديدة',
            submittedAt: new Date('2025-01-10'),
            reviewedAt: new Date('2025-01-12'),
            approvedAt: new Date('2025-01-12'),
            reviewer: 'فريق التصميم - لاند سبايس',
            version: 2,
            createdAt: new Date('2025-01-08'),
            updatedAt: new Date('2025-01-12')
          },
          {
            id: '2',
            name: 'ملصق عبوة الكاتشب',
            type: 'label',
            status: 'under_review',
            fileUrl: '/uploads/designs/ketchup-label.pdf',
            thumbnailUrl: '/uploads/designs/thumbnails/ketchup-label.jpg',
            description: 'تصميم ملصق جديد لعبوات الكاتشب 500مل',
            submittedAt: new Date('2025-01-15'),
            reviewer: 'قسم الجودة',
            version: 1,
            createdAt: new Date('2025-01-14'),
            updatedAt: new Date('2025-01-15')
          },
          {
            id: '3',
            name: 'تغليف العبوات الجديد',
            type: 'packaging',
            status: 'revision_requested',
            fileUrl: '/uploads/designs/packaging-v1.ai',
            thumbnailUrl: '/uploads/designs/thumbnails/packaging-v1.jpg',
            description: 'تصميم تغليف جديد للعبوات الكبيرة',
            notes: 'يرجى تعديل الألوان لتتماشى مع هوية العلامة التجارية',
            submittedAt: new Date('2025-01-12'),
            reviewedAt: new Date('2025-01-14'),
            reviewer: 'مدير التسويق',
            version: 1,
            createdAt: new Date('2025-01-11'),
            updatedAt: new Date('2025-01-14')
          },
          {
            id: '4',
            name: 'إعلان ترويجي',
            type: 'promotional',
            status: 'draft',
            description: 'مادة إعلانية للحملة الترويجية الجديدة',
            version: 1,
            createdAt: new Date('2025-01-16'),
            updatedAt: new Date('2025-01-16')
          }
        ]

        setDesigns(mockDesigns)
        
        // حساب الإحصائيات
        const total = mockDesigns.length
        const approved = mockDesigns.filter(d => d.status === 'approved').length
        const underReview = mockDesigns.filter(d => d.status === 'under_review').length
        const rejected = mockDesigns.filter(d => d.status === 'rejected').length
        const draft = mockDesigns.filter(d => d.status === 'draft').length

        setStats({
          total,
          approved,
          underReview,
          rejected,
          draft
        })
      }
    } catch (error) {
      console.error('خطأ في جلب التصاميم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // التحقق من صلاحية المطعم
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'restaurant') {
    redirect('/auth/signin')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'revision_requested': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'submitted': return 'bg-purple-100 text-purple-800'
      case 'unknown': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '✅ معتمد'
      case 'under_review': return '👁️ قيد المراجعة'
      case 'revision_requested': return '📝 مطلوب تعديل'
      case 'rejected': return '❌ مرفوض'
      case 'submitted': return '📤 مُرسل'
      case 'draft': return '📄 مسودة'
      case 'unknown': return '❓ غير محدد'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return '🎨'
      case 'label': return '🏷️'
      case 'packaging': return '📦'
      case 'promotional': return '📢'
      case 'unknown': return '❓'
      default: return '🖼️'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'logo': return 'شعار'
      case 'label': return 'ملصق'
      case 'packaging': return 'تغليف'
      case 'promotional': return 'ترويجي'
      case 'unknown': return 'غير محدد'
      default: return type
    }
  }

  // تصفية التصاميم حسب التبويب
  const filteredDesigns = designs.filter(design => {
    if (activeTab === 'all') return true
    return design.status === activeTab
  })

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'design',
      label: 'التصميم',
      render: (design: Design) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {design?.thumbnailUrl ? (
              <img 
                src={design.thumbnailUrl} 
                alt={design?.name || 'تصميم'}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl">{getTypeIcon(design?.type || 'unknown')}</span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{design?.name || 'غير محدد'}</div>
            <div className="text-sm text-gray-500">
              {getTypeText(design?.type || 'unknown')} - الإصدار {design?.version || '1'}
            </div>
            {design?.description && (
              <div className="text-xs text-gray-400 mt-1">
                {design.description.substring(0, 50)}...
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (design: Design) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(design?.status || 'unknown')}`}>
            {getStatusText(design?.status || 'unknown')}
          </span>
          {design?.submittedAt && (
            <div className="text-xs text-gray-500 mt-1">
              مُرسل: {formatDate(design.submittedAt)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'reviewer',
      label: 'المراجع',
      render: (design: Design) => (
        <div className="text-sm">
          {design?.reviewer ? (
            <div>
              <div className="font-medium">{design.reviewer}</div>
              {design?.reviewedAt && (
                <div className="text-gray-500">
                  {formatDate(design.reviewedAt)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">لم يُراجع بعد</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (design: Design) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/restaurant/designs/${design?.id || ''}`)}
            disabled={!design?.id}
          >
            👁️ عرض
          </Button>
          
          {design?.fileUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(design.fileUrl, '_blank')}
            >
              📥 تحميل
            </Button>
          )}
          
          {['draft', 'revision_requested'].includes(design?.status || '') && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push(`/restaurant/designs/${design?.id || ''}/edit`)}
              disabled={!design?.id}
            >
              ✏️ تعديل
            </Button>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التصاميم...</p>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-900">🎨 إدارة التصاميم</h1>
                <p className="text-gray-600">
                  إجمالي {stats.total} تصميم، {stats.approved} معتمد
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/restaurant/designs/gallery')}
                >
                  🖼️ المعرض
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/restaurant/designs/upload')}
                >
                  ⬆️ رفع تصميم
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="إجمالي التصاميم"
              value={stats.total}
              icon="🎨"
              color="blue"
              onClick={() => setActiveTab('all')}
            />
            
            <StatCard
              title="معتمد"
              value={stats.approved}
              icon="✅"
              color="green"
              onClick={() => setActiveTab('approved')}
            />
            
            <StatCard
              title="قيد المراجعة"
              value={stats.underReview}
              icon="👁️"
              color="blue"
              onClick={() => setActiveTab('under_review')}
            />
            
            <StatCard
              title="مطلوب تعديل"
              value={stats.rejected}
              icon="📝"
              color="yellow"
              onClick={() => setActiveTab('revision_requested')}
            />
            
            <StatCard
              title="مسودات"
              value={stats.draft}
              icon="📄"
              color="gray"
              onClick={() => setActiveTab('draft')}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                {[
                  { key: 'all', label: '🎨 جميع التصاميم', count: stats.total },
                  { key: 'approved', label: '✅ معتمد', count: stats.approved },
                  { key: 'under_review', label: '👁️ قيد المراجعة', count: stats.underReview },
                  { key: 'revision_requested', label: '📝 مطلوب تعديل', count: stats.rejected },
                  { key: 'draft', label: '📄 مسودات', count: stats.draft }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Designs Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة التصاميم</CardTitle>
              <CardDescription>
                جميع تصاميمك مع حالاتها ومراحل المراجعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredDesigns}
                columns={columns}
                searchKey="name"
                emptyMessage="لا توجد تصاميم"
                emptyDescription={
                  activeTab === 'all' 
                    ? "لم يتم رفع أي تصاميم بعد"
                    : `لا توجد تصاميم بحالة "${getStatusText(activeTab)}"`
                }
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
