import { Metadata } from 'next';
import Link from 'next/link';
import { ChatWidget } from '@/features/chat/ChatWidget'; // Import ChatWidget

export const metadata: Metadata = {
  title: 'Immersive Intelligence Platform | WebGPU & AI',
  description: 'A next-generation platform showcasing WebGPU interactive ads, FastVLM AI, and immersive 3D experiences.',
  openGraph: {
    title: 'Immersive Intelligence Platform',
    description: 'Experience the future of the web with WebGPU and Edge AI.',
    type: 'website',
    siteName: 'Immersive Intelligence',
  },
  keywords: ['WebGPU', 'AI', 'FastVLM', 'Immersive Web', 'Three.js'],
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Immersive Intelligence Platform',
    description: 'A showcase of WebGPU and Client-side AI technologies.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://example.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      {/* Semantic Helper for SEO/Bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      {/* Floating Chat Widget */}
      <ChatWidget />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
          Immersive Intelligence
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-neutral-400">
          Bridging the gap between <strong>Server-Side Rendering</strong> and{' '}
          <strong>High-Performance WebGPU</strong> graphics.
        </p>

        {/* This section will eventually hold the Canvas, but we keep it empty or with a placeholder for now */}
        <section id="canvas-container" className="absolute inset-0 -z-10 opacity-50">
          {/* user-requested: 3D assets will be loaded here */}
        </section>

        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link
            href="/ads"
            className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
          >
            Enter Experience (WebGPU)
          </Link>
          <Link
            href="/ai"
            className="px-8 py-3 rounded-full border border-neutral-700 hover:bg-neutral-900 transition-colors"
          >
            View AI Samples (FastVLM)
          </Link>
        </div>
      </main>

      {/* Footer / SEO Content */}
      <footer className="absolute bottom-8 text-sm text-neutral-600">
        <p>Powered by Next.js, NestJS, and WebGPU.</p>
      </footer>
    </div>
  );
}
