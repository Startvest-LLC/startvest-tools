import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';
import { PageViewTracker } from '@/components/PageViewTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Product Launch Checklist - Free Launch Planning Tool',
  description: 'Comprehensive launch checklists for SaaS, mobile apps, open source projects, and marketplaces. Track your progress and never miss a critical launch task.',
  keywords: 'product launch checklist,saas launch,startup launch,product launch planning,launch day checklist,go to market checklist',
  metadataBase: new URL('https://launch.tools.startvest.ai'),
  alternates: {
    types: {
      'text/markdown': '/.md',
    },
  },
  other: {
    'ai-content-declaration': 'This page is available in markdown format at /.md',
  },
  openGraph: {
    title: 'Product Launch Checklist - Free Launch Planning Tool',
    description: 'Comprehensive launch checklists for SaaS, mobile apps, open source projects, and marketplaces.',
    url: 'https://launch.tools.startvest.ai',
    type: 'website',
    siteName: 'StartVest.ai Tools',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Product Launch Checklist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Launch Checklist',
    description: 'Comprehensive launch checklists for SaaS, mobile apps, and more',
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
      <body className={inter.className}>
        <GoogleAnalytics />
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
