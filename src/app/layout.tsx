// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escribe a tus legisladores | Hackers x Nuestro Futuro",
  description:
    "Con tu código postal encontramos a tus diputados y senadores y preparamos el correo. Tú solo das clic.",
  openGraph: {
    title: "Escribe a tus legisladores | HXNF",
    description: "Tu voz llega al Congreso. Campaña de Hackers x Nuestro Futuro.",
    url: "https://nuestrofuturo.mx/hxnf/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white font-parkinsans min-h-screen">
        {children}
      </body>
    </html>
  );
}
