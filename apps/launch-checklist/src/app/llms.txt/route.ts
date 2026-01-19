import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/page-content';

/**
 * llms.txt - A manifest file for AI crawlers (like robots.txt for LLMs)
 */
export async function GET() {
  const baseUrl = 'https://launch.tools.startvest.ai';
  const pages = getAllPages();

  const content = `# Product Launch Checklist - AI Content Manifest

> This file tells AI agents about available content in machine-readable formats.

## About This Site

Product Launch Checklist is a free tool that provides comprehensive, interactive checklists for launching products.
Supports SaaS, mobile apps, open source projects, and marketplaces with 25-35 actionable items per template.

## Available Content

The following pages are available in Markdown format for easier consumption:

${pages.map(({ path, content }) => `- [${content.title}](${baseUrl}${path === '/' ? '' : path}.md)
  ${content.description}`).join('\n\n')}

## How to Access Markdown Content

1. **URL suffix**: Append \`.md\` to any page URL (e.g., ${baseUrl}/.md)
2. **Accept header**: Request with \`Accept: text/markdown\` header
3. **Direct API**: Use \`${baseUrl}/api/content?path=/\` for JSON with markdown

## Content Negotiation

This site supports content negotiation. AI agents can request:
- \`text/markdown\` - Clean markdown with YAML frontmatter
- \`text/plain\` - Plain text version
- \`application/json\` - Structured JSON with metadata

## Contact

Built by StartVest - https://startvest.ai
For questions about AI access: hello@startvest.ai

## Related Tools

- IdeaLift (https://idealift.startvest.ai) - Full idea validation platform
- Roast My Startup Idea (https://roast.startvest.ai) - Get your startup idea roasted
- More free tools at https://startvest.ai/tools
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
