import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tristas Treats",
  description: "Custom cakes, cupcakes, cookies, and a private owner workspace for Tristas Treats."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
