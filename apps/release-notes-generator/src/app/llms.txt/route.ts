import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/page-content';

/**
 * llms.txt - A manifest file for AI crawlers (like robots.txt for LLMs)
 */
export async function GET() {
  const baseUrl = 'https://releasenotes.tools.startvest.ai';
  const pages = getAllPages();

  const content = `# Release Notes Generator - AI Content Manifest

> This file tells AI agents about available content in machine-readable formats.

## About This Site

Release Notes Generator is a free tool that helps developers create beautiful, professional release notes.
Categorize your changes (features, fixes, breaking changes, etc.) and export to Markdown or HTML.

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
- Changelog AI (https://changelog.startvest.ai) - Automated changelog generation from GitHub
- More free tools at https://startvest.ai/tools
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
