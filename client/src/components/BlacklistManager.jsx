import { useState } from 'react'

function BlacklistManager({ blacklist, onAdd, onRemove }) {
  const [ip, setIp] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!ip.trim()) return
    onAdd(ip.trim(), reason.trim() || 'Manual block')
    setIp('')
    setReason('')
  }

  return (
    <div>
      <form className="blacklist-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="IP Address (e.g. 192.168.1.100)"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          🚫 Block IP
        </button>
      </form>

      {blacklist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-text">No blacklisted IPs</div>
          <div className="empty-sub">Add IPs manually or they'll be auto-blocked after 5+ attacks</div>
        </div>
      ) : (
        <div className="blacklist-entries">
          {blacklist.map((ipAddr) => (
            <div key={ipAddr} className="blacklist-entry">
              <div>
                <div className="ip-address">⛔ {ipAddr}</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onRemove(ipAddr)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BlacklistManager
