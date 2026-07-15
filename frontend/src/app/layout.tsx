import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WEBAPP-NAIL",
  description: "Nail salon web application foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
