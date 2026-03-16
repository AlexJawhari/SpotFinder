# 📍 SpotFinder

[![Status](https://img.shields.io/badge/Status-Live-brightgreen)](https://spotfinder-fawn.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

**SpotFinder** is a full-stack geolocation platform for finding ideal "third spaces" — cafes, libraries, coworking hubs, and quiet parks. Built for students and remote workers who need WiFi, outlets, and a good environment to focus.

🔗 **[Live Demo](https://spotfinder-fawn.vercel.app)**

---

## ✨ Features

- **Geospatial Clustering** — Renders thousands of locations using Leaflet marker clustering for smooth navigation at any zoom level.
- **Smart Filtering** — Filter in real time by amenities (Open Late, Fast WiFi, Quiet Zone) with debounced state management for zero-lag UX.
- **Proximity Search** — PostgreSQL geospatial functions find nearby spots within a user-defined radius, with sub-100ms response times.
- **Real-time Check-ins** — Privacy-aware "Who's Here" system lets users check into spaces and see who's around.
- **High Availability API** — Express backend with automated health checks sustaining 98.5% uptime.
- **Image Uploads** — Cloudinary integration for user-submitted venue photos.

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework with concurrent rendering features |
| Leaflet.js + OpenStreetMap | Open-source map rendering and marker clustering |
| Zustand | Lightweight, hook-based global state management |
| Tailwind CSS | Utility-first styling system |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | High-throughput REST API server |
| Supabase (PostgreSQL) | Relational database with Row Level Security |
| JWT | Stateless authentication with refresh token rotation |
| Helmet + express-rate-limit | HTTP security headers and DDoS prevention |

### Infrastructure
| Service | Role |
|---|---|
| Render | Containerized backend API deployment |
| Vercel | Frontend deployment via global edge network |
| Cloudinary | Image uploads and CDN delivery |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) account and project
- A [Cloudinary](https://cloudinary.com) account

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/AlexJawhari/SpotFinder.git
cd SpotFinder
```

**2. Install dependencies**
```bash
cd spotfinder-backend && npm install
cd ../spotfinder-frontend && npm install
```

**3. Configure environment variables**
```bash
cp spotfinder-backend/.env.example spotfinder-backend/.env
cp spotfinder-frontend/.env.example spotfinder-frontend/.env
# Fill in both .env files with your credentials
```

**4. Start the application**
```bash
# Terminal 1 — Backend (port 3000)
cd spotfinder-backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd spotfinder-frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security

- **Row Level Security (RLS)** — Supabase policies ensure users only access their own data
- **Rate Limiting** — `express-rate-limit` prevents DDoS and brute-force attacks
- **Helmet** — Enforces secure HTTP headers (XSS protection, HSTS, no-sniff)
- **Input Validation** — Server-side schema validation on all endpoints
- **JWT Auth** — Stateless token-based auth with refresh rotation

---

## 🗺️ Roadmap

- [ ] Event Orchestration — CRUD for study groups, meetups, and hackathons tied to specific locations
- [ ] Interest Groups — Community sub-forums organized by professional interest or hobby
- [ ] Reputation System — Gamified badge rewards for top reviewers and location scouts
- [ ] Venue Analytics — Historical busy-hours visualization from aggregated check-in data
- [ ] Community Q&A — Threaded discussions and questions attached to individual venue pages

---

## 📄 License

MIT

---

*Built by [Alex Jawhari](https://github.com/AlexJawhari)*