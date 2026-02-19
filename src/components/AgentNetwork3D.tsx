import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AGENT_NODES = [
  { name: "Repo Intel", angle: 0, color: "#00d4aa" },
  { name: "Test Runner", angle: Math.PI * 2 / 10, color: "#00b4d8" },
  { name: "Diagnostics", angle: (Math.PI * 2 / 10) * 2, color: "#ff6b6b" },
  { name: "Root Cause", angle: (Math.PI * 2 / 10) * 3, color: "#ffd43b" },
  { name: "Patch Gen", angle: (Math.PI * 2 / 10) * 4, color: "#22c55e" },
  { name: "Risk Score", angle: (Math.PI * 2 / 10) * 5, color: "#a78bfa" },
  { name: "Validator", angle: (Math.PI * 2 / 10) * 6, color: "#f472b6" },
  { name: "GitOps", angle: (Math.PI * 2 / 10) * 7, color: "#fb923c" },
  { name: "Memory", angle: (Math.PI * 2 / 10) * 8, color: "#38bdf8" },
  { name: "Optimizer", angle: (Math.PI * 2 / 10) * 9, color: "#34d399" },
];

const GlowingNode = ({ position, color, name, index }: { position: [number, number, number]; color: string; name: string; index: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2 + index * 0.7) * 0.15);
      meshRef.current.rotation.y = t * 0.5 + index;
      meshRef.current.rotation.x = Math.sin(t * 0.3 + index) * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.8 + Math.sin(t * 1.5 + index * 0.5) * 0.3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 2 + index) * 0.04;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8 + index;
      ringRef.current.rotation.x = Math.PI / 2;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.5 + index * 0.1} rotationIntensity={0.3} floatIntensity={0.4}>
        {/* Outer glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
        {/* Rotating ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.32, 0.012, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
        {/* Core node */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            transparent
            opacity={0.95}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        {/* Inner core glow */}
        <Sphere args={[0.08, 12, 12]}>
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </Sphere>
      </Float>
    </group>
  );
};

const EnergyBeam = ({ start, end, color, speed }: { start: THREE.Vector3; end: THREE.Vector3; color: string; speed: number }) => {
  const dotRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (dotRef.current) {
      const t = ((state.clock.elapsedTime * speed) % 1);
      dotRef.current.position.lerpVectors(start, end, t);
      (dotRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.9;
    }
  });

  return (
    <mesh ref={dotRef}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
};

const ConnectionLines = () => {
  const linesRef = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    return AGENT_NODES.map(n => {
      const r = 2.5;
      return [Math.cos(n.angle) * r, Math.sin(n.angle) * r, 0] as [number, number, number];
    });
  }, []);

  const lineObjects = useMemo(() => {
    const objs: THREE.Line[] = [];
    // Radial lines to center
    positions.forEach((pos, i) => {
      const mat = new THREE.LineBasicMaterial({ color: AGENT_NODES[i].color, transparent: true, opacity: 0.12 });
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)]);
      objs.push(new THREE.Line(geo, mat));
    });
    // Ring connections
    for (let i = 0; i < positions.length; i++) {
      const next = (i + 1) % positions.length;
      const mat = new THREE.LineBasicMaterial({ color: "#00d4aa", transparent: true, opacity: 0.08 });
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...positions[i]), new THREE.Vector3(...positions[next])]);
      objs.push(new THREE.Line(geo, mat));
    }
    // Cross connections for visual density
    for (let i = 0; i < positions.length; i++) {
      const opp = (i + 5) % positions.length;
      const mat = new THREE.LineBasicMaterial({ color: "#00d4aa", transparent: true, opacity: 0.04 });
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...positions[i]), new THREE.Vector3(...positions[opp])]);
      objs.push(new THREE.Line(geo, mat));
    }
    return objs;
  }, [positions]);

  const beams = useMemo(() => {
    const b: { start: THREE.Vector3; end: THREE.Vector3; color: string; speed: number }[] = [];
    positions.forEach((pos, i) => {
      b.push({ start: new THREE.Vector3(0, 0, 0), end: new THREE.Vector3(...pos), color: AGENT_NODES[i].color, speed: 0.3 + i * 0.05 });
    });
    // Some ring beams
    for (let i = 0; i < positions.length; i += 2) {
      const next = (i + 1) % positions.length;
      b.push({ start: new THREE.Vector3(...positions[i]), end: new THREE.Vector3(...positions[next]), color: "#00d4aa", speed: 0.5 + i * 0.03 });
    }
    return b;
  }, [positions]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={linesRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
      {beams.map((beam, i) => (
        <EnergyBeam key={`beam-${i}`} {...beam} />
      ))}
    </group>
  );
};

const CentralCore = () => {
  const coreRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.x = Math.sin(t * 0.15) * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.5;
      innerRef.current.rotation.z = t * 0.3;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Outer wireframe icosahedron */}
      <mesh>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#00d4aa"
          emissive="#00d4aa"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Inner rotating octahedron */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#00d4aa"
          emissive="#00d4aa"
          emissiveIntensity={1.0}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Distorted core */}
      <Sphere args={[0.2, 32, 32]}>
        <MeshDistortMaterial
          color="#00d4aa"
          emissive="#00d4aa"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          distort={0.4}
          speed={3}
          roughness={0}
          metalness={0.8}
        />
      </Sphere>
      {/* Central glow */}
      <Sphere args={[0.45, 16, 16]}>
        <meshBasicMaterial color="#00d4aa" transparent opacity={0.05} />
      </Sphere>
    </group>
  );
};

const RotatingNetwork = () => {
  const groupRef = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    return AGENT_NODES.map(n => {
      const r = 2.5;
      return [Math.cos(n.angle) * r, Math.sin(n.angle) * r, 0] as [number, number, number];
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.06;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <CentralCore />
      <ConnectionLines />
      {AGENT_NODES.map((node, i) => (
        <GlowingNode key={node.name} position={positions[i]} color={node.color} name={node.name} index={i} />
      ))}
    </group>
  );
};

const FloatingParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0, 0.83, 0.67], // cyan
      [0.13, 0.77, 0.35], // green
      [0, 0.71, 0.85], // blue
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={400} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={400} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} transparent opacity={0.5} sizeAttenuation vertexColors />
    </points>
  );
};

const OrbitRing = ({ radius, speed, color, opacity }: { radius: number; speed: number; color: string; opacity: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

const AgentNetworkScene = () => {
  return (
    <div className="w-full h-[550px] relative">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1.0} color="#00d4aa" distance={20} />
        <pointLight position={[-5, -3, 3]} intensity={0.6} color="#22c55e" distance={15} />
        <pointLight position={[0, -5, 2]} intensity={0.4} color="#00b4d8" distance={15} />
        <spotLight position={[0, 8, 4]} intensity={0.5} color="#a78bfa" angle={0.5} penumbra={0.8} />

        <RotatingNetwork />
        <FloatingParticles />

        {/* Orbit rings */}
        <OrbitRing radius={3.8} speed={0.02} color="#00d4aa" opacity={0.06} />
        <OrbitRing radius={4.5} speed={-0.015} color="#22c55e" opacity={0.04} />
        <OrbitRing radius={5.2} speed={0.01} color="#00b4d8" opacity={0.03} />
      </Canvas>
      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default AgentNetworkScene;
