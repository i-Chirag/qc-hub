import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ModuleCard = ({ title, desc, icon, path, color, live, status }) => {
  const nav = useNavigate()
  return (
    <div
      onClick={() => live && path && nav(path)}
      className="glass-card"
      style={{
        padding: '36px',
        cursor: live ? 'pointer' : 'default',
        opacity: live ? 1 : 0.6,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '120px', height: '120px', background: `${color}15`, borderRadius: '50%', filter: 'blur(30px)' }} />
      <div>
        <div style={{ fontSize: '2.5rem', marginBottom: 24, color: color }}>{icon}</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>{title}</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: color }}>{status || 'LIVE'}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [recent, setRecent] = useState([])
  const [stats, setStats] = useState({ total: 0, avgRoi: 0, technical: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getVaultProjects().then(data => {
      setRecent(data.slice(0, 5))
      const financials = data.filter(p => p.type === 'financial')
      setStats({
        total: data.length,
        avgRoi: (financials.reduce((acc, c) => acc + (c.roi_percentage || 0), 0) / (financials.length || 1)).toFixed(1),
        technical: data.filter(p => p.type === 'technical').length
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade">
      
      {/* Header Section */}
      <header style={{ marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ height: 2, width: 32, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Command Center</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineWeight: 1.05, fontWeight: 800, marginBottom: 16 }}>
          QC Hub<br />
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>Ecosystem</span>
        </h1>
      </header>

      {/* Snapshot Stats */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 64 }}>
        <div className="glass-card" style={{ flex: 1, padding: '32px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Saved Assets</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-head)' }}>{stats.total}</div>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '32px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Avg Portfolio ROI</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--accent)' }}>{stats.avgRoi}%</div>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '32px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Technical Status</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: '#a78bfa' }}>{stats.technical} Audited</div>
        </div>
      </div>

      {/* Module Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 64 }}>
        <ModuleCard title="P&L Calculator" desc="Financial feasibility and ROI analysis." icon="󱔗" path="/pl" color="#88e788" live={true} />
        <ModuleCard title="Site Survey" desc="Technical infrastructure and gap analysis." icon="󱝿" path="/survey" color="#a78bfa" live={true} />
        <ModuleCard title="Cost Estimator" desc="Bespoke machinery mix and CapEx estimation." icon="󱗆" path="/estimator" color="#60a5fa" live={true} />
        <ModuleCard title="AI Intelligence" desc="Deep cross-module diagnostic analysis." icon="󱚧" path="/insights" color="#a855f7" live={true} />
        <ModuleCard title="Project Vault" desc="Manage and compare all your saved audits." icon="󱓡" path="/vault" color="var(--accent)" live={true} status="NEW" />
      </div>

      {/* Recent Activity */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-head)' }}>Recent Project Activity</h2>
          <Link to="/vault" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>VIEW ALL ASSETS →</Link>
        </div>
        
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Syncing with vault...</div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>No projects archived yet. Start by saving a P&L or Site Survey.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                {recent.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === recent.length - 1 ? 'none' : '1px solid var(--border)' }} className="vault-row">
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.entity_name || item.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{item.type} • {item.location}</div>
                    </td>
                    <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.9rem' }}>
                        {item.roi_percentage ? `${item.roi_percentage}% ROI` : (item.readiness_score ? `${item.readiness_score} Read` : 'Analyzed')}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 4 }}>{new Date(item.created_at).toLocaleDateString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
