// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Landmark, ChevronLeft, Send } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin-2026-dashboard", icon: LayoutDashboard },
    { name: "Colaboradores", href: "/admin-2026-dashboard/colaboradores", icon: Users },
    { name: "Peticiones", href: "/admin-2026-dashboard/peticiones", icon: Send },
    { name: "Legisladores", href: "/admin-2026-dashboard/legisladores", icon: Landmark },
    { name: "Plantillas", href: "/admin-2026-dashboard/plantillas", icon: FileText },
  ];

  if (pathname.startsWith("/admin-2026-dashboard/login")) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center w-full">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-black/50">
        <div className="p-6">
          <Link href="/" className="flex items-center text-white/50 hover:text-white mb-6 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a la web
          </Link>
          <div className="flex items-center gap-2 group mb-8">
            <span className="font-bold text-lg tracking-tight group-hover:text-hxnf-green transition-colors">
              hackers
            </span>
            <span className="text-hxnf-green font-bold text-lg">x</span>
            <span className="font-bold text-lg tracking-tight group-hover:text-hxnf-green transition-colors">
              nuestro futuro
            </span>
          </div>
          <h2 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-4">Administración</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-hxnf-green/10 text-hxnf-green font-semibold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <p className="text-xs text-white/40">Panel de Control v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
