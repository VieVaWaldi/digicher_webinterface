import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "core/components/navigation/Navigation";
import { Footer } from "core/components/navigation/Footer";

export const metadata: Metadata = {
  title: "DIGICHER Map",
  description: "Digitial Cultural Heritage Map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-[100dvh] flex-col">
        <Navigation />
        <main className="flex-1 md:pt-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
