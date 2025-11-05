/**
 * Unit tests for responsive utilities
 */

import {
  BREAKPOINTS,
  getResponsiveSpacing,
  getResponsiveText,
  TOUCH_TARGETS,
  getResponsiveGrid,
} from '../responsive'

describe('Responsive Utilities', () => {
  describe('BREAKPOINTS', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.sm).toBe(640)
      expect(BREAKPOINTS.md).toBe(768)
      expect(BREAKPOINTS.lg).toBe(1024)
      expect(BREAKPOINTS.xl).toBe(1280)
      expect(BREAKPOINTS['2xl']).toBe(1536)
    })
  })

  describe('getResponsiveSpacing', () => {
    it('should return correct spacing classes for sm', () => {
      const spacing = getResponsiveSpacing('sm')
      expect(spacing.mobile).toBe('p-4')
      expect(spacing.tablet).toBe('md:p-6')
      expect(spacing.desktop).toBe('lg:p-8')
    })

    it('should return correct spacing classes for md', () => {
      const spacing = getResponsiveSpacing('md')
      expect(spacing.mobile).toBe('p-6')
      expect(spacing.tablet).toBe('md:p-8')
      expect(spacing.desktop).toBe('lg:p-12')
    })

    it('should return correct spacing classes for lg', () => {
      const spacing = getResponsiveSpacing('lg')
      expect(spacing.mobile).toBe('p-8')
      expect(spacing.tablet).toBe('md:p-12')
      expect(spacing.desktop).toBe('lg:p-16')
    })

    it('should return correct spacing classes for xl', () => {
      const spacing = getResponsiveSpacing('xl')
      expect(spacing.mobile).toBe('p-12')
      expect(spacing.tablet).toBe('md:p-16')
      expect(spacing.desktop).toBe('lg:p-24')
    })
  })

  describe('getResponsiveText', () => {
    it('should return correct text size for sm', () => {
      expect(getResponsiveText('sm')).toBe('text-sm md:text-base')
    })

    it('should return correct text size for md', () => {
      expect(getResponsiveText('md')).toBe('text-base md:text-lg')
    })

    it('should return correct text size for lg', () => {
      expect(getResponsiveText('lg')).toBe('text-lg md:text-xl')
    })

    it('should return correct text size for xl', () => {
      expect(getResponsiveText('xl')).toBe('text-xl md:text-2xl')
    })

    it('should return correct text size for 2xl', () => {
      expect(getResponsiveText('2xl')).toBe('text-2xl md:text-3xl lg:text-4xl')
    })

    it('should return correct text size for 3xl', () => {
      expect(getResponsiveText('3xl')).toBe('text-3xl md:text-4xl lg:text-5xl')
    })
  })

  describe('TOUCH_TARGETS', () => {
    it('should have correct minimum touch target sizes', () => {
      expect(TOUCH_TARGETS.minHeight).toBe('min-h-[44px]')
      expect(TOUCH_TARGETS.minWidth).toBe('min-w-[44px]')
    })

    it('should have comfortable touch target size', () => {
      expect(TOUCH_TARGETS.comfortable).toBe('min-h-[48px] min-w-[48px]')
    })

    it('should have large touch target size', () => {
      expect(TOUCH_TARGETS.large).toBe('min-h-[56px] min-w-[56px]')
    })
  })

  describe('getResponsiveGrid', () => {
    it('should generate correct grid classes with defaults', () => {
      const grid = getResponsiveGrid()
      expect(grid).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
    })

    it('should generate correct grid classes with custom values', () => {
      const grid = getResponsiveGrid(2, 3, 4)
      expect(grid).toBe('grid-cols-2 md:grid-cols-3 lg:grid-cols-4')
    })

    it('should handle single column layouts', () => {
      const grid = getResponsiveGrid(1, 1, 1)
      expect(grid).toBe('grid-cols-1 md:grid-cols-1 lg:grid-cols-1')
    })

    it('should handle complex grid layouts', () => {
      const grid = getResponsiveGrid(1, 2, 6)
      expect(grid).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-6')
    })
  })
})

describe('Responsive Hooks', () => {
  // Note: These hooks require browser environment and are tested with React Testing Library
  // For now, we just ensure they're exported correctly

  it('should export useBreakpoint hook', () => {
    const { useBreakpoint } = require('../responsive')
    expect(typeof useBreakpoint).toBe('function')
  })

  it('should export useIsMobile hook', () => {
    const { useIsMobile } = require('../responsive')
    expect(typeof useIsMobile).toBe('function')
  })

  it('should export useIsTouchDevice hook', () => {
    const { useIsTouchDevice } = require('../responsive')
    expect(typeof useIsTouchDevice).toBe('function')
  })

  it('should export useViewport hook', () => {
    const { useViewport } = require('../responsive')
    expect(typeof useViewport).toBe('function')
  })

  it('should export useSwipeGesture hook', () => {
    const { useSwipeGesture } = require('../responsive')
    expect(typeof useSwipeGesture).toBe('function')
  })

  it('should export useScrollDirection hook', () => {
    const { useScrollDirection } = require('../responsive')
    expect(typeof useScrollDirection).toBe('function')
  })

  it('should export useInViewport hook', () => {
    const { useInViewport } = require('../responsive')
    expect(typeof useInViewport).toBe('function')
  })
})
