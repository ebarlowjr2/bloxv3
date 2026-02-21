import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLOX - AI CEO Dashboard",
  description: "B.L.O.X. (Barlow Logic Operations Executive) intelligent business automation agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
