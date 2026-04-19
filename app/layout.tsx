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
    // suppressHydrationWarning: the blocking script below sets .dark before React
    // hydrates, so the server-rendered class won't match the client — this suppresses
    // the benign mismatch warning.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script — sets .dark before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased">
        <CrosshairCursor />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
