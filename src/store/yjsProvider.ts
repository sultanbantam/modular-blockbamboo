import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useGameStore, BlockData } from './useGameStore';

class YjsManager {
  public ydoc: Y.Doc;
  public yBlocks: Y.Array<any>;
  public yChatMessages: Y.Array<any>;
  public yState: Y.Map<any>;
  public provider: WebrtcProvider | null = null;
  public awareness: any = null;
  public roomId: string | null = null;
  public isApplyingRemote = false;
  public isApplyingChatRemote = false;

  constructor() {
    this.ydoc = new Y.Doc();
    this.yBlocks = this.ydoc.getArray('blocks');
    this.yChatMessages = this.ydoc.getArray('chatMessages');
    this.yState = this.ydoc.getMap('gameState');
    
    // Listen to changes from Yjs (Remote or Local)
    this.yBlocks.observeDeep((events, transaction) => {
      if (transaction.local) return;
      this.isApplyingRemote = true;
      const blocksArray = this.yBlocks.toArray() as BlockData[];
      useGameStore.getState().setBlocksFromRemote(blocksArray);
      this.isApplyingRemote = false;
    });

    // Listen to chat changes
    this.yChatMessages.observe((event, transaction) => {
      if (transaction.local) return;
      this.isApplyingChatRemote = true;
      const chatArray = this.yChatMessages.toArray().map(yMap => {
        const obj: any = {};
        yMap.forEach((val: any, key: string) => { obj[key] = val; });
        return obj;
      });
      useGameStore.getState().setChatMessages(chatArray);
      this.isApplyingChatRemote = false;
    });

    // Listen to game state changes (e.g. Prize Pool)
    this.yState.observe((event, transaction) => {
      if (transaction.local) return;
      const prizePool = this.yState.get('prizePool');
      if (typeof prizePool === 'number') {
        useGameStore.getState().setPrizePoolBalance(prizePool);
      }
    });
  }

  public connect(roomId: string, username: string, color: string) {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
    }

    this.roomId = roomId;

    // Use default public signaling servers for WebrtcProvider
    this.provider = new WebrtcProvider(roomId, this.ydoc, {
      signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com']
    });

    this.awareness = this.provider.awareness;

    // Set local state
    this.awareness.setLocalStateField('user', {
      name: username,
      color: color,
      cursor: null // {x, y, z} for 3D cursor later
    });

    // Listen to presence changes
    this.awareness.on('change', () => {
      const states = Array.from(this.awareness.getStates().values());
      useGameStore.getState().setOnlineUsers(states.map((s: any) => s.user).filter(Boolean));
    });
  }

  public disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
      this.roomId = null;
    }
  }

  // Helpers to mutate Yjs Array from Zustand
  public addBlock(block: BlockData) {
    if (this.isApplyingRemote) return; // Prevent loop
    const ymap = new Y.Map();
    for (const [key, value] of Object.entries(block)) {
      ymap.set(key, value);
    }
    this.yBlocks.push([ymap]);
  }

  public removeBlock(id: string) {
    if (this.isApplyingRemote) return;
    let index = -1;
    for (let i = 0; i < this.yBlocks.length; i++) {
      const b = this.yBlocks.get(i) as any;
      if (b.get('id') === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      this.yBlocks.delete(index, 1);
    }
  }

  public updateBlock(id: string, updates: Partial<BlockData>) {
    if (this.isApplyingRemote) return;
    for (let i = 0; i < this.yBlocks.length; i++) {
      const b = this.yBlocks.get(i) as any;
      if (b.get('id') === id) {
        for (const [key, value] of Object.entries(updates)) {
          b.set(key, value);
        }
        break;
      }
    }
  }
  
  public updateCursor(position: [number, number, number] | null) {
    if (this.awareness) {
      this.awareness.setLocalStateField('user', {
        ...this.awareness.getLocalState().user,
        cursor: position
      });
    }
  }

  public addChatMessage(message: { id: string, sender: string, text: string, color: string, timestamp: number }) {
    if (this.isApplyingChatRemote) return;
    const ymap = new Y.Map();
    for (const [key, value] of Object.entries(message)) {
      ymap.set(key, value);
    }
    this.yChatMessages.push([ymap]);
  }

  public updatePrizePool(balance: number) {
    this.yState.set('prizePool', balance);
  }
}

export const yjsManager = new YjsManager();
