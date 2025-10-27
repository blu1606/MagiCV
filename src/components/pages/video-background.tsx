"use client"

import { useEffect, useRef, useState } from "react"

interface VideoBackgroundProps {
  videoSrc: string
  className?: string
}

export function VideoBackground({ videoSrc, className = "" }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [duration, setDuration] = useState(0)
  const [docHeight, setDocHeight] = useState(0)

  // Smooth scrubbing via lerp for fewer random-access seeks
  const targetProgressRef = useRef(0)
  const rafIdRef = useRef(0)
  const SEEK_EPS = 0.05 // seek only if > ~50ms at 1s video
  const LERP = 0.18 // smoothing factor (0..1)

  const computeDocHeight = () => {
    const newDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    setDocHeight(newDocHeight)
  }

  const getScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    return Math.min(1, Math.max(0, scrollTop / docHeight))
  }

  const updateProgressBar = (progress: number) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress * 100}%`
    }
  }

  const ensurePaused = () => {
    if (videoRef.current && !videoRef.current.paused) {
      try {
        videoRef.current.pause()
      } catch (_) {
        // Ignore errors
      }
    }
  }

  const tick = () => {
    if (!isReady || duration <= 0) {
      rafIdRef.current = requestAnimationFrame(tick)
      return
    }

    // Smooth currentTime toward target
    const targetTime = targetProgressRef.current * duration
    const current = videoRef.current?.currentTime || 0
    const diff = targetTime - current

    if (Math.abs(diff) > SEEK_EPS && videoRef.current) {
      // Lerp to reduce jank from frequent random seeks
      const next = current + diff * LERP
      try {
        videoRef.current.currentTime = Math.max(0, Math.min(duration, next))
      } catch (_) {
        // Ignore errors
      }
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }

  const onScroll = () => {
    const progress = getScrollProgress()
    targetProgressRef.current = progress
    updateProgressBar(progress)
  }

  const onVideoReady = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration || 0
      if (videoDuration > 0 && Number.isFinite(videoDuration)) {
        setDuration(videoDuration)
        setIsReady(true)
        ensurePaused()
        computeDocHeight()
        const progress = getScrollProgress()
        targetProgressRef.current = progress
        updateProgressBar(progress)
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(tick)
        }
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Event listeners
    const handleLoadedMetadata = () => onVideoReady()
    const handleDurationChange = () => {
      if (!isReady && video.duration && Number.isFinite(video.duration) && video.duration > 0) {
        onVideoReady()
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
    video.addEventListener('durationchange', handleDurationChange)

    // Start loading ASAP
    if (video.readyState >= 1 && video.duration && Number.isFinite(video.duration) && video.duration > 0) {
      onVideoReady()
    } else {
      try {
        video.load()
      } catch (_) {
        // Ignore errors
      }
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('durationchange', handleDurationChange)
    }
  }, [isReady])

  useEffect(() => {
    // Scroll and resize listeners
    const handleScroll = () => onScroll()
    const handleResize = () => {
      computeDocHeight()
      onScroll()
    }

    // iOS nudge
    const handleUserInteraction = () => {
      if (!isReady && videoRef.current?.duration && Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
        onVideoReady()
      }
      ensurePaused()
      onScroll()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    window.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true })
    window.addEventListener('click', handleUserInteraction, { once: true, passive: true })
    window.addEventListener('keydown', handleUserInteraction, { once: true, passive: true })

    // Initial measurements
    computeDocHeight()
    onScroll()
    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('touchstart', handleUserInteraction)
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [isReady, duration, docHeight])

  return (
    <>
      {/* Video Background */}
      <div className={`fixed inset-0 overflow-hidden z-0 bg-transparent ${className}`}>
        <video
          ref={videoRef}
          preload="auto"
          muted
          playsInline
          webkit-playsinline=""
          className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover brightness-75 pointer-events-none"
          style={{ filter: 'brightness(0.8)' }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {/* Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 h-1 w-0 bg-gradient-to-r from-green-400 to-blue-400 shadow-lg z-10"
        style={{
          boxShadow: '0 0 10px rgba(99,179,237,0.6)'
        }}
      />

      {/* Loading Notice */}
      {!isReady && (
        <div className="fixed right-3 bottom-3 px-3 py-2 rounded-lg text-xs text-black bg-white/90 shadow-lg z-10">
          Loading video...
        </div>
      )}
    </>
  )
}
