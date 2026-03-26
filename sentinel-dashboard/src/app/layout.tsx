import "./globals.css"; // THIS LINE MUST BE HERE
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sentinel Dashboard",
  description: "URL Attack Detection System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}