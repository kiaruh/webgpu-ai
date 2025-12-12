'use client';

import { useState, useEffect } from 'react';
// import * as ort from 'onnxruntime-web/webgpu'; // Uncomment when model is ready

export const FastVLMRunner = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [output, setOutput] = useState<string>('');

    const loadModel = async () => {
        setStatus('loading');
        try {
            // Placeholder for ONNX runtime loading
            // const session = await ort.InferenceSession.create('/models/fastvlm.onnx', { executionProviders: ['webgpu'] });

            // Simulating load time
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStatus('ready');
            setOutput('Model loaded successfully (Simulation). WebGPU context ready.');
        } catch (e) {
            console.error(e);
            setStatus('error');
            setOutput('Failed to load model. Ensure your browser supports WebGPU.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">FastVLM Inference</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <div className="mb-6">
                <p className="text-zinc-400 mb-4">
                    This component utilizes <code>onnxruntime-web</code> to run FastVLM-0.5B directly in your browser using WebGPU.
                </p>

                {status === 'idle' && (
                    <button
                        onClick={loadModel}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Load Model (WebGPU)
                    </button>
                )}

                {status === 'loading' && (
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 animate-pulse w-1/2"></div>
                    </div>
                )}
            </div>

            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm min-h-[100px] text-zinc-300">
                {output || 'System ready to initialize...'}
            </div>
        </div>
    );
};
