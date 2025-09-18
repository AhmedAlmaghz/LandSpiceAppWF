'use client'

import React, { useState, useEffect } from 'react'
import { DesignRequest, DesignFile } from '@/lib/design/types'
import { designService } from '@/lib/design/design-service'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface GalleryItem {
  id: string
  title: string
  description: string
  designType: string
  category: string
  designer: string
  client: string
  thumbnailUrl: string
  fullImageUrl: string
  completionDate: Date
  tags: string[]
  culturalElements: {
    yemeniCulturalElements: boolean
    islamicCompliant: boolean
    traditionalElements: boolean
  }
  qualityRating?: number
  clientSatisfaction?: number
  isPublic: boolean
  viewCount: number
  likeCount: number
}

interface DesignGalleryProps {
  userRole?: 'client' | 'designer' | 'manager' | 'admin' | 'public'
  showFilters?: boolean
  maxItems?: number
  designerId?: string // لعرض أعمال مصمم معين
}

export default function DesignGallery({
  userRole = 'public',
  showFilters = true,
  maxItems,
  designerId
}: DesignGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showCulturalOnly, setShowCulturalOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'branding', label: 'العلامة التجارية' },
    { value: 'marketing', label: 'التسويق' },
    { value: 'print', label: 'الطباعة' },
    { value: 'digital', label: 'الرقمي' },
    { value: 'packaging', label: 'التعبئة والتغليف' }
  ]

  const designTypes = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'logo', label: 'شعار' },
    { value: 'business_card', label: 'بطاقة عمل' },
    { value: 'complete_identity', label: 'هوية بصرية كاملة' },
    { value: 'brochure', label: 'بروشور' },
    { value: 'menu', label: 'قائمة طعام' },
    { value: 'social_media', label: 'سوشيال ميديا' },
    { value: 'packaging', label: 'عبوات' },
    { value: 'banner', label: 'بانر' }
  ]

  useEffect(() => {
    loadGalleryItems()
  }, [designerId])

  useEffect(() => {
    applyFilters()
  }, [galleryItems, selectedCategory, selectedType, showCulturalOnly])

  const loadGalleryItems = async () => {
    setLoading(true)
    try {
      // في التطبيق الحقيقي، سيتم جلب البيانات من API
      const mockGalleryItems: GalleryItem[] = [
        {
          id: 'gallery_001',
          title: 'هوية بصرية - مطعم الأصالة اليمنية',
          description: 'تصميم هوية بصرية شاملة تعكس التراث اليمني الأصيل مع لمسة عصرية',
          designType: 'complete_identity',
          category: 'branding',
          designer: 'أحمد محمد الحداد',
          client: 'مطعم الأصالة اليمنية',
          thumbnailUrl: '/mock/gallery/yemeni_identity_thumb.jpg',
          fullImageUrl: '/mock/gallery/yemeni_identity_full.jpg',
          completionDate: new Date('2024-09-15'),
          tags: ['تراث', 'يمني', 'هوية بصرية', 'أصالة', 'مطعم'],
          culturalElements: {
            yemeniCulturalElements: true,
            islamicCompliant: true,
            traditionalElements: true
          },
          qualityRating: 4.9,
          clientSatisfaction: 5.0,
          isPublic: true,
          viewCount: 156,
          likeCount: 23
        },
        {
          id: 'gallery_002',
          title: 'قائمة طعام عصرية - مطعم الذواقة',
          description: 'تصميم قائمة طعام أنيقة وعملية مع تنظيم واضح للأصناف',
          designType: 'menu',
          category: 'print',
          designer: 'فاطمة علي الزهراني',
          client: 'مطعم الذواقة',
          thumbnailUrl: '/mock/gallery/menu_design_thumb.jpg',
          fullImageUrl: '/mock/gallery/menu_design_full.jpg',
          completionDate: new Date('2024-09-12'),
          tags: ['قائمة طعام', 'طباعة', 'عصري', 'تنظيم'],
          culturalElements: {
            yemeniCulturalElements: false,
            islamicCompliant: true,
            traditionalElements: false
          },
          qualityRating: 4.7,
          clientSatisfaction: 4.8,
          isPublic: true,
          viewCount: 89,
          likeCount: 12
        },
        {
          id: 'gallery_003',
          title: 'تصميم شعار تراثي - مطعم التراث',
          description: 'شعار يحمل عبق التراث اليمني مع الحداثة في التصميم',
          designType: 'logo',
          category: 'branding',
          designer: 'سالم عبدالله المخلافي',
          client: 'مطعم التراث اليمني',
          thumbnailUrl: '/mock/gallery/heritage_logo_thumb.jpg',
          fullImageUrl: '/mock/gallery/heritage_logo_full.jpg',
          completionDate: new Date('2024-09-08'),
          tags: ['شعار', 'تراث', 'يمني', 'عراقة'],
          culturalElements: {
            yemeniCulturalElements: true,
            islamicCompliant: true,
            traditionalElements: true
          },
          qualityRating: 4.8,
          clientSatisfaction: 4.9,
          isPublic: true,
          viewCount: 234,
          likeCount: 31
        },
        {
          id: 'gallery_004',
          title: 'تصميم منشورات سوشيال ميديا',
          description: 'مجموعة منشورات متناسقة لحملة تسويقية على وسائل التواصل الاجتماعي',
          designType: 'social_media',
          category: 'digital',
          designer: 'فاطمة علي الزهراني',
          client: 'مطعم الأصالة اليمنية',
          thumbnailUrl: '/mock/gallery/social_media_thumb.jpg',
          fullImageUrl: '/mock/gallery/social_media_full.jpg',
          completionDate: new Date('2024-09-20'),
          tags: ['سوشيال ميديا', 'تسويق', 'حملة', 'منشورات'],
          culturalElements: {
            yemeniCulturalElements: true,
            islamicCompliant: true,
            traditionalElements: false
          },
          qualityRating: 4.6,
          clientSatisfaction: 4.7,
          isPublic: true,
          viewCount: 67,
          likeCount: 8
        },
        {
          id: 'gallery_005',
          title: 'تصميم عبوات تراثية',
          description: 'تصميم عبوات للتوابل اليمنية الأصيلة بطابع تراثي مميز',
          designType: 'packaging',
          category: 'packaging',
          designer: 'أحمد محمد الحداد',
          client: 'شركة التوابل اليمنية',
          thumbnailUrl: '/mock/gallery/packaging_thumb.jpg',
          fullImageUrl: '/mock/gallery/packaging_full.jpg',
          completionDate: new Date('2024-09-18'),
          tags: ['عبوات', 'توابل', 'تراث', 'يمني', 'أصيل'],
          culturalElements: {
            yemeniCulturalElements: true,
            islamicCompliant: true,
            traditionalElements: true
          },
          qualityRating: 4.9,
          clientSatisfaction: 5.0,
          isPublic: true,
          viewCount: 145,
          likeCount: 19
        }
      ]

      // Filter by designer if specified
      let filteredByDesigner = mockGalleryItems
      if (designerId) {
        filteredByDesigner = mockGalleryItems.filter(item => 
          item.designer.includes(designerId) // في التطبيق الحقيقي، سيكون بناءً على ID
        )
      }

      setGalleryItems(filteredByDesigner)
    } catch (error) {
      console.error('Error loading gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = galleryItems

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.designType === selectedType)
    }

    // Filter by cultural elements
    if (showCulturalOnly) {
      filtered = filtered.filter(item => 
        item.culturalElements.yemeniCulturalElements || 
        item.culturalElements.traditionalElements
      )
    }

    // Limit items if specified
    if (maxItems) {
      filtered = filtered.slice(0, maxItems)
    }

    setFilteredItems(filtered)
  }

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item)
    // Increment view count (في التطبيق الحقيقي سيكون API call)
  }

  const handleLike = (itemId: string) => {
    setGalleryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, likeCount: item.likeCount + 1 }
        : item
    ))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'branding': 'bg-purple-100 text-purple-800',
      'marketing': 'bg-blue-100 text-blue-800',
      'print': 'bg-green-100 text-green-800',
      'digital': 'bg-orange-100 text-orange-800',
      'packaging': 'bg-indigo-100 text-indigo-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const renderFilters = () => {
    if (!showFilters) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التصميم</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {designTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="culturalOnly"
                checked={showCulturalOnly}
                onChange={(e) => setShowCulturalOnly(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded"
              />
              <label htmlFor="culturalOnly" className="text-sm text-gray-700">
                🇾🇪 عناصر يمنية فقط
              </label>
            </div>
          </div>

          <div className="flex items-end space-x-2 space-x-reverse">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'grid' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              🔲 شبكة
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'masonry' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              🧱 متدرج
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderGalleryItem = (item: GalleryItem) => (
    <div
      key={item.id}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => handleItemClick(item)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder
            e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="16">🎨 ${item.title}</text></svg>`
          }}
        />
        
        {/* Cultural Elements Badge */}
        {item.culturalElements.yemeniCulturalElements && (
          <div className="absolute top-3 left-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            🇾🇪 يمني
          </div>
        )}

        {/* Quality Rating */}
        {item.qualityRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 space-x-reverse">
            <span className="text-yellow-400">⭐</span>
            <span className="text-xs font-medium">{item.qualityRating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h3>
        </div>

        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
            {categories.find(c => c.value === item.category)?.label}
          </span>
          <span className="text-xs text-gray-500">{formatDate(item.completionDate)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{item.designer}</span>
            <span className="mx-1">•</span>
            <span>{item.client}</span>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse text-xs text-gray-500">
            <div className="flex items-center space-x-1 space-x-reverse">
              <span>👁️</span>
              <span>{item.viewCount}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLike(item.id)
              }}
              className="flex items-center space-x-1 space-x-reverse hover:text-red-500 transition-colors"
            >
              <span>❤️</span>
              <span>{item.likeCount}</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderDetailModal = () => {
    if (!selectedItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                <img
                  src={selectedItem.fullImageUrl}
                  alt={selectedItem.title}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = selectedItem.thumbnailUrl
                  }}
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <p className="text-gray-700">{selectedItem.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">المصمم:</span>
                    <p className="text-gray-900">{selectedItem.designer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">العميل:</span>
                    <p className="text-gray-900">{selectedItem.client}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">تاريخ الإنجاز:</span>
                    <p className="text-gray-900">{formatDate(selectedItem.completionDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">التقييم:</span>
                    <p className="text-gray-900">
                      ⭐ {selectedItem.qualityRating}/5
                    </p>
                  </div>
                </div>

                {/* Cultural Elements */}
                <div>
                  <span className="font-medium text-gray-500 block mb-2">العناصر الثقافية:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.culturalElements.yemeniCulturalElements && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        🇾🇪 عناصر يمنية
                      </span>
                    )}
                    {selectedItem.culturalElements.islamicCompliant && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        ☪️ متوافق إسلامياً
                      </span>
                    )}
                    {selectedItem.culturalElements.traditionalElements && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                        🏛️ عناصر تراثية
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span className="font-medium text-gray-500 block mb-2">العلامات:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span>👁️</span>
                      <span>{selectedItem.viewCount} مشاهدة</span>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span>❤️</span>
                      <span>{selectedItem.likeCount} إعجاب</span>
                    </div>
                  </div>
                  
                  <Button onClick={() => handleLike(selectedItem.id)}>
                    ❤️ أعجبني
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">معرض التصاميم</h1>
          <p className="text-gray-600">
            {filteredItems.length} تصميم معتمد • أفضل أعمال المصممين اليمنيين
          </p>
        </div>
        
        {userRole === 'designer' && (
          <Button>إضافة عمل للمعرض</Button>
        )}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">🎨</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تصاميم</h3>
          <p className="text-gray-500">لم يتم العثور على تصاميم تطابق المعايير المحددة</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredItems.map(renderGalleryItem)}
        </div>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  )
}
