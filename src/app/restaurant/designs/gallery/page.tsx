'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent from '@/components/auth/ProtectedComponent'
import { formatDate } from '@/lib/utils'

interface ApprovedDesign {
  id: string
  name: string
  type: 'logo' | 'label' | 'packaging' | 'promotional'
  fileUrl: string
  thumbnailUrl: string
  description?: string
  approvedAt: Date
  downloadCount: number
  tags: string[]
  format: string
}

export default function DesignGalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [designs, setDesigns] = useState<ApprovedDesign[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApprovedDesigns()
  }, [])

  const fetchApprovedDesigns = async () => {
    try {
      const mockDesigns: ApprovedDesign[] = [
        {
          id: '1',
          name: 'شعار المطعم الرسمي',
          type: 'logo',
          fileUrl: '/designs/logo-official.png',
          thumbnailUrl: '/designs/thumbs/logo-official.jpg',
          description: 'الشعار الرسمي المعتمد للمطعم',
          approvedAt: new Date('2025-01-12'),
          downloadCount: 45,
          tags: ['شعار', 'هوية', 'رسمي'],
          format: 'PNG'
        },
        {
          id: '2',
          name: 'ملصق كاتشب 500مل',
          type: 'label',
          fileUrl: '/designs/ketchup-label.pdf',
          thumbnailUrl: '/designs/thumbs/ketchup-label.jpg',
          description: 'ملصق معتمد لعبوات الكاتشب',
          approvedAt: new Date('2025-01-10'),
          downloadCount: 28,
          tags: ['ملصق', 'كاتشب'],
          format: 'PDF'
        },
        {
          id: '3',
          name: 'تغليف العبوات الكبيرة',
          type: 'packaging',
          fileUrl: '/designs/large-packaging.ai',
          thumbnailUrl: '/designs/thumbs/large-packaging.jpg',
          description: 'تصميم تغليف للعبوات الكبيرة',
          approvedAt: new Date('2025-01-08'),
          downloadCount: 15,
          tags: ['تغليف', 'عبوات'],
          format: 'AI'
        }
      ]
      setDesigns(mockDesigns)
    } catch (error) {
      console.error('خطأ في جلب التصاميم:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return <div>جاري التحميل...</div>
  if (!session || session.user.role !== 'restaurant') redirect('/auth/signin')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'logo': return '🎨'
      case 'label': return '🏷️'
      case 'packaging': return '📦'
      case 'promotional': return '📢'
      default: return '🖼️'
    }
  }

  const filteredDesigns = designs.filter(design => {
    const typeMatch = selectedType === 'all' || design.type === selectedType
    const searchMatch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       design.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return typeMatch && searchMatch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المعرض...</p>
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
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button variant="ghost" onClick={() => router.back()}>← العودة</Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🖼️ معرض التصاميم</h1>
                  <p className="text-gray-600">التصاميم المعتمدة والجاهزة للاستخدام</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex space-x-4 space-x-reverse">
                  {['all', 'logo', 'label', 'packaging', 'promotional'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === type
                          ? 'bg-red-100 text-red-600 border border-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? '🎨 الكل' :
                       type === 'logo' ? '🎨 شعارات' :
                       type === 'label' ? '🏷️ ملصقات' :
                       type === 'packaging' ? '📦 تغليف' :
                       '📢 ترويجي'}
                    </button>
                  ))}
                </div>
                
                <Input
                  placeholder="البحث في التصاميم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery Grid */}
          {filteredDesigns.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد تصاميم</h3>
              <p className="text-gray-600">لم يتم العثور على تصاميم تطابق البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDesigns.map(design => (
                <Card key={design.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={design.thumbnailUrl}
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk0QTNBOCI+8J+WvO+4jzwvdGV4dD4KPC9zdmc+'
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getTypeIcon(design.type)}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {design.format}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {design.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {design.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {design.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {design.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{design.tags.length - 2}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>📥 {design.downloadCount}</span>
                      <span>{formatDate(design.approvedAt)}</span>
                    </div>
                    
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/restaurant/designs/${design.id}`)}
                        className="flex-1"
                      >
                        👁️ عرض
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => window.open(design.fileUrl, '_blank')}
                        className="flex-1"
                      >
                        📥 تحميل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedComponent>
  )
}
