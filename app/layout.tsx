import type { Metadata } from "next";
// 1. Importamos las fuentes de Google
import { Ubuntu, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// 2. Configuramos Ubuntu (Cuerpo)
const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu", // Variable CSS para Tailwind
});

// 3. Configuramos IBM (Subtítulos)
const ibm = IBM_Plex_Sans({
  weight: ["700"], // Solo Bold como pediste
  subsets: ["latin"],
  variable: "--font-ibm",
});

export const metadata: Metadata = {
  title: "MiCultivo - Ojitos Rojos",
  description: "App de seguimiento de cultivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* 4. Inyectamos las variables en el Body */}
      <body className={`${ubuntu.variable} ${ibm.variable} antialiased bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}