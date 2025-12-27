import type { Metadata, Viewport } from "next";
import { Ubuntu, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/app/context/ToastContext"; // <--- Importamos el Provider

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});

const ibm = IBM_Plex_Sans({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-ibm",
});

export const metadata: Metadata = {
  title: "Cultiva con Ojitos",
  description: "Gestión inteligente de cultivos",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${ubuntu.variable} ${ibm.variable} antialiased bg-[#0B0C10] text-slate-200`}>
        
        {/* Envolvemos la app en el ToastProvider */}
        <ToastProvider>
          {/* Contenedor principal */}
          <div className="pb-24 md:pb-0"> 
              {children}
          </div>

          {/* Navbar Flotante */}
          <BottomNav />
        </ToastProvider>
        
      </body>
    </html>
  );
}