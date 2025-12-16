import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Applied AI Samples | Immersive Intelligence',
    description: 'Real-world applications of client-side AI using FastVLM and WebGPU.',
};

interface AISample {
    title: string;
    description: string;
    href: string;
    icon: string;
    bgGradient: string;
}

const aiSamples: AISample[] = [
    {
        title: 'FastVLM On-Screen',
        description: 'Real-time vision-language model analyzing your webcam feed to generate live subtitles.',
        href: '/applied-ai/fastvlm-onscreen',
        icon: '👁️',
        bgGradient: 'from-emerald-500/20 to-green-500/20'
    },
    // Placeholders for future samples
    {
        title: 'Object Detection',
        description: 'Identify and track multiple objects in real-time updates.',
        href: '#',
        icon: '🔍',
        bgGradient: 'from-indigo-500/20 to-purple-500/20'
    },
    {
        title: 'Client-Side RAG',
        description: 'Retrieval Augmented Generation running entirely in browser.',
        href: '#',
        icon: '🧠',
        bgGradient: 'from-rose-500/20 to-pink-500/20'
    }
];

export default function AppliedAIPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="mb-12 max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-600">
                    Applied AI Samples
                </h1>
                <p className="text-zinc-400 text-lg">
                    Showcasing practical applications of client-side Artificial Intelligence.
                </p>
                <Link href="/" className="mt-8 inline-block text-sm text-zinc-500 hover:text-white transition-colors">
                    &larr; Back to Home
                </Link>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiSamples.map((sample) => (
                    <Link
                        key={sample.title}
                        href={sample.href}
                        className={`group relative p-8 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${sample.bgGradient} ${sample.href === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                        <div className="relative z-10">
                            <span className="text-4xl mb-4 block">{sample.icon}</span>
                            <h2 className="text-2xl font-semibold mb-2">{sample.title}</h2>
                            <p className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                {sample.description}
                            </p>
                            {sample.href !== '#' && (
                                <div className="mt-6 flex items-center text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                                    Try Demo <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </div>
                            )}
                            {sample.href === '#' && (
                                <div className="mt-6 flex items-center text-sm font-medium text-white/40">
                                    Coming Soon
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </main>
        </div>
    );
}
