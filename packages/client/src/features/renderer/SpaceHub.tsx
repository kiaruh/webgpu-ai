'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { SpaceCamera } from './SpaceCamera';
import { SpaceHubUI } from './SpaceHubUI';
import { SpaceEnvironment } from './SpaceEnvironment';
import { SpacePerformance } from './SpacePerformance';
import { HubState, POIType, POI_DATA, POIConfig } from './SpaceHubTypes';

import { ChatStation, AdShip, ResearchLab } from './components/SpacePOIs';

// SpaceHub Component Logic

export function SpaceHub() {
    const [hubState, setHubState] = useState<HubState>('IDLE_HUB');
    const [selectedPOI, setSelectedPOI] = useState<POIConfig | null>(null);
    const [quality, setQuality] = useState<'HIGH' | 'LOW'>('HIGH');

    const handlePOIClick = (poiKey: string) => {
        if (hubState !== 'IDLE_HUB') return;
        const config = POI_DATA[poiKey];
        setSelectedPOI(config);
        setHubState('FOCUS_TRANSITION');

        // Simulate travel time then dock
        setTimeout(() => {
            setHubState('POI_DOCKED');
            // Small delay before modal opens for effect
            setTimeout(() => setHubState('MODAL_OPEN'), 300);
        }, 1500);
    };

    const handleCloseModal = () => {
        setHubState('IDLE_HUB');
        setSelectedPOI(null);
    };

    return (
        <div className="absolute inset-0 w-full h-full bg-black">
            <Canvas dpr={quality === 'HIGH' ? [1, 2] : [1, 1]}>
                <SpacePerformance onDegrade={() => setQuality('LOW')} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Suspense fallback={null}>
                    {quality === 'HIGH' && (
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    )}
                    <Environment preset="city" />

                    <SpaceEnvironment />
                    <ChatStation onClick={() => handlePOIClick('CHAT')} />
                    <AdShip onClick={() => handlePOIClick('ADS')} />
                    <ResearchLab onClick={() => handlePOIClick('AI')} />

                    <SpaceCamera hubState={hubState} targetPOI={selectedPOI} />
                </Suspense>
            </Canvas>

            {/* UI Overlay Layer */}
            <SpaceHubUI
                hubState={hubState}
                selectedPOI={selectedPOI}
                onClose={handleCloseModal}
            />
        </div>
    );
}
