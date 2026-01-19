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
    title: 'User Persona Generator - Create Detailed User Personas',
    description: 'Build detailed user personas for your product. Define demographics, goals, pain points, and behaviors. Export to Markdown or print.',
    url: 'https://persona.tools.startvest.ai',
    content: `# User Persona Generator

Create detailed, actionable user personas for your product in minutes. Free tool with export options.

## What This Tool Does

Build comprehensive user personas that include:
- **Demographics**: Age, location, job title, income
- **Goals & Motivations**: What drives them
- **Pain Points**: Frustrations and challenges
- **Behaviors**: How they discover and use products
- **Preferred Channels**: Where to reach them

## How to Use

1. **Start with basics**: Name, photo, demographics
2. **Define context**: Industry, company size, role
3. **Add motivations**: Goals, needs, desires
4. **Identify pain points**: Frustrations, obstacles
5. **Map behaviors**: Daily workflow, tool usage
6. **Export**: Download as Markdown or print

## Why User Personas Matter

Good personas help you:
- **Focus development** on real user needs
- **Align teams** around who you're building for
- **Improve marketing** with targeted messaging
- **Make decisions** based on user context, not assumptions

## Persona Template Structure

### Basic Information
- Name (make it memorable)
- Photo (humanizes the persona)
- Age range
- Job title
- Location
- Education level

### Professional Context
- Industry
- Company size
- Years of experience
- Reporting structure
- Key responsibilities

### Goals & Motivations
- Primary goal (what they want to achieve)
- Secondary goals
- Success metrics
- Career aspirations

### Pain Points & Challenges
- Current frustrations
- Obstacles to goals
- Time wasters
- Tool limitations

### Behavior Patterns
- Typical day workflow
- Tool preferences
- Information sources
- Decision-making style

### Communication Preferences
- Preferred channels (email, Slack, etc.)
- Best times to reach
- Content format preferences

## Tips for Better Personas

1. **Base on real data** - Interviews, surveys, analytics
2. **Be specific** - "Sarah, 34, Product Manager" not "Users"
3. **Focus on behaviors** - Actions matter more than demographics
4. **Keep it actionable** - If it doesn't inform decisions, remove it
5. **Update regularly** - Personas evolve as your market changes

---

**Built by [StartVest](https://startvest.ai)** - Tools for founders who ship.

Validate your product ideas with [IdeaLift](https://idealift.startvest.ai).
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
