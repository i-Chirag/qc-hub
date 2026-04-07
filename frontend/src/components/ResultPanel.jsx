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
    { name: 'Power',        value: r.electricity_cost, color: '#88e788' },
    { name: 'Labour',       value: r.labour_monthly,    color: '#fbbf24' },
    { name: 'Utilities',    value: r.gas_cost + r.water_cost, color: '#a78bfa' },
    { name: 'Chemicals',    value: r.chemical_cost,     color: '#60a5fa' },
    { name: 'Misc',         value: r.misc_monthly,      color: '#94a3b8' },
  ].filter(d => d.value > 0)

  const projectionData = Array.from({ length: 5 }, (_, i) => {
    const factor = Math.pow(1.05, i)
    return {
      year: `Year ${i + 1}`,
      profit: Math.round(r.annual_profit * factor)
    }
  })

  const handlePrint = () => window.print()

  return (
    <div style={{ position: 'sticky', top: 40 }}>
      {/* ──── SCREEN VIEW ────────────────────────────────────────── */}
      <div className="no-print animate-fade">
        <div className="glass-card" style={{
          background: 'rgba(136, 231, 136, 0.03)',
          border: `1px solid ${goiColor}33`,
          padding: '40px', marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: `radial-gradient(circle, ${goiColor}15 0%, transparent 70%)` }} />
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.2em', marginBottom: 12 }}>Gross Operating Income (GOI)</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '3.5rem', color: goiColor, lineHeight: 1, marginBottom: 8 }}>{fmt(goi)}</div>
          <div style={{ fontFamily: 'var(--font-head)', color: goiColor, fontSize: '1rem', fontWeight: 700 }}>{r.goi_percentage}% PROFIT MARGIN</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Metric label="Yearly Profit" value={fmtLakh(r.annual_profit)} color="#88e788" />
          <Metric label="ROI" value={`${r.roi_percentage}%`} color="#a78bfa" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <Metric label="Investment Tenure" value={`${r.payback_months || '—'} Mo`} color="#fbbf24" sub="Recovery Period" />
          <Metric label="Monthly GOI" value={fmt(goi)} color={goiColor} />
        </div>

        {/* ──── Live Data Matrix ──── */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: 20, background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Technical Audit Details</div>
          <Row label="Daily Capacity" value={fmtKg(r.kg_per_day)} />
          <Row label="Billing Rate" value={`₹ ${form.billing_rate_per_kg || 0} / kg`} />
          <Row label="Monthly Revenue" value={fmt(r.total_revenue)} bold />
          <Row label="Total OPEX" value={fmt(r.total_cost)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <button type="button" onClick={(e) => { e.preventDefault(); onSave(); }} disabled={saved} className="glass-button">
            {saved ? '✓ ARCHIVED' : 'SAVE PROJECT'}
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); handlePrint(); }} className="glass-button" style={{ background: 'var(--accent)', color: '#000' }}>
             OFFICIAL PROPOSAL (PDF)
          </button>
          {saved && (
            <button 
              onClick={() => window.location.href = '/insights'}
              className="glass-button" 
              style={{ background: 'rgba(255,255,255,0.05)', gridColumn: 'span 2' }}
            >
              GENERATE PROJECT INTELLIGENCE →
            </button>
          )}
        </div>
      </div>

      {/* ──── PRINT-ONLY (INVESTMENT GRADE) ───────────────────────────────── */}
      <div className="print-only" style={{ color: '#000', padding: '10mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #000', paddingBottom: 20, marginBottom: 40 }}>
           <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>QC HUB</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666' }}>PROFESSIONAL AUDIT SERVICES</div>
           </div>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>EXECUTIVE SUMMARY</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>Dated: {new Date().toLocaleDateString('en-IN')}</div>
           </div>
        </div>

        <div style={{ marginBottom: 40 }}>
           <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>{form.entity_name || 'Project Prototype'}</h1>
           <p style={{ fontSize: '1.2rem', color: '#333' }}>Laundry Feasibility & ROI Analysis — {form.location || 'Location TBD'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
           <div style={{ background: '#f8fafc', padding: '20px' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>ANNUAL PROFIT</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{fmtLakh(r.annual_profit)}</div>
           </div>
           <div style={{ background: '#f8fafc', padding: '20px' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>INVESTMENT ROI</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{r.roi_percentage}%</div>
           </div>
           <div style={{ background: '#f8fafc', padding: '20px' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>PAYBACK</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{r.payback_months || '—'} Mo</div>
           </div>
           <div style={{ background: '#f8fafc', padding: '20px' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 800 }}>MARGIN</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{r.goi_percentage}%</div>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
           <div style={{ height: 250 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: 20 }}>OPEX BREAKDOWN</div>
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                       {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div style={{ height: 250 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: 20 }}>5-YEAR PROJECTION</div>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Bar dataKey="profit" fill="#10b981" />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* ──── RESTORED DATA DENSITY TABLES ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, borderTop: '2px solid #000', paddingTop: 40 }}>
           <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: 20, textTransform: 'uppercase' }}>Operational Parameters</div>
              <Table data={[
                ['Target Capacity', fmtKg(r.kg_per_day)],
                ['Industry Cluster', r.industry || 'General'],
                ['Machine Setup', (form.capacity || 0) + ' Units'],
                ['Shift Duration', (form.shift_h || 8) + ' Hours'],
                ['Billing Rate (Avg)', '₹ ' + (form.billing_rate_per_kg || 0) + ' / kg'],
                ['Working Days', '26 Days/Mo']
              ]} />
           </div>
           <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: 20, textTransform: 'uppercase' }}>Monthly Financial Audit</div>
              <Table data={[
                ['Gross Revenue', fmt(r.total_revenue)],
                ['Variable OPEX', fmt(r.total_variable_cost)],
                ['Power & Fuel', fmt(r.electricity_cost + r.gas_cost)],
                ['Labour Force', fmt(r.labour_monthly)],
                ['Linen Chemicals', fmt(r.chemical_cost)],
                ['Total Monthly GOI', fmt(r.gross_operating_income)],
                ['Net Profit Margin', r.goi_percentage + '%']
              ]} />
           </div>
        </div>

        <div style={{ marginTop: 40, background: '#f8fafc', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#666' }}>INVESTMENT RECOVERY TENURE</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{r.payback_months || '—'} MONTHS</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#666' }}>ESTIMATED ANNUAL RETURN</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{r.roi_percentage}% ROI</div>
              </div>
           </div>
        </div>

        <div style={{ marginTop: 60, borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.75rem', color: '#999', textAlign: 'center' }}>
           © {new Date().getFullYear()} Quality Control Hub (QC Hub) | This is a confidential financial simulation.
        </div>
      </div>
    </div>
  )
}

function Table({ data }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '10px 0', color: '#666' }}>{row[0]}</td>
            <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
