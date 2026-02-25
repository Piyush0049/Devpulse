# ⚡ DevPulse — Engineering Intelligence Dashboard

> AI-powered engineering command center. Understand your codebase, predict risks, explain PRs, and detect tech debt — all in one beautiful, GitHub-integrated dashboard.

---

## 🚀 Overview

**DevPulse** is a professional-grade AI dashboard designed for modern engineering teams. It synchronizes with your GitHub account, analyzes your repositories in real-time, and provides deep architectural insights using a RAG (Retrieval-Augmented Generation) pipeline.

---

## ✨ Key Features

| Feature | Description |
| --------- | ----------- |
| 🔐 **GitHub Native Auth** | Secure OAuth integration with full repository access. |
| 📂 **Neural Node Explorer** | Real-time repository selector with live filtering and search. |
| 🧠 **AI Codebase Brain** | RAG-powered natural language queries over your entire codebase. |
| 🚨 **Risk Radar** | File-level risk scoring with heatmap visualization. |
| ⚡ **PR Explainer** | Auto-generated summaries, risk scores, and review checklists. |
| 📊 **Tech Debt Detector** | Surfaces TODOs, large files, high complexity, and type safety issues. |
| 📈 **Intelligence Dashboard** | Health scores, commit velocity, and language breakdown. |

---

## 🏗️ Tech Stack

-   **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
-   **Animations**: Framer Motion (Immersive hacking aesthetic)
-   **Authentication**: NextAuth.js (GitHub OAuth)
-   **Database**: MongoDB (User profiles, link metadata)
-   **AI Engine**: HuggingFace Inference API (`Mistral-7B` + `MiniLM-L6`)
-   **Cloud Native**: Standardized middleware/proxy architecture.

---

## 🛠️ Getting Started

### 1. Requirements
Ensure you have **Node.js 18+** and a **MongoDB** instance (Atlas or local).

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example file and fill in your secrets in the newly created `.env`:

```bash
cp .env.example .env
```

**Required Variables:**
- **`HUGGINGFACE_API_KEY`**: Get yours at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
- **`GITHUB_ID`** & **`GITHUB_SECRET`**: Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers).
- **`MONGODB_URI`**: Your MongoDB connection string.
- **`NEXTAUTH_SECRET`**: A random string for session encryption.
- **`NEXTAUTH_URL`**: `http://localhost:3000` (for local development).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and click **Establish Link** to begin.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing / Repo Selector
│   ├── login/page.tsx        # Portal.Zero Auth Interface
│   ├── dashboard/page.tsx    # Intelligence Overview
│   ├── ask/page.tsx          # Neural Query (AI Chat)
│   ├── prs/page.tsx          # Merge Insights (PR Analyzer)
│   ├── risks/page.tsx        # Global Risks (Risk Radar)
│   ├── debt/page.tsx         # Tech Entropy (Tech Debt)
│   └── api/                  # Node.js API Routes
├── components/
│   ├── dashboard/            # Recharts & Visualizations
│   ├── layout/               # Sidebar & Navigation
│   └── ui/                   # Premium Atomic Components
├── lib/
│   ├── auth.ts               # NextAuth Logic
│   ├── mongodb.ts            # Database Singleton
│   ├── github.ts             # GitHub REST Bridge
│   ├── embeddings.ts         # HuggingFace RAG Pipeline
│   ├── vectorStore.ts        # Indexing & Search
│   └── analysis.ts           # Intelligence Algorithms
└── types/index.ts            # Unified Type Definitions
```

---

## 🎬 Workflow Demo

1.  **Authorize**: Connect your GitHub account via the Portal.Zero interface.
2.  **Synchronize**: Search and select any repository from your live GitHub list.
3.  **Analyze**: Watch the neural indexing process as it builds your codebase brain.
4.  **Explore**: Navigate through tech debt heatmaps, risk radars, and AI insights.
5.  **Query**: Use "Neural Query" to find specific architectural patterns or bugs.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
