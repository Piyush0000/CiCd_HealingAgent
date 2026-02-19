import React from 'react'

function formatTimestamp(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function CITimeline({ timeline, iterationsUsed }) {
  const maxIterations = 5

  if (!timeline || timeline.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon card-icon-orange">📈</div>
            CI/CD Timeline
          </div>
        </div>
        <div className="empty-state" style={{ padding: '2rem' }}>
          <div className="empty-icon">📉</div>
          <div className="empty-title">No iterations recorded</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon card-icon-orange">📈</div>
          CI/CD Timeline
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)'
        }}>
          <span>{iterationsUsed} / {maxIterations}</span>
          <span style={{ color: 'var(--text-muted)' }}>iterations</span>
        </div>
      </div>

      {/* Iteration dots overview */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginRight: '4px' }}>RUNS:</span>
        {Array.from({ length: maxIterations }).map((_, i) => {
          const item = timeline[i]
          const passed = item?.status === 'PASSED'
          const exists = !!item
          return (
            <div key={i} style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              background: exists
                ? (passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)')
                : 'rgba(255,255,255,0.03)',
              border: `2px solid ${exists ? (passed ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--border-subtle)'}`,
              color: exists ? (passed ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-muted)',
              boxShadow: exists ? (passed ? '0 0 10px rgba(16,185,129,0.2)' : '0 0 10px rgba(239,68,68,0.15)') : 'none'
            }}>
              {exists ? (passed ? '✓' : '✗') : i + 1}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="progress-bar-wrap" style={{ height: '4px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${(iterationsUsed / maxIterations) * 100}%` }}
          />
        </div>
      </div>

      {/* Timeline items */}
      <div className="timeline">
        {timeline.map((item, idx) => {
          const isPassed = item.status === 'PASSED'
          return (
            <div className="timeline-item" key={idx}>
              <div className={`timeline-dot ${isPassed ? 'timeline-dot-passed' : 'timeline-dot-failed'}`}>
                {item.iteration}
              </div>
              <div className="timeline-content">
                <div className="timeline-title">
                  {isPassed ? '✅' : '❌'} Iteration {item.iteration} — {item.status}
                </div>
                <div className="timeline-time">
                  🕐 {formatTimestamp(item.timestamp)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Remaining empty iterations */}
        {Array.from({ length: maxIterations - timeline.length }).map((_, i) => (
          <div className="timeline-item" key={`empty-${i}`} style={{ opacity: 0.3 }}>
            <div className="timeline-dot" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '2px dashed var(--border-subtle)',
              color: 'var(--text-muted)'
            }}>
              {timeline.length + i + 1}
            </div>
            <div className="timeline-content">
              <div className="timeline-title" style={{ color: 'var(--text-muted)' }}>
                Iteration {timeline.length + i + 1} — Not reached
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
