import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Particle system component
function Particles({ count = 1000 }) {
  const mesh = useRef();
  
  // Generate random positions for particles
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
    }
    
    return positions;
  }, [count]);

  // Animation loop
  useFrame((state) => {
    if (mesh.current) {
      // Rotate the entire particle system slowly
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
      
      // Move particles in a wave pattern
      const positions = mesh.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        
        // Create subtle wave motion
        positions[i3 + 2] = Math.sin(state.clock.elapsedTime * 0.5 + x * 0.1 + y * 0.1) * 0.5;
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={mesh} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#3B82F6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Floating geometric shapes
function FloatingShapes() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const shapes = useMemo(() => {
    const shapes = [];
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      
      shapes.push({
        position: [x, y, z],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: Math.random() * 0.5 + 0.2,
        type: Math.random() > 0.5 ? 'box' : 'sphere',
      });
    }
    return shapes;
  }, []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} index={index} />
      ))}
    </group>
  );
}

// Individual floating shape component
function FloatingShape({ position, rotation, scale, type, index }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Individual rotation for each shape
      meshRef.current.rotation.x += 0.01 * (index % 2 === 0 ? 1 : -1);
      meshRef.current.rotation.y += 0.015 * (index % 3 === 0 ? 1 : -1);
      
      // Subtle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {type === 'box' ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <sphereGeometry args={[0.7, 8, 8]} />
      )}
      <meshBasicMaterial
        color="#60A5FA"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  );
}

// Gradient background
function GradientBackground() {
  return (
    <mesh scale={[30, 30, 1]} position={[0, 0, -10]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent opacity={0.3}>
        <primitive
          object={
            new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color('#3B82F6') },
                color2: { value: new THREE.Color('#1E40AF') },
              },
              vertexShader: `
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                
                void main() {
                  vec2 uv = vUv;
                  float wave = sin(uv.x * 2.0 + time * 0.5) * sin(uv.y * 2.0 + time * 0.3) * 0.1;
                  vec3 color = mix(color1, color2, uv.y + wave);
                  gl_FragColor = vec4(color, 0.05);
                }
              `,
              transparent: true,
            })
          }
        />
      </meshBasicMaterial>
    </mesh>
  );
}

// Main animated background component
function AnimatedBackground({ className = '', theme = 'light' }) {
  // Adjust colors based on theme
  const isDark = theme === 'dark';
  
  return (
    <div className={`fixed inset-0 -z-10 ${className}`} style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Background gradient */}
        <GradientBackground />
        
        {/* Particle system */}
        <Particles count={isDark ? 800 : 1200} />
        
        {/* Floating shapes */}
        <FloatingShapes />
      </Canvas>
      
      {/* CSS gradient overlay for better blending */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(17, 24, 39, 0) 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        }}
      />
    </div>
  );
}

export default AnimatedBackground;