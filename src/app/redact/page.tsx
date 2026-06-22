"use client";

import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  SquareAsterisk, Loader2, X, Download, MousePointer2,
  ChevronLeft, ChevronRight, Eraser, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface RedactionZone {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function RedactPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [renderedPage, setRenderedPage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeTool, setActiveTool] = useState<"select" | "redact">("select");
  const [zones, setZones] = useState<RedactionZone[]>([]);

  // Drawing State
  const [drawingRect, setDrawingRect] = useState<{ startX: number, startY: number, currX: number, currY: number } | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      const fileUrl = URL.createObjectURL(files[0]);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      setPdfRef(pdf);
      renderPage(pdf, 1);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPdfRef(null);
    setZones([]);
    setCurrentPage(1);
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    setRenderedPage(canvas.toDataURL());
  };

  const changePage = (offset: number) => {
    if (!pdfRef) return;
    const newPage = currentPage + offset;
    if (newPage >= 1 && newPage <= pdfRef.numPages) {
      setCurrentPage(newPage);
      renderPage(pdfRef, newPage);
    }
  };

  // --- Click and Drag Drawing Engine ---
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (activeTool !== "redact" || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDrawingRect({ startX: x, startY: y, currX: x, currY: y });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!drawingRect || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setDrawingRect({ ...drawingRect, currX: x, currY: y });
  };

  const handleMouseUp = () => {
    if (!drawingRect) return;

    const x = Math.min(drawingRect.startX, drawingRect.currX);
    const y = Math.min(drawingRect.startY, drawingRect.currY);
    const w = Math.abs(drawingRect.currX - drawingRect.startX);
    const h = Math.abs(drawingRect.currY - drawingRect.startY);

    // Only save if the box is big enough (prevents accidental clicks)
    if (w > 1 && h > 1) {
      setZones([...zones, { id: Date.now().toString(), page: currentPage, x, y, w, h }]);
    }

    setDrawingRect(null);
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const applyRedactions = async () => {
    if (!file || zones.length === 0) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("redactions", JSON.stringify(zones));

      const response = await fetch("/api/redact-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process document.");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_redacted.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error redacting PDF:", error);
      alert("An error occurred. Please ensure your backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Redact PDF</h1>
        <p className="text-[#c4c7c5]">Permanently blackout and destroy sensitive information from your documents.</p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
          <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to redact" />
        </div>
      ) : (
        <div className="w-full flex flex-col xl:flex-row gap-8">

          {/* Main Editor Canvas */}
          <div className="flex-1 flex flex-col gap-4 items-center">

            <div className="w-full flex flex-wrap items-center justify-between bg-[#1e1f20] border border-white/5 p-3 rounded-2xl shadow-lg gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTool("select")} className={`p-2 rounded-xl transition-colors ${activeTool === "select" ? "bg-[#8ab4f8] text-[#131314]" : "text-[#8e918f] hover:bg-white/5"}`} title="Select/Move">
                  <MousePointer2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button onClick={() => setActiveTool("redact")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTool === "redact" ? "bg-red-500 text-white" : "text-[#c4c7c5] hover:bg-white/5"}`}>
                  <SquareAsterisk className="w-4 h-4" /> Draw Redaction Box
                </button>
              </div>

              <div className="flex items-center gap-4 text-[#e3e3e3] text-sm bg-[#131314] px-2 py-1 rounded-lg border border-white/5">
                <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="p-1 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                <span className="min-w-[80px] text-center font-medium">Page {currentPage} of {pdfRef?.numPages || 1}</span>
                <button onClick={() => changePage(1)} disabled={currentPage === pdfRef?.numPages} className="p-1 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5"/></button>
              </div>
            </div>

            <div className="relative bg-[#1e1f20] border border-white/5 rounded-2xl p-6 shadow-xl w-full flex justify-center overflow-x-auto custom-scrollbar min-h-[600px]">
              {renderedPage ? (
                <div
                  ref={pdfContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`relative inline-block shadow-md border border-white/10 select-none ${activeTool === "redact" ? "cursor-crosshair" : "cursor-default"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={renderedPage} alt="PDF Page" className="block w-full max-w-3xl h-auto pointer-events-none" draggable={false} />

                  {/* Render Saved Zones */}
                  {zones.filter(z => z.page === currentPage).map((zone) => (
                    <div key={zone.id} className="absolute bg-black/80 border border-black group" style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}>
                      <button onClick={(e) => { e.stopPropagation(); removeZone(zone.id); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-20">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Render Currently Drawing Zone */}
                  {drawingRect && (
                    <div
                      className="absolute bg-black/40 border border-black/80"
                      style={{
                        left: `${Math.min(drawingRect.startX, drawingRect.currX)}%`,
                        top: `${Math.min(drawingRect.startY, drawingRect.currY)}%`,
                        width: `${Math.abs(drawingRect.currX - drawingRect.startX)}%`,
                        height: `${Math.abs(drawingRect.currY - drawingRect.startY)}%`
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-[#8ab4f8] animate-spin" /></div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:w-80 flex flex-col gap-6">
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl shadow-lg sticky top-24">

                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                  <span className="text-[#e3e3e3] font-medium truncate flex items-center gap-2"><SquareAsterisk className="w-4 h-4 text-red-500"/> Redaction</span>
                  <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mb-8 text-sm text-[#c4c7c5]">
                  <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <p><strong>True Redaction:</strong> This tool completely shreds the underlying text and image code. Once saved, the hidden data cannot be recovered by anyone.</p>
                  </div>

                  <p className="mt-2 text-[#8e918f]">Select the <strong>Draw Redaction Box</strong> tool above, then click and drag over sensitive content to black it out.</p>
                </div>

                <button
                  onClick={applyRedactions}
                  disabled={isProcessing || zones.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all ${
                    isProcessing || zones.length === 0 ? "bg-[#131314] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  }`}
                >
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Destroying Data...</> : <><Download className="w-5 h-5" /> Apply & Download</>}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
