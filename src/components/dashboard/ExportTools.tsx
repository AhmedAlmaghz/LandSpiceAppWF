'use client'

import React, { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface ExportColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'currency' | 'boolean'
  format?: (value: any) => string
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'print'
  filename?: string
  columns?: string[]
  includeHeaders?: boolean
  pageSize?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  title?: string
  subtitle?: string
  showDate?: boolean
  showLogo?: boolean
}

interface ExportToolsProps {
  data: Record<string, any>[]
  columns: ExportColumn[]
  title?: string
  defaultFilename?: string
  onExport?: (format: ExportOptions['format'], options: ExportOptions) => void
  allowedFormats?: ExportOptions['format'][]
  className?: string
  compact?: boolean
}

const ExportTools: React.FC<ExportToolsProps> = ({
  data,
  columns,
  title = 'تصدير البيانات',
  defaultFilename = 'export',
  onExport,
  allowedFormats = ['csv', 'excel', 'pdf', 'print'],
  className,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('csv')
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    filename: defaultFilename,
    columns: columns.map(col => col.key),
    includeHeaders: true,
    pageSize: 'A4',
    orientation: 'portrait',
    title: title,
    showDate: true,
    showLogo: false
  })
  const [isExporting, setIsExporting] = useState(false)

  const formatValue = (value: any, column: ExportColumn): string => {
    if (value === null || value === undefined) return ''
    
    if (column.format) {
      return column.format(value)
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR'
        }).format(Number(value) || 0)
      
      case 'number':
        return Number(value).toLocaleString('ar-SA')
      
      case 'date':
        return new Date(value).toLocaleDateString('ar-SA')
      
      case 'boolean':
        return value ? 'نعم' : 'لا'
      
      default:
        return String(value)
    }
  }

  const generateCSV = (): string => {
    const selectedColumns = columns.filter(col => options.columns?.includes(col.key))
    
    let csv = ''
    
    // Add headers
    if (options.includeHeaders) {
      csv += selectedColumns.map(col => `"${col.label}"`).join(',') + '\n'
    }
    
    // Add data rows
    data.forEach(row => {
      const values = selectedColumns.map(col => {
        const value = formatValue(row[col.key], col)
        return `"${value.replace(/"/g, '""')}"`
      })
      csv += values.join(',') + '\n'
    })
    
    return csv
  }

  const generateHTML = (forPrint = false): string => {
    const selectedColumns = columns.filter(col => options.columns?.includes(col.key))
    
    const styles = forPrint ? `
      <style>
        @media print {
          body { margin: 0; font-family: 'Cairo', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .header { margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 16px; color: #666; margin-bottom: 5px; }
          .date { font-size: 14px; color: #888; }
        }
      </style>
    ` : `
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; margin: 20px; direction: rtl; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #333; }
        .subtitle { font-size: 18px; color: #666; margin-bottom: 10px; }
        .date { font-size: 14px; color: #888; }
      </style>
    `

    let html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.title || 'تقرير'}</title>
        ${styles}
      </head>
      <body>
    `

    // Header
    if (options.title || options.showDate) {
      html += '<div class="header">'
      if (options.title) {
        html += `<div class="title">${options.title}</div>`
      }
      if (options.subtitle) {
        html += `<div class="subtitle">${options.subtitle}</div>`
      }
      if (options.showDate) {
        html += `<div class="date">تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</div>`
      }
      html += '</div>'
    }

    // Table
    html += '<table>'
    
    // Headers
    if (options.includeHeaders) {
      html += '<thead><tr>'
      selectedColumns.forEach(col => {
        html += `<th>${col.label}</th>`
      })
      html += '</tr></thead>'
    }
    
    // Data
    html += '<tbody>'
    data.forEach(row => {
      html += '<tr>'
      selectedColumns.forEach(col => {
        const value = formatValue(row[col.key], col)
        html += `<td>${value}</td>`
      })
      html += '</tr>'
    })
    html += '</tbody>'
    
    html += '</table></body></html>'
    
    return html
  }

  const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (onExport) {
        await onExport(selectedFormat, options)
      } else {
        // Default export handling
        switch (selectedFormat) {
          case 'csv':
            const csv = generateCSV()
            downloadFile(csv, `${options.filename}.csv`, 'text/csv')
            break
            
          case 'excel':
            // For Excel, we'll generate CSV with .xlsx extension
            // In a real implementation, you'd use a library like xlsx
            const excelCsv = generateCSV()
            downloadFile(excelCsv, `${options.filename}.csv`, 'application/vnd.ms-excel')
            break
            
          case 'pdf':
            // For PDF, we'll generate HTML and suggest print to PDF
            // In a real implementation, you'd use a library like jsPDF
            const pdfHtml = generateHTML()
            const pdfWindow = window.open('', '_blank')
            if (pdfWindow) {
              pdfWindow.document.write(pdfHtml)
              pdfWindow.document.close()
              setTimeout(() => {
                pdfWindow.print()
              }, 100)
            }
            break
            
          case 'print':
            const printHtml = generateHTML(true)
            const printWindow = window.open('', '_blank')
            if (printWindow) {
              printWindow.document.write(printHtml)
              printWindow.document.close()
              setTimeout(() => {
                printWindow.print()
                printWindow.close()
              }, 100)
            }
            break
        }
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const formatLabels = {
    csv: { label: 'CSV', icon: '📄', description: 'ملف نصي مفصول بفواصل' },
    excel: { label: 'Excel', icon: '📊', description: 'جدول بيانات Excel' },
    pdf: { label: 'PDF', icon: '📑', description: 'مستند PDF للمشاركة' },
    print: { label: 'طباعة', icon: '🖨️', description: 'طباعة مباشرة' }
  }

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={data.length === 0}
        >
          📤 تصدير ({data.length})
        </Button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-4 z-50 min-w-64">
            <div className="space-y-3">
              {allowedFormats.map(format => (
                <button
                  key={format}
                  onClick={() => {
                    setSelectedFormat(format)
                    setOptions(prev => ({ ...prev, format }))
                    handleExport()
                  }}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-3 space-x-reverse p-2 text-right hover:bg-gray-50 rounded transition-colors"
                >
                  <span className="text-lg">{formatLabels[format].icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{formatLabels[format].label}</div>
                    <div className="text-xs text-gray-500">{formatLabels[format].description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          تصدير {data.length} عنصر بتنسيقات مختلفة
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            تنسيق التصدير
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allowedFormats.map(format => (
              <label
                key={format}
                className={cn(
                  'flex items-center space-x-3 space-x-reverse p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedFormat === format 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value={format}
                  checked={selectedFormat === format}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value as ExportOptions['format'])
                    setOptions(prev => ({ ...prev, format: e.target.value as ExportOptions['format'] }))
                  }}
                  className="text-red-600"
                />
                <span className="text-lg">{formatLabels[format].icon}</span>
                <div>
                  <div className="font-medium">{formatLabels[format].label}</div>
                  <div className="text-xs text-gray-500">{formatLabels[format].description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700">خيارات التصدير</h4>
          
          {/* Filename */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              اسم الملف
            </label>
            <input
              type="text"
              value={options.filename || ''}
              onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="اسم الملف"
            />
          </div>

          {/* Column Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الأعمدة المطلوب تصديرها
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
              {columns.map(column => (
                <label key={column.key} className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={options.columns?.includes(column.key) || false}
                    onChange={(e) => {
                      const currentColumns = options.columns || []
                      const newColumns = e.target.checked
                        ? [...currentColumns, column.key]
                        : currentColumns.filter(k => k !== column.key)
                      setOptions(prev => ({ ...prev, columns: newColumns }))
                    }}
                    className="rounded border-gray-300 text-red-600"
                  />
                  <span className="text-sm">{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={options.includeHeaders || false}
                onChange={(e) => setOptions(prev => ({ ...prev, includeHeaders: e.target.checked }))}
                className="rounded border-gray-300 text-red-600"
              />
              <span className="text-sm">تضمين رؤوس الأعمدة</span>
            </label>

            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={options.showDate || false}
                onChange={(e) => setOptions(prev => ({ ...prev, showDate: e.target.checked }))}
                className="rounded border-gray-300 text-red-600"
              />
              <span className="text-sm">إظهار تاريخ التصدير</span>
            </label>
          </div>

          {/* PDF/Print specific options */}
          {(selectedFormat === 'pdf' || selectedFormat === 'print') && (
            <div className="space-y-4 border-t pt-4">
              <h5 className="text-sm font-medium text-gray-700">خيارات الطباعة</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    حجم الصفحة
                  </label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    اتجاه الصفحة
                  </label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="portrait">عمودي</option>
                    <option value="landscape">أفقي</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex justify-end space-x-2 space-x-reverse border-t pt-6">
          <Button
            onClick={handleExport}
            disabled={isExporting || data.length === 0 || !options.columns?.length}
            className="min-w-32"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                جاري التصدير...
              </>
            ) : (
              <>
                📤 تصدير ({data.length})
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExportTools
