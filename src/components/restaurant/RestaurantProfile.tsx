'use client'

import React, { useState } from 'react'
import { Restaurant, RestaurantDocument, RestaurantContact, RestaurantBranch } from '@/lib/restaurant/types'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/utils'

interface RestaurantProfileProps {
  restaurant: Restaurant
  onEdit?: () => void
  onStatusChange?: (status: Restaurant['status']) => void
  onAddContact?: () => void
  onEditContact?: (contact: RestaurantContact) => void
  onAddBranch?: () => void
  onEditBranch?: (branch: RestaurantBranch) => void
  onViewDocument?: (document: RestaurantDocument) => void
  onUploadDocument?: () => void
}

export default function RestaurantProfile({
  restaurant,
  onEdit,
  onStatusChange,
  onAddContact,
  onEditContact,
  onAddBranch,
  onEditBranch,
  onViewDocument,
  onUploadDocument
}: RestaurantProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'branches' | 'financial' | 'documents' | 'history'>('overview')

  const statusColor = getStatusColor(restaurant.status)
  const statusText = getStatusText(restaurant.status, 'restaurant')

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '🏢' },
    { id: 'contacts', label: 'جهات الاتصال', icon: '👥' },
    { id: 'branches', label: 'الفروع', icon: '📍' },
    { id: 'financial', label: 'معلومات مالية', icon: '💰' },
    { id: 'documents', label: 'الوثائق', icon: '📄' },
    { id: 'history', label: 'تاريخ العلاقة', icon: '📈' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
              <p className="text-red-100 text-lg mb-2">{restaurant.legalName}</p>
              <div className="flex items-center space-x-4 space-x-reverse text-red-100">
                <span>تأسس: {formatDate(restaurant.businessInfo.establishedDate)}</span>
                <span>•</span>
                <span>{restaurant.branches.length} فرع</span>
                <span>•</span>
                <span>{restaurant.contacts.length} جهة اتصال</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
              restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              restaurant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {statusText}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                تحرير البيانات
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="ml-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">نوع المطعم</label>
                  <p className="text-gray-900">
                    {restaurant.type === 'single' && 'مطعم واحد'}
                    {restaurant.type === 'chain' && 'سلسلة مطاعم'}
                    {restaurant.type === 'franchise' && 'فرنشايز'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">نوع النشاط</label>
                  <p className="text-gray-900">
                    {restaurant.businessInfo.businessType === 'restaurant' && 'مطعم'}
                    {restaurant.businessInfo.businessType === 'cafe' && 'مقهى'}
                    {restaurant.businessInfo.businessType === 'fast_food' && 'وجبات سريعة'}
                    {restaurant.businessInfo.businessType === 'catering' && 'خدمات طعام'}
                    {restaurant.businessInfo.businessType === 'food_truck' && 'عربة طعام'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">تاريخ التأسيس</label>
                  <p className="text-gray-900">{formatDate(restaurant.businessInfo.establishedDate)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {restaurant.businessInfo.description && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">وصف النشاط</h3>
                <p className="text-gray-700 leading-relaxed">{restaurant.businessInfo.description}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{restaurant.relationshipHistory.totalOrders}</div>
                <div className="text-sm text-blue-800">إجمالي الطلبات</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(restaurant.relationshipHistory.totalRevenue)}</div>
                <div className="text-sm text-green-800">إجمالي الإيرادات</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{restaurant.relationshipHistory.contractsCount}</div>
                <div className="text-sm text-purple-800">العقود النشطة</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{restaurant.branches.length}</div>
                <div className="text-sm text-orange-800">عدد الفروع</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">جهات الاتصال ({restaurant.contacts.length})</h3>
              {onAddContact && (
                <button
                  onClick={onAddContact}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  إضافة جهة اتصال
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurant.contacts.map((contact) => (
                <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        contact.isPrimary ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <span className={contact.isPrimary ? 'text-red-600' : 'text-gray-600'}>👤</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          {contact.isPrimary && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">رئيسي</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{contact.position}</p>
                      </div>
                    </div>
                    {onEditContact && (
                      <button onClick={() => onEditContact(contact)} className="p-2 text-gray-400 hover:text-gray-600">
                        ✏️
                      </button>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse text-sm">
                      <span className="text-gray-500">📞</span>
                      <span className="text-gray-900">{contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm">
                      <span className="text-gray-500">📧</span>
                      <span className="text-gray-900">{contact.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">الفروع ({restaurant.branches.length})</h3>
              {onAddBranch && (
                <button
                  onClick={onAddBranch}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  إضافة فرع
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {restaurant.branches.map((branch) => (
                <div key={branch.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        branch.isActive ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className={branch.isActive ? 'text-green-600' : 'text-gray-600'}>🏢</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {branch.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                    {onEditBranch && (
                      <button onClick={() => onEditBranch(branch)} className="p-2 text-gray-400 hover:text-gray-600">
                        ✏️
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">العنوان</h5>
                      <p className="text-gray-600 text-sm">
                        {branch.address.street}<br/>
                        {branch.address.city}, {branch.address.region}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">المدير</h5>
                        <p className="text-gray-600 text-sm">{branch.manager}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">الهاتف</h5>
                        <p className="text-gray-600 text-sm">{branch.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رأس المال</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(restaurant.financialInfo.capitalAmount)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">🛡️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الضمان المطلوب</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(restaurant.financialInfo.guaranteeRequired)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">التصنيف الائتماني</p>
                    <p className="text-xl font-bold text-gray-900">
                      {restaurant.financialInfo.creditRating || 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">الوثائق ({restaurant.documents.length})</h3>
              {onUploadDocument && (
                <button
                  onClick={onUploadDocument}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  رفع وثيقة
                </button>
              )}
            </div>
            
            {restaurant.documents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد وثائق</h3>
                <p className="text-gray-500">لم يتم رفع أي وثائق بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.documents.map((document) => (
                  <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600">📄</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{document.title}</h4>
                          <p className="text-gray-500 text-xs">{document.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        document.status === 'valid' ? 'bg-green-100 text-green-800' :
                        document.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      رُفع في: {formatDate(document.uploadDate)}
                    </div>
                    
                    {onViewDocument && (
                      <button
                        onClick={() => onViewDocument(document)}
                        className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100"
                      >
                        عرض الوثيقة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold">{restaurant.relationshipHistory.totalOrders}</p>
                  </div>
                  <span className="text-2xl">📦</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">{formatCurrency(restaurant.relationshipHistory.totalRevenue)}</p>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">متوسط قيمة الطلب</p>
                    <p className="text-2xl font-bold">{formatCurrency(restaurant.relationshipHistory.averageOrderValue)}</p>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">العقود النشطة</p>
                    <p className="text-3xl font-bold">{restaurant.relationshipHistory.contractsCount}</p>
                  </div>
                  <span className="text-2xl">📄</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات العلاقة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">أول اتصال</label>
                  <p className="text-gray-900">{formatDate(restaurant.relationshipHistory.firstContact)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">آخر تحديث</label>
                  <p className="text-gray-900">{formatDate(restaurant.relationshipHistory.lastUpdate)}</p>
                </div>
                {restaurant.relationshipHistory.lastOrderDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">آخر طلب</label>
                    <p className="text-gray-900">{formatDate(restaurant.relationshipHistory.lastOrderDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
