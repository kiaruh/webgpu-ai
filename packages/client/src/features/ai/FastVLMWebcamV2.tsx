'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Eye, Zap, X, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type VLMStatus = 'INIT' | 'MODEL_LOADING' | 'READY' | 'REQUESTING_CAMERA' | 'ACTIVE' | 'ERROR';

export const FastVLMWebcamV2 = () => {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const captionerRef = useRef<any>(null); // Holds the Transformers.js pipeline
    const streamRef = useRef<MediaStream | null>(null);

    const [status, setStatus] = useState<VLMStatus>('INIT');
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState<string>("Initializing system...");
    const [inferenceTime, setInferenceTime] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    const MODEL_NAME = 'Xenova/vit-gpt2-image-captioning';

    // 1. Initialize Model on Mount
    useEffect(() => {
        let isMounted = true;

        const loadModel = async () => {
            if (status !== 'INIT') return;
            setStatus('MODEL_LOADING');
            setCaption("Preparing Neural Network...");

            try {
                // @ts-ignore
                const Transformers = await import('@xenova/transformers');
                // Configure env
                Transformers.env.allowLocalModels = false;
                Transformers.env.useBrowserCache = true;

                const pipeline = Transformers.pipeline;

                // Load pipeline
                captionerRef.current = await pipeline('image-to-text', MODEL_NAME, {
                    progress_callback: (data: any) => {
                        if (isMounted && data.status === 'progress' && data.total) {
                            const p = Math.round((data.loaded / data.total) * 100);
                            setProgress(p);
                            setCaption(`Downloading Knowledge Base: ${p}%`);
                        }
                    }
                });

                if (isMounted) {
                    setStatus('READY');
                    setCaption("System Ready. Waiting for visual input.");
                }
            } catch (e: any) {
                console.error("Model Load Error:", e);
                if (isMounted) {
                    setStatus('ERROR');
                    setErrorMsg("Failed to load AI model. Please refresh.");
                }
            }
        };

        loadModel();

        return () => { isMounted = false; };
    }, []);

    // 2. Start Camera Flow
    const startCamera = async () => {
        if (status !== 'READY') return;
        setStatus('REQUESTING_CAMERA');
        setCaption("Accessing Optical Sensors...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 }, // Lower res for faster inference
                    height: { ideal: 480 }
                }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important: Wait for metadata to play
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().then(() => {
                        setStatus('ACTIVE');
                        setCaption("Visual Stream Active. Analyzing...");
                    }).catch(e => {
                        console.error("Play error:", e);
                        setErrorMsg("Camera blocked. Please allow autoplay.");
                        setStatus('ERROR');
                    });
                };
            }
        } catch (e) {
            console.error("Camera Error:", e);
            setStatus('ERROR');
            setErrorMsg("Camera access denied. Check permissions.");
        }
    };

    // 3. Stop Flow
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStatus('READY');
        router.back();
    }, [router]);

    // 4. Inference Loop
    useEffect(() => {
        if (status !== 'ACTIVE') return;

        let isRunning = true;
        let timeoutId: NodeJS.Timeout;

        const loop = async () => {
            if (!isRunning) return;
            if (!videoRef.current || !canvasRef.current || !captionerRef.current) {
                timeoutId = setTimeout(loop, 500);
                return;
            }

            // Check if video is actually ready
            if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
                // Video not ready/playing yet
                timeoutId = setTimeout(loop, 200);
                return;
            }

            try {
                // Draw frame
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);

                    const url = canvasRef.current.toDataURL('image/jpeg', 0.8); // slight compression

                    const start = performance.now();
                    const result = await captionerRef.current(url);
                    const end = performance.now();

                    if (isRunning && result?.[0]) {
                        setCaption(result[0].generated_text);
                        setInferenceTime(Math.round(end - start));
                    }
                }
            } catch (e) {
                console.error("Inference Error:", e);
            } finally {
                if (isRunning) {
                    // Schedule next frame with a small delay to not kill CPU
                    timeoutId = setTimeout(loop, 1000);
                }
            }
        };

        loop();

        return () => {
            isRunning = false;
            clearTimeout(timeoutId);
        };
    }, [status]);

    return (
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">

            {/* Main Viewport */}
            <div className="relative aspect-video flex items-center justify-center bg-black overflow-hidden">

                {/* 1. Underlying Video (Always present in DOM for init) */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    style={{ opacity: status === 'ACTIVE' ? 1 : 0 }}
                />

                {/* 2. UI Overlays based on Status */}

                {/* Loading / Ready State */}
                {status !== 'ACTIVE' && (
                    <div className="z-10 text-center space-y-6 max-w-md p-6">
                        {status === 'MODEL_LOADING' && (
                            <div className="flex flex-col items-center animate-pulse">
                                <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                                <h3 className="text-xl font-bold text-white">Initializing Neural Core</h3>
                                <p className="text-zinc-400 text-sm mt-2">{caption}</p>
                                <div className="w-64 h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        {status === 'READY' && (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <div className="p-4 bg-emerald-500/10 rounded-full mb-4 ring-1 ring-emerald-500/50">
                                    <Camera size={40} className="text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Visual Intelligence Ready</h3>
                                <p className="text-zinc-400 mb-6">
                                    Connect your camera to begin real-time analysis using local WebGPU.
                                </p>
                                <button
                                    onClick={startCamera}
                                    className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <Zap size={20} className="fill-black" />
                                    Start Experience
                                </button>
                            </div>
                        )}

                        {status === 'REQUESTING_CAMERA' && (
                            <div className="text-zinc-300 flex flex-col items-center">
                                <Loader2 className="animate-spin mb-2" />
                                <p>Checking permissions...</p>
                            </div>
                        )}

                        {status === 'ERROR' && (
                            <div className="flex flex-col items-center text-red-400">
                                <AlertCircle size={48} className="mb-4" />
                                <h3 className="text-lg font-bold">System Error</h3>
                                <p>{errorMsg}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-sm"
                                >
                                    Reload System
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Active HUD Overlay */}
                {status === 'ACTIVE' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                        {/* Header */}
                        <div className="p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full backdrop-blur-md">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs font-mono text-red-100 tracking-wider">LIVE</span>
                                </div>
                                <span className="text-xs font-mono text-emerald-400 bg-black/50 px-2 py-1 rounded">
                                    LATENCY: {inferenceTime}ms
                                </span>
                            </div>

                            <button
                                onClick={stopCamera}
                                className="pointer-events-auto p-2 bg-black/40 hover:bg-red-500/20 rounded-full text-white/80 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Footer Caption */}
                        <div className="p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent pb-12">
                            <p className="text-center text-2xl md:text-3xl font-medium text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-2">
                                "{caption}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden Canvas for Processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
