import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';
import { PageViewTracker } from '@/components/PageViewTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Feature Prioritization Matrix - RICE Score Calculator',
  description:
    'Prioritize your product features using the RICE framework. Score Reach, Impact, Confidence, and Effort to find your quick wins and big bets.',
  keywords: [
    'feature prioritization',
    'RICE score',
    'product management',
    'prioritization matrix',
    'product roadmap',
    'feature scoring',
  ],
  openGraph: {
    title: 'Feature Prioritization Matrix - RICE Score Calculator',
    description: 'Prioritize features using RICE scoring. Find quick wins and big bets instantly.',
    type: 'website',
    url: 'https://prioritize.startvest.ai',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}><GoogleAnalytics />
        <PageViewTracker />{children}</body>
    </html>
  );
}
