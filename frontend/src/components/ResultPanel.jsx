import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const fmt = (n) => {
  if (n === null || n === undefined) return '—'
  return '₹ ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

const fmtLakh = (n) => {
  if (n === null || n === undefined) return '—'
  return '₹ ' + (Number(n) / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' L'
}

const fmtKg = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' kg'

const Metric = ({ label, value, color, big, sub }) => (
  <div style={{
    padding: big ? '32px' : '20px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: `1px solid ${color ? color + '44' : 'var(--border)'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }}>
    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    <div style={{
      fontFamily: 'var(--font-head)',
      fontSize: big ? '2rem' : '1.25rem',
      fontWeight: 800,
      color: color || 'var(--text)',
      lineHeight: 1.1,
    }}>{value}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: color || 'var(--text-dim)', fontWeight: 600, opacity: 0.8 }}>{sub}</div>}
  </div>
)

const Row = ({ label, value, indent, bold }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border)',
    paddingLeft: indent ? 16 : 0,
  }}>
    <span style={{ color: indent ? 'var(--text-dim)' : 'var(--text)', fontSize: '0.85rem', fontWeight: bold ? 700 : 500 }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.9rem', color: 'var(--text)', fontWeight: 700 }}>{value}</span>
  </div>
)

export default function ResultPanel({ result: r, form, onSave, saved }) {
  const [branded, setBranded] = useState(false)
  const gop = r.gop 
  const gopColor = gop >= 0 ? '#88e788' : '#f87171'

  const handlePrint = () => window.print()

  return (
    <div style={{ position: 'sticky', top: 40 }}>
      {/* ──── SCREEN VIEW ────────────────────────────────────────── */}
      <div className="no-print animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
           <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Audit Controls</div>
           <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
              <input type="checkbox" checked={branded} onChange={e => setBranded(e.target.checked)} />
              Partner Branding Enabled
           </label>
        </div>

        <div className="glass-card" style={{
          background: 'rgba(136, 231, 136, 0.03)',
          border: `1px solid ${gopColor}33`,
          padding: '40px', marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden', borderRadius: 24
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: `radial-gradient(circle, ${gopColor}15 0%, transparent 70%)` }} />
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.2em', marginBottom: 12 }}>Gross Operating Profit (GOP)</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '3.5rem', color: gopColor, lineHeight: 1, marginBottom: 8 }}>{fmt(gop)}</div>
          <div style={{ fontFamily: 'var(--font-head)', color: gopColor, fontSize: '1rem', fontWeight: 700 }}>{r.gop_percentage}% OPERATIONAL MARGIN</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Metric label="Yearly Profit" value={fmtLakh(r.annual_gop)} color="#88e788" />
          <Metric label="ROI" value={`${r.roi_percentage}%`} color="#a78bfa" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <Metric label="Investment Tenure" value={`${r.payback_months || '—'} Mo`} color="#fbbf24" sub="Recovery Period" />
          <Metric label="Processing Cost" value={`₹ ${r.cost_per_kg}`} color="var(--accent)" sub="Cost per KG" />
        </div>

        <div className="glass-card" style={{ padding: '24px', marginBottom: 20, background: 'rgba(255,255,255,0.01)', borderRadius: 16 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Audit Digital Twin</div>
          <Row label="Actual Load / Month" value={fmtKg(r.kg_per_month)} />
          <Row label="Monthly Net Revenue" value={fmt(r.total_revenue_net)} bold />
          <Row label="Estimated OPEX" value={fmt(r.total_expanses)} />
          <Row label="Monthly GOP" value={fmt(gop)} bold />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <button type="button" onClick={(e) => { e.preventDefault(); onSave(); }} disabled={saved} className="glass-button">
            {saved ? '✓ ARCHIVED' : 'SAVE TO VAULT'}
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); handlePrint(); }} className="glass-button" style={{ background: 'var(--accent)', color: '#000' }}>
             PRO AUDIT PDF
          </button>
        </div>
      </div>

      {/* ──── PRINT-ONLY (PRO PDF ENGINE) ───────────────────────────────── */}
      <div className="print-only" style={{ color: '#000', padding: '10mm', position: 'relative' }}>
        
        {/* State Watermark */}
        <div style={{ 
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '8rem', fontWeight: 900, color: '#f1f5f9', zIndex: -1, opacity: 0.5, whiteSpace: 'nowrap'
        }}>
          INVESTMENT GRADE
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '6px solid #000', paddingBottom: 24, marginBottom: 40 }}>
           <div>
              {branded ? (
                <div style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Partner: {form.entity_name}</div>
              ) : (
                <>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>QC HUB</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666', textTransform: 'uppercase' }}>Precision Feasibility Engine</div>
                </>
              )}
           </div>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900 }}>FINANCIAL AUDIT REPORT</div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>Ref ID: QC-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
           </div>
        </div>

        <div style={{ marginBottom: 48 }}>
           <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.03em' }}>{form.entity_name || 'Project Entity'}</h1>
           <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ fontSize: '1.2rem', color: '#444' }}>Location: <strong>{form.location || 'Not Specified'}</strong></span>
              <span style={{ fontSize: '1.2rem', color: '#444' }}>Sector: <strong>{form.industry || 'Hospitality'}</strong></span>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 60 }}>
           <div style={{ borderLeft: '4px solid #000', padding: '16px 20px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>ANNUAL PROFIT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{fmtLakh(r.annual_gop)}</div>
           </div>
           <div style={{ borderLeft: '4px solid #000', padding: '16px 20px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>ROI PROFILE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{r.roi_percentage}%</div>
           </div>
           <div style={{ borderLeft: '4px solid #000', padding: '16px 20px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>PROJECT PAYBACK</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{r.payback_months || '—'} Mo</div>
           </div>
           <div style={{ borderLeft: '4px solid #000', padding: '16px 20px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>OPEX MARGIN</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{r.gop_percentage}%</div>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 60, marginBottom: 80 }}>
           <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 24, borderBottom: '2px solid #eee', paddingBottom: 8 }}>OPERATIONAL BASELINE</div>
              <Table data={[
                ['Rooms / Capacity', form.capacity],
                ['Estimated Load / Day', (form.capacity * form.linen_per_unit).toFixed(1) + ' kg'],
                ['Operating Days', form.operating_days + ' Days / Month'],
                ['Calculated Monthly Load', fmtKg(r.kg_per_month)],
                ['Billing Rate (Standard)', '₹ ' + form.billing_rate_per_kg + ' / kg'],
                ['Guest Billing Logic', 'Premium Tier']
              ]} />
           </div>
           <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 24, borderBottom: '2px solid #eee', paddingBottom: 8 }}>FINANCIAL AUDIT (MONTHLY)</div>
              <Table data={[
                ['Laundry Revenue (Net)', fmt(r.laundry_revenue_monthly)],
                ['Guest Laundry Revenue', fmt(r.guest_revenue_monthly)],
                ['Total Operational Revenue', fmt(r.total_revenue_net)],
                ['Total Utility Expenses', fmt(r.electricity_cost + r.gas_cost)],
                ['Direct Manpower Cost', fmt(r.manpower_cost)],
                ['Chemicals & Processing', fmt(r.chemical_cost)],
                ['MONTHLY OPEX', fmt(r.total_expanses)],
                ['MONTHLY GOP', fmt(gop)]
              ]} />
           </div>
        </div>

        {/* Executive Verification */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 'auto', paddingTop: 60 }}>
           <div>
              <div style={{ height: 60, borderBottom: '1px solid #000', marginBottom: 12 }}></div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>Quality Auditor Signature</div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>QC Hub Compliance Division</div>
           </div>
           <div>
              <div style={{ height: 60, borderBottom: '1px solid #000', marginBottom: 12 }}></div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>Project Head Approval</div>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>{form.entity_name} Authorized Signatory</div>
           </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: '10mm', right: '10mm', borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.7rem', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
           <span>Digital Record: {Math.random().toString(36).substr(2, 10).toUpperCase()}</span>
           <span>Confidential Financial Document | Internal Distribution Only</span>
           <span>QC HUB PRO v1.2</span>
        </div>
      </div>
    </div>
  )
}

function Table({ data }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '14px 0', color: '#444', fontWeight: 500 }}>{row[0]}</td>
            <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 800 }}>{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
