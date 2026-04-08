import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError('Invalid operator credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        opacity: 0.4, filter: 'blur(100px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(136, 231, 136, 0.05) 0%, transparent 70%)',
        opacity: 0.3, filter: 'blur(80px)', zIndex: 0
      }} />

      <form onSubmit={handleSubmit} className="glass-card animate-fade" style={{
        width: '440px', padding: '64px 48px',
        position: 'relative', zIndex: 1,
        textAlign: 'center', border: '1px solid var(--border)'
      }}>
        <div style={{ 
          width: 64, height: 64, borderRadius: 16, background: 'var(--accent-glow)',
          margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)', fontSize: '2rem', fontWeight: 900
        }}>◩</div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>QC Hub Access</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 48, fontSize: '0.95rem' }}>
          Enter restricted credentials to access the control platform.
        </p>

        <div style={{ textAlign: 'left', marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em' }}>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
            required
            style={{ width: '100%', padding: '16px' }}
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: 40 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ width: '100%', padding: '16px' }}
          />
        </div>

        {error && (
          <div style={{ 
            marginBottom: 32, padding: '14px', borderRadius: 12, 
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171', fontSize: '0.85rem', fontWeight: 600
          }}>
            ⚠ {error}
          </div>
        )}

        <button 
          disabled={loading}
          style={{
            width: '100%', padding: '18px',
            background: 'var(--accent)', color: '#061706',
            border: 'none', borderRadius: 14,
            fontFamily: 'var(--font-head)', fontWeight: 800,
            fontSize: '1rem', letterSpacing: '0.05em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'var(--transition)',
            boxShadow: '0 10px 30px rgba(136, 231, 136, 0.15)'
          }}
        >
          {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
        </button>

        <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 20 }}>
           <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>INTERNAL USE ONLY</span>
        </div>
      </form>
    </div>
  )
}
