'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Group, Mesh, Vector3, Color } from 'three';
import { Float, Instance, Instances } from '@react-three/drei';

function Sun() {
    return (
        <group position={[50, 10, -50]}>
            <mesh>
                <sphereGeometry args={[10, 32, 32]} />
                <meshStandardMaterial
                    emissive="#fbbf24"
                    emissiveIntensity={2}
                    color="#fbbf24"
                    toneMapped={false}
                />
            </mesh>
            <pointLight intensity={2} distance={200} decay={2} color="#fbbf24" />
        </group>
    );
}

function Planet({ distance, speed, color, size, offset = 0 }: { distance: number, speed: number, color: string, size: number, offset?: number }) {
    const ref = useRef<Mesh>(null);
    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime() * speed + offset;
            ref.current.position.x = Math.sin(t) * distance + 50; // Orbiting the Sun at [50, 10, -50]
            ref.current.position.z = Math.cos(t) * distance - 50;
            ref.current.position.y = 10 + Math.sin(t * 0.5) * 5; // Slight vertical wobble
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function Comets() {
    const comets = useMemo(() => Array.from({ length: 5 }).map(() => ({
        speed: 0.5 + Math.random(),
        offset: Math.random() * 100,
        y: (Math.random() - 0.5) * 20,
    })), []);

    const geometry = useMemo(() => new Vector3(), []); // Reusable vector

    return (
        <group>
            {comets.map((comet, i) => (
                <CometInstance key={i} {...comet} />
            ))}
        </group>
    );
}

function CometInstance({ speed, offset, y }: { speed: number, offset: number, y: number }) {
    const ref = useRef<Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime() * speed + offset;
            // Fly from left to right far away
            const progress = (t % 20) / 20; // 0 to 1 loop
            // x from -100 to 100
            ref.current.position.set(-100 + progress * 200, y, -40 - Math.sin(progress * Math.PI) * 20);

            // Tail scaling based on speed?
            ref.current.lookAt(100, y, -40);
        }
    });

    return (
        <group ref={ref}>
            <mesh rotation={[0, -Math.PI / 2, 0]}>

                {/* Simple comet head */}
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} />
            </mesh>
            {/* Tail */}
            <mesh position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0, 4, 8]} />
                <meshStandardMaterial color="cyan" transparent opacity={0.3} />
            </mesh>
        </group>
    )
}

export function SpaceEnvironment() {
    return (
        <group>
            <Sun />
            <Planet distance={20} speed={0.2} color="#ef4444" size={2} offset={0} />
            <Planet distance={35} speed={0.1} color="#3b82f6" size={3} offset={2} />
            <Comets />
        </group>
    );
}
