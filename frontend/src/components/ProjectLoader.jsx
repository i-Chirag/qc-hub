import { useState, useEffect } from 'react'
import { api } from '../api'

/**
 * Universal Project Loader Component
 * Allows users to "Import" data from any existing project/audit into the current form.
 */
export default function ProjectLoader({ onSelect, currentType }) {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await api.getVaultProjects()
      setProjects(data)
    } catch (e) {
      console.error('Failed to load project database', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchProjects()
  }, [isOpen])

  const filtered = projects.filter(p => 
    (p.entity_name || p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '14px 20px', background: 'rgba(136, 231, 136, 0.05)',
          border: '1px dashed var(--accent)', borderRadius: 12, color: 'var(--accent)',
          fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: '0.2s'
        }}
      >
        <span>{isOpen ? '✕ CANCEL IMPORT' : '📥 LOAD EXISTING PROJECT PROFILE'}</span>
      </button>

      {isOpen && (
        <div className="glass-card animate-fade" style={{ 
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100, 
          padding: '20px', border: '1px solid var(--accent)', background: 'var(--bg-muted)',
          maxHeight: 400, overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <input 
            type="text"
            placeholder="Search all modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ marginBottom: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
          />

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Syncing with vault...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>No matching profiles found.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map(p => (
                <div 
                  key={`${p.type}-${p.id}`}
                  onClick={() => { onSelect(p); setIsOpen(false); }}
                  style={{ 
                    padding: '12px 16px', background: 'rgba(255,255,255,0.03)', 
                    borderRadius: 8, cursor: 'pointer', border: '1px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.entity_name || p.name}</span>
                    <span style={{ 
                      fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, 
                      background: p.type === currentType ? 'var(--text-min)' : 'var(--accent-glow)',
                      color: p.type === currentType ? 'var(--text-dim)' : 'var(--accent)',
                      fontWeight: 900, textTransform: 'uppercase'
                    }}>{p.type}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4 }}>{p.location || 'No Location'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
