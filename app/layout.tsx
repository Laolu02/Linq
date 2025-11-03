import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/utils/providers/NextAuth";
import Navbar from "@/components/Navbar";
import { SocketProvider } from "@/utils/Socket";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linq",
  description: "Phase out the distance",
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
        <NextAuthProvider>
          <SocketProvider>
            <Navbar />
            <div className="w-[90%] m-auto overflow-x-hidden"> {children} </div>
          </SocketProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
