import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Shield, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase, KnockRecord } from '../lib/supabase'

type DoorOutcome = 'no_answer' | 'no' | 'yes' | 'callback' | 'skip'
type Objection = 'not_interested' | 'scam' | 'spouse' | 'no_time' | 'already_have' | 'other'

export default function DoorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [showSignup, setShowSignup] = useState(false)
  const [showObjection, setShowObjection] = useState(false)
  const [selectedObjection, setSelectedObjection] = useState<Objection | null>(null)
  
  // Mock door data
  const door = {
    id,
    address: '142 Collier Dr',
    territory: 'Langley Village',
    number: 34,
    total: 80
  }

  const handleOutcome = async (outcome: DoorOutcome) => {
    if (outcome === 'yes') {
      setShowSignup(true)
    } else if (outcome === 'no') {
      // Show objection picker to collect data
      setShowObjection(true)
    } else {
      // Log outcome and go to next door
      await logDoorData(outcome)
      navigate('/door/next')
    }
  }

  const handleObjectionSubmit = async (objection: Objection) => {
    // Log with objection data for area intelligence
    await logDoorData('no', objection)
    navigate('/door/next')
  }

  const logDoorData = async (outcome: DoorOutcome, objection?: Objection) => {
    // Map Door outcomes to KnockRecord results
    const outcomeMap: Record<DoorOutcome, KnockRecord['result']> = {
      'no_answer': 'not_home',
      'no': 'not_interested',
      'yes': 'signed_up',
      'callback': 'callback',
      'skip': 'wrong_address'
    }

    // Get current location
    let lat = 0, lng = 0
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      })
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch (e) {
      console.warn('Could not get location:', e)
    }

    const knockData = {
      lat,
      lng,
      address: door.address,
      result: outcomeMap[outcome],
      notes: objection ? `Objection: ${objection}` : undefined,
      canvasser_id: 'demo-user', // TODO: Get from auth
      canvasser_name: 'Demo User',
    }

    try {
      const { data, error } = await supabase
        .from('knocks')
        .insert([knockData])
        .select()

      if (error) {
        console.error('Failed to save knock:', error)
        // Still continue to next door even if save fails
      } else {
        console.log('Knock saved:', data)
      }
    } catch (e) {
      console.error('Error saving knock:', e)
    }
  }

  const handleSignupSubmit = () => {
    // Submit signup
    console.log('Signup submitted')
    navigate('/door/next')
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
    return <SignupForm address={door.address} onSubmit={handleSignupSubmit} onCancel={() => setShowSignup(false)} />
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

      {/* Outcome Buttons */}
      <div className="door-buttons">
        <button className="door-btn no-answer" onClick={() => handleOutcome('no_answer')}>
          <span className="door-btn-icon">😶</span>
          <span>No Answer</span>
        </button>
        <button className="door-btn no" onClick={() => handleOutcome('no')}>
          <span className="door-btn-icon">❌</span>
          <span>Not Interested</span>
        </button>
        <button className="door-btn yes" onClick={() => handleOutcome('yes')}>
          <span className="door-btn-icon">✅</span>
          <span>Qualified!</span>
        </button>
      </div>

      <div className="door-buttons" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <button className="door-btn callback" onClick={() => handleOutcome('callback')}>
          <span className="door-btn-icon">🔄</span>
          <span>Callback</span>
        </button>
        <button className="door-btn skip" onClick={() => handleOutcome('skip')}>
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
  onCancel 
}: { 
  address: string
  onSubmit: () => void
  onCancel: () => void 
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
        <button onClick={onCancel} style={{ background: 'none', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Signup</div>
      </div>

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
        onClick={onSubmit}
        disabled={!formData.name || !formData.phone || !formData.benefit}
        style={{
          opacity: (!formData.name || !formData.phone || !formData.benefit) ? 0.5 : 1
        }}
      >
        ✅ Submit Signup
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
