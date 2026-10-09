import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultra Buddy",
  description: "Your running and health coaching companion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="brand"><span className="brand-mark" aria-hidden="true">u.</span> Ultra Buddy</header>
        <main>{children}</main>
      </body>
    </html>
  );
}
