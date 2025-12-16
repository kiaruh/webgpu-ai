'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Text, Html, Float, Environment, PerspectiveCamera, Grid } from '@react-three/drei';
import React, { useRef, useState, useMemo } from 'react';
import { Vector3, Group } from 'three';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function FloatingPortal({ position, color, title, href, icon }: { position: [number, number, number], color: string, title: string, href: string, icon: string }) {
    const meshRef = useRef<Group>(null);
    const router = useRouter();
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.001;
        }
    });

    return (
        <group ref={meshRef} position={position}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                {/* Portal Ring */}
                <mesh
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    onClick={() => router.push(href)}
                    scale={hovered ? 1.1 : 1}
                >
                    <torusGeometry args={[3, 0.2, 16, 100]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
                </mesh>

                {/* Inner Glow */}
                <mesh>
                    <circleGeometry args={[2.8, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.1} side={2} />
                </mesh>

                {/* 3D Text Label */}
                <Text
                    position={[0, 4, 0]}
                    fontSize={0.8}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    {title}
                </Text>

                {/* HTML Content for Accessibility/Icon */}
                <Html transform position={[0, 0, 0]}>
                    <div
                        onClick={() => router.push(href)}
                        className={`
              w-32 h-32 flex items-center justify-center rounded-full
              transition-all duration-300 cursor-pointer
              ${hovered ? 'scale-110 bg-white/10 checkbox-shadow' : 'bg-transparent'}
            `}
                        style={{ pointerEvents: 'none' }} // Let the mesh handle clicks mostly, but this visual feedback is nice
                    >
                        <span className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{icon}</span>
                    </div>
                </Html>
            </Float>
        </group>
    );
}

function Landscape() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
            <planeGeometry args={[100, 100, 20, 20]} />
            <meshStandardMaterial color="#050505" wireframe />
        </mesh>
    );
}

export function SciFiWorld() {
    return (
        <div className="absolute inset-0 w-full h-full bg-black -z-10">
            <Canvas>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white z-50 pointer-events-none">
                    {/* This plain HTML loader will be visible while Canvas initializes */}
                </div>

                <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={60} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <React.Suspense fallback={
                    <group>
                        <mesh position={[0, 0, -5]}>
                            <boxGeometry args={[1, 1, 1]} />
                            <meshStandardMaterial color="purple" wireframe />
                        </mesh>
                        <Text position={[0, -2, -5]} color="white">Loading World...</Text>
                    </group>
                }>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Environment preset="city" />
                    <Grid position={[0, -5, 0]} args={[100, 100]} cellColor="#ffffff" sectionColor="#0a0a0a" fadeDistance={50} />

                    <FloatingPortal
                        position={[-6, 0, -5]}
                        color="#a855f7"
                        title="WebGPU Ads"
                        href="/ads-samples"
                        icon="🛍️"
                    />

                    <FloatingPortal
                        position={[6, 0, -5]}
                        color="#10b981"
                        title="Applied AI"
                        href="/applied-ai"
                        icon="👁️"
                    />

                    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                        <Text
                            position={[0, 5, -10]}
                            fontSize={3}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                            maxWidth={20}
                            textAlign="center"
                        >
                            IMMERSIVE INTELLIGENCE
                        </Text>
                    </Float>
                </React.Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>

            {/* Overlay UI for Mobile/Non-3D users fallback or extra info */}
            <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-zinc-500 text-sm uppercase tracking-[0.5em] animate-pulse">
                    System Online • WebGPU Active
                </p>
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-zinc-600 text-xs">
                    Drag to look around • Click portals to navigate
                </p>
            </div>
        </div>
    );
}
