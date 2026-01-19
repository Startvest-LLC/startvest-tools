import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from './GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'User Persona Generator - Create Detailed User Personas',
  description: 'Build detailed user personas for your product. Define demographics, goals, pain points, and behaviors. Export to Markdown or print.',
  keywords: 'user persona,persona generator,user research,product design,UX research,customer persona',
  metadataBase: new URL('https://persona.tools.startvest.ai'),
  alternates: {
    types: {
      'text/markdown': '/.md',
    },
  },
  other: {
    'ai-content-declaration': 'This page is available in markdown format at /.md',
  },
  openGraph: {
    title: 'User Persona Generator - Create Detailed User Personas',
    description: 'Build detailed user personas in minutes. Export to Markdown or print.',
    url: 'https://persona.tools.startvest.ai',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}><GoogleAnalytics />{children}</body>
    </html>
  );
}
