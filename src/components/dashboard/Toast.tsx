'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

interface ToastProviderProps {
  children: React.ReactNode
}

// Toast context
const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
})

// Hook for using toast
export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Individual Toast Component
const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto close
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 300)
  }

  const getIcon = (type: Toast['type']) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[type]
  }

  const getColors = (type: Toast['type']) => {
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    }
    return colors[type]
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-out',
        getColors(toast.type),
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">{getIcon(toast.type)}</span>
          </div>
          
          <div className="mr-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm opacity-90">{toast.description}</p>
            )}
            
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="mr-4 flex flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">إغلاق</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast Provider Component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toastData, id }
    setToasts(current => [...current, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[9999]"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastItem
