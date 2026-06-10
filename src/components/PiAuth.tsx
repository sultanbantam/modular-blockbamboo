"use client";

import { usePiStore } from "@/store/usePiStore";

export default function PiAuth() {
  const { login, skipLogin, isAuthenticating, error } = usePiStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-stone-900 text-stone-200">
      <div className="bg-stone-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-stone-700 text-center">
        <h1 className="text-3xl font-bold mb-2 text-green-500 tracking-tight">BlockBamboo</h1>
        <p className="text-stone-400 mb-8">Eco-friendly Modular Construction</p>
        
        <button
          onClick={() => login()}
          disabled={isAuthenticating}
          className="w-full bg-[#fbbc05] hover:bg-[#f2a900] text-black font-bold py-3 px-4 rounded-lg transition duration-200 mb-4 flex justify-center items-center"
        >
          {isAuthenticating ? (
            <span className="animate-pulse">Connecting to Pi Network...</span>
          ) : (
            <span>Login with Pi</span>
          )}
        </button>

        <button
          onClick={() => skipLogin()}
          className="text-sm text-stone-500 hover:text-stone-300 underline"
        >
          Skip Login (Test Mode)
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
