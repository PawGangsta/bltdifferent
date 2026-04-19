import type { Metadata } from "next";
import "./globals.css";
import { CrosshairCursor } from "@/components/CrosshairCursor";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BLT DFRNT — Reality By Design",
  description: "Design studio. Strategy, branding, products, and digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CrosshairCursor />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
