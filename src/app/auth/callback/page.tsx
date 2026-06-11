"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePiStore } from "@/store/usePiStore";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      // Panggil store untuk menukarkan kode
      usePiStore.getState().loginWithBaMbooChain(code).then(() => {
        // Redirect kembali ke halaman utama setelah sukses
        router.push("/");
      }).catch(err => {
        console.error("SSO Error:", err);
        alert("Gagal login menggunakan SSO BaMbooChain: " + err.message);
        router.push("/");
      });
    } else {
      router.push("/");
    }
  }, [code, router]);

  return (
    <div className="w-full h-screen bg-stone-900 flex flex-col items-center justify-center text-white font-sans">
      <div className="animate-pulse flex flex-col items-center">
        <span className="text-6xl mb-4">🌿</span>
        <h1 className="text-2xl font-bold text-green-400">Verifikasi SSO...</h1>
        <p className="text-stone-400 mt-2">Menghubungkan dompet BaMbooChain Anda dengan enPIneering.</p>
      </div>
    </div>
  );
}
