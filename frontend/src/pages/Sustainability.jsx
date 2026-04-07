import { useState, useCallback, useEffect } from 'react'
import { api } from '../api'
import ProjectLoader from '../components/ProjectLoader'

const fmt = (n) => '₹ ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

const Stat = ({ label, value, sub, color }) => (
  <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: color || 'var(--text)', fontFamily: 'var(--font-head)' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>}
  </div>
)

export default function Sustainability() {
  const [form, setForm] = useState({
    entity_name: '',
    location: '',
    heating_type: 'electric',
    daily_kg: 500,
    water_cost_per_kl: 80,
    electricity_rate: 10,
    items: []
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true); setSaved(false)
    try {
      const res = await api.analyzeSustainability(form)
      setResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.saveSustainability({ ...form, ...result })
      setSaved(true)
    } catch (e) {
      console.error(e)
    }
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ──── Header ──── */}
      <header style={{ marginBottom: 64 }} className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ height: 2, width: 32, background: '#4ade80' }} />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Environmental Intelligence</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.05 }}>
          The Future of Laundry <br />
          <span style={{ color: '#4ade80' }}>is Green</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 16, fontSize: '1.1rem', maxWidth: 600 }}>
          Advanced sustainability modeling for water recycling, solar energy integration, and peak electrical load optimization.
        </p>
      </header>

      <ProjectLoader 
        currentType="green"
        onSelect={(p) => {
          set('entity_name', p.entity_name || p.name)
          set('location', p.location)
          if (p.target_kg) set('daily_kg', p.target_kg)
          if (p.items_json) set('items', JSON.parse(p.items_json))
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, alignItems: 'start' }}>
        
        {/* ──── Controls ──── */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: 32 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>Heating Architecture</label>
             <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid var(--border)' }}>
                {['electric', 'steam'].map(t => (
                  <button key={t} onClick={() => set('heating_type', t)} style={{
                    flex: 1, padding: '12px 0', borderRadius: 8, border: 'none',
                    background: form.heating_type === t ? '#4ade80' : 'transparent',
                    color: form.heating_type === t ? '#061706' : 'var(--text-dim)',
                    fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', transition: '0.2s'
                  }}>{t.toUpperCase()}</button>
                ))}
             </div>
          </div>

          <div style={{ marginBottom: 24 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Daily Capacity (KG)</label>
             <input type="number" value={form.daily_kg} onChange={e => set('daily_kg', e.target.value)} />
          </div>

          <div style={{ marginBottom: 24 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Water Cost (₹/KL)</label>
             <input type="number" value={form.water_cost_per_kl} onChange={e => set('water_cost_per_kl', e.target.value)} />
          </div>

          <div style={{ marginBottom: 40 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Grid Rate (₹/Unit)</label>
             <input type="number" value={form.electricity_rate} onChange={e => set('electricity_rate', e.target.value)} />
          </div>

          <button onClick={handleAnalyze} disabled={loading} style={{
            width: '100%', padding: '20px', background: '#4ade80', color: '#061706', border: 'none', borderRadius: 12,
            fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(74, 222, 128, 0.2)'
          }}>
            {loading ? 'OPTIMIZING...' : 'GENERATE GREEN AUDIT'}
          </button>
        </div>

        {/* ──── Visuals ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {result ? (
            <div className="animate-fade">
              
              {/* Top Stats */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                <Stat label="Total Peak Load" value={`${result.peak_load_kw} kW`} sub="Connected Electrical Requirement" color="#fbbf24" />
                <Stat label="CO2 Reduction" value={`${result.co2_reduction_annual_tons} Tons`} sub="Estimated Annual Carbon Offset" color="#4ade80" />
                <Stat label="Water Recovery" value={`${result.water_metrics.water_saved_kld} KL`} sub="Daily Recycled Water Output" color="#60a5fa" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Solar Panel */}
                <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #fbbf24' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem' }}>Solar PV Sizing</h3>
                      <div style={{ padding: '6px 12px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>{result.solar_metrics.payback_years} YR PAYBACK</div>
                   </div>
                   <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fbbf24', marginBottom: 12 }}>{result.solar_metrics.recommended_kwp} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>kWp plant req.</span></div>
                   <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Sized to cover 120% of peak laundry load. Estimated monthly savings: <strong style={{color: 'var(--text)'}}>{fmt(result.solar_metrics.monthly_savings)}</strong> from grid bills.
                   </div>
                </div>

                {/* Water Panel */}
                <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #60a5fa' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem' }}>Water Recycling ROI</h3>
                      <div style={{ padding: '6px 12px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>{result.water_metrics.payback_months} MON PAYBACK</div>
                   </div>
                   <div style={{ fontSize: '3rem', fontWeight: 900, color: '#60a5fa', marginBottom: 12 }}>80% <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Recovery Potential</span></div>
                   <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Recovering <strong>{result.water_metrics.water_saved_kld} KL</strong> daily. Estimated monthly savings: <strong style={{color: 'var(--text)'}}>{fmt(result.water_metrics.monthly_savings)}</strong> on procurement.
                   </div>
                </div>
              </div>

              <div style={{ marginTop: 32, textAlign: 'right' }}>
                 <button onClick={handleSave} disabled={saved} style={{
                   padding: '16px 40px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 12,
                   color: saved ? '#4ade80' : 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: 800, cursor: 'pointer'
                 }}>
                   {saved ? '✓ GREEN AUDIT ARCHIVED' : 'ARCHIVE SUSTAINABILITY DATA'}
                 </button>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '100px', opacity: 0.5, border: '2px dashed var(--border)' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 20 }}>🌿</div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800 }}>Ready for Green Audit</h2>
                  <p>Load a project or enter details to see environmental ROI.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
