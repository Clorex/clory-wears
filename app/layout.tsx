import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk, Manrope } from "next/font/google";
import Providers from "./providers";

const heading = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-head",
  weight: ["400", "500", "600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CLORY WEARS — Premium Wears",
    template: "%s — CLORY WEARS",
  },
  description:
    "CLORY WEARS — premium trousers and shirts. Shop, pay via transfer, upload receipt and get your order confirmed.",
  metadataBase: new URL("https://clory-wears.vercel.app"),
  openGraph: {
    title: "CLORY WEARS",
    description:
      "Premium trousers and shirts. Shop, pay via transfer, upload receipt and get your order confirmed.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}