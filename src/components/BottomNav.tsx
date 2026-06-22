"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Minimize2, ScanLine, Home } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Merge", href: "/merge", icon: <Layers className="w-5 h-5" /> },
    { name: "Compress", href: "/compress", icon: <Minimize2 className="w-5 h-5" /> },
    { name: "Scan", href: "/scan", icon: <ScanLine className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e1f20]/95 backdrop-blur-lg border-t border-white/5 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-200 ${
                isActive ? "text-[#8ab4f8]" : "text-[#8e918f] hover:text-[#c4c7c5]"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-[#8ab4f8]/10" : "bg-transparent"}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? "font-semibold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
