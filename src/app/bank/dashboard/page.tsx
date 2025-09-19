'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import Chart from '@/components/dashboard/Chart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import NotificationCenter from '@/components/dashboard/NotificationCenter'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatCurrency, formatDate } from '@/lib/utils'

interface BankDashboardData {
  bank: {
    id: string
    name: string
    branch: string
  }
  guarantees: {
    total: number
    active: number
    pending: number
    totalValue: number
  }
  installments: {
    totalFinanced: number
    activeContracts: number
    monthlyCollections: number
    overduePayments: number
  }
  recentTransactions: Array<{
    id: string
    type: 'guarantee_issued' | 'installment_received' | 'payment_processed'
    description: string
    amount: number
    date: Date
    status: string
    restaurantName: string
  }>
  pendingApprovals: Array<{
    id: string
    type: 'guarantee_request' | 'installment_plan' | 'contract_renewal'
    title: string
    restaurantName: string
    amount: number
    requestDate: Date
    priority: 'high' | 'medium' | 'low'
  }>
}

export default function BankDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<BankDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // محاكاة البيانات - سيتم استبدالها بـ API حقيقي
      const mockData: BankDashboardData = {
        bank: {
          id: 'b1',
          name: 'بنك القاسمي الإسلامي',
          branch: 'الفرع الرئيسي'
        },
        guarantees: {
          total: 89,
          active: 76,
          pending: 8,
          totalValue: 15750000
        },
        installments: {
          totalFinanced: 8950000,
          activeContracts: 34,
          monthlyCollections: 485000,
          overduePayments: 3
        },
        recentTransactions: [
          {
            id: '1',
            type: 'guarantee_issued',
            description: 'إصدار ضمانة بنكية',
            amount: 150000,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed',
            restaurantName: 'مطعم الطازج'
          },
          {
            id: '2',
            type: 'installment_received',
            description: 'استلام قسط شهري',
            amount: 25000,
            date: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'completed',
            restaurantName: 'مطعم البيك'
          },
          {
            id: '3',
            type: 'payment_processed',
            description: 'معالجة دفعة لمورد الطباعة',
            amount: 75000,
            date: new Date(Date.now() - 12 * 60 * 60 * 1000),
            status: 'completed',
            restaurantName: 'متعدد'
          }
        ],
        pendingApprovals: [
          {
            id: '1',
            type: 'guarantee_request',
            title: 'طلب ضمانة بنكية جديدة',
            restaurantName: 'مطعم السلام',
            amount: 200000,
            requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            priority: 'high'
          },
          {
            id: '2',
            type: 'installment_plan',
            title: 'خطة تقسيط جديدة',
            restaurantName: 'مطعم الرياض',
            amount: 120000,
            requestDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
            priority: 'medium'
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

  // التحقق من صلاحية البنك
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'bank') {
    redirect('/auth/signin')
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'guarantee_issued': return '🛡️'
      case 'installment_received': return '💰'
      case 'payment_processed': return '💳'
      default: return '📋'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'guarantee_issued': return 'text-blue-600 bg-blue-50'
      case 'installment_received': return 'text-green-600 bg-green-50'
      case 'payment_processed': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
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

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      console.log(`${action} الموافقة على ${approvalId}`)
      // سيتم تنفيذ العملية عبر API
    } catch (error) {
      console.error('خطأ في معالجة الموافقة:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم البنك...</p>
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
                🏦 {dashboardData.bank.name}
              </h1>
              <p className="text-gray-600">
                {dashboardData.bank.branch} - أهلاً بك، {session.user.firstName ? `${session.user.firstName} ${session.user.lastName || ''}` : session.user.username}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm">
                🛡️ إصدار ضمانة
              </Button>
              <Button variant="primary" size="sm">
                💰 إدارة الأقساط
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Approvals Alert */}
        {dashboardData.pendingApprovals.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  لديك {dashboardData.pendingApprovals.length} طلب في انتظار الموافقة
                </h3>
                <p className="text-sm text-yellow-700">
                  يرجى مراجعة الطلبات واتخاذ الإجراء المناسب
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Guarantees */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الضمانات النشطة</CardTitle>
              <div className="text-2xl">🛡️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.guarantees.active}</div>
              <p className="text-xs text-gray-600">
                من إجمالي {dashboardData.guarantees.total}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {dashboardData.guarantees.pending} في الانتظار
              </p>
            </CardContent>
          </Card>

          {/* Total Guarantee Value */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة الضمانات</CardTitle>
              <div className="text-2xl">💎</div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(dashboardData.guarantees.totalValue)}
              </div>
              <p className="text-xs text-blue-600">إجمالي القيمة المضمونة</p>
            </CardContent>
          </Card>

          {/* Installment Contracts */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عقود التقسيط</CardTitle>
              <div className="text-2xl">📊</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.installments.activeContracts}</div>
              <p className="text-xs text-gray-600">
                {formatCurrency(dashboardData.installments.totalFinanced)} إجمالي التمويل
              </p>
            </CardContent>
          </Card>

          {/* Monthly Collections */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التحصيلات الشهرية</CardTitle>
              <div className="text-2xl">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(dashboardData.installments.monthlyCollections)}
              </div>
              <p className="text-xs text-red-600">
                {dashboardData.installments.overduePayments} دفعة متأخرة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>المعاملات الأخيرة</CardTitle>
                <CardDescription>آخر العمليات المصرفية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                          <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.restaurantName}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <span className="status-badge bg-green-100 text-green-800 text-xs">
                          مكتمل
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="ghost" className="w-full">
                    عرض جميع المعاملات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  الموافقات المعلقة
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {dashboardData.pendingApprovals.length}
                  </span>
                </CardTitle>
                <CardDescription>طلبات تحتاج مراجعتك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{approval.title}</h4>
                      <span className={`status-badge text-xs ${getPriorityColor(approval.priority)}`}>
                        {approval.priority === 'high' ? 'عالي' : approval.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-gray-600">🏪 {approval.restaurantName}</p>
                      <p className="text-xs font-medium text-green-600">
                        💰 {formatCurrency(approval.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        📅 {formatDate(approval.requestDate)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 space-x-reverse">
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => handleApproval(approval.id, 'approve')}
                      >
                        ✅ موافقة
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleApproval(approval.id, 'reject')}
                      >
                        ❌ رفض
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع الطلبات
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>نظرة عامة مالية</CardTitle>
              <CardDescription>ملخص الوضع المالي والمخاطر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(dashboardData.guarantees.totalValue)}
                  </div>
                  <p className="text-sm text-blue-800">إجمالي الضمانات</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(dashboardData.installments.totalFinanced)}
                  </div>
                  <p className="text-sm text-green-800">إجمالي التمويل</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {formatCurrency(dashboardData.installments.monthlyCollections)}
                  </div>
                  <p className="text-sm text-orange-800">التحصيل الشهري</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {((dashboardData.installments.monthlyCollections / dashboardData.installments.totalFinanced) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-purple-800">معدل التحصيل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
