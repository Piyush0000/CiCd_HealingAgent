import React from 'react'

export default function ScorePanel({ result }) {
  const { score, scoreBreakdown } = result
  const clampedScore = Math.max(0, Math.min(120, score))
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedScore / 120) * circumference

  const getScoreColor = (s) => {
    if (s >= 100) return 'url(#scoreGradient)'
    if (s >= 70) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreGrade = (s) => {
    if (s >= 110) return 'S+'
    if (s >= 100) return 'A'
    if (s >= 80) return 'B'
    if (s >= 60) return 'C'
    return 'D'
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon card-icon-purple">🏆</div>
          Performance Score
        </div>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: '900',
          padding: '4px 12px',
          borderRadius: '6px',
          background: 'rgba(124,58,237,0.1)',
          color: '#a78bfa',
          fontFamily: 'var(--font-mono)'
        }}>
          {getScoreGrade(score)}
        </span>
      </div>

      <div className="score-panel">
        <div className="score-circle">
          <svg className="score-svg" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <circle
              className="score-bg"
              cx="50"
              cy="50"
              r={radius}
            />
            <circle
              className="score-progress"
              cx="50"
              cy="50"
              r={radius}
              stroke={getScoreColor(score)}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="score-text-center">
            <span className="score-number">{score}</span>
            <span className="score-label">/ 120</span>
          </div>
        </div>

        <div className="score-breakdown">
          <div className="score-row">
            <span className="score-row-label">Base Score</span>
            <span className="score-row-value neutral">+{scoreBreakdown?.base ?? 100}</span>
          </div>
          <div className="score-divider" />
          <div className="score-row">
            <span className="score-row-label">Time Bonus (&lt;5 min)</span>
            <span className={`score-row-value ${(scoreBreakdown?.timeBonus ?? 0) > 0 ? 'positive' : 'neutral'}`}>
              {(scoreBreakdown?.timeBonus ?? 0) > 0 ? '+' : ''}{scoreBreakdown?.timeBonus ?? 0}
            </span>
          </div>
          <div className="score-divider" />
          <div className="score-row">
            <span className="score-row-label">Commit Penalty (&gt;20)</span>
            <span className={`score-row-value ${(scoreBreakdown?.commitPenalty ?? 0) < 0 ? 'negative' : 'neutral'}`}>
              {scoreBreakdown?.commitPenalty ?? 0}
            </span>
          </div>
          <div className="score-divider" />
          <div className="score-row" style={{ fontWeight: '800' }}>
            <span className="score-row-label" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Final Score</span>
            <span className="score-row-value positive" style={{ fontSize: '1rem' }}>{score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
