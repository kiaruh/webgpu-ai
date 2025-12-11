# Immersive Intelligence Platform

A next-generation web platform combining high-performance **WebGPU graphics**, **Server-Side Rendering (SSR)** for SEO, and **Edge AI**.

## 🚀 Tech Stack

- **Frontend:** Next.js 14+ (App Router), React Three Fiber (Three.js), WebGPU, Tailwind CSS.
- **Backend:** NestJS, Socket.io (Real-time).
- **AI:** ONNX Runtime Web (WebGPU Execution Provider), FastVLM.
- **Architecture:** Monorepo (npm workspaces).

## 📂 Project Structure

```bash
/
├── packages/
│   ├── client/       # Next.js Frontend (SSR + WebGPU)
│   └── server/       # NestJS Backend (API + WebSocket)
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm 10+
- Browser with WebGPU support (Chrome 113+, Edge 113+)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run both Client and Server concurrently:
   ```bash
   # Coming soon
   npm run dev:client # In one terminal
   npm run dev:server # In another terminal
   ```

## 🔒 Security
- **No .env files** committed to the repo.
- **Strict linting** enforced.

## 📄 Metadata & SEO
The homepage is fully server-side rendered with semantic HTML, JSON-LD structured data, and Open Graph tags for:
- Search Engines (Google, Bing)
- AI Scrapers
- Social Previews (Twitter, LinkedIn)