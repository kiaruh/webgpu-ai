'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Eye, Zap, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the types for the pipeline function
type PipelineFunction = any;

// Add this to prevent TS errors if the library doesn't have perfect types yet
// In a stricter setup, we would import the types from @xenova/transformers
let pipeline: PipelineFunction;

export const FastVLMWebcam = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [subtitle, setSubtitle] = useState<string>("Initializing Neural Network...");
    const [lastInferenceTime, setLastInferenceTime] = useState<number>(0);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [libLoaded, setLibLoaded] = useState(false);

    // Using a smaller, faster model for real-time browser inference
    const MODEL_NAME = 'Xenova/vit-gpt2-image-captioning';
    const captionerRef = useRef<any>(null);

    const router = useRouter();

    // 1. Load Library & Model Automatically
    useEffect(() => {
        let isMounted = true;

        const initPipeline = async () => {
            if (libLoaded || modelLoading || modelReady) return;

            setModelLoading(true);
            try {
                // @ts-ignore
                const Transformers = await import('@xenova/transformers');

                const p = Transformers.pipeline || (Transformers as any).default?.pipeline;
                const env = Transformers.env || (Transformers as any).default?.env;

                if (!p || !env) throw new Error("Transformers lib mismatch");

                env.allowLocalModels = false;
                env.useBrowserCache = true;
                pipeline = p;

                if (!isMounted) return;
                setLibLoaded(true);

                // Auto-load model
                setSubtitle("Downloading AI Model (approx 40MB)...");
                captionerRef.current = await pipeline('image-to-text', MODEL_NAME, {
                    progress_callback: (data: any) => {
                        if (data.status === 'progress' && data.total) {
                            const percent = Math.round((data.loaded / data.total) * 100);
                            setSubtitle(`Downloading AI Model: ${percent}%`);
                        }
                    }
                });

                if (!isMounted) return;
                setModelReady(true);
                setSubtitle("System Ready. Waiting for activation.");
            } catch (error) {
                console.error("Init Error:", error);
                setSubtitle("Error: Failed to initialize AI.");
            } finally {
                if (isMounted) setModelLoading(false);
            }
        };

        initPipeline();

        return () => { isMounted = false; };
    }, []); // Run once on mount

    const handleStartExperience = async () => {
        try {
            setSubtitle("Requesting camera access...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Note: Playback is handled by the onLoadedMetadata prop in the JSX
                    setIsStreaming(true);
                    setIsAnalyzing(true);
                    setSubtitle("Analyzing visual feed...");
                }
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setSubtitle("Error: Camera access denied. Please check permissions.");
        }
    };

    const stopExperience = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
        setIsAnalyzing(false);
        setSubtitle("Experience stopped.");
        router.back();
    };

    // Inference Loop using recursive timeout for performance stability
    useEffect(() => {
        let isLooping = true;
        let timeoutId: NodeJS.Timeout;

        const runInference = async () => {
            if (!isAnalyzing || !isStreaming || !captionerRef.current || !videoRef.current || !canvasRef.current) return;

            try {
                const context = canvasRef.current.getContext('2d');
                if (!context) return;

                // Ensure video has dimensions before drawing
                if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                    console.warn("Video waiting for dimensions...");
                    // Try again quickly if video just started
                    if (isLooping) timeoutId = setTimeout(runInference, 500);
                    return;
                }

                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const imageUrl = canvasRef.current.toDataURL('image/jpeg');

                const start = performance.now();
                const result = await captionerRef.current(imageUrl);
                const caption = result[0]?.generated_text || "Processing...";

                setSubtitle(caption);
                setLastInferenceTime(Math.round(performance.now() - start));
            } catch (e) {
                console.error(e);
            } finally {
                // Schedule next run only after current finishes
                if (isLooping && isAnalyzing) {
                    timeoutId = setTimeout(runInference, 1000); // 1s delay to prevent CPU lockup
                }
            }
        };

        if (isAnalyzing && isStreaming && modelReady) {
            runInference();
        }

        return () => {
            isLooping = false;
            clearTimeout(timeoutId);
        };
    }, [isAnalyzing, isStreaming, modelReady]);


    return (
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-emerald-900/20">
            {/* Video Feed or Placeholder */}
            <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden group">

                {/* Initial State / Loading */}
                {!isStreaming && (
                    <div className="text-center p-8 space-y-6 z-10 max-w-md">
                        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            {modelLoading ? (
                                <div className="absolute inset-0 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                            ) : (
                                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-pulse opacity-50" />
                            )}
                            <Camera size={32} className={`text-emerald-400 ${modelLoading ? 'animate-pulse' : ''}`} />
                        </div>

                        <h3 className="text-2xl font-bold text-white">
                            {modelLoading ? 'Initializing Neural Link' : 'Visual Intelligence System'}
                        </h3>

                        <p className="text-zinc-400">
                            {modelLoading
                                ? 'Downloading model parameters (40MB)... please wait.'
                                : 'Ready to analyze live video feed using local WebGPU inference.'}
                        </p>

                        {!modelLoading && (
                            <button
                                onClick={handleStartExperience}
                                disabled={!modelReady}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                            >
                                <Zap size={20} className="fill-white" />
                                Start Experience
                            </button>
                        )}

                        {/* Error Retry - Only if stuck? We rely on re-clicking start if camera failed */}
                        {subtitle.startsWith("Error") && (
                            <p className="text-red-400 bg-red-900/20 p-2 rounded text-sm mt-4">{subtitle}</p>
                        )}
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                        console.log("Video metadata loaded, forcing play");
                        videoRef.current?.play().catch(e => console.error("Auto-play error:", e));
                    }}
                    className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${!isStreaming ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
                />

                {/* Live Overlay */}
                {isStreaming && (
                    <>
                        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs font-mono text-red-100 tracking-wider">LIVE FEED</span>
                                </div>
                                <div className="text-xs font-mono text-emerald-400">
                                    {lastInferenceTime > 0 ? `${lastInferenceTime}ms` : 'Init...'}
                                </div>
                            </div>

                            <button
                                onClick={stopExperience}
                                className="p-3 bg-black/40 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-full text-white hover:text-red-400 transition-colors backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Subtitle Zone */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex justify-center bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <div className="max-w-2xl text-center space-y-2">
                                <p className="text-2xl md:text-3xl font-medium text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    "{subtitle}"
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

