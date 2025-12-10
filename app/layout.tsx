import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ¡ESTA LÍNEA ES LA QUE CONECTA LOS ESTILOS!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MiCultivo",
  description: "App de seguimiento de cultivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}