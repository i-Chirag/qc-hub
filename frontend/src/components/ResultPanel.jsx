import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const fmt = (n) => {
  if (n === null || n === undefined) return '—'
  return '₹ ' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

const fmtKg = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + ' kg'

const Metric = ({ label, value, color, big, sub }) => (
  <div style={{
    padding: big ? '32px' : '20px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 'var(--radius)',
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
  const goi = r.gross_operating_income
  const goiColor = goi >= 0 ? '#88e788' : '#f87171'

  const pieData = [
    { name: 'Electricity',  value: r.electricity_cost, color: '#88e788' },
    { name: 'Gas/Fuel',     value: r.gas_cost,         color: '#a78bfa' },
    { name: 'Water',        value: r.water_cost,        color: '#2dd4bf' },
    { name: 'Chemicals',    value: r.chemical_cost,     color: '#60a5fa' },
    { name: 'Labour',       value: r.labour_monthly,    color: '#fbbf24' },
    { name: 'Misc',         value: r.misc_monthly,      color: '#94a3b8' },
  ].filter(d => d.value > 0)

  const handlePrint = () => window.print()

  return (
    <div style={{ position: 'sticky', top: 40, animation: 'fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
      
      {/* ──── SCREEN VIEW ────────────────────────────────────────── */}
      <div className="no-print">
        {/* GOI Hero */}
        <div className="glass-card" style={{
          background: 'rgba(136, 231, 136, 0.03)',
          border: `1px solid ${goiColor}33`,
          padding: '40px', marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: `radial-gradient(circle, ${goiColor}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.2em', marginBottom: 12 }}>Gross Operating Income (GOI)</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '3.5rem', color: goiColor, lineHeight: 1, marginBottom: 8, textShadow: `0 0 40px ${goiColor}22` }}>{fmt(goi)}</div>
          <div style={{ fontFamily: 'var(--font-head)', color: goiColor, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>{r.goi_percentage}% PROFIT MARGIN</div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <Metric label="Monthly Revenue" value={fmt(r.total_revenue)} color="#88e788" sub={`${fmtKg(r.kg_per_month)} / MO`} />
          <Metric label="Monthly Cost"    value={fmt(r.total_cost)}    color="#f87171" sub={`₹ ${r.cost_per_kg} / KG`} />
          <Metric label="ROI"             value={`${r.roi_percentage}%`} color="#a78bfa" sub="ANNUAL RETURN" />
          <Metric label="Payback"         value={r.payback_months ? `${r.payback_months} MO` : '—'} color="var(--text)" sub="CAPEX RECOVERY" />
        </div>

        {/* Breakdown */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Detailed Breakdown</div>
          <div style={{ fontFamily: 'var(--font-body)' }}>
            <Row label="Revenue — Billing" value={fmt(r.billing_revenue)} />
            <div style={{ height: 12 }} />
            <Row label="Electricity" value={fmt(r.electricity_cost)} indent />
            <Row label="Labour"      value={fmt(r.labour_monthly)}    indent />
            <Row label="Total Variable Costs" value={fmt(r.total_variable_cost)} bold />
            <div style={{ height: 24 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Annual Profit</span>
               <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>{fmt(r.annual_profit)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button type="button" onClick={(e) => { e.preventDefault(); onSave(); }} disabled={saved} style={{ padding: '16px', background: saved ? 'rgba(136, 231, 136, 0.05)' : 'transparent', border: `1px solid ${saved ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, color: saved ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem', cursor: saved ? 'default' : 'pointer' }}>
            {saved ? '✓ ARCHIVED' : 'SAVE PROJECT'}
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); handlePrint(); }} style={{ padding: '16px', background: 'var(--accent)', border: 'none', borderRadius: 12, color: '#061706', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>
             OFFICIAL REPORT (PDF)
          </button>
        </div>
      </div>

      {/* ──── PRINT-ONLY TEMPLATE ───────────────────────────────── */}
      <div className="print-only" style={{ color: '#111', fontFamily: 'var(--font-body)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>QC HUB</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Precision Laundry Audit</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>SYSTEM AUDIT REPORT</div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>Dated: {new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase', color: '#88e788' }}>Executive Summary</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 4 }}>{form.entity_name || 'Project Untitled'}</h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Financial feasibility analysis for laundry operations in {form.location || 'Not Specified'}.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 40 }}>
          <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, textTransform: 'uppercase' }}>Annual GOI Profit</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#27ae60' }}>{fmt(r.annual_profit)}</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, textTransform: 'uppercase' }}>Operating Margin</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{r.goi_percentage}%</div>
          </div>
          <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, textTransform: 'uppercase' }}>Payback Period</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{r.payback_months || '—'} Months</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #ddd', paddingBottom: 10, marginBottom: 15 }}>Operational Audit</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Industry Vertical</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{form.industry.toUpperCase()}</td></tr>
                {form.industry === 'hospitality' && (
                  <>
                    <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Property Type</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{form.property_type.toUpperCase()}</td></tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Star Rating</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{form.star_rating.replace('star_', '')} ★</td></tr>
                  </>
                )}
                <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Monthly Capacity</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtKg(r.kg_per_month)}</td></tr>
                <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Billing Rate / KG</td><td style={{ textAlign: 'right', fontWeight: 700 }}>₹ {form.billing_rate_per_kg}</td></tr>
                <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Cost / KG</td><td style={{ textAlign: 'right', fontWeight: 700 }}>₹ {r.cost_per_kg}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #ddd', paddingBottom: 10, marginBottom: 15 }}>Financial Breakdown</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Monthly Revenue</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(r.total_revenue)}</td></tr>
                <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0', color: '#666' }}>Monthly Expenses</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(r.total_cost)}</td></tr>
                <tr style={{ borderBottom: '1px solid #eee', background: '#fcfcfc' }}><td style={{ padding: '12px 6px', fontWeight: 800 }}>MONTHLY GOI</td><td style={{ textAlign: 'right', fontWeight: 800 }}>{fmt(r.gross_operating_income)}</td></tr>
                <tr style={{ height: 20 }}></tr>
                <tr style={{ background: '#f8f9fa' }}><td style={{ padding: '12px 6px', fontWeight: 900 }}>ANNUAL PROFIT</td><td style={{ textAlign: 'right', fontWeight: 900, color: '#27ae60' }}>{fmt(r.annual_profit)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 80, borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.7rem', color: '#999', textAlign: 'center' }}>
          This document is an automated financial simulation generated by QC Hub. Actual results may vary based on operational efficiency and market volatility.<br />
          © {new Date().getFullYear()} Quality Control Hub (QC Hub) | Confidential Document.
        </div>
      </div>

    </div>
  )
}
