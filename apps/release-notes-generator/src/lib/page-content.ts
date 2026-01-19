/**
 * Page content for AI crawlers and markdown endpoints.
 * This defines the clean, structured content that AI agents can consume.
 */

export interface PageContent {
  title: string;
  description: string;
  url: string;
  content: string;
  lastModified?: string;
}

export const PAGE_CONTENT: Record<string, PageContent> = {
  '/': {
    title: 'Release Notes Generator - Create Beautiful Changelogs',
    description: 'Generate professional release notes from your commits, PRs, and manual entries. Export to Markdown, HTML, or copy to clipboard.',
    url: 'https://releasenotes.tools.startvest.ai',
    content: `# Release Notes Generator

Create beautiful, professional release notes in seconds. Categorize your changes and export to Markdown or HTML.

## Features

- **Easy Entry Management**: Add changes manually or bulk import from commit messages
- **Smart Categorization**: Organize by type - features, fixes, breaking changes, security, docs, and more
- **Auto-Detection**: Automatically detects change types from conventional commit prefixes (feat:, fix:, etc.)
- **Multiple Export Formats**: Copy or download as Markdown or HTML
- **PR/Issue Linking**: Include PR numbers and author attribution
- **Live Preview**: See your formatted release notes as you build them

## How It Works

### 1. Set Version Info
Enter your version number, release date, and optional title.

### 2. Add Entries
Add changes one by one or bulk import from your commit log:
- **New Feature** - New functionality added
- **Bug Fix** - Something that was broken is now fixed
- **Improvement** - Enhancements to existing features
- **Breaking Change** - Changes that require user action
- **Security** - Security-related updates
- **Deprecated** - Features marked for removal
- **Documentation** - Docs updates
- **Other** - Everything else

### 3. Export
- **Copy Markdown** - For GitHub releases, docs sites
- **Download .md** - Save as a file
- **Copy HTML** - For websites, emails
- **Download .html** - Standalone HTML page

## Conventional Commit Support

Bulk import automatically detects these prefixes:
- \`feat:\` → New Feature
- \`fix:\` / \`bug:\` → Bug Fix
- \`improve:\` / \`perf:\` / \`refactor:\` → Improvement
- \`breaking:\` / \`break:\` → Breaking Change
- \`security:\` / \`sec:\` → Security
- \`docs:\` / \`doc:\` → Documentation
- \`deprecate:\` → Deprecated

## Example Output

\`\`\`markdown
# January 2025 Release

**Version:** 2.1.0
**Date:** January 15, 2025

## New Features
- Add dark mode support (#142) - @johndoe
- Implement real-time collaboration features (#138)

## Bug Fixes
- Fix memory leak in dashboard component (#145) - @janesmith
- Resolve authentication timeout issues (#143)
\`\`\`

## Want Automated Release Notes?

Try [Changelog AI](https://changelog.startvest.ai) - automatically generates beautiful release notes from your GitHub commits and PRs. No more manual copying!

---

**Built by [StartVest](https://startvest.ai)** - Tools for founders who ship.
`,
    lastModified: new Date().toISOString().split('T')[0],
  },
};

/**
 * Get page content by path
 */
export function getPageContent(path: string): PageContent | null {
  const normalizedPath = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return PAGE_CONTENT[normalizedPath] || null;
}

/**
 * Get all available pages for llms.txt
 */
export function getAllPages(): { path: string; content: PageContent }[] {
  return Object.entries(PAGE_CONTENT).map(([path, content]) => ({
    path,
    content,
  }));
}

/**
 * Convert page content to markdown with frontmatter
 */
export function toMarkdown(content: PageContent): string {
  const frontmatter = `---
title: ${content.title}
description: ${content.description}
url: ${content.url}
lastModified: ${content.lastModified || new Date().toISOString().split('T')[0]}
---

`;
  return frontmatter + content.content;
}
