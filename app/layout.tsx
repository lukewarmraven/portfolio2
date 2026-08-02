import type { Metadata } from "next";
import { League_Gothic, Rajdhani } from "next/font/google";
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
  title: "Portfolio",
  description: "My portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${leagueGothic.variable} ${rajdhani.variable}`}>
        {children}
      </body>
    </html>
  );
}
