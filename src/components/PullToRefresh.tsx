import { useState, useRef, useCallback, ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const threshold = 80 // pixels to pull before triggering refresh
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return
    if (containerRef.current?.scrollTop !== 0) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current
    
    if (diff > 0 && startY.current > 0) {
      // Rubber band effect - diminishing returns as you pull further
      const dampedPull = Math.min(diff * 0.5, 120)
      setPullDistance(dampedPull)
    }
  }, [isRefreshing])
  
  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(50) // Hold at indicator position
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    startY.current = 0
  }, [pullDistance, isRefreshing, onRefresh])
  
  const showIndicator = pullDistance > 10 || isRefreshing
  const indicatorReady = pullDistance >= threshold
  
  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        minHeight: '100%',
        transform: `translateY(${pullDistance * 0.3}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
      }}
    >
      <div 
        className={`pull-indicator ${showIndicator ? 'visible' : ''} ${isRefreshing ? 'refreshing' : ''}`}
        style={{ 
          opacity: Math.min(pullDistance / threshold, 1)
        }}
      >
        {isRefreshing ? (
          <>
            <div className="pull-spinner" />
            <span>Refreshing...</span>
          </>
        ) : indicatorReady ? (
          <span>Release to refresh</span>
        ) : (
          <span>↓ Pull to refresh</span>
        )}
      </div>
      {children}
    </div>
  )
}
