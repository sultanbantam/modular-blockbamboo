"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { ModelBlock, PreviewBlock, preloadModels } from './ModelBlock';
import { yjsManager } from '@/store/yjsProvider';

// Preload models
if (typeof window !== 'undefined') {
  preloadModels();
}

const UNIT_XZ = 0.009; // 9mm fine grid for easier interlocking
const UNIT_Y = 0.3;    // 30cm vertical grid
const GRID_VISUAL = 0.09; // 9cm visual lines
const GRID_SIZE = 200; // 200 * 0.09m = 18m grid

// Ephemeral state for magnetic snapping shared between useFrame and keydown listener
let sharedClosestPair: { active: THREE.Mesh, static: THREE.Mesh, distance: number, delta: THREE.Vector3 } | null = null;

function Scene() {
  const { blocks, selectedBlockType, rotationIndex, customRotation, flipAxis, draggingId, editingId, transformMode, hoverPos, cameraView, setCameraView, showGrid, gridSize, saveHistory, addBlock, updateBlockPosition, updateBlockRotation, setDraggingId, setEditingId, setHoverPos, setContextMenu, isPanMode, triggerSnapCount, onlineUsers, roomId } = useGameStore();

  const [activeGroup, setActiveGroup] = useState<THREE.Group | null>(null);
  const orbitRef = useRef<any>(null);

  const { scene, camera } = useThree();

  useEffect(() => {
    if (triggerSnapCount > 0) {
      const pair = sharedClosestPair;
      if (pair && pair.distance < 1.0) {
        const targetId = draggingId || editingId;
        if (targetId) {
          const block = blocks.find(b => b.id === targetId);
          if (block) {
            updateBlockPosition(targetId, [
              block.position[0] + pair.delta.x,
              block.position[1] + pair.delta.y,
              block.position[2] + pair.delta.z,
            ]);
          }
        }
      }
    }
  }, [triggerSnapCount]);

  // Clear activeGroup when editingId changes
  useEffect(() => {
    if (!editingId) setActiveGroup(null);
  }, [editingId]);

  // Handle Camera View changes
  useEffect(() => {
    if (cameraView && orbitRef.current) {
      const distance = 15;
      const targetPos = new THREE.Vector3();
      
      switch (cameraView) {
        case 'atas': targetPos.set(0, distance, 0.1); break;
        case 'depan': targetPos.set(0, 2, distance); break;
        case 'blkng': targetPos.set(0, 2, -distance); break;
        case 'kiri': targetPos.set(-distance, 2, 0); break;
        case 'kanan': targetPos.set(distance, 2, 0); break;
        case 'reset': targetPos.set(10, 10, 10); break;
      }
      
      camera.position.copy(targetPos);
      orbitRef.current.target.set(0, 0, 0);
      orbitRef.current.update();
      
      setCameraView(null);
    }
  }, [cameraView, camera, setCameraView]);

  // Magnetic Snapping & Visual Feedback Loop
  useFrame(() => {
    const state = useGameStore.getState();
    const currentEditingId = state.editingId;
    const currentDraggingId = state.draggingId;

    // 1. Gather all snap points
    const snapPoints: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData?.isSnapPoint) {
        snapPoints.push(child);
      }
    });

    const activePoints = snapPoints.filter(p => p.userData.blockId === currentEditingId || p.userData.blockId === currentDraggingId || p.userData.blockId === 'preview');
    const staticPoints = snapPoints.filter(p => p.userData.blockId !== currentEditingId && p.userData.blockId !== currentDraggingId && p.userData.blockId !== 'preview');

    // Reset all points to RED
    snapPoints.forEach(p => {
      if ((p.material as any)?.color) {
        (p.material as any).color.set('red');
      }
    });

    let minDistance = Infinity;
    let bestPair: { active: THREE.Mesh, static: THREE.Mesh, distance: number, delta: THREE.Vector3 } | null = null;

    if (activePoints.length > 0 && staticPoints.length > 0) {
      const vActive = new THREE.Vector3();
      const vStatic = new THREE.Vector3();

      activePoints.forEach(ap => {
        ap.getWorldPosition(vActive);
        staticPoints.forEach(sp => {
          sp.getWorldPosition(vStatic);
          const dist = vActive.distanceTo(vStatic);
          if (dist < minDistance) {
            minDistance = dist;
            bestPair = { 
              active: ap, 
              static: sp, 
              distance: dist, 
              delta: new THREE.Vector3().subVectors(vStatic, vActive) 
            };
          }
        });
      });
    }

    sharedClosestPair = bestPair;

    // Visual Feedback: Turn GREEN if very close (< 5cm)
    const currentPair = bestPair as any;
    if (currentPair && currentPair.distance < 0.05) {
      if (currentPair.active.material?.color) {
        currentPair.active.material.color.set('#00ff00');
      }
      if (currentPair.static.material?.color) {
        currentPair.static.material.color.set('#00ff00');
      }
    }
  });

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const point = e.point;
    const x = Math.round(point.x / UNIT_XZ) * UNIT_XZ;
    const z = Math.round(point.z / UNIT_XZ) * UNIT_XZ;
    
    // Y snapping logic
    let y = 0;
    if (e.eventObject.name === "ground") {
      y = 0;
    } else if (e.eventObject.name === "dragPlane") {
      y = Math.round(point.y / UNIT_Y) * UNIT_Y;
    } else {
      // Hovering over a block
      const groupY = e.eventObject.position.y;
      const normal = e.face?.normal ? e.face.normal.clone() : new THREE.Vector3(0, 1, 0);
      const worldNormal = normal.transformDirection(e.object.matrixWorld);
      
      if (worldNormal.y > 0.5) {
        // Pointing at TOP face: snap to the height of the face
        y = Math.round(point.y / UNIT_Y) * UNIT_Y;
      } else {
        // Pointing at SIDE face: lock to the base height of this block
        y = groupY;
      }
    }

    if (draggingId) {
      updateBlockPosition(draggingId, [x, y, z]);
      setHoverPos(null);
    } else {
      setHoverPos([x, y, z]);
    }

    // Multiplayer Cursor Sync (Throttled to ~10 times per second)
    const state = useGameStore.getState();
    if (state.roomId) {
      const now = Date.now();
      const lastSync = (window as any).lastCursorSync || 0;
      if (now - lastSync > 100) {
        yjsManager.updateCursor([x, y, z]);
        (window as any).lastCursorSync = now;
      }
    }
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    const state = useGameStore.getState();
    if (state.isPanMode) return; // Don't interact with blocks in pan mode
    
    if (e.button === 0) { // Left click
      if (draggingId) {
        e.stopPropagation();
        setDraggingId(null);
      } else if (editingId) {
        // Clear editing if left click elsewhere
        setEditingId(null);
      }
    }
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (draggingId) {
      e.stopPropagation();
      setDraggingId(null);
    }
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Only place if not finishing a drag/edit and a block is selected
    if (!draggingId && !editingId && e.button === 0 && hoverPos && selectedBlockType) {
      addBlock({
        type: selectedBlockType,
        position: hoverPos,
        rotation: [
          (customRotation[0] * Math.PI) / 180,
          (rotationIndex * Math.PI) / 2 + (customRotation[1] * Math.PI) / 180,
          (customRotation[2] * Math.PI) / 180
        ],
        scale: flipAxis === 'x' ? [-1, 1, 1] : flipAxis === 'y' ? [1, -1, 1] : flipAxis === 'z' ? [1, 1, -1] : [1, 1, 1],
      });
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="forest" />

      {/* Invisible global plane to catch pointer events while dragging outside ground */}
      {draggingId && (
        <mesh 
          name="dragPlane"
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial />
        </mesh>
      )}

      <mesh 
        name="ground"
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        onPointerMove={onPointerMove}
        onClick={onClick}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[GRID_SIZE * GRID_VISUAL, GRID_SIZE * GRID_VISUAL]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {showGrid && (
        <Grid
          args={[GRID_SIZE * (gridSize / 100), GRID_SIZE * (gridSize / 100)]}
          cellSize={gridSize / 100}
          cellThickness={1}
          cellColor="#6f6f6f"
          sectionSize={(gridSize / 100) * 5}
          sectionThickness={1.5}
          sectionColor="#9d4b4b"
          fadeDistance={50}
        />
      )}

      {/* Render Remote Cursors */}
      {roomId && onlineUsers.map((user, idx) => {
        if (!user.cursor) return null;
        return (
          <group key={idx} position={user.cursor}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={user.color} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.02, 0.02, 0.02]} />
              <meshBasicMaterial color={user.color} />
            </mesh>
          </group>
        );
      })}

      {/* Render All Blocks */}
      {blocks.map((block) => (
        <group 
          key={block.id} 
          onPointerMove={!draggingId ? onPointerMove : undefined} 
          onPointerUp={(e) => {
            if (e.button === 2) {
              e.stopPropagation();
              setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                blockId: block.id
              });
            } else {
              onPointerUp(e);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isPanMode && e.button === 0) {
              setEditingId(block.id);
            } else {
              onClick(e);
            }
          }}
          position={block.position}
          rotation={block.rotation}
          ref={(el) => {
            if (editingId === block.id && el && el !== activeGroup) {
              setActiveGroup(el);
            }
          }}
        >
          <ModelBlock 
            type={block.type} 
            position={[0,0,0]} 
            rotation={[0,0,0]} 
            scale={block.scale}
            blockId={block.id}
          />
        </group>
      ))}

      {editingId && activeGroup && (() => {
        const TransformControlsAny = TransformControls as any;
        return (
        <TransformControlsAny 
          object={activeGroup}
          mode={transformMode}
          onDraggingChanged={(dragging: any) => {
             if (!dragging) saveHistory();
          }}
          onMouseUp={() => {
            if (activeGroup) {
              updateBlockPosition(editingId, [
                Math.round(activeGroup.position.x * 1000) / 1000, 
                Math.round(activeGroup.position.y * 1000) / 1000, 
                Math.round(activeGroup.position.z * 1000) / 1000
              ]);
              updateBlockRotation(editingId, [
                activeGroup.rotation.x, 
                activeGroup.rotation.y, 
                activeGroup.rotation.z
              ]);
            }
          }}
        />
        );
      })()}

      {hoverPos && selectedBlockType && !draggingId && !editingId && (
        <PreviewBlock 
          type={selectedBlockType} 
          position={hoverPos} 
          rotation={[
            (customRotation[0] * Math.PI) / 180,
            (rotationIndex * Math.PI) / 2 + (customRotation[1] * Math.PI) / 180,
            (customRotation[2] * Math.PI) / 180
          ]}
          scale={flipAxis === 'x' ? [-1, 1, 1] : flipAxis === 'y' ? [1, -1, 1] : flipAxis === 'z' ? [1, 1, -1] : [1, 1, 1]}
        />
      )}
      
      <OrbitControls 
        ref={orbitRef}
        makeDefault 
        target={[0, 0, 0]} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        minDistance={2} 
        maxDistance={50} 
        enabled={!draggingId}
        mouseButtons={
          isPanMode 
            ? { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
            : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
        }
      />
    </>
  );
}

export default function GameCanvas() {
  const { rotateBlock, draggingId, isPanMode, setPanMode } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const shift = e.shiftKey;
      const UNIT_XZ = shift ? 0.001 : 0.009; // 1mm if Shift, else 9mm
      const UNIT_Y = shift ? 0.001 : 0.3;    // 1mm if Shift, else 30cm
      const state = useGameStore.getState();

      let dx = 0, dy = 0, dz = 0;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (state.draggingId) {
          state.setDraggingId(null);
        } else if (state.editingId) {
          state.setEditingId(null);
        } else if (state.hoverPos && !state.draggingId && state.selectedBlockType) {
          state.addBlock({
            type: state.selectedBlockType,
            position: state.hoverPos,
            rotation: [
              (state.customRotation[0] * Math.PI) / 180,
              (state.rotationIndex * Math.PI) / 2 + (state.customRotation[1] * Math.PI) / 180,
              (state.customRotation[2] * Math.PI) / 180
            ],
            scale: state.flipAxis === 'x' ? [-1, 1, 1] : state.flipAxis === 'y' ? [1, -1, 1] : state.flipAxis === 'z' ? [1, 1, -1] : [1, 1, 1],
          });
        }
        return;
      }

      switch(e.key.toLowerCase()) {
        case 'r':
          state.rotateBlock();
          return;
        case 'w':
        case 'arrowup':
          dz = -UNIT_XZ;
          break;
        case 's':
        case 'arrowdown':
          dz = UNIT_XZ;
          break;
        case 'a':
        case 'arrowleft':
          dx = -UNIT_XZ;
          break;
        case 'd':
        case 'arrowright':
          dx = UNIT_XZ;
          break;
        case 'q':
        case 'pagedown':
          dy = -UNIT_Y;
          break;
        case 'e':
        case 'pageup':
          dy = UNIT_Y;
          return;
      }

      if (e.key === 'f' || e.key === 'F') {
        const pair = sharedClosestPair;
        if (pair && pair.distance < 1.0) { // Magnetic range 1 meter
          const targetId = state.draggingId || state.editingId;
          if (targetId) {
            const block = state.blocks.find(b => b.id === targetId);
            if (block) {
              state.updateBlockPosition(targetId, [
                block.position[0] + pair.delta.x,
                block.position[1] + pair.delta.y,
                block.position[2] + pair.delta.z,
              ]);
            }
          }
        }
        return;
      }

      if (dx !== 0 || dy !== 0 || dz !== 0) {
        state.saveHistory();
        if (state.draggingId || state.editingId) {
          const targetId = state.draggingId || state.editingId;
          const block = state.blocks.find(b => b.id === targetId);
          if (block) {
            state.updateBlockPosition(targetId!, [
              Math.round((block.position[0] + dx) * 1000) / 1000,
              Math.round((block.position[1] + dy) * 1000) / 1000,
              Math.round((block.position[2] + dz) * 1000) / 1000,
            ]);
          }
        } else {
          state.moveHoverPos(dx, dy, dz);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full h-full bg-stone-950 relative">
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
