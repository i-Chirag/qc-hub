import { useState, useCallback } from 'react'
import { api } from '../api'
import ProjectLoader from '../components/ProjectLoader'

const ELECTROLUX_MODELS = [
  { id: 'WH6-6',  name: 'WH6-6 (6kg Batch)' },
  { id: 'WH6-11', name: 'WH6-11 (11kg Batch)' },
  { id: 'WH6-20', name: 'WH6-20 (20kg Batch)' },
  { id: 'WH6-33', name: 'WH6-33 (33kg Batch)' },
]

const POWER_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100]
const WATER_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
const DOOR_OPTIONS = [600, 700, 800, 900, 1000, 1100, 1200, 1400, 1600]

const DEFAULTS = {
  entity_name: '',
  location: '',
  target_model: 'WH6-6',
  available_kw: '5',
  entry_width: '700',
  water_inlet_size: '0.5',
  floor_loading_ok: true,
}

const Field = ({ label, children, wide }) => (
  <div style={{ marginBottom: 24, gridColumn: wide ? 'span 2' : 'span 1' }}>
    <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{label}</label>
    {children}
  </div>
)

const Section = ({ title, icon, children }) => (
  <div className="glass-card animate-fade" style={{ padding: '32px', marginBottom: 24, background: 'rgba(255, 255, 255, 0.01)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1rem', fontWeight: 800 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--text)' }}>{title}</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
      {children}
    </div>
  </div>
)

export default function SiteSurvey() {
  const [form, setForm] = useState({ ...DEFAULTS })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setError(null) // Clear error on change
  }, [])

  const handleAudit = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      // Ensure numeric fields are actually numbers
      const payload = {
        ...form,
        available_kw: parseFloat(form.available_kw),
        entry_width: parseFloat(form.entry_width),
        water_inlet_size: parseFloat(form.water_inlet_size),
        target_capacity: parseFloat(form.target_model === 'WH6-6' ? 6 : form.target_model === 'WH6-11' ? 11 : form.target_model === 'WH6-20' ? 20 : 33)
      }
      console.log("Auditing Site with payload:", payload)
      const res = await api.auditSurvey(payload)
      setResult(res)
    } catch (e) {
      console.error(e)
      setError("Failed to run technical audit. Ensure the server is online.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.saveSurvey({ ...form, ...result })
      setSaved(true)
    } catch (e) {
      console.error(e)
      setError("Failed to archive survey data.")
    }
  }

  const handleClear = () => {
    setForm({ ...DEFAULTS })
    setResult(null)
    setError(null)
    setSaved(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ──── Header ──── */}
      <div style={{ marginBottom: 40 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em' }}>ENGINEERING & AUDIT</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1 }}>Site Readiness Audit</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 8, fontSize: '0.95rem', maxWidth: 500 }}>
          Precision validation for Electrolux Professional machinery installation and utility compliance.
        </p>
      </div>

      <ProjectLoader 
        currentType="technical" 
        onSelect={(p) => {
          set('entity_name', p.entity_name || p.name);
          set('location', p.location);
          // If loading from a P&L, there's no target_model, but we can set the name
        }} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 440px' : '1fr', gap: 32, alignItems: 'start' }}>
        
        {/* ──── Input Form ──── */}
        <div style={{ maxWidth: 800 }}>
          <Section title="Asset Identification" icon="◩">
            <Field label="Installation Entity" wide>
              <input value={form.entity_name} onChange={e => set('entity_name', e.target.value)} placeholder="e.g. Grand Resort & Spa" />
            </Field>
            <Field label="Project Location">
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" />
            </Field>
            <Field label="Machine Configuration">
              <select value={form.target_model} onChange={e => set('target_model', e.target.value)}>
                {ELECTROLUX_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Utility Infrastructure" icon="⚡">
            <Field label="Site Power Load">
              <select value={form.available_kw} onChange={e => set('available_kw', e.target.value)}>
                {POWER_OPTIONS.map(o => (
                  <option key={o} value={o}>{o} kW available</option>
                ))}
              </select>
            </Field>
            <Field label="Main Water Inlet">
              <select value={form.water_inlet_size} onChange={e => set('water_inlet_size', e.target.value)}>
                {WATER_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}" Pipe Diameter</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Physical Logistics" icon="🏗️">
            <Field label="Entry Passage Width">
              <select value={form.entry_width} onChange={e => set('entry_width', e.target.value)}>
                {DOOR_OPTIONS.map(o => (
                  <option key={o} value={o}>{o} mm clearance</option>
                ))}
              </select>
            </Field>
            <Field label="Structural Integrity">
              <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 5, borderRadius: 10, border: '1px solid var(--border)' }}>
                {[{v:true, l:'VERIFIED'}, {v:false, l:'UNCHECKED'}].map(opt => (
                  <button key={opt.l} onClick={() => set('floor_loading_ok', opt.v)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                    background: form.floor_loading_ok === opt.v ? 'var(--accent)' : 'transparent',
                    color: form.floor_loading_ok === opt.v ? '#061706' : 'var(--text-dim)',
                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', transition: '0.2s'
                  }}>{opt.l}</button>
                ))}
              </div>
            </Field>
          </Section>

          {error && <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <button onClick={handleAudit} disabled={loading} style={{
                padding: '20px', background: loading ? 'rgba(136, 231, 136, 0.2)' : 'var(--accent)',
                border: 'none', borderRadius: 12, color: '#061706', fontFamily: 'var(--font-head)', fontWeight: 800,
                fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 30px rgba(136, 231, 136, 0.1)',
                transition: '0.2s'
              }}
            >
              {loading ? 'AUDITING...' : 'GENERATE TECHNICAL REPORT'}
            </button>
            <button onClick={handleClear} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
              RESET FORM
            </button>
          </div>
        </div>

        {/* ──── Result Panel ──── */}
        {result && (
          <div style={{ position: 'sticky', top: 40 }} className="animate-fade">
             <div className="glass-card" style={{ padding: '32px', background: 'rgba(131, 131, 131, 0.02)', border: `1px solid ${result.readiness_score > 80 ? 'var(--accent)' : '#f87171'}33` }}>
                
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                   <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Site Readiness Score</div>
                   <div style={{ fontSize: '3.5rem', fontWeight: 900, color: result.readiness_score > 80 ? 'var(--accent)' : '#f87171', lineHeight: 1, margin: '8px 0' }}>{result.readiness_score}%</div>
                   <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)', background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '6px 12px', borderRadius: 6 }}>{result.readiness_status}</div>
                </div>

                <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                   <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8 }}>Configuration Target</div>
                   <div style={{ color: 'var(--accent)', fontSize: '1.1rem', fontWeight: 900 }}>{result.target_model_label}</div>
                </div>

                <div style={{ marginBottom: 32 }}>
                   <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>Gap Analysis</div>
                   {result.gap_analysis.length > 0 ? (
                      result.gap_analysis.map((gap, i) => (
                        <div key={i} style={{ padding: '10px', background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.1)', borderRadius: 8, color: '#f87171', fontSize: '0.75rem', marginBottom: 6, fontWeight: 500, lineHeight: 1.4 }}>
                          • {gap}
                        </div>
                      ))
                   ) : (
                     <div style={{ padding: '10px', background: 'rgba(136, 231, 136, 0.05)', border: '1px solid rgba(136, 231, 136, 0.1)', borderRadius: 8, color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 500 }}>
                       ✓ Site exceeds all Electrolux technical benchmarks.
                     </div>
                   )}
                </div>

                <div style={{ marginBottom: 32, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                   <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>Technical Benchmarks</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Power (kW): <span style={{ color: 'var(--text)', fontWeight: 700 }}>{result.benchmark_used.required_kw}</span></div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Water ("): <span style={{ color: 'var(--text)', fontWeight: 700 }}>{result.benchmark_used.water_inlet}</span></div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Passage: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{result.benchmark_used.door_width}mm</span></div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                   <button onClick={handleSave} disabled={saved} style={{
                     padding: '16px', background: saved ? 'rgba(136, 231, 136, 0.05)' : 'transparent',
                     border: `1px solid ${saved ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12,
                     color: saved ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem', cursor: saved ? 'default' : 'pointer'
                   }}>
                     {saved ? '✓ DATA ARCHIVED' : 'SAVE AUDIT'}
                   </button>
                   <button onClick={() => window.print()} style={{
                     padding: '16px', background: 'var(--accent)', border: 'none', borderRadius: 12,
                     color: '#061706', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
                   }}>
                     PRINT PDF
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
