import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import {
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Info,
  Cpu,
  Loader2,
  FileText
} from 'lucide-react';

export default function App() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleDownloadArchitecture = () => {
    const tempLink = document.createElement('a');
    tempLink.href = '/cnc/ARCHITECTURE.md';
    tempLink.download = 'ARCHITECTURE.md';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    try {
      setIsDownloadingZip(true);
      const zip = new JSZip();

      // Листа на сите неопходни релативни датотеки за CNC апликацијата V2.1.8
      const filesToInclude = [
        'index.html',
        'Mach3Bridge.exe',
        'bridge/bridge.cs',
        'bridge/compile1.bat',
        'bridge/fix.reg',
        'css/style.css',
        'js/app.js',
        'js/canvas.js',
        'js/gcode.js',
        'js/parser.js',
        'js/driver-simulator.js',
        'js/driver-mach3.js',
        'js/machine-driver.js',
        'js/state.js',
        'js/tabs.js',
        'js/storage.js',
        'js/svg-generator.js',
        'js/table.js',
        'js/calibration.js',
        'test_star.svg',
        'SPECIFICATION.md',
        'DEVELOPER_NOTES.md',
        'ARCHITECTURE.md',
        'ROADMAP.md',
        'default_machine.json'
      ];

      for (const filePath of filesToInclude) {
        const res = await fetch(`/cnc/${filePath}`);
        if (!res.ok) {
          throw new Error(`Не може да се преземе датотеката /cnc/${filePath} (HTTP ${res.status})`);
        }
        if (/\.(exe|dll|zip|png|ico|bin)$/i.test(filePath)) {
          const buf = await res.arrayBuffer();
          if (!buf || buf.byteLength === 0) {
            throw new Error(`Датотеката /cnc/${filePath} е празна`);
          }
          zip.file(filePath, buf);
        } else {
          const content = await res.text();
          if (!content || content.length === 0) {
            throw new Error(`Датотеката /cnc/${filePath} е празна`);
          }
          zip.file(filePath, content);
        }
      }

      // Генерирање на исправен ZIP со DEFLATE компресија
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });

      const downloadUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = 'CNC-Dispenser-V2.1.8.zip';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
    } catch (err) {
      alert("Грешка при генерирање на ZIP архивата: " + (err as Error).message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      {/* Top Test Banner */}
      {!isHeaderCollapsed ? (
        <header className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
              CNC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-slate-100 tracking-wide">
                  CNC Dispenser V2.1.8
                </h1>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                  ⚡ V2.1.8 (Mach3 жив диспензер, G90 заштита, Space+Pan, Ctrl+Z/Y &amp; D1-1 групи)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong className="text-emerald-300">CNC Dispenser V2.1.8</strong>: Живо следење на активниот диспензер од Mach3, G90 безбедност при СТОП, побрза табела и олеснета документација.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfoModal(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Како функционира"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Што тестираме?</span>
            </button>

            <button
              onClick={handleReload}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Освежи апликација"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Освежи</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Сними исправен ZIP за на USB преку JSZip DEFLATE"
            >
              {isDownloadingZip ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingZip ? 'Се подготвува ZIP...' : 'Симни ZIP за USB (V2.1.8)'}</span>
            </button>

            <button
              onClick={handleDownloadArchitecture}
              className="px-2.5 py-1.5 text-xs font-semibold text-indigo-100 hover:text-white bg-indigo-700/80 hover:bg-indigo-600 rounded-md transition-colors flex items-center gap-1.5 border border-indigo-500/40 shadow-sm cursor-pointer"
              title="Преземи архитектура и API договор (.md)"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Архитектура (.md)</span>
            </button>

            <button
              onClick={() => setIsHeaderCollapsed(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Сокриј ја контролната лента за целосен екран"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Цел екран</span>
            </button>
          </div>
        </header>
      ) : (
        <button
          onClick={() => setIsHeaderCollapsed(false)}
          className="fixed top-2 right-4 z-50 bg-slate-900/90 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg border border-slate-700 flex items-center gap-1.5 backdrop-blur-sm transition-all"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Покажи инфо лента</span>
        </button>
      )}

      {/* Main CNC Dispenser Application Container */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          src="/cnc/index.html"
          title="CNC Dispenser V2.1.8"
          className="w-full h-full border-0 block"
        />
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Cpu className="w-5 h-5" />
                <span>Како работи прегледот и развојот тука?</span>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>1. Апликацијата е 100% жива:</strong>
                <br />
                Она што го гледате на екранот е вашата апликација <em>CNC Dispenser V2.1.8</em>. Можете да вчитувате TXT, CSV, да влечете точки на графикот, да калибрирате дизни, да менувате параметри и да експортирате или директно пуштате G-код (.tap).
              </p>

              <p>
                <strong>2. Автоматизација и Безбедност:</strong>
                <br />
                Вградена е заштита при деактивација и промена на диспензер, задолжително G90 и подигање на дизните при СТОП/RESET, зачувување на машинските офсети при увоз на CSV и безбедносна SVG патека.
              </p>

              <p>
                <strong>3. Windows XP и Mach3 Bridge:</strong>
                <br />
                Интерфејсот е тестиран за компатибилност со Chrome 49 / Windows XP, а C# мостот <code>Mach3Bridge.exe</code> користи чиста латиница во терминалот и живо го следи активниот диспензер.
              </p>

              <p>
                <strong>4. Снимање на USB:</strong>
                <br />
                Кликнете на зеленото копче <strong>„Симни ZIP за USB (V2.1.8)“</strong> и ќе ја добиете најновата верзија подготвена за директно отворање од USB.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Јасно, да пробам!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}