import { InteractiveAdSample } from '@/features/ads/InteractiveAdSample';
import { WebGPUCanvas } from '@/features/renderer/WebGPUCanvas';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Interactive 3D Ad Sample | Immersive Intelligence',
    description: 'A WebGPU-powered interactive ad experience.',
};

export default function InteractiveAdPage() {
    return (
        <div className="flex flex-col h-screen bg-zinc-900 text-white">
            <header className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h1 className="text-xl font-bold">Interactive Ad Sample</h1>
                <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Back to Home
                </a>
            </header>

            <main className="flex-1 relative">
                <div className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-zinc-300">Click the cube to scale it!</p>
                </div>
                <WebGPUCanvas>
                    <InteractiveAdSample />
                </WebGPUCanvas>
            </main>
        </div>
    );
}
