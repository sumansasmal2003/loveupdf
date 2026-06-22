"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore - Sometimes Next.js complains about diff types, this ensures it compiles smoothly
import { diffWordsWithSpace } from "diff";
import {
  GitCompare, Loader2, X, FileText, ArrowRightLeft,
  CheckCircle2, AlertCircle, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DiffResult {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function ComparePdfPage() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffResults, setDiffResults] = useState<DiffResult[] | null>(null);
  const [stats, setStats] = useState({ additions: 0, deletions: 0 });

  const extractTextFromPdf = async (file: File) => {
    const url = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(url).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    URL.revokeObjectURL(url);
    return fullText;
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setIsProcessing(true);
    setDiffResults(null);

    try {
      // Extract text from both documents
      const text1 = await extractTextFromPdf(file1);
      const text2 = await extractTextFromPdf(file2);

      // Run the Git-style text difference engine
      const differences = diffWordsWithSpace(text1, text2);

      // Calculate basic stats for the dashboard
      let additions = 0;
      let deletions = 0;
      differences.forEach((part: DiffResult) => {
        if (part.added) additions += part.value.trim().split(/\s+/).length;
        if (part.removed) deletions += part.value.trim().split(/\s+/).length;
      });

      setStats({ additions, deletions });
      setDiffResults(differences);
    } catch (error) {
      console.error("Comparison Error:", error);
      alert("Failed to extract and compare the documents. Ensure they contain readable text, not just images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile1(null);
    setFile2(null);
    setDiffResults(null);
  };

  // Custom mini-uploader component for the dual layout
  const MiniUploader = ({ label, file, setFile }: { label: string, file: File | null, setFile: (f: File | null) => void }) => (
    <div className="flex-1 flex flex-col gap-2">
      <label className="text-sm font-medium text-[#c4c7c5] ml-1">{label}</label>
      {!file ? (
        <div className="relative group flex flex-col items-center justify-center p-8 bg-[#131314] border-2 border-dashed border-white/10 hover:border-[#8ab4f8]/50 rounded-2xl transition-all cursor-pointer min-h-[160px]">
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <FileText className="w-8 h-8 text-[#8e918f] group-hover:text-[#8ab4f8] transition-colors mb-3" />
          <span className="text-sm text-[#e3e3e3] font-medium">Click to upload</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-[#1e1f20] border border-[#8ab4f8]/30 rounded-2xl min-h-[160px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-3 bg-[#8ab4f8]/10 rounded-xl shrink-0"><CheckCircle2 className="w-6 h-6 text-[#8ab4f8]" /></div>
            <div className="flex flex-col min-w-0">
              <span className="text-[#e3e3e3] font-medium truncate">{file.name}</span>
              <span className="text-xs text-[#8e918f]">Ready for comparison</span>
            </div>
          </div>
          <button onClick={() => setFile(null)} className="p-2 text-[#8e918f] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-6xl mx-auto w-full">
      <header className="text-center mb-10 w-full">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#e3e3e3] mb-4">Compare PDFs</h1>
        <p className="text-[#c4c7c5]">Upload two documents to highlight exactly what text was added, deleted, or changed.</p>
      </header>

      {/* Upload Section */}
      {!diffResults && (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <MiniUploader label="Original Document" file={file1} setFile={setFile1} />
            <div className="hidden md:flex items-center justify-center pt-6"><ArrowRightLeft className="w-6 h-6 text-[#8e918f]" /></div>
            <MiniUploader label="Modified Document" file={file2} setFile={setFile2} />
          </div>

          <button
            onClick={handleCompare}
            disabled={!file1 || !file2 || isProcessing}
            className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all ${
              !file1 || !file2 || isProcessing ? "bg-[#1e1f20] text-[#8e918f] border border-white/5 cursor-not-allowed" : "bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] shadow-lg shadow-[#8ab4f8]/20"
            }`}
          >
            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Documents...</> : <><GitCompare className="w-5 h-5" /> Compare Documents</>}
          </button>
        </div>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {diffResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-6">

            {/* Top Stats Bar */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-[#1e1f20] border border-white/5 rounded-2xl shadow-lg gap-4 sticky top-24 z-10">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <span>+{stats.additions} words added</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                  <span>-{stats.deletions} words removed</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2 bg-[#131314] border border-white/10 text-[#e3e3e3] rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
                  <X className="w-4 h-4" /> Compare New Files
                </button>
              </div>
            </div>

            {/* The Unified Diff Viewer */}
            <div className="bg-[#1e1f20] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="bg-[#131314] p-3 border-b border-white/5 flex gap-4 text-xs font-mono text-[#8e918f]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 block"></span> Deleted</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 block"></span> Added</span>
              </div>

              <div className="p-8 text-[#e3e3e3] font-sans leading-relaxed text-lg whitespace-pre-wrap max-h-[70vh] overflow-y-auto custom-scrollbar">
                {diffResults.length === 1 && !diffResults[0].added && !diffResults[0].removed ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#8e918f] gap-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-50" />
                    <p>These documents are perfectly identical.</p>
                  </div>
                ) : (
                  diffResults.map((part, index) => {
                    if (part.added) {
                      return <span key={index} className="bg-emerald-500/20 text-emerald-300 rounded px-1">{part.value}</span>;
                    }
                    if (part.removed) {
                      return <span key={index} className="bg-red-500/20 text-red-400 line-through opacity-80 rounded px-1">{part.value}</span>;
                    }
                    return <span key={index} className="opacity-90">{part.value}</span>;
                  })
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
