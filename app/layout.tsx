import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VH SMM Tracker",
  description: "SMM efforts tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

