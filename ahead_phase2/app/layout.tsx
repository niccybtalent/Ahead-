import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahead — Build the skills that matter next",
  description: "Personalised 10-week AI-native career development, built around where you are and where you want to go.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
