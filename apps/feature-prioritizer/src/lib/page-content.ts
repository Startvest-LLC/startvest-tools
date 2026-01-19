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
    title: 'Feature Prioritization Matrix - RICE Score Calculator',
    description: 'Prioritize your product features using the RICE framework. Score Reach, Impact, Confidence, and Effort to find your quick wins and big bets.',
    url: 'https://prioritize.tools.startvest.ai',
    content: `# Feature Prioritization Matrix

Prioritize your product backlog using the RICE scoring framework. Find quick wins and big bets instantly.

## What This Tool Does

Score and rank features based on:
- **Reach**: How many users will this affect?
- **Impact**: How much will it move the needle?
- **Confidence**: How sure are you of these estimates?
- **Effort**: How much work is required?

## The RICE Framework

RICE is a prioritization framework developed by Intercom. It helps teams make data-driven decisions about what to build next.

### RICE Formula

\`\`\`
RICE Score = (Reach × Impact × Confidence) / Effort
\`\`\`

### Scoring Guide

**Reach** (users per quarter)
- How many users will this feature affect in a given time period?
- Example: 1000 users per quarter

**Impact** (0.25 - 3)
- 3 = Massive impact
- 2 = High impact
- 1 = Medium impact
- 0.5 = Low impact
- 0.25 = Minimal impact

**Confidence** (percentage)
- 100% = High confidence (data-backed)
- 80% = Medium confidence (some data)
- 50% = Low confidence (gut feeling)

**Effort** (person-months)
- How many person-months of work?
- Include design, development, QA, launch

## Feature Categories

After scoring, features fall into four categories:

### Quick Wins (High Score, Low Effort)
- Do these first
- High impact, easy to ship
- Build momentum

### Big Bets (High Score, High Effort)
- Strategic investments
- Plan carefully
- Break into phases

### Fill-ins (Low Score, Low Effort)
- Do when you have spare capacity
- Nice-to-haves
- Polish items

### Money Pits (Low Score, High Effort)
- Avoid these
- Low return on investment
- Question why they're on the list

## How to Use This Tool

1. **Add features**: Enter your feature ideas
2. **Score each dimension**: Rate Reach, Impact, Confidence, Effort
3. **Review rankings**: See features sorted by RICE score
4. **Export**: Download prioritized list as Markdown

## Tips for Better Prioritization

1. **Use real data** for Reach when possible
2. **Be honest** about Confidence levels
3. **Include all effort** - design, dev, QA, docs
4. **Re-score quarterly** as conditions change
5. **Involve the team** for better estimates

## When to Use RICE vs Other Frameworks

| Framework | Best For |
|-----------|----------|
| RICE | Data-driven teams, quantifiable impact |
| MoSCoW | Stakeholder alignment, must-haves |
| Kano | User delight, differentiators |
| Value vs Effort | Quick decisions, small teams |

---

**Built by [StartVest](https://startvest.ai)** - Tools for founders who ship.

Track feature feedback with [IdeaLift](https://idealift.startvest.ai).
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
