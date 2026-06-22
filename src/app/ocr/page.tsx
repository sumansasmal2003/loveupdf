"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { ScanText, File as FileIcon, Loader2, X, Copy, Check, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setExtractedText("");
    }
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText("");
    setProgress(0);
  };

  const performOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setExtractedText("");

    try {
      setStatusText("Reading PDF pages...");
      const fileUrl = URL.createObjectURL(file);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      let fullText = "";

      // Loop through each page, render to image, and run OCR
      for (let i = 1; i <= pdf.numPages; i++) {
        setStatusText(`Extracting image from page ${i} of ${pdf.numPages}...`);

        const page = await pdf.getPage(i);
        // High scale is crucial for accurate OCR reading
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgDataUrl = canvas.toDataURL("image/png");

        setStatusText(`Running AI text recognition on page ${i}...`);

        const result = await Tesseract.recognize(imgDataUrl, 'eng', {
          logger: m => {
            if (m.status === "recognizing text") {
              // Calculate overall progress across all pages
              const pageBaseProgress = ((i - 1) / pdf.numPages) * 100;
              const currentOCRProgress = (m.progress * 100) / pdf.numPages;
              setProgress(Math.round(pageBaseProgress + currentOCRProgress));
            }
          }
        });

        fullText += `\n\n--- Page ${i} ---\n\n` + result.data.text;
      }

      setExtractedText(fullText.trim());
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("An error occurred while trying to recognize text.");
    } finally {
      setIsProcessing(false);
      setStatusText("");
      setProgress(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(".pdf", "_ocr")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-5xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">OCR PDF</h1>
        <p className="text-[#c4c7c5]">Extract text from scanned PDFs and images using AI. Runs 100% locally in your browser.</p>
      </header>

      {!file ? (
        <FileUploader onUpload={handleUpload} maxFiles={1} title="Select a scanned PDF for OCR" />
      ) : (
        <div className="w-full mt-4 flex flex-col gap-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden gap-6"
            >
              {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-[#8ab4f8] transition-all" style={{ width: `${progress}%` }} />}

              <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0 w-full md:w-auto">
                <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                  <FileIcon className="w-8 h-8 text-[#8ab4f8]" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-[#e3e3e3] font-medium truncate text-lg block">{file.name}</span>
                  <span className="text-sm text-[#8ab4f8]">
                    {isProcessing ? statusText : extractedText ? "OCR Complete!" : "Ready for extraction"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {!extractedText && (
                  <button
                    onClick={performOCR}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] disabled:opacity-50"
                  >
                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> {progress}%</> : <><ScanText className="w-5 h-5" /> Start OCR</>}
                  </button>
                )}

                <button onClick={removeFile} disabled={isProcessing} className="p-3 text-[#8e918f] hover:text-[#ef4444] rounded-xl bg-[#131314] border border-white/5 disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Results Area */}
          {extractedText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col bg-[#1e1f20] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#131314]/50">
                <h3 className="text-[#e3e3e3] font-medium">Extracted Text</h3>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm text-[#c4c7c5] hover:text-[#8ab4f8] bg-[#1e1f20] rounded-lg border border-white/5 hover:border-white/10 transition-all">
                    {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied</> : <><Copy className="w-4 h-4" /> Copy All</>}
                  </button>
                  <button onClick={downloadText} className="flex items-center gap-2 px-4 py-2 text-sm text-[#c4c7c5] hover:text-[#8ab4f8] bg-[#1e1f20] rounded-lg border border-white/5 hover:border-white/10 transition-all">
                    <Download className="w-4 h-4" /> Save .txt
                  </button>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={extractedText}
                  readOnly
                  className="w-full h-[400px] bg-transparent text-[#e3e3e3] font-mono text-sm resize-none focus:outline-none custom-scrollbar"
                />
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
