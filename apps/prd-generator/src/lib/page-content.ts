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
    title: 'Free PRD Template & Generator - Create Product Requirements Documents',
    description: 'Instantly generate a Product Requirements Document you can share with engineers, designers, and stakeholders. Free PRD template with export to Markdown or HTML.',
    url: 'https://prd.tools.startvest.ai',
    content: `# PRD Generator

Create professional Product Requirements Documents in minutes. Free template with export options.

## What This Tool Does

Generate complete PRDs that include:
- **Problem Statement**: What problem are you solving?
- **Goals & Success Metrics**: How will you measure success?
- **User Stories**: Who benefits and how?
- **Functional Requirements**: What the product must do
- **Non-Functional Requirements**: Performance, security, scalability
- **Timeline & Milestones**: Key dates and deliverables

## PRD Template Structure

### 1. Overview
- Product name
- Document version
- Author and stakeholders
- Last updated date

### 2. Problem Statement
- What problem exists today?
- Who experiences this problem?
- What's the impact of not solving it?
- Current workarounds

### 3. Goals & Objectives
- Primary goal
- Secondary goals
- Non-goals (explicitly out of scope)
- Success metrics (KPIs)

### 4. User Stories
\`\`\`
As a [user type],
I want to [action],
So that [benefit].
\`\`\`

### 5. Functional Requirements
- Must-have features (P0)
- Should-have features (P1)
- Nice-to-have features (P2)

### 6. Non-Functional Requirements
- Performance (response times, throughput)
- Security (authentication, data protection)
- Scalability (user capacity, data volume)
- Accessibility (WCAG compliance)

### 7. Technical Considerations
- System dependencies
- Integration points
- Data requirements
- Infrastructure needs

### 8. Design Requirements
- User experience principles
- Branding guidelines
- Mockups/wireframes (links)

### 9. Timeline
- Phase 1: Discovery & Design
- Phase 2: Development
- Phase 3: Testing
- Phase 4: Launch

### 10. Risks & Mitigation
- Technical risks
- Resource risks
- Market risks
- Mitigation strategies

## How to Use This Tool

1. **Fill in sections**: Complete each section of the template
2. **Add user stories**: Define who benefits and how
3. **Set requirements**: List must-haves vs nice-to-haves
4. **Define metrics**: How will you measure success?
5. **Export**: Download as Markdown or HTML

## Tips for Writing Great PRDs

1. **Be specific** - "Fast" isn't a requirement, "<200ms response time" is
2. **Include non-goals** - Explicitly state what's out of scope
3. **Use user stories** - Keep the user perspective central
4. **Add acceptance criteria** - How do you know when it's done?
5. **Keep it living** - Update as you learn more

## PRD vs Other Documents

| Document | Purpose |
|----------|---------|
| PRD | What to build and why |
| Technical Spec | How to build it |
| Design Doc | UX/UI details |
| Project Plan | Timeline and resources |

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
