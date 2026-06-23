"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { Minimize2, File as FileIcon, Loader2, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type CompressionLevel = "extreme" | "recommended";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setFileSize(files[0].size);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileSize(0);
    setProgress(0);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const fileUrl = URL.createObjectURL(file);

      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const originalPdf = await loadingTask.promise;
      const compressedPdf = await PDFDocument.create();

      const scale = level === "extreme" ? 1.0 : 1.5;
      const imageQuality = level === "extreme" ? 0.6 : 0.8;

      for (let pageNum = 1; pageNum <= originalPdf.numPages; pageNum++) {
        const page = await originalPdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        const imgDataUrl = canvas.toDataURL("image/jpeg", imageQuality);
        const jpgImage = await compressedPdf.embedJpg(imgDataUrl);

        const newPage = compressedPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        setProgress(Math.round((pageNum / originalPdf.numPages) * 100));
      }

      const compressedBytes = await compressedPdf.save({ useObjectStreams: true });

      const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      URL.revokeObjectURL(fileUrl);

    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("An error occurred while compressing the file. The file might be corrupted or protected.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">
          Compress PDF
        </h1>
        <p className="text-[#c4c7c5]">
          Significantly reduce file size by compressing embedded images and structure.
        </p>
      </header>

      {!file ? (
        <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a PDF to compress" />
      ) : (
        <div className="w-full mt-4 flex flex-col md:flex-row gap-6">

          {/* Left Column: Fixed to 50% width on desktop */}
          <div className="w-full md:w-1/2 flex flex-col min-w-0">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl h-full justify-between relative overflow-hidden"
              >
                {isProcessing && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-[#8ab4f8] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="flex items-center gap-4 overflow-hidden mb-6 z-10 w-full">
                  <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                    <FileIcon className="w-8 h-8 text-[#8ab4f8]" />
                  </div>

                  {/* Added flex-1 and min-w-0 here to force truncation */}
                  <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                    <span className="text-[#e3e3e3] font-medium truncate text-lg w-full block">
                      {file.name}
                    </span>
                    <span className="text-sm text-[#8e918f] truncate w-full block">
                      Original size: {formatBytes(fileSize)}
                    </span>
                    {isProcessing && (
                      <span className="text-xs text-[#8ab4f8] mt-1 font-medium">
                        Compressing... {progress}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={removeFile}
                  disabled={isProcessing}
                  className="self-start flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 mt-auto"
                >
                  <X className="w-4 h-4" /> Remove File
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Fixed to 50% width on desktop */}
          <div className="w-full md:w-1/2 flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl gap-4 min-w-0">
            <h2 className="text-[#e3e3e3] font-medium mb-2">Select compression level</h2>

            <button
              onClick={() => setLevel("extreme")}
              disabled={isProcessing}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                level === "extreme" ? "bg-[#8ab4f8]/10 border-[#8ab4f8]" : "border-white/5 hover:bg-white/5"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="mt-0.5 shrink-0">
                {level === "extreme" ? <CheckCircle2 className="w-5 h-5 text-[#8ab4f8]" /> : <div className="w-5 h-5 rounded-full border-2 border-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${level === "extreme" ? "text-[#8ab4f8]" : "text-[#e3e3e3]"}`}>Extreme</p>
                <p className="text-xs text-[#8e918f] mt-1 pr-2">Max size reduction. Text flattens.</p>
              </div>
            </button>

            <button
              onClick={() => setLevel("recommended")}
              disabled={isProcessing}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                level === "recommended" ? "bg-[#8ab4f8]/10 border-[#8ab4f8]" : "border-white/5 hover:bg-white/5"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="mt-0.5 shrink-0">
                {level === "recommended" ? <CheckCircle2 className="w-5 h-5 text-[#8ab4f8]" /> : <div className="w-5 h-5 rounded-full border-2 border-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${level === "recommended" ? "text-[#8ab4f8]" : "text-[#e3e3e3]"}`}>Recommended</p>
                <p className="text-xs text-[#8e918f] mt-1 pr-2">Balance of quality and size.</p>
              </div>
            </button>

            <button
              onClick={compressPDF}
              disabled={isProcessing}
              className={`w-full mt-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
                isProcessing
                  ? "bg-[#131314] text-[#8e918f] cursor-not-allowed border border-white/5"
                  : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] hover:scale-105"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#8ab4f8]" />
                  Processing...
                </>
              ) : (
                <>
                  <Minimize2 className="w-5 h-5" /> Compress PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
