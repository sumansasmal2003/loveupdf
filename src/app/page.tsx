"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers, Scissors, Minimize2, FileText, Image as ImageIcon,
  LayoutGrid, ScanLine, Trash2, Files, Wrench, ScanText,
  Presentation, FileSpreadsheet, FileCode, ArrowRight,
  RefreshCcw,
  Hash,
  Stamp,
  Crop,
  FileEdit,
  Unlock,
  Lock,
  PenTool,
  SquareAsterisk,
  GitCompare
} from "lucide-react";

const toolCategories = [
  {
    category: "Organize & Optimize",
    description: "Make your PDFs smaller, fix broken files, or arrange pages perfectly.",
    tools: [
      { title: "Merge PDF", description: "Combine multiple PDFs into one document.", icon: <Layers className="w-6 h-6 text-[#8ab4f8]" />, href: "/merge" },
      { title: "Split PDF", description: "Extract pages or separate a large PDF.", icon: <Scissors className="w-6 h-6 text-[#8ab4f8]" />, href: "/split" },
      { title: "Compress PDF", description: "Reduce file size without losing quality.", icon: <Minimize2 className="w-6 h-6 text-[#8ab4f8]" />, href: "/compress" },
      { title: "Repair PDF", description: "Fix damaged or corrupted PDF files.", icon: <Wrench className="w-6 h-6 text-[#8ab4f8]" />, href: "/repair" },
    ]
  },
  {
    category: "Edit PDF",
    description: "Visually alter, rotate, and manage the pages inside your document.",
    tools: [
      { title: "Edit PDF", description: "Add text or white-out mistakes instantly.", icon: <FileEdit className="w-6 h-6 text-[#8ab4f8]" />, href: "/edit" },
      { title: "Organize PDF", description: "Visually reorder or delete pages.", icon: <LayoutGrid className="w-6 h-6 text-[#8ab4f8]" />, href: "/organize" },
      { title: "Rotate PDF", description: "Rotate specific pages or the entire document.", icon: <RefreshCcw className="w-6 h-6 text-[#8ab4f8]" />, href: "/rotate" },
      { title: "Crop PDF", description: "Trim the white space or margins around your pages.", icon: <Crop className="w-6 h-6 text-[#8ab4f8]" />, href: "/crop" },
      { title: "Remove Pages", description: "Delete specific pages from a document.", icon: <Trash2 className="w-6 h-6 text-[#8ab4f8]" />, href: "/remove" },
      { title: "Extract Pages", description: "Get a new document from selected pages.", icon: <Files className="w-6 h-6 text-[#8ab4f8]" />, href: "/extract" },
      { title: "Add Page Numbers", description: "Insert formatted page numbers into your document.", icon: <Hash className="w-6 h-6 text-[#8ab4f8]" />, href: "/page-numbers" },
      { title: "Add Watermark", description: "Stamp custom text across your document pages.", icon: <Stamp className="w-6 h-6 text-[#8ab4f8]" />, href: "/watermark" },

    ]
  },
  {
    category: "Convert to PDF",
    description: "Turn your files, images, and web pages into secure PDFs.",
    tools: [
      { title: "Word to PDF", description: "Convert DOCX files to uneditable PDFs.", icon: <FileText className="w-6 h-6 text-[#8ab4f8]" />, href: "/word-to-pdf" },
      { title: "JPG to PDF", description: "Convert images into a single PDF.", icon: <ImageIcon className="w-6 h-6 text-[#8ab4f8]" />, href: "/jpg-to-pdf" },
      { title: "PowerPoint to PDF", description: "Turn slideshows into PDF documents.", icon: <Presentation className="w-6 h-6 text-[#8ab4f8]" />, href: "/powerpoint-to-pdf" },
      { title: "Excel to PDF", description: "Convert spreadsheets into readable PDFs.", icon: <FileSpreadsheet className="w-6 h-6 text-[#8ab4f8]" />, href: "/excel-to-pdf" },
      { title: "HTML to PDF", description: "Convert web pages or code into PDFs.", icon: <FileCode className="w-6 h-6 text-[#8ab4f8]" />, href: "/html-to-pdf" },
      { title: "Scan to PDF", description: "Capture physical documents into a PDF.", icon: <ScanLine className="w-6 h-6 text-[#8ab4f8]" />, href: "/scan" },
    ]
  },
  {
    category: "Convert from PDF",
    description: "Extract the data out of your PDFs into other formats.",
    tools: [
      { title: "PDF to Word", description: "Convert PDF files into editable Word docs.", icon: <FileText className="w-6 h-6 text-[#8ab4f8]" />, href: "/pdf-to-word" },
      { title: "PDF to JPG", description: "Extract images or convert pages to JPG.", icon: <ImageIcon className="w-6 h-6 text-[#8ab4f8]" />, href: "/pdf-to-jpg" },
      { title: "OCR PDF", description: "Scan images to extract readable text.", icon: <ScanText className="w-6 h-6 text-[#8ab4f8]" />, href: "/ocr" },
      { title: "PDF to PowerPoint", description: "Turn PDF files into PowerPoint presentations.", icon: <Presentation className="w-6 h-6 text-[#8ab4f8]" />, href: "/pdf-to-powerpoint" },
      { title: "PDF to Excel", description: "Extract PDF tables into formatted Excel spreadsheets.", icon: <FileSpreadsheet className="w-6 h-6 text-[#8ab4f8]" />, href: "/pdf-to-excel" },
    ]
  },
  {
    category: "PDF Security",
    description: "Manage passwords, permissions, and ensure your documents are safe.",
    tools: [
      { title: "Sign PDF", description: "Draw your signature and stamp it securely on your document.", icon: <PenTool className="w-6 h-6 text-[#8ab4f8]" />, href: "/sign" },
      { title: "Protect PDF", description: "Encrypt your PDF with a secure password.", icon: <Lock className="w-6 h-6 text-[#8ab4f8]" />, href: "/protect" },
      { title: "Unlock PDF", description: "Remove passwords and restrictions securely.", icon: <Unlock className="w-6 h-6 text-[#8ab4f8]" />, href: "/unlock" },
      { title: "Redact PDF", description: "Permanently blackout sensitive information.", icon: <SquareAsterisk className="w-6 h-6 text-[#8ab4f8]" />, href: "/redact" },
      { title: "Compare PDF", description: "Highlight text differences between two documents.", icon: <GitCompare className="w-6 h-6 text-[#8ab4f8]" />, href: "/compare" },
    ]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Home() {
  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 w-full overflow-x-hidden">
      <header className="text-center mb-16 mt-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#e3e3e3] mb-6">
          Every tool you need to work with PDFs.
        </h1>
        <p className="text-lg text-[#c4c7c5] leading-relaxed">
          All these tools are completely free and work securely inside your web browser. Your private files never leave your device.
        </p>
      </header>

      <div className="w-full max-w-6xl flex flex-col gap-16">
        {toolCategories.map((section, sectionIdx) => (
          <section key={sectionIdx} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
              <h2 className="text-2xl font-medium text-[#e3e3e3]">{section.category}</h2>
              <p className="text-[#8e918f]">{section.description}</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {section.tools.map((tool) => (
                <motion.div key={tool.title} variants={itemVariants as any}>
                  <Link
                    href={tool.href}
                    className="group flex flex-col h-full p-6 bg-[#1e1f20] rounded-2xl border border-white/5 hover:border-[#8ab4f8]/50 hover:bg-[#282a2c] transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="mb-4 p-3 w-fit bg-[#131314] rounded-xl border border-white/5 group-hover:scale-110 transition-transform duration-300">
                      {tool.icon}
                    </div>
                    <h3 className="text-lg font-medium text-[#e3e3e3] mb-2 group-hover:text-[#8ab4f8] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-[#8e918f] text-sm leading-relaxed mb-4 flex-1">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-xs font-medium text-[#8ab4f8] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Try tool <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>
        ))}
      </div>
    </div>
  );
}
