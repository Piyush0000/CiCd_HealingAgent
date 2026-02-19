import React, { useRef, useEffect } from 'react'

function EventLog({ events, isRunning, currentIteration }) {
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events])

  return (
    <div className="terminal-window" ref={logRef}>
      {events.length === 0 && (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem', fontStyle: 'italic' }}>
          Waiting for agent to start...
        </div>
      )}
      
      {events.map((e, i) => (
        <div key={i} className="log-entry animate-enter">
          <span className="log-ts">
            {new Date(e.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className={`log-type type-${e.type}`} style={{ fontWeight: '600', marginRight: '0.5rem', minWidth: '80px', display: 'inline-block' }}>
            {e.type}
          </span>
          <span className="log-msg">
            {e.message}
          </span>
        </div>
      ))}

      {isRunning && (
        <div className="log-entry animate-enter">
          <span className="log-ts">...</span>
          <span className="log-msg" style={{ fontStyle: 'italic', opacity: 0.7 }}>Agent thinking...</span>
        </div>
      )}
    </div>
  )
}

export default EventLog
