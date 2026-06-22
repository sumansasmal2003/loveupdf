import Link from "next/link";
import { Layers, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#131314] border-t border-white/5 mt-auto pt-16 pb-28 md:pb-8 px-6 sm:px-12 md:px-20">
      <div className="max-w-7xl mx-auto">

        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">

          {/* Column 1: Brand & Contact */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Layers className="w-6 h-6 text-[#8ab4f8] group-hover:opacity-80 transition-opacity" />
              <span className="text-xl font-medium text-[#e3e3e3]">LoveUPDF</span>
            </Link>
            <p className="text-sm text-[#8e918f] leading-relaxed">
              A powerful, secure suite of PDF utilities. We process your files locally in your browser to guarantee total privacy and data security.
            </p>
            <div className="flex flex-col gap-3 mt-2 text-sm text-[#8e918f]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8ab4f8] shrink-0 mt-0.5" />
                <address className="not-italic leading-relaxed">
                  Sijgeria, Debra<br />
                  Paschim Medinipur<br />
                  West Bengal, 721139
                </address>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#8ab4f8] shrink-0" />
                <span>+91 99330 12328</span>
              </div>
            </div>
          </div>

          {/* Column 2: Organize & Edit */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#e3e3e3] font-medium mb-2">Edit & Organize</h3>
            <Link href="/merge" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Merge PDF</Link>
            <Link href="/split" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Split PDF</Link>
            <Link href="/edit" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Edit PDF</Link>
            <Link href="/compress" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Compress PDF</Link>
            <Link href="/organize" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Organize Pages</Link>
          </div>

          {/* Column 3: Convert & Secure */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#e3e3e3] font-medium mb-2">Convert & Secure</h3>
            <Link href="/word-to-pdf" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Word to PDF</Link>
            <Link href="/pdf-to-excel" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">PDF to Excel</Link>
            <Link href="/sign" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Sign PDF</Link>
            <Link href="/protect" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Protect PDF</Link>
            <Link href="/redact" className="text-sm text-[#8e918f] hover:text-[#8ab4f8] transition-colors w-fit">Redact PDF</Link>
          </div>

          {/* Column 4: Legal & Company */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#e3e3e3] font-medium mb-2">Legal</h3>
            <Link href="/privacy" className="text-sm text-[#8e918f] hover:text-[#e3e3e3] transition-colors w-fit">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-[#8e918f] hover:text-[#e3e3e3] transition-colors w-fit">Terms of Service</Link>
            <div className="mt-4 p-4 bg-[#1e1f20] border border-white/5 rounded-xl">
              <p className="text-xs text-[#8ab4f8] font-medium mb-1">100% Offline Processing</p>
              <p className="text-xs text-[#8e918f] leading-relaxed">
                Your files never leave your device. All edits are computed directly in your browser.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/5 gap-4 text-center md:text-left">
          <p className="text-xs text-[#8e918f] text-center w-full">
            © {new Date().getFullYear()} LoveUPDF. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
