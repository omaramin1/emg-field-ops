import { useState } from 'react'
import { Target, MessageSquare, Shield, CheckCircle, AlertTriangle, Phone, ChevronRight, ChevronDown } from 'lucide-react'

type Section = 'pitch' | 'objections' | 'benefits' | 'dos' | null

export default function ReferencePage() {
  const [openSection, setOpenSection] = useState<Section>(null)

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <div className="page">
      <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        📚 Quick Reference
      </div>

      {/* Opening Script */}
      <div className="card" style={{ padding: 0 }}>
        <button 
          onClick={() => toggleSection('pitch')}
          className="ref-item"
          style={{ 
            width: '100%', 
            background: openSection === 'pitch' ? 'var(--bg-card)' : 'transparent',
            borderRadius: openSection === 'pitch' ? '1rem 1rem 0 0' : '1rem'
          }}
        >
          <Target style={{ color: 'var(--accent)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Opening & Pitch</span>
          {openSection === 'pitch' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {openSection === 'pitch' && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--bg-card)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>
                🎯 The Opening (First 10 Seconds)
              </div>
              <div style={{ 
                background: 'var(--bg-card)', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                fontStyle: 'italic',
                lineHeight: 1.6
              }}>
                "Hi there! I'm [NAME] — I'm out in the neighborhood today letting folks know about a state program that's saving people money on their electric bills. Quick question: do you or anyone in the household receive any state benefits like SNAP or Medicaid?"
              </div>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>
                💬 The Pitch (If They Qualify)
              </div>
              <div style={{ 
                background: 'var(--bg-card)', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                fontStyle: 'italic',
                lineHeight: 1.6
              }}>
                "Perfect — the state has this program that gives credits directly on your electric bill. People in this area are getting $20 to $50 off every month. Since you're already receiving [BENEFIT], you automatically qualify. I can get you signed up right now — takes about 2 minutes. Just need your electric bill and benefit card."
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Objection Handlers */}
      <div className="card" style={{ padding: 0 }}>
        <button 
          onClick={() => toggleSection('objections')}
          className="ref-item"
          style={{ 
            width: '100%', 
            background: openSection === 'objections' ? 'var(--bg-card)' : 'transparent',
            borderRadius: openSection === 'objections' ? '1rem 1rem 0 0' : '1rem'
          }}
        >
          <Shield style={{ color: 'var(--accent)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Objection Handlers</span>
          {openSection === 'objections' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {openSection === 'objections' && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--bg-card)' }}>
            {[
              { 
                objection: '"I\'m not interested"', 
                response: 'Totally understand — just so you know, this is a state program you\'re already paying for through taxes. You\'re leaving money on the table.'
              },
              { 
                objection: '"Is this a scam?"', 
                response: 'Great question — this is a real state-run program. Here\'s my ID, here\'s the program info. You can call the number yourself to verify.'
              },
              { 
                objection: '"I need to talk to my spouse"', 
                response: 'No problem — when\'s a good time for me to come back when you\'re both here?'
              },
              { 
                objection: '"I don\'t have time"', 
                response: 'I get it — it literally takes 2 minutes. I can wait while you grab your bill.'
              },
              { 
                objection: '"I already have this"', 
                response: 'That\'s great! Do you know how much you\'re saving? Sometimes people only get partial benefits.'
              },
            ].map((item, index) => (
              <div key={index} style={{ marginBottom: index < 4 ? '1rem' : 0 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#f87171' }}>
                  {item.objection}
                </div>
                <div style={{ color: 'var(--text-secondary)', paddingLeft: '0.5rem', borderLeft: '2px solid var(--accent)' }}>
                  → {item.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Qualifying Benefits */}
      <div className="card" style={{ padding: 0 }}>
        <button 
          onClick={() => toggleSection('benefits')}
          className="ref-item"
          style={{ 
            width: '100%', 
            background: openSection === 'benefits' ? 'var(--bg-card)' : 'transparent',
            borderRadius: openSection === 'benefits' ? '1rem 1rem 0 0' : '1rem'
          }}
        >
          <CheckCircle style={{ color: 'var(--accent)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Qualifying Benefits</span>
          {openSection === 'benefits' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {openSection === 'benefits' && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--bg-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {[
                '✅ SNAP (Food Stamps)',
                '✅ Medicaid',
                '✅ SSI',
                '✅ LIHEAP',
                '✅ Public Housing',
                '✅ TANF',
                '✅ WIC',
                '✅ VA Pension'
              ].map((benefit, index) => (
                <div key={index} style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  {benefit}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Customer needs <strong>ONE</strong> qualifying benefit + lives in service zone = SIGN THEM UP
            </div>
          </div>
        )}
      </div>

      {/* Do's and Don'ts */}
      <div className="card" style={{ padding: 0 }}>
        <button 
          onClick={() => toggleSection('dos')}
          className="ref-item"
          style={{ 
            width: '100%', 
            background: openSection === 'dos' ? 'var(--bg-card)' : 'transparent',
            borderRadius: openSection === 'dos' ? '1rem 1rem 0 0' : '1rem'
          }}
        >
          <AlertTriangle style={{ color: 'var(--accent)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Do's and Don'ts</span>
          {openSection === 'dos' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {openSection === 'dos' && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--bg-card)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>✅ DO</div>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                <li>Be honest about what this is</li>
                <li>Be friendly and professional</li>
                <li>Leave info even if they say no</li>
                <li>Move on if they're firm</li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#f87171' }}>❌ DON'T</div>
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                <li>Promise specific amounts</li>
                <li>Enter anyone's home</li>
                <li>Argue with hostile people</li>
                <li>Work after dark</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Manager Hotline */}
      <a 
        href="tel:+15551234567" 
        className="ref-item" 
        style={{ marginTop: '1rem', textDecoration: 'none' }}
      >
        <Phone style={{ color: 'var(--accent)' }} />
        <span style={{ flex: 1 }}>Call Manager</span>
        <ChevronRight size={20} />
      </a>
    </div>
  )
}
