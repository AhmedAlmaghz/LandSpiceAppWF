// Marketer Dashboard - Main Page
// لوحة تحكم المسوقين - الصفحة الرئيسية

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import CampaignCard from '@/components/marketer/CampaignCard'
import LeadCard from '@/components/marketer/LeadCard'
import MarketerStats from '@/components/marketer/MarketerStats'
import { Button } from '@/components/ui/Button'

interface MarketerDashboardData {
  overview: {
    totalLeads: number
    activeLeads: number
    convertedThisMonth: number
    conversionRate: number
    totalRevenue: number
    avgDealSize: number
    activeCampaigns: number
    monthlyTarget: number
  }
  performance: {
    leadsGenerated: number
    meetingsScheduled: number
    proposalsSent: number
    dealsWon: number
    totalCommission: number
    monthlyCommission: number
  }
  commissions: {
    pending: number
    paid: number
    disputed: number
    thisMonth: number
    lastMonth: number
  }
  campaigns: Array<{
    id: string
    name: string
    type: 'cold_calling' | 'digital_ads' | 'social_media' | 'referral_program' | 'exhibition' | 'email_marketing'
    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
    budget: number
    spent: number
    leads: number
    conversions: number
    roi: number
    startDate: Date
    endDate: Date
  }>
  recentLeads: Array<{
    id: string
    restaurantName: string
    ownerName: string
    phone: string
    email: string
    location: string
    businessType: 'restaurant' | 'cafe' | 'fast_food' | 'catering'
    status: 'new' | 'contacted' | 'interested' | 'meeting_scheduled' | 'proposal_sent' | 'negotiating' | 'converted' | 'rejected'
    source: 'cold_call' | 'referral' | 'social_media' | 'website' | 'exhibition' | 'other'
    estimatedValue: number
    probability: number
    nextAction: string
    lastContact: Date
    notes: string[]
  }>
}

export default function MarketerDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<MarketerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'leads'>('overview')

  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.roleName !== 'marketer') {
    redirect('/auth/signin')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const mockData: MarketerDashboardData = {
        overview: {
          totalLeads: 245,
          activeLeads: 78,
          convertedThisMonth: 12,
          conversionRate: 15.4,
          totalRevenue: 890000,
          avgDealSize: 35000,
          activeCampaigns: 5,
          monthlyTarget: 50000
        },
        performance: {
          leadsGenerated: 89,
          meetingsScheduled: 34,
          proposalsSent: 28,
          dealsWon: 12,
          totalCommission: 178000,
          monthlyCommission: 25600
        },
        commissions: {
          pending: 45000,
          paid: 133000,
          disputed: 2500,
          thisMonth: 25600,
          lastMonth: 31200
        },
        campaigns: [
          {
            id: '1',
            name: 'حملة المطاعم الصغيرة',
            type: 'cold_calling',
            status: 'active',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            budget: 25000,
            spent: 18500,
            leads: 87,
            conversions: 12,
            roi: 185
          },
          {
            id: '2',
            name: 'حملة وسائل التواصل',
            type: 'social_media',
            status: 'active',
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            budget: 15000,
            spent: 8200,
            leads: 78,
            conversions: 8,
            roi: 145
          }
        ],
        recentLeads: [
          {
            id: '1',
            restaurantName: 'مطعم الفخامة',
            ownerName: 'خالد العتيبي',
            phone: '0501234567',
            email: 'khalid@fakhamah.sa',
            location: 'الرياض - الملز',
            businessType: 'restaurant',
            status: 'interested',
            source: 'cold_call',
            estimatedValue: 45000,
            probability: 70,
            nextAction: 'ترتيب اجتماع لعرض المنتجات',
            lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            notes: ['مهتم بالعبوات المخصصة', 'يريد عرض أسعار مفصل']
          },
          {
            id: '2',
            restaurantName: 'كافيه البن العربي',
            ownerName: 'فاطمة المطيري',
            phone: '0509876543',
            email: 'fatima@arabiccoffee.sa',
            location: 'جدة - الروضة',
            businessType: 'cafe',
            status: 'meeting_scheduled',
            source: 'social_media',
            estimatedValue: 28000,
            probability: 85,
            nextAction: 'اجتماع يوم الأحد الساعة 10 صباحاً',
            lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            notes: ['تواصلت عبر انستقرام', 'تريد البدء بكمية تجريبية']
          }
        ]
      }

      setDashboardData(mockData)
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التسويق...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div>خطأ في تحميل البيانات</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📈 لوحة التسويق
              </h1>
              <p className="text-gray-600">أهلاً بك، {session.user.name || session.user.username}</p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm">
                📊 التقارير
              </Button>
              <Button variant="primary" size="sm">
                ➕ حملة جديدة
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: '📊' },
                { id: 'campaigns', label: 'الحملات', icon: '🎯' },
                { id: 'leads', label: 'العملاء المحتملين', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <MarketerStats data={dashboardData} loading={isLoading} />
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">الحملات النشطة</h2>
              <Button>إنشاء حملة جديدة</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboardData.campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClick={() => console.log('فتح تفاصيل الحملة', campaign.id)}
                />
              ))}
            </div>

            {dashboardData.campaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حملات نشطة</h3>
                <p className="text-gray-600 mb-4">ابدأ بإنشاء أول حملة تسويقية</p>
                <Button>إنشاء حملة جديدة</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">العملاء المحتملين</h2>
              <Button>إضافة عميل جديد</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboardData.recentLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => console.log('فتح تفاصيل العميل', lead.id)}
                  onContact={() => console.log('تواصل مع العميل', lead.id)}
                />
              ))}
            </div>

            {dashboardData.recentLeads.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء محتملين</h3>
                <p className="text-gray-600 mb-4">ابدأ بإضافة أول عميل محتمل</p>
                <Button>إضافة عميل جديد</Button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
