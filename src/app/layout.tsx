import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظام إدارة لاند سبايس",
  description: "نظام متكامل لإدارة تصنيع وتوزيع عبوات الشطة والكاتشب المخصصة للمطاعم",
  keywords: ["لاند سبايس", "مطاعم", "شطة", "كاتشب", "طباعة", "عبوات"],
  authors: [{ name: "LandSpice Team" }],
  creator: "LandSpice",
  publisher: "LandSpice",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased bg-gray-50 text-gray-900`}>
        <div id="root">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}
