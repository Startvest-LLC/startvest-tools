import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';
import { PageViewTracker } from '@/components/PageViewTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Release Notes Generator - Create Beautiful Changelogs',
  description: 'Generate professional release notes from your commits, PRs, and manual entries. Export to Markdown, HTML, or copy to clipboard.',
  keywords: 'release notes,changelog,git commits,pull requests,version history,software releases',
  metadataBase: new URL('https://releasenotes.tools.startvest.ai'),
  alternates: {
    types: {
      'text/markdown': '/.md',
    },
  },
  other: {
    'ai-content-declaration': 'This page is available in markdown format at /.md',
  },
  openGraph: {
    title: 'Release Notes Generator - Create Beautiful Changelogs',
    description: 'Generate professional release notes instantly. Categorize changes, format beautifully, export anywhere.',
    url: 'https://releasenotes.tools.startvest.ai',
    type: 'website',
    siteName: 'StartVest.ai Tools',
  },
  twitter: {
    card: 'summary',
    title: 'Release Notes Generator - Create Beautiful Changelogs',
    description: 'Generate professional release notes instantly. Categorize changes, format beautifully, export anywhere.',
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
