import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
