'use client'

import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768 // md breakpoint

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Alias for compatibility
export function useMobile() {
  return useIsMobile()
}
