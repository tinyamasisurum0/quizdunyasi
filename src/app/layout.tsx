import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz Dünyası",
  description: "Bilgini test et, eğlenceye dal!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-pink-500 to-teal-500 text-white flex flex-col">
          <main className="container mx-auto px-4 py-8 flex-grow">
            {children}
          </main>
          <footer className="container mx-auto px-4 py-4 text-center text-white/70">
            <div className="flex justify-center space-x-4">
              <Link href="/admin" className="hover:text-white transition-colors duration-300">
                Admin
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
