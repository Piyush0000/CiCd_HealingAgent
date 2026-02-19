import React, { useEffect, useRef } from 'react'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function EventLog({ events, isRunning, currentIteration }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon card-icon-orange">📡</div>
          Live Agent Feed
          {isRunning && <div className="spinner" style={{ width: '14px', height: '14px', marginLeft: '4px' }} />}
        </div>
        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {events.length} events
        </span>
      </div>

      {currentIteration && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          marginBottom: '1rem',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ color: 'var(--accent-orange)' }}>⟳ ITERATION {currentIteration.current}/{currentIteration.max}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: currentIteration.max }).map((_, i) => (
              <div key={i} className="progress-dot" style={{
                background: i < currentIteration.current ? 'var(--accent-orange)' : 'var(--border-subtle)',
                width: '8px',
                height: '8px',
                borderRadius: '50%'
              }} />
            ))}
          </div>
        </div>
      )}

      <div className="event-log" style={{ flex: 1 }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏳</div>
            <div>Waiting for agent events...</div>
          </div>
        ) : (
          <>
            {events.map((event) => (
              <div key={event.id} className="event-item">
                <span className="event-time">{formatTime(event.ts)}</span>
                <span className={`event-type-badge event-type-${event.type}`}>{event.type}</span>
                <span className="event-msg">{event.message}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  )
}
