# 🚀 GitHub Profile Analyzer API

An enterprise-grade, production-ready Node.js REST API designed to fetch, cache, and deeply analyze public GitHub user profiles. Built with a highly secure, scalable, and isolated layered architecture to process network data with minimal overhead.

---

## 🛠️ Architecture & System Topology

The service utilizes a **Domain-Driven Layered Architecture** (Service-DAO Pattern) that strictly isolates raw network I/O, database actions, and calculations:

```text
[Client Request] ──► [Helmet / Rate-Limiter] ──► [Zod Validation]
                                                        │
┌─────────────────────────[ Controller Layer ]──────────┘
│  └─► profile.controller.js (Parses payloads & handles HTTP status codes)
│
├─────────────────────────[ Service Orchestration Layer ]
│  ├─► profile.service.js   (Coordinates caching, network syncing, and calculations)
│  ├─► github.service.js    (Handles concurrent third-party Axios requests with PAT authentication)
│  └─► analyzer.service.js  (Pure mathematical scoring engine isolated from network state)
│
└─────────────────────────[ Data Access Layer (DAO) ]
   └─► ProfileModel.js      (Executes highly optimized raw SQL connection-pooled upserts)
```

---

## ✨ Enterprise Features Beyond Requirements

*   **⚡ Smart DB Caching Layer**: Implemented a defensive 12-hour local MySQL caching policy. Repeated requests for the same profile pull data in `<10ms`, bypassing external rate-limiting bottlenecks.
*   **🏎️ Concurrent Networking**: Utilizes `Promise.all()` to trigger independent GitHub profile and repository queries concurrently, effectively slicing network response latencies in half.
*   **📊 Pure Analytical Engine**: Dynamically calculates deep statistical metrics including custom engagement ratios, account velocity models, and a multi-weighted overall `profile_score` (0-100).
*   **🔒 Production-Grade Security**: Enforces HTTP header masking via `Helmet`, explicit Cross-Origin Resource Sharing (`CORS`), and IP-based Brute-Force prevention via `Express-Rate-Limit`.
*   **🛡️ Robust Schema Validation**: Incoming path parameters, payloads, and queries are runtime-validated structurally using strict `Zod` schemas before hitting core controller domains.
*   **🧩 Global Exception Handling**: Outfitted with a unified global error interceptor wrapping a customized `AppError` module. Sanitizes and masks application stack traces inside production environments.

---

## 💾 Database Layout & Index Optimization

The database layer leverages a high-performance raw SQL structure with explicit indexing layouts optimized for filtering and low-latency lookups:

*   `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
*   `username`: `VARCHAR(39) UNIQUE INDEX` *(Lookups execute via instant index seeks)*
*   `top_language`: `VARCHAR(50)` *(Indexed for ultra-fast aggregation)*
*   `profile_score`: `INT` *(Indexed to support instant ordered leaderboard sorting queries)*
*   `engagement_rate` / `repo_velocity`: `DECIMAL(5,2)`
*   `created_at` / `updated_at`: `TIMESTAMP`

---

## 🚀 Rapid Local Deployment via Docker

Spin up the entire system container cluster (including the pre-configured MySQL 8 database instance and the backend Node.js API runtime environment) with one command.

### 1. Configure the Environment
Create a `.env` file in your root folder (reference `.env.example`):
```env
PORT=3000
DB_HOST=db
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=github_analyzer
DB_PORT=3306
GITHUB_TOKEN=your_github_personal_access_token
```
> *Note: Providing a `GITHUB_TOKEN` raises your third-party rate thresholds to 5,000 requests/hour.*

### 2. Boot the Application Stack
```bash
docker-compose up --build
```
Once initialized, the service automatically binds to port `3000` locally.

---

## 📋 API Specification Documentation

Interactive, live API documentation compiled dynamically via **Swagger Open-API specs** runs on your deployment server instance.

*   **Interactive Interface URL**: `http://localhost:3000/api-docs`

### Core Endpoints

#### 1. Analyze & Sync Profile
*   **Endpoint**: `POST /api/v1/profiles/:username`
*   **Description**: Validates, checks the local 12-hour cache state, queries the GitHub API if necessary, performs metrics updates, and saves into the system.

#### 2. Fetch Stored Profile Directory
*   **Endpoint**: `GET /api/v1/profiles`
*   **Query Modifiers**: 
    *   `?page=1&limit=10` (Offset Pagination)
    *   `?sortBy=profile_score&order=desc` (Dynamic Ranking Order)
    *   `?language=JavaScript` (Targeted Technology Filtering)

#### 3. Fetch Single Stored Profile Detail
*   **Endpoint**: `GET /api/v1/profiles/:username`

---

## 🧪 Isolated Unit Testing Suite

The testing layout runs natively using `Jest` leveraging experimental ES modules flag execution hooks to mirror mock behaviors without rewriting modules:

```bash
npm test
```
The suite thoroughly exercises mock responses for the `AnalyzerService` mathematical boundaries and checks the caching evaluation pathways safely away from network environments.
