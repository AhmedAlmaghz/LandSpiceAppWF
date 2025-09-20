'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { Contract } from '@/lib/contracts/types'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function ContractDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const contractId = params.id as string
  
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (contractId) {
      fetchContractDetails()
    }
  }, [contractId])

  const fetchContractDetails = async () => {
    try {
      setIsLoading(true)
      
      // بيانات تجريبية مبسطة
      const mockContract: Contract = {
        id: contractId,
        title: 'عقد توريد منتجات لاند سبايس',
        contractNumber: 'LS-REST-2025-001',
        type: 'supply',
        category: 'supply_chain',
        parties: [],
        primaryParty: 'landspice',
        secondaryParty: 'restaurant',
        status: 'active',
        priority: 'high',
        createdDate: new Date('2025-01-01'),
        effectiveDate: new Date('2025-01-15'),
        expiryDate: new Date('2025-12-31'),
        lastModified: new Date(),
        terms: [],
        financials: {
          totalValue: 50000,
          currency: 'SAR',
          paymentTerms: {
            method: 'monthly',
            dueDate: 30,
            penaltyRate: 0.1,
            discountRate: 0.02
          },
          guaranteeRequired: 5000,
          guaranteeType: 'bank_guarantee'
        },
        deliverables: [],
        governingLaw: 'القانون اليمني',
        jurisdiction: 'محاكم صنعاء',
        disputeResolution: 'arbitration',
        confidentialityLevel: 'internal',
        documents: [],
        approvalStatus: {
          step: 'signed',
          approvedBy: ['landspice', 'restaurant'],
          rejectedBy: [],
          pendingApprovers: []
        },
        metadata: {
          createdBy: 'admin',
          lastModifiedBy: 'admin'
        },
        tags: ['توريد', 'توابل', 'شهري']
      }

      setContract(mockContract)
    } catch (error) {
      console.error('خطأ في جلب تفاصيل العقد:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'restaurant') redirect('/auth/signin')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل العقد...</p>
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">العقد غير موجود</h3>
            <p className="text-gray-600 mb-6">لم يتم العثور على العقد المطلوب</p>
            <Button onClick={() => router.push('/restaurant/contract')}>
              العودة للعقود
            </Button>
          </CardContent>
        </Card>
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
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/restaurant/contract')}
                >
                  ← العودة
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
                  <p className="text-gray-600">رقم العقد: {contract.contractNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`status-badge ${
                  contract.status === 'active' ? 'bg-green-100 text-green-800' :
                  contract.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {contract.status === 'active' ? '✅ نشط' : contract.status}
                </span>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(`/api/contracts/${contract.id}/pdf`, '_blank')}
                >
                  📄 تحميل PDF
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Contract Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص العقد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">معلومات أساسية</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">النوع:</span> توريد</div>
                      <div><span className="text-gray-600">الفئة:</span> سلسلة التوريد</div>
                      <div><span className="text-gray-600">الأولوية:</span> <span className="text-red-600">عالية</span></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">التواريخ</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">تاريخ البداية:</span> {formatDate(contract.effectiveDate)}</div>
                      <div><span className="text-gray-600">تاريخ الانتهاء:</span> {formatDate(contract.expiryDate)}</div>
                      <div><span className="text-gray-600">آخر تحديث:</span> {formatDate(contract.lastModified)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">القيم المالية</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">القيمة الإجمالية:</span> <span className="text-green-600 font-medium">{formatCurrency(contract.financials.totalValue)}</span></div>
                      <div><span className="text-gray-600">العملة:</span> {contract.financials.currency}</div>
                      <div><span className="text-gray-600">الضمان المطلوب:</span> {formatCurrency(contract.financials.guaranteeRequired)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>شروط الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span className="font-medium mr-2">شهري</span>
                    </div>
                    <div>
                      <span className="text-gray-600">مهلة الدفع:</span>
                      <span className="font-medium mr-2">{contract.financials.paymentTerms.dueDate} يوم</span>
                    </div>
                    <div>
                      <span className="text-gray-600">خصم الدفع المبكر:</span>
                      <span className="font-medium mr-2 text-green-600">2%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">غرامة التأخير:</span>
                      <span className="font-medium mr-2 text-red-600">0.1% يومياً</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Information */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات القانونية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">القانون الحاكم:</span>
                    <div className="font-medium">{contract.governingLaw}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">الاختصاص القضائي:</span>
                    <div className="font-medium">{contract.jurisdiction}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">حل النزاعات:</span>
                    <div className="font-medium">
                      {contract.disputeResolution === 'arbitration' ? 'التحكيم' : 'التقاضي'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="py-6">
                <div className="flex justify-center space-x-4 space-x-reverse">
                  <Button
                    variant="outline"
                    onClick={() => window.open('/restaurant/support', '_blank')}
                  >
                    📞 تواصل مع الدعم
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => window.open(`/api/contracts/${contract.id}/pdf`, '_blank')}
                  >
                    📄 تحميل نسخة PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
