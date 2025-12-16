import { Float, Text } from '@react-three/drei';
import { POI_DATA } from '../SpaceHubTypes';

export const ChatStation = ({ onClick }: { onClick: () => void }) => (
    <group position={POI_DATA.CHAT.position} onClick={onClick}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh>
                <octahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]} scale={1.2}>
                <octahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color="#8b5cf6" wireframe />
            </mesh>
            <Text position={[0, 2, 0]} fontSize={0.5} color="white">Chat Station</Text>
        </Float>
    </group>
);

export const AdShip = ({ onClick }: { onClick: () => void }) => (
    <group position={POI_DATA.ADS.position} onClick={onClick}>
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.4}>
            <mesh>
                <boxGeometry args={[2, 0.5, 3]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.7} />
            </mesh>
            {/* Wings */}
            <mesh position={[1.5, 0, 0]}>
                <boxGeometry args={[1, 0.1, 2]} />
                <meshStandardMaterial color="#d97706" />
            </mesh>
            <mesh position={[-1.5, 0, 0]}>
                <boxGeometry args={[1, 0.1, 2]} />
                <meshStandardMaterial color="#d97706" />
            </mesh>
            <Text position={[0, 1.5, 0]} fontSize={0.5} color="white">Ads Sample Ship</Text>
        </Float>
    </group>
);

export const ResearchLab = ({ onClick }: { onClick: () => void }) => (
    <group position={POI_DATA.AI.position} onClick={onClick}>
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <mesh>
                <sphereGeometry args={[2, 16, 16]} />
                <meshStandardMaterial color="#10b981" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3, 0.1, 16, 100]} />
                <meshStandardMaterial color="white" emissive="white" />
            </mesh>
            <Text position={[0, 3, 0]} fontSize={0.5} color="white">AI Lab</Text>
        </Float>
    </group>
);
