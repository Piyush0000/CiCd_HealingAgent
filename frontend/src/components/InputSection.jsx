import React, { useState } from 'react'


function InputSection({ formData, setFormData, onSubmit, isRunning }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [teamName, setTeamName] = useState('')
  const [leaderName, setLeaderName] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'repoUrl') setRepoUrl(value)
    if (name === 'teamName') setTeamName(value)
    if (name === 'leaderName') setLeaderName(value)
    
    // Pass back to parent
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generate preview of branch name
  const branchPreview = teamName && leaderName 
    ? `${teamName.toUpperCase().replace(/\s+/g, '_')}_${leaderName.toUpperCase().replace(/\s+/g, '_')}_AI_Fix`
    : 'TEAM_LEADER_AI_Fix'

  return (
    <div className="input-section">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Start New Run</h2>
      
      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="repoUrl">GitHub Repository URL</label>
          <input
            type="url"
            id="repoUrl"
            name="repoUrl"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={handleChange}
            required
            disabled={isRunning}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Public or private repo with test suite
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label htmlFor="teamName">Team Name</label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              placeholder="e.g. Alpha Team"
              value={teamName}
              onChange={handleChange}
              required
              disabled={isRunning}
            />
          </div>
          <div className="input-group">
            <label htmlFor="leaderName">Leader Name</label>
            <input
              type="text"
              id="leaderName"
              name="leaderName"
              placeholder="e.g. Jane Doe"
              value={leaderName}
              onChange={handleChange}
              required
              disabled={isRunning}
            />
          </div>
        </div>

        <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Branch Preview</label>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.25rem', wordBreak: 'break-all' }}>
            🌿 {branchPreview}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isRunning || !repoUrl || !teamName || !leaderName}
          style={{ width: '100%', padding: '0.875rem' }}
        >
          {isRunning ? (
            <>
              <span className="spinner" style={{ marginRight: '0.5rem' }}>🔄</span> Agent Running...
            </>
          ) : (
            'Run Healing Agent'
          )}
        </button>
      </form>
    </div>
  )
}

export default InputSection
