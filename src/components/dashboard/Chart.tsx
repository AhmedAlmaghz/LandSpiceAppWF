'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

// Support for Chart.js like data structure
interface ChartDataset {
  label?: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

interface ChartJsData {
  labels: string[]
  datasets: ChartDataset[]
}

interface ChartProps {
  title?: string
  description?: string
  data: ChartDataPoint[] | ChartJsData | any
  type?: 'bar' | 'line' | 'pie' | 'area' | 'doughnut'
  width?: number
  height?: number
  color?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  animate?: boolean
  className?: string
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void
}

const Chart: React.FC<ChartProps> = ({
  title,
  description,
  data,
  type = 'bar',
  width = 400,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  animate = true,
  className,
  onDataPointClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    content: string
  }>({ show: false, x: 0, y: 0, content: '' })

  // Convert Chart.js format to ChartDataPoint format
  const convertToChartDataPoints = (inputData: any): ChartDataPoint[] => {
    // If already in correct format
    if (Array.isArray(inputData) && inputData.length > 0 && 'label' in inputData[0] && 'value' in inputData[0]) {
      return inputData
    }
    
    // If Chart.js format
    if (inputData && inputData.labels && inputData.datasets && Array.isArray(inputData.datasets)) {
      const labels = inputData.labels
      const dataset = inputData.datasets[0] // Use first dataset
      
      if (dataset && Array.isArray(dataset.data)) {
        return labels.map((label: string, index: number) => ({
          label,
          value: dataset.data[index] || 0,
          color: Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[index] 
            : dataset.backgroundColor || undefined
        }))
      }
    }
    
    // Fallback to empty array
    return []
  }

  // Safety check: ensure data is an array and has valid data
  const safeData = convertToChartDataPoints(data)
  const maxValue = safeData.length > 0 ? Math.max(...safeData.map(d => d.value || 0)) : 1
  const padding = 40
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  useEffect(() => {
    if (!canvasRef.current || safeData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set RTL direction for Arabic text
    ctx.direction = 'rtl'
    ctx.textAlign = 'right'
    ctx.font = '12px Cairo, sans-serif'

    if (type === 'bar') {
      drawBarChart(ctx)
    } else if (type === 'line') {
      drawLineChart(ctx)
    } else if (type === 'pie' || type === 'doughnut') {
      drawPieChart(ctx)
    } else if (type === 'area') {
      drawAreaChart(ctx)
    }
  }, [safeData, type, width, height, maxValue, animate])

  const drawBarChart = (ctx: CanvasRenderingContext2D) => {
    if (safeData.length === 0) return
    
    const barWidth = chartWidth / safeData.length
    const barSpacing = barWidth * 0.2
    const actualBarWidth = barWidth - barSpacing

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        
        // Y-axis labels
        ctx.fillStyle = '#6b7280'
        const value = Math.round((maxValue / 5) * (5 - i))
        ctx.fillText(value.toString(), padding - 10, y + 4)
      }
    }

    // Draw bars
    safeData.forEach((dataPoint, index) => {
      const barHeight = (dataPoint.value / maxValue) * chartHeight
      const x = padding + index * barWidth + barSpacing / 2
      const y = height - padding - barHeight

      const barColor = dataPoint.color || color

      if (animate) {
        // Simple animation effect
        ctx.globalAlpha = 0.8
      }

      ctx.fillStyle = barColor
      ctx.fillRect(x, y, actualBarWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.fillText(
        dataPoint.value.toString(),
        x + actualBarWidth / 2,
        y - 5
      )

      // Draw label below bar
      ctx.fillText(
        dataPoint.label,
        x + actualBarWidth / 2,
        height - padding + 20
      )

      ctx.globalAlpha = 1
    })
  }

  const drawLineChart = (ctx: CanvasRenderingContext2D) => {
    if (safeData.length < 2) return

    const pointSpacing = chartWidth / (safeData.length - 1)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
      }
    }

    // Draw line
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()

    safeData.forEach((dataPoint, index) => {
      const x = padding + index * pointSpacing
      const y = height - padding - (dataPoint.value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    safeData.forEach((dataPoint, index) => {
      const x = padding + index * pointSpacing
      const y = height - padding - (dataPoint.value / maxValue) * chartHeight

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Draw labels
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.fillText(dataPoint.label, x, height - padding + 20)
    })
  }

  const drawPieChart = (ctx: CanvasRenderingContext2D) => {
    if (safeData.length === 0) return
    
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20
    const innerRadius = type === 'doughnut' ? radius * 0.4 : 0

    const total = safeData.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = -Math.PI / 2

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ]

    safeData.forEach((dataPoint, index) => {
      const sliceAngle = (dataPoint.value / total) * 2 * Math.PI
      const sliceColor = dataPoint.color || colors[index % colors.length]

      ctx.fillStyle = sliceColor
      ctx.beginPath()
      
      if (type === 'doughnut') {
        // Draw doughnut slice
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
      } else {
        // Draw pie slice
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      }
      
      ctx.closePath()
      ctx.fill()

      // Draw percentage label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelRadius = type === 'doughnut' ? (radius + innerRadius) / 2 : radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius
      
      const percentage = Math.round((dataPoint.value / total) * 100)
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = 'bold 12px Cairo, sans-serif'
      ctx.fillText(`${percentage}%`, labelX, labelY)

      currentAngle += sliceAngle
    })
  }

  const drawAreaChart = (ctx: CanvasRenderingContext2D) => {
    if (safeData.length < 2) return

    const pointSpacing = chartWidth / (safeData.length - 1)

    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, color + '80') // 50% opacity
    gradient.addColorStop(1, color + '20') // 12% opacity

    // Draw area
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    safeData.forEach((dataPoint, index) => {
      const x = padding + index * pointSpacing
      const y = height - padding - (dataPoint.value / maxValue) * chartHeight
      ctx.lineTo(x, y)
    })

    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw line on top
    drawLineChart(ctx)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onDataPointClick || type === 'pie') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (type === 'bar') {
      const barWidth = chartWidth / safeData.length
      const clickedIndex = Math.floor((x - padding) / barWidth)
      
      if (clickedIndex >= 0 && clickedIndex < safeData.length) {
        onDataPointClick(safeData[clickedIndex], clickedIndex)
      }
    }
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showTooltip) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Simple tooltip logic for bar charts
    if (type === 'bar') {
      const barWidth = chartWidth / safeData.length
      const hoveredIndex = Math.floor((x - padding) / barWidth)
      
      if (hoveredIndex >= 0 && hoveredIndex < safeData.length && 
          x >= padding && x <= width - padding && 
          y >= padding && y <= height - padding) {
        
        const dataPoint = safeData[hoveredIndex]
        setTooltip({
          show: true,
          x: event.clientX,
          y: event.clientY - 50,
          content: `${dataPoint.label}: ${dataPoint.value}`
        })
      } else {
        setTooltip(prev => ({ ...prev, show: false }))
      }
    }
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent>
        {safeData.length === 0 ? (
          <div 
            className="border border-gray-200 rounded flex items-center justify-center text-gray-500"
            style={{ width: width, height: height }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>لا توجد بيانات للعرض</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded cursor-pointer"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
            />
          
            {/* Tooltip */}
            {tooltip.show && (
              <div
                className="absolute bg-gray-800 text-white text-sm rounded px-2 py-1 pointer-events-none z-10"
                style={{
                  left: tooltip.x - 300, // Adjust for canvas position
                  top: tooltip.y - 100
                }}
              >
                {tooltip.content}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {showLegend && safeData.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {safeData.map((dataPoint, index) => {
              const colors = [
                '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
                '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
              ]
              const itemColor = dataPoint.color || (type === 'pie' ? colors[index % colors.length] : color)
              
              return (
                <div key={index} className="flex items-center space-x-2 space-x-reverse">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: itemColor }}
                  />
                  <span className="text-sm text-gray-600">{dataPoint.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Chart
