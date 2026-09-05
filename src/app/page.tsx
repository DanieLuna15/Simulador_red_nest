'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { HeaderBar } from '@/components/toolbar/HeaderBar';
import { DeviceDrawer } from '@/components/toolbar/DeviceDrawer';
import { PingModal } from '@/components/modals/PingModal';
import { AlertToast } from '@/components/modals/AlertToast';

// Cargamos ReactFlow dinámicamente con ssr: false para evitar discrepancias de hidratación con SVG
const NetworkFlow = dynamic(
  () => import('@/components/canvas/NetworkFlow').then((mod) => mod.NetworkFlow),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Cargando lienzo de topología de red...</span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Barra de navegación superior */}
      <HeaderBar onOpenPingModal={() => setIsPingModalOpen(true)} />

      {/* Área de trabajo principal */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Paleta lateral de dispositivos */}
        <DeviceDrawer />

        {/* Lienzo interactivo React Flow */}
        <main className="flex-1 h-full relative">
          <NetworkFlow />
        </main>
      </div>

      {/* Modales y Notificaciones */}
      <PingModal
        isOpen={isPingModalOpen}
        onClose={() => setIsPingModalOpen(false)}
      />
      <AlertToast />
    </div>
  );
}
