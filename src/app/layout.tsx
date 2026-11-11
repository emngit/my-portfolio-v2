import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { MusicProvider } from "@/components/MusicSection";
import { PortalTransitionProvider } from "@/components/PortalTransition";

export const metadata: Metadata = {
  title: "BastaEmmani — Application Developer",
  description:
    "Portfolio of John Developer — Full Stack Engineer specializing in modern web applications, AI-powered solutions, cloud systems, and enterprise-grade platforms.",
  icons: { icon: "/mylogo-face-default.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/roobert" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/pp-neue-montreal" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" />
      </head>
      <body className="antialiased">
        <MusicProvider>
          <PortalTransitionProvider>
            <Navbar />
            {children}
          </PortalTransitionProvider>
        </MusicProvider>
      </body>
    </html>
  );
}
