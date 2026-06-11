import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { yjsManager } from './yjsProvider';

export type BlockType = 
  | 'c30' | 'c60' 
  | 'girder' 
  | 'j' | 'j2' | 'j3' 
  | 'l30' | 'l60' 
  | 'p' | 'p2' 
  | 'papanatap' 
  | 'pj' 
  | 'plus30' | 'plus60' 
  | 's30' | 's60' 
  | 't30' | 't60'
  | 'alas' | 'atap' | 'alaskode';

export interface BlockData {
  id: string;
  type: BlockType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  blockId: string | null;
}

export interface SaveSlot {
  id: string;
  name: string;
  date: string;
  blocks: BlockData[];
}

interface GameState {
  blocks: BlockData[];
  selectedBlockType: BlockType | null;
  rotationIndex: number; // 0, 1, 2, 3 (0=0, 1=90, 2=180, 3=270 degrees)
  customRotation: [number, number, number]; // Pitch, Yaw, Roll in degrees
  flipAxis: 'x' | 'y' | 'z' | null; // Mirror axis
  draggingId: string | null;
  editingId: string | null; // For CAD-like precision editing
  transformMode: 'translate' | 'rotate'; // Gizmo mode
  isPanMode: boolean;
  showHelpers: boolean;
  showGrid: boolean;
  gridSize: number;
  cameraView: 'atas' | 'depan' | 'blkng' | 'kiri' | 'kanan' | 'reset' | null;
  pastBlocks: BlockData[][];
  futureBlocks: BlockData[][];
  hoverPos: [number, number, number] | null;
  contextMenu: ContextMenuState;
  unlockedProfiles: string[];
  piBalance: number;
  level: number;
  xp: number;
  triggerSnapCount: number;
  savedSlots: SaveSlot[];
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;

  gridSize: number;
  showGrid: boolean;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  
  // Multiplayer
  roomId: string | null;
  onlineUsers: { name: string; color: string; cursor: [number, number, number] | null }[];
  chatMessages: { id: string; sender: string; text: string; color: string; timestamp: number }[];
  unreadChatCount: number;
  prizePoolBalance: number;
  
  setRoomId: (id: string | null) => void;
  setOnlineUsers: (users: any[]) => void;
  setBlocksFromRemote: (blocks: BlockData[]) => void;
  setChatMessages: (messages: any[]) => void;
  clearUnreadChat: () => void;
  sendChatMessage: (text: string, senderName: string, senderColor: string) => void;
  setPrizePoolBalance: (balance: number) => void;
  fundPrizePool: (amount: number) => void;

  doSnap: () => void;
  saveSlot: (id: string, name: string) => void;
  loadSlot: (id: string) => void;
  deleteSlot: (id: string) => void;
  
  unlockProfile: (id: string) => void;
  addPiBalance: (amount: number) => void;
  deductPiBalance: (amount: number) => void;

  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  setShowHelpers: (show: boolean) => void;
  setCameraView: (view: 'atas' | 'depan' | 'blkng' | 'kiri' | 'kanan' | 'reset' | null) => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;

  addBlock: (block: Omit<BlockData, 'id'>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  updateBlockPosition: (id: string, position: [number, number, number]) => void;
  updateBlockRotation: (id: string, rotation: [number, number, number]) => void;
  updateBlockScale: (id: string, scale: [number, number, number]) => void;
  setSelectedBlockType: (type: BlockType | null) => void;
  rotateBlock: () => void;
  setCustomRotation: (axis: 'x' | 'y' | 'z', value: number) => void;
  setFlipAxis: (axis: 'x' | 'y' | 'z' | null) => void;
  setDraggingId: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate') => void;
  setPanMode: (isPan: boolean) => void;
  setHoverPos: (pos: [number, number, number] | null) => void;
  moveHoverPos: (dx: number, dy: number, dz: number) => void;
  setContextMenu: (menu: ContextMenuState) => void;
  clearBlocks: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      blocks: [],
      selectedBlockType: null,
      rotationIndex: 0,
      customRotation: [0, 0, 0],
      flipAxis: null,
      draggingId: null,
      editingId: null,
      transformMode: 'translate',
      isPanMode: false,
      showHelpers: true,
      cameraView: null,
      showGrid: true,
      gridSize: 30, // Default 30cm
      pastBlocks: [],
      futureBlocks: [],
      hoverPos: null,
      contextMenu: { visible: false, x: 0, y: 0, blockId: null },
      
      unlockedProfiles: ['c30', 'c60', 'girder', 'j', 'j2', 'j3', 'l30', 'l60', 'p', 'p2', 'pj', 'plus30', 'plus60', 's30', 's60', 't30', 't60'], // basic free profiles
      piBalance: 0,
      level: 0,
      xp: 0,
      triggerSnapCount: 0,
      savedSlots: [],
      
      language: 'id',
      setLanguage: (lang) => set({ language: lang }),
      
      gridSize: 30,
      showGrid: true,
      setGridSize: (size) => set({ gridSize: size }),
      setShowGrid: (show) => set({ showGrid: show }),

      // Multiplayer
      roomId: null,
      onlineUsers: [],
      chatMessages: [],
      unreadChatCount: 0,
      prizePoolBalance: 0,
      setRoomId: (id) => set({ roomId: id }),
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      setBlocksFromRemote: (blocks) => set({ blocks }),
      setPrizePoolBalance: (balance) => set({ prizePoolBalance: balance }),
      fundPrizePool: (amount) => set((state) => {
        const newBalance = state.prizePoolBalance + amount;
        yjsManager.updatePrizePool(newBalance);
        return { prizePoolBalance: newBalance };
      }),
      setChatMessages: (messages) => set((state) => {
        // If the new messages array is larger, increment unread count
        const diff = messages.length - state.chatMessages.length;
        return { 
          chatMessages: messages, 
          unreadChatCount: diff > 0 ? state.unreadChatCount + diff : state.unreadChatCount 
        };
      }),
      clearUnreadChat: () => set({ unreadChatCount: 0 }),
      sendChatMessage: (text, senderName, senderColor) => set((state) => {
        if (!state.roomId || !text.trim()) return state;
        const msg = {
          id: Math.random().toString(36).substr(2, 9),
          sender: senderName,
          text: text.trim(),
          color: senderColor,
          timestamp: Date.now()
        };
        yjsManager.addChatMessage(msg);
        return { chatMessages: [...state.chatMessages, msg] };
      }),

      doSnap: () => set((state) => ({ triggerSnapCount: state.triggerSnapCount + 1 })),
      saveSlot: (id, name) => set((state) => {
        const newSlot = {
          id,
          name,
          date: new Date().toLocaleString('id-ID'),
          blocks: [...state.blocks]
        };
        const existingIndex = state.savedSlots.findIndex(s => s.id === id);
        let newSlots = [...state.savedSlots];
        if (existingIndex >= 0) {
          newSlots[existingIndex] = newSlot;
        } else {
          newSlots.push(newSlot);
        }
        return { savedSlots: newSlots };
      }),
      
      loadSlot: (id) => set((state) => {
        const slot = state.savedSlots.find(s => s.id === id);
        if (!slot) return state;
        return {
          blocks: [...slot.blocks],
          pastBlocks: [],
          futureBlocks: [],
          editingId: null,
          draggingId: null
        };
      }),
      
      deleteSlot: (id) => set((state) => ({
        savedSlots: state.savedSlots.filter(s => s.id !== id)
      })),

      unlockProfile: (id) => set((state) => ({ unlockedProfiles: [...new Set([...state.unlockedProfiles, id])] })),
      addPiBalance: (amount) => set((state) => ({ piBalance: state.piBalance + amount })),
      deductPiBalance: (amount) => set((state) => ({ piBalance: Math.max(0, state.piBalance - amount) })),

      saveHistory: () => set((state) => ({
    pastBlocks: [...state.pastBlocks, state.blocks].slice(-30),
    futureBlocks: []
  })),

  undo: () => set((state) => {
    if (state.pastBlocks.length === 0) return state;
    const previous = state.pastBlocks[state.pastBlocks.length - 1];
    const newPast = state.pastBlocks.slice(0, -1);
    return {
      blocks: previous,
      pastBlocks: newPast,
      futureBlocks: [state.blocks, ...state.futureBlocks]
    };
  }),

  redo: () => set((state) => {
    if (state.futureBlocks.length === 0) return state;
    const next = state.futureBlocks[0];
    const newFuture = state.futureBlocks.slice(1);
    return {
      blocks: next,
      pastBlocks: [...state.pastBlocks, state.blocks],
      futureBlocks: newFuture
    };
  }),

  setShowHelpers: (show) => set({ showHelpers: show }),
  setCameraView: (view) => set({ cameraView: view }),
  setShowGrid: (show) => set({ showGrid: show }),
  setGridSize: (size) => set({ gridSize: size }),

  addBlock: (block) => set((state) => {
    let isInterlocking = false;
    let isInterlockingWithPapanatap = false;

    for (const b of state.blocks) {
      const dx = b.position[0] - block.position[0];
      const dy = b.position[1] - block.position[1];
      const dz = b.position[2] - block.position[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (dist < 1.5) {
        isInterlocking = true;
        if (b.type === 'papanatap') {
          isInterlockingWithPapanatap = true;
        }
      }
    }

    let gainedXP = 0;
    const type = block.type;

    if (type === 'alas') {
      gainedXP = 0.25;
    } else if (type === 'alaskode') {
      gainedXP = 0.5;
    } else if (type === 'atap') {
      gainedXP = 1.0;
    } else if (type === 'papanatap') {
      if (isInterlockingWithPapanatap) {
        gainedXP = 10;
      }
    } else {
      if (isInterlocking) {
        gainedXP = 1.0;
      }
    }

    let newXp = state.xp + gainedXP;
    let newLevel = state.level;
    while (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
    }

    const newBlock = { ...block, id: Math.random().toString(36).substr(2, 9) } as BlockData;
    
    // Multiplayer sync
    if (state.roomId) {
      yjsManager.addBlock(newBlock);
    }

    return {
      blocks: [...state.blocks, newBlock],
      pastBlocks: [...state.pastBlocks, state.blocks].slice(-30),
      futureBlocks: [],
      xp: newXp,
      level: newLevel
    };
  }),
  removeBlock: (id) => set((state) => {
    if (state.roomId) yjsManager.removeBlock(id);
    return {
      blocks: state.blocks.filter((b) => b.id !== id),
      pastBlocks: [...state.pastBlocks, state.blocks].slice(-30),
      futureBlocks: [],
      editingId: state.editingId === id ? null : state.editingId,
      draggingId: state.draggingId === id ? null : state.draggingId,
    };
  }),
  duplicateBlock: (id) => set((state) => {
    const blockToCopy = state.blocks.find(b => b.id === id);
    if (!blockToCopy) return state;
    const newPos = [...blockToCopy.position] as [number, number, number];
    newPos[1] += 0.3;
    newPos[2] += 0.09;
    const newBlock = { ...blockToCopy, id: Math.random().toString(36).substr(2, 9), position: newPos };
    
    if (state.roomId) yjsManager.addBlock(newBlock);
    
    return { 
      blocks: [...state.blocks, newBlock], 
      pastBlocks: [...state.pastBlocks, state.blocks].slice(-30),
      futureBlocks: [],
      editingId: newBlock.id 
    };
  }),
  updateBlockPosition: (id, position) => set((state) => {
    if (state.roomId) yjsManager.updateBlock(id, { position });
    return {
      blocks: state.blocks.map(b => b.id === id ? { ...b, position } : b),
    };
  }),
  updateBlockRotation: (id, rotation) => set((state) => {
    if (state.roomId) yjsManager.updateBlock(id, { rotation });
    return {
      blocks: state.blocks.map(b => b.id === id ? { ...b, rotation } : b),
    };
  }),
  updateBlockScale: (id, scale) => set((state) => {
    if (state.roomId) yjsManager.updateBlock(id, { scale });
    return {
      blocks: state.blocks.map(b => b.id === id ? { ...b, scale } : b),
    };
  }),
  setSelectedBlockType: (type) => set({ selectedBlockType: type, editingId: null }),
  rotateBlock: () => set((state) => ({ rotationIndex: (state.rotationIndex + 1) % 4 })),
  setCustomRotation: (axis, value) => set((state) => {
    const newRot = [...state.customRotation] as [number, number, number];
    if (axis === 'x') newRot[0] = value;
    if (axis === 'y') newRot[1] = value;
    if (axis === 'z') newRot[2] = value;
    return { customRotation: newRot };
  }),
  setFlipAxis: (axis) => set({ flipAxis: axis }),
  setDraggingId: (id) => set({ draggingId: id, editingId: null }),
  setEditingId: (id) => set({ editingId: id, draggingId: null }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setPanMode: (isPan) => set({ isPanMode: isPan }),
  setHoverPos: (pos) => set({ hoverPos: pos }),
  moveHoverPos: (dx, dy, dz) => set((state) => {
    if (!state.hoverPos) return state;
    const newPos: [number, number, number] = [
      Math.round((state.hoverPos[0] + dx) * 1000) / 1000,
      Math.round((state.hoverPos[1] + dy) * 1000) / 1000,
      Math.round((state.hoverPos[2] + dz) * 1000) / 1000
    ];
    return { hoverPos: newPos };
  }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  clearBlocks: () => set((state) => ({ 
    blocks: [],
    pastBlocks: [...state.pastBlocks, state.blocks].slice(-30),
    futureBlocks: []
  })),
    }),
    {
      name: 'blockbamboo-storage',
      partialize: (state) => ({ 
        blocks: state.blocks, 
        unlockedProfiles: state.unlockedProfiles, 
        piBalance: state.piBalance 
      }),
    }
  )
);
