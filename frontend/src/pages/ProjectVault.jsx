import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const Badge = ({ type }) => {
  const styles = {
    financial: { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', label: 'FINANCIAL' },
    technical: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', label: 'TECHNICAL' },
    budget:    { bg: 'rgba(251, 191, 36, 0.1)',  color: '#fbbf24', label: 'BUDGET' },
  }[type] || { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', label: 'OTHER' }

  return (
    <span style={{ 
      padding: '4px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, 
      background: styles.bg, color: styles.color, letterSpacing: '0.05em' 
    }}>
      {styles.label}
    </span>
  )
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="glass-card" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: color || 'var(--text)' }}>{value}</div>
  </div>
)

export default function ProjectVault() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    try {
      const data = await api.getVaultProjects()
      setProjects(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await api.deleteVaultProject(type, id)
      setProjects(projects.filter(p => !(p.id === id && p.type === type)))
    } catch (e) {
      alert('Delete failed')
    }
  }

  const filtered = projects.filter(p => {
    const matchesSearch = (p.entity_name || p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.location || '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || p.type === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: projects.length,
    financial: projects.filter(p => p.type === 'financial').length,
    technical: projects.filter(p => p.type === 'technical').length,
    avgRoi: projects.filter(p => p.type === 'financial' && p.roi_percentage).reduce((acc, curr) => acc + curr.roi_percentage, 0) / (projects.filter(p => p.type === 'financial' && p.roi_percentage).length || 1)
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>Project Vault</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>Centralized management for all laundry audits and calculations.</p>
      </header>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
        <StatCard label="Total Saved Assets" value={stats.total} icon="󱓡" />
        <StatCard label="Avg ROI Profile" value={`${stats.avgRoi.toFixed(1)}%`} icon="󱔗" color="var(--accent)" />
        <StatCard label="Technical Audits" value={stats.technical} icon="󱝿" color="#34d399" />
      </div>

      {/* Toolbar */}
      <div style={{ 
        display: 'flex', gap: 16, marginBottom: 24, padding: '16px', 
        background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border)' 
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }}
          />
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
        </div>
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '0 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontWeight: 600 }}
        >
          <option value="all">All Types</option>
          <option value="financial">Financial (P&L)</option>
          <option value="technical">Technical (Survey)</option>
          <option value="budget">Budget (Estimate)</option>
        </select>
      </div>

      {/* Vault Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
              <th style={{ padding: '20px 24px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Project Entity</th>
              <th style={{ padding: '20px 24px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '20px 24px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Key Metric</th>
              <th style={{ padding: '20px 24px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '20px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading your vault...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>No projects found in this view.</td></tr>
            ) : filtered.map(item => (
              <tr key={`${item.type}-${item.id}`} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="vault-row">
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{item.entity_name || item.name || 'Untitled'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{item.location || 'Unknown Location'}</div>
                </td>
                <td style={{ padding: '20px 24px' }}><Badge type={item.type} /></td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {item.type === 'financial' && <span style={{ color: 'var(--accent)' }}>{item.roi_percentage}% ROI</span>}
                    {item.type === 'technical' && <span style={{ color: '#34d399' }}>{item.readiness_score}/100 SCORE</span>}
                    {item.type === 'budget'    && <span style={{ color: '#fbbf24' }}>₹ {(item.grand_total / 100000).toFixed(1)}L TOTAL</span>}
                  </div>
                </td>
                <td style={{ padding: '20px 24px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button 
                    onClick={() => navigate(`/report/${item.type}/${item.id}`)}
                    style={{ background: 'var(--accent)', border: 'none', color: '#061706', cursor: 'pointer', padding: '6px 14px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, marginRight: 12, transition: 'transform 0.2s' }}
                    className="hover-scale"
                  >
                    MASTER REPORT
                  </button>
                  <button 
                    onClick={() => handleDelete(item.type, item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', opacity: 0.6, cursor: 'pointer', padding: '8px', fontSize: '1.2rem', verticalAlign: 'middle' }}
                    title="Delete Record"
                  >
                    󱂩
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
