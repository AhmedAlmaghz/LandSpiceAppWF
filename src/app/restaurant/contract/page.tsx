'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatCard from '@/components/dashboard/StatCard'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import ContractList from '@/components/contracts/ContractList'
import { Contract } from '@/lib/contracts/types'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface ContractStats {
  total: number
  active: number
  signed: number
  pending: number
  totalValue: number
  monthlyValue: number
}

export default function RestaurantContractPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')

  useEffect(() => {
    fetchContractData()
  }, [])

  const fetchContractData = async () => {
    try {
      setIsLoading(true)
      
      // محاولة جلب البيانات من API
      const response = await fetch('/api/restaurant/contracts')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setContracts(data.data.contracts)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية
        const mockContracts: Contract[] = [
          {
            id: '1',
            title: 'عقد توريد منتجات لاند سبايس',
            contractNumber: 'LS-REST-2025-001',
            type: 'supply',
            category: 'supply_chain',
            parties: [
              {
                id: 'landspice',
                type: 'landspice',
                name: 'شركة لاند سبايس للتوابل',
                legalName: 'Land Spice Company Ltd',
                registrationNumber: '1234567890',
                taxId: 'LS-TAX-001',
                address: {
                  street: 'شارع الزبيري',
                  city: 'صنعاء',
                  region: 'أمانة العاصمة',
                  postalCode: '12345',
                  country: 'اليمن'
                },
                contact: {
                  name: 'أحمد محمد',
                  position: 'مدير المبيعات',
                  phone: '+967-1-234567',
                  email: 'ahmed@landspice.ye'
                },
                signatory: {
                  name: 'محمد عبدالله',
                  position: 'المدير العام',
                  nationalId: '12-34-567890'
                }
              },
              {
                id: 'restaurant',
                type: 'restaurant',
                name: 'مطعم البركة',
                legalName: 'Al-Baraka Restaurant LLC',
                registrationNumber: '9876543210',
                address: {
                  street: 'شارع الستين',
                  city: 'صنعاء',
                  region: 'أمانة العاصمة',
                  country: 'اليمن'
                },
                contact: {
                  name: 'عبدالرحمن أحمد',
                  position: 'مدير المطعم',
                  phone: '+967-1-987654',
                  email: 'manager@albaraka.ye'
                },
                signatory: {
                  name: 'عبدالرحمن أحمد',
                  position: 'المالك',
                  nationalId: '98-76-543210'
                }
              }
            ],
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
        ]

        const mockStats: ContractStats = {
          total: 1,
          active: 1,
          signed: 1,
          pending: 0,
          totalValue: 50000,
          monthlyValue: 4167
        }

        setContracts(mockContracts)
        setStats(mockStats)
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات العقود:', error)
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

  const handleViewContract = (contract: Contract) => {
    router.push(`/restaurant/contract/${contract.id}`)
  }

  const handleDownloadContract = (contract: Contract) => {
    window.open(`/api/contracts/${contract.id}/pdf`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل العقد...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">📝 عقد الخدمة</h1>
                <p className="text-gray-600">
                  عرض وإدارة عقد الخدمة مع شركة لاند سبايس
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/restaurant/contract/terms', '_blank')}
                >
                  📋 شروط الخدمة
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/restaurant/support')}
                >
                  📞 الدعم
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="إجمالي العقود"
                value={stats.total}
                subtitle="عقد"
                icon="📝"
                color="blue"
              />
              
              <StatCard
                title="العقود النشطة"
                value={stats.active}
                subtitle="عقد"
                icon="✅"
                color="green"
              />
              
              <StatCard
                title="القيمة الإجمالية"
                value={formatCurrency(stats.totalValue)}
                icon="💰"
                color="purple"
              />
              
              <StatCard
                title="القيمة الشهرية"
                value={formatCurrency(stats.monthlyValue)}
                icon="📊"
                color="orange"
              />
            </div>
          )}

          {/* Contract Details */}
          {contracts.length > 0 && (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <Card key={contract.id} className="border-r-4 border-r-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {contract.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          رقم العقد: {contract.contractNumber}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className={`status-badge ${
                          contract.status === 'active' ? 'bg-green-100 text-green-800' :
                          contract.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                          contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contract.status === 'active' ? '✅ نشط' :
                           contract.status === 'signed' ? '📝 موقع' :
                           contract.status === 'pending' ? '⏳ معلق' : contract.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* معلومات العقد */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">تفاصيل العقد</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">نوع العقد:</span>
                            <span className="font-medium">
                              {contract.type === 'supply' ? 'توريد' :
                               contract.type === 'service' ? 'خدمة' :
                               contract.type === 'partnership' ? 'شراكة' : contract.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الفئة:</span>
                            <span className="font-medium">
                              {contract.category === 'supply_chain' ? 'سلسلة التوريد' :
                               contract.category === 'design' ? 'تصميم' :
                               contract.category === 'printing' ? 'طباعة' : contract.category}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الأولوية:</span>
                            <span className={`font-medium ${
                              contract.priority === 'high' ? 'text-red-600' :
                              contract.priority === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {contract.priority === 'high' ? 'عالية' :
                               contract.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* التواريخ */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">التواريخ المهمة</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">تاريخ البداية:</span>
                            <span className="font-medium">{formatDate(contract.effectiveDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">تاريخ الانتهاء:</span>
                            <span className="font-medium">{formatDate(contract.expiryDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">آخر تحديث:</span>
                            <span className="font-medium">{formatDate(contract.lastModified)}</span>
                          </div>
                        </div>
                      </div>

                      {/* المالية */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">التفاصيل المالية</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">القيمة الإجمالية:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(contract.financials.totalValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طريقة الدفع:</span>
                            <span className="font-medium">
                              {contract.financials.paymentTerms.method === 'monthly' ? 'شهري' :
                               contract.financials.paymentTerms.method === 'quarterly' ? 'ربع سنوي' :
                               contract.financials.paymentTerms.method === 'annually' ? 'سنوي' : 'أخرى'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">مهلة الدفع:</span>
                            <span className="font-medium">{contract.financials.paymentTerms.dueDate} يوم</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الأطراف */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-gray-900 mb-4">أطراف العقد</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contract.parties.map((party) => (
                          <div key={party.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3 space-x-reverse mb-3">
                              <span className="text-2xl">
                                {party.type === 'landspice' ? '🏢' :
                                 party.type === 'restaurant' ? '🍽️' :
                                 party.type === 'bank' ? '🏦' : '👥'}
                              </span>
                              <div>
                                <h5 className="font-medium text-gray-900">{party.name}</h5>
                                <p className="text-sm text-gray-600">{party.legalName}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">العنوان: </span>
                                <span>{party.address.street}, {party.address.city}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">جهة الاتصال: </span>
                                <span>{party.contact.name} ({party.contact.position})</span>
                              </div>
                              <div>
                                <span className="text-gray-600">الهاتف: </span>
                                <span>{party.contact.phone}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">البريد: </span>
                                <span>{party.contact.email}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* الإجراءات */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          القانون الحاكم: {contract.governingLaw} | 
                          الاختصاص القضائي: {contract.jurisdiction}
                        </div>
                        
                        <div className="flex space-x-3 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewContract(contract)}
                          >
                            👁️ عرض التفاصيل
                          </Button>
                          
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDownloadContract(contract)}
                          >
                            📄 تحميل PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Contracts State */}
          {contracts.length === 0 && !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد عقود</h3>
                <p className="text-gray-600 mb-6">
                  لم يتم العثور على أي عقود مرتبطة بمطعمكم حالياً
                </p>
                <Button 
                  variant="primary"
                  onClick={() => router.push('/restaurant/support')}
                >
                  تواصل مع الدعم
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedComponent>
  )
}
