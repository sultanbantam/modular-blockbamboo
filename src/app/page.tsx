"use client";

import PiAuth from "@/components/PiAuth";
import GameCanvas from "@/components/GameCanvas";
import { CataloguePanel } from "@/components/UI/CataloguePanel";
import { MaterialPanel } from "@/components/UI/MaterialPanel";
import { AdvancedControls } from "@/components/UI/AdvancedControls";
import ContextMenu from "@/components/UI/ContextMenu";
import { TopControls } from "@/components/UI/TopControls";
import { ActionBar } from "@/components/UI/ActionBar";
import { InGameChat } from "@/components/UI/InGameChat";
import { usePiStore } from "@/store/usePiStore";

export default function Home() {
  const isAuthenticated = usePiStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <PiAuth />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-stone-900 text-stone-200 overflow-hidden relative">
      <TopControls />
      
      {/* 3D Game Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas />
      </div>

      {/* UI Overlays */}
      <CataloguePanel />
      <MaterialPanel />
      <AdvancedControls />
      <ContextMenu />
      <ActionBar />
      <InGameChat />
    </main>
  );
}
