import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JohnDev — Full Stack Engineer",
  description:
    "Portfolio of John Developer — Full Stack Engineer specializing in modern web applications, AI-powered solutions, cloud systems, and enterprise-grade platforms.",
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
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
