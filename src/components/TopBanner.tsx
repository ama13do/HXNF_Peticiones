// src/components/TopBanner.tsx
"use client";

export default function TopBanner() {
  return (
    <a
      href="https://nuestrofuturo.mx/hxnf/"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-hxnf-green text-black text-xs sm:text-sm font-semibold text-center py-2 px-4 hover:bg-hxnf-yellow transition-colors duration-200"
    >
      <span className="hidden sm:inline">
        ⚡ Proyecto de <strong>Hackers x Nuestro Futuro</strong> — Tu voz llega al Congreso 🌱
      </span>
      <span className="sm:hidden">
        ⚡ <strong>Hackers x Nuestro Futuro</strong> — Tu voz al Congreso
      </span>
    </a>
  );
}
