'use client'

import React, { useState, useEffect } from 'react'
import { BankGuarantee, GuaranteeFilter, GuaranteeSortOption } from '@/lib/bank-guarantees/types'
import BankGuaranteeCard from './BankGuaranteeCard'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface BankGuaranteeListProps {
  onAddNew?: () => void
  onEdit?: (guarantee: BankGuarantee) => void
  onView?: (guarantee: BankGuarantee) => void
  onSubmit?: (guarantee: BankGuarantee) => void
  onApprove?: (guarantee: BankGuarantee) => void
  onReject?: (guarantee: BankGuarantee) => void
  viewMode?: 'grid' | 'table' | 'compact'
}

export default function BankGuaranteeList({
  onAddNew,
  onEdit,
  onView,
  onSubmit,
  onApprove,
  onReject,
  viewMode: initialViewMode = 'grid'
}: BankGuaranteeListProps) {
  const [guarantees, setGuarantees] = useState<BankGuarantee[]>([])
  const [filteredGuarantees, setFilteredGuarantees] = useState<BankGuarantee[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>(initialViewMode)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [filter, setFilter] = useState<GuaranteeFilter>({})
  const [sortOption, setSortOption] = useState<GuaranteeSortOption>({
    field: 'applicationDate',
    direction: 'desc'
  })

  // Search and filter configurations
  const filterConfigs = [
    {
      key: 'searchTerm',
      type: 'text' as const,
      label: 'البحث',
      placeholder: 'ابحث في عناوين الضمانات...'
    },
    {
      key: 'status',
      type: 'multiselect' as const,
      label: 'الحالة',
      options: [
        { value: 'draft', label: 'مسودة' },
        { value: 'submitted', label: 'مرسل للبنك' },
        { value: 'under_review', label: 'قيد المراجعة' },
        { value: 'approved', label: 'موافق عليه' },
        { value: 'issued', label: 'صادر' },
        { value: 'active', label: 'نشط' },
        { value: 'expired', label: 'منتهي الصلاحية' },
        { value: 'cancelled', label: 'ملغي' },
        { value: 'rejected', label: 'مرفوض' }
      ]
    },
    {
      key: 'type',
      type: 'multiselect' as const,
      label: 'نوع الضمانة',
      options: [
        { value: 'performance', label: 'حسن التنفيذ' },
        { value: 'advance_payment', label: 'دفع مقدم' },
        { value: 'maintenance', label: 'صيانة' },
        { value: 'bid_bond', label: 'دخول مناقصة' },
        { value: 'customs', label: 'جمركي' },
        { value: 'final_payment', label: 'دفع نهائي' }
      ]
    },
    {
      key: 'priority',
      type: 'multiselect' as const,
      label: 'الأولوية',
      options: [
        { value: 'low', label: 'منخفض' },
        { value: 'medium', label: 'متوسط' },
        { value: 'high', label: 'عالي' },
        { value: 'urgent', label: 'عاجل' }
      ]
    },
    {
      key: 'currency',
      type: 'multiselect' as const,
      label: 'العملة',
      options: [
        { value: 'YER', label: 'ريال يمني' },
        { value: 'USD', label: 'دولار أمريكي' },
        { value: 'SAR', label: 'ريال سعودي' },
        { value: 'EUR', label: 'يورو' }
      ]
    },
    {
      key: 'nearExpiry',
      type: 'boolean' as const,
      label: 'قريب الانتهاء',
      trueLabel: 'ينتهي خلال 30 يوم',
      falseLabel: 'عادي'
    }
  ]

  useEffect(() => {
    loadGuarantees()
  }, [currentPage, filter, sortOption])

  const loadGuarantees = async () => {
    setLoading(true)
    try {
      // Mock guarantees data
      const mockGuarantees: BankGuarantee[] = [
        {
          id: 'guarantee_001',
          guaranteeNumber: 'BG-202409-123456',
          referenceNumber: 'QAS-2024-789',
          type: 'performance',
          status: 'active',
          priority: 'high',
          title: 'ضمان حسن تنفيذ عقد التصميم - مطعم الذواقة',
          description: 'ضمان حسن التنفيذ لعقد خدمات التصميم والهوية البصرية',
          
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
            id: 'bank_alqasimi',
            name: 'بنك القاسمي اليمني',
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
          issueDate: new Date('2024-09-08'),
          effectiveDate: new Date('2024-09-10'),
          expiryDate: new Date('2025-09-10'),
          
          documents: [],
          submittedBy: 'user_restaurant',
          
          statusHistory: [{
            id: 'history_001',
            status: 'active',
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
        },
        {
          id: 'guarantee_002',
          guaranteeNumber: 'BG-202409-123457',
          type: 'advance_payment',
          status: 'submitted',
          priority: 'medium',
          title: 'ضمان دفع مقدم - مطعم الأصالة',
          
          applicant: {
            id: 'applicant_002',
            type: 'restaurant',
            name: 'مطعم الأصالة',
            legalName: 'شركة الأصالة للمطاعم',
            address: {
              street: 'شارع الملك فيصل',
              district: 'المعلا',
              city: 'عدن',
              governorate: 'عدن',
              country: 'اليمن'
            },
            contact: {
              primaryContact: 'سالم أحمد البكري',
              position: 'المالك',
              phone: '+967-2-345678',
              email: 'info@alasalah.ye'
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
            id: 'bank_alqasimi',
            name: 'بنك القاسمي اليمني',
            branchName: 'فرع عدن',
            address: {
              street: 'شارع المعلا',
              city: 'عدن',
              governorate: 'عدن',
              country: 'اليمن'
            },
            contact: {
              phone: '+967-2-567890',
              manager: 'خالد محمد الحضرمي'
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
          
          amount: 25000,
          currency: 'YER',
          commissionRate: 3.0,
          commissionAmount: 750,
          
          applicationDate: new Date('2024-09-15'),
          expiryDate: new Date('2025-03-15'),
          
          documents: [],
          submittedBy: 'user_restaurant2',
          
          statusHistory: [{
            id: 'history_002',
            status: 'submitted',
            timestamp: new Date(),
            changedBy: 'system',
            automaticChange: false
          }],
          
          alerts: [],
          
          isRenewable: false,
          autoRenewal: false,
          renewalNoticeDays: 30,
          
          tags: ['دفع مقدم'],
          notes: [],
          
          createdDate: new Date('2024-09-15'),
          lastModified: new Date(),
          createdBy: 'user_restaurant2',
          lastModifiedBy: 'user_restaurant2',
          version: '1.0',
          isArchived: false
        }
      ]

      setGuarantees(mockGuarantees)
      setFilteredGuarantees(mockGuarantees)
      setTotalItems(mockGuarantees.length)
    } catch (error) {
      console.error('Error loading guarantees:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (searchFilters: Record<string, any>) => {
    const newFilter: GuaranteeFilter = {
      ...filter,
      ...searchFilters
    }
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGuarantees.map((guarantee) => (
        <BankGuaranteeCard
          key={guarantee.id}
          guarantee={guarantee}
          variant="default"
          onClick={() => onView && onView(guarantee)}
          showActions={true}
          onEdit={() => onEdit && onEdit(guarantee)}
          onView={() => onView && onView(guarantee)}
          onSubmit={() => onSubmit && onSubmit(guarantee)}
          onApprove={() => onApprove && onApprove(guarantee)}
          onReject={() => onReject && onReject(guarantee)}
        />
      ))}
    </div>
  )

  const renderCompactView = () => (
    <div className="space-y-3">
      {filteredGuarantees.map((guarantee) => (
        <BankGuaranteeCard
          key={guarantee.id}
          guarantee={guarantee}
          variant="compact"
          onClick={() => onView && onView(guarantee)}
          showActions={true}
          onEdit={() => onEdit && onEdit(guarantee)}
          onView={() => onView && onView(guarantee)}
          onSubmit={() => onSubmit && onSubmit(guarantee)}
          onApprove={() => onApprove && onApprove(guarantee)}
          onReject={() => onReject && onReject(guarantee)}
        />
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الضمانة
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              النوع
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              المبلغ
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              البنك
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الحالة
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredGuarantees.map((guarantee) => (
            <tr key={guarantee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{guarantee.title}</div>
                  <div className="text-sm text-gray-500">{guarantee.guaranteeNumber}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {guarantee.type === 'performance' ? 'حسن التنفيذ' :
                   guarantee.type === 'advance_payment' ? 'دفع مقدم' :
                   guarantee.type === 'maintenance' ? 'صيانة' : guarantee.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(guarantee.amount)} {guarantee.currency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {guarantee.bank.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  guarantee.status === 'active' ? 'bg-green-100 text-green-800' :
                  guarantee.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  guarantee.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {guarantee.status === 'draft' ? 'مسودة' :
                   guarantee.status === 'submitted' ? 'مرسل' :
                   guarantee.status === 'active' ? 'نشط' : guarantee.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2 space-x-reverse">
                  {onView && (
                    <button
                      onClick={() => onView(guarantee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      عرض
                    </button>
                  )}
                  {onEdit && guarantee.status === 'draft' && (
                    <button
                      onClick={() => onEdit(guarantee)}
                      className="text-green-600 hover:text-green-900"
                    >
                      تحرير
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )
    }

    if (filteredGuarantees.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🏦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد ضمانات</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على أي ضمانات تطابق المعايير المحددة</p>
          {onAddNew && (
            <Button onClick={onAddNew} className="mx-auto">
              طلب ضمانة جديدة
            </Button>
          )}
        </div>
      )
    }

    switch (viewMode) {
      case 'table':
        return renderTableView()
      case 'compact':
        return renderCompactView()
      default:
        return renderGridView()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الضمانات البنكية</h1>
          <p className="text-gray-600">
            {totalItems} ضمانة • {filteredGuarantees.filter(g => g.status === 'active').length} نشط
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔲 شبكة
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 مضغوط
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 جدول
            </button>
          </div>

          {onAddNew && (
            <Button onClick={onAddNew}>
              طلب ضمانة جديدة
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <AdvancedSearch
          filters={filterConfigs}
          onSearch={handleSearch}
          onClear={() => {
            setFilter({})
            setCurrentPage(1)
          }}
          compact={false}
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {viewMode === 'table' ? (
          renderContent()
        ) : (
          <div className="p-6">
            {renderContent()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredGuarantees.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            عرض {((currentPage - 1) * itemsPerPage) + 1} إلى{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} من {totalItems} ضمانة
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            
            <span className="px-3 py-2 text-sm font-medium text-gray-900">
              صفحة {currentPage} من {Math.ceil(totalItems / itemsPerPage)}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
