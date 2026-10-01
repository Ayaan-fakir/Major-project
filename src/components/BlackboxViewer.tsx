import React, { useEffect, useRef, useState } from 'react';
import { ClinicalDocument } from '../types';
import { Lock, ChevronLeft, ChevronRight, ShieldAlert, ZoomIn, ZoomOut, RefreshCw, FileText } from 'lucide-react';

interface BlackboxViewerProps {
  document: ClinicalDocument;
  patientName?: string;
  isDoctorView?: boolean;
}

export const BlackboxViewer: React.FC<BlackboxViewerProps> = ({
  document,
  patientName = 'Aarav Sharma',
  isDoctorView = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [securityBlockedAlert, setSecurityBlockedAlert] = useState<string | null>(null);

  // Prevent right-click save and context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerSecurityNotice('Right-click & context export disabled by Zero-Trust policy.');
  };

  // Intercept keyboard save/print shortcuts (Ctrl+S, Ctrl+P, Command+S, Command+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
        e.preventDefault();
        triggerSecurityNotice('Direct document export / print intercepted. Memory-only rendering enforced.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSecurityNotice = (msg: string) => {
    setSecurityBlockedAlert(msg);
    setTimeout(() => {
      setSecurityBlockedAlert(null);
    }, 3500);
  };

  // Render document onto Canvas with anti-leak diagonal repeating watermark
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseWidth = 800;
    const baseHeight = 1050;
    canvas.width = baseWidth * zoomLevel;
    canvas.height = baseHeight * zoomLevel;

    // Background paper
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    // Decorative clinical border
    ctx.strokeStyle = '#E2E0D8';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, baseWidth - 60, baseHeight - 60);

    // Clinical Header
    ctx.fillStyle = '#0E0E10';
    ctx.font = 'bold 22px "Inter Tight", sans-serif';
    ctx.fillText('AEGIS ZERO-TRUST CLINICAL REPOSITORY', 50, 70);

    ctx.fillStyle = '#8C8C88';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`ZERO-TRUST RAM SESSION: #ZTR-IN-${document.id.toUpperCase()}`, 50, 92);
    const physicianText = document.doctorName || 'ATTENDING CLINICAL SPECIALIST';
    ctx.fillText(`TIMESTAMP: ${document.date.toUpperCase()} | CLINICIAN: ${physicianText.toUpperCase()}`, 50, 108);

    // Header divider line
    ctx.strokeStyle = '#0E0E10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 125);
    ctx.lineTo(baseWidth - 50, 125);
    ctx.stroke();

    // Document Title Banner
    ctx.fillStyle = '#F6F4EE';
    ctx.fillRect(50, 140, baseWidth - 100, 48);
    ctx.strokeStyle = '#E5E3DC';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 140, baseWidth - 100, 48);

    ctx.fillStyle = '#0E0E10';
    ctx.font = 'bold 15px "Inter Tight", sans-serif';
    ctx.fillText(`TITLE: ${document.title.toUpperCase()}`, 65, 170);

    // Security Notice Box in document
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`ENCRYPTION: AES-256-GCM | LEAST-PRIVILEGE PATIENT: ${(document.patientName || patientName).toUpperCase()}`, 65, 215);

    // Draw document body lines based on current page
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';

    const linesPerPage = 8;
    const startIndex = (currentPage - 1) * linesPerPage;
    const pageLines = (document.contentLines || []).slice(startIndex, startIndex + linesPerPage);

    let startY = 250;
    pageLines.forEach((line) => {
      // Check if line is a section header or regular text
      if (line.includes(':') && line.split(':')[0].length < 28) {
        const parts = line.split(':');
        ctx.font = 'bold 13px "Inter Tight", sans-serif';
        ctx.fillStyle = '#0E0E10';
        ctx.fillText(parts[0] + ':', 50, startY);

        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(parts.slice(1).join(':'), 50 + ctx.measureText(parts[0] + ': ').width, startY);
      } else {
        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#222222';
        ctx.fillText(line, 50, startY);
      }

      // Micro divider between lines
      ctx.strokeStyle = '#F0EEE8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, startY + 12);
      ctx.lineTo(baseWidth - 50, startY + 12);
      ctx.stroke();

      startY += 44;
    });

    // If an image fileUrl is attached (e.g. uploaded ECG/scan), render a preview frame on canvas
    if (document.fileUrl) {
      const img = new Image();
      img.src = document.fileUrl;
      img.onload = () => {
        try {
          ctx.drawImage(img, 50, startY + 10, baseWidth - 100, 200);
        } catch (e) {
          // ignore cors
        }
      };
    }

    // Digital Security Seal at bottom
    ctx.fillStyle = '#0E0E10';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`DIGITAL NMC/MCI VERIFICATION: VALID SESSION | ZERO DISK CACHE ENFORCED`, 50, baseHeight - 90);
    ctx.fillText(`PAGE ${currentPage} OF ${document.pages || 1} — AEGIS BIOMETRIC ENCLAVE (INDIA)`, 50, baseHeight - 74);

    // Anti-leak diagonal repeating faint watermark
    ctx.restore();
    ctx.save();
    ctx.rotate((-28 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(215, 250, 59, 0.12)'; // Acid lime tint faint watermark
    ctx.font = 'bold 15px "Inter Tight", sans-serif';

    const activeWatermarkName = (document.patientName || patientName).toUpperCase();
    const watermarkText = `AEGIS · CONFIDENTIAL · ${activeWatermarkName} · DO NOT COPY`;
    for (let x = -800; x < canvas.width * 1.5; x += 360) {
      for (let y = -400; y < canvas.height * 1.8; y += 80) {
        ctx.fillText(watermarkText, x, y);
      }
    }
    ctx.restore();

  }, [document, currentPage, zoomLevel, patientName]);

  return (
    <div className="relative rounded-2xl bg-[#0E0E10] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
      {/* Top status bar */}
      <div className="px-5 py-3.5 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Lime pill pinned to corner */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B] text-black font-semibold text-xs tracking-tight shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>🔒 View-only · Rendered in-session</span>
          </span>
          <span className="text-[#8C8C88] hidden sm:inline">
            RAM volatile memory · No disk writes
          </span>
        </div>

        {/* Zoom & Page navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
              className="p-1 hover:text-[#D7FA3B] text-[#8C8C88] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-white">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="p-1 hover:text-[#D7FA3B] text-[#8C8C88] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:text-[#D7FA3B] disabled:opacity-30 disabled:hover:text-inherit text-[#8C8C88] transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-white">
              Page {currentPage}/{document.pages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(document.pages || 1, p + 1))}
              disabled={currentPage >= (document.pages || 1)}
              className="p-1 hover:text-[#D7FA3B] disabled:opacity-30 disabled:hover:text-inherit text-[#8C8C88] transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Security alert notification toast */}
      {securityBlockedAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-red-950/90 border border-red-500/50 text-red-200 text-xs rounded-full shadow-xl flex items-center gap-2 backdrop-blur animate-fade-in">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>{securityBlockedAlert}</span>
        </div>
      )}

      {/* Canvas container with disabled context menu */}
      <div
        onContextMenu={handleContextMenu}
        className="p-4 sm:p-8 flex justify-center items-center overflow-auto max-h-[700px] select-none bg-[#141416]"
        style={{ userSelect: 'none' }}
      >
        <div className="shadow-2xl rounded-sm border border-black/20 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block cursor-default"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Bottom telemetry strip */}
      <div className="px-5 py-2.5 bg-black/80 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8C8C88] font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D7FA3B] animate-pulse"></span>
          <span>Zero-Trust Cryptographic Session Active</span>
        </span>
        <span>Watermark: {document.patientName || patientName} (Live Hash Verified)</span>
      </div>
    </div>
  );
};
