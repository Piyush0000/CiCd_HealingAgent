import React from 'react'

function FixesTable({ fixes = [] }) {
  if (!fixes || fixes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
        No fixes were required. All clear.
      </div>
    )
  }

  const getBadgeClass = (type) => {
     if (type === 'SYNTAX') return 'badge-syntax'
     if (type === 'LINTING') return 'badge-lint'
     return 'badge-import'
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        <thead style={{ borderBottom: '2px solid var(--border)' }}>
          <tr style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Location</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {fixes.map((fix, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
              <td style={{ padding: '10px' }}>
                <span className={`badge ${getBadgeClass(fix.bugType || fix.type)}`}>
                  {fix.bugType || fix.type || 'UNKNOWN'}
                </span>
              </td>
              <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                {fix.file === 'unknown' ? (
                  <span style={{ color: 'var(--warning)', fontSize: '0.75rem', border: '1px solid var(--warning-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                    ⚠️ Parsing Failed
                  </span>
                ) : (
                  `${fix.file}:${fix.line}`
                )}
              </td>
              <td style={{ padding: '10px', color: 'var(--text-main)' }}>
                {fix.action || fix.description || 'No details'}
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                {fix.status === 'Fixed' ? <span style={{ color: 'var(--success)' }}>✅</span> : <span style={{ color: 'var(--danger)' }}>❌</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FixesTable
