/**
 * Touch Feedback Components
 * Provides haptic-like visual feedback for touch interactions
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TouchFeedbackProps {
  children: React.ReactNode
  className?: string
  onPress?: () => void
  disabled?: boolean
  haptic?: boolean
}

/**
 * TouchButton - Button with touch feedback animation
 */
export function TouchButton({
  children,
  className,
  onPress,
  disabled = false,
  haptic = true,
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    if (disabled) return
    setIsPressed(true)
    if (haptic && navigator.vibrate) {
      navigator.vibrate(10) // Subtle haptic feedback
    }
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (!disabled && onPress) {
      onPress()
    }
  }

  return (
    <div
      className={cn(
        'cursor-pointer select-none transition-all duration-150',
        isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </div>
  )
}

/**
 * TouchCard - Card with ripple effect on touch
 */
export function TouchCard({
  children,
  className,
  onPress,
  disabled = false,
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples([...ripples, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)

    if (onPress) onPress()
  }

  return (
    <div
      className={cn('relative overflow-hidden', disabled && 'opacity-50', className)}
      onTouchStart={handleTouch}
      onMouseDown={handleTouch}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}
    </div>
  )
}

/**
 * SwipeableItem - Item that can be swiped left/right
 */
interface SwipeableItemProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  threshold?: number
  className?: string
}

export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeableItemProps) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchCurrent, setTouchCurrent] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const offset = touchCurrent - touchStart

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    setTouchCurrent(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (Math.abs(offset) > threshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    setTouchStart(0)
    setTouchCurrent(0)
    setIsSwiping(false)
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left action (revealed on swipe right) */}
      {leftAction && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center px-4"
          style={{
            transform: `translateX(${Math.min(offset, 0)}px)`,
            opacity: Math.min(Math.abs(offset) / threshold, 1),
          }}
        >
          {leftAction}
        </div>
      )}

      {/* Right action (revealed on swipe left) */}
      {rightAction && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center px-4"
          style={{
            transform: `translateX(${Math.max(offset, 0)}px)`,
            opacity: Math.min(Math.abs(offset) / threshold, 1),
          }}
        >
          {rightAction}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative transition-transform duration-200"
        style={{
          transform: isSwiping ? `translateX(${offset}px)` : 'translateX(0)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * PullToRefresh - Pull-to-refresh gesture
 */
interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === 0 || window.scrollY > 0) return

    const distance = e.touches[0].clientY - touchStart
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
    setTouchStart(0)
  }

  const progress = Math.min((pullDistance / threshold) * 100, 100)

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: pullDistance,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="relative w-8 h-8">
          <svg
            className={cn(
              'w-full h-full',
              isRefreshing && 'animate-spin'
            )}
            viewBox="0 0 24 24"
          >
            <circle
              className="text-slate-700"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              r="10"
              cx="12"
              cy="12"
            />
            <circle
              className="text-[#0ea5e9]"
              strokeWidth="3"
              strokeDasharray={`${progress * 0.628}, 62.8`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              r="10"
              cx="12"
              cy="12"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Add ripple animation to global CSS
// Add this to globals.css:
/*
@keyframes ripple {
  from {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  to {
    width: 300px;
    height: 300px;
    opacity: 0;
    transform: translate(-50%, -50%);
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out;
}
*/
