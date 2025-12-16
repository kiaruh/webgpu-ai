'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Ingredients
const BunTop = ({ exploded }: { exploded: boolean }) => (
    <mesh position={[0, exploded ? 1.5 : 0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#F5A623" roughness={0.3} />
    </mesh>
);

const Lettuce = ({ exploded }: { exploded: boolean }) => (
    <mesh position={[0, exploded ? 1.0 : 0.45, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} castShadow receiveShadow>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#7ED321" side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
);

const Cheese = ({ exploded }: { exploded: boolean }) => (
    <mesh position={[0, exploded ? 0.6 : 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 1.4]} />
        <meshStandardMaterial color="#F8E71C" roughness={0.4} />
    </mesh>
);

const Patty = ({ exploded }: { exploded: boolean }) => (
    <mesh position={[0, exploded ? 0.2 : 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.25, 32]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
    </mesh>
);

const BunBottom = ({ exploded }: { exploded: boolean }) => (
    <mesh position={[0, exploded ? -0.4 : -0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.4, 32]} />
        <meshStandardMaterial color="#F5A623" roughness={0.3} />
    </mesh>
);

export const BurgerStage = () => {
    const [exploded, setExploded] = useState(false);
    const [rotating, setRotating] = useState(true);

    return (
        <div className="w-full h-full relative">
            <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                <color attach="background" args={['#111']} />

                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                <Float speed={rotating ? 2 : 0} rotationIntensity={rotating ? 1 : 0} floatIntensity={1}>
                    <group rotation={[0, Math.PI / 6, 0]}>
                        {/* Animated Group wrapper could implement smooth lerp here */}
                        <BunTop exploded={exploded} />
                        <Lettuce exploded={exploded} />
                        <Cheese exploded={exploded} />
                        <Patty exploded={exploded} />
                        <BunBottom exploded={exploded} />
                    </group>
                </Float>

                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                <OrbitControls autoRotate={rotating} enableZoom={false} />
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
                <button
                    onClick={() => setExploded(!exploded)}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${exploded ? 'bg-indigo-500 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
                >
                    {exploded ? 'Collapse' : 'Explode Layers'}
                </button>
                <button
                    onClick={() => setRotating(!rotating)}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${rotating ? 'bg-indigo-500 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
                >
                    {rotating ? 'Pause' : 'Rotate'}
                </button>
            </div>

            <div className="absolute top-8 left-8">
                <h2 className="text-4xl font-bold text-white mb-2">Cyber Burger</h2>
                <div className="flex gap-2">
                    <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-1 rounded">PROCDURAL_GEO</span>
                    <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">PHYSICS_READY</span>
                </div>
            </div>
        </div>
    );
};
