import React from 'react'

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️'
}

export default function Toast({ message, type = 'info' }) {
  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <span>{ICONS[type] || 'ℹ️'}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
