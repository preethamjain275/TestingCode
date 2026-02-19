import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

const AGENT_NODES = [
  { name: "Repo", angle: 0 },
  { name: "Test", angle: Math.PI * 2 / 10 },
  { name: "Diag", angle: (Math.PI * 2 / 10) * 2 },
  { name: "RCA", angle: (Math.PI * 2 / 10) * 3 },
  { name: "Patch", angle: (Math.PI * 2 / 10) * 4 },
  { name: "Risk", angle: (Math.PI * 2 / 10) * 5 },
  { name: "Valid", angle: (Math.PI * 2 / 10) * 6 },
  { name: "Git", angle: (Math.PI * 2 / 10) * 7 },
  { name: "Learn", angle: (Math.PI * 2 / 10) * 8 },
  { name: "Pipe", angle: (Math.PI * 2 / 10) * 9 },
];

const AgentNode = ({ position, name }: { position: [number, number, number]; name: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1);
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color="#00d4aa"
            emissive="#00d4aa"
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.15}
          color="#00d4aa"
          anchorX="center"
          anchorY="top"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
};

const ConnectionLines = () => {
  const linesRef = useRef<THREE.Group>(null);
  
  const positions = useMemo(() => {
    return AGENT_NODES.map(n => {
      const r = 2.2;
      return [Math.cos(n.angle) * r, Math.sin(n.angle) * r, 0] as [number, number, number];
    });
  }, []);

  const lineObjects = useMemo(() => {
    const objs: THREE.Line[] = [];
    const mat = new THREE.LineBasicMaterial({ color: "#00d4aa", transparent: true, opacity: 0.15 });
    // Connect each node to center
    positions.forEach(pos => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)]);
      objs.push(new THREE.Line(geo, mat));
    });
    // Connect adjacent nodes
    for (let i = 0; i < positions.length; i++) {
      const next = (i + 1) % positions.length;
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...positions[i]), new THREE.Vector3(...positions[next])]);
      objs.push(new THREE.Line(geo, mat));
    }
    return objs;
  }, [positions]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={linesRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
};

const RotatingNetwork = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const positions = useMemo(() => {
    return AGENT_NODES.map(n => {
      const r = 2.2;
      return [Math.cos(n.angle) * r, Math.sin(n.angle) * r, 0] as [number, number, number];
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Center core */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.2}>
        <mesh>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial
            color="#00d4aa"
            emissive="#00d4aa"
            emissiveIntensity={0.8}
            wireframe
          />
        </mesh>
      </Float>

      <ConnectionLines />

      {AGENT_NODES.map((node, i) => (
        <AgentNode key={node.name} position={positions[i]} name={node.name} />
      ))}
    </group>
  );
};

const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00d4aa" size={0.03} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

const AgentNetworkScene = () => {
  return (
    <div className="w-full h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00d4aa" />
        <pointLight position={[-5, -5, 3]} intensity={0.4} color="#22c55e" />
        <RotatingNetwork />
        <Particles />
      </Canvas>
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default AgentNetworkScene;
