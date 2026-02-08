# 📍 SpotFinder

![Project Status](https://img.shields.io/badge/Status-Development-blue) ![License](https://img.shields.io/badge/License-MIT-green)

**SpotFinder** is a sophisticated full-stack geolocation platform designed to connect students and remote workers with ideal "third spaces"—cafes, libraries, coworking hubs, and quiet parks. 

Unlike generic map applications, SpotFinder focuses on the specific needs of the remote workforce: WiFi quality, outlet availability, ambient noise levels, and community presence.

---

## ✨ Comprehensive Feature Suite

### 🔍 Discovery Engine
- **Geospatial Clustering**: Efficiently renders thousands of data points using leaflet-based clustering for smooth navigation.
- **Smart Filtering**: Granular query capabilities allow users to filter by specific amenities (e.g., "Open Late", "Fast WiFi", "Quiet Zone").
- **Proximity Search**: Uses geospatial queries to find the nearest relevant spots within a user-defined radius.

### 🌐 Social Connectivity
- **"Who's Here" Protocol**: Real-time privacy-aware check-in system allowing friends to meet up spontaneously.
- **Event Orchestration**: Full CRUD capabilities for creating study groups, networking mixers, and hackathons attached to specific locations.
- **Interest Groups**: Community sub-forums based on professional interests or hobbies (e.g., "Full Stack Devs", "Designers").
- **reputation System**: Gamified contribution tracking where users earn badges (e.g., "Top Reviewer", "Scout") for verifying data reliability.

### 📊 Data Richness
- **Multi-Factor Reviews**: proprietary rating algorithm aggregating scores for Connectivity, Comfort, and Noise.
- **Venue Analytics**: Historical visualization of "busy hours" based on community check-in data.
- **Community QA**: Threaded discussions attached to venues for specific questions (e.g., "Do they have non-dairy milk?").

---

## 🏗️ Technical Architecture

### Frontend (Client)
- **React 19**: Utilizing the latest concurrent features for optimal rendering performance.
- **Vite**: Next-generation frontend tooling for ultra-fast HMR and optimized production builds.
- **Zustand**: Atomic, hook-based state management for predictable data flow without boilerplate.
- **Leaflet.js & OpenStreetMap**: Open-source mapping solution eliminating widely-known API cost barriers.
- **Tailwind CSS**: JIT-compiled utility classes for a highly performant, custom design system.

### Backend (Server)
- **Node.js & Express**: High-throughput event-driven architecture.
- **Supabase (PostgreSQL)**: Enterprise-grade relational database with strict Row Level Security (RLS).
- **JWT Authentication**: Stateless, secure token-based auth flow with refresh rotation strategies.
- **RESTful API**: Standardized resource-oriented endpoints with HATEOAS principles.

### Infrastructure & DevOps
- **Render**: Containerized deployment for the API layer with auto-scaling capabilities.
- **Vercel**: Global edge network deployment for the frontend application.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- GitHub Account
- Supabase Account

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlexJawhari/SpotFinder.git
   cd SpotFinder
   ```

2. **Install Dependencies**
   ```bash
   # Install backend deps
   cd spotfinder-backend
   npm install

   # Install frontend deps
   cd ../spotfinder-frontend
   npm install
   ```

3. **Environment Configuration**
   Copy `.env.example` to `.env` in both directories and populate your Supabase credentials.

4. **Launch Application**
   ```bash
   # Run Backend (Port 3000)
   cd spotfinder-backend
   npm run dev

   # Run Frontend (Port 5173)
   cd spotfinder-frontend
   npm run dev
   ```

---

## 🔒 Security & Performance
- **Rate Limiting**: Express-rate-limit middleware prevents DDoS and brute force attacks.
- **Input Validation**: Server-side validation schemas ensure data integrity.
- **Helmet**: Secures HTTP headers to standards (XSS protection, no-sniff).
- **Lazy Loading**: React.lazy() routes code-splitting to minimize initial bundle size.

---

*SpotFinder was architected with scalability and user experience as first-class citizens.*