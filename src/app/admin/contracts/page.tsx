// Admin Contracts Management Page
// صفحة إدارة العقود للمدير

'use client'

import React, { useState, useEffect } from 'react'
import { Contract, ContractStats } from '@/lib/contracts/types'
import { ContractService } from '@/lib/contracts/contract-service'
import { Button } from '@/components/ui/Button'
import ContractList from '@/components/contracts/ContractList'
import StatCard from '@/components/dashboard/StatCard'

export default function ContractsManagementPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>()

  const contractService = ContractService.getInstance()

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    setLoading(true)
    try {
      const result = await contractService.getContracts()
      setContracts(result.contracts)
      setStats(result.stats)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract)
  }

  const handleCreateNew = () => {
    // Navigate to create contract page
    console.log('Navigate to create contract page')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: keyof ContractStats['byStatus']) => {
    switch (status) {
      case 'active': return 'green'
      case 'pending_review': return 'yellow'
      case 'completed': return 'blue'
      case 'draft': return 'gray'
      default: return 'gray'
    }
  }

  const getTypeColor = (type: keyof ContractStats['byType']) => {
    switch (type) {
      case 'design': return 'purple'
      case 'printing': return 'blue'
      case 'supply': return 'green'
      case 'maintenance': return 'orange'
      case 'marketing': return 'pink'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة العقود</h1>
          <p className="text-gray-600 mt-1">
            إدارة شاملة لجميع العقود والاتفاقيات التجارية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadContracts}>
            🔄 تحديث
          </Button>
          <Button onClick={handleCreateNew}>
            + إنشاء عقد جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي العقود"
            value={stats.total.toString()}
            icon="📄"
            color="blue"
            subtitle="جميع العقود المسجلة"
          />
          <StatCard
            title="العقود النشطة"
            value={stats.byStatus.active.toString()}
            icon="✅"
            color="green"
            subtitle={`${stats.total > 0 ? Math.round((stats.byStatus.active / stats.total) * 100) : 0}% من الإجمالي`}
          />
          <StatCard
            title="إجمالي القيمة"
            value={formatCurrency(stats.totalValue)}
            icon="💰"
            color="purple"
            subtitle={`متوسط ${formatCurrency(stats.averageValue)}`}
          />
          <StatCard
            title="معدل الإكمال"
            value={`${Math.round(stats.completionRate)}%`}
            icon="📊"
            color="blue"
            subtitle="العقود المكتملة"
          />
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع العقود حسب الحالة</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={`text-2xl font-bold text-${getStatusColor(status as keyof ContractStats['byStatus'])}-600`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {status === 'draft' && 'مسودة'}
                  {status === 'pending_review' && 'قيد المراجعة'}
                  {status === 'under_negotiation' && 'قيد التفاوض'}
                  {status === 'approved' && 'معتمد'}
                  {status === 'signed' && 'موقع'}
                  {status === 'active' && 'نشط'}
                  {status === 'completed' && 'مكتمل'}
                  {status === 'terminated' && 'منتهي'}
                  {status === 'expired' && 'منتهي الصلاحية'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع العقود حسب النوع</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className={`text-2xl font-bold text-${getTypeColor(type as keyof ContractStats['byType'])}-600`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {type === 'design' && 'تصميم'}
                  {type === 'printing' && 'طباعة'}
                  {type === 'supply' && 'توريد'}
                  {type === 'maintenance' && 'صيانة'}
                  {type === 'marketing' && 'تسويق'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {stats && (stats.overdueMilestones > 0 || stats.overduePayments > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ تنبيهات مهمة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.overdueMilestones > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.overdueMilestones}</div>
                <div className="text-sm text-red-800">مراحل متأخرة</div>
                <div className="text-xs text-red-600 mt-1">تحتاج لمتابعة فورية</div>
              </div>
            )}
            {stats.overduePayments > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.overduePayments}</div>
                <div className="text-sm text-red-800">دفعات متأخرة</div>
                <div className="text-xs text-red-600 mt-1">تحتاج لمتابعة مالية</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contracts List */}
      <ContractList
        contracts={contracts}
        loading={loading}
        onContractClick={handleContractClick}
        onCreateNew={handleCreateNew}
        selectedContract={selectedContract}
        variant="card"
        showCreateButton={false}
        showSearch={true}
        showFilters={true}
      />

      {/* Contract Details Modal/Panel - placeholder for future implementation */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedContract.title}</h2>
                <p className="text-gray-600">{selectedContract.contractNumber}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedContract(undefined)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">تفاصيل العقد</h3>
                  <p className="text-gray-700">{selectedContract.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">النوع:</span>
                    <div className="font-medium">
                      {selectedContract.type === 'design' && 'تصميم'}
                      {selectedContract.type === 'printing' && 'طباعة'}
                      {selectedContract.type === 'supply' && 'توريد'}
                      {selectedContract.type === 'maintenance' && 'صيانة'}
                      {selectedContract.type === 'marketing' && 'تسويق'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">القيمة:</span>
                    <div className="font-medium">{formatCurrency(selectedContract.totalValue)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">الإنجاز:</span>
                    <div className="font-medium">{Math.round(selectedContract.performance.overallScore)}%</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">الأطراف المتعاقدة</h3>
                  <div className="space-y-2">
                    {selectedContract.parties.map((party) => (
                      <div key={party.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{party.name}</div>
                          <div className="text-sm text-gray-600">{party.representative.name} - {party.representative.position}</div>
                        </div>
                        {party.signedAt && (
                          <span className="text-green-600 text-sm">✓ موقع</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">المراحل</h3>
                  <div className="space-y-2">
                    {selectedContract.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{milestone.title}</div>
                          <div className="text-sm text-gray-600">{milestone.description}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status === 'completed' ? 'مكتمل' :
                           milestone.status === 'in_progress' ? 'قيد التنفيذ' :
                           'معلق'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedContract(undefined)}>
                إغلاق
              </Button>
              <Button>
                تحرير العقد
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
