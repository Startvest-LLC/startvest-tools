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
    title: 'Roadmap Planner - Visual Product Roadmap Builder',
    description: 'Create beautiful product roadmaps in minutes. Plan features, organize by quarters, and export to share with your team.',
    url: 'https://roadmap.tools.startvest.ai',
    content: `# Roadmap Planner

Create beautiful, shareable product roadmaps in minutes. Free visual roadmap builder with export options.

## What This Tool Does

Build product roadmaps that show:
- **Timeline View**: Quarters or months layout
- **Feature Cards**: Draggable feature items
- **Status Indicators**: Planned, In Progress, Complete
- **Categories**: Group features by theme or team
- **Dependencies**: Show feature relationships

## How to Use

1. **Set your timeline**: Choose quarters or months
2. **Add features**: Create cards for each feature
3. **Organize**: Drag features to the right time slot
4. **Categorize**: Group by theme, team, or priority
5. **Export**: Download as PNG or Markdown

## Roadmap Best Practices

### DO
- Focus on outcomes, not features
- Use themes instead of specific solutions
- Leave room for discovery
- Update regularly
- Share widely

### DON'T
- Promise exact dates for everything
- Include every small task
- Set it and forget it
- Keep it secret from the team

## Roadmap Types

### Timeline Roadmap
Best for: External stakeholders, board presentations
- Shows features on a calendar
- Clear visual of what's coming when
- Good for setting expectations

### Now/Next/Later Roadmap
Best for: Agile teams, uncertain timelines
- Now: Currently working on
- Next: Coming soon
- Later: On the horizon
- Flexible, no date commitments

### Goal-Oriented Roadmap
Best for: Outcome-focused teams
- Organized by objectives
- Features support goals
- Measures success by metrics

## Roadmap Template

### Q1 - Foundation
- [ ] Core infrastructure
- [ ] User authentication
- [ ] Basic analytics

### Q2 - Growth
- [ ] Collaboration features
- [ ] Integrations
- [ ] Mobile app

### Q3 - Scale
- [ ] Enterprise features
- [ ] API platform
- [ ] Advanced analytics

### Q4 - Expansion
- [ ] New markets
- [ ] Partner ecosystem
- [ ] AI features

## Tips for Effective Roadmaps

1. **Start with goals** - What outcomes do you want?
2. **Involve the team** - Get buy-in early
3. **Be flexible** - Plans change, roadmaps should too
4. **Communicate context** - Why these priorities?
5. **Review quarterly** - Keep it fresh

## Common Roadmap Mistakes

| Mistake | Better Approach |
|---------|-----------------|
| Too detailed | Focus on themes |
| Fixed dates | Use timeframes |
| No updates | Review monthly |
| Feature-focused | Outcome-focused |
| Top-down only | Include team input |

---

**Built by [StartVest](https://startvest.ai)** - Tools for founders who ship.

Validate roadmap ideas with [IdeaLift](https://idealift.startvest.ai).
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
