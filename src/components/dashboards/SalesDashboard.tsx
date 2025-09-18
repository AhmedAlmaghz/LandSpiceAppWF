/**
 * لوحة معلومات المبيعات - لاند سبايس
 * الوحدة الثانية عشرة: التقارير والإحصائيات المتقدمة
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Calendar,
  Clock,
  Crown,
  MapPin,
  Phone,
  Star,
  Target,
  TrendingUp,
  Users,
  UserPlus
} from 'lucide-react'

interface SalesMetrics {
  monthlyTarget: number
  currentAchievement: number
  achievementPercentage: number
  
  newRestaurants: {
    thisMonth: number
    lastMonth: number
    change: number
    target: number
  }
  
  pipeline: {
    leads: number
    prospects: number
    negotiations: number
    closingSoon: number
  }
  
  conversionRates: {
    overallConversion: number
  }
  
  averageSalesCycle: number
}

interface SalesRepPerformance {
  id: string
  name: string
  region: string
  newRestaurants: number
  revenue: number
  target: number
  achievementRate: number
  rating: 'excellent' | 'good' | 'fair' | 'needs_improvement'
}

interface Lead {
  id: string
  restaurantName: string
  contactPerson: string
  phone: string
  location: string
  estimatedValue: number
  stage: 'lead' | 'prospect' | 'negotiation' | 'closing'
  priority: 'hot' | 'warm' | 'cold'
  lastContact: Date
  nextFollowUp: Date
  notes?: string
}

export default function SalesDashboard() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null)
  const [salesTeam, setSalesTeam] = useState<SalesRepPerformance[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadSalesDashboardData()
  }, [])

  const loadSalesDashboardData = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMetrics({
        monthlyTarget: 20,
        currentAchievement: 16,
        achievementPercentage: 80,
        
        newRestaurants: {
          thisMonth: 16,
          lastMonth: 12,
          change: 33.3,
          target: 20
        },
        
        pipeline: {
          leads: 45,
          prospects: 23,
          negotiations: 12,
          closingSoon: 8
        },
        
        conversionRates: {
          overallConversion: 17.8
        },
        
        averageSalesCycle: 28
      })

      setSalesTeam([
        {
          id: 'rep_001',
          name: 'أحمد محمد الشامي',
          region: 'صنعاء',
          newRestaurants: 6,
          revenue: 3200000,
          target: 2800000,
          achievementRate: 114.3,
          rating: 'excellent'
        },
        {
          id: 'rep_002',
          name: 'فاطمة علي الحضرمية',
          region: 'عدن',
          newRestaurants: 5,
          revenue: 2750000,
          target: 2500000,
          achievementRate: 110.0,
          rating: 'excellent'
        },
        {
          id: 'rep_003',
          name: 'عبدالله سالم التعزي',
          region: 'تعز',
          newRestaurants: 3,
          revenue: 1650000,
          target: 2000000,
          achievementRate: 82.5,
          rating: 'good'
        }
      ])

      setLeads([
        {
          id: 'lead_001',
          restaurantName: 'مطعم السفير للمأكولات الشعبية',
          contactPerson: 'محمد أحمد العنسي',
          phone: '+967-1-234567',
          location: 'صنعاء - شارع الزبيري',
          estimatedValue: 750000,
          stage: 'negotiation',
          priority: 'hot',
          lastContact: new Date('2025-01-15'),
          nextFollowUp: new Date('2025-01-20'),
          notes: 'متحمس جداً للانضمام، يحتاج عرض سعر نهائي'
        },
        {
          id: 'lead_002',
          restaurantName: 'مطعم الأندلس الراقي',
          contactPerson: 'سارة محمد باصهي',
          phone: '+967-2-345678',
          location: 'عدن - كريتر',
          estimatedValue: 950000,
          stage: 'closing',
          priority: 'hot',
          lastContact: new Date('2025-01-16'),
          nextFollowUp: new Date('2025-01-19'),
          notes: 'جاهز للتوقيع، ينتظر موافقة الشريك'
        }
      ])

    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة المبيعات:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}م ر.ي`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}ك ر.ي`
    }
    return `${amount.toLocaleString()} ر.ي`
  }

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'hot': return 'text-red-600 bg-red-50 border-red-200'
      case 'warm': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cold': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStageLabel = (stage: Lead['stage']) => {
    switch (stage) {
      case 'lead': return 'عميل محتمل'
      case 'prospect': return 'احتمال'
      case 'negotiation': return 'مفاوضة'
      case 'closing': return 'إغلاق'
      default: return 'غير محدد'
    }
  }

  const getRatingBadge = (rating: SalesRepPerformance['rating']) => {
    switch (rating) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800">مقبول</Badge>
      case 'needs_improvement':
        return <Badge className="bg-red-100 text-red-800">يحتاج تحسين</Badge>
    }
  }

  const SalesMetricsCards = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">هدف الشهر</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {metrics?.currentAchievement}/{metrics?.monthlyTarget}
          </div>
          <div className="mt-2">
            <Progress value={metrics?.achievementPercentage || 0} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics?.achievementPercentage}% من الهدف الشهري
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">مطاعم جديدة</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {metrics?.newRestaurants.thisMonth}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{metrics?.newRestaurants.change}%</span> من الشهر الماضي
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {metrics?.conversionRates.overallConversion}%
          </div>
          <p className="text-xs text-muted-foreground">من العميل المحتمل للعقد</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">دورة البيع</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics?.averageSalesCycle} يوم
          </div>
          <p className="text-xs text-muted-foreground">متوسط الوقت من العميل للعقد</p>
        </CardContent>
      </Card>
    </div>
  )

  const PipelineCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          خط الأعمال (Pipeline)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
            <div>
              <h4 className="font-medium text-blue-800">عملاء محتملين</h4>
              <p className="text-sm text-blue-600">Leads</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.pipeline.leads}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
            <div>
              <h4 className="font-medium text-green-800">احتمالات</h4>
              <p className="text-sm text-green-600">Prospects</p>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.pipeline.prospects}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
            <div>
              <h4 className="font-medium text-yellow-800">مفاوضات</h4>
              <p className="text-sm text-yellow-600">Negotiations</p>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics?.pipeline.negotiations}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-800">قريب من الإغلاق</h4>
              <p className="text-sm text-red-600">Closing Soon</p>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.pipeline.closingSoon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const SalesTeamPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          أداء فريق المبيعات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesTeam.map((rep) => (
            <div key={rep.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{rep.name}</h4>
                  <p className="text-sm text-muted-foreground">{rep.region}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-medium">{rep.newRestaurants} مطعم</div>
                <div className="text-sm text-muted-foreground">هذا الشهر</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium">{formatCurrency(rep.revenue)}</div>
                <div className="text-sm text-muted-foreground">إيرادات</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium">{rep.achievementRate.toFixed(1)}%</div>
                <Progress value={rep.achievementRate > 100 ? 100 : rep.achievementRate} className="w-20 mt-1" />
              </div>
              
              <div className="text-center">
                {getRatingBadge(rep.rating)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const HotLeadsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          العملاء الساخنون
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leads.filter(lead => lead.priority === 'hot').map((lead) => (
            <div key={lead.id} className={`p-3 rounded-lg border ${getPriorityColor(lead.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{lead.restaurantName}</h4>
                  <p className="text-sm mt-1">{lead.contactPerson}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <MapPin className="w-3 h-3" />
                    {lead.location}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <Phone className="w-3 h-3" />
                    {lead.phone}
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="font-medium">{formatCurrency(lead.estimatedValue)}</div>
                  <Badge variant="outline" className="mt-1">
                    {getStageLabel(lead.stage)}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span>آخر اتصال: {lead.lastContact.toLocaleDateString('ar-EG')}</span>
                  <span>المتابعة: {lead.nextFollowUp.toLocaleDateString('ar-EG')}</span>
                </div>
                {lead.notes && (
                  <p className="text-xs mt-2 p-2 bg-white/50 rounded">{lead.notes}</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  <Phone className="w-3 h-3 mr-1" />
                  اتصال
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  موعد
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل لوحة المبيعات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة معلومات المبيعات</h1>
          <p className="text-muted-foreground">
            تتبع الأهداف والإنجازات وإدارة العملاء المحتملين
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadSalesDashboardData}>
            تحديث البيانات
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 ml-2" />
            عميل جديد
          </Button>
        </div>
      </div>

      <SalesMetricsCards />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="pipeline">خط الأعمال</TabsTrigger>
          <TabsTrigger value="team">الفريق</TabsTrigger>
          <TabsTrigger value="leads">العملاء المحتملين</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PipelineCard />
            <HotLeadsCard />
          </div>
          <SalesTeamPerformance />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <PipelineCard />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <SalesTeamPerformance />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <HotLeadsCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
