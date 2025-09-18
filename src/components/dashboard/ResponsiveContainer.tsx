'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

interface BreakpointHook {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeScreen: boolean
  width: number
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large'
}

// Custom hook for responsive breakpoints
export const useBreakpoint = (customBreakpoints?: ResponsiveContainerProps['breakpoints']): BreakpointHook => {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }

  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints }

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg && windowSize.width < breakpoints.xl
  const isLargeScreen = windowSize.width >= breakpoints.xl

  let breakpoint: BreakpointHook['breakpoint'] = 'mobile'
  if (isLargeScreen) breakpoint = 'large'
  else if (isDesktop) breakpoint = 'desktop'
  else if (isTablet) breakpoint = 'tablet'

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    width: windowSize.width,
    breakpoint
  }
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  breakpoints: customBreakpoints
}) => {
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useBreakpoint(customBreakpoints)

  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      {
        'max-w-full': isMobile,
        'max-w-4xl': isTablet,
        'max-w-6xl': isDesktop,
        'max-w-7xl': isLargeScreen
      },
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className
}) => {
  const gridClasses = cn(
    'grid',
    {
      [`grid-cols-${cols.default}`]: cols.default,
      [`sm:grid-cols-${cols.sm}`]: cols.sm,
      [`md:grid-cols-${cols.md}`]: cols.md,
      [`lg:grid-cols-${cols.lg}`]: cols.lg,
      [`xl:grid-cols-${cols.xl}`]: cols.xl,
      [`gap-${gap}`]: gap
    },
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Responsive Stack Component (Vertical layout with responsive spacing)
interface ResponsiveStackProps {
  children: React.ReactNode
  spacing?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
  }
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  spacing = { default: 4, sm: 4, md: 6, lg: 8 },
  align = 'stretch',
  className
}) => {
  const stackClasses = cn(
    'flex flex-col',
    {
      [`space-y-${spacing.default}`]: spacing.default,
      [`sm:space-y-${spacing.sm}`]: spacing.sm,
      [`md:space-y-${spacing.md}`]: spacing.md,
      [`lg:space-y-${spacing.lg}`]: spacing.lg,
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch'
    },
    className
  )

  return (
    <div className={stackClasses}>
      {children}
    </div>
  )
}

// Responsive Show/Hide Component
interface ResponsiveShowProps {
  children: React.ReactNode
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large'
  direction?: 'up' | 'down' | 'only'
  className?: string
}

export const ResponsiveShow: React.FC<ResponsiveShowProps> = ({
  children,
  breakpoint,
  direction = 'up',
  className
}) => {
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useBreakpoint()

  const shouldShow = () => {
    const breakpoints = {
      mobile: isMobile,
      tablet: isTablet,
      desktop: isDesktop,
      large: isLargeScreen
    }

    if (direction === 'only') {
      return breakpoints[breakpoint]
    }

    if (direction === 'up') {
      // Show on specified breakpoint and up
      switch (breakpoint) {
        case 'mobile': return true
        case 'tablet': return isTablet || isDesktop || isLargeScreen
        case 'desktop': return isDesktop || isLargeScreen
        case 'large': return isLargeScreen
        default: return true
      }
    }

    if (direction === 'down') {
      // Show on specified breakpoint and down
      switch (breakpoint) {
        case 'large': return true
        case 'desktop': return !isLargeScreen
        case 'tablet': return isMobile || isTablet
        case 'mobile': return isMobile
        default: return true
      }
    }

    return true
  }

  if (!shouldShow()) {
    return null
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode
  size?: {
    default?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  }
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  className?: string
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { default: 'base' },
  weight = 'normal',
  align = 'right', // Default to right for Arabic
  className
}) => {
  const textClasses = cn(
    {
      [`text-${size.default}`]: size.default,
      [`sm:text-${size.sm}`]: size.sm,
      [`md:text-${size.md}`]: size.md,
      [`lg:text-${size.lg}`]: size.lg,
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right'
    },
    className
  )

  return (
    <span className={textClasses}>
      {children}
    </span>
  )
}

// Responsive Sidebar Component
interface ResponsiveSidebarProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  side?: 'left' | 'right'
  overlay?: boolean
  className?: string
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  isOpen,
  onClose,
  side = 'right', // Default to right for Arabic
  overlay = true,
  className
}) => {
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isMobile])

  if (isMobile) {
    // Mobile: Full overlay sidebar
    return (
      <>
        {/* Overlay */}
        {isOpen && overlay && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={onClose}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          'fixed top-0 h-full w-80 max-w-[85vw] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50',
          {
            'right-0': side === 'right',
            'left-0': side === 'left',
            'translate-x-0': isOpen && side === 'right',
            'translate-x-full': !isOpen && side === 'right',
            'translate-x-0': isOpen && side === 'left',
            '-translate-x-full': !isOpen && side === 'left'
          },
          className
        )}>
          {children}
        </div>
      </>
    )
  }

  // Desktop: Always visible or collapsible
  return (
    <div className={cn(
      'transition-all duration-300 ease-in-out bg-white border-r',
      {
        'w-80': isOpen,
        'w-0 overflow-hidden': !isOpen
      },
      className
    )}>
      {isOpen && children}
    </div>
  )
}

export default ResponsiveContainer
