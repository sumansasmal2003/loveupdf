"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, degrees } from "pdf-lib";
import {
  File as FileIcon, Loader2, X, Download,
  RotateCw, RotateCcw, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageData {
  id: string;
  originalIndex: number;
  imgUrl: string;
  addedRotation: number; // 0, 90, 180, 270
}

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      await generateThumbnails(files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPages([]);
    setProgress(0);
  };

  const generateThumbnails = async (pdfFile: File) => {
    setIsLoading(true);
    setProgress(0);
    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      const newPages: PageData[] = [];
      const scale = 0.5;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        newPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1,
          imgUrl: canvas.toDataURL("image/jpeg", 0.7),
          addedRotation: 0, // Everyone starts with 0 additional rotation
        });

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPages(newPages);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error reading PDF:", error);
      alert("Could not load the PDF.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Rotate a specific page
  const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
    const newPages = [...pages];
    const currentRot = newPages[index].addedRotation;

    if (direction === 'cw') {
      newPages[index].addedRotation = (currentRot + 90) % 360;
    } else {
      newPages[index].addedRotation = (currentRot - 90 + 360) % 360;
    }

    setPages(newPages);
  };

  // Global rotation for all pages at once
  const rotateAll = (direction: 'cw' | 'ccw') => {
    setPages(pages.map(p => ({
      ...p,
      addedRotation: direction === 'cw'
        ? (p.addedRotation + 90) % 360
        : (p.addedRotation - 90 + 360) % 360
    })));
  };

  const saveRotatedPDF = async () => {
    if (!file || pages.length === 0) return;

    setIsSaving(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      // Apply the visual rotation to the actual PDF objects
      pages.forEach((p, i) => {
        if (p.addedRotation !== 0) {
          const pdfPage = pdfPages[i];
          // We add our new rotation to whatever rotation the page might already have inherently
          const currentAngle = pdfPage.getRotation().angle;
          pdfPage.setRotation(degrees((currentAngle + p.addedRotation) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_rotated.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("An error occurred while saving the PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Rotate PDF</h1>
        <p className="text-[#c4c7c5]">Rotate individual pages or all pages at once, then save your new document.</p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
           <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to rotate" />
        </div>
      ) : (
        <div className="w-full mt-4 flex flex-col gap-8">

          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden gap-4 shadow-lg sticky top-24 z-40">
            {isLoading && (
              <div className="absolute bottom-0 left-0 h-1 bg-[#8ab4f8] transition-all duration-300" style={{ width: `${progress}%` }} />
            )}

            <div className="flex items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
              <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                {isLoading ? <Loader2 className="w-6 h-6 text-[#8ab4f8] animate-spin" /> : <RefreshCcw className="w-6 h-6 text-[#8ab4f8]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#e3e3e3] font-medium truncate">{file.name}</span>
                <span className="text-sm text-[#8e918f]">
                  {isLoading ? "Rendering pages..." : `${pages.length} pages ready`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Global Rotate Controls */}
              <div className="flex items-center bg-[#131314] rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => rotateAll('ccw')} disabled={isLoading || isSaving} className="px-4 py-3 text-[#c4c7c5] hover:text-[#8ab4f8] hover:bg-white/5 transition-colors disabled:opacity-50" title="Rotate all left">
                  <span className="flex items-center gap-2 text-sm font-medium"><RotateCcw className="w-4 h-4" /> All Left</span>
                </button>
                <div className="w-[1px] h-6 bg-white/10" />
                <button onClick={() => rotateAll('cw')} disabled={isLoading || isSaving} className="px-4 py-3 text-[#c4c7c5] hover:text-[#8ab4f8] hover:bg-white/5 transition-colors disabled:opacity-50" title="Rotate all right">
                  <span className="flex items-center gap-2 text-sm font-medium">All Right <RotateCw className="w-4 h-4" /></span>
                </button>
              </div>

              <button
                onClick={saveRotatedPDF}
                disabled={isLoading || isSaving || pages.length === 0}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium transition-all bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] disabled:opacity-50"
              >
                {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Download className="w-5 h-5" /> Save PDF</>}
              </button>
              <button
                onClick={removeFile}
                disabled={isLoading || isSaving}
                className="p-3 text-[#8e918f] hover:text-[#ef4444] transition-colors rounded-xl bg-[#131314] border border-white/5 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visual Grid */}
          {!isLoading && pages.length > 0 && (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <AnimatePresence>
                {pages.map((page, index) => (
                  <motion.div
                    layout
                    key={page.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col border border-white/10 bg-[#1e1f20] rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                  >
                    {/* Thumbnail Image Wrapper */}
                    <div className="relative aspect-[1/1.4] bg-[#131314] p-4 flex items-center justify-center group overflow-hidden">

                      {/* The actual image. We use CSS transform to visually rotate it instantly.
                        This is incredibly fast compared to redrawing canvases!
                      */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.imgUrl}
                        alt={`Page ${page.originalIndex + 1}`}
                        className="max-w-full max-h-full object-contain shadow-sm transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(${page.addedRotation}deg)` }}
                      />

                      {/* Overlay Controls for specific page */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                        <button
                          onClick={() => rotatePage(index, 'ccw')}
                          className="p-3 bg-[#1e1f20] text-white rounded-full hover:bg-[#8ab4f8] hover:text-[#131314] transition-colors shadow-lg"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => rotatePage(index, 'cw')}
                          className="p-3 bg-[#1e1f20] text-white rounded-full hover:bg-[#8ab4f8] hover:text-[#131314] transition-colors shadow-lg"
                        >
                          <RotateCw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Footer Data */}
                    <div className="p-3 flex justify-between items-center border-t border-white/5">
                      <span className="text-xs font-medium text-[#c4c7c5]">
                        Page {page.originalIndex + 1}
                      </span>
                      {page.addedRotation !== 0 && (
                        <span className="text-[10px] text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-1 rounded-md">
                          {page.addedRotation}°
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
