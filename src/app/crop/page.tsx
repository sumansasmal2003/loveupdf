"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { Crop, File as FileIcon, Loader2, X, Download, Maximize, ArrowDownUp, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Margins in percentages (0 to 45%)
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      await generatePreview(files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewImg(null);
    setMargins({ top: 0, bottom: 0, left: 0, right: 0 });
  };

  const generatePreview = async (pdfFile: File) => {
    setIsLoadingPreview(true);
    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      // Render the very first page as our visual reference
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPreviewImg(canvas.toDataURL("image/jpeg", 0.8));
      }
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Failed to load PDF preview.");
      setFile(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const applyCrop = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Convert percentage margins to exact PDF points (1/72 of an inch)
        const topPts = height * (margins.top / 100);
        const bottomPts = height * (margins.bottom / 100);
        const leftPts = width * (margins.left / 100);
        const rightPts = width * (margins.right / 100);

        // PDF coordinate system starts at the bottom-left corner (0,0)
        page.setCropBox(
          leftPts,
          bottomPts,
          width - leftPts - rightPts,
          height - topPts - bottomPts
        );
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_cropped.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error cropping PDF:", error);
      alert("An error occurred while cropping the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Crop PDF</h1>
        <p className="text-[#c4c7c5]">Trim the white space or margins around your document pages.</p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
          <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to crop" />
        </div>
      ) : (
        <div className="w-full flex flex-col lg:flex-row gap-8">

          {/* Left Side: Visual Preview */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative bg-[#1e1f20] border border-white/5 rounded-2xl p-6 min-h-[400px] flex items-center justify-center overflow-hidden shadow-lg">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center text-[#8ab4f8]">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span>Loading preview...</span>
                </div>
              ) : previewImg ? (
                <div className="relative max-w-full max-h-[600px] inline-block select-none shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImg} alt="PDF Preview" className="max-w-full max-h-[600px] object-contain block" />

                  {/* The Visual Crop Overlay */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Top Mask */}
                    <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] transition-all" style={{ height: `${margins.top}%` }} />
                    {/* Bottom Mask */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] transition-all" style={{ height: `${margins.bottom}%` }} />
                    {/* Left Mask */}
                    <div className="absolute left-0 bg-black/60 backdrop-blur-[2px] transition-all" style={{ top: `${margins.top}%`, bottom: `${margins.bottom}%`, width: `${margins.left}%` }} />
                    {/* Right Mask */}
                    <div className="absolute right-0 bg-black/60 backdrop-blur-[2px] transition-all" style={{ top: `${margins.top}%`, bottom: `${margins.bottom}%`, width: `${margins.right}%` }} />

                    {/* The "Safe Zone" Border */}
                    <div
                      className="absolute border-2 border-[#8ab4f8] shadow-[0_0_15px_rgba(138,180,248,0.5)] transition-all"
                      style={{
                        top: `${margins.top}%`,
                        bottom: `${margins.bottom}%`,
                        left: `${margins.left}%`,
                        right: `${margins.right}%`,
                      }}
                    >
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="lg:w-[400px] flex flex-col gap-6">
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl shadow-lg sticky top-24">

                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-[#131314] rounded-lg border border-white/5 shrink-0"><FileIcon className="w-5 h-5 text-[#8ab4f8]" /></div>
                    <span className="text-[#e3e3e3] font-medium truncate">{file.name}</span>
                  </div>
                  <button onClick={removeFile} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-center justify-between text-[#e3e3e3] font-medium">
                    <span className="flex items-center gap-2"><Maximize className="w-4 h-4 text-[#8ab4f8]" /> Adjust Margins</span>
                  </div>

                  {/* Vertical Margins */}
                  <div className="flex flex-col gap-4 bg-[#131314] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-sm text-[#c4c7c5]"><span className="flex items-center gap-1"><ArrowDownUp className="w-3 h-3"/> Top</span> <span>{margins.top}%</span></div>
                    <input type="range" min="0" max="45" value={margins.top} onChange={(e) => setMargins({ ...margins, top: parseInt(e.target.value) })} className="w-full accent-[#8ab4f8]" />

                    <div className="flex items-center justify-between text-sm text-[#c4c7c5] mt-2"><span className="flex items-center gap-1"><ArrowDownUp className="w-3 h-3"/> Bottom</span> <span>{margins.bottom}%</span></div>
                    <input type="range" min="0" max="45" value={margins.bottom} onChange={(e) => setMargins({ ...margins, bottom: parseInt(e.target.value) })} className="w-full accent-[#8ab4f8]" />
                  </div>

                  {/* Horizontal Margins */}
                  <div className="flex flex-col gap-4 bg-[#131314] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-sm text-[#c4c7c5]"><span className="flex items-center gap-1"><ArrowLeftRight className="w-3 h-3"/> Left</span> <span>{margins.left}%</span></div>
                    <input type="range" min="0" max="45" value={margins.left} onChange={(e) => setMargins({ ...margins, left: parseInt(e.target.value) })} className="w-full accent-[#8ab4f8]" />

                    <div className="flex items-center justify-between text-sm text-[#c4c7c5] mt-2"><span className="flex items-center gap-1"><ArrowLeftRight className="w-3 h-3"/> Right</span> <span>{margins.right}%</span></div>
                    <input type="range" min="0" max="45" value={margins.right} onChange={(e) => setMargins({ ...margins, right: parseInt(e.target.value) })} className="w-full accent-[#8ab4f8]" />
                  </div>
                </div>

                <button
                  onClick={applyCrop}
                  disabled={isProcessing || isLoadingPreview}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all ${
                    isProcessing ? "bg-[#131314] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"
                  }`}
                >
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Cropping PDF...</> : <><Crop className="w-5 h-5" /> Apply Crop & Download</>}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
