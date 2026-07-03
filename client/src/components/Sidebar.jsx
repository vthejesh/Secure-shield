function Sidebar({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'attacks', icon: '⚔️', label: 'Attack Log' },
    { id: 'blacklist', icon: '🚫', label: 'Blacklist' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="shield-icon">🛡️</span>
        <div>
          <h1>SecureShield</h1>
          <div className="version">v1.0.0</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-status">
        <div className="engine-status">
          <div className="dot"></div>
          <span>WAF Engine Active</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
