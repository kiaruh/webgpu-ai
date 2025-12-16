import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Box, Globe, Gamepad2, Sparkles, Cpu, Layers } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Interactive WebGPU Ads | Immersive Intelligence',
    description: 'Explore our gallery of next-generation interactive 3D advertising samples.',
};

interface AdSample {
    title: string;
    description: string;
    href: string;
    icon: any;
    tags: string[];
    color: string;
}

const adSamples: AdSample[] = [
    {
        title: 'Cyber Burger',
        description: 'Procedural food customization with interactive physics-based layers.',
        href: '/ads-samples/product-interactive-webgpu-ads',
        icon: Box,
        tags: ['Procedural Geometry', 'React Three Fiber', 'Exploded View'],
        color: 'text-amber-400'
    },
    {
        title: 'Azure 360',
        description: 'High-fidelity travel portal with immersive environmental lighting.',
        href: '/ads-samples/travel-interactive-webgpu-ads',
        icon: Globe,
        tags: ['360° Skybox', 'Environment Map', 'Spatial Audio'],
        color: 'text-cyan-400'
    },
    {
        title: 'Neon Glide',
        description: 'WebGPU-accelerated endless runner with thousands of particles.',
        href: '/ads-samples/game-interactive-webgpu-ads',
        icon: Gamepad2,
        tags: ['WebGPU Compute', 'Instanced Mesh', 'Post-Processing'],
        color: 'text-fuchsia-400'
    }
];

export default function AdsSamplesPage() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden selection:bg-white/20">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-20 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-indigo-300 mb-4">
                        <Sparkles size={12} />
                        <span>NEXT-GEN ADVERTISING</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Immersive Ads
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Experience the future of web marketing. Zero-latency 3D interactions powered by WebGPU and React Three Fiber.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mt-8 border-b border-transparent hover:border-white/50 pb-0.5"
                    >
                        <ArrowRight className="rotate-180" size={14} />
                        Back to Platform
                    </Link>
                </header>

                {/* Grid */}
                <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {adSamples.map((sample, idx) => {
                        const Icon = sample.icon;
                        return (
                            <Link
                                key={sample.href}
                                href={sample.href}
                                className="group relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-zinc-900/80 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
                            >
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Icon Header */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 ${sample.color}`}>
                                            <Icon size={32} />
                                        </div>
                                        <ArrowRight className="text-zinc-600 group-hover:text-white -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>

                                    {/* Content */}
                                    <h2 className="text-2xl font-bold mb-3">{sample.title}</h2>
                                    <p className="text-zinc-400 leading-relaxed mb-8 flex-grow">
                                        {sample.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {sample.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-zinc-400 group-hover:text-zinc-200 border border-transparent group-hover:border-white/10 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </main>
            </div>
        </div>
    );
}
