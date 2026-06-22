"use client";

import { useState } from "react";
import { FileCode, Code, Link as LinkIcon, Loader2, X, Download, FileText, Sparkles, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploader from "@/components/FileUploader";

export default function HtmlToPdfPage() {
  const [mode, setMode] = useState<"upload" | "code" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (files: File[]) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      setFile(uploadedFile);
      const text = await uploadedFile.text();
      setHtmlContent(text);
    }
  };

  const clearAll = () => {
    setFile(null);
    setHtmlContent("");
    setUrlInput("");
  };

  // Handles raw HTML code and Uploaded files (Client-side)
  const generateFromHTML = async () => {
    if (!htmlContent) return;
    setIsProcessing(true);
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.createElement("div");
      element.innerHTML = htmlContent;
      element.style.padding = "20px";
      element.style.background = "#ffffff";
      element.style.color = "#000000";
      element.style.width = "800px";
      document.body.appendChild(element);

      const filename = file ? file.name.replace(".html", ".pdf") : "document.pdf";
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
    } catch (error) {
      alert("Failed to render HTML. Check syntax.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handles Live URLs via Hugging Face Backend
  const generateFromURL = async () => {
    if (!urlInput) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/url-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      if (blob.type === "application/json") throw new Error("Server error");

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Clean up the URL for a nice filename
      const cleanName = urlInput.replace(/^https?:\/\//, '').split('/')[0];
      link.download = `${cleanName}_webpage.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert("Failed to capture the website. Ensure your backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasData = htmlContent !== "" || (mode === "url" && urlInput.length > 4);

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-5xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">HTML to PDF</h1>
        <p className="text-[#c4c7c5]">Convert web pages, raw code, or HTML files into pristine PDFs.</p>
      </header>

      {/* Mode Switcher */}
      {!hasData && (
        <div className="flex bg-[#1e1f20] p-1 rounded-xl mb-8 border border-white/5 w-full max-w-md mx-auto shadow-lg">
          <button
            onClick={() => setMode("url")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "url" ? "bg-[#131314] text-[#8ab4f8] shadow-sm border border-white/5" : "text-[#8e918f] hover:text-[#c4c7c5]"}`}
          >
            <LinkIcon className="w-4 h-4" /> Web URL
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "upload" ? "bg-[#131314] text-[#8ab4f8] shadow-sm border border-white/5" : "text-[#8e918f] hover:text-[#c4c7c5]"}`}
          >
            <FileCode className="w-4 h-4" /> Upload
          </button>
          <button
            onClick={() => setMode("code")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "code" ? "bg-[#131314] text-[#8ab4f8] shadow-sm border border-white/5" : "text-[#8e918f] hover:text-[#c4c7c5]"}`}
          >
            <Code className="w-4 h-4" /> Code
          </button>
        </div>
      )}

      {/* Inputs */}
      {!hasData && mode === "url" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Globe className="absolute left-4 w-5 h-5 text-[#8e918f]" />
            <input
              type="url"
              placeholder="https://web.whatsapp.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#1e1f20] border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors shadow-lg"
            />
          </div>
        </motion.div>
      )}

      {!hasData && mode === "upload" && (
        <div className="w-full max-w-3xl mx-auto">
          <FileUploader onUpload={handleUpload} maxFiles={1} title="Upload an HTML file" accept={{ "text/html": [".html", ".htm"] }} acceptText="Only .html files are supported" />
        </div>
      )}

      {!hasData && mode === "code" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl flex flex-col gap-4">
          <div className="bg-[#1e1f20] border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col focus-within:border-[#8ab4f8]/50 transition-colors">
            <textarea
              placeholder="<h1>Hello World</h1>&#10;<p>Paste your HTML code here...</p>"
              className="w-full h-[400px] bg-transparent text-[#e3e3e3] p-6 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
              onPaste={(e) => setTimeout(() => setHtmlContent(e.currentTarget.value), 50)}
            />
          </div>
        </motion.div>
      )}

      {/* Action / Success Area */}
      {hasData && (
        <div className="w-full mt-4 max-w-3xl mx-auto flex flex-col gap-6">
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col p-6 bg-[#1e1f20] border border-white/5 rounded-2xl relative overflow-hidden shadow-lg">
              {isProcessing && <div className="absolute top-0 left-0 right-0 h-1 bg-[#8ab4f8] animate-pulse" />}

              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6 z-10 w-full">
                <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                  <div className="p-3 bg-[#131314] rounded-xl border border-white/5 shrink-0">
                    {mode === "url" ? <Globe className="w-6 h-6 text-[#8ab4f8]" /> : <FileText className="w-6 h-6 text-[#8ab4f8]" />}
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                    <span className="text-[#e3e3e3] font-medium truncate w-full block">
                      {mode === "url" ? urlInput : file ? file.name : "Custom HTML Snippet"}
                    </span>
                    <span className="text-sm text-[#8e918f]">
                      {isProcessing ? "Rendering PDF..." : "Ready to generate document"}
                    </span>
                  </div>
                </div>
                <button onClick={clearAll} disabled={isProcessing} className="p-2 text-[#8e918f] hover:text-[#ef4444] rounded-lg hover:bg-white/5 ml-4 disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#8ab4f8]/10 border border-[#8ab4f8]/20 rounded-xl mb-6">
                <Sparkles className="w-5 h-5 text-[#8ab4f8] shrink-0 mt-0.5" />
                <p className="text-sm text-[#c4c7c5]">
                  <strong className="text-[#8ab4f8] font-medium">{mode === "url" ? "Headless Engine: " : "Auto-Formatting: "}</strong>
                  {mode === "url"
                    ? "Our backend will physically visit this URL, wait for all scripts to load, and capture a perfect snapshot."
                    : "The HTML will be rendered on a standard white A4 background. Page breaks are automatic."}
                </p>
              </div>

              <button
                onClick={mode === "url" ? generateFromURL : generateFromHTML}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${isProcessing ? "bg-[#131314] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa]"}`}
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating PDF...</> : <><Download className="w-5 h-5" /> Download PDF</>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
