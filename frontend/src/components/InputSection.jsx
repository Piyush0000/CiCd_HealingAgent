import React from 'react'

const BRANCH_PREVIEW = (teamName, leaderName) => {
  if (!teamName && !leaderName) return 'TEAM_NAME_LEADER_NAME_AI_Fix'
  const t = (teamName || 'TEAM_NAME').toUpperCase().replace(/\s+/g, '_')
  const l = (leaderName || 'LEADER_NAME').toUpperCase().replace(/\s+/g, '_')
  return `${t}_${l}_AI_Fix`
}

export default function InputSection({ formData, setFormData, onSubmit, isRunning, currentIteration }) {
  const branchPreview = BRANCH_PREVIEW(formData.teamName, formData.leaderName)

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">
          <span>⚡</span>
          <span>v1.0.0 &nbsp;·&nbsp; AUTONOMOUS AI AGENT</span>
        </div>
        <h1 className="hero-title">
          Self-Healing<br />
          <span className="gradient-text">CI/CD Pipeline</span>
        </h1>
        <p className="hero-desc">
          Clones your repo, runs tests inside a sandbox, classifies bugs,
          applies deterministic fixes, and pushes a clean branch — fully autonomous.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">6</div>
            <div className="hero-stat-label">Bug Types</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">5</div>
            <div className="hero-stat-label">Max Retries</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">6</div>
            <div className="hero-stat-label">AI Agents</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">0</div>
            <div className="hero-stat-label">Human Inputs</div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon card-icon-cyan">🚀</div>
            Run Agent
          </div>
          {isRunning && currentIteration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '14px', height: '14px' }} />
              <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)' }}>
                Iteration {currentIteration.current}/{currentIteration.max}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="repoUrl">GitHub Repository URL</label>
            <input
              id="repoUrl"
              className="form-input"
              type="url"
              placeholder="https://github.com/username/repository"
              value={formData.repoUrl}
              onChange={handleChange('repoUrl')}
              disabled={isRunning}
              required
            />
            <span className="form-hint">Public or private repo with test suite</span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="teamName">Team Name</label>
              <input
                id="teamName"
                className="form-input"
                type="text"
                placeholder="e.g. Alpha Team"
                value={formData.teamName}
                onChange={handleChange('teamName')}
                disabled={isRunning}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="leaderName">Leader Name</label>
              <input
                id="leaderName"
                className="form-input"
                type="text"
                placeholder="e.g. John Doe"
                value={formData.leaderName}
                onChange={handleChange('leaderName')}
                disabled={isRunning}
                required
              />
            </div>
          </div>

          {/* Branch preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="form-label">Branch Preview</label>
            <div className="branch-badge" style={{ fontSize: '0.8rem', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <span>🌿</span>
              <span style={{ wordBreak: 'break-all' }}>{branchPreview}</span>
            </div>
          </div>

          <button
            id="run-agent-btn"
            className="btn btn-primary btn-lg btn-full"
            type="submit"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="spinner" />
                Agent Running...
              </>
            ) : (
              <>
                <span>⚡</span>
                Run Healing Agent
              </>
            )}
          </button>
        </form>

        {/* Progress bar */}
        {isRunning && currentIteration && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              <span>RETRY PROGRESS</span>
              <span>{currentIteration.current}/{currentIteration.max}</span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${(currentIteration.current / currentIteration.max) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Agent Architecture Info */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-title" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          <div className="card-icon card-icon-purple">🏗️</div>
          Multi-Agent Architecture
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { icon: '🎯', name: 'Orchestrator', desc: 'Coordinates all agents' },
            { icon: '📦', name: 'Repository', desc: 'Clone, branch, commit' },
            { icon: '🧪', name: 'Test Execution', desc: 'Run & parse tests' },
            { icon: '🔍', name: 'Analyzer', desc: 'Classify bug types' },
            { icon: '🔧', name: 'Fix Agent', desc: 'Apply deterministic fixes' },
            { icon: '📊', name: 'CI Monitor', desc: 'Track iterations' },
          ].map((agent) => (
            <div key={agent.name} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1rem' }}>{agent.icon}</span>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{agent.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{agent.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
