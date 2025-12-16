import Link from 'next/link';
import { Metadata } from 'next';
import { FastVLMWebcamV3 } from '@/features/ai/FastVLMWebcamV3';

export const metadata: Metadata = {
    title: 'FastVLM On-Screen | Immersive Intelligence',
    description: 'Real-time webcam analysis using FastVLM.',
};

export default function FastVLMOnScreenPage() {
    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <header className="p-4 border-b border-zinc-900 flex justify-between items-center z-10 bg-black/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/applied-ai" className="text-zinc-400 hover:text-white transition-colors">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold">FastVLM On-Screen</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <FastVLMWebcamV3 />

                <div className="mt-8 max-w-2xl text-center text-zinc-400">
                    <p>
                        This demo uses WebGPU to run vision-language models directly in your browser,
                        analyzing your video feed privacy-first without sending data to the cloud.
                    </p>
                </div>
            </main>
        </div>
    );
}
