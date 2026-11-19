import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./responsive.css";
import "./money-miniatures.css";
import "./cash-horizontal.css";
import "./tracking.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://egawo.vercel.app"),
  title: "EGA | Ensemble, on va plus loin.",
  description: "La tontine digitale pensée pour le Togo : cotisations, bénéficiaires et suivi collectif en francs CFA.",
  icons: { icon: "/images/ega-logo.jpg", apple: "/images/ega-logo.jpg" },
  openGraph: {
    title: "EGA | Ensemble, on va plus loin.",
    description: "La tontine digitale pensée pour le Togo, transparente et sécurisée.",
    url: "https://egawo.vercel.app",
    siteName: "EGA",
    locale: "fr_TG",
    type: "website",
    images: [{ url: "/images/ega-social-preview.jpg", width: 1254, height: 1254, alt: "Logo EGA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EGA | Ensemble, on va plus loin.",
    description: "La tontine digitale pensée pour le Togo.",
    images: ["/images/ega-social-preview.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className={inter.variable}>{children}</body></html>;
}
