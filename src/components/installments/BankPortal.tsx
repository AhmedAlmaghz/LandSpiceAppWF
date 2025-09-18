/**
 * واجهة البنك المخصصة - نظام لاند سبايس
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
import { Textarea } from '@/components/ui/textarea'
import {
  Building2,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  TrendingUp,
  Wallet,
  XCircle
} from 'lucide-react'

import {
  BankApprovalRequest,
  InstallmentPlan,
  YemeniBank
} from '@/lib/installments/types'

interface BankDashboardStats {
  pendingRequests: number
  approvedThisMonth: number
  totalExposure: number
  defaultRate: number
  averageProcessingTime: number
  portfolioHealth: number
}

export default function BankPortal() {
  const [currentBank] = useState<YemeniBank>('AlQasimi')
  const [stats, setStats] = useState<BankDashboardStats>({
    pendingRequests: 0,
    approvedThisMonth: 0,
    totalExposure: 0,
    defaultRate: 0,
    averageProcessingTime: 0,
    portfolioHealth: 0
  })

  const [approvalRequests, setApprovalRequests] = useState<BankApprovalRequest[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<BankApprovalRequest | null>(null)
  const [showRequestDetails, setShowRequestDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    loadBankDashboardData()
  }, [])

  const loadBankDashboardData = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats({
        pendingRequests: 12,
        approvedThisMonth: 87,
        totalExposure: 45750000,
        defaultRate: 3.2,
        averageProcessingTime: 2.8,
        portfolioHealth: 78.5
      })

      const sampleRequests: BankApprovalRequest[] = [
        {
          id: 'req_001',
          requestNumber: 'REQ-2025-0001',
          requestType: 'new_plan',
          restaurantId: 'rest_001',
          requestedAmount: 500000,
          proposedTerms: 'تمويل 12 شهر بمعدل فائدة 12% سنوياً',
          justification: 'توسعة المطعم وشراء معدات جديدة',
          status: 'submitted',
          submittedDate: new Date('2025-01-15'),
          followUpRequired: true,
          submittedBy: 'admin',
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15')
        },
        {
          id: 'req_002',
          requestNumber: 'REQ-2025-0002',
          requestType: 'restructuring',
          restaurantId: 'rest_002',
          requestedAmount: 750000,
          proposedTerms: 'إعادة هيكلة 18 شهر مع تأجيل 3 أشهر',
          justification: 'صعوبات مالية مؤقتة بسبب الظروف الاقتصادية',
          status: 'under_review',
          submittedDate: new Date('2025-01-10'),
          reviewStartDate: new Date('2025-01-12'),
          bankOfficer: 'سعد أحمد المقطري',
          followUpRequired: true,
          submittedBy: 'admin',
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date('2025-01-12')
        }
      ]

      setApprovalRequests(sampleRequests)

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
          startDate: new Date('2025-02-01'),
          endDate: new Date('2026-01-31'),
          firstInstallmentDate: new Date('2025-03-01'),
          gracePeriod: 7,
          status: 'active',
          approvalDate: new Date('2025-01-20'),
          activationDate: new Date('2025-02-01'),
          terms: 'شروط وأحكام قياسية للأقساط البنكية - بنك القاسمي',
          createdBy: 'admin',
          approvedBy: 'أحمد محمد القاسمي',
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-02-01'),
          attachments: []
        }
      ]

      setInstallmentPlans(samplePlans)

    } catch (error) {
      console.error('خطأ في تحميل بيانات واجهة البنك:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBankName = (bankId: YemeniBank) => {
    const bankNames = {
      'AlQasimi': 'بنك القاسمي',
      'NationalBank': 'البنك الأهلي اليمني',
      'SabaBank': 'بنك سبأ الإسلامي',
      'YemenBank': 'بنك اليمن',
      'CAC': 'بنك التسليف التعاوني',
      'IslamicBank': 'البنك الإسلامي اليمني',
      'UnitedBank': 'البنك المتحد',
      'InvestmentBank': 'بنك الاستثمار والتنمية',
      'CommercialBank': 'البنك التجاري اليمني',
      'DevelopmentBank': 'بنك التنمية الزراعية'
    }
    return bankNames[bankId] || bankId
  }

  const getRequestStatusBadge = (status: BankApprovalRequest['status']) => {
    const statusConfig = {
      submitted: { label: 'مقدم', variant: 'secondary' as const, icon: FileText },
      under_review: { label: 'قيد المراجعة', variant: 'warning' as const, icon: Clock },
      approved: { label: 'معتمد', variant: 'success' as const, icon: CheckCircle },
      rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: XCircle },
      requires_modification: { label: 'يحتاج تعديل', variant: 'warning' as const, icon: FileText }
    }

    const config = statusConfig[status] || statusConfig.submitted
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getRequestTypeLabel = (type: BankApprovalRequest['requestType']) => {
    const typeLabels = {
      new_plan: 'خطة جديدة',
      modification: 'تعديل خطة',
      restructuring: 'إعادة هيكلة',
      settlement: 'تسوية'
    }
    return typeLabels[type] || type
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

  const BankStatsCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground">يحتاج مراجعة عاجلة</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معتمد هذا الشهر</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.approvedThisMonth}</div>
          <p className="text-xs text-muted-foreground">+15% عن الشهر الماضي</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المحفظة</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalExposure)}
          </div>
          <p className="text-xs text-muted-foreground">المبلغ الإجمالي المعرض للمخاطر</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">صحة المحفظة</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.portfolioHealth.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            معدل تعثر {stats.defaultRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const PendingRequestsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            طلبات الموافقة المعلقة
          </span>
          <Badge variant="outline" className="text-orange-600">
            {approvalRequests.filter(r => ['submitted', 'under_review'].includes(r.status)).length} طلب
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ المطلوب</TableHead>
                <TableHead>تاريخ التقديم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المراجع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    جارٍ تحميل البيانات...
                  </TableCell>
                </TableRow>
              ) : (
                approvalRequests
                  .filter(req => ['submitted', 'under_review'].includes(req.status))
                  .map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.requestNumber}</TableCell>
                      <TableCell>{getRequestTypeLabel(request.requestType)}</TableCell>
                      <TableCell>{formatCurrency(request.requestedAmount)}</TableCell>
                      <TableCell>{formatDate(request.submittedDate)}</TableCell>
                      <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.bankOfficer || 'غير محدد'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowRequestDetails(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            معالجة
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

  const ApprovedPlansCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          الخطط المعتمدة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">جارٍ التحميل...</div>
        ) : installmentPlans.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            لا توجد خطط معتمدة
          </div>
        ) : (
          <div className="space-y-3">
            {installmentPlans.map((plan) => (
              <div key={plan.id} className="p-3 border rounded-lg bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{plan.planNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.restaurantName}
                    </p>
                    <p className="text-sm text-green-600">
                      {plan.installmentCount} قسط × {formatCurrency(plan.installmentAmount)}
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-green-600">
                      {formatCurrency(plan.totalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      معتمد: {plan.approvalDate ? formatDate(plan.approvalDate) : 'غير محدد'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const RequestDetailsDialog = () => (
    <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل طلب الموافقة</DialogTitle>
          <DialogDescription>
            {selectedRequest?.requestNumber} - {getRequestTypeLabel(selectedRequest?.requestType || 'new_plan')}
          </DialogDescription>
        </DialogHeader>
        
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>رقم الطلب</Label>
                <div className="font-medium">{selectedRequest.requestNumber}</div>
              </div>
              <div>
                <Label>نوع الطلب</Label>
                <div className="font-medium">{getRequestTypeLabel(selectedRequest.requestType)}</div>
              </div>
              <div>
                <Label>المبلغ المطلوب</Label>
                <div className="font-medium text-lg">{formatCurrency(selectedRequest.requestedAmount)}</div>
              </div>
              <div>
                <Label>الحالة</Label>
                <div className="font-medium">{getRequestStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">تفاصيل الطلب</h3>
              <div className="space-y-3">
                <div>
                  <Label>الشروط المقترحة</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    {selectedRequest.proposedTerms}
                  </div>
                </div>
                <div>
                  <Label>المبررات</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    {selectedRequest.justification}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRequestDetails(false)}>
            إغلاق
          </Button>
          <Button>
            <FileCheck className="w-4 h-4 mr-2" />
            معالجة الطلب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            {getBankName(currentBank)}
          </h1>
          <p className="text-muted-foreground">
            بوابة البنك لمراجعة واعتماد طلبات الأقساط البنكية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            تقرير بنكي
          </Button>
        </div>
      </div>

      <BankStatsCards />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">الطلبات المعلقة</TabsTrigger>
          <TabsTrigger value="approved">الخطط المعتمدة</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <PendingRequestsTable />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>إرشادات المراجعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">المراجعة الفنية:</p>
                    <p>تحقق من الوثائق والضمانات المطلوبة</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium">التقييم الائتماني:</p>
                    <p>راجع تاريخ السداد والوضع المالي</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium">الموافقة:</p>
                    <p>تأكد من التزام الشروط البنكية</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <ApprovedPlansCard />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>ملخص المحفظة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span>إجمالي الخطط:</span>
                      <span className="font-medium">{installmentPlans.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المبلغ الإجمالي:</span>
                      <span className="font-medium">{formatCurrency(stats.totalExposure)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل الأداء:</span>
                      <span className="font-medium text-green-600">{stats.portfolioHealth.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التقارير البنكية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                قريباً - تقارير البنك المفصلة
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RequestDetailsDialog />
    </div>
  )
}
