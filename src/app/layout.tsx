import { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Heritage Monitor",
  description:
    "Visualize and predict the evolution of cultural heritage research across Europe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${ebGaramond.variable} ${inter.variable}`}>
      <head>
        <script>
          {`
            var _paq = window._paq = window._paq || [];
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="//kunstkosmos.de/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '3']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();
          `}
        </script>
      </head>
      <body className="flex h-[100dvh] flex-col">
        <AppRouterCacheProvider>
          <Providers>
            <main className="flex-1">{children}</main>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
