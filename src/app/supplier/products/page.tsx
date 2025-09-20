'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatCard from '@/components/dashboard/StatCard'
import DataTable from '@/components/dashboard/DataTable'
import AdvancedSearch from '@/components/dashboard/AdvancedSearch'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate, formatCurrency } from '@/lib/utils'

// Types
interface Product {
  id: string
  name: string
  nameArabic: string
  category: 'spices' | 'sauces' | 'equipment' | 'packaging'
  subCategory: string
  sku: string
  price: number
  cost: number
  stock: number
  minStock: number
  unit: string
  weight?: number
  volume?: string
  description: string
  ingredients?: string[]
  origin: string
  shelfLife?: number
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued'
  images: string[]
  nutritionInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sodium?: number
  }
  certifications?: string[]
  supplierNotes?: string
  createdAt: Date
  updatedAt: Date
  salesData: {
    totalSold: number
    monthlyAverage: number
    revenue: number
    topRestaurant: string
  }
}

interface ProductStats {
  totalProducts: number
  activeProducts: number
  lowStock: number
  outOfStock: number
  totalValue: number
  topCategory: string
  newThisMonth: number
  discontinuedProducts: number
}

export default function SupplierProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    topCategory: '',
    newThisMonth: 0,
    discontinuedProducts: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    lowStock: false
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/supplier/products')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProducts(data.data.products)
          setStats(data.data.stats)
        }
      } else {
        // بيانات تجريبية شاملة
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Premium Cumin Powder',
            nameArabic: 'كمون مطحون فاخر',
            category: 'spices',
            subCategory: 'بهارات مطحونة',
            sku: 'SP-CMN-001',
            price: 1200,
            cost: 800,
            stock: 450,
            minStock: 50,
            unit: 'كيلو',
            weight: 1,
            description: 'كمون مطحون فاخر من أجود أنواع الكمون اليمني الأصيل',
            ingredients: ['كمون يمني طبيعي 100%'],
            origin: 'اليمن - محافظة حضرموت',
            shelfLife: 24,
            status: 'active',
            images: ['/products/cumin-powder.jpg'],
            nutritionInfo: {
              calories: 375,
              protein: 18,
              carbs: 44,
              fat: 22,
              sodium: 168
            },
            certifications: ['ISO 22000', 'HACCP', 'حلال'],
            supplierNotes: 'منتج عالي الجودة مع طلب متزايد',
            createdAt: new Date('2024-08-15'),
            updatedAt: new Date('2025-01-15'),
            salesData: {
              totalSold: 2850,
              monthlyAverage: 180,
              revenue: 3420000,
              topRestaurant: 'مطعم البيك'
            }
          },
          {
            id: '2',
            name: 'Spicy Ketchup Sauce',
            nameArabic: 'كاتشب حار يمني',
            category: 'sauces',
            subCategory: 'صلصات حارة',
            sku: 'SC-KTC-001',
            price: 650,
            cost: 420,
            stock: 180,
            minStock: 30,
            unit: 'عبوة',
            volume: '500 مل',
            description: 'صلصة كاتشب حارة بالطعم اليمني الأصيل',
            ingredients: ['طماطم', 'فلفل حار', 'خل', 'سكر', 'ملح', 'بهارات'],
            origin: 'اليمن - صنعاء',
            shelfLife: 18,
            status: 'active',
            images: ['/products/spicy-ketchup.jpg'],
            nutritionInfo: {
              calories: 120,
              protein: 2,
              carbs: 28,
              fat: 0.5,
              sodium: 980
            },
            certifications: ['ISO 22000', 'حلال'],
            supplierNotes: 'منتج شعبي مع طلب عالي',
            createdAt: new Date('2024-09-20'),
            updatedAt: new Date('2025-01-10'),
            salesData: {
              totalSold: 1950,
              monthlyAverage: 145,
              revenue: 1267500,
              topRestaurant: 'مطعم الطازج'
            }
          },
          {
            id: '3',
            name: 'Black Pepper Ground',
            nameArabic: 'فلفل أسود مطحون',
            category: 'spices',
            subCategory: 'بهارات مطحونة',
            sku: 'SP-BPP-001',
            price: 1800,
            cost: 1200,
            stock: 25,
            minStock: 40,
            unit: 'كيلو',
            weight: 1,
            description: 'فلفل أسود مطحون من أجود الأنواع المستوردة',
            ingredients: ['فلفل أسود مستورد 100%'],
            origin: 'الهند - كيرالا',
            shelfLife: 36,
            status: 'active',
            images: ['/products/black-pepper.jpg'],
            nutritionInfo: {
              calories: 251,
              protein: 10,
              carbs: 64,
              fat: 3,
              sodium: 20
            },
            certifications: ['Organic', 'Fair Trade', 'حلال'],
            supplierNotes: 'مخزون منخفض - يحتاج إعادة طلب',
            createdAt: new Date('2024-07-10'),
            updatedAt: new Date('2025-01-18'),
            salesData: {
              totalSold: 890,
              monthlyAverage: 95,
              revenue: 1602000,
              topRestaurant: 'مطعم الشام'
            }
          },
          {
            id: '4',
            name: 'Zhug Hot Sauce',
            nameArabic: 'صلصة الزحف الحارة',
            category: 'sauces',
            subCategory: 'صلصات تقليدية',
            sku: 'SC-ZHG-001',
            price: 750,
            cost: 500,
            stock: 0,
            minStock: 25,
            unit: 'عبوة',
            volume: '250 مل',
            description: 'صلصة الزحف اليمنية التقليدية الحارة',
            ingredients: ['فلفل أخضر حار', 'كزبرة', 'ثوم', 'زيت زيتون', 'ملح'],
            origin: 'اليمن - صنعاء',
            shelfLife: 12,
            status: 'out_of_stock',
            images: ['/products/zhug-sauce.jpg'],
            certifications: ['حلال', 'طبيعي 100%'],
            supplierNotes: 'نفد المخزون - في الإنتاج',
            createdAt: new Date('2024-11-05'),
            updatedAt: new Date('2025-01-19'),
            salesData: {
              totalSold: 650,
              monthlyAverage: 85,
              revenue: 487500,
              topRestaurant: 'مطعم السلام'
            }
          }
        ]

        setProducts(mockProducts)
        
        // حساب الإحصائيات
        const totalProducts = mockProducts.length
        const activeProducts = mockProducts.filter(p => p.status === 'active').length
        const lowStock = mockProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length
        const outOfStock = mockProducts.filter(p => p.stock === 0).length
        const totalValue = mockProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0)
        const newThisMonth = mockProducts.filter(p => 
          p.createdAt.getMonth() === new Date().getMonth() && 
          p.createdAt.getFullYear() === new Date().getFullYear()
        ).length

        setStats({
          totalProducts,
          activeProducts,
          lowStock,
          outOfStock,
          totalValue,
          topCategory: 'توابل',
          newThisMonth,
          discontinuedProducts: mockProducts.filter(p => p.status === 'discontinued').length
        })
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // التحقق من صلاحية المورد
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'supplier') {
    redirect('/auth/signin')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'discontinued': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '✅ نشط'
      case 'inactive': return '⏸️ غير نشط'
      case 'out_of_stock': return '❌ نفد المخزون'
      case 'discontinued': return '🚫 متوقف'
      default: return status
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spices': return '🌶️'
      case 'sauces': return '🍅'
      case 'equipment': return '🔧'
      case 'packaging': return '📦'
      default: return '📋'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'spices': return 'توابل'
      case 'sauces': return 'صلصات'
      case 'equipment': return 'معدات'
      case 'packaging': return 'تغليف'
      default: return category
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { color: 'text-red-600', text: 'نفد' }
    if (product.stock <= product.minStock) return { color: 'text-yellow-600', text: 'منخفض' }
    return { color: 'text-green-600', text: 'متوفر' }
  }

  // إعداد أعمدة الجدول
  const columns = [
    {
      key: 'product',
      label: 'المنتج',
      render: (product: Product) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{getCategoryIcon(product.category)}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{product.nameArabic}</div>
            <div className="text-sm text-gray-500">{product.name}</div>
            <div className="text-xs text-blue-600">{product.sku}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'الفئة',
      render: (product: Product) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {getCategoryText(product.category)}
          </div>
          <div className="text-xs text-gray-600">{product.subCategory}</div>
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'الأسعار',
      render: (product: Product) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(product.price)}
          </div>
          <div className="text-xs text-gray-600">
            التكلفة: {formatCurrency(product.cost)}
          </div>
          <div className="text-xs text-green-600">
            ربح: {formatCurrency(product.price - product.cost)}
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'المخزون',
      render: (product: Product) => {
        const stockStatus = getStockStatus(product)
        return (
          <div className="text-center">
            <div className={`text-lg font-medium ${stockStatus.color}`}>
              {product.stock} {product.unit}
            </div>
            <div className="text-xs text-gray-600">
              الحد الأدنى: {product.minStock}
            </div>
            <div className={`text-xs ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
          </div>
        )
      }
    },
    {
      key: 'sales',
      label: 'المبيعات',
      render: (product: Product) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {product.salesData.totalSold} وحدة
          </div>
          <div className="text-xs text-gray-600">
            شهرياً: {product.salesData.monthlyAverage}
          </div>
          <div className="text-xs text-green-600">
            {formatCurrency(product.salesData.revenue)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (product: Product) => (
        <div className="text-center">
          <span className={`status-badge ${getStatusColor(product.status)}`}>
            {getStatusText(product.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(product.updatedAt)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (product: Product) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/supplier/products/${product.id}`)}
          >
            👁️ عرض
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/supplier/products/${product.id}/edit`)}
          >
            ✏️ تعديل
          </Button>
          
          {product.stock <= product.minStock && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {/* إعادة الطلب */}}
            >
              🔄 طلب
            </Button>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedComponent roles={['supplier']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🛍️ إدارة المنتجات</h1>
                <p className="text-gray-600">
                  إجمالي {stats.totalProducts} منتج، {stats.activeProducts} نشط
                </p>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/supplier/products/categories')}
                >
                  📂 الفئات
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => router.push('/supplier/products/create')}
                >
                  ➕ منتج جديد
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stock Alerts */}
          {(stats.lowStock > 0 || stats.outOfStock > 0) && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-yellow-800">تنبيه المخزون</h3>
                  <p className="text-sm text-yellow-700">
                    {stats.lowStock > 0 && `${stats.lowStock} منتج مخزونه منخفض`}
                    {stats.lowStock > 0 && stats.outOfStock > 0 && ' • '}
                    {stats.outOfStock > 0 && `${stats.outOfStock} منتج نفد مخزونه`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي المنتجات"
              value={stats.totalProducts}
              icon="🛍️"
              color="blue"
            />
            
            <StatCard
              title="منتجات نشطة"
              value={stats.activeProducts}
              icon="✅"
              color="green"
            />
            
            <StatCard
              title="مخزون منخفض"
              value={stats.lowStock}
              icon="⚠️"
              color="yellow"
            />
            
            <StatCard
              title="نفد المخزون"
              value={stats.outOfStock}
              icon="❌"
              color="red"
            />
          </div>

          {/* Inventory Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="قيمة المخزون"
              value={formatCurrency(stats.totalValue)}
              icon="💎"
              color="purple"
            />
            
            <StatCard
              title="الفئة الأكثر مبيعاً"
              value={stats.topCategory}
              icon="🏆"
              color="orange"
            />
            
            <StatCard
              title="منتجات جديدة هذا الشهر"
              value={stats.newThisMonth}
              icon="🆕"
              color="green"
            />
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <AdvancedSearch
                onSearch={(searchParams: any) => setFilters(prev => ({ ...prev, ...searchParams }))}
                filters={[
                  {
                    id: 'search',
                    type: 'text',
                    placeholder: 'البحث في المنتجات...',
                    label: 'البحث العام'
                  },
                  {
                    id: 'category',
                    type: 'select',
                    label: 'الفئة',
                    options: [
                      { value: '', label: 'جميع الفئات' },
                      { value: 'spices', label: 'توابل' },
                      { value: 'sauces', label: 'صلصات' },
                      { value: 'equipment', label: 'معدات' },
                      { value: 'packaging', label: 'تغليف' }
                    ]
                  },
                  {
                    id: 'status',
                    type: 'select',
                    label: 'الحالة',
                    options: [
                      { value: '', label: 'جميع الحالات' },
                      { value: 'active', label: 'نشط' },
                      { value: 'inactive', label: 'غير نشط' },
                      { value: 'out_of_stock', label: 'نفد المخزون' },
                      { value: 'discontinued', label: 'متوقف' }
                    ]
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    تم تحديد {selectedProducts.length} منتج
                  </span>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="outline">
                      📤 تصدير المحددة
                    </Button>
                    <Button size="sm" variant="warning">
                      ⏸️ إيقاف المحددة
                    </Button>
                    <Button size="sm" variant="primary">
                      💰 تحديث الأسعار
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة المنتجات</CardTitle>
              <CardDescription>
                جميع منتجاتك مع تفاصيل المخزون والمبيعات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={products}
                columns={columns}
                searchKey="nameArabic"
                onSelectionChange={setSelectedProducts}
                selectedItems={selectedProducts}
                emptyMessage="لا توجد منتجات"
                emptyDescription="لم يتم إضافة أي منتجات بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
