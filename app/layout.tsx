import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

const body = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const display = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KEYBER — Simulation de décision professionnelle",
  description:
    "Plateforme de simulation de décision : compétences, histoire, ERP, atelier live et brouillard de données.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${body.variable} ${display.variable} font-sans antialiased`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
