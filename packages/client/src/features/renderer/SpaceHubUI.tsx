'use client';

import { HubState, POIConfig } from './SpaceHubTypes';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface SpaceHubUIProps {
    hubState: HubState;
    selectedPOI: POIConfig | null;
    onClose: () => void;
}

export function SpaceHubUI({ hubState, selectedPOI, onClose }: SpaceHubUIProps) {
    const router = useRouter();

    // HUD visible only in IDLE
    if (hubState === 'IDLE_HUB') {
        return (
            <div className="absolute inset-0 pointer-events-none p-8">
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-widest">IMMERSIVE INTELLIGENCE</h1>
                        <p className="text-xs text-purple-400 uppercase tracking-[0.5em]">Home Sector</p>
                    </div>
                </header>

                <div className="absolute bottom-12 left-0 right-0 text-center">
                    <p className="text-white/60 text-sm animate-pulse">Click a destination to approach</p>
                </div>
            </div>
        );
    }

    if (hubState === 'MODAL_OPEN' && selectedPOI) {
        // Dynamic positioning: Centered for Routes, Right Slide-in for Chat
        const isChat = selectedPOI.id === 'CHAT';
        const positionClasses = isChat
            ? "absolute right-8 top-1/2 -translate-y-1/2 w-96 h-[600px]"
            : "absolute inset-0 flex items-center justify-center p-4";

        const cardClasses = isChat
            ? "bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl w-full h-full shadow-2xl relative flex flex-col"
            : "bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300";

        return (
            <div className={isChat ? "" : "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"}>
                <div className={isChat ? positionClasses : "contents"}>
                    <div className={cardClasses}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                {selectedPOI.id === 'CHAT' && '📡'}
                                {selectedPOI.id === 'ADS' && '✈️'}
                                {selectedPOI.id === 'AI' && '🔬'}
                                {selectedPOI.label}
                            </h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="p-8">
                            {selectedPOI.id === 'CHAT' && (
                                <div className="h-[400px] flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <p className="text-zinc-400 text-lg">Chat Service Offline</p>
                                        <p className="text-zinc-600 text-sm">Backend deployment required</p>
                                    </div>
                                </div>
                            )}

                            {selectedPOI.id === 'ADS' && (
                                <div className="text-center space-y-6">
                                    <p className="text-lg text-zinc-300">
                                        You are about to enter the <strong>Ads Transport Ship</strong>.
                                        Inside you will find interactive WebGPU demonstrations.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={onClose} className="px-6 py-3 rounded-full border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => router.push('/ads-samples')}
                                            className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-lg shadow-purple-900/20"
                                        >
                                            Enter Ship
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedPOI.id === 'AI' && (
                                <div className="text-center space-y-6">
                                    <p className="text-lg text-zinc-300">
                                        Requesting access to <strong>Level 5 Secure Research Facility</strong>.
                                        Client-side neural networks active.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={onClose} className="px-6 py-3 rounded-full border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => router.push('/applied-ai')}
                                            className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-lg shadow-emerald-900/20"
                                        >
                                            Enter Lab
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Transition state UI (minimal)
    return (
        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
            <p className="text-purple-400 text-sm font-mono animate-pulse">APPROACHING TARGET...</p>
        </div>
    );
}
