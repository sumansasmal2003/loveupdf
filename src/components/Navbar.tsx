"use client";

import Link from "next/link";
import { Layers, ChevronDown, FileText, Settings, Image as ImageIcon, RefreshCcw, ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#131314]/90 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-2 group">
        <Layers className="w-6 h-6 text-[#8ab4f8] group-hover:opacity-80 transition-opacity" />
        <span className="text-xl font-medium text-[#e3e3e3]">LoveUPDF</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#c4c7c5]">

        {/* Organize Dropdown (Left-aligned or Centered is fine here) */}
        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors cursor-pointer">
            <Settings className="w-4 h-4" /> Organize <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-[#1e1f20] border border-white/5 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
            <Link href="/merge" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Merge PDF</Link>
            <Link href="/split" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Split PDF</Link>
            <Link href="/compress" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Compress PDF</Link>
            <Link href="/repair" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Repair PDF</Link>
          </div>
        </div>

        {/* Edit PDF Dropdown (Centered) */}
        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors cursor-pointer">
            <RefreshCcw className="w-4 h-4" /> Edit PDF <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#1e1f20] border border-white/5 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
            <Link href="/edit" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Edit PDF</Link>
            <Link href="/organize" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Organize Pages</Link>
            <Link href="/rotate" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Rotate PDF</Link>
            <Link href="/crop" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Crop PDF</Link>
            <Link href="/remove" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Remove Pages</Link>
            <Link href="/extract" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Extract Pages</Link>
            <Link href="/page-numbers" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Add Page Numbers</Link>
            <Link href="/watermark" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Add Watermark</Link>
          </div>
        </div>

        {/* Convert TO PDF Dropdown (Centered) */}
        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors cursor-pointer">
            <FileText className="w-4 h-4" /> Convert to PDF <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#1e1f20] border border-white/5 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
            <Link href="/word-to-pdf" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Word to PDF</Link>
            <Link href="/jpg-to-pdf" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">JPG to PDF</Link>
            <Link href="/html-to-pdf" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">HTML to PDF</Link>
            <Link href="/scan" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Scan to PDF</Link>
          </div>
        </div>

        {/* Convert FROM PDF Dropdown (Right-aligned to prevent overflow) */}
        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors cursor-pointer">
            <ImageIcon className="w-4 h-4" /> Convert from PDF <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
          </button>
          {/* Changed to right-0 */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e1f20] border border-white/5 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
            <Link href="/pdf-to-word" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">PDF to Word</Link>
            <Link href="/pdf-to-jpg" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">PDF to JPG</Link>
            <Link href="/ocr" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">OCR PDF</Link>
            <Link href="/pdf-to-powerpoint" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">PDF to PowerPoint</Link>
            <Link href="/pdf-to-excel" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">PDF to Excel</Link>
          </div>
        </div>

        {/* PDF Security Dropdown (Right-aligned to prevent overflow) */}
        <div className="relative group py-2">
          <button className="flex items-center gap-1 hover:text-[#8ab4f8] transition-colors cursor-pointer">
            <ShieldCheck className="w-4 h-4" /> Security <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
          </button>
          {/* Changed to right-0 */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e1f20] border border-white/5 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
            <Link href="/sign" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Sign PDF</Link>
            <Link href="/protect" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Protect PDF</Link>
            <Link href="/unlock" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Unlock PDF</Link>
            <Link href="/redact" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Redact PDF</Link>
            <Link href="/compare" className="px-4 py-3 hover:bg-white/5 hover:text-[#8ab4f8] transition-colors">Compare PDFs</Link>
          </div>
        </div>

      </div>
    </nav>
  );
}
