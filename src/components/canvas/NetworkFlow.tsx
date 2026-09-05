'use client';

import React, { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useNetworkStore } from '@/store/useNetworkStore';
import { SwitchNode } from '@/components/nodes/SwitchNode';
import { RouterNode } from '@/components/nodes/RouterNode';
import { WorkstationNode } from '@/components/nodes/WorkstationNode';
import { TextNoteNode } from '@/components/nodes/TextNoteNode';
import { ZoneNode } from '@/components/nodes/ZoneNode';
import { NetworkCableEdge } from '@/components/edges/NetworkCableEdge';

const nodeTypes = {
  switchNode: SwitchNode,
  routerNode: RouterNode,
  workstationNode: WorkstationNode,
  textNoteNode: TextNoteNode,
  zoneNode: ZoneNode,
};

const edgeTypes = {
  networkCableEdge: NetworkCableEdge,
};

export const NetworkFlow: React.FC = () => {
  const nodes = useNetworkStore((s) => s.nodes);
  const edges = useNetworkStore((s) => s.edges);
  const onNodesChange = useNetworkStore((s) => s.onNodesChange);
  const onEdgesChange = useNetworkStore((s) => s.onEdgesChange);
  const onConnect = useNetworkStore((s) => s.onConnect);
  const setSelectedNodeId = useNetworkStore((s) => s.setSelectedNodeId);
  const selectedNodeId = useNetworkStore((s) => s.selectedNodeId);
  const removeNode = useNetworkStore((s) => s.removeNode);

  const isEnvelopeMode = useNetworkStore((s) => s.isEnvelopeMode);
  const handleNodeClickEnvelope = useNetworkStore((s) => s.handleNodeClickEnvelope);
  const activePingBanner = useNetworkStore((s) => s.activePingBanner);
  const setEnvelopeMode = useNetworkStore((s) => s.setEnvelopeMode);

  // Escuchar atajos globales: Ctrl+Z, Ctrl+Y, Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si se está escribiendo en un input o textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useNetworkStore.temporal.getState().redo();
        } else {
          useNetworkStore.temporal.getState().undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        useNetworkStore.temporal.getState().redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          removeNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, removeNode]);

  return (
    <div className={`w-full h-full bg-[#070b14] relative ${isEnvelopeMode ? 'cursor-crosshair' : ''}`}>
      {/* Banner flotante de simulación de paquetes o Modo Sobre */}
      {activePingBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-slate-900/95 border-2 border-cyan-400 text-cyan-300 font-bold text-xs shadow-2xl shadow-cyan-500/30 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{activePingBanner}</span>
          {isEnvelopeMode && (
            <button
              onClick={() => setEnvelopeMode(false)}
              className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] hover:bg-rose-500/40 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => {
          if (isEnvelopeMode) {
            handleNodeClickEnvelope(node.id);
          } else {
            setSelectedNodeId(node.id);
          }
        }}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2.5}
        selectionMode={SelectionMode.Partial}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e293b"
          className="bg-[#070b14]"
        />
        <Controls
          className="!bg-slate-900 !border-slate-800 !rounded-xl !shadow-2xl [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-200 [&>button:hover]:!bg-slate-800"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            if (node.type === 'switchNode') return '#00f0ff';
            if (node.type === 'routerNode') return '#f59e0b';
            if (node.type === 'workstationNode') return '#10b981';
            if (node.type === 'zoneNode') return '#3b82f6';
            return '#64748b';
          }}
          maskColor="rgba(7, 11, 20, 0.7)"
          className="!bg-slate-950/90 !border-slate-800 !rounded-xl !overflow-hidden !shadow-2xl"
        />
      </ReactFlow>
    </div>
  );
};
