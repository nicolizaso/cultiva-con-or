"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sprout, RefreshCw, CalendarDays, Warehouse } from "lucide-react";

export default function DesktopNavbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/plants", label: "Plantas", icon: Sprout },
    { href: "/cycles", label: "Ciclos", icon: RefreshCw },
    { href: "/spaces", label: "Espacios", icon: Warehouse },
    { href: "/calendar", label: "Agenda", icon: CalendarDays },
  ];

  if (pathname === "/login") return null;

  return (
    <nav className="hidden md:flex justify-between items-center px-8 py-4 bg-[#12141C] border-b border-white/5 sticky top-0 z-50">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-2 group">
        <Sprout className="text-brand-primary w-6 h-6 transition-transform group-hover:rotate-12" strokeWidth={2.5} />
        <span className="font-title text-white text-lg tracking-wider uppercase">
            Cultiva con <span className="text-brand-primary">Ojitos</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const IconComponent = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
                isActive
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <IconComponent
                className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-sm font-bold tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
