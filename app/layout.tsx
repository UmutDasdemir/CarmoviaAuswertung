import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Carmovia Customer Intelligence',
  description:
    'Monatliche Kundenentwicklung nach Aufträgen, Umsatz und Marge.',
  openGraph: {
    title: 'Carmovia Customer Intelligence',
    description: 'Kundenaktivität, Umsatz und Marge im Monatsvergleich.',
    images: [
      {
        url: 'https://umutdasdemir.github.io/CarmoviaAuswertung/og.png',
        width: 1200,
        height: 630,
        alt: 'Carmovia Customer Intelligence Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carmovia Customer Intelligence',
    description: 'Kundenaktivität, Umsatz und Marge im Monatsvergleich.',
    images: ['https://umutdasdemir.github.io/CarmoviaAuswertung/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
