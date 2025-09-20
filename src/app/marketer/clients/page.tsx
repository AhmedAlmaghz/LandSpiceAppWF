'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Client {
  id: string
  name: string
  type: 'restaurant' | 'supplier'
  status: 'active' | 'pending' | 'inactive' | 'prospect'
  region: string
  city: string
  contactPerson: string
  phone: string
  email?: string
  contractValue?: number
  monthlyRevenue?: number
  signupDate?: Date
  lastContact: Date
  nextFollowUp?: Date
  relationshipStage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'ongoing'
  priority: 'high' | 'medium' | 'low'
  source: 'referral' | 'cold_call' | 'exhibition' | 'digital' | 'existing_client'
  notes: string
  assignedMarketer: string
  lifetimeValue: number
  satisfactionScore?: number
}

interface ClientStats {
  totalClients: number
  activeClients: number
  prospectClients: number
  monthlyRevenue: number
  conversionRate: number
  avgSatisfactionScore: number
  topRegion: string
  newThisMonth: number
}

export default function MarketerClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    prospectClients: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    avgSatisfactionScore: 0,
    topRegion: '',
    newThisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'مطعم البيك الشعبي',
          type: 'restaurant',
          status: 'active',
          region: 'أمانة العاصمة',
          city: 'صنعاء',
          contactPerson: 'محمد أحمد البيك',
          phone: '+967 1 234567',
          email: 'info@albaik-restaurant.ye',
          contractValue: 240000,
          monthlyRevenue: 20000,
          signupDate: new Date('2024-08-15'),
          lastContact: new Date('2025-01-18'),
          nextFollowUp: new Date('2025-02-15'),
          relationshipStage: 'ongoing',
          priority: 'high',
          source: 'referral',
          notes: 'مطعم مشهور في صنعاء - عميل استراتيجي مهم',
          assignedMarketer: 'عبدالله النجار',
          lifetimeValue: 480000,
          satisfactionScore: 4.8
        },
        {
          id: '2',
          name: 'شركة الذهب للتوابل والبهارات',
          type: 'supplier',
          status: 'active',
          region: 'حضرموت',
          city: 'المكلا',
          contactPerson: 'فاطمة الحضرمية',
          phone: '+967 5 345678',
          contractValue: 180000,
          monthlyRevenue: 15000,
          signupDate: new Date('2024-09-20'),
          lastContact: new Date('2025-01-16'),
          nextFollowUp: new Date('2025-02-10'),
          relationshipStage: 'ongoing',
          priority: 'high',
          source: 'exhibition',
          notes: 'أكبر مورد توابل في حضرموت - جودة عالية',
          assignedMarketer: 'فاطمة الشامي',
          lifetimeValue: 360000,
          satisfactionScore: 4.6
        },
        {
          id: '3',
          name: 'مطعم الطازج للوجبات السريعة',
          type: 'restaurant',
          status: 'pending',
          region: 'تعز',
          city: 'تعز',
          contactPerson: 'أحمد علي الطازج',
          phone: '+967 4 456789',
          contractValue: 150000,
          signupDate: new Date('2025-01-10'),
          lastContact: new Date('2025-01-19'),
          nextFollowUp: new Date('2025-01-25'),
          relationshipStage: 'negotiation',
          priority: 'medium',
          source: 'digital',
          notes: 'مطعم واعد في تعز - يحتاج عرض مخصص',
          assignedMarketer: 'محمد الحضرمي',
          lifetimeValue: 300000,
          satisfactionScore: 4.2
        },
        {
          id: '4',
          name: 'مخازن الأصيل للمواد الغذائية',
          type: 'supplier',
          status: 'prospect',
          region: 'عدن',
          city: 'عدن',
          contactPerson: 'سعد العدني',
          phone: '+967 2 567890',
          lastContact: new Date('2025-01-15'),
          nextFollowUp: new Date('2025-01-22'),
          relationshipStage: 'qualified',
          priority: 'high',
          source: 'cold_call',
          notes: 'مورد كبير في عدن - إمكانية شراكة مهمة',
          assignedMarketer: 'أسماء الصنعاني',
          lifetimeValue: 400000
        },
        {
          id: '5',
          name: 'مطعم الشام الأصيل',
          type: 'restaurant',
          status: 'inactive',
          region: 'إب',
          city: 'إب',
          contactPerson: 'خالد الشامي',
          phone: '+967 4 678901',
          contractValue: 120000,
          signupDate: new Date('2024-03-10'),
          lastContact: new Date('2024-12-20'),
          relationshipStage: 'closed',
          priority: 'low',
          source: 'existing_client',
          notes: 'عميل سابق - توقف الخدمة - يحتاج متابعة للعودة',
          assignedMarketer: 'عبدالله النجار',
          lifetimeValue: 240000,
          satisfactionScore: 3.5
        }
      ]

      setClients(mockClients)
      
      const totalClients = mockClients.length
      const activeClients = mockClients.filter(c => c.status === 'active').length
      const prospectClients = mockClients.filter(c => c.status === 'prospect').length
      const monthlyRevenue = mockClients.filter(c => c.monthlyRevenue).reduce((sum, c) => sum + (c.monthlyRevenue || 0), 0)
      const avgSatisfactionScore = mockClients.filter(c => c.satisfactionScore).reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / mockClients.filter(c => c.satisfactionScore).length
      const newThisMonth = mockClients.filter(c => 
        c.signupDate && 
        c.signupDate.getMonth() === new Date().getMonth() && 
        c.signupDate.getFullYear() === new Date().getFullYear()
      ).length

      setStats({
        totalClients,
        activeClients,
        prospectClients,
        monthlyRevenue,
        conversionRate: 72.5,
        avgSatisfactionScore,
        topRegion: 'أمانة العاصمة',
        newThisMonth
      })
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'marketer') redirect('/auth/signin')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '✅ نشط'
      case 'pending': return '⏳ معلق'
      case 'inactive': return '❌ غير نشط'
      case 'prospect': return '🎯 محتمل'
      default: return status
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-gray-100 text-gray-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed': return 'bg-green-100 text-green-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'lead': return '📋 عميل محتمل'
      case 'qualified': return '✅ مؤهل'
      case 'proposal': return '📄 عرض'
      case 'negotiation': return '🤝 تفاوض'
      case 'closed': return '✅ مُبرم'
      case 'ongoing': return '🔄 مستمر'
      default: return stage
    }
  }

  const columns = [
    {
      key: 'client',
      label: 'العميل',
      render: (client: Client) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{client.name}</div>
          <div className="text-sm text-gray-500">
            {client.type === 'restaurant' ? '🏪 مطعم' : '🏭 مورد'} • {client.city}
          </div>
          <div className="text-xs text-gray-400">{client.contactPerson}</div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'التواصل',
      render: (client: Client) => (
        <div className="text-center">
          <div className="text-sm text-gray-900">{client.phone}</div>
          {client.email && (
            <div className="text-xs text-gray-600">{client.email}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            آخر تواصل: {formatDate(client.lastContact)}
          </div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'القيمة',
      render: (client: Client) => (
        <div className="text-center">
          {client.contractValue && (
            <div className="text-lg font-medium text-green-600">
              {formatCurrency(client.contractValue)}
            </div>
          )}
          {client.monthlyRevenue && (
            <div className="text-sm text-gray-600">
              شهرياً: {formatCurrency(client.monthlyRevenue)}
            </div>
          )}
          <div className="text-xs text-blue-600">
            القيمة الدائمة: {formatCurrency(client.lifetimeValue)}
          </div>
        </div>
      )
    },
    {
      key: 'relationship',
      label: 'مرحلة العلاقة',
      render: (client: Client) => (
        <div className="text-center">
          <span className={`status-badge ${getStageColor(client.relationshipStage)}`}>
            {getStageText(client.relationshipStage)}
          </span>
          {client.nextFollowUp && (
            <div className="text-xs text-gray-500 mt-1">
              المتابعة: {formatDate(client.nextFollowUp)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'satisfaction',
      label: 'الرضا',
      render: (client: Client) => (
        <div className="text-center">
          {client.satisfactionScore ? (
            <>
              <div className="text-lg font-bold text-yellow-600">
                ⭐ {client.satisfactionScore}
              </div>
              <div className="text-xs text-gray-500">من 5</div>
            </>
          ) : (
            <div className="text-sm text-gray-400">غير مقيم</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (client: Client) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(client.status)}`}>
            {getStatusText(client.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {client.assignedMarketer}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (client: Client) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/marketer/clients/${client.id}`)}
          >
            👁️ عرض
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {/* اتصال */}}
          >
            📞 اتصال
          </Button>
          
          {client.status === 'prospect' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {/* متابعة */}}
            >
              📅 متابعة
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل العملاء...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['marketer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">👥 إدارة العملاء والشراكات</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalClients} عميل، {stats.activeClients} نشط
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/marketer/clients/import')}
                >
                  📥 استيراد عملاء
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/marketer/clients/create')}
                >
                  ➕ عميل جديد
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي العملاء"
              value={stats.totalClients}
              icon="👥"
              color="blue"
            />
            
            <StatCard
              title="عملاء نشطين"
              value={stats.activeClients}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="عملاء محتملين"
              value={stats.prospectClients}
              icon="🎯"
              color="purple"
            />
            
            <StatCard
              title="جدد هذا الشهر"
              value={stats.newThisMonth}
              icon="🆕"
              color="orange"
            />
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="الإيرادات الشهرية"
              value={formatCurrency(stats.monthlyRevenue)}
              icon="💰"
              color="green"
            />
            
            <StatCard
              title="معدل التحويل"
              value={`${stats.conversionRate}%`}
              icon="📊"
              color="blue"
            />
            
            <StatCard
              title="متوسط الرضا"
              value={`⭐ ${stats.avgSatisfactionScore?.toFixed(1) || 'N/A'}`}
              icon="😊"
              color="yellow"
            />
          </div>

          {/* Regional Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>التوزيع الجغرافي للعملاء</CardTitle>
              <CardDescription>توزيع العملاء حسب المحافظات اليمنية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { region: 'أمانة العاصمة', count: 15, percentage: 35 },
                  { region: 'عدن', count: 12, percentage: 28 },
                  { region: 'تعز', count: 8, percentage: 19 },
                  { region: 'حضرموت', count: 5, percentage: 12 },
                  { region: 'إب', count: 3, percentage: 7 }
                ].map(region => (
                  <div key={region.region} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {region.count}
                    </div>
                    <div className="text-sm text-gray-900 mb-1">{region.region}</div>
                    <div className="text-xs text-gray-600">{region.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                {[
                  { key: 'all', label: '👥 جميع العملاء', count: stats.totalClients },
                  { key: 'active', label: '✅ نشطين', count: stats.activeClients },
                  { key: 'prospects', label: '🎯 محتملين', count: stats.prospectClients },
                  { key: 'restaurants', label: '🏪 مطاعم', count: 3 },
                  { key: 'suppliers', label: '🏭 موردين', count: 2 }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة العملاء والشراكات</CardTitle>
              <CardDescription>
                جميع عملائك مع تفاصيل العلاقة والأداء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={clients}
                columns={columns}
                searchKey="name"
                onSelectionChange={setSelectedClients}
                selectedItems={selectedClients}
                emptyMessage="لا توجد عملاء"
                emptyDescription="لم يتم إضافة أي عملاء بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
