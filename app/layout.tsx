import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spirit Board - Ghost in the Machine",
  description: "A spooky AI experience running entirely in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Yeh line Tailwind CSS ko wapas chalu kar degi bina build error ke */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}