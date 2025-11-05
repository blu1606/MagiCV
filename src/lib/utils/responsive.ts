/**
 * Responsive Design Utilities
 * Helpers for responsive and mobile-friendly UI
 */

import { useEffect, useState } from 'react'

/**
 * Breakpoint definitions matching Tailwind CSS
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook to detect current screen size
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('2xl')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.sm) setBreakpoint('sm')
      else if (width < BREAKPOINTS.md) setBreakpoint('md')
      else if (width < BREAKPOINTS.lg) setBreakpoint('lg')
      else if (width < BREAKPOINTS.xl) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

/**
 * Hook to detect if screen is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

/**
 * Hook to detect if device supports touch
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    )
  }, [])

  return isTouch
}

/**
 * Hook to get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

/**
 * Get responsive padding/spacing values
 */
export function getResponsiveSpacing(size: 'sm' | 'md' | 'lg' | 'xl') {
  const spacings = {
    sm: { mobile: 'p-4', tablet: 'md:p-6', desktop: 'lg:p-8' },
    md: { mobile: 'p-6', tablet: 'md:p-8', desktop: 'lg:p-12' },
    lg: { mobile: 'p-8', tablet: 'md:p-12', desktop: 'lg:p-16' },
    xl: { mobile: 'p-12', tablet: 'md:p-16', desktop: 'lg:p-24' },
  }

  return spacings[size]
}

/**
 * Get responsive text size classes
 */
export function getResponsiveText(size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl') {
  const textSizes = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl lg:text-4xl',
    '3xl': 'text-3xl md:text-4xl lg:text-5xl',
  }

  return textSizes[size]
}

/**
 * Get touch-friendly minimum sizes
 */
export const TOUCH_TARGETS = {
  minHeight: 'min-h-[44px]', // Apple's recommended minimum
  minWidth: 'min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]', // More comfortable for large fingers
  large: 'min-h-[56px] min-w-[56px]', // Extra large for accessibility
} as const

/**
 * Get swipe gesture handlers
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 })

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    })
  }

  const handleTouchEnd = () => {
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeLeft) onSwipeLeft()
      if (deltaX < -threshold && onSwipeRight) onSwipeRight()
    }
    // Vertical swipe
    else {
      if (deltaY > threshold && onSwipeUp) onSwipeUp()
      if (deltaY < -threshold && onSwipeDown) onSwipeDown()
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

/**
 * Detect scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up')
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return scrollDirection
}

/**
 * Check if element is in viewport
 */
export function useInViewport(ref: React.RefObject<HTMLElement>) {
  const [isInViewport, setIsInViewport] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [ref])

  return isInViewport
}

/**
 * Responsive grid columns helper
 */
export function getResponsiveGrid(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
) {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`
}
