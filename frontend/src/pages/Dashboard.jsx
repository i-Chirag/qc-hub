import { useNavigate } from 'react-router-dom'

const CARDS = [
  {
    icon: '󱔗',
    title: 'P&L Calculator',
    desc: 'Gross Operating Income analysis for laundry projects. Healthcare & Hospitality benchmarked.',
    path: '/pl',
    color: '#88e788', // Sage Green
    live: true,
  },
  {
    icon: '󱝿',
    title: 'Site Survey',
    desc: 'Technical audit calibrated for Electrolux Professional installations with gap analysis.',
    path: '/survey',
    color: '#a78bfa', // Lavender
    live: true,
  },
  {
    icon: '󱗆',
    title: 'Cost Estimator',
    desc: 'Bespoke machinery mix recommendations and CapEx estimation for greenfield projects.',
    path: '/estimator',
    color: '#60a5fa', // Blue
    live: true,
  },
  {
    icon: '󱚧',
    title: 'AI Intelligence',
    desc: 'Deep diagnostic analysis across financial, technical, and logistical laundry data.',
    path: '/insights',
    color: '#a855f7', // Purple
    live: true,
  },
]

export default function Dashboard() {
  const nav = useNavigate()

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto', position: 'relative' }} className="animate-fade">
      
      {/* Header Section */}
      <header style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ height: 2, width: 32, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Version 1.0.4
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          lineHeight: 1.05,
          fontWeight: 800,
          marginBottom: 16,
          color: 'var(--text)',
        }}>
          QC Hub<br />
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>Control Platform</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: 640, fontSize: '1.1rem', lineHeight: 1.6 }}>
          Your central platform for laundry operations management — P&L analysis, site surveys, AI forecasting, and more.
        </p>
      </header>

      {/* Module Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24,
      }}>
        {CARDS.map(card => (
          <div
            key={card.title}
            onClick={() => card.live && card.path && nav(card.path)}
            className="glass-card"
            style={{
              padding: '36px',
              cursor: card.live ? 'pointer' : 'default',
              opacity: card.live ? 1 : 0.6,
              position: 'relative',
              overflow: 'hidden',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Ambient Background Glow */}
            {card.live && (
              <div style={{
                position: 'absolute', top: '-20%', right: '-20%', width: '120px', height: '120px',
                background: card.color, opacity: 0.08, filter: 'blur(30px)', borderRadius: '50%',
              }} />
            )}

            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: 24, 
                color: card.color,
                filter: card.live ? `drop-shadow(0 0 10px ${card.color}44)` : 'none'
              }}>{card.icon}</div>
              
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                {card.title}
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {card.desc}
              </p>
            </div>

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: card.live ? 'var(--accent)' : 'var(--text-min)',
                boxShadow: card.live ? '0 0 12px var(--accent)' : 'none',
              }} />
              <span style={{ 
                fontFamily: 'var(--font-head)', 
                fontSize: '0.7rem', 
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: card.live ? 'var(--accent)' : 'var(--text-min)' 
              }}>
                {card.live ? 'LIVE' : 'COMING SOON'}
              </span>
            </div>

            {/* Bottom Status Edge */}
            {card.live && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${card.color}, transparent)` }} />}
          </div>
        ))}
      </div>

      {/* Stats Cluster */}
      <div 
        className="glass-card" 
        style={{
          marginTop: 64,
          display: 'flex', gap: 64, flexWrap: 'wrap',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        {[
          { label: 'Active Modules', val: '01' },
          { label: 'Modules Planned', val: '04' },
          { label: 'System Health', val: 'Pristine' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
