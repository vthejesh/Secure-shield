function StatsCards({ stats }) {
  if (!stats) return null

  const cards = [
    {
      icon: '📊',
      value: stats.totalRequests.toLocaleString(),
      label: 'Total Requests',
      color: 'cyan',
    },
    {
      icon: '🛡️',
      value: stats.blockedRequests.toLocaleString(),
      label: 'Blocked Threats',
      color: 'red',
    },
    {
      icon: '🎯',
      value: stats.threatLevel?.level || 'NONE',
      label: 'Threat Level',
      color: stats.threatLevel?.level === 'CRITICAL' ? 'red'
        : stats.threatLevel?.level === 'HIGH' ? 'orange'
        : stats.threatLevel?.level === 'MEDIUM' ? 'orange'
        : 'green',
    },
    {
      icon: '📈',
      value: stats.blockRate,
      label: 'Block Rate',
      color: 'orange',
    },
    {
      icon: '⏱️',
      value: stats.uptime,
      label: 'Uptime',
      color: 'green',
    },
    {
      icon: '📜',
      value: '50+',
      label: 'Active Rules',
      color: 'purple',
    },
  ]

  return (
    <div className="stats-grid animate-in">
      {cards.map((card, i) => (
        <div key={i} className={`stat-card ${card.color}`}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
