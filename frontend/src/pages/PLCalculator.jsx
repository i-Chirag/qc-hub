import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api/index.js'
import ResultPanel from '../components/ResultPanel.jsx'
import ProjectLoader from '../components/ProjectLoader.jsx'

// ── Defaults (Synced with Digital Twin Excel Example) ────────────────────────
const DEFAULTS = {
  entity_name: 'Leela Jaisalmer',
  location: 'Jaisalmer',
  category: 'resort',
  industry: 'hospitality',
  property_type: 'resort',
  star_rating: 'star_4',
  heating_source: 'gas-lpg',
  billing_method: 'dirty',
  linen_rental: 'without',
  
  // Capacity & Volume
  capacity: 80,
  linen_per_unit: 7, 
  operating_days: 30,
  occupancy_pct: 100,

  // Revenue Streams
  billing_rate_per_kg: 29,
  guest_laundry_kg: 500,
  guest_laundry_rate: 70,
  clean_surcharge_rate: 0,

  // Financial Inputs
  total_investment: 6246421,

  // Operating Costs (Utility)
  electricity_rate: 11,
  gas_rate: 100,
  water_cost_per_kg: 0,
  chemical_cost_per_kg: 3,

  // Manpower Breakdown
  operators_qty: 6,
  operators_rate: 16800,
  manager_qty: 1,
  manager_rate: 40000,

  // Specialized Overheads
  rm_monthly: 10411,
  food_cost_total: 0,
  miscellaneous_monthly: 5600,
  qc_supervision_monthly: 25000,
  clean_billing_surcharge: 0,
  linen_rental_cost_fixed: 0,
}

// ── Field helpers ─────────────────────────────────────────────────────────────
const Field = ({ label, children, wide }) => (
  <div style={{ marginBottom: 24, gridColumn: wide ? 'span 2' : 'span 1' }}>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>{label}</label>
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

const Section = ({ title, icon, children, grid }) => (
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
    <div style={{ display: 'grid', gridTemplateColumns: grid || '1fr 1fr', gap: '0 24px' }}>
      {children}
    </div>
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
export default function PLCalculator() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

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

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 56 }} className="animate-fade no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em' }}>OPERATIONS / PRECISION</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1 }}>Financial Digital Twin</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 8, fontSize: '1.2rem', maxWidth: 600 }}>
          High-fidelity P&L modeling synced with exact operational spreadsheets.
        </p>
      </div>

      <div className="no-print">
        <ProjectLoader currentType="financial" onSelect={(p) => setForm({ ...form, ...p })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 500px' : '1fr', gap: 48, alignItems: 'start' }}>
        
        {/* ── Forms ────────────────────────────────────────────────────────── */}
        <div className="no-print">
          <Section title="Entity Information" icon="◩">
            <Field label="Name of Entity" wide>
              <input value={form.entity_name} onChange={e => set('entity_name', e.target.value)} />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={e => set('location', e.target.value)} />
            </Field>
            <Field label="Operating Days / Month">
              <input type="number" value={form.operating_days} onChange={e => set('operating_days', e.target.value)} />
            </Field>
          </Section>

          <Section title="Volume & Capacity" icon="◪">
            <Field label="Inventory (Rooms/Beds)">
              <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
            </Field>
            <Field label="Linen per Unit (KG)">
              <input type="number" value={form.linen_per_unit} onChange={e => set('linen_per_unit', e.target.value)} />
            </Field>
            <Field label="Occupancy (%)" wide>
              <input type="number" value={form.occupancy_pct} onChange={e => set('occupancy_pct', e.target.value)} />
            </Field>
          </Section>

          <Section title="Revenue Streams" icon="◧">
            <Field label="P&L Billing Rate (₹/KG)">
              <input type="number" value={form.billing_rate_per_kg} onChange={e => set('billing_rate_per_kg', e.target.value)} />
            </Field>
            <Field label="Guest Laundry Load (KG)">
              <input type="number" value={form.guest_laundry_kg} onChange={e => set('guest_laundry_kg', e.target.value)} />
            </Field>
            <Field label="Guest Laundry Rate (₹/KG)">
              <input type="number" value={form.guest_laundry_rate} onChange={e => set('guest_laundry_rate', e.target.value)} />
            </Field>
            <Field label="Clean Surcharge (₹/KG)">
              <input type="number" value={form.clean_surcharge_rate} onChange={e => set('clean_surcharge_rate', e.target.value)} />
            </Field>
          </Section>

          <Section title="Operating Costs" icon="◨">
            <Field label="Electricity Rate (₹/unit)">
              <input type="number" value={form.electricity_rate} onChange={e => set('electricity_rate', e.target.value)} />
            </Field>
            <Field label="Gas/LPG Rate (₹/unit)">
              <input type="number" value={form.gas_rate} onChange={e => set('gas_rate', e.target.value)} />
            </Field>
            <Field label="Chemical Cost (₹/KG)">
              <input type="number" value={form.chemical_cost_per_kg} onChange={e => set('chemical_cost_per_kg', e.target.value)} />
            </Field>
            <Field label="Water Cost (₹/KG)">
              <input type="number" value={form.water_cost_per_kg} onChange={e => set('water_cost_per_kg', e.target.value)} />
            </Field>
          </Section>

          <Section title="Manpower Breakdown" icon="">
            <Field label="Operators Qty">
              <input type="number" value={form.operators_qty} onChange={e => set('operators_qty', e.target.value)} />
            </Field>
            <Field label="Operator Avg Salary (₹)">
              <input type="number" value={form.operators_rate} onChange={e => set('operators_rate', e.target.value)} />
            </Field>
            <Field label="Management Qty">
              <input type="number" value={form.manager_qty} onChange={e => set('manager_qty', e.target.value)} />
            </Field>
            <Field label="Manager Salary (₹)">
              <input type="number" value={form.manager_rate} onChange={e => set('manager_rate', e.target.value)} />
            </Field>
          </Section>

          <Section title="Overheads & Fixed" icon="⚙">
            <Field label="R&M Monthly (₹)">
              <input type="number" value={form.rm_monthly} onChange={e => set('rm_monthly', e.target.value)} />
            </Field>
            <Field label="QC Supervision (₹)">
              <input type="number" value={form.qc_supervision_monthly} onChange={e => set('qc_supervision_monthly', e.target.value)} />
            </Field>
            <Field label="Miscellaneous (₹)">
              <input type="number" value={form.miscellaneous_monthly} onChange={e => set('miscellaneous_monthly', e.target.value)} />
            </Field>
            <Field label="Total Investment (₹)">
              <input type="number" value={form.total_investment} onChange={e => set('total_investment', e.target.value)} />
            </Field>
          </Section>

          {error && <div style={{ marginBottom: 24, padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>⚠ {error}</div>}

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            style={{
              width: '100%', padding: '24px',
              background: loading ? 'var(--bg-muted)' : 'var(--accent)',
              border: 'none', borderRadius: 16,
              color: '#061706', fontFamily: 'var(--font-head)', fontWeight: 900,
              fontSize: '1.1rem', letterSpacing: '0.05em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              boxShadow: loading ? 'none' : '0 10px 40px rgba(136, 231, 136, 0.2)',
              marginBottom: 100
            }}
          >
            {loading ? 'CALCULATING PRECISION...' : 'GENERATE DIGITAL TWIN P&L'}
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
