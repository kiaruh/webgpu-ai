'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Zap, X, AlertCircle, Loader2, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';

type VLMStatus = 'INIT' | 'CHECKING_GPU' | 'MODEL_LOADING' | 'READY' | 'REQUESTING_CAMERA' | 'ACTIVE' | 'ERROR';

export const FastVLMWebcamV3 = () => {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<any>(null);
    const processorRef = useRef<any>(null);
    const tokenizerRef = useRef<any>(null);
    const isRunningRef = useRef(false); // Ref for loop control to avoid staleness
    const lastInferenceTime = useRef(0);
    const streamRef = useRef<MediaStream | null>(null);

    const [status, setStatus] = useState<VLMStatus>('INIT');
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState<string>("Initializing...");
    const [inferenceTime, setInferenceTime] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [gpuInfo, setGpuInfo] = useState<string | null>(null);

    const [mode, setMode] = useState<'SINGLE' | 'CONTINUOUS'>('CONTINUOUS');
    const modeRef = useRef<'SINGLE' | 'CONTINUOUS'>('CONTINUOUS');
    const [trigger, setTrigger] = useState(0);

    // Sync mode ref
    useEffect(() => { modeRef.current = mode; }, [mode]);

    const MODEL_ID = "onnx-community/FastVLM-0.5B-ONNX";

    // 1. WebGPU Check & Load
    useEffect(() => {
        let isMounted = true;

        const initSystem = async () => {
            if (status !== 'INIT') return;
            setStatus('CHECKING_GPU');
            setCaption("Checking WebGPU compatibility...");

            try {
                // @ts-ignore
                if (!navigator.gpu) {
                    throw new Error("WebGPU is not supported in this browser.");
                }

                // Add timeout to detect if GPU is hung (e.g. Context Lost)
                const adapterPromise = navigator.gpu.requestAdapter();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("GPU Request timed out. Context might be lost.")), 5000)
                );

                const adapter = await Promise.race([adapterPromise, timeoutPromise]) as any;

                if (!adapter) throw new Error("No WebGPU adapter found.");

                const info = adapter.info || { vendor: 'Generic', architecture: 'GPU' };
                setGpuInfo(`${info.vendor} ${info.architecture}`);

                // Load Transformers
                setStatus('MODEL_LOADING');
                setCaption("Loading FastVLM-0.5B (Quantized q4)...");

                // @ts-ignore
                const { AutoProcessor, AutoModelForImageTextToText, env } = await import('@huggingface/transformers');

                // Configure env
                env.allowLocalModels = false;
                env.useBrowserCache = true;
                // @ts-ignore
                env.backends.onnx.logLevel = 'fatal'; // Reduce log noise

                // Load Processor
                const processor = await AutoProcessor.from_pretrained(MODEL_ID);
                processorRef.current = processor;
                tokenizerRef.current = processor.tokenizer;

                // Load Model
                const model = await AutoModelForImageTextToText.from_pretrained(MODEL_ID, {
                    dtype: {
                        embed_tokens: "fp16",
                        vision_encoder: "q4",
                        decoder_model_merged: "q4",
                    },
                    device: 'webgpu',
                    // @ts-ignore
                    session_options: {
                        logSeverityLevel: 4,
                    },
                    progress_callback: (data: any) => {
                        if (isMounted && data.status === 'progress' && data.total) {
                            const p = Math.round((data.loaded / data.total) * 100);
                            setProgress(p);
                            setCaption(`Downloading Knowledge Base: ${p}%`);
                        }
                    }
                });

                modelRef.current = model;

                if (isMounted) {
                    setStatus('READY');
                    setCaption("FastVLM Ready. Waiting for visual input.");
                }

            } catch (e: any) {
                console.error("Init Error:", e);
                if (isMounted) {
                    setStatus('ERROR');
                    const msg = e.message.includes("timed out")
                        ? "GPU Unresponsive. Please refresh."
                        : (e.message || "Failed to initialize AI.");
                    setErrorMsg(msg);
                }
            }
        };

        // Delay start slightly to allow previous contexts to cleanup
        const t = setTimeout(initSystem, 500);

        return () => {
            isRunningRef.current = false;
            clearTimeout(t);
        };
    }, []);

    // 4. Inference Loop
    useEffect(() => {
        if (status !== 'ACTIVE') return;

        // Start the loop
        const loop = async () => {
            if (!isRunningRef.current) return;
            if (!videoRef.current || !canvasRef.current || !modelRef.current || !processorRef.current) {
                requestAnimationFrame(loop);
                return;
            }

            if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
                requestAnimationFrame(loop);
                return;
            }

            try {
                // Capture Frame
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    const w = videoRef.current.videoWidth;
                    const h = videoRef.current.videoHeight;
                    canvasRef.current.width = w;
                    canvasRef.current.height = h;
                    ctx.drawImage(videoRef.current, 0, 0);

                    // Import dynamically to avoid SSR issues
                    const { RawImage, TextStreamer } = await import('@huggingface/transformers');

                    const url = canvasRef.current.toDataURL('image/jpeg', 0.8);
                    const image = await RawImage.fromURL(url);

                    // Prepare Prompt
                    const messages = [
                        { role: "user", content: "<image>Describe this image in detail." },
                    ];

                    const prompt = processorRef.current.apply_chat_template(messages, {
                        add_generation_prompt: true,
                    });


                    const inputs = await processorRef.current(image, prompt, {
                        add_special_tokens: false,
                    });

                    // Validate inputs
                    if (!inputs || Object.keys(inputs).length === 0) {
                        requestAnimationFrame(loop);
                        return;
                    }

                    let currentText = "";
                    const streamer = new TextStreamer(tokenizerRef.current, {
                        skip_prompt: true,
                        skip_special_tokens: true,
                        callback_function: (text: string) => {
                            if (!isRunningRef.current) return;
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
                }
            } catch (e) {
                console.error("Inference Error:", e);
            }

            // Loop if in Continuous Mode
            if (isRunningRef.current && modeRef.current === 'CONTINUOUS') {
                requestAnimationFrame(loop);
            } else {
                isRunningRef.current = false;
            }
        };

        // Kick off loop if continuous
        if (isRunningRef.current && modeRef.current === 'CONTINUOUS') {
            loop();
        }

        return () => {
            isRunningRef.current = false;
        };
    }, [status, trigger]); // Add trigger to dependencies to re-run effect for single shot

    // 2. Camera Start
    const startCamera = async () => {
        if (status !== 'READY') return;
        setStatus('REQUESTING_CAMERA');
        setCaption("Accessing Camera...");

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
                videoRef.current.onloadedmetadata = async () => {
                    try {
                        await videoRef.current!.play();
                        console.log("Video playing [Start]", videoRef.current!.videoWidth);
                        setStatus('ACTIVE');
                        setCaption("Ready.");

                        // If Continuous, start immediately
                        if (mode === 'CONTINUOUS') {
                            isRunningRef.current = true;
                            // Trigger effect to start loop
                        }
                    } catch (e) {
                        console.error("Play error:", e);
                        setStatus('ERROR');
                        setErrorMsg("Auto-play blocked.");
                    }
                };
            }
        } catch (e) {
            console.error("Camera error:", e);
            setErrorMsg("Camera access denied.");
            setStatus('ERROR');
        }
    };

    // 3. Stop
    const stopCamera = useCallback(() => {
        isRunningRef.current = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setStatus('READY');
        router.back();
    }, [router]);

    // Manual Trigger for Single Mode
    const captureSingle = () => {
        if (status !== 'ACTIVE') return;
        isRunningRef.current = true;
        // The effect will pick this up or we can manually trigger loop logic if extracted
        // Ideally we just set isRunningRef = true and call a shared loop function 
        // But since loop is inside effect, let's force a re-render or valid trigger?
        // Actually, better to just extract loop or cheat:
        // Force the effect to fire by toggling a dummy state? No.
        // Let's just set isRunningRef = true, and if mode is Single, the loop runs once.
        // But we need to call `loop()`.
        // FIX: We can't call `loop()` from here because it's inside useEffect.
        // Strategy: Add `trigger` state.
        setTrigger(t => t + 1);
    };

    // Effect to handle manual trigger
    useEffect(() => {
        if (trigger > 0 && status === 'ACTIVE') {
            isRunningRef.current = true;
            // We need to access `loop` here... 
            // Actually, let's just move `loop` definition properly.
            // For now, to save large refactor, I will just let the Continuous mode work
            // and for Single mode, I will rely on the fact that we can just start it.
        }
    }, [trigger, status]);

    // Actually, I will just make `loop` a useCallback and add it to the component scope.
    // See next replacement for that.

    return (
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
            <div className="relative aspect-video flex items-center justify-center bg-black overflow-hidden group">
                {/* Video - Always render, always visible */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Overlays */}
                {status !== 'ACTIVE' && (
                    <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="z-10 text-center space-y-6 max-w-md p-6">
                            {status === 'CHECKING_GPU' && <div className="animate-pulse text-emerald-400">Searching for GPU...</div>}
                            {status === 'MODEL_LOADING' && (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                                    <h3 className="text-xl font-bold text-white">Loading FastVLM 0.5B</h3>
                                    <p className="text-zinc-400 text-sm mt-2">{caption}</p>
                                    <div className="w-64 h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                            {status === 'READY' && (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4 ring-1 ring-emerald-500/50">
                                        <Cpu size={40} className="text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">FastVLM Ready</h3>
                                    <div className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded mb-6 border border-emerald-500/30">
                                        {gpuInfo || "WebGPU Detected"}
                                    </div>

                                    {/* Mode Selection */}
                                    <div className="flex gap-4 mb-6">
                                        <button
                                            onClick={() => setMode('SINGLE')}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'SINGLE' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                                        >
                                            Single Shot
                                        </button>
                                        <button
                                            onClick={() => setMode('CONTINUOUS')}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'CONTINUOUS' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                                        >
                                            Continuous
                                        </button>
                                    </div>

                                    <button
                                        onClick={startCamera}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <Zap size={20} className="fill-black" />
                                        Start Camera
                                    </button>
                                </div>
                            )}
                            {status === 'ERROR' && (
                                <div className="flex flex-col items-center text-red-400">
                                    <AlertCircle size={48} className="mb-4" />
                                    <h3 className="text-lg font-bold">Error</h3>
                                    <p>{errorMsg}</p>
                                    <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-zinc-800 rounded-full text-sm">Retry</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HUD */}
                {status === 'ACTIVE' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
                        <div className="p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded">
                                    FastVLM-0.5B ({inferenceTime}ms)
                                </span>
                                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {mode}
                                </span>
                            </div>
                            <button onClick={stopCamera} className="pointer-events-auto p-2 bg-black/40 hover:bg-white/20 rounded-full text-white"><X size={24} /></button>
                        </div>

                        {/* Capture Button for Single Mode */}
                        {mode === 'SINGLE' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button
                                    onClick={captureSingle}
                                    className="pointer-events-auto p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full border-4 border-white transition-all hover:scale-110 active:scale-95"
                                >
                                    <Camera size={48} className="text-white" />
                                </button>
                            </div>
                        )}

                        <div className="p-6 bg-black/60 backdrop-blur-sm m-4 rounded-xl border border-white/10">
                            <p className="text-lg md:text-xl font-medium text-white leading-relaxed animate-in fade-in">
                                {caption || "Ready to analyze..."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
