import { useState } from 'react'

function AttackLog({ attacks, compact }) {
  const [expandedId, setExpandedId] = useState(null)

  if (!attacks || attacks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛡️</div>
        <div className="empty-text">No attacks detected</div>
        <div className="empty-sub">The WAF is actively monitoring all traffic</div>
      </div>
    )
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="attack-log-wrapper">
      <table className="attack-log-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>ID</th>
            <th>Type</th>
            <th>Severity</th>
            <th>IP</th>
            {!compact && <th>Method</th>}
            {!compact && <th>Path</th>}
          </tr>
        </thead>
        <tbody>
          {attacks.map((attack) => (
            <>
              <tr key={attack.id} onClick={() => toggleExpand(attack.id)}>
                <td className="col-time">{formatTime(attack.timestamp)}</td>
                <td className="col-id">{attack.id?.slice(0, 12)}...</td>
                <td>{attack.name || attack.type}</td>
                <td>
                  <span className={`severity-badge ${attack.severity}`}>
                    {attack.severity}
                  </span>
                </td>
                <td className="col-ip">{attack.ip}</td>
                {!compact && <td className={`col-method ${attack.method}`}>{attack.method}</td>}
                {!compact && <td className="col-path" title={attack.path}>{attack.path}</td>}
              </tr>
              {expandedId === attack.id && (
                <tr key={`${attack.id}-detail`} className="attack-detail-row">
                  <td colSpan={compact ? 5 : 7}>
                    <div className="attack-detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Attack Type</span>
                        <span className="detail-value">{attack.name || attack.type}</span>
                      </div>
                      {attack.mitre && (
                        <div className="detail-item">
                          <span className="detail-label">MITRE ATT&CK</span>
                          <span className="detail-value">{attack.mitre}</span>
                        </div>
                      )}
                      {attack.owasp && (
                        <div className="detail-item">
                          <span className="detail-label">OWASP Category</span>
                          <span className="detail-value">{attack.owasp}</span>
                        </div>
                      )}
                      {attack.matchedPattern && (
                        <div className="detail-item">
                          <span className="detail-label">Matched Pattern</span>
                          <span className="detail-value">{attack.matchedPattern}</span>
                        </div>
                      )}
                      {attack.description && (
                        <div className="detail-item">
                          <span className="detail-label">Description</span>
                          <span className="detail-value">{attack.description}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">User Agent</span>
                        <span className="detail-value">{attack.userAgent}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Full Path</span>
                        <span className="detail-value">{attack.path}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Timestamp</span>
                        <span className="detail-value">{attack.timestamp}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttackLog
