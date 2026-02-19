import React from 'react'

const ScorePanel = ({ score, breakdown }) => {
  // Score Logic
  const isHigh = score >= 90
  const isMed = score >= 70 && score < 90

  const color = isHigh ? 'var(--success)' : (isMed ? 'var(--warning)' : 'var(--danger)')
  const glow = isHigh ? 'var(--success-glow)' : (isMed ? 'var(--warning-glow)' : 'var(--danger-glow)')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: 'white' }}>
      
      {/* Reactor Core Score Badge */}
      <div style={{ 
        position: 'relative', 
        width: '120px', 
        height: '120px', 
        borderRadius: '50%', 
        border: `3px solid ${color}`,
        boxShadow: `0 0 20px ${glow}`,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }}>
        <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'white', textShadow: `0 0 10px ${color}` }}>
          {score}
        </span>
        <div style={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text-secondary)', marginTop: '5px' }}>
          Grade
        </div>
      </div>

      {/* Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
         <BreakdownItem label="Time Bonus" value="+10" />
         <BreakdownItem label="Accuracy" value="100%" />
         <BreakdownItem label="Commit Penalty" value="0" />
         <BreakdownItem label="Base Score" value="100" />
      </div>
    </div>
  )
}

function BreakdownItem({ label, value }) {
  return (
    <div style={{ background: '#111', padding: '10px', borderRadius: '4px', textAlign: 'center', border: '1px solid #222' }}>
      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{value}</div>
    </div>
  )
}

export default ScorePanel
