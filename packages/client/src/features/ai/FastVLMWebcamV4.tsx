'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Zap, X, AlertCircle, Loader2, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AIStatus = 'IDLE' | 'LOADING' | 'READY' | 'ERROR';
type CameraStatus = 'IDLE' | 'REQUESTING' | 'ACTIVE' | 'ERROR';

export const FastVLMWebcamV4 = () => {
    const router = useRouter();

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const modelRef = useRef<any>(null);
    const processorRef = useRef<any>(null);
    const tokenizerRef = useRef<any>(null);
    const isInferringRef = useRef(false);
    const inferenceIntervalRef = useRef<number | null>(null);

    // State
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>('IDLE');
    const [aiStatus, setAIStatus] = useState<AIStatus>('IDLE');
    const [aiProgress, setAIProgress] = useState(0);
    const [aiError, setAIError] = useState('');
    const [cameraError, setCameraError] = useState('');
    const [gpuInfo, setGpuInfo] = useState<string | null>(null);

    const [mode, setMode] = useState<'SINGLE' | 'CONTINUOUS'>('CONTINUOUS');
    const [caption, setCaption] = useState('Waiting for analysis...');
    const [inferenceTime, setInferenceTime] = useState(0);

    const MODEL_ID = "onnx-community/FastVLM-0.5B-ONNX";

    // 1. Initialize Camera IMMEDIATELY on mount
    useEffect(() => {
        const initCamera = async () => {
            setCameraStatus('REQUESTING');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setCameraStatus('ACTIVE');
                }
            } catch (e: any) {
                console.error("Camera error:", e);
                setCameraError(e.message || "Camera access denied");
                setCameraStatus('ERROR');
            }
        };

        initCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (inferenceIntervalRef.current) {
                clearInterval(inferenceIntervalRef.current);
            }
        };
    }, []);

    // 2. Initialize AI in BACKGROUND (parallel to camera)
    useEffect(() => {
        let isMounted = true;

        const initAI = async () => {
            setAIStatus('LOADING');

            try {
                // Check WebGPU
                // @ts-ignore
                if (!navigator.gpu) {
                    throw new Error("WebGPU not supported");
                }

                const adapterPromise = navigator.gpu.requestAdapter();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("GPU timeout")), 5000)
                );

                const adapter = await Promise.race([adapterPromise, timeoutPromise]) as any;
                if (!adapter) throw new Error("No GPU adapter");

                const info = adapter.info || { vendor: 'Generic', architecture: 'GPU' };
                setGpuInfo(`${info.vendor} ${info.architecture}`);

                // Load Transformers
                // @ts-ignore
                const { AutoProcessor, AutoModelForImageTextToText, env } = await import('@huggingface/transformers');

                env.allowLocalModels = false;
                env.useBrowserCache = true;
                // @ts-ignore
                env.backends.onnx.logLevel = 'fatal';

                const processor = await AutoProcessor.from_pretrained(MODEL_ID);
                processorRef.current = processor;
                tokenizerRef.current = processor.tokenizer;

                const model = await AutoModelForImageTextToText.from_pretrained(MODEL_ID, {
                    dtype: {
                        embed_tokens: "fp16",
                        vision_encoder: "q4",
                        decoder_model_merged: "q4",
                    },
                    device: 'webgpu',
                    // @ts-ignore
                    session_options: { logSeverityLevel: 4 },
                    progress_callback: (data: any) => {
                        if (isMounted && data.status === 'progress' && data.total) {
                            const p = Math.round((data.loaded / data.total) * 100);
                            setAIProgress(p);
                        }
                    }
                });

                modelRef.current = model;

                if (isMounted) {
                    setAIStatus('READY');
                }

            } catch (e: any) {
                console.error("AI Init Error:", e);
                if (isMounted) {
                    setAIStatus('ERROR');
                    setAIError(e.message || "Failed to load AI");
                }
            }
        };

        // Delay slightly to allow camera to start first
        const t = setTimeout(initAI, 300);

        return () => {
            isMounted = false;
            clearTimeout(t);
        };
    }, []);

    // 3. Inference Function
    const runInference = useCallback(async () => {
        if (isInferringRef.current) return;
        if (!videoRef.current || !canvasRef.current || !modelRef.current || !processorRef.current) return;
        if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) return;

        isInferringRef.current = true;

        try {
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            const w = videoRef.current.videoWidth;
            const h = videoRef.current.videoHeight;
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            ctx.drawImage(videoRef.current, 0, 0);

            const { RawImage, TextStreamer } = await import('@huggingface/transformers');

            const url = canvasRef.current.toDataURL('image/jpeg', 0.8);
            const image = await RawImage.fromURL(url);

            const messages = [
                { role: "user", content: "<image>Describe this image in detail." },
            ];

            const prompt = processorRef.current.apply_chat_template(messages, {
                add_generation_prompt: true,
            });

            const inputs = await processorRef.current(image, prompt, {
                add_special_tokens: false,
            });

            if (!inputs || Object.keys(inputs).length === 0) return;

            let currentText = "";
            const streamer = new TextStreamer(tokenizerRef.current, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (text: string) => {
                    currentText += text;
                    setCaption(currentText);
                }
            });

            const start = performance.now();
            await modelRef.current.generate({
                ...inputs,
                max_new_tokens: 40,
                do_sample: false,
                streamer,
            });
            const end = performance.now();
            setInferenceTime(Math.round(end - start));

        } catch (e) {
            console.error("Inference Error:", e);
        } finally {
            isInferringRef.current = false;
        }
    }, []);

    // 4. Continuous Mode Loop
    useEffect(() => {
        if (aiStatus !== 'READY' || cameraStatus !== 'ACTIVE') return;

        if (mode === 'CONTINUOUS') {
            // Run inference every 1000ms
            inferenceIntervalRef.current = window.setInterval(() => {
                runInference();
            }, 1000);
        } else {
            if (inferenceIntervalRef.current) {
                clearInterval(inferenceIntervalRef.current);
                inferenceIntervalRef.current = null;
            }
        }

        return () => {
            if (inferenceIntervalRef.current) {
                clearInterval(inferenceIntervalRef.current);
            }
        };
    }, [aiStatus, cameraStatus, mode, runInference]);

    // 5. Single Shot Handler
    const captureSingle = () => {
        if (aiStatus === 'READY' && cameraStatus === 'ACTIVE') {
            runInference();
        }
    };

    // 6. Stop Handler
    const handleStop = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        router.back();
    };

    return (
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
            <div className="relative aspect-video flex items-center justify-center bg-black overflow-hidden">
                {/* Video - Always visible */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Camera Error Overlay */}
                {cameraStatus === 'ERROR' && (
                    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <AlertCircle size={48} className="text-red-400 mx-auto" />
                            <h3 className="text-lg font-bold text-white">Camera Error</h3>
                            <p className="text-zinc-400">{cameraError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-zinc-800 rounded-full text-sm text-white"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Loading Indicator (Non-intrusive corner badge) */}
                {aiStatus === 'LOADING' && cameraStatus === 'ACTIVE' && (
                    <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                        <Loader2 size={16} className="text-emerald-400 animate-spin" />
                        <span className="text-xs text-emerald-400 font-mono">
                            Loading AI {aiProgress}%
                        </span>
                    </div>
                )}

                {/* AI Error Badge */}
                {aiStatus === 'ERROR' && cameraStatus === 'ACTIVE' && (
                    <div className="absolute top-4 left-4 z-30 bg-red-900/60 backdrop-blur-md px-3 py-2 rounded-lg border border-red-500/30 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-xs text-red-400 font-mono">
                            AI Failed: {aiError}
                        </span>
                    </div>
                )}

                {/* Active HUD */}
                {cameraStatus === 'ACTIVE' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
                        {/* Top Bar */}
                        <div className="p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center gap-2">
                                {aiStatus === 'READY' && (
                                    <>
                                        <span className="text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded">
                                            FastVLM ({inferenceTime}ms)
                                        </span>
                                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            {mode}
                                        </span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleStop}
                                className="pointer-events-auto p-2 bg-black/40 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Mode Toggle (only when AI is ready) */}
                        {aiStatus === 'READY' && (
                            <div className="absolute top-20 left-4 pointer-events-auto flex gap-2">
                                <button
                                    onClick={() => setMode('SINGLE')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'SINGLE'
                                            ? 'bg-emerald-500 text-black'
                                            : 'bg-black/40 text-zinc-400 hover:bg-black/60'
                                        }`}
                                >
                                    Single
                                </button>
                                <button
                                    onClick={() => setMode('CONTINUOUS')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'CONTINUOUS'
                                            ? 'bg-emerald-500 text-black'
                                            : 'bg-black/40 text-zinc-400 hover:bg-black/60'
                                        }`}
                                >
                                    Continuous
                                </button>
                            </div>
                        )}

                        {/* Capture Button (Single Mode) */}
                        {aiStatus === 'READY' && mode === 'SINGLE' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button
                                    onClick={captureSingle}
                                    className="pointer-events-auto p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full border-4 border-white transition-all hover:scale-110 active:scale-95"
                                >
                                    <Camera size={48} className="text-white" />
                                </button>
                            </div>
                        )}

                        {/* Caption Box */}
                        {aiStatus === 'READY' && (
                            <div className="p-4 bg-black/60 backdrop-blur-sm m-4 rounded-xl border border-white/10">
                                <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                                    {caption}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
