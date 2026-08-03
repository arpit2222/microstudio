"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Feed", href: "/feed" },
    { name: "Create", href: "/projects/create" },
    { name: "Casting", href: "/casting" },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center mt-6 px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center space-x-6 shadow-2xl">
        <div className="text-white font-bold tracking-tighter mr-4 flex items-center space-x-2">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text text-xl">
            MicroStudio
          </span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-4">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-all ${
                  isActive 
                    ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        
        <div className="flex sm:hidden items-center">
          {/* Mobile menu could go here, for now just a simplified nav */}
          <Link href="/feed" className="text-sm font-medium text-white px-3 py-1 bg-white/10 rounded-full">
            Feed
          </Link>
        </div>
      </nav>
    </div>
  );
}
