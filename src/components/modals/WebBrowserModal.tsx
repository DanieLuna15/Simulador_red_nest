'use client';

import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, X, ShieldCheck } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';

export const WebBrowserModal: React.FC = () => {
  const isWebBrowserOpen = useNetworkStore((s) => s.isWebBrowserOpen);
  const setIsWebBrowserOpen = useNetworkStore((s) => s.setIsWebBrowserOpen);
  const webBrowserUrl = useNetworkStore((s) => s.webBrowserUrl);
  const setWebBrowserUrl = useNetworkStore((s) => s.setWebBrowserUrl);
  const nodes = useNetworkStore((s) => s.nodes);

  const [inputUrl, setInputUrl] = useState(webBrowserUrl || 'http://192.168.1.10');
  const [renderedContent, setRenderedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isWebBrowserOpen) return null;

  const handleNavigate = (targetUrl: string) => {
    setLoading(true);
    setErrorMsg(null);
    setRenderedContent(null);

    // Limpiar url
    const clean = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

    setTimeout(() => {
      // Buscar si algún nodo tiene esa IP o nombre de dominio
      const targetNode = nodes.find(
        (n) =>
          (n.data.ip as string) === clean ||
          ((n.data.label as string) || '').toLowerCase() === clean.toLowerCase() ||
          clean === '192.168.1.10' ||
          clean === 'empresa.local'
      );

      if (!targetNode) {
        setErrorMsg(`HTTP 404: No se pudo resolver la dirección "${targetUrl}". Servidor no encontrado.`);
        setLoading(false);
        return;
      }

      if (targetNode.data.isPoweredOn === false) {
        setErrorMsg(`ERR_CONNECTION_REFUSED: El servidor en "${targetUrl}" está apagado.`);
        setLoading(false);
        return;
      }

      const content =
        (targetNode.data.webContent as string) ||
        `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0c1322;color:#f8fafc;padding:30px;text-align:center;"><h1 style="color:#00f0ff;">🚀 Servidor Web Corporativo</h1><p>Dirección IP: <strong>${targetNode.data.ip}</strong></p><p>Servicio Apache / Nginx activo en PacketFlow Cloud.</p></body></html>`;

      setRenderedContent(content);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Barra superior del navegador */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigate(inputUrl)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de dirección URL */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNavigate(inputUrl);
            }}
            className="flex-1 flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 gap-2"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="http://192.168.1.10 o http://empresa.local"
              className="flex-1 bg-transparent text-xs text-slate-100 font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              IR
            </button>
          </form>

          <button
            onClick={() => setIsWebBrowserOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ventana de renderizado web */}
        <div className="flex-1 bg-slate-950 overflow-auto p-4 flex flex-col">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-cyan-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Conectando con {inputUrl}...</span>
            </div>
          )}

          {!loading && errorMsg && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">No se puede acceder a este sitio</h3>
              <p className="text-xs text-slate-400 max-w-md font-mono">{errorMsg}</p>
            </div>
          )}

          {!loading && !errorMsg && renderedContent && (
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-[#0c1322]">
              <iframe
                title="Simulated Web Server"
                srcDoc={renderedContent}
                className="w-full h-full border-none"
                sandbox="allow-same-origin"
              />
            </div>
          )}

          {!loading && !errorMsg && !renderedContent && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Globe className="w-10 h-10 mb-2 opacity-30 text-cyan-400" />
              <p>Ingresa la IP de un servidor (ej. <strong>http://192.168.1.10</strong>) y presiona IR.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
