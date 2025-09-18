'use client'

import React, { useState, useRef } from 'react'
import { Contract } from '@/lib/contracts/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface ContractViewerProps {
  contract: Contract
  mode?: 'view' | 'preview' | 'print'
  onEdit?: () => void
  onSign?: () => void
  onDownload?: () => void
  onApprove?: () => void
  onReject?: () => void
  showActions?: boolean
}

export default function ContractViewer({
  contract,
  mode = 'view',
  onEdit,
  onSign,
  onDownload,
  onApprove,
  onReject,
  showActions = true
}: ContractViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'terms' | 'deliverables' | 'workflow'>('content')
  const printRef = useRef<HTMLDivElement>(null)

  const getStatusText = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'review': return 'قيد المراجعة'
      case 'approval': return 'قيد الموافقة'
      case 'signed': return 'موقع'
      case 'active': return 'نشط'
      case 'completed': return 'مكتمل'
      default: return status
    }
  }

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      case 'approval': return 'bg-yellow-100 text-yellow-800'
      case 'signed': return 'bg-purple-100 text-purple-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const primaryParty = contract.parties.find(p => p.id === contract.primaryParty)
  const secondaryParty = contract.parties.find(p => p.id === contract.secondaryParty)

  const handlePrint = () => {
    window.print()
  }

  const tabs = [
    { id: 'content', label: 'محتوى العقد', icon: '📄' },
    { id: 'terms', label: 'البنود', icon: '📋' },
    { id: 'deliverables', label: 'المخرجات', icon: '📦' },
    { id: 'workflow', label: 'سير العمل', icon: '🔄' }
  ]

  const renderContent = () => (
    <div className="space-y-8">
      {/* Contract Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{contract.title}</h1>
        <p className="text-lg text-gray-600">{contract.contractNumber}</p>
        <p className="text-gray-500">المملكة العربية السعودية</p>
      </div>

      {/* Parties Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {primaryParty && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الطرف الأول</h3>
            <div className="space-y-2">
              <p><strong>الاسم:</strong> {primaryParty.name}</p>
              <p><strong>الاسم القانوني:</strong> {primaryParty.legalName}</p>
              <p><strong>العنوان:</strong> {primaryParty.address.street}, {primaryParty.address.city}</p>
              <p><strong>جهة الاتصال:</strong> {primaryParty.contact.name}</p>
              <p><strong>الهاتف:</strong> {primaryParty.contact.phone}</p>
            </div>
          </div>
        )}

        {secondaryParty && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الطرف الثاني</h3>
            <div className="space-y-2">
              <p><strong>الاسم:</strong> {secondaryParty.name}</p>
              <p><strong>الاسم القانوني:</strong> {secondaryParty.legalName}</p>
              <p><strong>العنوان:</strong> {secondaryParty.address.street}, {secondaryParty.address.city}</p>
              <p><strong>جهة الاتصال:</strong> {secondaryParty.contact.name}</p>
              <p><strong>الهاتف:</strong> {secondaryParty.contact.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contract Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل العقد</h3>
          <div className="space-y-2">
            <p><strong>نوع العقد:</strong> {contract.type}</p>
            <p><strong>الفئة:</strong> {contract.category}</p>
            <p><strong>تاريخ السريان:</strong> {formatDate(contract.effectiveDate)}</p>
            <p><strong>تاريخ الانتهاء:</strong> {formatDate(contract.expiryDate)}</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الملخص المالي</h3>
          <div className="space-y-2">
            <p><strong>إجمالي القيمة:</strong> {formatCurrency(contract.financials.totalValue)} {contract.financials.currency}</p>
            <p><strong>الضمان المطلوب:</strong> {formatCurrency(contract.financials.guaranteeRequired)}</p>
            <p><strong>طريقة الدفع:</strong> {contract.financials.paymentTerms.method}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTerms = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">بنود وشروط العقد</h3>
      
      {contract.terms.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">لا توجد بنود محددة في هذا العقد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contract.terms.map((term, index) => (
            <div key={term.id} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                {index + 1}. {term.title}
              </h4>
              <div className="prose max-w-none text-gray-700">
                {term.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderDeliverables = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">المخرجات والمهام</h3>
      
      {contract.deliverables.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">لا توجد مخرجات محددة في هذا العقد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contract.deliverables.map((deliverable) => (
            <div key={deliverable.id} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">{deliverable.title}</h4>
              <p className="text-gray-700 mb-4">{deliverable.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">الفئة</p>
                  <p className="text-gray-900">{deliverable.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">تاريخ التسليم</p>
                  <p className="text-gray-900">{formatDate(deliverable.timeline.endDate)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderWorkflow = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">سير العمل والموافقات</h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">حالة الموافقات</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <span className="text-gray-900">المرحلة الحالية</span>
            <span className="font-medium text-blue-600">{contract.approvalStatus.step}</span>
          </div>
          
          {contract.approvalStatus.approvedBy && contract.approvalStatus.approvedBy.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <span className="text-gray-900">الموافقات</span>
              <span className="font-medium text-green-600">{contract.approvalStatus.approvedBy.length} شخص</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{contract.title}</h1>
            <p className="text-red-100 text-lg">{contract.contractNumber}</p>
            <div className="flex items-center space-x-4 space-x-reverse text-red-100 mt-2">
              <span className="text-sm">{formatDate(contract.createdDate)}</span>
              <span className="text-sm">•</span>
              <span className="text-sm">{formatCurrency(contract.financials.totalValue)}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
              {getStatusText(contract.status)}
            </span>
            
            {showActions && (
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  onClick={handlePrint}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  طباعة
                </Button>
                
                {onDownload && (
                  <Button
                    onClick={onDownload}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    تحميل
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {mode !== 'print' && (
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="ml-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="p-6" ref={printRef}>
        {activeTab === 'content' && renderContent()}
        {activeTab === 'terms' && renderTerms()}
        {activeTab === 'deliverables' && renderDeliverables()}
        {activeTab === 'workflow' && renderWorkflow()}
      </div>

      {/* Actions Footer */}
      {showActions && mode !== 'print' && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {onEdit && ['draft', 'review'].includes(contract.status) && (
              <Button onClick={onEdit} variant="secondary">
                تحرير العقد
              </Button>
            )}
            
            {onSign && contract.status === 'approval' && (
              <Button onClick={onSign} className="bg-green-600 hover:bg-green-700">
                توقيع العقد
              </Button>
            )}
            
            {onApprove && ['review'].includes(contract.status) && (
              <Button onClick={onApprove} className="bg-blue-600 hover:bg-blue-700">
                الموافقة على العقد
              </Button>
            )}
            
            {onReject && ['review', 'approval'].includes(contract.status) && (
              <Button onClick={onReject} variant="secondary" className="text-red-600">
                رفض العقد
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
