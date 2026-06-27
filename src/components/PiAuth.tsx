"use client";

import { useEffect } from "react";
import { usePiStore } from "@/store/usePiStore";

export default function PiAuth() {
  const { login, skipLogin, isAuthenticating, error } = usePiStore();

  useEffect(() => {
    const initPi = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        try {
          window.Pi.init({ version: "2.0", sandbox: true });
          console.log("Pi SDK initialized");
        } catch (e) {
          console.warn("Pi init failed or already initialized", e);
        }
      } else {
        // If script hasn't loaded yet, try again shortly
        setTimeout(initPi, 500);
      }
    };
    initPi();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#111] text-stone-200">
      
      {/* Static Image Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sabumi.png')" }}
      >
        {/* Optional dark overlay to make modal stand out more */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Mock Header */}
      <div className="absolute top-0 left-0 w-full h-16 bg-[#1a1a1a]/80 backdrop-blur border-b border-[#333] z-10 flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded">
            <img src="/logo.png" alt="Logo" className="h-8" />
          </div>
          <div>
            <div className="text-xl font-bold text-green-500 leading-tight">BlockBamboo</div>
            <div className="text-xs text-stone-400">Constructor v1.0</div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="bg-[#1e1e1e]/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-[#333] text-center pointer-events-auto">
          <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Selamat Datang</h1>
          <p className="text-stone-400 mb-8">Silakan masuk untuk mulai membangun</p>
          
          <div className="space-y-4 mb-4">
            <button
              onClick={() => login()}
              disabled={isAuthenticating}
              className={`w-full bg-[#fbbc05] hover:bg-[#f2a900] text-black font-bold py-3 px-4 rounded-xl transition duration-200 flex justify-center items-center ${isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAuthenticating && usePiStore.getState().authMethod !== 'bamboochain' ? (
                <span className="animate-pulse">Menghubungkan ke Pi...</span>
              ) : (
                <span>Login dengan Pi Network</span>
              )}
            </button>

            <button
              onClick={() => {
                const clientId = "enpineering";
                const redirectUri = encodeURIComponent("https://www.bamboogame.click/auth/callback");
                window.location.href = `https://www.bamboochain.id/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
              }}
              disabled={isAuthenticating}
              className={`w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition duration-200 flex justify-center items-center gap-2 ${isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAuthenticating && usePiStore.getState().authMethod === 'bamboochain' ? (
                <span className="animate-pulse flex items-center gap-2">Menghubungkan ke BaMbooChain...</span>
              ) : (
                <span>Login dengan BaMbooChain</span>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
