import type { Metadata } from "next";
import Script from "next/script";
import { League_Gothic, Rajdhani } from "next/font/google";
import CustomCursor from "@/components/ui/page-ui/cursor";
import ClientLayout from "@/components/ui/page-ui/client-layout";
import "./globals.css";

const leagueGothic = League_Gothic({
  subsets: ["latin"],
  variable: "--font-league-gothic",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Home | Portfolio",
  description: "Portfolio by Raven Luke Quinto",
  icons: {
    icon: "/assets/misc/portfolio-icon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Flash prevention: apply dark class before first paint ── */}
        <Script id="theme-flash" strategy="beforeInteractive">
          {`(function() {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          })();`}
        </Script>
        {/* ── Figma-scale viewport calibration ── */}
        <Script id="figma-scale" strategy="beforeInteractive">
          {`(function() {
            var w = document.documentElement;
            function update() {
              w.style.setProperty('--figma-scale-w', (window.innerWidth / 1728).toFixed(4));
              w.style.setProperty('--figma-scale-h', (window.innerHeight / 1117).toFixed(4));
            }
            update();
            window.addEventListener('resize', update);
          })();`}
        </Script>
      </head>
      <body className={`${leagueGothic.variable} ${rajdhani.variable}`}>
        <ClientLayout>
          {children}
          <CustomCursor />
        </ClientLayout>
      </body>
    </html>
  );
}
