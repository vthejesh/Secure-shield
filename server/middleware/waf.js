/**
 * SecureShield - WAF (Web Application Firewall) Middleware
 * Core security engine that inspects all incoming requests for malicious payloads.
 * Detects: SQL Injection, XSS, Path Traversal, Command Injection
 */

const { scanRequest } = require('../utils/patterns');
const store = require('../utils/store');

function wafMiddleware(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';

  // 1. Check IP Blacklist
  if (store.isBlacklisted(ip)) {
    const attack = store.logAttack({
      type: 'BLACKLIST',
      name: 'Blacklisted IP',
      severity: 'HIGH',
      ip,
      method: req.method,
      path: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'] || 'Unknown',
      description: `Request from blacklisted IP: ${ip}`,
    });

    return res.status(403).json({
      error: 'Access Denied',
      message: 'Your IP has been blacklisted due to malicious activity.',
      attackId: attack.id,
      timestamp: attack.timestamp,
    });
  }

  // 2. Check Rate Limit
  const rateCheck = store.checkRateLimit(ip, 60000, 30);
  if (!rateCheck.allowed) {
    const attack = store.logAttack({
      type: 'RATE_LIMIT',
      name: 'Rate Limit Exceeded',
      severity: 'MEDIUM',
      ip,
      method: req.method,
      path: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'] || 'Unknown',
      description: `Rate limit exceeded: ${rateCheck.current}/${rateCheck.limit} requests in window`,
    });

    res.set({
      'X-RateLimit-Limit': rateCheck.limit,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': rateCheck.resetAt,
    });

    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please slow down.',
      attackId: attack.id,
      limit: rateCheck.limit,
      resetAt: rateCheck.resetAt,
    });
  }

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': rateCheck.limit,
    'X-RateLimit-Remaining': rateCheck.remaining,
    'X-RateLimit-Reset': rateCheck.resetAt,
  });

  // 3. Scan for attack patterns (SQLi, XSS, Path Traversal, Cmd Injection)
  const threatDetection = scanRequest(req);
  if (threatDetection) {
    const attack = store.logAttack({
      ...threatDetection,
      ip,
      method: req.method,
      path: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    // Auto-blacklist IPs with 5+ attacks
    const ipAttacks = store.getRecentAttacks(200).filter(a => a.ip === ip).length;
    if (ipAttacks >= 5) {
      store.addToBlacklist(ip, 'Auto-blocked: 5+ attack attempts');
    }

    return res.status(403).json({
      error: 'Request Blocked',
      message: `Malicious payload detected: ${threatDetection.name}`,
      attackId: attack.id,
      severity: threatDetection.severity,
      mitre: threatDetection.mitre,
      owasp: threatDetection.owasp,
      timestamp: attack.timestamp,
    });
  }

  // 4. Request is clean — log and continue
  store.logRequest(req);
  next();
}

module.exports = wafMiddleware;
