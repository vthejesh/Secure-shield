/**
 * SecureShield - In-Memory Data Store
 * Stores attack logs, traffic stats, blacklisted IPs, and rate limit counters.
 * In production, replace with Redis or a database.
 */

class SecurityStore {
  constructor() {
    this.attacks = [];
    this.requests = [];
    this.blacklistedIPs = new Set();
    this.rateLimitMap = new Map();
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      totalAttacks: 0,
      sqliAttempts: 0,
      xssAttempts: 0,
      pathTraversalAttempts: 0,
      cmdInjectionAttempts: 0,
      rateLimitBlocks: 0,
      blacklistBlocks: 0,
      startTime: Date.now(),
    };
    this.trafficHistory = [];
    this._startTrafficRecorder();
  }

  _startTrafficRecorder() {
    setInterval(() => {
      const now = new Date();
      this.trafficHistory.push({
        timestamp: now.toISOString(),
        requests: this.stats.totalRequests,
        blocked: this.stats.blockedRequests,
      });
      // Keep only last 60 data points (1 hour at 1-min intervals)
      if (this.trafficHistory.length > 60) {
        this.trafficHistory.shift();
      }
    }, 60000);
  }

  logRequest(req) {
    this.stats.totalRequests++;
    const entry = {
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      method: req.method,
      path: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'] || 'Unknown',
    };
    this.requests.push(entry);
    if (this.requests.length > 500) this.requests.shift();
    return entry;
  }

  logAttack(details) {
    this.stats.blockedRequests++;
    this.stats.totalAttacks++;

    switch (details.type) {
      case 'SQL_INJECTION': this.stats.sqliAttempts++; break;
      case 'XSS': this.stats.xssAttempts++; break;
      case 'PATH_TRAVERSAL': this.stats.pathTraversalAttempts++; break;
      case 'CMD_INJECTION': this.stats.cmdInjectionAttempts++; break;
      case 'RATE_LIMIT': this.stats.rateLimitBlocks++; break;
      case 'BLACKLIST': this.stats.blacklistBlocks++; break;
    }

    const attack = {
      id: `ATK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...details,
    };
    this.attacks.unshift(attack);
    if (this.attacks.length > 200) this.attacks.pop();
    return attack;
  }

  addToBlacklist(ip, reason = 'Manual') {
    this.blacklistedIPs.add(ip);
    return { ip, reason, addedAt: new Date().toISOString() };
  }

  removeFromBlacklist(ip) {
    return this.blacklistedIPs.delete(ip);
  }

  isBlacklisted(ip) {
    return this.blacklistedIPs.has(ip);
  }

  getBlacklist() {
    return Array.from(this.blacklistedIPs);
  }

  checkRateLimit(ip, windowMs = 60000, maxRequests = 30) {
    const now = Date.now();
    if (!this.rateLimitMap.has(ip)) {
      this.rateLimitMap.set(ip, []);
    }
    const timestamps = this.rateLimitMap.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    this.rateLimitMap.set(ip, timestamps);
    return {
      allowed: timestamps.length <= maxRequests,
      current: timestamps.length,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - timestamps.length),
      resetAt: new Date(now + windowMs).toISOString(),
    };
  }

  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    return {
      ...this.stats,
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      uptimeMs: uptime,
      blockRate: this.stats.totalRequests > 0
        ? ((this.stats.blockedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      threatLevel: this._calculateThreatLevel(),
    };
  }

  _calculateThreatLevel() {
    const recentAttacks = this.attacks.filter(a => {
      return Date.now() - new Date(a.timestamp).getTime() < 300000; // last 5 min
    }).length;

    if (recentAttacks > 20) return { level: 'CRITICAL', score: 95, color: '#ff1744' };
    if (recentAttacks > 10) return { level: 'HIGH', score: 75, color: '#ff9100' };
    if (recentAttacks > 5) return { level: 'MEDIUM', score: 50, color: '#ffea00' };
    if (recentAttacks > 0) return { level: 'LOW', score: 25, color: '#00e676' };
    return { level: 'NONE', score: 0, color: '#69f0ae' };
  }

  getRecentAttacks(limit = 50) {
    return this.attacks.slice(0, limit);
  }

  getTrafficHistory() {
    return this.trafficHistory;
  }

  getAttackDistribution() {
    return {
      sqli: this.stats.sqliAttempts,
      xss: this.stats.xssAttempts,
      pathTraversal: this.stats.pathTraversalAttempts,
      cmdInjection: this.stats.cmdInjectionAttempts,
      rateLimit: this.stats.rateLimitBlocks,
      blacklist: this.stats.blacklistBlocks,
    };
  }
}

// Singleton
const store = new SecurityStore();
module.exports = store;
