import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const fmt = (v) => '₹ ' + (v || 0).toLocaleString('en-IN')
const fmtLakh = (n) => '₹ ' + ((n || 0) / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' L'

export default function ExecutiveReport() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [primary, setPrimary] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const main = await api.getProjectDetail(type, id)
      setPrimary(main)
      
      const all = await api.getVaultProjects()
      const matches = all.filter(p => 
        p.entity_name === (main.entity_name || main.name) && 
        (p.type !== type || p.id !== parseInt(id))
      )
      setRelated(matches)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [type, id])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <div className="p-20 text-center color-dim">GENERATING EXECUTIVE DOSSIER...</div>
  if (!primary) return <div className="p-20 text-center">Project not found.</div>

  // Data Synthesis
  const pl = type === 'financial' ? primary : related.find(r => r.type === 'financial')
  const survey = type === 'technical' ? primary : related.find(r => r.type === 'technical')
  const budget = type === 'budget' ? primary : related.find(r => r.type === 'budget')

  const handlePrint = () => window.print()

  return (
    <div className="report-container" style={{ background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      {/* ──── SCREEN ACTIONS ────────────────────────────────────── */}
      <div className="no-print" style={{ 
        position: 'fixed', top: 20, right: 20, z_index: 1000, 
        display: 'flex', gap: 10, background: 'rgba(0,0,0,0.8)', padding: 12, borderRadius: 12, backdropFilter: 'blur(10px)'
      }}>
        <button onClick={() => navigate('/vault')} style={{ background: 'transparent', border: '1px solid #444', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>BACK TO VAULT</button>
        <button onClick={handlePrint} style={{ background: '#10b981', border: 'none', color: '#000', fontWeight: 800, padding: '8px 24px', borderRadius: 6, cursor: 'pointer' }}>PRINT MASTER REPORT (PDF)</button>
      </div>

      {/* ──── PAGE 1: EXECUTIVE FINANCIAL SUMMARY ───────────────── */}
      <div className="report-page" style={{ padding: '20mm', pageBreakAfter: 'always', minHeight: '290mm' }}>
        <Header title="EXECUTIVE FINANCIAL PROPOSAL" date={primary.created_at} />
        
        <section style={{ marginBottom: 60 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981', marginBottom: 8, letterSpacing: '0.1em' }}>PROJECT ASSET</div>
          <h1 style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1 }}>{primary.entity_name || primary.name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginTop: 10 }}>Operational Feasibility & Infrastructure Audit — {primary.location}</p>
        </section>

        {pl ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 60 }}>
              <StatCard label="Annual Profit" value={fmtLakh(pl.annual_profit)} color="#10b981" />
              <StatCard label="Investment ROI" value={pl.roi_percentage + '%'} />
              <StatCard label="Profit Margin" value={pl.goi_percentage + '%'} />
              <StatCard label="Payback Time" value={(pl.payback_months || '—') + ' Mo'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
               <div>
                  <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: 10, marginBottom: 20 }}>FINANCIAL OUTLOOK</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#444' }}>
                    Based on the target capacity of <strong>{(pl.kg_per_day || 0).toLocaleString()} KG/Day</strong>, this project demonstrates strong fiscal viability. 
                    The operational model forecasts a stable <strong>{pl.goi_percentage}%</strong> Gross Operating Income, with full capital recovery within <strong>{pl.payback_months || 'N/A'} months</strong>.
                  </p>
               </div>
               <div style={{ height: 200, background: '#f8fafc', borderRadius: 12, padding: 20 }}>
                  {/* Small ROI Indicator placeholder */}
                  <div style={{ textAlign: 'center', paddingTop: 40 }}>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981' }}>{pl.roi_percentage}%</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#666' }}>PROJECTED ANNUAL RETURN</div>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 40, background: '#fff5f5', borderRadius: 12, borderLeft: '4px solid #f87171' }}>
            <strong>Financial Data Missing:</strong> Please complete a P&L simulation for this project to unlock the financial summary page.
          </div>
        )}

        <Footer />
      </div>

      {/* ──── PAGE 2: TECHNICAL READINESS ───────────────────────── */}
      <div className="report-page" style={{ padding: '20mm', pageBreakAfter: 'always', minHeight: '290mm' }}>
        <Header title="TECHNICAL SITE AUDIT" date={primary.created_at} />
        
        {survey ? (
          <div style={{ marginTop: 40 }}>
            <div style={{ background: '#000', color: '#fff', padding: '32px', borderRadius: 12, marginBottom: 40 }}>
               <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6 }}>SYSTEM READINESS SCORE</div>
               <div style={{ fontSize: '3rem', fontWeight: 900 }}>{survey.readiness_score}%</div>
               <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{survey.readiness_status}</div>
            </div>

            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: 10, marginBottom: 20 }}>UTILITY SPECIFICATIONS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
               <Table data={[
                 ['Electrical Load', survey.available_kw + ' kW'],
                 ['Water Entry', survey.water_inlet_size + ' "'],
                 ['Entry Width', survey.entry_width + ' mm'],
                 ['Floor Capacity', survey.floor_loading_ok ? 'VERIFIED' : 'ACTION REQ']
               ]} />
               <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, fontSize: '0.85rem' }}>
                  <strong>Consultant Remarks:</strong><br />
                  The site infrastructure is currently <strong>{survey.readiness_score}%</strong> compatible with the target machinery mix. 
                  {survey.available_kw < 50 ? " Power upgrades may be required for full industrial operations." : " Standard utilities are sufficient for the proposed setup."}
               </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, background: '#fefce8', borderRadius: 12, borderLeft: '4px solid #eab308' }}>
            <strong>Technical Data Missing:</strong> No site survey found for this entity. Detailed engineering specs cannot be generated.
          </div>
        )}

        <Footer />
      </div>

      {/* ──── PAGE 3: MACHINERY MIX & INVESTMENT ─────────────────── */}
      <div className="report-page" style={{ padding: '20mm', minHeight: '290mm' }}>
        <Header title="MACHINERY MIX & CAPEX" date={primary.created_at} />
        
        {budget ? (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: 10, marginBottom: 20 }}>PROPOSED INFRASTRUCTURE</h3>
            <Table data={JSON.parse(budget.items_json || '[]').map(i => [i.name, 'QTY: ' + i.qty])} />
            
            <div style={{ marginTop: 40, background: '#f8fafc', padding: '32px', borderRadius: 12, textAlign: 'right' }}>
               <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666' }}>ESTIMATED TOTAL CAPEX</div>
               <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{fmt(budget.grand_total)}</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, background: '#f0f9ff', borderRadius: 12, borderLeft: '4px solid #3b82f6' }}>
            <strong>Budget Data Missing:</strong> Machinery recommendation has not been generated for this project.
          </div>
        )}

        <Footer />
      </div>

    </div>
  )
}

function Header({ title, date }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #000', paddingBottom: 24, marginBottom: 50 }}>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>QC HUB</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#666', letterSpacing: '0.1em' }}>INDUSTRIAL ADVISORY</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: '0.7rem', color: '#666' }}>{new Date(date).toLocaleDateString('en-IN')}</div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.7rem', color: '#999', textAlign: 'center' }}>
      © {new Date().getFullYear()} Quality Control Hub | Confidential Executive Report | System Authenticated.
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#f8fafc', padding: '24px 16px', borderRadius: 8, borderLeft: color ? `4px solid ${color}` : 'none' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{value}</div>
    </div>
  )
}

function Table({ data }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '12px 0', color: '#444' }}>{row[0]}</td>
            <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
