const rawBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`
const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5000'

export const api = {
  // P&L Calculator
  calculate: async (data) => {
    const res = await fetch(`${API_BASE}/pl/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Calculation failed')
    return res.json()
  },

  saveProject: async (data) => {
    const res = await fetch(`${API_BASE}/pl/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Save failed')
    return res.json()
  },

  getProjects: async () => {
    const res = await fetch(`${API_BASE}/pl/projects`)
    if (!res.ok) throw new Error('Failed to fetch projects')
    return res.json()
  },

  deleteProject: async (id) => {
    const res = await fetch(`${API_BASE}/pl/projects/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Delete failed')
    return res.json()
  },

  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`)
    return res.json()
  },

  // Site Survey
  auditSurvey: async (data) => {
    const res = await fetch(`${API_BASE}/survey/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Audit failed')
    return res.json()
  },

  saveSurvey: async (data) => {
    const res = await fetch(`${API_BASE}/survey/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Survey save failed')
    return res.json()
  },

  // Cost Estimator
  recommendEstimate: async (data) => {
    const res = await fetch(`${API_BASE}/estimate/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Recommendation failed')
    return res.json()
  },

  saveEstimate: async (data) => {
    const res = await fetch(`${API_BASE}/estimate/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Estimate save failed')
    return res.json()
  },

  // AI Insights
  analyzeInsights: async (data) => {
    const res = await fetch(`${API_BASE}/insights/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Insight analysis failed')
    return res.json()
  },

  getLatestInsights: async () => {
    const res = await fetch(`${API_BASE}/insights/latest`)
    if (!res.ok) throw new Error('Failed to fetch latest insights')
    return res.json()
  },

  // Sustainability
  analyzeSustainability: async (data) => {
    const res = await fetch(`${API_BASE}/sustainability/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Sustainability analysis failed')
    return res.json()
  },

  saveSustainability: async (data) => {
    const res = await fetch(`${API_BASE}/sustainability/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Sustainability save failed')
    return res.json()
  },

  // Project Vault
  getVaultProjects: async () => {
    const res = await fetch(`${API_BASE}/projects/all`)
    if (!res.ok) throw new Error('Failed to fetch vault projects')
    return res.json()
  },

  getProjectDetail: async (type, id) => {
    const res = await fetch(`${API_BASE}/projects/detail/${type}/${id}`)
    if (!res.ok) throw new Error('Failed to fetch project detail')
    return res.json()
  },

  deleteVaultProject: async (type, id) => {
    let endpoint = `/pl/projects/${id}`
    if (type === 'technical') endpoint = `/survey/projects/${id}`
    if (type === 'budget')    endpoint = `/estimate/projects/${id}`
    if (type === 'green')     endpoint = `/sustainability/projects/${id}`
    
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    return res.json()
  }
}
