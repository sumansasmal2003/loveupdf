"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import {
  File as FileIcon, Loader2, X, Download,
  Trash2, ArrowLeft, ArrowRight, RotateCcw, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageData {
  id: string;
  originalIndex: number;
  imgUrl: string;
  isDeleted: boolean;
}

export default function OrganizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      setFile(uploadedFile);
      await generateThumbnails(uploadedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPages([]);
    setProgress(0);
  };

  // 1. Visually render every page as a thumbnail
  const generateThumbnails = async (pdfFile: File) => {
    setIsLoading(true);
    setProgress(0);
    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      const newPages: PageData[] = [];
      const scale = 0.5; // Smaller scale for fast thumbnail rendering

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgUrl = canvas.toDataURL("image/jpeg", 0.7);

        newPages.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1, // pdf-lib is 0-indexed
          imgUrl,
          isDeleted: false,
        });

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPages(newPages);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error reading PDF:", error);
      alert("Could not load the PDF for organizing.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // UI Controls for organizing
  const movePage = (index: number, direction: 'left' | 'right') => {
    const newPages = [...pages];
    if (direction === 'left' && index > 0) {
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    } else if (direction === 'right' && index < newPages.length - 1) {
      [newPages[index + 1], newPages[index]] = [newPages[index], newPages[index + 1]];
    }
    setPages(newPages);
  };

  const toggleDelete = (index: number) => {
    const newPages = [...pages];
    newPages[index].isDeleted = !newPages[index].isDeleted;
    setPages(newPages);
  };

  // 2. Build the final PDF based on the visual layout
  const saveOrganizedPDF = async () => {
    if (!file || pages.length === 0) return;

    const activePages = pages.filter(p => !p.isDeleted);
    if (activePages.length === 0) {
      alert("You cannot save an empty PDF. Please keep at least one page.");
      return;
    }

    setIsSaving(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Loop through the visually sorted pages and copy them from the original doc
      for (const p of activePages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [p.originalIndex]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `organized_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("An error occurred while saving the new PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  const activePageCount = pages.filter(p => !p.isDeleted).length;

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          Organize & Remove Pages
        </h1>
        <p className="text-[#c4c7c5]">
          Visually rearrange your document. Shift pages, delete the ones you don't need, and save.
        </p>
      </header>

      {!file ? (
        <div className="w-full max-w-4xl mx-auto">
           <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to organize" />
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
                {isLoading ? <Loader2 className="w-6 h-6 text-[#8ab4f8] animate-spin" /> : <LayoutGrid className="w-6 h-6 text-[#8ab4f8]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#e3e3e3] font-medium truncate">{file.name}</span>
                <span className="text-sm text-[#8e918f]">
                  {isLoading ? "Rendering thumbnails..." : `${activePageCount} of ${pages.length} pages selected`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={saveOrganizedPDF}
                disabled={isLoading || isSaving || activePageCount === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium transition-all bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] disabled:opacity-50"
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
                    className={`flex flex-col border rounded-xl overflow-hidden transition-colors ${
                      page.isDeleted ? "border-[#ef4444]/30 bg-[#ef4444]/5" : "border-white/10 bg-[#1e1f20]"
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[1/1.4] bg-[#131314] p-2 flex items-center justify-center group overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.imgUrl}
                        alt={`Page ${page.originalIndex + 1}`}
                        className={`max-w-full max-h-full object-contain shadow-sm transition-all ${page.isDeleted ? "opacity-20 grayscale" : "opacity-100"}`}
                      />

                      {/* Overlay Controls */}
                      <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 transition-opacity ${page.isDeleted ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        {page.isDeleted ? (
                          <button onClick={() => toggleDelete(index)} className="flex items-center gap-2 px-4 py-2 bg-[#1e1f20] text-[#e3e3e3] rounded-lg hover:bg-white/10 transition-colors">
                            <RotateCcw className="w-4 h-4" /> Restore
                          </button>
                        ) : (
                          <>
                            <button onClick={() => toggleDelete(index)} className="p-3 bg-[#ef4444] text-white rounded-full hover:bg-[#dc2626] transition-colors shadow-lg" title="Remove Page">
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="flex gap-2">
                              <button onClick={() => movePage(index, 'left')} disabled={index === 0} className="p-2 bg-[#1e1f20] text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <button onClick={() => movePage(index, 'right')} disabled={index === pages.length - 1} className="p-2 bg-[#1e1f20] text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer Data */}
                    <div className="p-3 flex justify-between items-center border-t border-white/5">
                      <span className={`text-xs font-medium ${page.isDeleted ? "text-[#ef4444]" : "text-[#c4c7c5]"}`}>
                        {page.isDeleted ? "Removed" : `Page ${page.originalIndex + 1}`}
                      </span>
                      <span className="text-[10px] text-[#8e918f] bg-[#131314] px-2 py-1 rounded-md">
                        {index + 1}
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
