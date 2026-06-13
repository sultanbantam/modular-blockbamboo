import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import { useGameStore, BlockData } from './useGameStore';

class YjsManager {
  public ydoc: Y.Doc;
  public yBlocks: Y.Array<any>;
  public yChatMessages: Y.Array<any>;
  public yState: Y.Map<any>;
  public provider: WebrtcProvider | null = null;
  public wsProvider: WebsocketProvider | null = null;
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
    if (this.wsProvider) {
      this.wsProvider.disconnect();
      this.wsProvider.destroy();
      this.wsProvider = null;
    }

    this.roomId = roomId;

    // Use default signaling servers (y-webrtc-eu.fly.dev) and extra fallbacks
    this.provider = new WebrtcProvider(roomId, this.ydoc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com',
        'wss://y-webrtc-eu.fly.dev'
      ],
      peerOpts: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      }
    });

    // Connect to WebSocket provider for highly reliable sync fallback/primary
    const wsServerUrl = process.env.NEXT_PUBLIC_WS_SERVER || 'wss://demos.yjs.dev';
    this.wsProvider = new WebsocketProvider(wsServerUrl, roomId, this.ydoc);

    // Keep reference to primary awareness (WebSocket is more reliable, fallback to WebRTC)
    this.awareness = this.wsProvider.awareness;

    const localUser = {
      name: username,
      color: color,
      cursor: null // {x, y, z} for 3D cursor later
    };

    // Set local state on both providers to allow peer discovery across both protocols
    if (this.provider) {
      this.provider.awareness.setLocalStateField('user', localUser);
    }
    if (this.wsProvider) {
      this.wsProvider.awareness.setLocalStateField('user', localUser);
    }

    // Combine online users from both providers
    const handleAwarenessChange = () => {
      const allUsersMap = new Map<string, any>();
      
      if (this.provider) {
        Array.from(this.provider.awareness.getStates().values()).forEach((s: any) => {
          if (s.user) allUsersMap.set(s.user.name, s.user);
        });
      }
      if (this.wsProvider) {
        Array.from(this.wsProvider.awareness.getStates().values()).forEach((s: any) => {
          if (s.user) allUsersMap.set(s.user.name, s.user);
        });
      }
      
      useGameStore.getState().setOnlineUsers(Array.from(allUsersMap.values()));
    };

    if (this.provider) {
      this.provider.awareness.on('change', handleAwarenessChange);
    }
    if (this.wsProvider) {
      this.wsProvider.awareness.on('change', handleAwarenessChange);
    }
  }

  public disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }
    if (this.wsProvider) {
      this.wsProvider.disconnect();
      this.wsProvider.destroy();
      this.wsProvider = null;
    }
    this.roomId = null;
    this.awareness = null;
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
    if (this.provider) {
      const user = this.provider.awareness.getLocalState()?.user;
      if (user) {
        this.provider.awareness.setLocalStateField('user', {
          ...user,
          cursor: position
        });
      }
    }
    if (this.wsProvider) {
      const user = this.wsProvider.awareness.getLocalState()?.user;
      if (user) {
        this.wsProvider.awareness.setLocalStateField('user', {
          ...user,
          cursor: position
        });
      }
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
