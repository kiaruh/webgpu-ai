# Deployment Guide

This project is a high-performance **WebGPU** application using Next.js. Deploying it requires specific configurations, especially regarding **Cross-Origin Headers** (COOP/COEP) which are necessary for `SharedArrayBuffer` support often used by client-side AI modules (ONNX Runtime via Transformers.js).

## 1. GitHub Repository

First, ensure your code is pushed to a remote GitHub repository.

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

*(Note: If you already have a remote, just run `git push`)*

---

## 2. Vercel (Recommended)

Vercel is the easiest platform for this project as it natively supports Next.js headers required for WebGPU.

1.  Log in to [Vercel](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configuration**:
    *   **Framework Preset**: Next.js (Auto-detected)
    *   **Root Directory**: `packages/client` (Important! This is a monorepo).
    *   **Build Command**: `next build` (default)
    *   **Output Directory**: `.next` (default)
5.  Click **Deploy**.

**Why Vercel?**
The `next.config.ts` file in this project sets `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`. Vercel respects these headers automatically.

---

## 3. Render

Render is also a great option but requires running as a **Web Service** (Node.js) rather than a Static Site to serve the correct headers.

1.  Log in to [Render](https://render.com).
2.  New -> **Web Service**.
3.  Connect your GitHub repo.
4.  **Configuration**:
    *   **Root Directory**: `packages/client`
    *   **Runtime**: Node
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
5.  Click **Create Web Service**.

---

## 4. GitHub Pages (Not Recommended for WebGPU)

**Warning**: GitHub Pages is a Static Host and **does not** allow setting custom HTTP Headers (`COOP`/`COEP`).
If your AI model (Transformers.js/ONNX) relies on Multithreading or `SharedArrayBuffer`, **it will likely fail** on GitHub Pages.

If you strictly need a static export and wish to try:
1.  Open `packages/client/next.config.ts`.
2.  Add `output: 'export'` to the config object.
3.  Remove the `headers` section (since they won't work anyway).
4.  Run `npm run build`.
5.  Upload the `out` directory to GitHub Pages.

*Again, this is not recommended for this specific High-Performance AI app.*
