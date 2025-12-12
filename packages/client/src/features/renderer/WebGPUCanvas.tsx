'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

interface WebGPUCanvasProps {
    children: React.ReactNode;
    className?: string; // Allow custom styling
}

export const WebGPUCanvas = ({ children, className }: WebGPUCanvasProps) => {
    return (
        <div className={`w-full h-full min-h-[500px] ${className || ''}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: true }}
            // Note: actual WebGPU usage in Three.js often requires specific renderer switching, 
            // but R3F abstracts much of this. For now, we use standard WebGL2 which is stable 
            // and add WebGPU specific flags if needing the experimental renderer.
            >
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
};
