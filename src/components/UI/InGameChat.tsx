import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { usePiStore } from '@/store/usePiStore';

export function InGameChat() {
  const { roomId, chatMessages, unreadChatCount, clearUnreadChat, sendChatMessage, onlineUsers } = useGameStore();
  const { user } = usePiStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  if (!roomId) return null; // Don't show if not in a room

  const handleOpen = () => {
    setIsOpen(true);
    clearUnreadChat();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Find local user's color if possible
    const myName = user?.username || 'Pioneer';
    const myColor = onlineUsers.find(u => u.name === myName)?.color || '#c29b62';

    sendChatMessage(inputText, myName, myColor);
    setInputText('');
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 z-40 flex flex-col items-start pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-stone-900/95 backdrop-blur border border-stone-700 w-72 h-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 pointer-events-auto transition-all animate-in slide-in-from-bottom-5">
          <div className="bg-stone-800 p-3 border-b border-stone-700 flex justify-between items-center">
            <h3 className="text-stone-100 font-bold flex items-center gap-2">
              <span className="text-xl">💬</span> Obrolan Tim
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-sm">
            {chatMessages.length === 0 ? (
              <div className="text-center text-stone-500 italic mt-10">Belum ada obrolan. Sapa tim Anda!</div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <span className="text-xs font-bold" style={{ color: msg.color }}>{msg.sender}</span>
                  <span className="text-stone-300 bg-stone-800/50 p-2 rounded-lg rounded-tl-none inline-block max-w-[90%] break-words">
                    {msg.text}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-2 bg-stone-950 border-t border-stone-700 flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ketik pesan..." 
              className="flex-1 bg-stone-800 text-stone-200 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-amber-600 border border-transparent transition-colors"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-white px-3 py-2 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={handleOpen}
          className="bg-stone-800 hover:bg-stone-700 text-white p-3 rounded-full shadow-2xl border border-stone-700 pointer-events-auto relative transition-transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
              {unreadChatCount}
            </span>
          )}
        </button>
      )}

    </div>
  );
}
