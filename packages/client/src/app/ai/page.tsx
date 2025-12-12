import { FastVLMRunner } from '@/features/ai/FastVLMRunner';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Client-side AI | FastVLM',
    description: 'Run large vision-language models directly in your browser.',
};

export default function AIPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Client-side AI</h1>
                <p className="text-zinc-400">Powered by WebGPU and ONNX Runtime</p>
                <Link href="/" className="mt-4 inline-block text-sm text-purple-400 hover:text-purple-300">
                    &larr; Back to Home
                </Link>
            </header>

            <main>
                <FastVLMRunner />
            </main>
        </div>
    );
}
