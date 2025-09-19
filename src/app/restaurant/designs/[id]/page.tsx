'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate } from '@/lib/utils'

interface DesignDetails {
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
  feedback?: string
  version: number
  createdAt: Date
  updatedAt: Date
  timeline: Array<{
    id: string
    action: string
    description: string
    timestamp: Date
    user?: string
  }>
  files: Array<{
    id: string
    name: string
    url: string
    type: string
    size: string
  }>
  tags: string[]
  usageGuidelines?: string
}

export default function DesignDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const designId = params.id as string

  const [designDetails, setDesignDetails] = useState<DesignDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (designId) {
      fetchDesignDetails()
    }
  }, [designId])

  const fetchDesignDetails = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/restaurant/designs/${designId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDesignDetails(data.data)
        }
      } else {
        // بيانات تجريبية مفصلة
        const mockDesignDetails: DesignDetails = {
          id: designId,
          name: 'شعار المطعم الجديد',
          type: 'logo',
          status: 'approved',
          fileUrl: '/designs/logo-new.png',
          thumbnailUrl: '/designs/thumbs/logo-new.jpg',
          description: 'شعار محدث للمطعم بألوان جديدة ومظهر عصري',
          notes: 'يرجى استخدام هذا الشعار في جميع المواد الترويجية الجديدة',
          submittedAt: new Date('2025-01-10T10:00:00'),
          reviewedAt: new Date('2025-01-12T14:30:00'),
          approvedAt: new Date('2025-01-12T15:00:00'),
          reviewer: 'فريق التصميم - لاند سبايس',
          feedback: 'تصميم ممتاز يعكس هوية المطعم بشكل احترافي. تم الاعتماد للاستخدام الفوري.',
          version: 2,
          createdAt: new Date('2025-01-08T09:00:00'),
          updatedAt: new Date('2025-01-12T15:00:00'),
          timeline: [
            {
              id: '1',
              action: 'created',
              description: 'تم إنشاء التصميم كمسودة',
              timestamp: new Date('2025-01-08T09:00:00'),
              user: 'مدير المطعم'
            },
            {
              id: '2',
              action: 'submitted',
              description: 'تم إرسال التصميم للمراجعة',
              timestamp: new Date('2025-01-10T10:00:00'),
              user: 'مدير المطعم'
            },
            {
              id: '3',
              action: 'under_review',
              description: 'بدأت عملية المراجعة من قبل فريق التصميم',
              timestamp: new Date('2025-01-11T09:00:00'),
              user: 'فريق التصميم'
            },
            {
              id: '4',
              action: 'approved',
              description: 'تم اعتماد التصميم بنجاح',
              timestamp: new Date('2025-01-12T15:00:00'),
              user: 'مدير التصميم'
            }
          ],
          files: [
            {
              id: '1',
              name: 'logo-main.png',
              url: '/designs/files/logo-main.png',
              type: 'PNG',
              size: '2.1 MB'
            },
            {
              id: '2',
              name: 'logo-vector.ai',
              url: '/designs/files/logo-vector.ai',
              type: 'AI',
              size: '5.8 MB'
            },
            {
              id: '3',
              name: 'logo-variations.pdf',
              url: '/designs/files/logo-variations.pdf',
              type: 'PDF',
              size: '3.2 MB'
            }
          ],
          tags: ['شعار', 'هوية', 'مطعم', 'جديد'],
          usageGuidelines: 'استخدم هذا الشعار في:\n• جميع المواد المطبوعة\n• المواقع الإلكترونية\n• وسائل التواصل الاجتماعي\n• العبوات والتغليف\n\nتجنب:\n• تغيير الألوان\n• تشويه النسب\n• استخدام خلفيات معقدة'
        }
        setDesignDetails(mockDesignDetails)
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل التصميم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'restaurant') redirect('/auth/signin')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'revision_requested': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'submitted': return 'bg-purple-100 text-purple-800'
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
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return '🎨'
      case 'label': return '🏷️'
      case 'packaging': return '📦'
      case 'promotional': return '📢'
      default: return '🖼️'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'png': case 'jpg': case 'jpeg': return '🖼️'
      case 'pdf': return '📄'
      case 'ai': case 'psd': return '🎨'
      case 'svg': return '🖥️'
      default: return '📎'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل التصميم...</p>
        </div>
      </div>
    )
  }

  if (!designDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">التصميم غير موجود</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على التصميم المطلوب</p>
          <Button onClick={() => router.push('/restaurant/designs')}>
            العودة للتصاميم
          </Button>
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
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button variant="ghost" onClick={() => router.back()}>← العودة</Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getTypeIcon(designDetails.type)} {designDetails.name}
                  </h1>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className={`status-badge ${getStatusColor(designDetails.status)}`}>
                      {getStatusText(designDetails.status)}
                    </span>
                    <span className="text-sm text-gray-500">الإصدار {designDetails.version}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                {designDetails.status === 'approved' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(designDetails.fileUrl, '_blank')}
                  >
                    📥 تحميل
                  </Button>
                )}
                
                {['draft', 'revision_requested'].includes(designDetails.status) && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => router.push(`/restaurant/designs/${designId}/edit`)}
                  >
                    ✏️ تعديل
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Design Preview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>🖼️ معاينة التصميم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={designDetails.thumbnailUrl}
                      alt={designDetails.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSI2NCIgZmlsbD0iIzk0QTNBOCI+8J+WvO+4jzwvdGV4dD4KPC9zdmc+'
                      }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {designDetails.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">العلامات</h4>
                        <div className="flex flex-wrap gap-2">
                          {designDetails.tags.map(tag => (
                            <span key={tag} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>📅 تاريخ الإنشاء: {formatDate(designDetails.createdAt)}</div>
                      {designDetails.submittedAt && (
                        <div>📤 تاريخ الإرسال: {formatDate(designDetails.submittedAt)}</div>
                      )}
                      {designDetails.approvedAt && (
                        <div>✅ تاريخ الاعتماد: {formatDate(designDetails.approvedAt)}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details and Tabs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 space-x-reverse">
                  {[
                    { key: 'details', label: '📋 التفاصيل' },
                    { key: 'files', label: '📁 الملفات' },
                    { key: 'timeline', label: '📅 المتابعة' },
                    { key: 'guidelines', label: '📖 إرشادات الاستخدام' }
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
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <Card>
                  <CardHeader>
                    <CardTitle>📋 تفاصيل التصميم</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">الوصف</h4>
                      <p className="text-gray-900 mt-1">{designDetails.description || 'لا يوجد وصف'}</p>
                    </div>
                    
                    {designDetails.notes && (
                      <div>
                        <h4 className="font-medium text-gray-700">الملاحظات</h4>
                        <p className="text-gray-900 mt-1">{designDetails.notes}</p>
                      </div>
                    )}
                    
                    {designDetails.feedback && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">ملاحظات المراجع</h4>
                        <p className="text-blue-700">{designDetails.feedback}</p>
                        {designDetails.reviewer && (
                          <p className="text-blue-600 text-sm mt-2">- {designDetails.reviewer}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'files' && (
                <Card>
                  <CardHeader>
                    <CardTitle>📁 ملفات التصميم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {designDetails.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                            <div>
                              <div className="font-medium text-gray-900">{file.name}</div>
                              <div className="text-sm text-gray-600">{file.type} • {file.size}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            📥 تحميل
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'timeline' && (
                <Card>
                  <CardHeader>
                    <CardTitle>📅 تتبع مراحل التصميم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityFeed
                      activities={designDetails.timeline.map(item => ({
                        id: item.id,
                        type: item.action === 'approved' ? 'success' : 
                              item.action === 'rejected' ? 'error' : 'info',
                        title: item.description,
                        description: item.user ? `بواسطة: ${item.user}` : undefined,
                        timestamp: item.timestamp
                      }))}
                      maxItems={10}
                    />
                  </CardContent>
                </Card>
              )}

              {activeTab === 'guidelines' && (
                <Card>
                  <CardHeader>
                    <CardTitle>📖 إرشادات الاستخدام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {designDetails.usageGuidelines ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-900 font-sans">
                          {designDetails.usageGuidelines}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📖</div>
                        <p>لا توجد إرشادات استخدام محددة</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
