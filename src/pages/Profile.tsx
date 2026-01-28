/**
 * Profile Page - Edit rep profile
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ArrowLeft, Camera, Save, LogOut, User } from 'lucide-react'

export function Profile() {
  const navigate = useNavigate()
  const { currentRep, updateProfile, logout } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [name, setName] = useState(currentRep?.name || '')
  const [bio, setBio] = useState(currentRep?.bio || '')
  const [profilePic, setProfilePic] = useState(currentRep?.profile_pic || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!currentRep) {
    navigate('/login')
    return null
  }

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateProfile({ name, bio, profile_pic: profilePic })
    setIsSaving(false)
    if (success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 5rem)',
      padding: '1rem',
      background: 'var(--bg-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-card)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>My Profile</h1>
      </div>

      {/* Profile Picture */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: profilePic ? `url(${profilePic}) center/cover` : 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '3px solid var(--accent)',
            position: 'relative'
          }}
        >
          {!profilePic && <User size={48} color="var(--text-secondary)" />}
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: 'var(--accent)',
            borderRadius: '50%',
            padding: '0.5rem',
            border: '2px solid var(--bg-primary)'
          }}>
            <Camera size={16} color="white" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePicChange}
          style={{ display: 'none' }}
        />
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          Tap to change photo
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>

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
            value={currentRep.email}
            disabled
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            ENM Number
          </label>
          <input
            type="text"
            value={currentRep.enm_number}
            disabled
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'none'
            }}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {saved ? (
          '✓ Saved!'
        ) : isSaving ? (
          'Saving...'
        ) : (
          <>
            <Save size={20} />
            Save Profile
          </>
        )}
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'transparent',
          border: '1px solid #ef4444',
          borderRadius: '0.5rem',
          color: '#ef4444',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          cursor: 'pointer'
        }}
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  )
}
