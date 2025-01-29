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
      <body className="flex min-h-screen flex-col">
        <Navigation />
        {/* flex-1 */}
        <main className="md:pt-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
