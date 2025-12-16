import { SpaceHubWrapper } from '@/features/renderer/SpaceHubWrapper';

// ... (keep metadata)

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
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      {/* Semantic Helper for SEO/Bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 3D Experience (Navigation is inside the scene) */}
      <SpaceHubWrapper />

      {/* 
        ChatWidget is now embedded inside SpaceHub for consistent 'in-world' experience.
        If we wanted a global fallback, we could render it here with !embedded, 
        but the new UX spec says Chat sits inside a "Chat Station" POI.
      */}
    </div>
  );
}
