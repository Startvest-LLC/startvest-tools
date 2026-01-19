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
    title: 'Startup Runway Calculator - Calculate Your Cash Runway',
    description: 'Free startup runway calculator. Calculate how long your funding will last based on burn rate, revenue, and growth projections. Visualize your runway and plan your next fundraise.',
    url: 'https://runway.tools.startvest.ai',
    content: `# Startup Runway Calculator

Calculate exactly how long your funding will last. Free, interactive runway calculator for startups.

## What This Calculator Does

Enter your financial data and instantly see:
- **Months of Runway**: How long until you run out of cash
- **Runway Chart**: Visual projection of your cash over time
- **Break-even Point**: When (or if) revenue will cover expenses
- **Key Recommendations**: What to focus on based on your runway

## How to Use

### Input Your Numbers

1. **Current Cash**: Total cash in the bank right now
2. **Monthly Burn Rate**: Total monthly expenses (salaries, rent, software, etc.)
3. **Monthly Revenue**: Current monthly recurring revenue (MRR)
4. **Revenue Growth Rate**: Expected month-over-month revenue growth (%)

### Understand Your Results

- **Green Zone (12+ months)**: Healthy runway - focus on growth
- **Yellow Zone (6-12 months)**: Start planning your next raise
- **Red Zone (<6 months)**: Urgent - cut costs or raise immediately

## Key Formulas

**Basic Runway** (no revenue):
\`\`\`
Runway = Current Cash / Monthly Burn Rate
\`\`\`

**Runway with Revenue**:
\`\`\`
Runway = Time until Cash + Cumulative Revenue = Cumulative Burn
\`\`\`

## Tips for Extending Runway

1. **Reduce burn** - Cut non-essential expenses
2. **Accelerate revenue** - Focus on sales and retention
3. **Raise capital** - Start fundraising at 6+ months runway
4. **Bridge financing** - Consider convertible notes for short-term needs

## Why Runway Matters

Running out of cash is the #1 reason startups fail. Knowing your runway lets you:
- Make informed hiring decisions
- Time your fundraise correctly
- Prioritize revenue-generating activities
- Avoid panic decisions

---

**Built by [StartVest](https://startvest.ai)** - Tools for founders who ship.

Track your idea validation with [IdeaLift](https://idealift.startvest.ai) - from idea to launch.
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
