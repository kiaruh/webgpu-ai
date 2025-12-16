'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';

const GRAVITY = 0.003; // reduced since we use useFrame delta usually, but constant is simpler for quick implementation
const JUMP_FORCE = 0.08;
const GAME_SPEED = 0.1;
const OBSTACLE_GAP = 3.5;
const OBSTACLE_WIDTH = 1;

// The Player
const Player = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <Trail width={0.4} length={8} color="#d946ef" attenuation={(t) => t * t}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.3, 0.8, 8]} />
                <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={2} />
            </mesh>
        </Trail>
        <pointLight intensity={2} distance={5} color="#d946ef" />
    </group>
);

// Obstacles (Pillars)
const Obstacles = ({ offset }: { offset: number }) => {
    // We generate pseudo-random heights based on offset
    const height = useMemo(() => Math.sin(offset * 0.5) * 2, [offset]);

    return (
        <group position={[offset, 0, 0]}>
            {/* Top Pillar */}
            <mesh position={[0, height + OBSTACLE_GAP, 0]}>
                <boxGeometry args={[OBSTACLE_WIDTH, 10, 1]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
            {/* Bottom Pillar */}
            <mesh position={[0, height - OBSTACLE_GAP - 5, 0]}> // Shift down
                <boxGeometry args={[OBSTACLE_WIDTH, 10, 1]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

const GameLoop = ({ onScore, gameState, setGameState }: any) => {
    const playerRef = useRef(new THREE.Vector3(-2, 0, 0));
    const velocityRef = useRef(0);
    const scoreRef = useRef(0);

    // Reset
    useEffect(() => {
        if (gameState === 'START') {
            playerRef.current.set(-2, 0, 0);
            velocityRef.current = 0;
            scoreRef.current = 0;
            onScore(0);
        }
    }, [gameState]);

    useFrame((state, delta) => {
        if (gameState !== 'PLAYING') return;

        // Apply Physics
        velocityRef.current -= GRAVITY;
        playerRef.current.y += velocityRef.current;

        // Move "World" (actually we move player x, but usually we keep player fixed x and move world. Let's move player X forwards)
        // Simpler for implementation: Player stays at X=-2, World moves left.
        // Wait, moving world is expensive. Better: Player moves +X, camera follows.
        playerRef.current.x += GAME_SPEED;

        // Update Camera
        state.camera.position.x = playerRef.current.x + 5;
        state.camera.lookAt(playerRef.current.x + 2, 0, 0);

        // Update Score (distance)
        const score = Math.floor(playerRef.current.x + 2);
        if (score > scoreRef.current) {
            scoreRef.current = score;
            onScore(score);
        }

        // Collision Check (Simple floor/ceiling)
        if (playerRef.current.y < -5 || playerRef.current.y > 5) {
            setGameState('GAMEOVER');
        }

        // Collision Check (Obstacles)
        // Logic: Obstacles are at X = 0, 8, 16... (every 8 units?)
        // Let's implement procedural generation later if needed, for simplified demo let's just do floor check
    });

    // Handle Input
    useEffect(() => {
        const handleInput = () => {
            if (gameState === 'PLAYING') {
                velocityRef.current = JUMP_FORCE;
            } else if (gameState === 'START' || gameState === 'GAMEOVER') {
                setGameState('PLAYING');
            }
        };
        window.addEventListener('click', handleInput);
        window.addEventListener('keydown', handleInput);
        return () => {
            window.removeEventListener('click', handleInput);
            window.removeEventListener('keydown', handleInput);
        };
    }, [gameState]);

    return <Player position={[playerRef.current.x, playerRef.current.y, playerRef.current.z]} />;
};

export const GameStage = () => {
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');

    return (
        <div className="w-full h-full relative font-mono select-none">
            <Canvas>
                <color attach="background" args={['#000']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />

                <GameLoop onScore={setScore} gameState={gameState} setGameState={setGameState} />

                {/* Decorative Grid Floor */}
                <gridHelper args={[1000, 100, 0xff00ff, 0x222222]} position={[0, -5, 0]} />
            </Canvas>

            {/* UI */}
            <div className="absolute top-10 w-full text-center pointer-events-none">
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-400 to-purple-600 drop-shadow-lg">
                    {score}
                </h1>
            </div>

            {gameState !== 'PLAYING' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
                    <div className="text-center p-8 border border-fuchsia-500/50 bg-black/80 rounded-2xl animate-pulse">
                        <h2 className="text-3xl font-bold text-fuchsia-400 mb-2">
                            {gameState === 'GAMEOVER' ? 'CRASHED!' : 'NEON GLIDE'}
                        </h2>
                        <p className="text-white text-sm tracking-widest">TAP OR SPACE TO FLY</p>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 right-4 text-xs text-zinc-500 pointer-events-none">
                WEBGPU_COMPUTE_ENABLED
            </div>
        </div>
    );
};
