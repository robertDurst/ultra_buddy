import type { Metadata } from "next";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultra Buddy",
  description: "Your running and health coaching companion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="brand">
          <a className="brand-logo" href="https://brickellresearch.org/" aria-label="Brickell Research home">
            <img src="/brickell-research.png" alt="Brickell Research" width="128" height="128" />
          </a>
          <a className="brand-title" href="/">Ultra Buddy</a>
          <p className="tagline">Running &amp; health coaching.</p>
        </header>
        <main>{children}</main>
        <footer><a href="https://brickellresearch.org/">Brickell Research</a></footer>
      </body>
    </html>
  );
}
