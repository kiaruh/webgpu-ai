'use client';

import { useFrame } from '@react-three/fiber';
import { useState, useEffect, useRef } from 'react';

interface SpacePerformanceProps {
    onDegrade: () => void;
}

export function SpacePerformance({ onDegrade }: SpacePerformanceProps) {
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const badFrames = useRef(0);
    const hasDegraded = useRef(false);

    useFrame(() => {
        if (hasDegraded.current) return;

        frameCount.current++;
        const time = performance.now();

        // Check every 1 second
        if (time >= lastTime.current + 1000) {
            const fps = frameCount.current;

            // If FPS is below 30
            if (fps < 30) {
                badFrames.current++;
            } else {
                badFrames.current = 0; // Reset if we recover
            }

            // If we have 2 consecutive seconds of bad performance
            if (badFrames.current >= 2) {
                console.warn("Performance detected < 30 FPS. Downgrading quality.");
                onDegrade();
                hasDegraded.current = true;
            }

            frameCount.current = 0;
            lastTime.current = time;
        }
    });

    return null;
}
