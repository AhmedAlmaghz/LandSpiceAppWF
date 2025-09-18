import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "نظام إدارة لاند سبايس",
  description: "نظام متكامل لإدارة تصنيع وتوزيع عبوات الشطة والكاتشب المخصصة للمطاعم",
  keywords: ["لاند سبايس", "مطاعم", "شطة", "كاتشب", "طباعة", "عبوات"],
  authors: [{ name: "LandSpice Team" }],
  creator: "LandSpice",
  publisher: "LandSpice",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic antialiased bg-gray-50 text-gray-900" suppressHydrationWarning={true}>
        <Providers>
          <div id="root">
            {children}
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
        </Providers>
      </body>
    </html>
  );
}
