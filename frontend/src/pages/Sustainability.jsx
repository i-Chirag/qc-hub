import { useState, useCallback } from 'react'
import { api } from '../api'

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
    daily_kg: 500,
    water_cost_per_kl: 80,
    stp_plant_cost: 800000
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
          <div style={{ height: 2, width: 32, background: '#60a5fa' }} />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Water Conservation</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.05 }}>
          Water Sustainability <br />
          <span style={{ color: '#60a5fa' }}>Audit</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 16, fontSize: '1.1rem', maxWidth: 600 }}>
          Hypothetical modeling for laundry water recycling (STP/ETP) ROI. Estimate your procurement savings and plant payback periods.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, alignItems: 'start' }}>
        
        {/* ──── Controls ──── */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: 24 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Laundry Capacity (KG/Day)</label>
             <input type="number" value={form.daily_kg} onChange={e => set('daily_kg', e.target.value)} />
          </div>

          <div style={{ marginBottom: 24 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Water Cost (₹/KL)</label>
             <input type="number" value={form.water_cost_per_kl} onChange={e => set('water_cost_per_kl', e.target.value)} />
          </div>

          <div style={{ marginBottom: 40 }}>
             <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>STP/ETP Plant CAPEX (₹)</label>
             <input type="number" value={form.stp_plant_cost} onChange={e => set('stp_plant_cost', e.target.value)} />
             <div style={{ fontSize: '0.65rem', color: 'var(--text-min)', marginTop: 8 }}>Estimated cost for a recycling plant at this capacity.</div>
          </div>

          <button onClick={handleAnalyze} disabled={loading} style={{
            width: '100%', padding: '20px', background: '#60a5fa', color: '#061706', border: 'none', borderRadius: 12,
            fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(96, 165, 250, 0.2)'
          }}>
            {loading ? 'ANALYZING...' : 'GENERATE WATER AUDIT'}
          </button>
        </div>

        {/* ──── Visuals ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {result ? (
            <div className="animate-fade">
              
              <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                <Stat label="Effluent Generation" value={`${result.water_metrics.daily_effluent_kl} KL`} sub="Total Daily Untreated Output" color="var(--text-dim)" />
                <Stat label="Recovered Water" value={`${result.water_metrics.water_saved_kld} KL`} sub="Daily Purified Supply" color="#60a5fa" />
                <Stat label="Monthly Recovery" value={`${result.water_metrics.monthly_water_saved_kl} KL`} sub="Total Volumetric Savings" color="#60a5fa" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                <div className="glass-card" style={{ padding: '40px', borderLeft: '4px solid #60a5fa' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem' }}>Water Recycling ROI</h3>
                      <div style={{ padding: '8px 16px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', borderRadius: 8, fontSize: '0.8rem', fontWeight: 800 }}>{result.water_metrics.payback_months} MONTHS PAYBACK</div>
                   </div>
                   <div style={{ fontSize: '4rem', fontWeight: 1000, color: '#60a5fa', marginBottom: 16 }}>{fmt(result.water_metrics.monthly_savings)} <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 700 }}>MONTHLY SAVINGS</span></div>
                   <div style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 600 }}>
                      By recovering <strong>{result.water_metrics.recovery_percent}%</strong> of your effluent, you reduce procurement costs by significant margins. 
                      Estimated annual savings: <strong style={{color: 'var(--text)'}}>{fmt(result.water_metrics.monthly_savings * 12)}</strong>.
                   </div>
                </div>
              </div>

              <div style={{ marginTop: 32, textAlign: 'right' }}>
                 <button onClick={handleSave} disabled={saved} style={{
                   padding: '16px 40px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 12,
                   color: saved ? '#60a5fa' : 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: 800, cursor: 'pointer'
                 }}>
                   {saved ? '✓ WATER AUDIT ARCHIVED' : 'ARCHIVE WATER AUDIT DATA'}
                 </button>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', opacity: 0.5, border: '2px dashed var(--border)' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 20 }}>💧</div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800 }}>Standalone Water Audit</h2>
                  <p>Enter your daily KG and water costs to see recycling ROI.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
