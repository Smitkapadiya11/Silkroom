"use client";

import { ContactShadows, Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function PoloCard({
  src,
  position,
  interactive,
}: {
  src: string;
  position: [number, number, number];
  interactive: boolean;
}) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current || !interactive) return;
    const targetY = position[0] * 0.12 + state.pointer.x * 0.38;
    const targetX = -state.pointer.y * 0.18;
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetY, 0.055);
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetX, 0.055);
    mesh.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.045;
  });

  return (
    <mesh ref={mesh} position={position} castShadow>
      <planeGeometry args={[1.48, 1.86]} />
      <meshStandardMaterial map={texture} roughness={0.32} metalness={0.05} />
    </mesh>
  );
}

function Scene({
  images,
  orbit,
}: {
  images: string[];
  orbit?: boolean;
}) {
  const set = useMemo(() => images.slice(0, 3), [images]);
  const positions = useMemo<[number, number, number][]>(
    () =>
      set.length === 1
        ? [[0, 0.12, 0]]
        : [
            [-1.18, 0.08, -0.18],
            [0, 0.16, 0.16],
            [1.18, 0.02, -0.14],
          ],
    [set.length],
  );

  return (
    <>
      <color attach="background" args={["#ede7da"]} />
      <ambientLight intensity={0.62} />
      <spotLight position={[5, 7, 4]} angle={0.38} penumbra={0.85} intensity={22} castShadow />
      <Environment preset="studio" />
      {set.map((src, index) => (
        <PoloCard
          key={src}
          src={src}
          position={positions[index] ?? [0, 0, 0]}
          interactive={!orbit}
        />
      ))}
      <ContactShadows position={[0, -1.18, 0]} opacity={0.32} blur={2.6} scale={8} />
      {orbit ? (
        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
        />
      ) : null}
    </>
  );
}

export function PoloCanvas({
  images,
  orbit = false,
  className,
}: {
  images: string[];
  orbit?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.15, 4.35], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene images={images} orbit={orbit} />
        </Suspense>
      </Canvas>
    </div>
  );
}
