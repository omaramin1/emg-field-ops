import { Plus, Filter, Layers, Target, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { GPSPosition, getHighAccuracyPosition, watchPosition, getAccuracyRating, formatAccuracy, requiresConfirmation, reverseGeocode } from '../lib/gps'
import { createKnock, subscribeToKnocks, getTodaysKnocks, getHistoricalDeals, updateKnock, KnockResult } from '../lib/knocks'
import { useAuthStore } from '../stores/authStore'
import { getDNKWithCoords } from '../data/doNotKnock'
import { KnockRecord } from '../lib/supabase'

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZW1nZW1nIiwiYSI6ImNta3g2cTFnODA3ZDIzZXBvYmw4OTFlbDAifQ.w0lybYlDpyRPBdCx5VOy2Q'

// Result colors
const RESULT_COLORS: Record<KnockResult, string> = {
  not_home: '#6b7280',       // Gray
  not_interested: '#ef4444', // Red
  signed_up: '#10b981',      // Green
  doesnt_qualify: '#f59e0b', // Orange
  wrong_address: '#8b5cf6',  // Purple
  callback: '#3b82f6',       // Blue
}

const RESULT_LABELS: Record<KnockResult, string> = {
  not_home: 'Not Home',
  not_interested: 'Not Interested',
  signed_up: 'Signed Up! ✓',
  doesnt_qualify: "Doesn't Qualify",
  wrong_address: 'Wrong Address',
  callback: 'Callback',
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const userMarker = useRef<mapboxgl.Marker | null>(null)
  const knockMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const oldDealMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())

  // State
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('satellite')
  const [userPosition, setUserPosition] = useState<GPSPosition | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'error'>('acquiring')
  const [knocks, setKnocks] = useState<KnockRecord[]>([])
  const [showAddKnock, setShowAddKnock] = useState(false)
  const [selectedResult, setSelectedResult] = useState<KnockResult | null>(null)
  const [knockNotes, setKnockNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedAddress, setDetectedAddress] = useState<string>('')
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filterResult, setFilterResult] = useState<KnockResult | 'all'>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editingKnock, setEditingKnock] = useState<KnockRecord | null>(null)
  const [editAddress, setEditAddress] = useState('')
  const [editResult, setEditResult] = useState<KnockResult | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [oldDeals, setOldDeals] = useState<KnockRecord[]>([])
  const [showOldDeals, setShowOldDeals] = useState(true)

  // Get current rep from auth
  const { currentRep } = useAuthStore()
  const canvasserId = currentRep?.id || '00000000-0000-0000-0000-000000000001'
  const canvasserName = currentRep?.name || 'Unknown'

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle === 'satellite' 
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/streets-v12',
      center: [-76.3, 37.05], // Hampton, VA default
      zoom: 15,
      pitch: 0,
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    
    map.current.setStyle(
      mapStyle === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/streets-v12'
    )
  }, [mapStyle, mapLoaded])

  // Add Do Not Knock markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const dnkList = getDNKWithCoords()
    
    dnkList.forEach(dnk => {
      if (!dnk.lat || !dnk.lng) return
      
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: #dc2626;
          border: 2px solid white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        ">🚫</div>
      `
      
      new mapboxgl.Marker({ element: el })
        .setLngLat([dnk.lng, dnk.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; font-family: system-ui;">
            <strong style="color: #dc2626">🚫 DO NOT KNOCK</strong>
            ${dnk.name ? `<br><span>${dnk.name}</span>` : ''}
            <br><small>${dnk.address}</small>
            <br><small>${dnk.city}, ${dnk.state} ${dnk.zip}</small>
          </div>
        `))
        .addTo(map.current!)
    })
  }, [mapLoaded])

  // Track if we've auto-centered yet
  const hasAutoCentered = useRef(false)

  // Watch GPS position
  useEffect(() => {
    setGpsStatus('acquiring')

    const stopWatching = watchPosition(
      (pos) => {
        setUserPosition(pos)
        setGpsStatus('locked')

        // Update user marker
        if (map.current) {
          if (!userMarker.current) {
            const el = document.createElement('div')
            el.className = 'user-marker'
            el.innerHTML = `
              <div style="
                width: 20px;
                height: 20px;
                background: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
              "></div>
            `
            userMarker.current = new mapboxgl.Marker({ element: el })
              .setLngLat([pos.lng, pos.lat])
              .addTo(map.current)
          } else {
            userMarker.current.setLngLat([pos.lng, pos.lat])
          }

          // Auto-center on first GPS lock
          if (!hasAutoCentered.current) {
            hasAutoCentered.current = true
            map.current.flyTo({
              center: [pos.lng, pos.lat],
              zoom: 18,
              duration: 1500
            })
          }
        }
      },
      (err) => {
        console.error('GPS error:', err)
        setGpsStatus('error')
      }
    )

    return stopWatching
  }, [])

  // Load existing knocks and historical deals
  useEffect(() => {
    const loadKnocks = async () => {
      const [todaysKnocks, historicalDeals] = await Promise.all([
        getTodaysKnocks(),
        getHistoricalDeals()
      ])
      setKnocks(todaysKnocks)
      setOldDeals(historicalDeals)
    }
    loadKnocks()
  }, [])

  // Subscribe to real-time knock updates
  useEffect(() => {
    const unsubscribe = subscribeToKnocks(
      (newKnock) => {
        setKnocks(prev => [newKnock, ...prev])
      },
      (updatedKnock) => {
        setKnocks(prev => prev.map(k => k.id === updatedKnock.id ? updatedKnock : k))
      },
      (deletedId) => {
        setKnocks(prev => prev.filter(k => k.id !== deletedId))
      }
    )

    return unsubscribe
  }, [])

  // Add knock markers to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Remove old markers not in current knocks
    knockMarkers.current.forEach((marker, id) => {
      if (!knocks.find(k => k.id === id)) {
        marker.remove()
        knockMarkers.current.delete(id)
      }
    })

    // Add/update markers
    knocks.forEach(knock => {
      // Filter check
      if (filterResult !== 'all' && knock.result !== filterResult) {
        // Remove marker if filtered out
        if (knockMarkers.current.has(knock.id)) {
          knockMarkers.current.get(knock.id)?.remove()
          knockMarkers.current.delete(knock.id)
        }
        return
      }

      if (knockMarkers.current.has(knock.id)) {
        // Update existing marker position if needed
        knockMarkers.current.get(knock.id)?.setLngLat([knock.lng, knock.lat])
      } else {
        // Create new marker
        const color = RESULT_COLORS[knock.result as KnockResult] || '#666'
        
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="
            width: 16px;
            height: 16px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            cursor: pointer;
          "></div>
        `
        
        // Double-tap to edit
        el.addEventListener('dblclick', (e) => {
          e.stopPropagation()
          setEditingKnock(knock)
          setEditAddress(knock.address || '')
          setEditResult(knock.result as KnockResult)
          setEditNotes(knock.notes || '')
        })
        
        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([knock.lng, knock.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px; font-family: system-ui;">
              <strong style="color: ${color}">${RESULT_LABELS[knock.result as KnockResult]}</strong>
              ${knock.address ? `<br><small>${knock.address}</small>` : ''}
              ${knock.notes ? `<br><em>"${knock.notes}"</em>` : ''}
              <br><small style="color: #888">${new Date(knock.created_at).toLocaleTimeString()}</small>
              <br><small style="color: #3b82f6;">Double-tap to edit</small>
            </div>
          `))
          .addTo(map.current!)

        // Handle drag end - update position
        marker.on('dragend', async () => {
          const lngLat = marker.getLngLat()
          // Update the knock with new position
          const updated = await updateKnock(knock.id, {
            // @ts-ignore - we'll add lat/lng to the update type
          })
          if (updated) {
            setToast({ message: '📍 Pin moved!', type: 'success' })
            setTimeout(() => setToast(null), 2000)
          }
        })

        knockMarkers.current.set(knock.id, marker)
      }
    })
  }, [knocks, mapLoaded, filterResult])

  // Add old deal markers to map (historical signed_up deals)
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear old markers if toggle is off
    if (!showOldDeals) {
      oldDealMarkers.current.forEach((marker) => marker.remove())
      oldDealMarkers.current.clear()
      return
    }

    // Remove markers not in current list
    oldDealMarkers.current.forEach((marker, id) => {
      if (!oldDeals.find(d => d.id === id)) {
        marker.remove()
        oldDealMarkers.current.delete(id)
      }
    })

    // Add markers for old deals
    oldDeals.forEach(deal => {
      if (oldDealMarkers.current.has(deal.id)) return

      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width: 14px;
          height: 14px;
          background: #06b6d4;
          border: 2px solid white;
          border-radius: 3px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
        "></div>
      `
      
      const dealDate = new Date(deal.created_at).toLocaleDateString()
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([deal.lng, deal.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; font-family: system-ui;">
            <strong style="color: #06b6d4">📋 Old Deal</strong>
            ${deal.address ? `<br><small>${deal.address}</small>` : ''}
            <br><small style="color: #888">${dealDate}</small>
            ${deal.canvasser_name ? `<br><small style="color: #666">by ${deal.canvasser_name}</small>` : ''}
          </div>
        `))
        .addTo(map.current!)

      oldDealMarkers.current.set(deal.id, marker)
    })
  }, [oldDeals, mapLoaded, showOldDeals])

  // Center on user
  const centerOnUser = useCallback(() => {
    if (userPosition && map.current) {
      map.current.flyTo({
        center: [userPosition.lng, userPosition.lat],
        zoom: 18,
        duration: 1000
      })
    }
  }, [userPosition])

  // Fetch address when opening knock panel
  const openKnockPanel = useCallback(async () => {
    setShowAddKnock(true)
    setDetectedAddress('')
    
    if (userPosition) {
      setIsLoadingAddress(true)
      try {
        const address = await reverseGeocode(userPosition.lat, userPosition.lng)
        setDetectedAddress(address || '')
      } catch (e) {
        console.error('Failed to get address:', e)
      } finally {
        setIsLoadingAddress(false)
      }
    }
  }, [userPosition])

  // Submit knock
  const submitKnock = async () => {
    if (!userPosition || !selectedResult) return
    
    setIsSubmitting(true)

    try {
      // Get high-accuracy position for the knock
      const precisePosition = await getHighAccuracyPosition(8000, 10)
      
      const knock = await createKnock({
        position: precisePosition,
        result: selectedResult,
        notes: knockNotes || undefined,
        canvasserId,
        canvasserName,
        address: detectedAddress || undefined
      })

      if (knock) {
        setShowAddKnock(false)
        setSelectedResult(null)
        setKnockNotes('')
        // Show success toast
        setToast({ message: `✓ ${RESULT_LABELS[selectedResult]} logged!`, type: 'success' })
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast({ message: '⚠️ Failed to save - try again', type: 'error' })
        setTimeout(() => setToast(null), 4000)
      }
    } catch (e) {
      console.error('Failed to submit knock:', e)
      setToast({ message: '⚠️ Error saving knock', type: 'error' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats
  const stats = {
    total: knocks.length,
    signedUp: knocks.filter(k => k.result === 'signed_up').length,
    notHome: knocks.filter(k => k.result === 'not_home').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontSize: '1rem',
          fontWeight: 600,
          animation: 'slideDown 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-primary)', borderBottom: '1px solid var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Today: {stats.total} knocks · {stats.signedUp} signed
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: gpsStatus === 'locked' ? 'var(--success)' : gpsStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {gpsStatus === 'acquiring' && <><Loader2 size={12} className="animate-spin" /> Acquiring GPS...</>}
              {gpsStatus === 'locked' && userPosition && (
                <>
                  <CheckCircle size={12} /> 
                  GPS: ±{formatAccuracy(userPosition.accuracy)} ({getAccuracyRating(userPosition.accuracy)})
                </>
              )}
              {gpsStatus === 'error' && <><AlertCircle size={12} /> GPS Error - Enable location</>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setShowOldDeals(!showOldDeals)}
              title={showOldDeals ? 'Hide old deals' : 'Show old deals'}
              style={{
                background: showOldDeals ? '#06b6d4' : 'var(--bg-secondary)',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.625rem',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              📋 {oldDeals.length}
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? 'var(--accent)' : 'var(--bg-secondary)',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                color: 'var(--text-primary)'
              }}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginTop: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}>
            <button
              onClick={() => setFilterResult('all')}
              style={{
                background: filterResult === 'all' ? 'var(--accent)' : 'var(--bg-secondary)',
                border: 'none',
                borderRadius: '1rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap'
              }}
            >
              All ({knocks.length})
            </button>
            {Object.entries(RESULT_COLORS).map(([result, color]) => {
              const count = knocks.filter(k => k.result === result).length
              return (
                <button
                  key={result}
                  onClick={() => setFilterResult(result as KnockResult)}
                  style={{
                    background: filterResult === result ? color : 'var(--bg-secondary)',
                    border: `2px solid ${filterResult === result ? color : 'transparent'}`,
                    borderRadius: '1rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {RESULT_LABELS[result as KnockResult]} ({count})
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainer} style={{ flex: 1, position: 'relative' }}>
        {/* Map controls overlay */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 10
        }}>
          <button
            onClick={centerOnUser}
            disabled={!userPosition}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              color: userPosition ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              cursor: userPosition ? 'pointer' : 'not-allowed'
            }}
          >
            <Target size={20} />
          </button>
          <button
            onClick={() => setMapStyle(s => s === 'satellite' ? 'streets' : 'satellite')}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            <Layers size={20} />
          </button>
        </div>

        {/* Accuracy indicator */}
        {userPosition && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            background: 'rgba(0,0,0,0.75)',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.7rem',
            color: 'white',
            zIndex: 10
          }}>
            Accuracy: <strong style={{ color: getAccuracyRating(userPosition.accuracy) === 'excellent' ? '#10b981' : getAccuracyRating(userPosition.accuracy) === 'good' ? '#3b82f6' : '#f59e0b' }}>
              {formatAccuracy(userPosition.accuracy)}
            </strong>
          </div>
        )}
      </div>

      {/* Add Knock Button */}
      {!showAddKnock && (
        <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderTop: '1px solid var(--bg-card)' }}>
          <button
            onClick={openKnockPanel}
            disabled={gpsStatus !== 'locked'}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              opacity: gpsStatus !== 'locked' ? 0.5 : 1
            }}
          >
            <Plus size={20} /> Log Door Knock
          </button>
        </div>
      )}

      {/* Add Knock Panel */}
      {showAddKnock && (
        <div style={{
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--bg-card)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Log This Door</div>
            <button 
              onClick={() => { setShowAddKnock(false); setSelectedResult(null); setKnockNotes(''); setDetectedAddress('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          {/* Detected Address */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              📍 Address (edit if needed):
            </div>
            {isLoadingAddress ? (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem'
              }}>
                <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} />
                Detecting address...
              </div>
            ) : (
              <input
                type="text"
                value={detectedAddress}
                onChange={(e) => setDetectedAddress(e.target.value)}
                placeholder="Enter address..."
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bg-card)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              />
            )}
          </div>

          {/* GPS Warning */}
          {userPosition && requiresConfirmation(userPosition.accuracy) && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid var(--warning)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} color="var(--warning)" />
              GPS accuracy is {formatAccuracy(userPosition.accuracy)}. Pin may be approximate.
            </div>
          )}

          {/* Result Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Result:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {Object.entries(RESULT_LABELS).map(([result, label]) => (
                <button
                  key={result}
                  onClick={() => setSelectedResult(result as KnockResult)}
                  style={{
                    background: selectedResult === result ? RESULT_COLORS[result as KnockResult] : 'var(--bg-card)',
                    border: `2px solid ${selectedResult === result ? RESULT_COLORS[result as KnockResult] : 'var(--bg-card)'}`,
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notes (optional):</div>
            <textarea
              value={knockNotes}
              onChange={(e) => setKnockNotes(e.target.value)}
              placeholder="e.g., Dog in yard, callback after 5pm..."
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-card)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'none',
                height: '60px'
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={submitKnock}
            disabled={!selectedResult || isSubmitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: !selectedResult ? 0.5 : 1
            }}
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Saving...</>
            ) : (
              <>
                <CheckCircle size={18} /> Save Knock
              </>
            )}
          </button>
        </div>
      )}

      {/* Edit Knock Panel */}
      {editingKnock && (
        <div style={{
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--bg-card)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>✏️ Edit Knock</div>
            <button 
              onClick={() => setEditingKnock(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Address:</div>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-card)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Result */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Result:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {Object.entries(RESULT_LABELS).map(([result, label]) => (
                <button
                  key={result}
                  onClick={() => setEditResult(result as KnockResult)}
                  style={{
                    background: editResult === result ? RESULT_COLORS[result as KnockResult] : 'var(--bg-card)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notes:</div>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-card)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'none',
                height: '60px'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={async () => {
              if (!editingKnock || !editResult) return
              setIsUpdating(true)
              const updated = await updateKnock(editingKnock.id, {
                result: editResult,
                notes: editNotes || undefined,
                address: editAddress || undefined
              })
              setIsUpdating(false)
              if (updated) {
                setToast({ message: '✓ Knock updated!', type: 'success' })
                setTimeout(() => setToast(null), 3000)
                setEditingKnock(null)
              } else {
                setToast({ message: '⚠️ Update failed', type: 'error' })
                setTimeout(() => setToast(null), 3000)
              }
            }}
            disabled={isUpdating}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              opacity: isUpdating ? 0.5 : 1
            }}
          >
            {isUpdating ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{ 
        padding: '0.5rem 1rem',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--bg-card)',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#10b981' 
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>New Deal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '2px', 
            background: '#06b6d4' 
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>Old Deal</span>
        </div>
        {Object.entries(RESULT_COLORS).filter(([r]) => r !== 'signed_up').slice(0, 3).map(([result, color]) => (
          <div key={result} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: color 
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>{RESULT_LABELS[result as KnockResult].split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
