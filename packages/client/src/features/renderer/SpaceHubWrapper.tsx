'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import SpaceHub with SSR disabled to prevent hydration mismatches
// and ensure WebGPU/Canvas access happens only on the client.
const SpaceHubClient = dynamic(
    () => import('./SpaceHub').then((mod) => mod.SpaceHub),
    {
        ssr: false,
        loading: () => (
            <div className="absolute inset-0 bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-white/60 tracking-widest uppercase">Initializing Space Hub</p>
                </div>
            </div>
        ),
    }
);

export function SpaceHubWrapper() {
    return <SpaceHubClient />;
}
