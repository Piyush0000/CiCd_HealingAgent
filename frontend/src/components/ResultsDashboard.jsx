import React from 'react'
import SummaryCard from './SummaryCard'
import ScorePanel from './ScorePanel'
import FixesTable from './FixesTable'
import CITimeline from './CITimeline'
import EventLog from './EventLog'

export default function ResultsDashboard({ result, onReset, events }) {
  const isPassed = result.finalStatus === 'PASSED'

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="results-section">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <span>📊</span> Agent <span>Results</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className={`status-badge ${isPassed ? 'status-passed' : 'status-failed'}`}>
            <span>{isPassed ? '✅' : '❌'}</span>
            {result.finalStatus}
          </div>
          <button
            id="reset-btn"
            className="btn btn-primary"
            onClick={onReset}
            style={{ padding: '10px 20px', fontSize: '0.875rem' }}
          >
            <span>↩</span> New Run
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <SummaryCard result={result} formatTime={formatTime} />

      {/* Score + CI Timeline row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)', gap: '1.5rem' }}>
        <ScorePanel result={result} />
        <CITimeline timeline={result.ciTimeline} iterationsUsed={result.iterationsUsed} />
      </div>

      {/* Repo + Branch info */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div className="card-title">
            <div className="card-icon card-icon-cyan">🔗</div>
            Run Details
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Repository</span>
            <div className="repo-info">
              <span>🐙</span>
              <span>{result.repoUrl}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Branch Created</span>
            <div className="branch-badge" style={{ display: 'inline-flex', fontSize: '0.82rem', padding: '8px 14px' }}>
              <span>🌿</span>
              <span>{result.branch}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixes Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon card-icon-green">🔧</div>
            Fixes Applied
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {result.fixes?.filter(f => f.status === 'Fixed').length} / {result.fixes?.length} successful
          </span>
        </div>
        <FixesTable fixes={result.fixes || []} />
      </div>

      {/* Event Log replay */}
      {events && events.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon card-icon-orange">📜</div>
              Agent Event Log
            </div>
          </div>
          <EventLog events={events} isRunning={false} currentIteration={null} />
        </div>
      )}
    </div>
  )
}
