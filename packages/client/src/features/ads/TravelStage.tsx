'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Stars, Float, Text, KeyboardControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { MousePointer2 } from 'lucide-react';

const PlayerController = ({ isLocked }: { isLocked: boolean }) => {
    const { camera } = useThree();
    const [, getKeys] = useKeyboardControls();
    const velocity = useRef(new THREE.Vector3(0, 0, 0));

    useFrame((state, delta) => {
        if (!isLocked) return;

        const { forward, backward, left, right, up, down } = getKeys();

        // Input Vector
        const inputVec = new THREE.Vector3(0, 0, 0);
        if (forward) inputVec.z -= 1;
        if (backward) inputVec.z += 1;
        if (left) inputVec.x -= 1;
        if (right) inputVec.x += 1;
        if (up) inputVec.y += 1;
        if (down) inputVec.y -= 1;

        if (inputVec.length() > 0) inputVec.normalize();
        inputVec.applyQuaternion(camera.quaternion);

        const speed = 20.0 * delta;
        velocity.current.addScaledVector(inputVec, speed);
        velocity.current.multiplyScalar(0.95); // Drag

        camera.position.addScaledVector(velocity.current, delta);

        // Floor (Water level)
        if (camera.position.y < 2) {
            camera.position.y = 2;
            velocity.current.y = Math.max(0, velocity.current.y);
        }
    });

    return null;
}

const Ocean = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
            color="#001e36"
            roughness={0.1}
            metalness={0.9}
            emissive="#00496d"
            emissiveIntensity={0.2}
        />
    </mesh>
);

const AncientRing = ({ position, rotation, scale = 1 }: any) => (
    <group position={position} rotation={rotation} scale={scale}>
        <Float floatIntensity={1} rotationIntensity={0.2} speed={0.5}>
            <mesh castShadow receiveShadow>
                <torusGeometry args={[10, 1, 16, 100]} />
                <meshStandardMaterial color="#b8c6db" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh>
                <torusGeometry args={[10, 0.2, 16, 100]} />
                <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={2} />
            </mesh>
        </Float>
    </group>
);

const SceneContent = ({ isLocked, setIsLocked }: any) => {
    return (
        <>
            <Sky sunPosition={[100, 10, 100]} turbidity={0.3} rayleigh={0.2} mieCoefficient={0.005} mieDirectionalG={0.8} />
            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade />

            <ambientLight intensity={0.3} />
            <pointLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <fog attach="fog" args={['#001e36', 10, 500]} />

            <Ocean />

            {/* The "Course" */}
            <AncientRing position={[0, 10, -30]} />
            <AncientRing position={[10, 20, -80]} rotation={[0, Math.PI / 4, 0]} />
            <AncientRing position={[-15, 15, -140]} rotation={[0, -Math.PI / 6, 0]} />
            <AncientRing position={[0, 40, -200]} rotation={[Math.PI / 2, 0, 0]} scale={2} />

            <PlayerController isLocked={isLocked} />

            {isLocked && <PointerLockControls
                onUnlock={() => setIsLocked(false)}
                selector="#canvas-container" // Lock to specific element if needed, but default is document.body usually.
            />}
        </>
    );
};

export const TravelStage = () => {
    const [isLocked, setIsLocked] = useState(false);

    // Controls mapping
    const controlsMap = [
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
        { name: 'up', keys: ['Space'] },
        { name: 'down', keys: ['Shift'] },
    ];

    return (
        <div id="canvas-container" className="w-full h-full relative select-none bg-black">
            <KeyboardControls map={controlsMap}>
                <Canvas shadows camera={{ fov: 60, position: [0, 5, 10] }}>
                    <SceneContent isLocked={isLocked} setIsLocked={setIsLocked} />
                </Canvas>
            </KeyboardControls>

            {/* UI Overlay */}
            {!isLocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300">
                    <button
                        onClick={() => setIsLocked(true)}
                        className="group flex flex-col items-center gap-4 p-8 bg-zinc-900/90 border border-white/20 rounded-3xl hover:bg-zinc-800 hover:scale-105 transition-all shadow-2xl shadow-cyan-500/20"
                    >
                        <div className="p-4 bg-cyan-500/20 rounded-full text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                            <MousePointer2 size={32} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Enter Simulation</h2>
                            <p className="text-zinc-400 text-sm">Click to capture mouse</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-zinc-500 mt-4 border-t border-white/10 pt-4">
                            <span>[W,A,S,D] Fly</span>
                            <span>[MOUSE] Look</span>
                            <span>[SPACE] Up</span>
                            <span>[SHIFT] Down</span>
                        </div>
                    </button>
                </div>
            )}

            {isLocked && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none text-white/20 font-mono text-sm">
                    PRESS ESC TO EXIT
                </div>
            )}
        </div>
    );
};
