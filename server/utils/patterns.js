/**
 * SecureShield - Attack Pattern Definitions
 * Contains regex patterns for detecting OWASP Top 10 attack payloads.
 * Each pattern is mapped to MITRE ATT&CK framework techniques.
 */

const ATTACK_PATTERNS = {
  SQL_INJECTION: {
    name: 'SQL Injection',
    severity: 'CRITICAL',
    mitre: 'T1190 - Exploit Public-Facing Application',
    owasp: 'A03:2021 - Injection',
    patterns: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b\s)/i,
      /(\b(OR|AND)\b\s+[\d'"]+=\s*[\d'"]+)/i,
      /(--|#|\/\*|\*\/)/,
      /(\bOR\b\s+1\s*=\s*1)/i,
      /(\bAND\b\s+1\s*=\s*1)/i,
      /(UNION\s+(ALL\s+)?SELECT)/i,
      /(\b(SLEEP|BENCHMARK|WAITFOR)\s*\()/i,
      /(;\s*(DROP|DELETE|UPDATE|INSERT)\s)/i,
      /(';\s*--)/,
      /(admin'\s*--)/i,
      /(\bCONCAT\s*\()/i,
      /(\bCHAR\s*\(\d+\))/i,
      /(\bLOAD_FILE\s*\()/i,
      /(\bINTO\s+(OUT|DUMP)FILE\b)/i,
      /(\bINFORMATION_SCHEMA\b)/i,
    ],
    description: 'Attempted to inject malicious SQL commands to manipulate database queries.',
  },

  XSS: {
    name: 'Cross-Site Scripting (XSS)',
    severity: 'HIGH',
    mitre: 'T1059.007 - JavaScript',
    owasp: 'A07:2021 - Cross-Site Scripting',
    patterns: [
      /(<script[\s>])/i,
      /(<\/script>)/i,
      /(javascript\s*:)/i,
      /(on(error|load|click|mouseover|focus|blur|submit|change|input|keyup|keydown)\s*=)/i,
      /(<iframe[\s>])/i,
      /(<object[\s>])/i,
      /(<embed[\s>])/i,
      /(<svg[\s>].*?on\w+\s*=)/i,
      /(<img[^>]+onerror\s*=)/i,
      /(document\.(cookie|write|location))/i,
      /(window\.(location|open))/i,
      /(eval\s*\()/i,
      /(alert\s*\()/i,
      /(String\.fromCharCode)/i,
      /(atob\s*\()/i,
    ],
    description: 'Attempted to inject malicious client-side scripts into web pages.',
  },

  PATH_TRAVERSAL: {
    name: 'Path Traversal',
    severity: 'HIGH',
    mitre: 'T1083 - File and Directory Discovery',
    owasp: 'A01:2021 - Broken Access Control',
    patterns: [
      /(\.\.[\/\\])/,
      /(\/etc\/(passwd|shadow|hosts))/i,
      /(\/proc\/self)/i,
      /(\/windows\/(system32|win\.ini))/i,
      /(%2e%2e[%2f%5c])/i,
      /(%252e%252e%252f)/i,
      /(\.\.%c0%af)/i,
      /(\.\.%c1%9c)/i,
      /(\/boot\.ini)/i,
      /(\/etc\/(?:group|issue|motd|mysql))/i,
    ],
    description: 'Attempted to access files outside the intended directory structure.',
  },

  CMD_INJECTION: {
    name: 'Command Injection',
    severity: 'CRITICAL',
    mitre: 'T1059 - Command and Scripting Interpreter',
    owasp: 'A03:2021 - Injection',
    patterns: [
      /(;\s*(ls|cat|pwd|whoami|id|uname|curl|wget|nc|ncat|bash|sh|cmd|powershell)\b)/i,
      /(\|\s*(ls|cat|pwd|whoami|id|uname)\b)/i,
      /(`[^`]*`)/,
      /(\$\([^)]*\))/,
      /(\b(rm|mv|cp|chmod|chown)\s+-[rf])/i,
      /(\b(net\s+user|tasklist|systeminfo|ipconfig|ifconfig)\b)/i,
      /(\b(curl|wget)\s+.*(http|ftp))/i,
      /(>\s*\/dev\/null)/i,
      /(\bnc\s+-[le])/i,
      /(\breverse\s+shell\b)/i,
    ],
    description: 'Attempted to execute arbitrary system commands on the server.',
  },
};

function detectAttack(input) {
  if (!input || typeof input !== 'string') return null;

  for (const [type, config] of Object.entries(ATTACK_PATTERNS)) {
    for (const pattern of config.patterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          type,
          name: config.name,
          severity: config.severity,
          mitre: config.mitre,
          owasp: config.owasp,
          matchedPattern: match[0],
          description: config.description,
        };
      }
    }
  }
  return null;
}

function scanRequest(req) {
  const targets = [
    req.originalUrl || req.url,
    JSON.stringify(req.query || {}),
    JSON.stringify(req.body || {}),
    JSON.stringify(req.params || {}),
    req.headers['user-agent'] || '',
    req.headers['referer'] || '',
    req.headers['cookie'] || '',
  ];

  for (const target of targets) {
    const result = detectAttack(target);
    if (result) {
      result.source = target.substring(0, 200);
      return result;
    }
  }
  return null;
}

module.exports = { ATTACK_PATTERNS, detectAttack, scanRequest };
