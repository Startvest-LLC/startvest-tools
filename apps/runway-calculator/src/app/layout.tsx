import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';
import { PageViewTracker } from '@/components/PageViewTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Startup Runway Calculator - Calculate Your Cash Runway',
  description: 'Free startup runway calculator. Calculate how long your funding will last based on burn rate, revenue, and growth projections. Visualize your runway and plan your next fundraise.',
  keywords: 'startup runway calculator,burn rate calculator,cash runway,startup funding,runway planning,fundraising timeline',
  metadataBase: new URL('https://runway.startvest.ai'),
  openGraph: {
    title: 'Startup Runway Calculator - Calculate Your Cash Runway',
    description: 'Free startup runway calculator. Calculate how long your funding will last based on burn rate, revenue, and growth projections.',
    type: 'website',
    url: 'https://runway.startvest.ai',
    siteName: 'Startup Runway Calculator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Startup Runway Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Startup Runway Calculator - Calculate Your Cash Runway',
    description: 'Free startup runway calculator. Calculate how long your funding will last based on burn rate, revenue, and growth projections.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}><GoogleAnalytics />
        <PageViewTracker />{children}</body>
    </html>
  );
}
