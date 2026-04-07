import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import PLCalculator from './pages/PLCalculator.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SiteSurvey from './pages/SiteSurvey.jsx'
import CostEstimator from './pages/CostEstimator.jsx'
import AIInsights from './pages/AIInsights.jsx'
import ProjectVault from './pages/ProjectVault.jsx'
import ExecutiveReport from './pages/ExecutiveReport.jsx'

const NAV = [
  { path: '/',          label: 'Dashboard',      icon: '󱓞' },
  { path: '/pl',        label: 'Profit & Loss',  icon: '󱔗' },
  { path: '/survey',    label: 'Site Survey',    icon: '󱝿' },
  { path: '/estimator', label: 'Cost Estimator', icon: '󱗆' },
  { path: '/insights',  label: 'AI Insights',    icon: '󱚧' },
  { path: '/vault',     label: 'Project Vault',  icon: '󱓡' },
]

const COMING = []

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        
        {/* ──── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{
          width: collapsed ? 80 : 260,
          background: 'rgba(13, 15, 20, 0.4)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}>
          {/* Logo Section */}
          <div style={{
            padding: '32px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg, var(--accent), #4ade80)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 800, color: '#061706',
              boxShadow: '0 4px 20px rgba(136, 231, 136, 0.3)',
              fontFamily: 'var(--font-head)',
              flexShrink: 0,
            }}>Q</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>QC Hub</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>Control Platform</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav style={{ padding: '8px 12px', flex: 1 }}>
            {!collapsed && <div style={{ fontSize: '0.65rem', color: 'var(--text-min)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 16px', marginBottom: 12 }}>Modules</div>}
            {NAV.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 14,
                padding: collapsed ? '12px 0' : '12px 16px',
                borderRadius: 12, marginBottom: 4,
                textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600,
                color: isActive ? 'var(--text)' : 'var(--text-dim)',
                background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}>
                <span style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{item.icon}</span>
                {!collapsed && item.label}
              </NavLink>
            ))}

            {!collapsed && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-min)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 16px', marginBottom: 12 }}>Coming Soon</div>
                {COMING.map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 12, marginBottom: 4,
                    color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.9rem', fontWeight: 500,
                    cursor: 'default',
                  }}>
                    <span style={{ fontSize: '1.3rem', filter: 'grayscale(1)' }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* Collapse Toggle */}
          <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setCollapsed(c => !c)} style={{
              width: '100%', padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text-dim)', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600,
              transition: 'all 0.2s',
            }}>
              {collapsed ? '→' : '← Hide Sidebar'}
            </button>
          </div>
        </aside>

        {/* ──── Main Content ────────────────────────────────────────── */}
        <main style={{ 
          flex: 1, 
          height: '100vh',
          overflowY: 'auto',
          position: 'relative',
        }}>
          {/* Subtle page-top glow */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: '400px',
            background: 'radial-gradient(circle, rgba(136, 231, 136, 0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/pl"        element={<PLCalculator />} />
            <Route path="/survey"    element={<SiteSurvey />} />
            <Route path="/estimator" element={<CostEstimator />} />
            <Route path="/insights"  element={<AIInsights />} />
            <Route path="/vault"     element={<ProjectVault />} />
            <Route path="/report/:type/:id" element={<ExecutiveReport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
