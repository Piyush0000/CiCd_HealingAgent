import React from 'react'
import ScorePanel from './ScorePanel'
import CITimeline from './CITimeline' // Need to ensure this also has white text
import FixesTable from './FixesTable'
import SummaryCard from './SummaryCard'

function ResultsDashboard({ result, onReset, events }) {
  if (!result) return null

  const isSuccess = result.finalStatus === 'PASSED'

  return (
    <div className="animate-enter" style={{ color: 'var(--text-main)' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: '#fff', /* Explicit White */
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            Mission Report
            <span style={{ 
              fontSize: '0.8rem', 
              background: isSuccess ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 0, 60, 0.1)',
              color: isSuccess ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${isSuccess ? 'var(--success)' : 'var(--danger)'}`,
              padding: '4px 12px',
              borderRadius: '2px',
              boxShadow: `0 0 10px ${isSuccess ? 'var(--success-glow)' : 'var(--danger-glow)'}`
            }}>
              {result.finalStatus}
            </span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            ID: <span style={{ color: 'var(--primary)' }}>{result.runId || 'UNK-001'}</span> // {(new Date()).toLocaleDateString()} // LEVEL 5 AUTHORIZATION
          </p>
        </div>
        
        {/* Reset Button (Top Right) */}
        <div>
           {/* Handled by parent but visible here if needed */}
        </div>
      </div>

      {/* Primary Grid (Summary Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <SummaryCard icon="⚠️" label="Failures" value={result.totalFailures} />
        <SummaryCard icon="🔧" label="Fixes" value={result.totalFixes} />
        <SummaryCard icon="🔄" label="Iterations" value={`${result.iterations || 0}/${result.maxIterations || 5}`} />
        <SummaryCard icon="⏱️" label="Time Taken" value={result.timeTaken || '0s'} />
      </div>

      {/* Secondary Detailed Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Left Column: Score & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="card">
            <h3>Performance Matrix</h3>
            <ScorePanel score={result.score} breakdown={result.scoreBreakdown} />
          </section>

          <section className="card">
            <h3>Execution Timeline</h3>
            <CITimeline 
              iterations={result.iterations} 
              maxIterations={result.maxIterations} 
              timeline={result.history} 
            />
          </section>
        </div>

        {/* Right Column: Details & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Target Intel Panel */}
          <section className="card">
            <h3>Target Intel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
               <div>
                 <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Repository</label>
                 <div style={{ color: 'var(--primary)', wordBreak: 'break-all', fontWeight: '700' }}>
                   {result.repoUrl || 'N/A'}
                 </div>
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Branch</label>
                 <div style={{ color: 'var(--success)', fontWeight: '700' }}>
                   {result.branchName || 'N/A'}
                 </div>
               </div>
            </div>
          </section>

          {/* Fix Operations Log */}
          <section className="card" style={{ flex: 1, minHeight: '300px' }}>
            <h3>Fix Operations Log</h3>
            <FixesTable fixes={result.fixes} />
          </section>
        </div>

      </div>
    </div>
  )
}

export default ResultsDashboard
