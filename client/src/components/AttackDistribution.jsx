function AttackDistribution({ distribution }) {
  if (!distribution) return null

  const items = [
    { name: 'SQL Injection', key: 'sqli', color: 'red' },
    { name: 'Cross-Site Scripting', key: 'xss', color: 'orange' },
    { name: 'Path Traversal', key: 'pathTraversal', color: 'cyan' },
    { name: 'Command Injection', key: 'cmdInjection', color: 'purple' },
    { name: 'Rate Limited', key: 'rateLimit', color: 'yellow' },
    { name: 'Blacklisted', key: 'blacklist', color: 'blue' },
  ]

  const total = Object.values(distribution).reduce((sum, v) => sum + v, 0) || 1

  return (
    <div className="distribution-list">
      {items.map(item => {
        const count = distribution[item.key] || 0
        const pct = ((count / total) * 100).toFixed(0)
        return (
          <div key={item.key} className="dist-item">
            <div className="dist-item-header">
              <span className="dist-item-name">{item.name}</span>
              <span className="dist-item-count">{count} ({pct}%)</span>
            </div>
            <div className="dist-bar-track">
              <div
                className={`dist-bar-fill ${item.color}`}
                style={{ width: `${Math.max(count > 0 ? 3 : 0, (count / total) * 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AttackDistribution
