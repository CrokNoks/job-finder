import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Finder - Recherche d\'emploi intelligente',
  description: 'Trouvez votre prochain job sur LinkedIn, Indeed et Welcome to the Jungle',
  keywords: ['emploi', 'recherche job', 'linkedin', 'indeed', 'technologies'],
  authors: [{ name: 'Job Finder' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#2563eb',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Job Finder',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://job-finder.vercel.app',
    title: 'Job Finder - Recherche d\'emploi intelligente',
    description: 'Trouvez votre prochain job sur LinkedIn, Indeed et Welcome to the Jungle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Finder - Recherche d\'emploi intelligente',
    description: 'Trouvez votre prochain job sur LinkedIn, Indeed et Welcome to the Jungle',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="Job Finder" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Job Finder" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}