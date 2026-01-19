import { NextRequest, NextResponse } from 'next/server';
import { getPageContent, toMarkdown } from '@/lib/page-content';

/**
 * API endpoint for fetching page content in various formats.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  const formatParam = searchParams.get('format');

  const content = getPageContent(path);

  if (!content) {
    return NextResponse.json(
      { error: 'Page not found' },
      { status: 404 }
    );
  }

  const acceptHeader = request.headers.get('accept') || '';
  let format = formatParam;

  if (!format) {
    if (acceptHeader.includes('text/markdown')) {
      format = 'markdown';
    } else if (acceptHeader.includes('application/json')) {
      format = 'json';
    } else if (acceptHeader.includes('text/plain')) {
      format = 'plain';
    } else {
      format = 'json';
    }
  }

  const cacheHeaders = {
    'Cache-Control': 'public, max-age=3600',
  };

  switch (format) {
    case 'markdown':
      return new NextResponse(toMarkdown(content), {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          ...cacheHeaders,
        },
      });

    case 'plain':
      const plainText = `${content.title}\n\n${content.description}\n\n${content.content.replace(/[#*`\[\]]/g, '')}`;
      return new NextResponse(plainText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...cacheHeaders,
        },
      });

    case 'json':
    default:
      return NextResponse.json({
        ...content,
        markdown: toMarkdown(content),
      }, {
        headers: cacheHeaders,
      });
  }
}
