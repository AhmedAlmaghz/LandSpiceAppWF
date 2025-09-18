'use client'

import React, { useState, useEffect } from 'react'
import { DesignRequest, Designer } from '@/lib/design/types'
import { designService } from '@/lib/design/design-service'
import DesignRequestCard from './DesignRequestCard'
import StatCard from '@/components/dashboard/StatCard'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface DesignerDashboardProps {
  designerId: string
  designerName: string
}

export default function DesignerDashboard({ designerId, designerName }: DesignerDashboardProps) {
  const [assignedRequests, setAssignedRequests] = useState<DesignRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<DesignRequest[]>([])
  const [completedRequests, setCompletedRequests] = useState<DesignRequest[]>([])
  const [designerInfo, setDesignerInfo] = useState<Designer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'assigned' | 'pending' | 'completed' | 'profile'>('assigned')

  // Performance metrics
  const [monthlyStats, setMonthlyStats] = useState({
    completedProjects: 0,
    averageRating: 0,
    onTimeDeliveryRate: 0,
    clientSatisfactionRate: 0,
    totalRevenue: 0,
    averageCompletionTime: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [designerId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Get designer info
      const designers = designService.getDesigners()
      const designer = designers.find(d => d.id === designerId)
      setDesignerInfo(designer || null)

      // Get design requests
      const { requests } = await designService.getDesignRequests(
        { assignedDesigner: [designerId] },
        { field: 'requestDate', direction: 'desc' },
        1,
        50
      )

      // Filter requests by status
      const assigned = requests.filter(r => ['assigned', 'in_progress', 'draft_ready'].includes(r.status))
      const pending = requests.filter(r => ['revision_requested', 'revision_in_progress', 'client_review'].includes(r.status))
      const completed = requests.filter(r => ['delivered', 'approved'].includes(r.status))

      setAssignedRequests(assigned)
      setPendingRequests(pending)
      setCompletedRequests(completed)

      // Calculate monthly statistics
      const thisMonth = new Date()
      thisMonth.setDate(1)
      
      const monthlyCompleted = completed.filter(r => 
        r.actualDeliveryDate && r.actualDeliveryDate >= thisMonth
      )

      const onTimeDeliveries = monthlyCompleted.filter(r => 
        r.actualDeliveryDate && r.actualDeliveryDate <= r.expectedDeliveryDate
      ).length

      const totalRatings = monthlyCompleted.filter(r => r.qualityRating).length
      const avgRating = totalRatings > 0 ? 
        monthlyCompleted.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / totalRatings : 0

      const totalSatisfaction = monthlyCompleted.filter(r => r.clientSatisfaction).length
      const avgSatisfaction = totalSatisfaction > 0 ? 
        monthlyCompleted.reduce((sum, r) => sum + (r.clientSatisfaction || 0), 0) / totalSatisfaction : 0

      const totalRevenue = monthlyCompleted.reduce((sum, r) => sum + (r.actualCost || 0), 0)

      setMonthlyStats({
        completedProjects: monthlyCompleted.length,
        averageRating: avgRating,
        onTimeDeliveryRate: monthlyCompleted.length > 0 ? (onTimeDeliveries / monthlyCompleted.length) * 100 : 0,
        clientSatisfactionRate: avgSatisfaction,
        totalRevenue,
        averageCompletionTime: 0 // يمكن حسابها لاحقاً
      })

    } catch (error) {
      console.error('Error loading designer dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDraft = async (request: DesignRequest) => {
    // في التطبيق الحقيقي، سيتم فتح نافذة رفع الملف
    console.log('Upload draft for request:', request.id)
    
    // Mock file upload
    await designService.uploadFile(request.id, {
      fileName: 'draft_design.png',
      fileSize: 2048000,
      fileType: 'image/png',
      fileUrl: '/mock/draft.png',
      thumbnailUrl: '/mock/draft_thumb.png',
      tags: ['مسودة', 'تصميم أولي'],
      description: 'المسودة الأولى للتصميم'
    }, 'draft')

    // Reload data
    loadDashboardData()
  }

  const handleRequestApproval = async (request: DesignRequest) => {
    // Submit for client review
    console.log('Request approval for:', request.id)
    // Mock status update - في التطبيق الحقيقي سيكون API call
    loadDashboardData()
  }

  const getTodayTasks = () => {
    const today = new Date().toDateString()
    return assignedRequests.filter(request => {
      const daysUntilDeadline = Math.ceil(
        (request.expectedDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilDeadline <= 3 // مهام يجب إنجازها في غضون 3 أيام
    })
  }

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="المشاريع المكتملة"
        value={monthlyStats.completedProjects.toString()}
        subtitle="هذا الشهر"
        icon="✅"
        trend={{ value: 12, direction: 'up' }}
        color="green"
      />
      <StatCard
        title="التقييم المتوسط"
        value={monthlyStats.averageRating.toFixed(1)}
        subtitle="من 5 نجوم"
        icon="⭐"
        color="yellow"
      />
      <StatCard
        title="التسليم في الوقت"
        value={`${monthlyStats.onTimeDeliveryRate.toFixed(0)}%`}
        subtitle="معدل الالتزام بالمواعيد"
        icon="⏰"
        color="blue"
      />
      <StatCard
        title="رضا العملاء"
        value={`${monthlyStats.clientSatisfactionRate.toFixed(0)}%`}
        subtitle="متوسط رضا العملاء"
        icon="😊"
        color="purple"
      />
    </div>
  )

  const renderAssignedRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">مشاريعي الحالية</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          {assignedRequests.length} مشروع
        </span>
      </div>

      {assignedRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🎨</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مشاريع معينة</h3>
          <p className="text-gray-500">لم يتم تعيين أي مشاريع جديدة لك حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignedRequests.map((request) => (
            <DesignRequestCard
              key={request.id}
              request={request}
              variant="default"
              showActions={true}
              onUploadDraft={() => handleUploadDraft(request)}
              onApprove={() => handleRequestApproval(request)}
              showDesignerInfo={false}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderPendingRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">بانتظار المراجعة</h2>
        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
          {pendingRequests.length} مشروع
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">⏳</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مشاريع معلقة</h3>
          <p className="text-gray-500">جميع مشاريعك محدثة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingRequests.map((request) => (
            <DesignRequestCard
              key={request.id}
              request={request}
              variant="default"
              showActions={true}
              showDesignerInfo={false}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderCompletedRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">المشاريع المكتملة</h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          {completedRequests.length} مشروع
        </span>
      </div>

      {completedRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مشاريع مكتملة</h3>
          <p className="text-gray-500">ابدأ العمل على مشاريعك لتراها هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedRequests.slice(0, 6).map((request) => (
            <DesignRequestCard
              key={request.id}
              request={request}
              variant="compact"
              showActions={false}
              showDesignerInfo={false}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderDesignerProfile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">ملف المصمم</h2>
      
      {designerInfo && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">{designerInfo.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{designerInfo.name}</h3>
              <p className="text-purple-100 mb-2">{designerInfo.email}</p>
              <div className="flex items-center space-x-4 space-x-reverse text-sm">
                <span>📱 {designerInfo.phone}</span>
                <span>⭐ {designerInfo.averageRating}/5</span>
                <span>✅ {designerInfo.completedProjects} مشروع</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">مستوى المهارة</div>
              <div className="text-lg font-semibold">
                {designerInfo.skillLevel === 'senior' ? 'خبير' :
                 designerInfo.skillLevel === 'mid' ? 'متوسط' :
                 designerInfo.skillLevel === 'junior' ? 'مبتدئ' : 'قائد'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specialties */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">التخصصات</h4>
          <div className="flex flex-wrap gap-2">
            {designerInfo?.specialties.map((specialty, index) => (
              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                {specialty === 'logo' ? 'شعار' :
                 specialty === 'business_card' ? 'بطاقة عمل' :
                 specialty === 'complete_identity' ? 'هوية كاملة' :
                 specialty === 'social_media' ? 'سوشيال ميديا' :
                 specialty === 'brochure' ? 'بروشور' : specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">مؤشرات الأداء</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">معدل التسليم في الوقت</span>
              <span className="text-sm font-medium">{designerInfo?.onTimeDeliveryRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">رضا العملاء</span>
              <span className="text-sm font-medium">{designerInfo?.clientSatisfactionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">العبء الحالي</span>
              <span className="text-sm font-medium">
                {designerInfo?.currentWorkload}/{designerInfo?.maxWorkload} مشروع
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Expertise */}
      {designerInfo?.yemeniCulturalExpertise && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <span className="text-green-600">🇾🇪</span>
            <h4 className="text-lg font-semibold text-green-800">خبرة ثقافية يمنية</h4>
          </div>
          <p className="text-green-700 text-sm">
            هذا المصمم لديه خبرة متخصصة في التصميم وفقاً للثقافة اليمنية والقيم الإسلامية، 
            ويمكنه إنتاج تصاميم تعكس التراث اليمني الأصيل.
          </p>
        </div>
      )}
    </div>
  )

  const renderTodayTasks = () => {
    const todayTasks = getTodayTasks()
    
    if (todayTasks.length === 0) return null

    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <span className="text-orange-600">🔥</span>
          <h3 className="text-lg font-semibold text-orange-800">مهام اليوم العاجلة</h3>
        </div>
        <div className="space-y-3">
          {todayTasks.map((task) => {
            const daysLeft = Math.ceil(
              (task.expectedDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            return (
              <div key={task.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.client.restaurantName}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    daysLeft <= 0 ? 'bg-red-100 text-red-800' :
                    daysLeft <= 1 ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {daysLeft <= 0 ? 'متأخر!' : 
                     daysLeft === 1 ? 'يوم واحد' : 
                     `${daysLeft} أيام`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مرحباً، {designerName}</h1>
          <p className="text-gray-600 mt-1">
            لوحة تحكم المصمم • {new Date().toLocaleDateString('ar')}
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse mt-4 md:mt-0">
          <Button variant="secondary">تحديث الملف الشخصي</Button>
          <Button>رفع عمل جديد للمعرض</Button>
        </div>
      </div>

      {/* Stats */}
      {renderStatsCards()}

      {/* Today's urgent tasks */}
      {renderTodayTasks()}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 space-x-reverse">
          {[
            { id: 'assigned', label: 'مشاريعي الحالية', count: assignedRequests.length },
            { id: 'pending', label: 'بانتظار المراجعة', count: pendingRequests.length },
            { id: 'completed', label: 'المكتملة', count: completedRequests.length },
            { id: 'profile', label: 'ملفي الشخصي', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'assigned' && renderAssignedRequests()}
        {activeTab === 'pending' && renderPendingRequests()}
        {activeTab === 'completed' && renderCompletedRequests()}
        {activeTab === 'profile' && renderDesignerProfile()}
      </div>
    </div>
  )
}
