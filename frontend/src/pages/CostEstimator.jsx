import { api } from '../api'
import ProjectLoader from '../components/ProjectLoader'

const DEFAULTS = {
  entity_name: '',
  location: '',
  target_kg: '500',
  shift_h: '8'
}

const fmt = (n) => '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' L'

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

export default function CostEstimator() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])

  const handleRecommend = async () => {
    setLoading(true); setSaved(false)
    try {
      const res = await api.recommendEstimate({ 
        target_kg: parseFloat(form.target_kg),
        shift_h: parseFloat(form.shift_h)
      })
      setResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.saveEstimate({ ...form, ...result })
      setSaved(true)
    } catch (e) {
      console.error(e)
    }
  }

  const updateItemQty = (index, newQty) => {
    const newItems = [...result.items]
    newItems[index].qty = parseInt(newQty) || 0
    newItems[index].total = round(newItems[index].qty * newItems[index].unit_price, 2)
    const newGrand = newItems.reduce((acc, i) => acc + i.total, 0)
    setResult({ ...result, items: newItems, grand_total: newGrand })
  }

  const round = (val, dec) => Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec)

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ──── Header ──── */}
      <div style={{ marginBottom: 48 }} className="animate-fade no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em' }}>CAPEX / INVESTMENT</span>
        </div>
        <h1 style={{ fontSize: '2.55rem', fontWeight: 900, lineHeight: 1.1 }}>Project Cost Estimator</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 8, fontSize: '1rem', maxWidth: 500 }}>
          automated BOQ generation and machinery mix recommendation for Electrolux Professional setups.
        </p>
      </div>

      <ProjectLoader 
        currentType="budget" 
        onSelect={(p) => {
          set('entity_name', p.entity_name || p.name);
          set('location', p.location);
          if (p.target_kg) set('target_kg', p.target_kg);
          // If from P&L:
          if (p.capacity) set('target_kg', p.capacity);
        }} 
      />

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 40, alignItems: 'start' }}>
        
        {/* ──── Configuration ──── */}
        <div>
          <Section title="Project Scope" icon="◩">
            <Field label="Project Name" wide>
              <input value={form.entity_name} onChange={e => set('entity_name', e.target.value)} placeholder="e.g. Skyline Industrial Laundry" />
            </Field>
            <Field label="Daily Capacity Target">
              <div style={{ position: 'relative' }}>
                <input type="number" value={form.target_kg} onChange={e => set('target_kg', e.target.value)} style={{ paddingRight: 50 }} />
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700 }}>KG</span>
              </div>
            </Field>
            <Field label="Shift Length">
              <select value={form.shift_h} onChange={e => set('shift_h', e.target.value)}>
                <option value="8">8 Hours (Standard)</option>
                <option value="10">10 Hours (Extended)</option>
                <option value="12">12 Hours (Double)</option>
              </select>
            </Field>
          </Section>

          <button type="button" onClick={(e) => { e.preventDefault(); handleRecommend(); }} disabled={loading} style={{
              width: '100%', padding: '20px', background: loading ? 'var(--bg-muted)' : 'var(--accent)',
              border: 'none', borderRadius: 12, color: '#061706', fontFamily: 'var(--font-head)', fontWeight: 800,
              fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 30px rgba(136, 231, 136, 0.1)',
            }}
          >
            {loading ? 'CALCULATING MIX...' : 'GENERATE BUDGET PROPOSAL'}
          </button>
        </div>

        {/* ──── Executive Summary (Screen Only) ──── */}
        {result && (
          <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(136, 231, 136, 0.03)', border: '1px solid var(--accent-glow)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Estimated Total Capex</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', margin: '8px 0' }}>{fmt(result.grand_total)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Machinery + Infrastructure</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Recommended Flow</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '8px 0' }}>{result.hourly_capacity_achieved} KG/H</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Balanced Shift Workload</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Min Space Required</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '8px 0' }}>{result.estimated_space_sqft} SQFT</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Infrastructure Footprint</div>
            </div>
            <button type="button" onClick={(e) => { e.preventDefault(); window.print(); }} style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
               EXPORT PROPOSAL (PDF)
            </button>
          </div>
        )}
      </div>

      {/* ──── BOQ Table (Visible on Screen & Print) ──── */}
      {result && (
        <div style={{ marginTop: 40 }} className="animate-fade">
          <Section title="Bill of Quantities (BOQ)" icon="📋">
            <div style={{ gridColumn: 'span 2' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                    <th style={{ padding: '16px', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Item Description</th>
                    <th style={{ padding: '16px', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', width: 80 }}>Qty</th>
                    <th style={{ padding: '16px', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', width: 140 }}>Unit Price</th>
                    <th style={{ padding: '16px', fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', width: 140, textAlign: 'right' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</td>
                      <td style={{ padding: '16px' }}>
                        <input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => updateItemQty(i, e.target.value)}
                          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '4px', width: '100%', textAlign: 'center', margin: 0 }}
                          className="no-print"
                        />
                        <span className="print-only">{item.qty}</span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.85rem' }}>{fmt(item.unit_price)}</td>
                      <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 800, textAlign: 'right', color: 'var(--accent)' }}>{fmt(item.total)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--border)', background: 'rgba(136, 231, 136, 0.02)' }}>
                    <td colSpan="3" style={{ padding: '20px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase' }}>Grand Total CAPEX</td>
                    <td style={{ padding: '20px', textAlign: 'right', fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)' }}>{fmt(result.grand_total)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }} className="no-print">
                 <button type="button" onClick={(e) => { e.preventDefault(); handleSave(); }} disabled={saved} style={{ padding: '12px 32px', borderRadius: 8, background: saved ? 'rgba(136, 231, 136, 0.1)' : 'transparent', border: `1px solid ${saved ? 'var(--accent)' : 'var(--border)'}`, color: saved ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem', cursor: saved ? 'default' : 'pointer' }}>
                    {saved ? '✓ PROPOSAL ARCHIVED' : 'SAVE TO PROJECTS'}
                 </button>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ──── Print Template (Hidden on Screen) ──── */}
      <div className="print-only" style={{ color: '#000', padding: '10mm' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: 20 }}>
            <div>
               <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>QC HUB</h1>
               <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#666' }}>Infrastructure & Investment Advisory</p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>PROJECT BUDGET PROPOSAL</h2>
               <p style={{ fontSize: '0.7rem', color: '#666' }}>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
         </div>

         <div style={{ margin: '40px 0' }}>
            <p style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Engineering for:</p>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{form.entity_name || 'Project Untitled'}</h2>
            <p style={{ fontSize: '1.1rem', color: '#333' }}>Target Load: {form.target_kg} KG / Day @ {form.shift_h}-Hour Shift</p>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 40 }}>
            <div style={{ background: '#f8f9fa', padding: 20 }}>
               <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800 }}>TOTAL ESTIMATED CAPEX</div>
               <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{result && fmt(result.grand_total)}</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: 20 }}>
               <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800 }}>ESTIMATED AREA REQ.</div>
               <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{result && result.estimated_space_sqft} SQFT</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: 20 }}>
               <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800 }}>SYSTEM THROUGHPUT</div>
               <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{result && result.hourly_capacity_achieved} KG/H</div>
            </div>
         </div>

         <div style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6, marginBottom: 40 }}>
            <p><strong>Note on Calculation:</strong> This estimate is calibrated for Electrolux Professional machinery. Infrastructure costs (Electrical, Plumbing) are calculated at 15% of the total machinery cost. Final civil costs may vary based on site-specific requirements.</p>
         </div>

         <div style={{ marginTop: 100, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <div style={{ borderTop: '1px solid #000', width: 200, textAlign: 'center', paddingTop: 10 }}>Prepared by QC Hub</div>
            <div style={{ borderTop: '1px solid #000', width: 200, textAlign: 'center', paddingTop: 10 }}>Accepted by Client</div>
         </div>
      </div>

    </div>
  )
}
