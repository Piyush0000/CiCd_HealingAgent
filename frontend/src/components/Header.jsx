import React from 'react'

function Header() {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo">
          {/* Simple AI Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 8.5v.01" />
            <path d="M16 8l-2 3" />
            <path d="M12 16l-2-2" />
          </svg>
          Reparo
        </div>

        <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="status-dot"></div>
          Online
        </div>
      </div>
    </header>
  )
}

export default Header
