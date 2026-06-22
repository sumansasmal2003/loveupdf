"use client";

import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import {
  PenTool, Loader2, X, Download, MousePointer2,
  ChevronLeft, ChevronRight, Eraser, Check,
  Type, UploadCloud, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SignaturePlacement {
  id: string;
  x: number;
  y: number;
  page: number;
  imgDataUrl: string;
}

type SignatureMode = "draw" | "type" | "upload";

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [renderedPage, setRenderedPage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Signature State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  const [activeTool, setActiveTool] = useState<"select" | "place">("select");

  // Typed Signature State
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("'Brush Script MT', cursive");

  // Refs
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
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
    setPlacements([]);
    setSavedSignature(null);
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

  // --- DRAW SIGNATURE LOGIC ---
  const startDrawing = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    isDrawing.current = true;
  };

  const draw = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => { isDrawing.current = false; };

  const clearSignature = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --- SAVE LOGIC FOR ALL MODES ---
  const finalizeSignature = () => {
    if (signatureMode === "draw") {
      const canvas = drawCanvasRef.current;
      if (canvas) {
        setSavedSignature(canvas.toDataURL("image/png"));
        setShowSignatureModal(false);
        setActiveTool("place");
      }
    }
    else if (signatureMode === "type" && typedName) {
      // Create an invisible canvas to convert the text into an image
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = `60px ${selectedFont}`;
        ctx.fillStyle = "#000000";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
        setSavedSignature(canvas.toDataURL("image/png"));
        setShowSignatureModal(false);
        setActiveTool("place");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSavedSignature(event.target.result as string);
        setShowSignatureModal(false);
        setActiveTool("place");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- PDF PLACEMENT LOGIC ---
  const handlePdfClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (activeTool !== "place" || !savedSignature || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setPlacements([...placements, {
      id: Date.now().toString(),
      x: xPercent,
      y: yPercent,
      page: currentPage,
      imgDataUrl: savedSignature
    }]);

    setActiveTool("select");
  };

  const removePlacement = (id: string) => {
    setPlacements(placements.filter(p => p.id !== id));
  };

  const exportSignedPDF = async () => {
    if (!file || placements.length === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const embeddedImages: Record<string, any> = {};

      for (const placement of placements) {
        if (!embeddedImages[placement.imgDataUrl]) {
          const imgBytes = await fetch(placement.imgDataUrl).then(res => res.arrayBuffer());
          embeddedImages[placement.imgDataUrl] = await pdfDoc.embedPng(imgBytes);
        }

        const pngImage = embeddedImages[placement.imgDataUrl];
        const page = pages[placement.page - 1];
        const { width, height } = page.getSize();

        // Scale the image down from the canvas size to fit nicely on the document
        const imgDims = pngImage.scale(0.3);
        const exactX = (placement.x / 100) * width - (imgDims.width / 2);
        const exactY = height - ((placement.y / 100) * height) - (imgDims.height / 2);

        page.drawImage(pngImage, {
          x: exactX,
          y: exactY,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_signed.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("Failed to save the signed document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Sign PDF</h1>
        <p className="text-[#c4c7c5]">Draw, type, or upload your signature to sign your document.</p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
          <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to sign" />
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

                {savedSignature ? (
                  <button onClick={() => setActiveTool("place")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTool === "place" ? "bg-[#8ab4f8] text-[#131314]" : "text-[#c4c7c5] hover:bg-white/5"}`}>
                    <Check className="w-4 h-4" /> Place Signature
                  </button>
                ) : (
                  <button onClick={() => setShowSignatureModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-white/10 text-white hover:bg-white/20">
                    <PenTool className="w-4 h-4" /> Create Signature
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-[#e3e3e3] text-sm bg-[#131314] px-2 py-1 rounded-lg border border-white/5">
                <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="p-1 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                <span className="min-w-[80px] text-center font-medium">Page {currentPage} of {pdfRef?.numPages || 1}</span>
                <button onClick={() => changePage(1)} disabled={currentPage === pdfRef?.numPages} className="p-1 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5"/></button>
              </div>
            </div>

            <div className="relative bg-[#1e1f20] border border-white/5 rounded-2xl p-6 shadow-xl w-full flex justify-center overflow-x-auto custom-scrollbar min-h-[600px]">
              {renderedPage ? (
                <div ref={pdfContainerRef} onClick={handlePdfClick} className={`relative inline-block shadow-md border border-white/10 ${activeTool === "place" ? "cursor-crosshair" : "cursor-default"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={renderedPage} alt="PDF Page" className="block w-full max-w-3xl h-auto pointer-events-none" />

                  {placements.filter(p => p.page === currentPage).map((p) => (
                    <div key={p.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                      <button onClick={(e) => { e.stopPropagation(); removePlacement(p.id); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-20">
                        <X className="w-3 h-3" />
                      </button>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imgDataUrl} alt="Signature" className="max-w-[200px] border border-dashed border-transparent group-hover:border-[#8ab4f8] transition-colors" />
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
                  <span className="text-[#e3e3e3] font-medium truncate flex items-center gap-2"><PenTool className="w-4 h-4 text-[#8ab4f8]"/> Signature</span>
                  <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mb-8 text-sm text-[#c4c7c5]">
                  {savedSignature ? (
                    <div className="flex flex-col gap-4">
                      <div className="bg-white rounded-xl p-4 border border-white/10 flex justify-center items-center min-h-[100px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={savedSignature} alt="Your Signature" className="max-h-16 max-w-full object-contain" />
                      </div>
                      <button onClick={() => setShowSignatureModal(true)} className="text-[#8ab4f8] hover:underline text-center">
                        Change Signature
                      </button>
                    </div>
                  ) : (
                    <p>Click <strong className="text-white">Create Signature</strong> above to draw, type, or upload your signature, then click anywhere on the document to stamp it.</p>
                  )}
                </div>

                <button
                  onClick={exportSignedPDF}
                  disabled={isProcessing || placements.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all ${
                    isProcessing || placements.length === 0 ? "bg-[#131314] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                  }`}
                >
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving PDF...</> : <><Download className="w-5 h-5" /> Export Signed PDF</>}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modern Multi-Tab Signature Modal */}
      <AnimatePresence>
        {showSignatureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1e1f20] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-medium text-white">Create Signature</h3>
                <button onClick={() => setShowSignatureModal(false)} className="text-[#8e918f] hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Tabs */}
              <div className="flex px-6 pt-4 border-b border-white/5">
                <button onClick={() => setSignatureMode("draw")} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${signatureMode === "draw" ? "border-[#8ab4f8] text-[#8ab4f8]" : "border-transparent text-[#8e918f] hover:text-[#c4c7c5]"}`}>
                  <PenTool className="w-4 h-4" /> Draw
                </button>
                <button onClick={() => setSignatureMode("type")} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${signatureMode === "type" ? "border-[#8ab4f8] text-[#8ab4f8]" : "border-transparent text-[#8e918f] hover:text-[#c4c7c5]"}`}>
                  <Type className="w-4 h-4" /> Type
                </button>
                <button onClick={() => setSignatureMode("upload")} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${signatureMode === "upload" ? "border-[#8ab4f8] text-[#8ab4f8]" : "border-transparent text-[#8e918f] hover:text-[#c4c7c5]"}`}>
                  <UploadCloud className="w-4 h-4" /> Upload
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 bg-[#131314]/50 min-h-[250px] flex flex-col justify-center">

                {/* DRAW MODE */}
                {signatureMode === "draw" && (
                  <div className="bg-white rounded-xl overflow-hidden cursor-crosshair border-2 border-transparent focus-within:border-[#8ab4f8] transition-colors relative">
                    <div className="absolute top-4 left-4 text-gray-300 pointer-events-none text-sm font-medium">Draw here</div>
                    <canvas
                      ref={drawCanvasRef}
                      width={450}
                      height={200}
                      className="w-full bg-white touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                )}

                {/* TYPE MODE */}
                {signatureMode === "type" && (
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Type your name..."
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full bg-[#1e1f20] border border-white/10 rounded-xl px-4 py-3 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors"
                      autoFocus
                    />
                    <div className="bg-white rounded-xl h-[120px] flex items-center justify-center p-4 border border-white/10 overflow-hidden">
                      <span style={{ fontFamily: selectedFont, fontSize: '48px', color: '#000' }}>
                        {typedName || "Signature"}
                      </span>
                    </div>
                    {/* Font Selector Options */}
                    <div className="flex gap-2">
                      {["'Brush Script MT', cursive", "'Bradley Hand', cursive", "Georgia, serif"].map(font => (
                        <button
                          key={font}
                          onClick={() => setSelectedFont(font)}
                          className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${selectedFont === font ? "bg-[#8ab4f8]/10 border-[#8ab4f8] text-[#8ab4f8]" : "border-white/10 text-[#8e918f] hover:bg-white/5"}`}
                          style={{ fontFamily: font }}
                        >
                          Style
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* UPLOAD MODE */}
                {signatureMode === "upload" && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl h-[200px] hover:border-[#8ab4f8]/50 hover:bg-[#8ab4f8]/5 transition-colors relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-10 h-10 text-[#8e918f] mb-3 group-hover:text-[#8ab4f8] transition-colors" />
                    <p className="text-[#c4c7c5] font-medium">Click to upload signature</p>
                    <p className="text-xs text-[#8e918f] mt-1">Supports PNG, JPG, or SVG</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between bg-[#1e1f20]">
                {signatureMode === "draw" ? (
                  <button onClick={clearSignature} className="flex items-center gap-2 text-[#8e918f] hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Eraser className="w-4 h-4" /> Clear
                  </button>
                ) : <div />} {/* Empty div to keep flex-between alignment */}

                <button
                  onClick={finalizeSignature}
                  disabled={signatureMode === "type" && !typedName}
                  className="bg-[#8ab4f8] text-[#131314] px-6 py-2.5 rounded-xl font-medium hover:bg-[#a8c7fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Use
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
