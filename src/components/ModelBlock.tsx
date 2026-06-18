import * as THREE from 'three';
import { useGLTF, Text } from '@react-three/drei';
import { BlockType, useGameStore } from '@/store/useGameStore';
import { useMemo } from 'react';

// Pre-load all models so they don't pop in
export function preloadModels() {
  const models = ['c30', 'c60', 'girder', 'j', 'j2', 'j3', 'l30', 'l60', 'p', 'p2', 'papanatap', 'pj', 'plus30', 'plus60', 's30', 's60', 't30', 't60', 'alas', 'atap', 'alaskode'];
  models.forEach(m => useGLTF.preload(`/models/${m}.glb`));
}

function calculateBounds(scene: THREE.Group | THREE.Object3D) {
  const box = new THREE.Box3();
  scene.traverse((child) => {
    // Only include visible meshes to avoid SketchUp hidden geometry bugs
    if (child.visible && ((child as THREE.Mesh).isMesh || (child as THREE.Line).isLine)) {
      const childBox = new THREE.Box3().setFromObject(child);
      if (!childBox.isEmpty()) box.union(childBox);
    }
  });

  // Fallback if empty
  if (box.isEmpty()) {
    box.setFromObject(scene);
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return {
    height: size.y,
    size: size,
    offset: [-center.x, -box.min.y, -center.z] as [number, number, number]
  };
}

export function ModelBlock({ type, position, rotation, scale = [1,1,1], blockId }: { type: BlockType, position: [number, number, number], rotation: [number, number, number], scale?: [number, number, number], blockId?: string }) {
  const { scene } = useGLTF(`/models/${type}.glb`);
  const isHouseModel = ['rmh', 'rmh1', 'rmh2', 'rmh3', 'rmh4', 'rmh5', 'rtb', 'RBK21'].includes(type);
  const m = isHouseModel ? 0.001 : 1;
  const finalScale = [scale[0] * m, scale[1] * m, scale[2] * m] as [number, number, number];
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const showHelpers = useGameStore(state => state.showHelpers);
  
  const { height, size, offset } = useMemo(() => calculateBounds(scene), [scene]);

  const points = useMemo(() => {
    const customPoints: [number, number, number][] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((child) => {
      if (child.name.toLowerCase().includes('snap')) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        // Since the scene itself is offset, we add the offset to the world position of the node
        customPoints.push([pos.x + offset[0], pos.y + offset[1], pos.z + offset[2]]);
      }
    });

    if (customPoints.length > 0) {
      return customPoints;
    }

    // Fallback to Bounding Box corners
    return [
      [-size.x / 2, 0, -size.z / 2],
      [size.x / 2, 0, -size.z / 2],
      [-size.x / 2, 0, size.z / 2],
      [size.x / 2, 0, size.z / 2],
      [-size.x / 2, height, -size.z / 2],
      [size.x / 2, height, -size.z / 2],
      [-size.x / 2, height, size.z / 2],
      [size.x / 2, height, size.z / 2]
    ] as [number, number, number][];
  }, [scene, size, height, offset]);

  return (
    <group position={position} rotation={rotation} scale={finalScale}>
      <group position={offset}>
        <primitive object={clonedScene} />
      </group>
      
      {/* Visual Alignment Helpers */}
      {showHelpers && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[size.x, height, size.z]} />
          <meshBasicMaterial color="#0088ff" wireframe opacity={0.3} transparent />
        </mesh>
      )}
      
      {/* Snap Points */}
      {showHelpers && points.map((p, i) => (
        <mesh key={i} position={p} userData={{ isSnapPoint: true, blockId }}>
          <sphereGeometry args={[0.015]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
}

export function PreviewBlock({ type, position, rotation, scale = [1,1,1], blockId = 'preview' }: { type: BlockType, position: [number, number, number], rotation: [number, number, number], scale?: [number, number, number], blockId?: string }) {
  const { scene } = useGLTF(`/models/${type}.glb`);
  const isHouseModel = ['rmh', 'rmh1', 'rmh2', 'rmh3', 'rmh4', 'rmh5', 'rtb', 'RBK21'].includes(type);
  const m = isHouseModel ? 0.001 : 1;
  const finalScale = [scale[0] * m, scale[1] * m, scale[2] * m] as [number, number, number];
  const showHelpers = useGameStore(state => state.showHelpers);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Make a clone of the material to not affect the original
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const mat = m.clone();
            mat.transparent = true;
            mat.opacity = 0.5;
            mat.depthTest = false; // So it shows over everything
            return mat;
          });
        } else if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
          (mesh.material as THREE.Material).transparent = true;
          (mesh.material as THREE.Material).opacity = 0.5;
          (mesh.material as THREE.Material).depthTest = false;
        }
      }
    });
    return clone;
  }, [scene]);

  const { height, size, offset } = useMemo(() => calculateBounds(scene), [scene]);

  const points = useMemo(() => {
    const customPoints: [number, number, number][] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((child) => {
      if (child.name.toLowerCase().includes('snap')) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        customPoints.push([pos.x + offset[0], pos.y + offset[1], pos.z + offset[2]]);
      }
    });

    if (customPoints.length > 0) {
      return customPoints;
    }

    return [
      [-size.x / 2, 0, -size.z / 2],
      [size.x / 2, 0, -size.z / 2],
      [-size.x / 2, 0, size.z / 2],
      [size.x / 2, 0, size.z / 2],
      [-size.x / 2, height, -size.z / 2],
      [size.x / 2, height, -size.z / 2],
      [-size.x / 2, height, size.z / 2],
      [size.x / 2, height, size.z / 2]
    ] as [number, number, number][];
  }, [scene, size, height, offset]);

  return (
    <group position={position} rotation={rotation} scale={finalScale}>
      <group position={offset}>
        <primitive object={clonedScene} />
      </group>

      {/* Visual Alignment Helpers */}
      {showHelpers && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[size.x, height, size.z]} />
          <meshBasicMaterial color="#0088ff" wireframe />
        </mesh>
      )}
      
      {/* Snap Points */}
      {showHelpers && points.map((p, i) => (
        <mesh key={i} position={p} userData={{ isSnapPoint: true, blockId }}>
          <sphereGeometry args={[0.015]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}

      {/* Axis Arrows */}
      {showHelpers && (
        <group position={[0, height / 2, 0]}>
          <arrowHelper args={[new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), Math.max(size.x, 0.5), 0xff0000, 0.1, 0.05]} />
          <Text position={[Math.max(size.x, 0.5) + 0.1, 0, 0]} color="red" fontSize={0.1}>X</Text>
          
          <arrowHelper args={[new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), Math.max(height, 0.5), 0x00ff00, 0.1, 0.05]} />
          <Text position={[0, Math.max(height, 0.5) + 0.1, 0]} color="green" fontSize={0.1}>Y</Text>
          
          <arrowHelper args={[new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), Math.max(size.z, 0.5), 0x0000ff, 0.1, 0.05]} />
          <Text position={[0, 0, Math.max(size.z, 0.5) + 0.1]} color="#0088ff" fontSize={0.1}>Z</Text>
        </group>
      )}

      {/* Flip Planes */}
      {scale[0] === -1 && (
        <mesh position={[0, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[Math.max(size.z * 1.5, 1), Math.max(height * 1.5, 1)]} />
          <meshBasicMaterial color="red" opacity={0.3} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
      {scale[1] === -1 && (
        <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Math.max(size.x * 1.5, 1), Math.max(size.z * 1.5, 1)]} />
          <meshBasicMaterial color="green" opacity={0.3} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
      {scale[2] === -1 && (
        <mesh position={[0, height / 2, 0]}>
          <planeGeometry args={[Math.max(size.x * 1.5, 1), Math.max(height * 1.5, 1)]} />
          <meshBasicMaterial color="#0088ff" opacity={0.3} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
      
    </group>
  );
}
