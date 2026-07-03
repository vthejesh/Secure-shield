function ThreatGauge({ stats }) {
  const score = stats?.threatLevel?.score || 0
  const level = stats?.threatLevel?.level || 'NONE'
  const color = stats?.threatLevel?.color || '#69f0ae'

  // SVG arc gauge
  const radius = 80
  const strokeWidth = 12
  const cx = 100
  const cy = 95
  const startAngle = -210
  const endAngle = 30
  const totalAngle = endAngle - startAngle // 240 degrees
  const filledAngle = (score / 100) * totalAngle

  function polarToCartesian(centerX, centerY, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    }
  }

  function describeArc(x, y, r, startAng, endAng) {
    const start = polarToCartesian(x, y, r, endAng)
    const end = polarToCartesian(x, y, r, startAng)
    const largeArc = endAng - startAng > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  const bgArc = describeArc(cx, cy, radius, startAngle, endAngle)
  const fillArc = filledAngle > 0
    ? describeArc(cx, cy, radius, startAngle, startAngle + filledAngle)
    : ''

  // Needle position
  const needleAngle = startAngle + filledAngle
  const needleEnd = polarToCartesian(cx, cy, radius - 20, needleAngle)

  return (
    <div className="threat-gauge">
      <svg width="200" height="130" viewBox="0 0 200 130">
        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {fillArc && (
          <path
            d={fillArc}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
              transition: 'all 0.8s ease',
            }}
          />
        )}
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="4" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transition: 'all 0.8s ease', filter: `drop-shadow(0 0 3px ${color})` }}
        />
        {/* Score text */}
        <text x={cx} y={cy + 28} textAnchor="middle" fill={color} fontSize="24" fontWeight="800" fontFamily="'JetBrains Mono', monospace">
          {score}
        </text>
      </svg>
      <div className="threat-label" style={{ color }}>{level}</div>
      <div className="threat-sublabel">Threat Assessment</div>
    </div>
  )
}

export default ThreatGauge
