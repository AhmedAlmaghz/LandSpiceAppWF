'use client'

import React, { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartJSProps {
  title?: string
  description?: string
  data: any
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  height?: number
  className?: string
  options?: any
}

const ChartJS: React.FC<ChartJSProps> = ({
  title,
  description,
  data,
  type,
  height = 300,
  className,
  options = {}
}) => {
  // Default options with RTL support
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Cairo, sans-serif',
          size: 16
        }
      },
      tooltip: {
        rtl: true,
        titleFont: {
          family: 'Cairo, sans-serif'
        },
        bodyFont: {
          family: 'Cairo, sans-serif'
        }
      }
    },
    scales: type === 'bar' || type === 'line' ? {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Cairo, sans-serif'
          }
        }
      }
    } : undefined,
    ...options
  }

  // Safety check for data
  const safeData = data || {
    labels: [],
    datasets: []
  }

  const renderChart = () => {
    const chartProps = {
      data: safeData,
      options: defaultOptions,
      height
    }

    switch (type) {
      case 'bar':
        return <Bar {...chartProps} />
      case 'line':
        return <Line {...chartProps} />
      case 'pie':
        return <Pie {...chartProps} />
      case 'doughnut':
        return <Doughnut {...chartProps} />
      default:
        return <Bar {...chartProps} />
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
        {safeData.labels?.length === 0 ? (
          <div 
            className="border border-gray-200 rounded flex items-center justify-center text-gray-500"
            style={{ height: height }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>لا توجد بيانات للعرض</p>
            </div>
          </div>
        ) : (
          <div style={{ height: height }}>
            {renderChart()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ChartJS
