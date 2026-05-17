import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { MuiAppRegistry } from "@/app/mui-registry";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-headline",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow Board — Game Tasks",
    template: "%s — Game Tasks",
  },
  description: "Monthly sprint boards for game task tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${hankenGrotesk.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
        <MuiAppRegistry>{children}</MuiAppRegistry>
      </body>
    </html>
  );
}
