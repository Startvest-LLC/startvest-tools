import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';
import { PageViewTracker } from '@/components/PageViewTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Free PRD Template & Generator - Create Product Requirements Documents',
  description: 'Instantly generate a Product Requirements Document you can share with engineers, designers, and stakeholders. Free PRD template with export to Markdown or HTML.',
  keywords: 'PRD template,PRD generator,product requirements document,PRD example,functional requirements,success metrics PRD,product management,feature specification',
  openGraph: {
    title: 'Free PRD Template & Generator',
    description: 'Instantly generate a Product Requirements Document you can share with engineers, designers, and stakeholders.',
    url: 'https://prd.tools.startvest.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Free PRD Template & Generator',
    description: 'Instantly generate a Product Requirements Document you can share with engineers, designers, and stakeholders.',
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
