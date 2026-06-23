"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  FileEdit, Loader2, X, Download, Type, Eraser,
  MousePointer2, ChevronLeft, ChevronRight, Undo2, Redo2, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Tool = "select" | "text" | "eraser";

interface EditorElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  page: number;
  text?: string;
  width?: number;
  height?: number;
}

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderedPage, setRenderedPage] = useState<string>("");

  // Undo/Redo History State
  const [history, setHistory] = useState<EditorElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Get current state from history
  const elements = history[historyIndex];

  // History Management
  const pushState = useCallback((newState: EditorElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
  }, [historyIndex, history.length]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        }
        if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
    setHistory([[]]);
    setHistoryIndex(0);
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "select" || !canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newElement: EditorElement = {
      id: Date.now().toString(),
      type: activeTool,
      x: xPercent,
      y: yPercent,
      page: currentPage,
      text: activeTool === "text" ? "" : undefined,
      width: activeTool === "eraser" ? 12 : undefined,
      height: activeTool === "eraser" ? 3 : undefined,
    };

    pushState([...elements, newElement]);
    setActiveTool("select");
  };

  const updateElementText = (id: string, text: string) => {
    const newState = elements.map(el => el.id === id ? { ...el, text } : el);
    pushState(newState);
  };

  const removeElement = (id: string) => {
    pushState(elements.filter(el => el.id !== id));
  };

  const saveEditedPDF = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      elements.forEach((el) => {
        const page = pages[el.page - 1];
        const { width, height } = page.getSize();

        const exactX = (el.x / 100) * width;
        const exactY = height - ((el.y / 100) * height);

        if (el.type === "text" && el.text) {
          page.drawText(el.text, {
            x: exactX,
            y: exactY - 12,
            size: 14,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }

        if (el.type === "eraser" && el.width && el.height) {
          const wPts = (el.width / 100) * width;
          const hPts = (el.height / 100) * height;
          page.drawRectangle({
            x: exactX,
            y: exactY - (hPts / 2),
            width: wPts,
            height: hPts,
            color: rgb(1, 1, 1),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_edited.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving edited PDF:", error);
      alert("Failed to save the edited document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Edit PDF</h1>
        <p className="text-[#c4c7c5]">Add text or use the Eraser tool to white-out mistakes instantly.</p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
          <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to edit" />
        </div>
      ) : (
        <div className="w-full flex flex-col xl:flex-row gap-8">

          <div className="flex-1 flex flex-col gap-4 items-center">

            {/* Top Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between bg-[#1e1f20] border border-white/5 p-3 rounded-2xl shadow-lg gap-4">

              {/* Undo / Redo */}
              <div className="flex items-center gap-1 bg-[#131314] rounded-lg p-1 border border-white/5">
                <button onClick={undo} disabled={historyIndex === 0} className="p-2 text-[#c4c7c5] hover:text-[#8ab4f8] hover:bg-white/5 rounded-md disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 text-[#c4c7c5] hover:text-[#8ab4f8] hover:bg-white/5 rounded-md disabled:opacity-30 transition-colors" title="Redo (Ctrl+Y)">
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tools */}
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTool("select")} className={`p-2 rounded-xl transition-colors ${activeTool === "select" ? "bg-[#8ab4f8] text-[#131314]" : "text-[#8e918f] hover:bg-white/5"}`} title="Select/Move">
                  <MousePointer2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button onClick={() => setActiveTool("text")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeTool === "text" ? "bg-[#8ab4f8] text-[#131314]" : "text-[#c4c7c5] hover:bg-white/5"}`}>
                  <Type className="w-4 h-4" /> Add Text
                </button>
                <button onClick={() => setActiveTool("eraser")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeTool === "eraser" ? "bg-white text-black" : "text-[#c4c7c5] hover:bg-white/5"}`}>
                  <Eraser className="w-4 h-4" /> Erase Text
                </button>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-4 text-[#e3e3e3] text-sm bg-[#131314] px-2 py-1 rounded-lg border border-white/5">
                <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="p-1 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                <span className="min-w-[80px] text-center font-medium">Page {currentPage} of {pdfRef?.numPages || 1}</span>
                <button onClick={() => changePage(1)} disabled={currentPage === pdfRef?.numPages} className="p-1 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5"/></button>
              </div>
            </div>

            {/* Document Area */}
            <div className="relative bg-[#1e1f20] border border-white/5 rounded-2xl p-6 shadow-xl w-full flex justify-center overflow-x-auto custom-scrollbar min-h-[600px]">
              {renderedPage ? (
                <div ref={canvasContainerRef} onClick={handleCanvasClick} className={`relative inline-block shadow-md border border-white/10 ${activeTool === "text" ? "cursor-text" : activeTool === "eraser" ? "cursor-crosshair" : "cursor-default"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={renderedPage} alt="PDF Page" className="block w-full max-w-3xl h-auto pointer-events-none" />

                  {elements.filter(el => el.page === currentPage).map((el) => (
                    <div key={el.id} className="absolute z-10 -translate-y-1/2" style={{ left: `${el.x}%`, top: `${el.y}%`, width: el.type === "eraser" ? `${el.width}%` : 'auto', height: el.type === "eraser" ? `${el.height}%` : 'auto' }}>

                      {/* Interactive Eraser Block */}
                      {el.type === "eraser" && (
                        <div className="w-full h-full bg-white border border-transparent hover:border-red-500/50 rounded-sm relative group transition-colors">
                          <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-20">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Interactive Text Block */}
                      {el.type === "text" && (
                        <div className="relative group">
                          <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-20">
                            <X className="w-3 h-3" />
                          </button>
                          <input
                            autoFocus
                            type="text"
                            value={el.text || ""}
                            onChange={(e) => updateElementText(el.id, e.target.value)}
                            placeholder="Type here..."
                            className="bg-transparent text-black outline-none border-b border-transparent hover:border-blue-500 focus:border-blue-500 min-w-[150px] font-sans text-lg px-1 py-0.5 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
                  <span className="text-[#e3e3e3] font-medium truncate flex items-center gap-2"><FileEdit className="w-4 h-4 text-[#8ab4f8]"/> Editor</span>
                  <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mb-8 text-sm text-[#c4c7c5]">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <Sparkles className="w-4 h-4 text-[#8ab4f8] shrink-0 mt-0.5" />
                    <p>Use <strong className="text-white">Ctrl+Z</strong> to undo and <strong className="text-white">Ctrl+Y</strong> to redo your edits.</p>
                  </div>

                  <p className="mt-2 font-medium text-[#e3e3e3]">How to edit existing text:</p>
                  <ol className="list-decimal pl-4 flex flex-col gap-3 text-[#8e918f]">
                    <li>Select <strong className="text-white">Erase Text</strong> and click over the mistake to cover it up.</li>
                    <li>Select <strong className="text-[#8ab4f8]">Add Text</strong> and click in the blank space to type your new word.</li>
                  </ol>
                </div>

                <button
                  onClick={saveEditedPDF}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all ${
                    isProcessing ? "bg-[#131314] text-[#8e918f] border border-white/5" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                  }`}
                >
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving changes...</> : <><Download className="w-5 h-5" /> Save Edited PDF</>}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
