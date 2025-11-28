import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./shop/cart-context";
import { NavigationHeader } from "@/components/navigation-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Release Campaigns | Support Artists",
  description: "Support independent artists launching albums, EPs, and singles. Get exclusive merchandise through our Printify integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <NavigationHeader />
          <main className="pt-20">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
