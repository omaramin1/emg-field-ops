import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Shield, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase, KnockRecord } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

type DoorOutcome = 'no_answer' | 'no' | 'yes' | 'callback' | 'skip'
type Objection = 'not_interested' | 'scam' | 'spouse' | 'no_time' | 'already_have' | 'other'

export default function DoorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentRep } = useAuthStore()
  const [showSignup, setShowSignup] = useState(false)
  const [showObjection, setShowObjection] = useState(false)
  const [selectedObjection, setSelectedObjection] = useState<Objection | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  // Mock door data
  const door = {
    id,
    address: '142 Collier Dr',
    territory: 'Langley Village',
    number: 34,
    total: 80
  }

  const handleOutcome = async (outcome: DoorOutcome) => {
    if (saving) return // Prevent double-tap
    
    if (outcome === 'yes') {
      setShowSignup(true)
    } else if (outcome === 'no') {
      // Show objection picker to collect data
      setShowObjection(true)
    } else {
      // Log outcome and go to next door
      setSaving(true)
      setSaveStatus('saving')
      const success = await logDoorData(outcome)
      setSaveStatus(success ? 'saved' : 'error')
      // Brief delay to show status, then navigate
      setTimeout(() => {
        setSaving(false)
        navigate('/door/next')
      }, success ? 300 : 1000)
    }
  }

  const handleObjectionSubmit = async (objection: Objection) => {
    if (saving) return
    setSaving(true)
    setSaveStatus('saving')
    const success = await logDoorData('no', objection)
    setSaveStatus(success ? 'saved' : 'error')
    setTimeout(() => {
      setSaving(false)
      navigate('/door/next')
    }, success ? 300 : 1000)
  }

  const logDoorData = async (outcome: DoorOutcome, objection?: Objection): Promise<boolean> => {
    // Map Door outcomes to KnockRecord results
    const outcomeMap: Record<DoorOutcome, KnockRecord['result']> = {
      'no_answer': 'not_home',
      'no': 'not_interested',
      'yes': 'signed_up',
      'callback': 'callback',
      'skip': 'wrong_address'
    }

    // Get current location with longer timeout
    let lat = 0, lng = 0
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 30000 // Use cached position up to 30s old
        })
      })
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch (e) {
      console.warn('Could not get location:', e)
      // Continue anyway - location is nice to have but not required
    }

    const knockData = {
      lat,
      lng,
      address: door.address,
      result: outcomeMap[outcome],
      notes: objection ? `Objection: ${objection}` : undefined,
      canvasser_id: currentRep?.id || '00000000-0000-0000-0000-000000000001',
      canvasser_name: currentRep?.name || 'Unknown',
    }

    try {
      const { data, error } = await supabase
        .from('knocks')
        .insert([knockData])
        .select()

      if (error) {
        console.error('Failed to save knock:', error)
        return false
      } else {
        console.log('Knock saved:', data)
        return true
      }
    } catch (e) {
      console.error('Error saving knock:', e)
      return false
    }
  }

  const handleSignupSubmit = async (formData: { name: string; phone: string; benefit: string; accountNumber: string }) => {
    if (saving) return
    setSaving(true)
    setSaveStatus('saving')
    
    // First log the door as signed up
    const knockSuccess = await logDoorData('yes')
    
    // Then save the signup details
    try {
      const { error } = await supabase
        .from('signups')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          address: door.address,
          benefit_type: formData.benefit,
          account_number: formData.accountNumber,
          canvasser_id: '00000000-0000-0000-0000-000000000001', // Demo UUID
          canvasser_name: 'Demo User',
          lat: 0, // Will be captured from knock
          lng: 0,
        }])
      
      if (error) {
        console.error('Failed to save signup:', error)
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
      }
    } catch (e) {
      console.error('Error saving signup:', e)
      setSaveStatus('error')
    }
    
    setTimeout(() => {
      setSaving(false)
      navigate('/door/next')
    }, knockSuccess ? 500 : 1500)
  }

  if (showObjection) {
    return (
      <ObjectionPicker 
        onSelect={handleObjectionSubmit} 
        onCancel={() => setShowObjection(false)} 
      />
    )
  }

  if (showSignup) {
    return <SignupForm address={door.address} onSubmit={handleSignupSubmit} onCancel={() => setShowSignup(false)} saving={saving} saveStatus={saveStatus} />
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/map')} style={{ background: 'none', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{door.address}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Door {door.number} of {door.total}
          </div>
        </div>
      </div>

      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '0.5rem',
          textAlign: 'center',
          background: saveStatus === 'saving' ? 'var(--bg-secondary)' : 
                     saveStatus === 'saved' ? 'rgba(16, 185, 129, 0.2)' : 
                     'rgba(239, 68, 68, 0.2)',
          color: saveStatus === 'saving' ? 'var(--text-secondary)' : 
                saveStatus === 'saved' ? '#10b981' : '#ef4444'
        }}>
          {saveStatus === 'saving' && '⏳ Saving...'}
          {saveStatus === 'saved' && '✓ Saved!'}
          {saveStatus === 'error' && '⚠️ Save failed - will retry'}
        </div>
      )}

      {/* Outcome Buttons */}
      <div className="door-buttons">
        <button 
          className="door-btn no-answer" 
          onClick={() => handleOutcome('no_answer')}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          <span className="door-btn-icon">😶</span>
          <span>No Answer</span>
        </button>
        <button 
          className="door-btn no" 
          onClick={() => handleOutcome('no')}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          <span className="door-btn-icon">❌</span>
          <span>Not Interested</span>
        </button>
        <button 
          className="door-btn yes" 
          onClick={() => handleOutcome('yes')}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          <span className="door-btn-icon">✅</span>
          <span>Qualified!</span>
        </button>
      </div>

      <div className="door-buttons" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <button 
          className="door-btn callback" 
          onClick={() => handleOutcome('callback')}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          <span className="door-btn-icon">🔄</span>
          <span>Callback</span>
        </button>
        <button 
          className="door-btn skip" 
          onClick={() => handleOutcome('skip')}
          disabled={saving}
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          <span className="door-btn-icon">⏭️</span>
          <span>Skip</span>
        </button>
      </div>

      {/* Quick Help */}
      <div style={{ marginTop: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ marginBottom: '0.75rem' }}
          onClick={() => navigate('/reference#pitch')}
        >
          <Lightbulb size={18} />
          Pitch Script
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/reference#objections')}
        >
          <Shield size={18} />
          Handle Objection
        </button>
      </div>
    </div>
  )
}

function SignupForm({ 
  address, 
  onSubmit, 
  onCancel,
  saving,
  saveStatus
}: { 
  address: string
  onSubmit: (data: { name: string; phone: string; benefit: string; accountNumber: string }) => void
  onCancel: () => void
  saving: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    benefit: '',
    accountNumber: ''
  })

  const benefits = ['SNAP', 'Medicaid', 'SSI', 'LIHEAP', 'TANF', 'WIC', 'VA Pension', 'Other']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onCancel} disabled={saving} style={{ background: 'none', color: 'var(--text-secondary)', opacity: saving ? 0.5 : 1 }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Signup</div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '0.5rem',
          textAlign: 'center',
          background: saveStatus === 'saving' ? 'var(--bg-secondary)' : 
                     saveStatus === 'saved' ? 'rgba(16, 185, 129, 0.2)' : 
                     'rgba(239, 68, 68, 0.2)',
          color: saveStatus === 'saving' ? 'var(--text-secondary)' : 
                saveStatus === 'saved' ? '#10b981' : '#ef4444'
        }}>
          {saveStatus === 'saving' && '⏳ Saving signup...'}
          {saveStatus === 'saved' && '✓ Signup saved!'}
          {saveStatus === 'error' && '⚠️ Save failed - will retry'}
        </div>
      )}

      <div className="card">
        <div className="card-title">Customer Info</div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-card)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-card)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Address
          </label>
          <div style={{
            padding: '0.875rem',
            background: 'var(--bg-card)',
            borderRadius: '0.5rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MapPin size={16} />
            {address}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Qualifying Benefit</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {benefits.map(benefit => (
            <button
              key={benefit}
              onClick={() => setFormData({ ...formData, benefit })}
              style={{
                padding: '0.75rem',
                background: formData.benefit === benefit ? 'var(--accent)' : 'var(--bg-card)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: formData.benefit === benefit ? 600 : 400
              }}
            >
              {benefit}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Electric Account</div>
        <button 
          className="btn btn-secondary" 
          style={{ marginBottom: '1rem' }}
          onClick={() => {
            // Camera scan would go here
            setFormData({ ...formData, accountNumber: '1234567890' })
          }}
        >
          📷 Scan Electric Bill
        </button>
        {formData.accountNumber && (
          <div style={{ 
            padding: '0.75rem', 
            background: 'var(--bg-card)', 
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            Account: {formData.accountNumber}
          </div>
        )}
      </div>

      <button 
        className="btn btn-primary btn-large"
        onClick={() => onSubmit(formData)}
        disabled={!formData.name || !formData.phone || !formData.benefit || saving}
        style={{
          opacity: (!formData.name || !formData.phone || !formData.benefit || saving) ? 0.5 : 1
        }}
      >
        {saving ? '⏳ Saving...' : '✅ Submit Signup'}
      </button>
    </div>
  )
}

// Objection Picker - collects data for area intelligence
function ObjectionPicker({
  onSelect,
  onCancel
}: {
  onSelect: (objection: Objection) => void
  onCancel: () => void
}) {
  const objections: { id: Objection; label: string; emoji: string }[] = [
    { id: 'not_interested', label: 'Not interested', emoji: '🙅' },
    { id: 'scam', label: 'Thinks it\'s a scam', emoji: '🤔' },
    { id: 'spouse', label: 'Needs to ask spouse', emoji: '💑' },
    { id: 'no_time', label: 'No time right now', emoji: '⏰' },
    { id: 'already_have', label: 'Already has it', emoji: '✓' },
    { id: 'other', label: 'Other / Unknown', emoji: '❓' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onCancel} style={{ background: 'none', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>What was their objection?</div>
      </div>

      <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Quick tap — this helps us find the best areas
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {objections.map(obj => (
          <button
            key={obj.id}
            onClick={() => onSelect(obj.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'var(--text-primary)',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{obj.emoji}</span>
            <span style={{ fontSize: '1rem' }}>{obj.label}</span>
          </button>
        ))}
      </div>

      <button 
        className="btn btn-secondary"
        style={{ marginTop: '1rem' }}
        onClick={() => onSelect('other')}
      >
        Skip (just log as No)
      </button>
    </div>
  )
}
