import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Step Out",
  description: "A short outdoor break around your real life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
