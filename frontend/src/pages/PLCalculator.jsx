import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api/index.js'
import ResultPanel from '../components/ResultPanel.jsx'
import ProjectLoader from '../components/ProjectLoader.jsx'

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
  entity_name: '',
  location: '',
  category: 'greenfield',
  industry: 'healthcare',
  sub_type: 'private',
  property_type: 'city',
  star_rating: 'star_3',
  heating_source: 'lpg',
  billing_method: 'dirty',
  linen_rental: 'without',
  capacity: '',
  total_investment: '',
  billing_rate_per_kg: '',
  electricity_rate: '',
  gas_rate: '',
  water_cost_per_kg: '',
  chemical_cost_per_kg: '3',
  labour_cost_monthly: '',
  linen_rental_charge: '',
  miscellaneous_monthly: '',
  occupancy_pct: '80',
}

// ── Field helpers ─────────────────────────────────────────────────────────────
const Field = ({ label, children, wide }) => (
  <div style={{ marginBottom: 24, gridColumn: wide ? 'span 2' : 'span 1' }}>
    <label>{label}</label>
    {children}
  </div>
)

const Toggle = ({ value, onChange, options }) => (
  <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid var(--border)' }}>
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={(e) => { e.preventDefault(); onChange(opt.value); }}
        style={{
          flex: 1, padding: '10px 0',
          borderRadius: 8, border: 'none',
          background: value === opt.value ? 'var(--accent)' : 'transparent',
          color: value === opt.value ? '#061706' : 'var(--text-dim)',
          fontFamily: 'var(--font-head)',
          fontWeight: 700, fontSize: '0.75rem', 
          cursor: 'pointer', transition: 'all 0.2s',
          letterSpacing: '0.05em',
        }}
      >{opt.label}</button>
    ))}
  </div>
)

const Section = ({ title, icon, children }) => (
  <div className="glass-card animate-fade" style={{
    padding: '40px',
    marginBottom: 24,
    border: '1px solid var(--border)',
    background: 'rgba(255, 255, 255, 0.01)',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      marginBottom: 32, paddingBottom: 24,
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ 
        width: 32, height: 32, borderRadius: 8, background: 'var(--accent-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
        fontSize: '1.2rem', fontWeight: 800,
      }}>{icon}</div>
      <h3 style={{
        fontFamily: 'var(--font-head)', fontWeight: 800,
        fontSize: '1.1rem', letterSpacing: '0.02em',
        textTransform: 'uppercase', color: 'var(--text)',
      }}>{title}</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
      {children}
    </div>
  </div>
)

const HEALTHCARE_TYPES = [
  { value: 'private', label: 'PRV' }, { value: 'government', label: 'GOV' }, { value: 'trust', label: 'TRU' },
]

const HOSPITALITY_TYPES = [
  { value: 'city', label: 'CITY' }, { value: 'resort', label: 'RSRT' }, 
  { value: 'star_3', label: '3★' }, { value: 'star_4', label: '4★' }, { value: 'star_5', label: '5★' },
]

// ── Main Component ────────────────────────────────────────────────────────────
export default function PLCalculator() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [editChem, setEditChem] = useState(false)

  // Handle incoming state from Cost Estimator
  useEffect(() => {
    if (location.state?.entity_name) {
      setForm(f => ({
        ...f,
        entity_name: location.state.entity_name,
        location: location.state.location || f.location,
        total_investment: location.state.investment || f.total_investment,
        capacity: location.state.capacity || f.capacity
      }))
    }
  }, [location.state])

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])

  const setIndustry = (val) => {
    set('industry', val)
    set('sub_type', val === 'healthcare' ? 'private' : 'city')
  }

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setError(null); setSaved(false)
    try {
      const res = await api.calculate(form)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.saveProject({ ...form, ...result })
      setSaved(true)
    } catch (e) {
      setError(e.message)
    }
  }

  const subTypeOptions = form.industry === 'healthcare' ? HEALTHCARE_TYPES : HOSPITALITY_TYPES
  const capacityLabel = form.industry === 'healthcare' ? 'Facility Bed Count' : 'Room Inventory'

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 56 }} className="animate-fade no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em' }}>OPERATIONS / CORE</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1 }}>P&amp;L Intelligence</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 8, fontSize: '1.05rem', maxWidth: 500 }}>
          Precision modeling of gross operating metrics for laundry and linen services.
        </p>
      </div>

      <div className="no-print">
        <ProjectLoader 
          currentType="financial" 
          onSelect={(p) => {
            set('entity_name', p.entity_name || p.name);
            set('location', p.location);
            if (p.industry) setIndustry(p.industry);
            if (p.category) set('category', p.category);
          }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 480px' : '1fr', gap: 40, alignItems: 'start' }}>
        
        {/* ── Forms ────────────────────────────────────────────────────────── */}
        <div className="no-print">
          <Section title="Entity Information" icon="◩">
            <Field label="Name of Entity" wide>
              <input value={form.entity_name} onChange={e => set('entity_name', e.target.value)} placeholder="e.g. St. Jude Regional" />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" />
            </Field>
            <Field label="Category">
              <Toggle value={form.category} onChange={v => set('category', v)} options={[{ value: 'greenfield', label: 'Greenfield' }, { value: 'brownfield', label: 'Brownfield' }]} />
            </Field>
            <Field label="Industry">
              <Toggle value={form.industry} onChange={setIndustry} options={[{ value: 'healthcare', label: 'Healthcare' }, { value: 'hospitality', label: 'Hospitality' }]} />
            </Field>

            {form.industry === 'healthcare' ? (
              <Field label="Type">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {HEALTHCARE_TYPES.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => set('sub_type', opt.value)}
                      style={{
                        padding: '10px 14px', borderRadius: 10, flex: 1,
                        border: '1px solid',
                        borderColor: form.sub_type === opt.value ? 'var(--accent)' : 'var(--border)',
                        background: form.sub_type === opt.value ? 'var(--accent)' : 'transparent',
                        color: form.sub_type === opt.value ? '#061706' : 'var(--text-dim)',
                        fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.7rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </Field>
            ) : (
              <>
                <Field label="Property Type">
                  <Toggle
                    value={form.property_type}
                    onChange={v => set('property_type', v)}
                    options={[{ value: 'city', label: 'CITY' }, { value: 'resort', label: 'RESORT' }]}
                  />
                </Field>
                <Field label="Category Rating">
                  <Toggle
                    value={form.star_rating}
                    onChange={v => set('star_rating', v)}
                    options={[{ value: 'star_3', label: '3★' }, { value: 'star_4', label: '4★' }, { value: 'star_5', label: '5★' }]}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="Business Details" icon="◪">
            <Field label="Heating Source">
              <select value={form.heating_source} onChange={e => set('heating_source', e.target.value)}>
                <option value="lpg">LPG</option>
                <option value="png">PNG</option>
                <option value="electric">Electric</option>
              </select>
            </Field>
            <Field label="Billing Method">
              <Toggle value={form.billing_method} onChange={v => set('billing_method', v)} options={[{ value: 'dirty', label: 'Dirty' }, { value: 'clean', label: 'Clean' }]} />
            </Field>
            <Field label="Linen Rental">
              <Toggle value={form.linen_rental} onChange={v => set('linen_rental', v)} options={[{ value: 'with', label: 'With' }, { value: 'without', label: 'Without' }]} />
            </Field>
            <Field label={capacityLabel}>
              <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Occupancy (%)">
              <input type="number" value={form.occupancy_pct} onChange={e => set('occupancy_pct', e.target.value)} placeholder="80" />
            </Field>
          </Section>

          <Section title="Financial Inputs" icon="◧">
            <Field label="Total Investment (₹)">
              <input type="number" value={form.total_investment} onChange={e => set('total_investment', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Billing Rate / KG (₹)">
              <input type="number" value={form.billing_rate_per_kg} onChange={e => set('billing_rate_per_kg', e.target.value)} placeholder="0.00" />
            </Field>
            {form.linen_rental === 'with' && (
              <Field label="Linen Rental Charge / KG (₹)">
                <input type="number" value={form.linen_rental_charge} onChange={e => set('linen_rental_charge', e.target.value)} placeholder="0.00" />
              </Field>
            )}
          </Section>

          <Section title="Operating Costs" icon="◨">
            <Field label="Electricity Rate (₹/unit)">
              <input type="number" value={form.electricity_rate} onChange={e => set('electricity_rate', e.target.value)} />
            </Field>
            {form.heating_source !== 'electric' && (
              <Field label={`Gas Rate (₹/${form.heating_source === 'lpg' ? 'kg' : 'SCM'})`}>
                <input type="number" value={form.gas_rate} onChange={e => set('gas_rate', e.target.value)} />
              </Field>
            )}
            <Field label="Water Cost / KG (₹)">
              <input type="number" value={form.water_cost_per_kg} onChange={e => set('water_cost_per_kg', e.target.value)} />
            </Field>
            <Field label="Chemical Cost / KG (₹)">
              <div style={{ display: 'flex', gap: 8 }}>
                {editChem
                  ? <input type="number" value={form.chemical_cost_per_kg} onChange={e => set('chemical_cost_per_kg', e.target.value)} autoFocus />
                  : <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>₹ {form.chemical_cost_per_kg} <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>/ kg</span></div>
                }
                <button type="button" onClick={(e) => { e.preventDefault(); setEditChem(!editChem); }} style={{ padding: '0 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>{editChem ? '✓' : '✎'}</button>
              </div>
            </Field>
            <Field label="Labour Cost / Month (₹)">
              <input type="number" value={form.labour_cost_monthly} onChange={e => set('labour_cost_monthly', e.target.value)} />
            </Field>
            <Field label="Miscellaneous / Month (₹)">
              <input type="number" value={form.miscellaneous_monthly} onChange={e => set('miscellaneous_monthly', e.target.value)} />
            </Field>
          </Section>

          {error && <div style={{ marginBottom: 24, padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>⚠ {error}</div>}

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            style={{
              width: '100%', padding: '20px',
              background: loading ? 'var(--bg-muted)' : 'var(--accent)',
              border: 'none', borderRadius: 16,
              color: '#061706', fontFamily: 'var(--font-head)', fontWeight: 800,
              fontSize: '1rem', letterSpacing: '0.05em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              boxShadow: loading ? 'none' : '0 10px 30px rgba(136, 231, 136, 0.2)',
            }}
          >
            {loading ? 'CALCULATING...' : 'CALCULATE P&L / GOI'}
          </button>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {result && (
          <div style={{ position: 'sticky', top: 40 }}>
            <ResultPanel result={result} form={form} onSave={handleSave} saved={saved} />
          </div>
        )}
      </div>
    </div>
  )
}
