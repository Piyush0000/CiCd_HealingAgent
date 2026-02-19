import React from 'react'

const BUG_ICONS = {
  LINTING: '🔶',
  SYNTAX: '🔴',
  LOGIC: '🟣',
  TYPE_ERROR: '🟠',
  IMPORT: '🔵',
  INDENTATION: '🟢'
}

function truncate(str, max) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '...' : str
}

function formatCommitMsg(msg) {
  if (!msg) return '—'
  const parts = msg.split('] ')
  if (parts.length > 1) {
    return (
      <>
        <span className="ai-prefix">[AI-AGENT]</span>
        {' ' + parts.slice(1).join('] ')}
      </>
    )
  }
  return msg
}

export default function FixesTable({ fixes }) {
  if (!fixes || fixes.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem' }}>
        <div className="empty-icon">🎉</div>
        <div className="empty-title">No Fixes Applied</div>
        <div className="empty-desc">All tests passed on the first run!</div>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="fixes-table">
        <thead>
          <tr>
            <th>#</th>
            <th>File</th>
            <th>Bug Type</th>
            <th style={{ textAlign: 'center' }}>Line</th>
            <th>Commit Message</th>
            <th style={{ textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {fixes.map((fix, idx) => (
            <tr key={idx}>
              <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', width: '40px' }}>
                {String(idx + 1).padStart(2, '0')}
              </td>
              <td className="file-cell" title={fix.file}>
                📄 {truncate(fix.file?.split(/[\\/]/).pop() || fix.file, 28)}
              </td>
              <td>
                <span className={`bug-badge bug-${fix.bugType}`}>
                  {BUG_ICONS[fix.bugType] || '⚪'} {fix.bugType}
                </span>
              </td>
              <td className="line-cell">{fix.line || '—'}</td>
              <td className="commit-cell" title={fix.commitMessage}>
                {formatCommitMsg(fix.commitMessage)}
              </td>
              <td style={{ textAlign: 'center' }}>
                {fix.status === 'Fixed' ? (
                  <span className="status-cell-fixed">
                    ✅ Fixed
                  </span>
                ) : (
                  <span className="status-cell-failed">
                    ❌ Failed
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
