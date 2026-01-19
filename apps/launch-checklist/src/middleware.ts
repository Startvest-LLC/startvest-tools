import { NextRequest, NextResponse } from 'next/server';
import { getPageContent, toMarkdown } from '@/lib/page-content';

/**
 * AI Bot User Agents
 */
const AI_BOT_PATTERNS = [
  'ClaudeBot',
  'Claude-Web',
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'Googlebot',
  'Bingbot',
  'PerplexityBot',
  'YouBot',
  'CCBot',
  'Amazonbot',
  'anthropic-ai',
  'cohere-ai',
  'FacebookBot',
  'Applebot',
];

function isAIBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return AI_BOT_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
}

function prefersMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/markdown');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Handle .md suffix requests
  if (pathname.endsWith('.md')) {
    const actualPath = pathname.slice(0, -3) || '/';

    const content = getPageContent(actualPath);
    if (content) {
      return new NextResponse(toMarkdown(content), {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Robots-Tag': 'noindex',
        },
      });
    }

    return NextResponse.redirect(new URL(actualPath, request.url));
  }

  // For AI bots requesting with Accept: text/markdown header
  if (isAIBot(userAgent) && prefersMarkdown(request)) {
    const content = getPageContent(pathname);
    if (content) {
      return new NextResponse(toMarkdown(content), {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|og-image.png|.*\\.).*)',
    '/.md',
    '/:path*.md',
  ],
};
