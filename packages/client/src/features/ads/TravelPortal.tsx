'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, MeshPortalMaterial, RoundedBox, Text, Environment, CameraControls, Sky } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

// A component that renders a "portal" to another world
function PortalFrame({
    id,
    textureMap,
    position,
    rotation,
    title
}: {
    id: string,
    textureMap: string,
    position: [number, number, number],
    rotation: [number, number, number],
    title: string
}) {
    const meshRef = useRef<THREE.Group>(null);
    const portalMaterial = useRef<any>(null);
    const [active, setActive] = useState(false);
    const [hovered, setHover] = useState(false);

    useFrame((state, dt) => {
        if (!meshRef.current) return;

        // Gentle float
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime + parseFloat(id)) * 0.0005;

        // Easing to open the portal when active
        // Logic handled by MeshPortalMaterial's 'blend' property normally, but let's just use standard
    });

    return (
        <group ref={meshRef} position={position} rotation={rotation}>
            <Text position={[0, 1.8, 0]} fontSize={0.4} color="white" anchorX="center">{title}</Text>

            <RoundedBox
                args={[2.5, 3.5, 0.2]}
                radius={0.1}
                onDoubleClick={() => setActive(!active)}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {/* The "Portal" Material */}
                <MeshPortalMaterial
                    ref={portalMaterial}
                    side={THREE.DoubleSide}
                    blend={active ? 1 : 0} // When active, fills the screen (sort of)
                    resolution={512}
                    blur={0.2}
                >
                    {/* The "Inside" of the portal */}
                    <ambientLight intensity={1} />
                    <Environment preset={textureMap as any} />
                    {/* In a real production app, we would load a custom 360 jpg using: map={texture} */}

                    <mesh>
                        <sphereGeometry args={[10, 32, 32]} />
                        <meshStandardMaterial side={THREE.BackSide} color="white" wireframe={false} />
                    </mesh>

                    {/* Objects inside the portal */}
                    <mesh position={[0, -2, -5]}>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshStandardMaterial color="hotpink" />
                    </mesh>

                </MeshPortalMaterial>
            </RoundedBox>

            {/* Frame Border */}
            <mesh position={[0, 0, 0.01]}>
                <torusGeometry args={[1.5, 0.05, 16, 100]} />
                <meshStandardMaterial color={hovered ? "cyan" : "white"} emissive={hovered ? "cyan" : "black"} />
            </mesh>
        </group>
    );
}

export function TravelPortal() {
    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Background for the "Showroom" */}
            <GridFloor />

            {/* Portal 1: Sunset */}
            <PortalFrame
                id="1"
                textureMap="sunset"
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                title="Sunset Beach"
            />

            {/* Portal 2: Forest (Left) */}
            <PortalFrame
                id="2"
                textureMap="park"
                position={[-4, 0, 1]}
                rotation={[0, 0.5, 0]}
                title="Forest Park"
            />

            {/* Portal 3: City (Right) */}
            <PortalFrame
                id="3"
                textureMap="city"
                position={[4, 0, 1]}
                rotation={[0, -0.5, 0]}
                title="Downtown"
            />

            <CameraControls makeDefault minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
        </group>
    );
}

function GridFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
        </mesh>
    );
}
