"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { File as FileIcon, Loader2, X, Download, CheckCircle2, Files } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageData {
  id: string;
  originalIndex: number;
  imgUrl: string;
  isSelected: boolean;
}

export default function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      await generateThumbnails(files[0]);
    }
  };

  const clearFile = () => {
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
          id: `page-${i}`,
          originalIndex: i - 1,
          imgUrl: canvas.toDataURL("image/jpeg", 0.7),
          isSelected: false, // Default: Nothing selected
        });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setPages(newPages);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      alert("Failed to load PDF.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    const newPages = [...pages];
    newPages[index].isSelected = !newPages[index].isSelected;
    setPages(newPages);
  };

  const selectAll = () => {
    setPages(pages.map(p => ({ ...p, isSelected: true })));
  };

  const generateNewPDF = async () => {
    const pagesToKeep = pages.filter(p => p.isSelected);
    if (pagesToKeep.length === 0 || !file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const indicesToKeep = pagesToKeep.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, indicesToKeep);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_extracted.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating PDF:", error);
      alert("Failed to extract pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = pages.filter(p => p.isSelected).length;

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Extract Pages</h1>
        <p className="text-[#c4c7c5]">Select the specific pages you want to extract into a new PDF document.</p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
          <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to extract pages from" />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden gap-4 sticky top-24 z-40 shadow-lg">
            {isLoading && <div className="absolute bottom-0 left-0 h-1 bg-[#8ab4f8] transition-all" style={{ width: `${progress}%` }} />}

            <div className="flex items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
              <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                {isLoading ? <Loader2 className="w-6 h-6 text-[#8ab4f8] animate-spin" /> : <Files className="w-6 h-6 text-[#8ab4f8]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#e3e3e3] font-medium truncate">{file.name}</span>
                <span className="text-sm text-[#8e918f]">
                  {isLoading ? "Reading pages..." : `${selectedCount} pages selected to extract`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={selectAll}
                disabled={isLoading || isProcessing}
                className="px-4 py-3 text-sm font-medium text-[#c4c7c5] hover:text-[#8ab4f8] transition-colors rounded-xl border border-white/5 hover:border-white/10 bg-[#131314]"
              >
                Select All
              </button>
              <button
                onClick={generateNewPDF}
                disabled={isLoading || isProcessing || selectedCount === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium transition-all bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] disabled:opacity-50"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</> : <><Download className="w-5 h-5" /> Extract Pages</>}
              </button>
              <button onClick={clearFile} disabled={isLoading || isProcessing} className="p-3 text-[#8e918f] hover:text-[#ef4444] rounded-xl bg-[#131314] border border-white/5 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isLoading && pages.length > 0 && (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <AnimatePresence>
                {pages.map((page, index) => (
                  <motion.div
                    layout key={page.id}
                    className={`relative flex flex-col border rounded-xl overflow-hidden cursor-pointer transition-all ${
                      page.isSelected ? "border-[#8ab4f8] bg-[#8ab4f8]/10 shadow-[0_0_15px_rgba(138,180,248,0.1)]" : "border-white/10 bg-[#1e1f20] hover:border-[#8ab4f8]/50"
                    }`}
                    onClick={() => toggleSelect(index)}
                  >
                    <div className="relative aspect-[1/1.4] bg-[#131314] p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={page.imgUrl} alt={`Page ${index + 1}`} className="max-w-full max-h-full object-contain" />

                      {page.isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-6 h-6 text-[#8ab4f8] fill-[#1e1f20]" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-white/5">
                      <span className={`text-sm font-medium ${page.isSelected ? "text-[#8ab4f8]" : "text-[#c4c7c5]"}`}>
                        Page {index + 1}
                      </span>
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
