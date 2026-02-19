import React from 'react'

export default function SummaryCard({ result, formatTime }) {
  const isPassed = result.finalStatus === 'PASSED'

  const stats = [
    {
      icon: '🐛',
      value: result.totalFailures,
      label: 'Total Failures',
      valueClass: result.totalFailures > 0 ? 'stat-value-red' : 'stat-value-green'
    },
    {
      icon: '🔧',
      value: result.totalFixes,
      label: 'Fixes Applied',
      valueClass: 'stat-value-green'
    },
    {
      icon: '🔁',
      value: `${result.iterationsUsed}/5`,
      label: 'Iterations Used',
      valueClass: 'stat-value-orange'
    },
    {
      icon: '⏱️',
      value: formatTime(result.timeTaken),
      label: 'Time Taken',
      valueClass: 'stat-value-cyan'
    },
    {
      icon: '🏆',
      value: result.score,
      label: 'Score',
      valueClass: 'stat-value-purple'
    },
    {
      icon: isPassed ? '✅' : '❌',
      value: result.finalStatus,
      label: 'Final Status',
      valueClass: isPassed ? 'stat-value-green' : 'stat-value-red'
    }
  ]

  return (
    <div className="summary-grid">
      {stats.map((stat, idx) => (
        <div className="stat-card" key={idx}>
          <span className="stat-icon">{stat.icon}</span>
          <div className={`stat-value ${stat.valueClass}`} style={{ fontSize: typeof stat.value === 'string' && stat.value.length > 5 ? '1.2rem' : '2rem' }}>
            {stat.value}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
