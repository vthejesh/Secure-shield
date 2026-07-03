# SecureShield 🛡️

## API Gateway & Web Application Firewall with Real-time Security Dashboard

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

A production-grade **API Gateway** with an integrated **Web Application Firewall (WAF)** that detects and blocks OWASP Top 10 attacks in real-time. Features a stunning cybersecurity dashboard for monitoring threats, traffic, and security events.

---

## 🏗️ Architecture

```
Client Request
      │
      ▼
┌─────────────────────────────┐
│     SecureShield Gateway     │
│                             │
│  ┌───────────────────────┐  │
│  │   IP Blacklist Check  │──┼──→ 403 Blocked
│  └───────────┬───────────┘  │
│              ▼              │
│  ┌───────────────────────┐  │
│  │   Rate Limiter        │──┼──→ 429 Too Many Requests
│  │   (30 req/min/IP)     │  │
│  └───────────┬───────────┘  │
│              ▼              │
│  ┌───────────────────────┐  │
│  │   WAF Engine          │──┼──→ 403 Blocked + Attack Logged
│  │   • SQL Injection     │  │
│  │   • XSS               │  │
│  │   • Path Traversal    │  │
│  │   • Cmd Injection     │  │
│  └───────────┬───────────┘  │
│              ▼              │
│  ┌───────────────────────┐  │
│  │   Route Handler       │──┼──→ 200 OK (Clean Request)
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## 🔒 Security Features

| Feature | Description | MITRE ATT&CK |
|---------|-------------|---------------|
| **SQL Injection Detection** | 15+ regex patterns covering UNION, OR 1=1, SLEEP, stacked queries | T1190 |
| **XSS Prevention** | Detects script tags, event handlers, JavaScript protocol, encoded payloads | T1059.007 |
| **Path Traversal Block** | Catches `../`, encoded variants, and sensitive file access attempts | T1083 |
| **Command Injection** | Detects shell commands, backticks, subshells, reverse shell attempts | T1059 |
| **Rate Limiting** | Sliding window (30 req/min per IP) with X-RateLimit headers | - |
| **IP Blacklisting** | Auto-blocks IPs with 5+ attack attempts. Manual management via dashboard | - |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/secure-shield.git
cd secure-shield

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Running

```bash
# Start both server and dashboard
npm run dev

# Or start separately:
npm run dev:server    # Backend on http://localhost:3001
npm run dev:client    # Dashboard on http://localhost:5173
```

### Simulate Attacks

```bash
# Run the attack simulation suite
npm run simulate
```

This sends 40+ attack payloads (SQLi, XSS, Path Traversal, Command Injection, Brute Force) and normal traffic to test the WAF.

## 📊 Dashboard

The React dashboard provides real-time visibility into:

- **Threat Level Gauge** — Visual indicator from NONE to CRITICAL
- **Stats Cards** — Total requests, blocked threats, block rate, uptime
- **Attack Log** — Real-time feed of detected attacks with MITRE ATT&CK mapping
- **Attack Distribution** — Breakdown by attack type
- **IP Blacklist Manager** — Add/remove IPs from the blacklist

## 🗂️ Project Structure

```
secure-shield/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── middleware/
│   │   └── waf.js               # WAF middleware (core security engine)
│   ├── routes/
│   │   ├── api.js               # Protected sample API endpoints
│   │   └── dashboard.js         # Dashboard data API
│   └── utils/
│       ├── patterns.js          # OWASP attack pattern definitions
│       └── store.js             # In-memory security data store
├── client/                      # React + Vite dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── StatsCards.jsx
│   │       ├── ThreatGauge.jsx
│   │       ├── AttackLog.jsx
│   │       ├── AttackDistribution.jsx
│   │       ├── BlacklistManager.jsx
│   │       ├── Sidebar.jsx
│   │       └── Header.jsx
│   └── ...
├── scripts/
│   └── simulate-attacks.js      # Attack simulation suite
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📋 API Endpoints

### Protected Endpoints (WAF-filtered)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get users list |
| POST | `/api/login` | User authentication |
| GET | `/api/search?q=` | Search (common SQLi target) |
| GET | `/api/data` | Get application data |
| POST | `/api/comment` | Post comment (common XSS target) |
| GET | `/api/file?name=` | File download (common traversal target) |

### Dashboard API (WAF-exempt)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Overall security statistics |
| GET | `/api/dashboard/attacks` | Recent attack logs |
| GET | `/api/dashboard/distribution` | Attack type breakdown |
| GET | `/api/dashboard/blacklist` | Get blacklisted IPs |
| POST | `/api/dashboard/blacklist` | Add IP to blacklist |
| DELETE | `/api/dashboard/blacklist/:ip` | Remove IP from blacklist |

## 🧪 OWASP Top 10 Coverage

- ✅ **A01:2021 – Broken Access Control** (Path Traversal detection)
- ✅ **A03:2021 – Injection** (SQLi + Command Injection)
- ✅ **A07:2021 – Cross-Site Scripting** (XSS detection)
- ✅ **A05:2021 – Security Misconfiguration** (Helmet headers)

## 📜 License

MIT License — Vedhagiri Thejesh

## 🙏 Acknowledgments

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
