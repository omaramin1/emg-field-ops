/**
 * Feed Page - Real-time team chat + deal notifications
 * Deals auto-post when logged, reps can chat
 */

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase, KnockRecord } from '../lib/supabase'
import { Trophy, MapPin, Clock, Send, MessageCircle } from 'lucide-react'

interface FeedItem {
  id: string
  type: 'deal' | 'message'
  sender_name: string
  sender_id?: string
  address?: string
  timestamp: string
  text: string
}

export function Feed() {
  const { currentRep } = useAuthStore()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load recent deals and messages on mount
  useEffect(() => {
    loadFeed()
  }, [])

  // Subscribe to real-time deal updates
  useEffect(() => {
    const dealsChannel = supabase
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

    // Subscribe to chat messages
    const messagesChannel = supabase
      .channel('messages-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_messages'
        },
        (payload) => {
          const msg = payload.new as any
          addMessageToFeed({
            id: msg.id,
            type: 'message',
            sender_name: msg.sender_name,
            sender_id: msg.sender_id,
            timestamp: msg.created_at,
            text: msg.message
          })
        }
      )
      .subscribe()

    return () => {
      dealsChannel.unsubscribe()
      messagesChannel.unsubscribe()
    }
  }, [])

  const loadFeed = async () => {
    setIsLoading(true)
    const items: FeedItem[] = []
    
    // Get today's deals
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: deals } = await supabase
      .from('knocks')
      .select('*')
      .eq('result', 'signed_up')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (deals) {
      deals.forEach(knock => {
        items.push({
          id: knock.id,
          type: 'deal',
          sender_name: knock.canvasser_name || 'Unknown Rep',
          sender_id: knock.canvasser_id,
          address: knock.address,
          timestamp: knock.created_at,
          text: '🎉 Closed a deal!'
        })
      })
    }

    // Get today's messages
    const { data: messages } = await supabase
      .from('feed_messages')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (messages) {
      messages.forEach(msg => {
        items.push({
          id: msg.id,
          type: 'message',
          sender_name: msg.sender_name,
          sender_id: msg.sender_id,
          timestamp: msg.created_at,
          text: msg.message
        })
      })
    }

    // Sort by timestamp
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    setFeedItems(items)
    setIsLoading(false)
  }

  const addDealToFeed = (knock: KnockRecord) => {
    const newItem: FeedItem = {
      id: knock.id,
      type: 'deal',
      sender_name: knock.canvasser_name || 'Unknown Rep',
      sender_id: knock.canvasser_id,
      address: knock.address,
      timestamp: knock.created_at,
      text: '🎉 Closed a deal!'
    }
    
    setFeedItems(prev => [newItem, ...prev])
    scrollToTop()
  }

  const addMessageToFeed = (item: FeedItem) => {
    setFeedItems(prev => [item, ...prev])
    scrollToTop()
  }

  const scrollToTop = () => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0
    }
  }

  const playDealSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+ZjHVmaX6Ok5+dmIpxZGd9kJugnZSGcWRqfZCbn5ySg3BkaX2RnZ+ckYNwZWl9kp6gnJKDcGVpfZOen5ySg3Blan6Tnp+bkYJwZWp+k56fm5GBcGZqfpSen5uRgXBman6UnZ+akYFwZmt+lJ2fmpGBcGZrfpSdn5qQgXBmbH6UnZ+aj4FwZmx+lJ2fmo+AcGdsfpSdn5qPgHBnbH6UnZ+ajoBwZ21+lJ2emo6AcGdtfpSdnpqOgHBnbX6UnZ6ajoB')
      audioRef.current.volume = 0.5
    }
    audioRef.current.play().catch(() => {})
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRep || isSending) return
    
    setIsSending(true)
    
    const { data, error } = await supabase
      .from('feed_messages')
      .insert({
        message: newMessage.trim(),
        sender_id: currentRep.id,
        sender_name: currentRep.name
      })
      .select()
      .single()

    if (!error && data) {
      setNewMessage('')
    } else {
      // If table doesn't exist, show message locally anyway
      addMessageToFeed({
        id: Date.now().toString(),
        type: 'message',
        sender_name: currentRep.name,
        sender_id: currentRep.id,
        timestamp: new Date().toISOString(),
        text: newMessage.trim()
      })
      setNewMessage('')
    }
    
    setIsSending(false)
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
      height: 'calc(100vh - 5rem)',
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
          <MessageCircle size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Team Chat</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Deals + messages
          </div>
        </div>
      </div>

      {/* Feed */}
      <div 
        ref={feedRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
      >
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            Loading...
          </div>
        ) : feedItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <Trophy size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No activity yet today</div>
            <div style={{ fontSize: '0.875rem' }}>Close a deal or send a message! 🎯</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.75rem' }}>
            {feedItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: item.type === 'deal' ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  borderRadius: '0.75rem',
                  padding: '0.875rem',
                  borderLeft: item.type === 'deal' ? '4px solid #10b981' : '4px solid var(--accent)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.375rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {item.type === 'deal' ? (
                      <Trophy size={16} color="#10b981" />
                    ) : (
                      <MessageCircle size={16} color="var(--accent)" />
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {item.sender_name}
                    </span>
                    {item.sender_id === currentRep?.id && (
                      <span style={{
                        background: 'var(--accent)',
                        color: 'white',
                        fontSize: '0.6rem',
                        padding: '0.1rem 0.3rem',
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
                    fontSize: '0.7rem'
                  }}>
                    <Clock size={10} />
                    {formatTime(item.timestamp)}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  marginLeft: '1.5rem'
                }}>
                  {item.text}
                </div>
                
                {item.address && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    marginLeft: '1.5rem',
                    marginTop: '0.25rem'
                  }}>
                    <MapPin size={10} />
                    {item.address}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--bg-card)',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'var(--bg-card)',
            border: 'none',
            borderRadius: '1.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending}
          style={{
            width: '44px',
            height: '44px',
            background: newMessage.trim() ? 'var(--accent)' : 'var(--bg-card)',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: newMessage.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s'
          }}
        >
          <Send size={18} color={newMessage.trim() ? 'white' : 'var(--text-secondary)'} />
        </button>
      </div>
    </div>
  )
}
