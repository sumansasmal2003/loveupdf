"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { Image as ImageIcon, File as FileIcon, Loader2, X, Download, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ExtractedImage {
  id: number;
  url: string;
  blob: Blob;
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [images, setImages] = useState<ExtractedImage[]>([]);

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setImages([]); // Clear previous images
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImages([]);
    setProgress(0);
  };

  const convertToImages = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    const extracted: ExtractedImage[] = [];

    try {
      const fileUrl = URL.createObjectURL(file);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      // Render each page at a high scale (2.0) for good image quality
      const scale = 2.0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        // Convert the canvas to a JPEG blob
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9) // 90% quality
        );

        if (blob) {
          extracted.push({
            id: i,
            url: URL.createObjectURL(blob),
            blob: blob,
          });
        }

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setImages(extracted);
      URL.revokeObjectURL(fileUrl);

    } catch (error) {
      console.error("Error converting PDF to JPG:", error);
      alert("Failed to read the PDF. It might be corrupted or password protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
    if (images.length === 0 || !file) return;

    const zip = new JSZip();
    const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove .pdf

    // Add each image to the zip file
    images.forEach((img) => {
      zip.file(`${originalName}_page_${img.id}.jpg`, img.blob);
    });

    // Generate and download the zip
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName}_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-5xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          PDF to JPG
        </h1>
        <p className="text-[#c4c7c5]">
          Extract every page of your PDF into high-quality JPG images.
        </p>
      </header>

      {!file ? (
        <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to convert to images" />
      ) : (
        <div className="w-full mt-4 flex flex-col gap-6">

          {/* Main Control Card */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden gap-6"
            >
              {isProcessing && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-[#8ab4f8] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              )}

              <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0 w-full md:w-auto">
                <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                  <FileIcon className="w-8 h-8 text-[#8ab4f8]" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-[#e3e3e3] font-medium truncate text-lg block">
                    {file.name}
                  </span>
                  <span className="text-sm text-[#8e918f] flex items-center gap-2">
                    {images.length > 0 ? `${images.length} pages extracted` : "Ready to extract"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {images.length === 0 ? (
                  <button
                    onClick={convertToImages}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> {progress}%</>
                    ) : (
                      <><ImageIcon className="w-5 h-5" /> Extract Images</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={downloadZip}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-[#a8c7fa] text-[#131314] hover:bg-[#8ab4f8] hover:scale-105"
                  >
                    <Archive className="w-5 h-5" /> Download ZIP
                  </button>
                )}

                <button
                  onClick={removeFile}
                  disabled={isProcessing}
                  className="p-3 text-[#8e918f] hover:text-[#ef4444] transition-colors rounded-xl hover:bg-white/5 bg-[#131314] border border-white/5 disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4"
            >
              {images.map((img) => (
                <div key={img.id} className="flex flex-col bg-[#1e1f20] border border-white/5 rounded-xl overflow-hidden group">
                  <div className="relative aspect-[1/1.4] bg-[#131314] w-full p-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Page ${img.id}`}
                      className="max-w-full max-h-full object-contain shadow-sm"
                    />

                    {/* Hover Overlay Download Button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={img.url}
                        download={`${file.name.replace(".pdf", "")}_page_${img.id}.jpg`}
                        className="p-3 bg-[#8ab4f8] text-[#131314] rounded-full hover:scale-110 transition-transform shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div className="p-3 text-center border-t border-white/5">
                    <span className="text-xs font-medium text-[#c4c7c5]">Page {img.id}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
