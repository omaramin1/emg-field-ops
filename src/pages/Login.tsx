/**
 * Login Page - Rep authentication
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { MapPin, LogIn, AlertCircle } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [enmNumber, setEnmNumber] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, enmNumber)
    if (success) {
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MapPin size={32} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            EMG
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Field App
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-card)',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ 
          margin: '0 0 1.5rem 0', 
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontSize: '1.25rem'
        }}>
          Rep Login
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#ef4444'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@emg.com"
            required
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-secondary)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            ENM Number
          </label>
          <input
            type="password"
            value={enmNumber}
            onChange={(e) => setEnmNumber(e.target.value)}
            placeholder="••••"
            required
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-secondary)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              letterSpacing: '0.1em'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            'Logging in...'
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </button>
      </form>

      <div style={{
        marginTop: '2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.75rem',
        textAlign: 'center'
      }}>
        Contact your manager if you don't have login credentials
      </div>
    </div>
  )
}
