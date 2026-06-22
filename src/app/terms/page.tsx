"use client";

import { Scale, FileText, AlertTriangle, ShieldBan, Terminal, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  const lastUpdated = "June 22, 2026";

  const sections = [
    {
      icon: <Terminal className="w-6 h-6 text-[#8ab4f8]" />,
      title: "1. Acceptance of Terms",
      content: (
        <p>
          By accessing and using LoveUPDF ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of the Service immediately. We reserve the right to modify or replace these terms at any time without prior notice.
        </p>
      )
    },
    {
      icon: <FileText className="w-6 h-6 text-[#8ab4f8]" />,
      title: "2. Description of Service",
      content: (
        <p>
          LoveUPDF provides a suite of online tools for formatting, editing, securing, and converting Portable Document Format (PDF) files. While we strive for 100% uptime and perfect file conversions, the Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. We do not warrant that the tools will meet your specific requirements or operate without interruption.
        </p>
      )
    },
    {
      icon: <ShieldBan className="w-6 h-6 text-[#8ab4f8]" />,
      title: "3. Acceptable Use Policy",
      content: (
        <div className="flex flex-col gap-3">
          <p>You agree not to use LoveUPDF to process files that are illegal, harmful, or violate the rights of others. Specifically, you must not use our tools to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
            <li>Forge, alter, or falsify legal documents, contracts, or government-issued IDs.</li>
            <li>Process or distribute malware, ransomware, or malicious code disguised as PDF files.</li>
            <li>Infringe upon the intellectual property, copyright, or trademark rights of third parties.</li>
            <li>Attempt to bypass, hack, or overwhelm our server infrastructure.</li>
          </ul>
          <p className="mt-2 text-red-400 font-medium text-sm">
            We reserve the right to block your IP address or restrict your access to the Service if we detect abusive or malicious behavior.
          </p>
        </div>
      )
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-[#8ab4f8]" />,
      title: "4. Limitation of Liability",
      content: (
        <p>
          Under no circumstances shall LoveUPDF, its developers, or its affiliates be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Service. <strong>This includes, but is not limited to, damages for loss of data, file corruption, lost profits, or business interruption.</strong> You are solely responsible for keeping backups of your original, unedited documents before uploading them to LoveUPDF. Furthermore, we are not responsible if you lose the password to a PDF you encrypted using our "Protect PDF" tool.
        </p>
      )
    },
    {
      icon: <Scale className="w-6 h-6 text-[#8ab4f8]" />,
      title: "5. Intellectual Property",
      content: (
        <p>
          <strong>Your Files:</strong> You retain all intellectual property rights to the documents you process using LoveUPDF. We claim no ownership over your files.<br /><br />
          <strong>Our Software:</strong> The design, code, architecture, and branding of LoveUPDF are the exclusive property of the developers. You may not copy, scrape, or reverse-engineer the Service's frontend or backend architecture for commercial purposes without explicit permission.
        </p>
      )
    },
    {
      icon: <Mail className="w-6 h-6 text-[#8ab4f8]" />,
      title: "6. Governing Law & Contact",
      content: (
        <div className="flex flex-col gap-3">
          <p>These terms are governed by the laws of India. Any disputes arising from these terms will be resolved in the appropriate courts of jurisdiction. For legal inquiries, please contact us:</p>
          <address className="not-italic bg-[#131314] p-4 rounded-xl border border-white/5 mt-2 text-[#e3e3e3]">
            <strong>LoveUPDF Legal</strong><br />
            Sijgeria, Debra<br />
            Paschim Medinipur<br />
            West Bengal, 721139<br />
            India<br /><br />
            <span className="text-[#8ab4f8]">Phone:</span> +91 99330 12328
          </address>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col items-center flex-1 p-6 sm:p-12 md:p-20 max-w-4xl mx-auto w-full">
      <header className="text-center mb-16 w-full mt-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#8ab4f8]/10 rounded-2xl border border-[#8ab4f8]/20">
            <Scale className="w-12 h-12 text-[#8ab4f8]" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#e3e3e3] mb-6">
          Terms of Service
        </h1>
        <div className="flex items-center justify-center gap-2 text-[#8e918f]">
          <Clock className="w-4 h-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
        <p className="text-lg text-[#c4c7c5] max-w-2xl mx-auto mt-6 leading-relaxed">
          Please read these terms carefully before using LoveUPDF. They outline your rights, responsibilities, and the limitations of our liability.
        </p>
      </header>

      <div className="w-full flex flex-col gap-8">
        {sections.map((section, index) => (
          <motion.section
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 bg-[#1e1f20] border border-white/5 rounded-2xl shadow-lg"
          >
            <div className="shrink-0">
              <div className="p-3 bg-[#131314] rounded-xl border border-white/5">
                {section.icon}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-medium text-[#e3e3e3]">{section.title}</h2>
              <div className="text-[#8e918f] leading-relaxed text-sm sm:text-base">
                {section.content}
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
