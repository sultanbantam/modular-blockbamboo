import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePiStore } from './usePiStore';

export type LandStatus = 'empty' | 'constructing' | 'built' | 'active' | 'producing' | 'ready_to_harvest';
export type LandType = 'none' | 'housing' | 'farm' | 'fishery' | 'livestock' | 'market';

export interface LandData {
  id: string;
  x: number;
  y: number;
  type: LandType;
  level: number;
  status: LandStatus;
  productionEndTime?: number; // timestamp
  currentProduct?: string;
  modelUrl?: string; // URL for GLB model
  modelScale?: number;
}

export interface InventoryItem {
  productCode: string;
  quantity: number;
}

interface SabumiState {
  isSabumiMode: boolean;
  setIsSabumiMode: (mode: boolean) => void;
  
  // Player Data
  level: number;
  xp: number;
  gold: number;
  bmcInternal: number;
  
  // Lands
  lands: LandData[];
  
  // Inventory
  inventory: InventoryItem[];

  // Actions
  initializePlayer: () => void;
  claimInitialLand: () => void;
  buildOnLand: (landId: string, type: LandType, modelUrl?: string, modelScale?: number) => void;
  finishConstruction: (landId: string) => void;
  startProduction: (landId: string, productCode: string, durationMs: number) => void;
  harvestProduction: (landId: string, yieldQuantity: number) => void;
  sellItem: (productCode: string, quantity: number, pricePerUnit: number) => void;
  buyItem: (productCode: string, quantity: number, pricePerUnit: number) => void;
}

// Generate an initial grid of empty lands (5x5 for prototype)
const generateInitialLands = (): LandData[] => {
  const lands: LandData[] = [];
  for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
      lands.push({
        id: `land_${x}_${y}`,
        x,
        y,
        type: 'none',
        level: 0,
        status: 'empty',
      });
    }
  }
  return lands;
};

export const useSabumiStore = create<SabumiState>()(
  persist(
    (set, get) => ({
      isSabumiMode: false,
      setIsSabumiMode: (mode) => set({ isSabumiMode: mode }),
      
      level: 1,
      xp: 0,
      gold: 500, // starting gold
      bmcInternal: 0,
      
      lands: generateInitialLands(),
      inventory: [
        { productCode: 'bamboo_seed', quantity: 5 } // starter seeds
      ],
      
      initializePlayer: () => {
        // Here we could fetch from BaMbooChain API if available.
        // For now, we rely on persisted local state or usePiStore.
      },
      
      claimInitialLand: () => set((state) => {
        const centerLandId = 'land_0_0';
        const hasClaimed = state.lands.some(l => l.type !== 'none' || l.status !== 'empty');
        if (hasClaimed) return state; // Already claimed

        return {
          lands: state.lands.map(l => 
            l.id === centerLandId 
              ? { ...l, type: 'housing', level: 1, status: 'built' } 
              : l
          )
        };
      }),
      
      buildOnLand: (landId, type, modelUrl, modelScale) => set((state) => {
        const cost = 100; // Mock cost
        if (state.gold < cost) {
          alert("Gold tidak cukup!");
          return state;
        }
        
        return {
          gold: state.gold - cost,
          lands: state.lands.map(l => 
            l.id === landId 
              ? { ...l, type, status: 'constructing', productionEndTime: Date.now() + 5000, modelUrl, modelScale } // 5 sec build time
              : l
          )
        };
      }),
      
      finishConstruction: (landId) => set((state) => ({
        lands: state.lands.map(l =>
          l.id === landId
            ? { ...l, status: 'built', productionEndTime: undefined }
            : l
        )
      })),
      
      startProduction: (landId, productCode, durationMs) => set((state) => {
        // e.g. consume seed
        let seedConsumed = false;
        const newInv = state.inventory.map(item => {
          if (item.productCode === productCode + '_seed' && item.quantity > 0) {
            seedConsumed = true;
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });

        // if we are strict about seeds, we can check seedConsumed
        
        return {
          inventory: newInv,
          lands: state.lands.map(l =>
            l.id === landId
              ? { ...l, status: 'producing', currentProduct: productCode, productionEndTime: Date.now() + durationMs }
              : l
          )
        };
      }),
      
      harvestProduction: (landId, yieldQuantity) => set((state) => {
        const land = state.lands.find(l => l.id === landId);
        if (!land || !land.currentProduct) return state;
        
        const existingItem = state.inventory.find(i => i.productCode === land.currentProduct);
        let newInv;
        if (existingItem) {
          newInv = state.inventory.map(i => 
            i.productCode === land.currentProduct 
              ? { ...i, quantity: i.quantity + yieldQuantity }
              : i
          );
        } else {
          newInv = [...state.inventory, { productCode: land.currentProduct, quantity: yieldQuantity }];
        }
        
        // Gain XP
        let newXp = state.xp + 10;
        let newLevel = state.level;
        if (newXp >= 100) {
          newXp -= 100;
          newLevel += 1;
        }

        return {
          inventory: newInv,
          xp: newXp,
          level: newLevel,
          lands: state.lands.map(l =>
            l.id === landId
              ? { ...l, status: 'built', currentProduct: undefined, productionEndTime: undefined }
              : l
          )
        };
      }),

      sellItem: (productCode, quantity, pricePerUnit) => set((state) => {
        const item = state.inventory.find(i => i.productCode === productCode);
        if (!item || item.quantity < quantity) {
          alert("Item tidak cukup!");
          return state;
        }
        
        const earnGold = quantity * pricePerUnit;
        return {
          gold: state.gold + earnGold,
          inventory: state.inventory.map(i => 
            i.productCode === productCode 
              ? { ...i, quantity: i.quantity - quantity }
              : i
          )
        };
      }),
      
      buyItem: (productCode, quantity, pricePerUnit) => set((state) => {
        const cost = quantity * pricePerUnit;
        if (state.gold < cost) {
          alert("Gold tidak cukup!");
          return state;
        }
        
        const existingItem = state.inventory.find(i => i.productCode === productCode);
        let newInv;
        if (existingItem) {
          newInv = state.inventory.map(i => 
            i.productCode === productCode 
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          newInv = [...state.inventory, { productCode, quantity }];
        }
        
        return {
          gold: state.gold - cost,
          inventory: newInv
        };
      })
    }),
    {
      name: 'sabumi-storage'
    }
  )
);
