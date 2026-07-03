import { useState, useEffect } from 'react'

function Header({ connected }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="header">
      <div className="header-title">
        🖥️ Security Operations Dashboard
      </div>
      <div className="header-right">
        <div className="header-live">
          <div className="live-dot"></div>
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>
        <div className="header-clock">
          {formattedDate} &nbsp;{formattedTime}
        </div>
      </div>
    </header>
  )
}

export default Header
