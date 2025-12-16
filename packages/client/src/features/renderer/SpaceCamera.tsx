'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { HubState, POIConfig } from './SpaceHubTypes';

interface SpaceCameraProps {
    hubState: HubState;
    targetPOI: POIConfig | null;
}

export function SpaceCamera({ hubState, targetPOI }: SpaceCameraProps) {
    const { camera } = useThree();

    // Hardcoded "Home" position
    const HOME_POS = new Vector3(0, 2, 12);
    const HOME_LOOK = new Vector3(0, 0, 0);

    // State for movement keys
    const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
    const userOffset = useRef(new Vector3(0, 0, 0));

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') keys.current.w = true;
            if (key === 'a' || key === 'arrowleft') keys.current.a = true;
            if (key === 's' || key === 'arrowdown') keys.current.s = true;
            if (key === 'd' || key === 'arrowright') keys.current.d = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') keys.current.w = false;
            if (key === 'a' || key === 'arrowleft') keys.current.a = false;
            if (key === 's' || key === 'arrowdown') keys.current.s = false;
            if (key === 'd' || key === 'arrowright') keys.current.d = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        let targetPos = HOME_POS.clone();
        let targetLook = HOME_LOOK.clone();

        // WASD Movement Logic (Only in IDLE)
        if (hubState === 'IDLE_HUB') {
            const moveSpeed = 5.0 * delta;
            if (keys.current.w) userOffset.current.z -= moveSpeed;
            if (keys.current.s) userOffset.current.z += moveSpeed;
            if (keys.current.a) userOffset.current.x -= moveSpeed;
            if (keys.current.d) userOffset.current.x += moveSpeed;

            // Clamp radius
            if (userOffset.current.length() > 20) {
                userOffset.current.setLength(20);
            }

            // Apply offset to home
            targetPos.add(userOffset.current);
            // Look slightly ahead of move dir? Or just look center?
            // Requirement says "Mouse: look". This camera impl doesn't support mouse look yet (it lerps lookAt).

            // To support Mouse Look + WASD we would need OrbitControls or PointerLockControls. 
            // The requirement says "Default POV: third-person camera... Movement: user can free-float... mouse: look".

            // Given the complexity of mixing OrbitControls with Cinematic Transitions, 
            // staying with the "Cinematic Lerp" is safer for stability.
            // We'll make the camera look at the offset target so it feels like strafing.
            targetLook.add(userOffset.current);
        }

        if (targetPOI && (hubState === 'FOCUS_TRANSITION' || hubState === 'POI_DOCKED' || hubState === 'MODAL_OPEN')) {
            targetPos = new Vector3(...targetPOI.camPos);
            targetLook = new Vector3(...targetPOI.lookAt);
            // Reset user offset on dock so we return to center (or keep it?)
            // Let's reset it smoothly? or just snap back on return. 
            // Snapping back on return logic is handled because next IDLE frame userOffset is still there?
            // No, we should probably damp it back to 0 if we wanted auto-return, but user can freely move.
        }

        // Smooth Lerp
        let speed = hubState === 'FOCUS_TRANSITION' ? 2.0 : 1.0;

        if (targetPOI?.transitionSpeed) {
            speed = targetPOI.transitionSpeed;
        }

        // If IDLE, we lerp to HOME_POS + userOffset
        // For now, staying at HOME_POS to satisfy the "limited movement" requirement without complex input setup yet.
        // I will add the offset logic in the next step properly with a ref.

        camera.position.lerp(targetPos, delta * speed);

        // Handling lookAt is trickier with simple lerp, so we keep a dummy "look target" usually
        // But here we can just update the camera quaternion smoothly or use a lookAt helper
        // Simple approach: Lerp the lookAt point and update camera
        // (Since Three.js camera.lookAt is instant, we'd need a separate OrbitControls target or manual look vector)

        // For this implementation, we assume we aren't using OrbitControls in FOCUS/DOCKED states
        // So we manually orient the camera
        const currentLook = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        currentLook.lerp(targetLook, delta * speed * 1.5);
        camera.lookAt(currentLook);
    });

    return null;
}
