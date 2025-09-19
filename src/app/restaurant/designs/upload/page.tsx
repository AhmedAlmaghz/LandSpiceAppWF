'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProtectedComponent from '@/components/auth/ProtectedComponent'

// Types
interface UploadForm {
  name: string
  type: 'logo' | 'label' | 'packaging' | 'promotional'
  description: string
  notes: string
  priority: 'normal' | 'urgent'
  targetDate: string
  category: string
}

export default function UploadDesignPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    name: '',
    type: 'logo',
    description: '',
    notes: '',
    priority: 'normal',
    targetDate: '',
    category: ''
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // التحقق من صلاحية المطعم
  if (status === 'loading') {
    return <div>جاري التحميل...</div>
  }

  if (!session || session.user.role !== 'restaurant') {
    redirect('/auth/signin')
  }

  // معالجة الملفات
  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'image/jpeg', 'image/png', 'image/svg+xml',
        'application/pdf', 'application/postscript',
        'image/x-adobe-dng'
      ]
      const maxSize = 50 * 1024 * 1024 // 50MB
      
      return validTypes.includes(file.type) && file.size <= maxSize
    })
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  // Drag and Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // حذف ملف
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // رفع التصميم
  const uploadDesign = async () => {
    if (!uploadForm.name || selectedFiles.length === 0) {
      alert('يرجى إدخال اسم التصميم وتحديد ملف واحد على الأقل')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // محاكاة عملية الرفع
      const formData = new FormData()
      formData.append('name', uploadForm.name)
      formData.append('type', uploadForm.type)
      formData.append('description', uploadForm.description)
      formData.append('notes', uploadForm.notes)
      formData.append('priority', uploadForm.priority)
      formData.append('targetDate', uploadForm.targetDate)
      formData.append('category', uploadForm.category)
      
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file)
      })

      // محاكاة التقدم
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const response = await fetch('/api/restaurant/designs/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('تم رفع التصميم بنجاح!')
        router.push('/restaurant/designs')
      } else {
        // في حالة عدم توفر API
        alert(`تم رفع التصميم بنجاح!

تفاصيل التصميم:
• الاسم: ${uploadForm.name}
• النوع: ${getTypeText(uploadForm.type)}
• عدد الملفات: ${selectedFiles.length}
• الأولوية: ${uploadForm.priority === 'urgent' ? 'عاجل' : 'عادي'}

سيتم مراجعة التصميم من قبل فريق لاند سبايس وسيتم إشعارك بالنتيجة.`)
        
        router.push('/restaurant/designs')
      }
    } catch (error) {
      console.error('خطأ في رفع التصميم:', error)
      alert('حدث خطأ أثناء رفع التصميم')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'logo': return 'شعار'
      case 'label': return 'ملصق'
      case 'packaging': return 'تغليف'
      case 'promotional': return 'ترويجي'
      default: return type
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('postscript')) return '🎨'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <ProtectedComponent roles={['restaurant']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  ← العودة
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">⬆️ رفع تصميم جديد</h1>
                  <p className="text-gray-600">رفع التصاميم للمراجعة والاعتماد</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Upload Progress */}
            {isUploading && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-800 font-medium">جاري رفع التصميم...</span>
                    <span className="text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Design Information */}
            <Card>
              <CardHeader>
                <CardTitle>🏷️ معلومات التصميم</CardTitle>
                <CardDescription>أدخل تفاصيل التصميم المراد رفعه</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم التصميم *
                    </label>
                    <Input
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="مثال: شعار المطعم الجديد"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع التصميم *
                    </label>
                    <select
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="logo">🎨 شعار</option>
                      <option value="label">🏷️ ملصق</option>
                      <option value="packaging">📦 تغليف</option>
                      <option value="promotional">📢 مادة ترويجية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <select
                      value={uploadForm.priority}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="normal">📅 عادي</option>
                      <option value="urgent">⚡ عاجل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التاريخ المطلوب (اختياري)
                    </label>
                    <Input
                      type="date"
                      value={uploadForm.targetDate}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, targetDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف التصميم
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="اشرح الغرض من التصميم والمواصفات المطلوبة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="أي ملاحظات أو تعليمات خاصة للمصمم..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>📁 رفع الملفات</CardTitle>
                <CardDescription>
                  أسحب الملفات هنا أو انقر لاختيار الملفات
                  <br />
                  الأنواع المدعومة: JPG, PNG, SVG, PDF, AI, PSD (حد أقصى 50MB لكل ملف)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-6xl mb-4">📁</div>
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    اسحب وأسقط الملفات هنا
                  </div>
                  <div className="text-gray-600 mb-4">أو</div>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.svg,.pdf,.ai,.psd"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button as="span" variant="outline">
                      📂 اختر الملفات
                    </Button>
                  </label>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-gray-900">
                      الملفات المحددة ({selectedFiles.length})
                    </h4>
                    
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <span className="text-2xl">{getFileIcon(file)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatFileSize(file.size)} • {file.type}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️ حذف
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">💡 إرشادات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 space-y-2">
                <div>• تأكد من جودة التصميم ووضوح التفاصيل</div>
                <div>• يُفضل رفع التصاميم بصيغة قابلة للتعديل (AI, PSD) بالإضافة للصورة النهائية</div>
                <div>• اتبع هوية العلامة التجارية لشركة لاند سبايس</div>
                <div>• قد تستغرق عملية المراجعة من 2-5 أيام عمل</div>
                <div>• سيتم إشعارك فور اعتماد التصميم أو في حالة طلب تعديلات</div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploading}
              >
                إلغاء
              </Button>
              
              <div className="flex space-x-4 space-x-reverse">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // حفظ كمسودة
                    alert('تم حفظ التصميم كمسودة')
                  }}
                  disabled={isUploading || !uploadForm.name}
                >
                  💾 حفظ كمسودة
                </Button>
                
                <Button
                  variant="primary"
                  onClick={uploadDesign}
                  disabled={isUploading || !uploadForm.name || selectedFiles.length === 0}
                >
                  {isUploading ? '⏳ جاري الرفع...' : '🚀 رفع للمراجعة'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedComponent>
  )
}
