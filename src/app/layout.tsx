import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "aadvxe's Portfolio",
  description: "aadvxe's Personal Portfolio",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aadvxe.vercel.app"),
  icons: {
    icon: "/apple-tech-emoji.png",
    shortcut: "/apple-tech-emoji.png",
    apple: "/apple-tech-emoji.png",
  },
  openGraph: {
    title: "aadvxe's Portfolio",
    description: "aadvxe's Personal Portfolio",
    url: "https://aadvxe.vercel.app",
    siteName: "aadvxe's Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aadvxe's Portfolio",
    description: "aadvxe's Personal Portfolio",
    creator: "@aadvxe",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "resizes-content",
  themeColor: "#efece3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSerif.variable} ${archivo.variable} ${plexMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
