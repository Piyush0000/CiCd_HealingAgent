import React from 'react'

function SummaryCard({ icon, label, value }) {
  return (
    <div className="card" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection: 'column', 
      gap: '8px', 
      background: 'var(--bg-card)', 
      border: '1px solid var(--border)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Icon */}
      <div style={{ fontSize: '1.5rem', opacity: 0.8, filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }}>
        {icon}
      </div>
      
      {/* Value */}
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: '800', 
        fontFamily: 'var(--font-mono)', 
        color: '#ffffff', /* Explicit White */
        textShadow: '0 0 15px rgba(255,255,255,0.1)',
        lineHeight: '1.1'
      }}>
        {value}
      </div>
      
      {/* Label */}
      <div style={{ 
        textTransform: 'uppercase', 
        fontSize: '0.7rem', 
        letterSpacing: '0.15em', 
        color: 'var(--primary)', /* Neon Orange */
        fontWeight: '700',
        marginTop: '0.25rem'
      }}>
        {label}
      </div>
    </div>
  )
}

export default SummaryCard
