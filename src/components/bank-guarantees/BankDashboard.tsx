'use client'

import React, { useState, useEffect } from 'react'
import { BankGuarantee } from '@/lib/bank-guarantees/types'
import BankGuaranteeCard from './BankGuaranteeCard'
import StatCard from '@/components/dashboard/StatCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

interface BankDashboardProps {
  bankId: string
  bankName: string
}

export default function BankDashboard({ bankId, bankName }: BankDashboardProps) {
  const [guarantees, setGuarantees] = useState<BankGuarantee[]>([])
  const [pendingGuarantees, setPendingGuarantees] = useState<BankGuarantee[]>([])
  const [selectedGuarantee, setSelectedGuarantee] = useState<BankGuarantee | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalData, setApprovalData] = useState({
    approved: true,
    notes: '',
    referenceNumber: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBankGuarantees()
  }, [bankId])

  const loadBankGuarantees = async () => {
    setLoading(true)
    try {
      // Mock data - في التطبيق الحقيقي سيكون API call
      const mockGuarantees: BankGuarantee[] = [
        {
          id: 'guarantee_001',
          guaranteeNumber: 'BG-202409-123456',
          type: 'performance',
          status: 'submitted',
          priority: 'high',
          title: 'ضمان حسن تنفيذ عقد التصميم - مطعم الذواقة',
          
          applicant: {
            id: 'applicant_001',
            type: 'restaurant',
            name: 'مطعم الذواقة اليمني',
            legalName: 'شركة الذواقة للمطاعم والضيافة المحدودة',
            address: {
              street: 'شارع الستين',
              district: 'التحرير',
              city: 'صنعاء',
              governorate: 'صنعاء',
              country: 'اليمن'
            },
            contact: {
              primaryContact: 'محمد أحمد الشامي',
              position: 'المدير العام',
              phone: '+967-1-456789',
              email: 'info@althawaqah.ye'
            }
          },
          
          beneficiary: {
            id: 'beneficiary_001',
            type: 'landspice',
            name: 'شركة لاند سبايس اليمنية',
            legalName: 'شركة لاند سبايس للتجارة والتسويق المحدودة',
            address: {
              street: 'شارع الحديدة',
              district: 'الصافية',
              city: 'صنعاء',
              governorate: 'صنعاء',
              country: 'اليمن'
            },
            contact: {
              primaryContact: 'علي سالم العبدلي',
              position: 'مدير المبيعات',
              phone: '+967-1-789012',
              email: 'sales@landspice.ye'
            }
          },
          
          bank: {
            id: bankId,
            name: bankName,
            branchName: 'الفرع الرئيسي - صنعاء',
            address: {
              street: 'شارع الزبيري',
              city: 'صنعاء',
              governorate: 'صنعاء',
              country: 'اليمن'
            },
            contact: {
              phone: '+967-1-234567',
              manager: 'أحمد محمد الحداد'
            },
            commissionRates: {
              performance: 2.5,
              advancePayment: 3.0,
              maintenance: 2.0,
              bidBond: 1.5,
              customs: 2.5,
              finalPayment: 2.0
            },
            processingDays: {
              standard: 7,
              urgent: 3
            },
            workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
            workingHours: {
              start: '08:00',
              end: '14:00'
            },
            isActive: true
          },
          
          amount: 50000,
          currency: 'USD',
          commissionRate: 2.5,
          commissionAmount: 1250,
          
          applicationDate: new Date('2024-09-01'),
          expiryDate: new Date('2025-09-10'),
          
          documents: [],
          submittedBy: 'user_restaurant',
          
          statusHistory: [{
            id: 'history_001',
            status: 'submitted',
            timestamp: new Date(),
            changedBy: 'system',
            automaticChange: false
          }],
          
          alerts: [],
          
          isRenewable: true,
          autoRenewal: false,
          renewalNoticeDays: 30,
          
          tags: ['تصميم', 'مطاعم'],
          notes: [],
          
          createdDate: new Date('2024-09-01'),
          lastModified: new Date(),
          createdBy: 'user_restaurant',
          lastModifiedBy: 'user_restaurant',
          version: '1.0',
          isArchived: false
        }
      ]

      setGuarantees(mockGuarantees)
      setPendingGuarantees(mockGuarantees.filter(g => 
        ['submitted', 'under_review'].includes(g.status)
      ))
    } catch (error) {
      console.error('Error loading bank guarantees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReject = (guarantee: BankGuarantee) => {
    setSelectedGuarantee(guarantee)
    setShowApprovalModal(true)
    setApprovalData({
      approved: true,
      notes: '',
      referenceNumber: `${bankId.toUpperCase()}-${Date.now()}`
    })
  }

  const submitApproval = async () => {
    if (!selectedGuarantee) return

    try {
      // في التطبيق الحقيقي، هذا سيكون API call
      console.log('تسجيل رد البنك:', {
        guaranteeId: selectedGuarantee.id,
        approved: approvalData.approved,
        notes: approvalData.notes,
        referenceNumber: approvalData.referenceNumber
      })

      // تحديث الحالة محلياً
      setGuarantees(prev => prev.map(g => 
        g.id === selectedGuarantee.id 
          ? {
              ...g,
              status: approvalData.approved ? 'approved' : 'rejected',
              bankNotes: approvalData.notes,
              referenceNumber: approvalData.approved ? approvalData.referenceNumber : undefined
            }
          : g
      ))

      setShowApprovalModal(false)
      setSelectedGuarantee(null)
    } catch (error) {
      console.error('Error processing approval:', error)
    }
  }

  const stats = {
    total: guarantees.length,
    pending: guarantees.filter(g => ['submitted', 'under_review'].includes(g.status)).length,
    approved: guarantees.filter(g => g.status === 'approved').length,
    totalValue: guarantees.reduce((sum, g) => sum + g.amount, 0),
    commission: guarantees.reduce((sum, g) => sum + g.commissionAmount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">لوحة تحكم البنك</h1>
        <p className="text-green-100">{bankName}</p>
        <p className="text-green-100 text-sm">إدارة ومراجعة طلبات الضمانات البنكية</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.total.toString()}
          icon="📋"
          trend={stats.total > 0 ? { value: 0, isPositive: true } : undefined}
        />
        <StatCard
          title="طلبات معلقة"
          value={stats.pending.toString()}
          icon="⏳"
          color="orange"
          trend={stats.pending > 0 ? { value: stats.pending, isPositive: false } : undefined}
        />
        <StatCard
          title="طلبات موافق عليها"
          value={stats.approved.toString()}
          icon="✅"
          color="green"
          trend={stats.approved > 0 ? { value: stats.approved, isPositive: true } : undefined}
        />
        <StatCard
          title="إجمالي العمولات"
          value={`${formatCurrency(stats.commission)}`}
          icon="💰"
          color="blue"
        />
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            الطلبات المعلقة ({pendingGuarantees.length})
          </h2>
          <Button 
            onClick={loadBankGuarantees}
            variant="secondary"
            size="sm"
          >
            🔄 تحديث
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : pendingGuarantees.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات معلقة</h3>
            <p className="text-gray-500">جميع الطلبات تمت مراجعتها</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingGuarantees.map((guarantee) => (
              <div key={guarantee.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{guarantee.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{guarantee.guaranteeNumber}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">مقدم الطلب:</span>
                        <p>{guarantee.applicant.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">المبلغ:</span>
                        <p>{formatCurrency(guarantee.amount)} {guarantee.currency}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">العمولة:</span>
                        <p>{formatCurrency(guarantee.commissionAmount)} {guarantee.currency}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      onClick={() => handleApproveReject(guarantee)}
                      size="sm"
                    >
                      مراجعة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Guarantees */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          جميع الضمانات ({guarantees.length})
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {guarantees.map((guarantee) => (
            <BankGuaranteeCard
              key={guarantee.id}
              guarantee={guarantee}
              variant="compact"
              showActions={false}
            />
          ))}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedGuarantee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              مراجعة طلب الضمانة
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedGuarantee.title}</h4>
              <p className="text-sm text-gray-600">{selectedGuarantee.guaranteeNumber}</p>
              <p className="text-sm text-gray-600">
                المبلغ: {formatCurrency(selectedGuarantee.amount)} {selectedGuarantee.currency}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القرار
                </label>
                <div className="flex space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={approvalData.approved}
                      onChange={() => setApprovalData(prev => ({ ...prev, approved: true }))}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="mr-2 text-sm text-gray-700">موافقة</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!approvalData.approved}
                      onChange={() => setApprovalData(prev => ({ ...prev, approved: false }))}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="mr-2 text-sm text-gray-700">رفض</span>
                  </label>
                </div>
              </div>

              {approvalData.approved && (
                <Input
                  label="رقم مرجع البنك"
                  value={approvalData.referenceNumber}
                  onChange={(e) => setApprovalData(prev => ({ 
                    ...prev, 
                    referenceNumber: e.target.value 
                  }))}
                  placeholder="QAS-2024-789"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="ملاحظات البنك..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
              <Button
                onClick={() => setShowApprovalModal(false)}
                variant="secondary"
              >
                إلغاء
              </Button>
              <Button
                onClick={submitApproval}
                className={approvalData.approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {approvalData.approved ? 'موافقة' : 'رفض'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
