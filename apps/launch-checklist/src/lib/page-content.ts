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
    title: 'Product Launch Checklist - Free Launch Planning Tool',
    description: 'Comprehensive launch checklists for SaaS, mobile apps, open source projects, and marketplaces. Track your progress and never miss a critical launch task.',
    url: 'https://launch.tools.startvest.ai',
    content: `# Product Launch Checklist

Never miss a critical launch task. Comprehensive, interactive checklists for launching any product - from SaaS to mobile apps to open source projects.

## Choose Your Launch Type

### 1. SaaS Product Launch (~35 items)
Everything you need to launch a software-as-a-service product:
- Pre-launch: Branding, legal, pricing, technical setup
- Launch day: Announcements, monitoring, support readiness
- Post-launch: Feedback collection, iteration, marketing

### 2. Mobile App Launch (~30 items)
App Store and Play Store specific checklist:
- Store optimization, screenshots, descriptions
- Beta testing and soft launch
- Review management and ASO

### 3. Open Source Project Launch (~25 items)
Launch your open source project the right way:
- Documentation, README, contributing guidelines
- GitHub setup, CI/CD, package publishing
- Community building, announcement strategy

### 4. Marketplace/E-commerce Launch (~30 items)
Two-sided marketplace or e-commerce launch:
- Seller/buyer onboarding
- Payment processing, legal compliance
- Inventory, fulfillment, support

## Features

- **Interactive Checkboxes**: Track progress in real-time
- **Progress Percentage**: See how close you are to launch-ready
- **Critical Items Highlighted**: Never miss the must-haves
- **Shareable URLs**: Share your progress with your team
- **Export Options**: Download as Markdown or print to PDF
- **Notes**: Add context to any item

## How It Works

1. Select your launch type (SaaS, Mobile, Open Source, or Marketplace)
2. Go through each section and check off completed items
3. Add notes where needed
4. Share the URL with your team to collaborate
5. Export when done for your records

## Why Use a Launch Checklist?

Launching is stressful. Things get forgotten. A checklist ensures:
- You don't miss critical legal or compliance items
- Your team is aligned on what's done and what's left
- You can track progress objectively
- Post-launch, you have a record of what was done

## Want to Track Your Launch Metrics?

Once you've launched, track how it's going with [IdeaLift](https://idealift.startvest.ai) - collect user feedback, track satisfaction, and iterate based on real data.

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
