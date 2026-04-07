import { useState, useEffect } from 'react'
import { api } from '../api'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import ProjectLoader from '../components/ProjectLoader'

const InsightCard = ({ data }) => {
  const colors = {
    risk: { bg: 'rgba(248, 113, 113, 0.05)', border: 'rgba(248, 113, 113, 0.2)', text: '#f87171', icon: '⚠' },
    opportunity: { bg: 'rgba(251, 191, 36, 0.05)', border: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24', icon: '⚡' },
    strategy: { bg: 'rgba(136, 231, 136, 0.05)', border: 'rgba(136, 231, 136, 0.2)', text: 'var(--accent)', icon: '◈' }
  }
  const theme = colors[data.type] || colors.strategy

  return (
    <div className="glass-card animate-fade" style={{ padding: '24px', marginBottom: 16, background: theme.bg, border: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: theme.text, fontSize: '1.2rem', fontWeight: 900 }}>{theme.icon}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: theme.text, letterSpacing: '0.1em' }}>{data.type} · {data.severity}</span>
         </div>
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>{data.title}</h4>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 20 }}>{data.desc}</p>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
         <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Recommended Action:</span>
         <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{data.action}</span>
      </div>
    </div>
  )
}

export default function AIInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const runAnalysis = async (selectedData = null) => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (selectedData) {
        res = await api.analyzeInsights(selectedData)
      } else {
        res = await api.getLatestInsights()
      }
      if (res.error) throw new Error(res.error)
      setData(res)
    } catch (e) {
      console.error(e)
      setError(e.message || "Failed to load intelligence data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [])

  const handleEntitySelect = async (project) => {
    const name = project.entity_name || project.name
    setLoading(true)
    try {
      const all = await api.getVaultProjects()
      const matches = all.filter(p => (p.entity_name || p.name) === name)
      
      const plData = matches.find(m => m.type === 'financial')
      const surveyData = matches.find(m => m.type === 'technical')
      const estimateData = matches.find(m => m.type === 'budget')

      await runAnalysis({
        pl_data: plData,
        survey_data: surveyData,
        estimate_data: estimateData
      })
    } catch (err) {
      console.error(err)
      setError("Failed to coordinate project data.")
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
       RUNNING MULTI-MODULE ANALYSIS...
    </div>
  )

  const ErrorState = () => (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
       <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
       <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 12 }}>No Active Project Found</h2>
       <p style={{ color: 'var(--text-dim)', maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>
          To generate AI Insights, you must first complete a **Profit & Loss** calculation or a **Site Survey**.
       </p>
       <a href="/pl" style={{ padding: '14px 32px', background: 'var(--accent)', borderRadius: 12, color: '#061706', fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem' }}>
          START P&L AUDIT
       </a>
       <div style={{ marginTop: 40, width: '100%', maxWidth: 400 }}>
          <ProjectLoader onSelect={handleEntitySelect} />
       </div>
    </div>
  )

  if (error || !data) return <ErrorState />

  return (
    <div style={{ padding: '64px 48px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ──── Header ──── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em' }}>INTELLIGENCE / {data.entity_name ? data.entity_name.toUpperCase() : 'DIAGNOSTICS'}</span>
            </div>
            <h1 style={{ fontSize: '2.55rem', fontWeight: 900, lineHeight: 1.1 }}>Project Intelligence</h1>
          </div>
          <div style={{ width: 350 }}>
             <ProjectLoader onSelect={handleEntitySelect} />
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', marginTop: 8, fontSize: '1rem', maxWidth: 500 }}>
          Real-time cross-correlation of financial, technical, and logistical laundry data.
        </p>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 40, alignItems: 'start' }}>
        
        {/* ──── Charts and Health ──── */}
        <div style={{ position: 'sticky', top: 40 }}>
           <div className="glass-card" style={{ padding: '32px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 16 }}>Project Health Radar</div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 800 }} />
                    <Radar dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 24, padding: '16px', background: data.overall_health === 'WARNING' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(136, 231, 136, 0.1)', borderRadius: 12 }}>
                 <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Overall Assessment</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 900, color: data.overall_health === 'WARNING' ? '#f87171' : 'var(--accent)', marginTop: 4 }}>{data.overall_health}</div>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', color: 'var(--text)' }}>Diagnostic Summary</h4>
              <div style={{ spaceY: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Anomalies Detected</span>
                    <span style={{ fontWeight: 800, color: '#f87171' }}>{data.insights.filter(i => i.type === 'risk').length}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Growth Opportunities</span>
                    <span style={{ fontWeight: 800, color: '#fbbf24' }}>{data.insights.filter(i => i.type === 'opportunity').length}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 0' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Strategic Recommendations</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{data.insights.filter(i => i.type === 'strategy').length}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* ──── Insights Feed ──── */}
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: '1.4rem' }}>🧠</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>Actionable Insights</h3>
           </div>
           {data.insights.map((insight, i) => (
             <InsightCard key={i} data={insight} />
           ))}
        </div>

      </div>
    </div>
  )
}
