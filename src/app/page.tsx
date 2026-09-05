'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { HeaderBar } from '@/components/toolbar/HeaderBar';
import { DeviceDrawer } from '@/components/toolbar/DeviceDrawer';
import { PingModal } from '@/components/modals/PingModal';
import { AlertToast } from '@/components/modals/AlertToast';


import { DeviceInspectorModal } from '@/components/modals/DeviceInspectorModal';
import { WebBrowserModal } from '@/components/modals/WebBrowserModal';
import { SubnetCalculatorModal } from '@/components/modals/SubnetCalculatorModal';
import { BOMReportModal } from '@/components/modals/BOMReportModal';

// Cargamos ReactFlow dinámicamente para soporte óptimo de SVG en App Router
const NetworkFlow = dynamic(
  () => import('@/components/canvas/NetworkFlow').then((mod) => mod.NetworkFlow),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Iniciando motor de diagramación PacketFlow SaaS...</span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Barra de navegación superior con herramientas SaaS */}
      <HeaderBar onOpenPingModal={() => setIsPingModalOpen(true)} />

      {/* Área de trabajo principal */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Paleta lateral de dispositivos extendida */}
        <DeviceDrawer />

        {/* Lienzo interactivo React Flow */}
        <main className="flex-1 h-full relative">
          <NetworkFlow />
        </main>
      </div>

      {/* Modales y Herramientas SaaS */}
      <PingModal
        isOpen={isPingModalOpen}
        onClose={() => setIsPingModalOpen(false)}
      />
      <DeviceInspectorModal />
      <WebBrowserModal />
      <SubnetCalculatorModal />
      <BOMReportModal />
      <AlertToast />
    </div>
  );
}
