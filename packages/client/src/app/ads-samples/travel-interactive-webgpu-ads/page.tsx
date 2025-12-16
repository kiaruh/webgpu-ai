'use client';

import Link from 'next/link';
import { TravelStage } from '@/features/ads/TravelStage';
import { ArrowLeft } from 'lucide-react';

export default function TravelAdPage() {
    return (
        <div className="w-screen h-screen bg-black overflow-hidden relative">
            {/* Nav */}
            <header className="absolute top-0 left-0 right-0 z-20 p-6 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <Link
                        href="/ads-samples"
                        className="p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                </div>
            </header>

            {/* 3D Scene */}
            <main className="w-full h-full">
                <TravelStage />
            </main>
        </div>
    );
}
