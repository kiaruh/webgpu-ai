# 🚀 Deployment Guide: WebGPU & Client-Side AI

This project uses **WebGPU** and **multi-threaded WebAssembly** (via ONNX Runtime) to run AI models in the browser.

## ⚠️ The Critical Constraint: Security Headers

To enable `SharedArrayBuffer` (required for high-performance AI), browsers enforce a security isolation mode. You **must** serve your app with these HTTP headers:

1.  `Cross-Origin-Opener-Policy: same-origin`
2.  `Cross-Origin-Embedder-Policy: require-corp`

**If these headers are missing, the AI model will fail to load or crash the tab.**

---

## ✅ What's Already Done

- [x] **Code pushed to GitHub**: `https://github.com/kiaruh/webgpu-ai`
- [x] **Security headers configured**: `next.config.ts` and `vercel.json` set COOP/COEP headers
- [x] **Build optimized for Vercel**: 
  - Removed platform-specific lockfiles
  - Excluded heavy server-side packages (`onnxruntime-node`, `sharp`)
  - Chat service disabled (no backend needed)
- [x] **Local build verified**: Production build passes without errors

---

## 🎯 Deployment: Vercel (Recommended)

Vercel is the **only platform you need** for this project. Everything runs client-side.

### Steps:
1.  **Go to [Vercel Dashboard](https://vercel.com/new)**
2.  **Import** your repository: `kiaruh/webgpu-ai`
3.  **Configure Project**:
    - **Framework Preset**: Next.js (Auto-detected)
    - **Root Directory**: Click "Edit" → Select `packages/client`
    - **Build Command**: Leave default (`npm run build`)
    - **Output Directory**: Leave default (`.next`)
4.  **Deploy**

### What Happens:
- Vercel reads `vercel.json` and applies the WebGPU security headers automatically
- The build excludes server-side packages (stays under 250MB limit)
- All features work: 3D scenes, FastVLM AI, Interactive Ads

### Verification:
Once deployed, test the FastVLM page (`/applied-ai/fastvlm-onscreen`). If the camera starts without errors, deployment succeeded.

---

## 🔧 Alternative: Render (Optional)

**Note**: Render is NOT needed unless you want to deploy the backend (NestJS) for future features.

For **frontend-only** deployment, Vercel is simpler and faster.

If you still want to use Render:
1.  Go to [Render Dashboard](https://dashboard.render.com/)
2.  **New +** → **Blueprint**
3.  Connect `kiaruh/webgpu-ai`
4.  Render reads `render.yaml` and deploys automatically

---

## ❌ GitHub Pages (Not Supported)

GitHub Pages **cannot** host this project because:
- It's a static file host with no custom HTTP header support
- Without COOP/COEP headers, WebGPU/AI features will fail
- Use Vercel instead

---

## 📝 Summary

**Current Status**: ✅ Ready to deploy to Vercel  
**Backend Required**: ❌ No (all features are client-side)  
**Estimated Deploy Time**: ~3 minutes
