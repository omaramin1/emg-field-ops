/**
 * Feed Page - Real-time team activity feed
 * Auto-updates when anyone logs a deal
 */

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase, KnockRecord } from '../lib/supabase'
import { Bell, Trophy, MapPin, Clock } from 'lucide-react'

interface FeedItem {
  id: string
  type: 'deal' | 'milestone'
  canvasser_name: string
  address?: string
  timestamp: string
  message: string
}

export function Feed() {
  const { currentRep } = useAuthStore()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load recent deals on mount
  useEffect(() => {
    loadRecentDeals()
  }, [])

  // Subscribe to real-time deal updates
  useEffect(() => {
    const channel = supabase
      .channel('deals-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'knocks',
          filter: 'result=eq.signed_up'
        },
        (payload) => {
          const knock = payload.new as KnockRecord
          addDealToFeed(knock)
          playDealSound()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const loadRecentDeals = async () => {
    setIsLoading(true)
    
    // Get today's deals
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('knocks')
      .select('*')
      .eq('result', 'signed_up')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      const items: FeedItem[] = data.map(knock => ({
        id: knock.id,
        type: 'deal',
        canvasser_name: knock.canvasser_name || 'Unknown Rep',
        address: knock.address,
        timestamp: knock.created_at,
        message: `🎉 ${knock.canvasser_name || 'A rep'} closed a deal!`
      }))
      setFeedItems(items)
    }
    
    setIsLoading(false)
  }

  const addDealToFeed = (knock: KnockRecord) => {
    const newItem: FeedItem = {
      id: knock.id,
      type: 'deal',
      canvasser_name: knock.canvasser_name || 'Unknown Rep',
      address: knock.address,
      timestamp: knock.created_at,
      message: `🎉 ${knock.canvasser_name || 'A rep'} closed a deal!`
    }
    
    setFeedItems(prev => [newItem, ...prev])
    
    // Scroll to top to show new item
    if (feedRef.current) {
      feedRef.current.scrollTop = 0
    }
  }

  const playDealSound = () => {
    // Play a celebration sound
    if (!audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHVmaX6Ok5+dmIpxZGd9kJugnZSGcWRqfZCbn5ySg3BkaX2RnZ+ckYNwZWl9kp6gnJKDcGVpfZOen5ySg3Blan6Tnp+bkYJwZWp+k56fm5GBcGZqfpSen5uRgXBman6UnZ+akYFwZmt+lJ2fmpGBcGZrfpSdn5qQgXBmbH6UnZ+aj4FwZmx+lJ2fmo+AcGdsfpSdn5qPgHBnbH6UnZ+ajoBwZ21+lJ2emo6AcGdtfpSdnpqOgHBnbX6UnZ6ajoB')
      audioRef.current.volume = 0.5
    }
    audioRef.current.play().catch(() => {})
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 5rem)',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bell size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Team Feed</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Live deal notifications
          </div>
        </div>
      </div>

      {/* Feed */}
      <div 
        ref={feedRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem'
        }}
      >
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            Loading feed...
          </div>
        ) : feedItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <Trophy size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No deals yet today</div>
            <div style={{ fontSize: '0.875rem' }}>Be the first to close one! 🎯</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  borderLeft: '4px solid #10b981',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Trophy size={18} color="#10b981" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.canvasser_name}
                    </span>
                    {item.canvasser_name === currentRep?.name && (
                      <span style={{
                        background: 'var(--accent)',
                        color: 'white',
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        fontWeight: 600
                      }}>
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem'
                  }}>
                    <Clock size={12} />
                    {formatTime(item.timestamp)}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  🎉 Closed a deal!
                </div>
                
                {item.address && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem'
                  }}>
                    <MapPin size={12} />
                    {item.address}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          background: '#10b981',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
        Live — updates instantly when deals close
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
