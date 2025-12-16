export type HubState = 'IDLE_HUB' | 'FOCUS_TRANSITION' | 'POI_DOCKED' | 'MODAL_OPEN' | 'NAVIGATING';

export type POIType = 'CHAT' | 'ADS' | 'AI' | null;

export interface POIConfig {
    id: POIType;
    position: [number, number, number];
    lookAt: [number, number, number]; // Where the camera looks when docked
    camPos: [number, number, number]; // Where the camera sits when docked
    label: string;
    description: string;
    transitionSpeed?: number; // Higher is faster
}

export const POI_DATA: Record<string, POIConfig> = {
    CHAT: {
        id: 'CHAT',
        position: [-6, 0, -5],
        lookAt: [-6, 0, -5],
        camPos: [-2, 1.5, 8], // "Nudge" position - mostly maintains view but moves slightly closer
        label: 'Chat Station',
        description: 'Talk to the assistant inside the station.',
        transitionSpeed: 3.0, // Fast nudge
    },
    ADS: {
        id: 'ADS',
        position: [6, 2, -8],
        lookAt: [6, 2, -8],
        camPos: [6, 3, -4],
        label: 'Ads Transport',
        description: 'Explore ad-tech samples, demos, and integrations.',
        transitionSpeed: 1.0, // Cinematic slow
    },
    AI: {
        id: 'AI',
        position: [0, -3, -12],
        lookAt: [0, -3, -12],
        camPos: [0, -1, -8],
        label: 'AI Research Lab',
        description: 'Research notes, prototypes, and applied AI experiments.',
        transitionSpeed: 1.0, // Cinematic slow
    }
};
