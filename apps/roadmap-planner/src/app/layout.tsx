import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Roadmap Planner - Visual Product Roadmap Builder',
  description: 'Create beautiful product roadmaps in minutes. Plan features, organize by quarters, and export to share with your team.',
  keywords: 'roadmap,product roadmap,roadmap planner,product planning,feature roadmap,release planning',
  metadataBase: new URL('https://roadmap.tools.startvest.ai'),
  alternates: {
    types: {
      'text/markdown': '/.md',
    },
  },
  other: {
    'ai-content-declaration': 'This page is available in markdown format at /.md',
  },
  openGraph: {
    title: 'Roadmap Planner - Visual Product Roadmap Builder',
    description: 'Create beautiful product roadmaps in minutes. Export to PNG or Markdown.',
    url: 'https://roadmap.tools.startvest.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Roadmap Planner - Visual Product Roadmap Builder',
    description: 'Create beautiful product roadmaps in minutes. Export to PNG or Markdown.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}><GoogleAnalytics />{children}</body>
    </html>
  );
}
