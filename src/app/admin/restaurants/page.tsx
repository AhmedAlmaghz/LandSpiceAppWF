// Admin Restaurants Management Page
// صفحة إدارة المطاعم للمدير

'use client'

import React, { useState, useEffect } from 'react'
import { Restaurant, RestaurantStats } from '@/lib/restaurant/types'
import { RestaurantService } from '@/lib/restaurant/restaurant-service'
import { Button } from '@/components/ui/Button'
import RestaurantList from '@/components/restaurant/RestaurantList'
import RestaurantProfile from '@/components/restaurant/RestaurantProfile'
import StatCard from '@/components/dashboard/StatCard'

export default function RestaurantsManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [stats, setStats] = useState<RestaurantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | undefined>()
  const [showProfile, setShowProfile] = useState(false)

  const restaurantService = RestaurantService.getInstance()

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const result = await restaurantService.getRestaurants()
      setRestaurants(result.restaurants)
      setStats(result.stats)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowProfile(true)
  }

  const handleCreateNew = () => {
    // Navigate to create restaurant page
    window.location.href = '/admin/restaurants/create'
  }

  const handleEditRestaurant = () => {
    if (selectedRestaurant) {
      window.location.href = `/admin/restaurants/edit/${selectedRestaurant.id}`
    }
  }

  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: Restaurant['status']) => {
    switch (status) {
      case 'active': return 'green'
      case 'pending': return 'yellow'
      case 'inactive': return 'gray'
      case 'suspended': return 'red'
      case 'terminated': return 'red'
      default: return 'gray'
    }
  }

  const getTypeColor = (type: Restaurant['type']) => {
    switch (type) {
      case 'single': return 'blue'
      case 'chain': return 'purple'
      case 'franchise': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المطاعم</h1>
          <p className="text-gray-600 mt-1">
            إدارة شاملة لجميع المطاعم المسجلة في النظام
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRestaurants}>
            🔄 تحديث
          </Button>
          <Button onClick={handleCreateNew}>
            + إضافة مطعم جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي المطاعم"
            value={stats.total.toString()}
            icon="🏪"
            color="blue"
            subtitle="جميع المطاعم المسجلة"
          />
          <StatCard
            title="المطاعم النشطة"
            value={stats.active.toString()}
            icon="✅"
            color="green"
            subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% من الإجمالي`}
          />
          <StatCard
            title="إجمالي الإيرادات"
            value={formatCurrency(stats.totalRevenue)}
            icon="💰"
            color="purple"
            subtitle={`متوسط ${formatCurrency(stats.averageRevenue)}`}
          />
          <StatCard
            title="العقود النشطة"
            value={stats.contractsCount.toString()}
            icon="📄"
            color="orange"
            subtitle="عقود جارية"
          />
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع المطاعم حسب الحالة</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold text-${getStatusColor('active')}-600`}>
                {stats.active}
              </div>
              <div className="text-sm text-gray-600">نشط</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-${getStatusColor('pending')}-600`}>
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">قيد المراجعة</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-${getStatusColor('inactive')}-600`}>
                {stats.inactive}
              </div>
              <div className="text-sm text-gray-600">غير نشط</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.byRegion ? Object.keys(stats.byRegion).length : 0}
              </div>
              <div className="text-sm text-gray-600">منطقة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(stats.byType).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الفروع</div>
            </div>
          </div>
        </div>
      )}

      {/* Type Distribution */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع المطاعم حسب النوع</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className={`text-2xl font-bold text-${getTypeColor(type as Restaurant['type'])}-600`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {type === 'single' && 'مطعم واحد'}
                  {type === 'chain' && 'سلسلة مطاعم'}
                  {type === 'franchise' && 'امتياز تجاري'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Type Distribution */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">توزيع المطاعم حسب نوع النشاط</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byBusinessType).map(([businessType, count]) => (
              <div key={businessType} className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{count}</div>
                <div className="text-sm text-gray-600">
                  {businessType === 'restaurant' && 'مطعم'}
                  {businessType === 'cafe' && 'مقهى'}
                  {businessType === 'fast_food' && 'وجبات سريعة'}
                  {businessType === 'catering' && 'تقديم طعام'}
                  {businessType === 'food_truck' && 'عربة طعام'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Distribution */}
      {stats && stats.byRegion && Object.keys(stats.byRegion).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">التوزيع الجغرافي</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.byRegion).map(([region, count]) => (
              <div key={region} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-teal-600">{count}</div>
                <div className="text-sm text-gray-600">{region}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📈 أداء الإيرادات</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي الإيرادات</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">متوسط الإيرادات</span>
                <span className="font-bold text-blue-600">{formatCurrency(stats.averageRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">متوسط قيمة الطلب</span>
                <span className="font-bold text-purple-600">
                  {stats.total > 0 ? formatCurrency(stats.totalRevenue / stats.total) : formatCurrency(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📊 إحصائيات العقود</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي العقود</span>
                <span className="font-bold text-orange-600">{stats.contractsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">متوسط العقود لكل مطعم</span>
                <span className="font-bold text-teal-600">
                  {stats.total > 0 ? (stats.contractsCount / stats.total).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">معدل النشاط</span>
                <span className="font-bold text-indigo-600">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showProfile && selectedRestaurant ? (
        <RestaurantProfile
          restaurant={selectedRestaurant}
          onEdit={handleEditRestaurant}
          onClose={() => {
            setShowProfile(false)
            setSelectedRestaurant(undefined)
          }}
          showActions={true}
        />
      ) : (
        <RestaurantList
          restaurants={restaurants}
          loading={loading}
          onRestaurantClick={handleRestaurantClick}
          onCreateNew={handleCreateNew}
          selectedRestaurant={selectedRestaurant}
          variant="card"
          showCreateButton={false}
          showSearch={true}
          showFilters={true}
        />
      )}

      {/* Quick Actions Floating Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={handleCreateNew}
          className="w-14 h-14 rounded-full shadow-lg"
        >
          +
        </Button>
      </div>
    </div>
  )
}
