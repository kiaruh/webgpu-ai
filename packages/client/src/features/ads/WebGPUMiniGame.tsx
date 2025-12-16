'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Text, Float, Stars, Trail, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

// Game Constants
const LANE_WIDTH = 3;
const GAME_SPEED = 0.4;
const SPAWN_RATE = 60; // frames

function PlayerShip({ lane, setGameOver }: { lane: number, setGameOver: (v: boolean) => void }) {
    const ref = useRef<THREE.Group>(null);
    const targetX = (lane - 1) * LANE_WIDTH; // -3, 0, 3

    useFrame((state, delta) => {
        if (!ref.current) return;
        // Smooth movement
        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, delta * 15);

        // Banking effect
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, (targetX - ref.current.position.x) * -0.2, delta * 10);
    });

    return (
        <group ref={ref} position={[0, -2, 0]}>
            <Trail width={1} length={4} color="cyan" attenuation={(t) => t * t}>
                <mesh>
                    <coneGeometry args={[0.5, 2, 8]} />
                    <meshStandardMaterial color="cyan" emissive="blue" emissiveIntensity={2} />
                </mesh>
            </Trail>
            {/* Wings */}
            <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[1, 0.5, 4]} />
                <meshStandardMaterial color="darkblue" />
            </mesh>
        </group>
    );
}

function Asteroid({ position, onHit }: { position: [number, number, number], onHit: () => void }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!ref.current) return;
        ref.current.position.z += GAME_SPEED;
        ref.current.rotation.x += delta;
        ref.current.rotation.y += delta;

        // Collision check (simple z and x check)
        if (ref.current.position.z > -3 && ref.current.position.z < -1) {
            // We need to check player lane match here, but for simplicity in this component
            // we'll rely on the parent manager or a global store in a real app.
            // Here we just let it fly past.
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#554433" roughness={0.8} />
        </mesh>
    );
}

function StarField() {
    const stars = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 100 - 50;
            temp.push({ x, y, z, scale: Math.random() * 0.2 });
        }
        return temp;
    }, []);

    const mesh = useRef<THREE.InstancedMesh>(null);

    useFrame(() => {
        // Simple star movement effect if needed
    });

    return (
        <group>
            {stars.map((s, i) => (
                <mesh key={i} position={[s.x, s.y, s.z]}>
                    <sphereGeometry args={[s.scale, 8, 8]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            ))}
        </group>
    )
}

function ObstacleManager({ playerLane, setGameOver, score, setScore }: any) {
    const [obstacles, setObstacles] = useState<{ id: number, lane: number, z: number }[]>([]);

    useFrame((state) => {
        // Spawn
        if (state.clock.elapsedTime > 0 && Math.floor(state.clock.elapsedTime * 60) % SPAWN_RATE === 0) {
            const lane = Math.floor(Math.random() * 3); // 0, 1, 2
            setObstacles(prev => [...prev, { id: Date.now(), lane, z: -50 }]);
        }

        // Update & Collision
        setObstacles(prev => prev.map(o => ({ ...o, z: o.z + GAME_SPEED })).filter(o => o.z < 10));

        // Check collision (approximate)
        obstacles.forEach(o => {
            if (o.z > -2.5 && o.z < -1.5) {
                // Check if player is in the same lane (mapped 0->-3, 1->0, 2->3)
                // Player lanes are 0, 1, 2. Obstacle lanes are 0, 1, 2.
                if (o.lane === playerLane) {
                    setGameOver(true);
                }
            }
        });
    });

    return (
        <group>
            {obstacles.map(o => (
                <Asteroid key={o.id} position={[(o.lane - 1) * LANE_WIDTH, 0, o.z]} onHit={() => { }} />
            ))}
        </group>
    );
}

export function WebGPUMiniGame() {
    const [lane, setLane] = useState(1); // 0, 1, 2
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameOver || !started) return;
            if (e.key === 'ArrowLeft') setLane(l => Math.max(0, l - 1));
            if (e.key === 'ArrowRight') setLane(l => Math.min(2, l + 1));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameOver, started]);

    useEffect(() => {
        if (started && !gameOver) {
            const interval = setInterval(() => setScore(s => s + 1), 100);
            return () => clearInterval(interval);
        }
    }, [started, gameOver]);

    return (
        <group>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 0]} intensity={2} />
            <StarField />

            {!started ? (
                <Text position={[0, 1, -5]} fontSize={1} color="cyan" anchorX="center" onClick={() => setStarted(true)}>
                    CLICK TO START
                </Text>
            ) : gameOver ? (
                <group>
                    <Text position={[0, 1, -5]} fontSize={1.5} color="red" anchorX="center">
                        GAME OVER
                    </Text>
                    <Text position={[0, -0.5, -5]} fontSize={0.8} color="white" anchorX="center">
                        Score: {score}
                    </Text>
                    <Text position={[0, -2, -5]} fontSize={0.5} color="white" anchorX="center" onClick={() => { setGameOver(false); setScore(0); setStarted(true); }}>
                        Retry
                    </Text>
                </group>
            ) : (
                <group>
                    <PlayerShip lane={lane} setGameOver={setGameOver} />
                    <ObstacleManager playerLane={lane} setGameOver={setGameOver} score={score} setScore={setScore} />
                    <Text position={[4, 3, -5]} fontSize={0.5} color="white" anchorX="right">
                        SCORE: {score}
                    </Text>

                    {/* Lane Guides */}
                    <mesh position={[-3, -3, -10]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.1, 100]} />
                        <meshBasicMaterial color="#333" />
                    </mesh>
                    <mesh position={[0, -3, -10]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.1, 100]} />
                        <meshBasicMaterial color="#333" />
                    </mesh>
                    <mesh position={[3, -3, -10]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.1, 100]} />
                        <meshBasicMaterial color="#333" />
                    </mesh>
                </group>
            )}
        </group>
    );
}
