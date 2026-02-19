import React from 'react'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">🤖</div>
          <div className="logo-text">
            <span className="logo-title">CI/CD Healing Agent</span>
            <span className="logo-sub">Autonomous DevOps AI</span>
          </div>
        </div>

        <div className="header-badge">
          <div className="status-dot" />
          <span className="status-text">AGENT READY</span>
        </div>
      </div>
    </header>
  )
}
