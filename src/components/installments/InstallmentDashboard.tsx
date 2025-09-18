/**
 * لوحة تحكم الأقساط البنكية - نظام لاند سبايس
 * الوحدة الحادية عشرة: نظام الأقساط البنكية
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  BanknoteIcon,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Filter,
  HandCoins,
  Phone,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  XCircle
} from 'lucide-react'

import {
  InstallmentPlan,
  InstallmentPayment,
  InstallmentPlanStatus,
  YemeniBank
} from '@/lib/installments/types'

interface DashboardStats {
  totalPlans: number
  activePlans: number
  completedPlans: number
  overdueAmount: number
  collectedThisMonth: number
  averageCreditScore: number
}

export default function InstallmentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlans: 0,
    activePlans: 0,
    completedPlans: 0,
    overdueAmount: 0,
    collectedThisMonth: 0,
    averageCreditScore: 0
  })

  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [overduePayments, setOverduePayments] = useState<InstallmentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null)
  const [showPlanDetails, setShowPlanDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // محاكاة تحميل البيانات
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats({
        totalPlans: 124,
        activePlans: 87,
        completedPlans: 31,
        overdueAmount: 2850000,
        collectedThisMonth: 12450000,
        averageCreditScore: 72.5
      })

      // بيانات عينة لخطط الأقساط
      const samplePlans: InstallmentPlan[] = [
        {
          id: 'plan_001',
          planNumber: 'PLN-2025-0001',
          contractId: 'cont_001',
          restaurantId: 'rest_001',
          restaurantName: 'مطعم الأصالة اليمنية',
          bankId: 'AlQasimi',
          totalAmount: 500000,
          currency: 'YER',
          installmentCount: 12,
          installmentAmount: 45000,
          frequency: 'monthly',
          interestRate: 0.12,
          processingFee: 2500,
          lateFee: 100,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          firstInstallmentDate: new Date('2025-02-01'),
          gracePeriod: 7,
          status: 'active',
          approvalDate: new Date('2024-12-15'),
          activationDate: new Date('2025-01-01'),
          terms: 'شروط وأحكام قياسية للأقساط البنكية',
          createdBy: 'admin',
          approvedBy: 'bank_officer',
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date('2025-01-01'),
          attachments: []
        }
      ]

      setInstallmentPlans(samplePlans)

      const sampleOverduePayments: InstallmentPayment[] = [
        {
          id: 'pay_001',
          planId: 'plan_002',
          installmentNumber: 3,
          dueDate: new Date('2025-02-01'),
          amount: 46000,
          principalAmount: 40000,
          interestAmount: 6000,
          totalAmount: 46000,
          status: 'overdue',
          daysPastDue: 17,
          remindersSent: 2,
          lastReminderDate: new Date('2025-02-10'),
          bankProcessed: false,
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date('2025-02-18')
        }
      ]

      setOverduePayments(sampleOverduePayments)

    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: InstallmentPlanStatus) => {
    const statusConfig = {
      draft: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      pending: { label: 'معلق', variant: 'warning' as const, icon: Clock },
      approved: { label: 'معتمد', variant: 'success' as const, icon: CheckCircle },
      active: { label: 'نشط', variant: 'default' as const, icon: TrendingUp },
      completed: { label: 'مكتمل', variant: 'success' as const, icon: CheckCircle },
      suspended: { label: 'معلق', variant: 'warning' as const, icon: AlertCircle },
      defaulted: { label: 'متعثر', variant: 'destructive' as const, icon: XCircle },
      restructured: { label: 'معاد الهيكلة', variant: 'secondary' as const, icon: FileText },
      cancelled: { label: 'ملغي', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getBankName = (bankId: YemeniBank) => {
    const bankNames = {
      'AlQasimi': 'بنك القاسمي',
      'NationalBank': 'البنك الأهلي',
      'SabaBank': 'بنك سبأ الإسلامي',
      'YemenBank': 'بنك اليمن',
      'CAC': 'بنك التسليف التعاوني',
      'IslamicBank': 'البنك الإسلامي',
      'UnitedBank': 'البنك المتحد',
      'InvestmentBank': 'بنك الاستثمار',
      'CommercialBank': 'البنك التجاري',
      'DevelopmentBank': 'بنك التنمية'
    }
    return bankNames[bankId] || bankId
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const StatsCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الخطط</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlans.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activePlans} نشط، {stats.completedPlans} مكتمل
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المبلغ المتأخر</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.overdueAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            يحتاج متابعة عاجلة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المحصل هذا الشهر</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.collectedThisMonth)}
          </div>
          <p className="text-xs text-muted-foreground">
            +12% عن الشهر الماضي
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط التقييم الائتماني</CardTitle>
          <HandCoins className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.averageCreditScore.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            تقييم جيد للمحفظة
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const InstallmentPlansTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            خطط الأقساط
          </span>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            خطة جديدة
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الخطة</TableHead>
                <TableHead>المطعم</TableHead>
                <TableHead>البنك</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>عدد الأقساط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    جارٍ تحميل البيانات...
                  </TableCell>
                </TableRow>
              ) : installmentPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    لا توجد خطط أقساط
                  </TableCell>
                </TableRow>
              ) : (
                installmentPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.planNumber}</TableCell>
                    <TableCell>{plan.restaurantName}</TableCell>
                    <TableCell>{getBankName(plan.bankId)}</TableCell>
                    <TableCell>{formatCurrency(plan.totalAmount)}</TableCell>
                    <TableCell>{plan.installmentCount}</TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell>{formatDate(plan.startDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan)
                            setShowPlanDetails(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  const OverduePaymentsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          الأقساط المتأخرة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">جارٍ التحميل...</div>
        ) : overduePayments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            لا توجد أقساط متأخرة
          </div>
        ) : (
          <div className="space-y-3">
            {overduePayments.map((payment) => (
              <div key={payment.id} className="p-3 border rounded-lg bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">قسط رقم {payment.installmentNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      خطة: {payment.planId}
                    </p>
                    <p className="text-sm text-red-600">
                      متأخر {payment.daysPastDue} يوم
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-red-600">
                      {formatCurrency(payment.totalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      استحقاق: {formatDate(payment.dueDate)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-3 h-3 mr-1" />
                    اتصال
                  </Button>
                  <Button size="sm" variant="outline">
                    <Receipt className="w-3 h-3 mr-1" />
                    تسوية
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const PlanDetailsDialog = () => (
    <Dialog open={showPlanDetails} onOpenChange={setShowPlanDetails}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل خطة الأقساط</DialogTitle>
          <DialogDescription>
            {selectedPlan?.planNumber} - {selectedPlan?.restaurantName}
          </DialogDescription>
        </DialogHeader>
        
        {selectedPlan && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>المطعم</Label>
                <div className="font-medium">{selectedPlan.restaurantName}</div>
              </div>
              <div>
                <Label>البنك الممول</Label>
                <div className="font-medium">{getBankName(selectedPlan.bankId)}</div>
              </div>
              <div>
                <Label>المبلغ الإجمالي</Label>
                <div className="font-medium text-lg">{formatCurrency(selectedPlan.totalAmount)}</div>
              </div>
              <div>
                <Label>مبلغ القسط</Label>
                <div className="font-medium">{formatCurrency(selectedPlan.installmentAmount)}</div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPlanDetails(false)}>
            إغلاق
          </Button>
          <Button>
            <Receipt className="w-4 h-4 mr-2" />
            عرض الأقساط
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الأقساط البنكية</h1>
          <p className="text-muted-foreground">
            إدارة شاملة للأقساط والتكامل مع البنوك اليمنية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            تقرير شامل
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            خطة جديدة
          </Button>
        </div>
      </div>

      <StatsCards />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="plans">خطط الأقساط</TabsTrigger>
          <TabsTrigger value="overdue">المتأخرات</TabsTrigger>
          <TabsTrigger value="collection">التحصيل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <InstallmentPlansTable />
            </div>
            <div>
              <OverduePaymentsCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <InstallmentPlansTable />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <OverduePaymentsCard />
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة التحصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                قريباً - واجهة إدارة التحصيل
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PlanDetailsDialog />
    </div>
  )
}
