'use client';

import { useState, useCallback } from 'react';
import { trackToolUse, trackExport } from '@/lib/analytics';

interface UserStory {
  id: string;
  persona: string;
  action: string;
  benefit: string;
}

interface Requirement {
  id: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
}

interface PRDData {
  title: string;
  version: string;
  author: string;
  date: string;
  status: 'draft' | 'review' | 'approved';
  overview: string;
  problem: string;
  goals: string[];
  targetUsers: string[];
  userStories: UserStory[];
  functionalRequirements: Requirement[];
  nonFunctionalRequirements: Requirement[];
  successMetrics: string[];
  outOfScope: string[];
  dependencies: string[];
  timeline: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const priorityLabels = {
  must: { label: 'Must Have', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  should: { label: 'Should Have', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  could: { label: 'Could Have', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  wont: { label: "Won't Have", color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

function generateMarkdown(prd: PRDData): string {
  let md = `# ${prd.title}\n\n`;
  md += `**Version:** ${prd.version}  \n`;
  md += `**Author:** ${prd.author}  \n`;
  md += `**Date:** ${prd.date}  \n`;
  md += `**Status:** ${prd.status.charAt(0).toUpperCase() + prd.status.slice(1)}\n\n`;
  md += `---\n\n`;

  md += `## 1. Overview\n\n${prd.overview || '_No overview provided._'}\n\n`;

  md += `## 2. Problem Statement\n\n${prd.problem || '_No problem statement provided._'}\n\n`;

  if (prd.goals.length > 0) {
    md += `## 3. Goals & Objectives\n\n`;
    prd.goals.forEach((goal, i) => {
      md += `${i + 1}. ${goal}\n`;
    });
    md += '\n';
  }

  if (prd.targetUsers.length > 0) {
    md += `## 4. Target Users\n\n`;
    prd.targetUsers.forEach(user => {
      md += `- ${user}\n`;
    });
    md += '\n';
  }

  if (prd.userStories.length > 0) {
    md += `## 5. User Stories (Optional)\n\n`;
    prd.userStories.forEach((story, i) => {
      md += `### US-${String(i + 1).padStart(3, '0')}\n`;
      md += `**As a** ${story.persona}, **I want to** ${story.action}, **so that** ${story.benefit}.\n\n`;
    });
  }

  if (prd.functionalRequirements.length > 0 || prd.nonFunctionalRequirements.length > 0) {
    md += `## 6. Functional & Non-Functional Requirements\n\n`;

    if (prd.functionalRequirements.length > 0) {
      md += `### Functional Requirements\n\n`;
      md += `| ID | Requirement | Priority |\n`;
      md += `|----|-------------|----------|\n`;
      prd.functionalRequirements.forEach((req, i) => {
        md += `| FR-${String(i + 1).padStart(3, '0')} | ${req.description} | ${priorityLabels[req.priority].label} |\n`;
      });
      md += '\n';
    }

    if (prd.nonFunctionalRequirements.length > 0) {
      md += `### Non-Functional Requirements\n\n`;
      md += `| ID | Requirement | Priority |\n`;
      md += `|----|-------------|----------|\n`;
      prd.nonFunctionalRequirements.forEach((req, i) => {
        md += `| NFR-${String(i + 1).padStart(3, '0')} | ${req.description} | ${priorityLabels[req.priority].label} |\n`;
      });
      md += '\n';
    }
  }

  if (prd.successMetrics.length > 0) {
    md += `## 7. Success Metrics & KPIs\n\n`;
    prd.successMetrics.forEach(metric => {
      md += `- ${metric}\n`;
    });
    md += '\n';
  }

  if (prd.outOfScope.length > 0) {
    md += `## 8. Out of Scope\n\n`;
    prd.outOfScope.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  if (prd.dependencies.length > 0 || prd.timeline) {
    md += `## 9. Dependencies & Timeline\n\n`;
    if (prd.dependencies.length > 0) {
      md += `### Dependencies\n`;
      prd.dependencies.forEach(dep => {
        md += `- ${dep}\n`;
      });
      md += '\n';
    }
    if (prd.timeline) {
      md += `### Timeline\n${prd.timeline}\n\n`;
    }
  }

  return md;
}

function generateHTML(prd: PRDData): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prd.title} - PRD</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #1a1a1a; }
    h1 { color: #111; border-bottom: 3px solid #3b82f6; padding-bottom: 0.5rem; }
    h2 { color: #333; margin-top: 2.5rem; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.3rem; }
    h3 { color: #444; margin-top: 1.5rem; }
    .meta { color: #666; margin-bottom: 1.5rem; background: #f8f9fa; padding: 1rem; border-radius: 8px; }
    .meta strong { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    ul, ol { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    .priority-must { color: #dc2626; font-weight: 600; }
    .priority-should { color: #ea580c; }
    .priority-could { color: #ca8a04; }
    .priority-wont { color: #64748b; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 2rem 0; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e5e5; color: #999; font-size: 0.85em; }
    .user-story { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1rem; margin: 1rem 0; border-radius: 0 8px 8px 0; }
    .status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85em; font-weight: 500; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-review { background: #dbeafe; color: #1e40af; }
    .status-approved { background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <h1>${prd.title}</h1>
  <div class="meta">
    <strong>Version:</strong> ${prd.version} &nbsp;|&nbsp;
    <strong>Author:</strong> ${prd.author} &nbsp;|&nbsp;
    <strong>Date:</strong> ${prd.date} &nbsp;|&nbsp;
    <strong>Status:</strong> <span class="status status-${prd.status}">${prd.status.charAt(0).toUpperCase() + prd.status.slice(1)}</span>
  </div>

  <h2>1. Overview</h2>
  <p>${prd.overview || '<em>No overview provided.</em>'}</p>

  <h2>2. Problem Statement</h2>
  <p>${prd.problem || '<em>No problem statement provided.</em>'}</p>
`;

  if (prd.goals.length > 0) {
    html += `  <h2>3. Goals & Objectives</h2>\n  <ol>\n`;
    prd.goals.forEach(goal => {
      html += `    <li>${goal}</li>\n`;
    });
    html += `  </ol>\n`;
  }

  if (prd.targetUsers.length > 0) {
    html += `  <h2>4. Target Users</h2>\n  <ul>\n`;
    prd.targetUsers.forEach(user => {
      html += `    <li>${user}</li>\n`;
    });
    html += `  </ul>\n`;
  }

  if (prd.userStories.length > 0) {
    html += `  <h2>5. User Stories (Optional)</h2>\n`;
    prd.userStories.forEach((story, i) => {
      html += `  <div class="user-story">
    <strong>US-${String(i + 1).padStart(3, '0')}</strong><br>
    <strong>As a</strong> ${story.persona}, <strong>I want to</strong> ${story.action}, <strong>so that</strong> ${story.benefit}.
  </div>\n`;
    });
  }

  if (prd.functionalRequirements.length > 0 || prd.nonFunctionalRequirements.length > 0) {
    html += `  <h2>6. Functional & Non-Functional Requirements</h2>\n`;

    if (prd.functionalRequirements.length > 0) {
      html += `  <h3>Functional Requirements</h3>
  <table>
    <thead><tr><th>ID</th><th>Requirement</th><th>Priority</th></tr></thead>
    <tbody>\n`;
      prd.functionalRequirements.forEach((req, i) => {
        html += `      <tr><td>FR-${String(i + 1).padStart(3, '0')}</td><td>${req.description}</td><td class="priority-${req.priority}">${priorityLabels[req.priority].label}</td></tr>\n`;
      });
      html += `    </tbody>
  </table>\n`;
    }

    if (prd.nonFunctionalRequirements.length > 0) {
      html += `  <h3>Non-Functional Requirements</h3>
  <table>
    <thead><tr><th>ID</th><th>Requirement</th><th>Priority</th></tr></thead>
    <tbody>\n`;
      prd.nonFunctionalRequirements.forEach((req, i) => {
        html += `      <tr><td>NFR-${String(i + 1).padStart(3, '0')}</td><td>${req.description}</td><td class="priority-${req.priority}">${priorityLabels[req.priority].label}</td></tr>\n`;
      });
      html += `    </tbody>
  </table>\n`;
    }
  }

  if (prd.successMetrics.length > 0) {
    html += `  <h2>7. Success Metrics & KPIs</h2>\n  <ul>\n`;
    prd.successMetrics.forEach(metric => {
      html += `    <li>${metric}</li>\n`;
    });
    html += `  </ul>\n`;
  }

  if (prd.outOfScope.length > 0) {
    html += `  <h2>8. Out of Scope</h2>\n  <ul>\n`;
    prd.outOfScope.forEach(item => {
      html += `    <li>${item}</li>\n`;
    });
    html += `  </ul>\n`;
  }

  if (prd.dependencies.length > 0 || prd.timeline) {
    html += `  <h2>9. Dependencies & Timeline</h2>\n`;
    if (prd.dependencies.length > 0) {
      html += `  <h3>Dependencies</h3>\n  <ul>\n`;
      prd.dependencies.forEach(dep => {
        html += `    <li>${dep}</li>\n`;
      });
      html += `  </ul>\n`;
    }
    if (prd.timeline) {
      html += `  <h3>Timeline</h3>\n  <p>${prd.timeline}</p>\n`;
    }
  }

  html += `</body>
</html>`;

  return html;
}

const examplePRD: PRDData = {
  title: 'Dark Mode Feature',
  version: '1.0',
  author: 'Product Team',
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
  overview: 'Implement a dark mode theme option across the application to improve user experience in low-light environments and reduce eye strain during extended usage.',
  problem: 'Users have requested a dark mode option due to eye strain when using the application in low-light conditions. Additionally, dark mode can help reduce battery consumption on OLED devices.',
  goals: [
    'Provide a consistent dark theme across all application screens',
    'Allow users to toggle between light and dark modes',
    'Support system preference detection for automatic theme switching',
    'Ensure accessibility standards are met in dark mode',
  ],
  targetUsers: [
    'Power users who spend extended time in the application',
    'Users in low-light environments',
    'Users with OLED devices looking to save battery',
    'Users with light sensitivity or visual preferences',
  ],
  userStories: [
    { id: generateId(), persona: 'regular user', action: 'switch to dark mode from the settings menu', benefit: 'I can reduce eye strain when using the app at night' },
    { id: generateId(), persona: 'mobile user', action: 'have the app automatically match my system theme', benefit: 'I don\'t need to manually adjust settings when my phone switches modes' },
    { id: generateId(), persona: 'user with light sensitivity', action: 'use dark mode as my default theme', benefit: 'I can comfortably use the app without visual discomfort' },
  ],
  functionalRequirements: [
    { id: generateId(), description: 'System shall provide a toggle switch in settings to enable/disable dark mode', priority: 'must' },
    { id: generateId(), description: 'System shall persist user theme preference across sessions', priority: 'must' },
    { id: generateId(), description: 'System shall detect and respect OS-level dark mode preference', priority: 'should' },
    { id: generateId(), description: 'System shall provide smooth transition animation between themes', priority: 'could' },
    { id: generateId(), description: 'System shall support scheduling dark mode by time of day', priority: 'wont' },
  ],
  nonFunctionalRequirements: [
    { id: generateId(), description: 'Theme switch shall complete within 100ms', priority: 'must' },
    { id: generateId(), description: 'Dark mode shall maintain WCAG 2.1 AA contrast ratios', priority: 'must' },
    { id: generateId(), description: 'Theme preference shall sync across devices for logged-in users', priority: 'should' },
  ],
  successMetrics: [
    'Dark mode adoption rate > 30% within 3 months',
    'User satisfaction score improvement in night-time usage surveys',
    'Reduction in eye strain-related feedback by 50%',
    'No increase in accessibility-related support tickets',
  ],
  outOfScope: [
    'Custom color theme creation by users',
    'Per-page theme overrides',
    'Third-party embedded content theming',
  ],
  dependencies: [
    'Design system color token updates',
    'Component library theme support',
    'User preference API endpoint',
  ],
  timeline: 'MVP: 4 weeks | Full rollout: 6 weeks',
};

// FAQ data for schema markup
const faqData = [
  {
    question: "What is a PRD?",
    answer: "A PRD (Product Requirements Document) is a document that outlines all the requirements for a product or feature. It typically includes the problem statement, goals, user stories, functional requirements, and success metrics. PRDs help align teams on what to build and why."
  },
  {
    question: "What should a PRD include?",
    answer: "A comprehensive PRD should include: Overview, Problem Statement, Goals & Objectives, Target Users, User Stories, Functional Requirements, Non-Functional Requirements, Success Metrics & KPIs, Out of Scope items, and Dependencies & Timeline."
  },
  {
    question: "Is this PRD template free?",
    answer: "Yes, this PRD generator is completely free to use. You can create unlimited PRDs and export them to Markdown or HTML format at no cost."
  },
  {
    question: "Can I export this PRD to Google Docs?",
    answer: "You can export your PRD as HTML or Markdown. To use in Google Docs, export as HTML, then copy the content or import the file directly into Google Docs for further editing."
  },
  {
    question: "Can PRDs be created from meetings?",
    answer: "Yes! While this free tool lets you create PRDs manually, IdeaLift can automatically generate PRDs from meeting discussions, Slack conversations, and customer feedback."
  }
];

export default function PRDGeneratorApp() {
  const [prd, setPrd] = useState<PRDData>({
    title: '',
    version: '1.0',
    author: '',
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    overview: '',
    problem: '',
    goals: [],
    targetUsers: [],
    userStories: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    successMetrics: [],
    outOfScope: [],
    dependencies: [],
    timeline: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Temp inputs
  const [tempGoal, setTempGoal] = useState('');
  const [tempUser, setTempUser] = useState('');
  const [tempMetric, setTempMetric] = useState('');
  const [tempOutOfScope, setTempOutOfScope] = useState('');
  const [tempDependency, setTempDependency] = useState('');
  const [tempStory, setTempStory] = useState({ persona: '', action: '', benefit: '' });
  const [tempFR, setTempFR] = useState<{ description: string; priority: Requirement['priority'] }>({ description: '', priority: 'must' });
  const [tempNFR, setTempNFR] = useState<{ description: string; priority: Requirement['priority'] }>({ description: '', priority: 'must' });

  const loadExample = () => {
    setPrd(examplePRD);
    trackToolUse('load_example', 'prd_generator');
  };

  const addGoal = () => {
    if (tempGoal.trim()) {
      setPrd(prev => ({ ...prev, goals: [...prev.goals, tempGoal.trim()] }));
      setTempGoal('');
    }
  };

  const addUser = () => {
    if (tempUser.trim()) {
      setPrd(prev => ({ ...prev, targetUsers: [...prev.targetUsers, tempUser.trim()] }));
      setTempUser('');
    }
  };

  const addMetric = () => {
    if (tempMetric.trim()) {
      setPrd(prev => ({ ...prev, successMetrics: [...prev.successMetrics, tempMetric.trim()] }));
      setTempMetric('');
    }
  };

  const addOutOfScope = () => {
    if (tempOutOfScope.trim()) {
      setPrd(prev => ({ ...prev, outOfScope: [...prev.outOfScope, tempOutOfScope.trim()] }));
      setTempOutOfScope('');
    }
  };

  const addDependency = () => {
    if (tempDependency.trim()) {
      setPrd(prev => ({ ...prev, dependencies: [...prev.dependencies, tempDependency.trim()] }));
      setTempDependency('');
    }
  };

  const addUserStory = () => {
    if (tempStory.persona.trim() && tempStory.action.trim() && tempStory.benefit.trim()) {
      setPrd(prev => ({
        ...prev,
        userStories: [...prev.userStories, { id: generateId(), ...tempStory }],
      }));
      setTempStory({ persona: '', action: '', benefit: '' });
    }
  };

  const addFR = () => {
    if (tempFR.description.trim()) {
      setPrd(prev => ({
        ...prev,
        functionalRequirements: [...prev.functionalRequirements, { id: generateId(), ...tempFR }],
      }));
      setTempFR({ description: '', priority: 'must' });
    }
  };

  const addNFR = () => {
    if (tempNFR.description.trim()) {
      setPrd(prev => ({
        ...prev,
        nonFunctionalRequirements: [...prev.nonFunctionalRequirements, { id: generateId(), ...tempNFR }],
      }));
      setTempNFR({ description: '', priority: 'must' });
    }
  };

  const removeItem = (section: keyof PRDData, index: number) => {
    setPrd(prev => ({
      ...prev,
      [section]: (prev[section] as unknown[]).filter((_, i) => i !== index),
    }));
  };

  const handleCopyMarkdown = useCallback(async () => {
    const md = generateMarkdown(prd);
    await navigator.clipboard.writeText(md);
    setCopied('md');
    trackExport('copy_markdown', 'prd_generator');
    setTimeout(() => setCopied(null), 2000);
  }, [prd]);

  const handleCopyHTML = useCallback(async () => {
    const html = generateHTML(prd);
    await navigator.clipboard.writeText(html);
    setCopied('html');
    trackExport('copy_html', 'prd_generator');
    setTimeout(() => setCopied(null), 2000);
  }, [prd]);

  const handleDownloadMarkdown = () => {
    trackExport('download_markdown', 'prd_generator');
    const md = generateMarkdown(prd);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prd.title || 'prd'}-v${prd.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    trackExport('download_html', 'prd_generator');
    const html = generateHTML(prd);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prd.title || 'prd'}-v${prd.version}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasContent = prd.title || prd.problem || prd.goals.length > 0 || prd.functionalRequirements.length > 0;

  return (
    <main className="min-h-screen py-12 px-4">
      {/* SEO-optimized Hero */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          100% Free
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Free PRD Template & Generator
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Instantly generate a Product Requirements Document you can share with engineers, designers, and stakeholders.
        </p>
        <button
          onClick={loadExample}
          className="mt-4 text-blue-400 hover:text-blue-300 underline underline-offset-4 text-sm"
        >
          Try an example PRD
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Main Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-white">Generate Your PRD →</h2>
            {hasContent && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied === 'md' ? (
                    <><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy MD</>
                  )}
                </button>
                <button onClick={handleDownloadMarkdown} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>.md
                </button>
                <button
                  onClick={handleCopyHTML}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied === 'html' ? (
                    <><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>Copy HTML</>
                  )}
                </button>
                <button onClick={handleDownloadHTML} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>.html
                </button>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-sm mb-6">Fill in as much or as little as you want — we&apos;ll generate the rest.</p>

          {/* Core Fields (Always Visible) */}
          <div className="space-y-6">
            {/* Title - Most Important */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Feature/Product Title *</label>
              <input
                type="text"
                value={prd.title}
                onChange={(e) => setPrd(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Dark Mode Feature, User Authentication, Payment Integration"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Problem Statement */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Problem Statement</label>
              <textarea
                value={prd.problem}
                onChange={(e) => setPrd(prev => ({ ...prev, problem: e.target.value }))}
                placeholder="What problem are you solving? Why is it important to solve now?"
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Goals */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Goals & Objectives <span className="text-slate-500">(optional)</span></label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  placeholder="e.g., Increase user retention by 20%"
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button onClick={addGoal} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
              </div>
              {prd.goals.length > 0 && (
                <ol className="space-y-2">
                  {prd.goals.map((goal, i) => (
                    <li key={i} className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-4 py-2">
                      <span className="text-blue-400 font-medium">{i + 1}.</span>
                      <span className="flex-1 text-white">{goal}</span>
                      <button onClick={() => removeItem('goals', i)} className="text-slate-400 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Functional Requirements */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Requirements (Functional & Non-Functional) <span className="text-slate-500">(optional)</span></label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempFR.description}
                  onChange={(e) => setTempFR(prev => ({ ...prev, description: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addFR()}
                  placeholder="e.g., System shall allow users to toggle dark mode"
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={tempFR.priority}
                  onChange={(e) => setTempFR(prev => ({ ...prev, priority: e.target.value as Requirement['priority'] }))}
                  className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="must">Must Have</option>
                  <option value="should">Should Have</option>
                  <option value="could">Could Have</option>
                  <option value="wont">Won&apos;t Have</option>
                </select>
                <button onClick={addFR} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
              </div>
              {prd.functionalRequirements.length > 0 && (
                <div className="space-y-2">
                  {prd.functionalRequirements.map((req, i) => (
                    <div key={req.id} className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-4 py-2">
                      <span className="text-slate-500 font-mono text-sm shrink-0">FR-{String(i + 1).padStart(3, '0')}</span>
                      <span className="flex-1 text-white text-sm">{req.description}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityLabels[req.priority].color}`}>
                        {priorityLabels[req.priority].label}
                      </span>
                      <button onClick={() => removeItem('functionalRequirements', i)} className="text-slate-400 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Sections Toggle */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Sections
              <span className="text-slate-500 text-sm">(Version, Author, User Stories, Success Metrics, etc.)</span>
            </button>
          </div>

          {/* Advanced Sections (Collapsed by Default) */}
          {showAdvanced && (
            <div className="mt-6 space-y-6 animate-in slide-in-from-top-2">
              {/* Meta Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Version</label>
                  <input
                    type="text"
                    value={prd.version}
                    onChange={(e) => setPrd(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Author</label>
                  <input
                    type="text"
                    value={prd.author}
                    onChange={(e) => setPrd(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Your name or team"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Status</label>
                  <select
                    value={prd.status}
                    onChange={(e) => setPrd(prev => ({ ...prev, status: e.target.value as PRDData['status'] }))}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              {/* Overview */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Overview</label>
                <textarea
                  value={prd.overview}
                  onChange={(e) => setPrd(prev => ({ ...prev, overview: e.target.value }))}
                  placeholder="High-level description of what this feature/product does..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Target Users */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Target Users</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempUser}
                    onChange={(e) => setTempUser(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addUser()}
                    placeholder="e.g., Power users, Mobile users..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button onClick={addUser} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
                </div>
                {prd.targetUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prd.targetUsers.map((user, i) => (
                      <span key={i} className="inline-flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1 text-white">
                        {user}
                        <button onClick={() => removeItem('targetUsers', i)} className="text-slate-400 hover:text-red-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* User Stories */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">User Stories (Optional)</label>
                <div className="bg-slate-900/50 rounded-xl p-4 mb-3">
                  <p className="text-slate-400 text-sm mb-3">As a <span className="text-blue-400">[persona]</span>, I want to <span className="text-blue-400">[action]</span>, so that <span className="text-blue-400">[benefit]</span>.</p>
                  <div className="grid md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      value={tempStory.persona}
                      onChange={(e) => setTempStory(prev => ({ ...prev, persona: e.target.value }))}
                      placeholder="Persona (e.g., regular user)"
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={tempStory.action}
                      onChange={(e) => setTempStory(prev => ({ ...prev, action: e.target.value }))}
                      placeholder="Action (e.g., toggle dark mode)"
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={tempStory.benefit}
                      onChange={(e) => setTempStory(prev => ({ ...prev, benefit: e.target.value }))}
                      placeholder="Benefit (e.g., reduce eye strain)"
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button onClick={addUserStory} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm">Add User Story</button>
                </div>
                {prd.userStories.length > 0 && (
                  <div className="space-y-2">
                    {prd.userStories.map((story, i) => (
                      <div key={story.id} className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
                        <span className="text-blue-400 font-mono text-sm shrink-0">US-{String(i + 1).padStart(3, '0')}</span>
                        <p className="flex-1 text-white text-sm">
                          <strong>As a</strong> {story.persona}, <strong>I want to</strong> {story.action}, <strong>so that</strong> {story.benefit}.
                        </p>
                        <button onClick={() => removeItem('userStories', i)} className="text-slate-400 hover:text-red-400 shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Non-Functional Requirements */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Non-Functional Requirements</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempNFR.description}
                    onChange={(e) => setTempNFR(prev => ({ ...prev, description: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addNFR()}
                    placeholder="Performance, security, accessibility..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={tempNFR.priority}
                    onChange={(e) => setTempNFR(prev => ({ ...prev, priority: e.target.value as Requirement['priority'] }))}
                    className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="must">Must Have</option>
                    <option value="should">Should Have</option>
                    <option value="could">Could Have</option>
                    <option value="wont">Won&apos;t Have</option>
                  </select>
                  <button onClick={addNFR} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
                </div>
                {prd.nonFunctionalRequirements.length > 0 && (
                  <div className="space-y-2">
                    {prd.nonFunctionalRequirements.map((req, i) => (
                      <div key={req.id} className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-4 py-2">
                        <span className="text-slate-500 font-mono text-sm shrink-0">NFR-{String(i + 1).padStart(3, '0')}</span>
                        <span className="flex-1 text-white text-sm">{req.description}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityLabels[req.priority].color}`}>
                          {priorityLabels[req.priority].label}
                        </span>
                        <button onClick={() => removeItem('nonFunctionalRequirements', i)} className="text-slate-400 hover:text-red-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Success Metrics */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Success Metrics & KPIs</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempMetric}
                    onChange={(e) => setTempMetric(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMetric()}
                    placeholder="e.g., Adoption rate > 30% within 3 months"
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button onClick={addMetric} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
                </div>
                {prd.successMetrics.length > 0 && (
                  <ul className="space-y-2">
                    {prd.successMetrics.map((metric, i) => (
                      <li key={i} className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                        <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <span className="flex-1 text-white text-sm">{metric}</span>
                        <button onClick={() => removeItem('successMetrics', i)} className="text-slate-400 hover:text-red-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Out of Scope */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Out of Scope</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempOutOfScope}
                    onChange={(e) => setTempOutOfScope(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addOutOfScope()}
                    placeholder="What is NOT included in this release..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button onClick={addOutOfScope} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
                </div>
                {prd.outOfScope.length > 0 && (
                  <ul className="space-y-2">
                    {prd.outOfScope.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-4 py-2">
                        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        <span className="flex-1 text-white text-sm">{item}</span>
                        <button onClick={() => removeItem('outOfScope', i)} className="text-slate-400 hover:text-red-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Dependencies & Timeline */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Dependencies</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tempDependency}
                      onChange={(e) => setTempDependency(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addDependency()}
                      placeholder="e.g., API endpoint, design assets..."
                      className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button onClick={addDependency} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Add</button>
                  </div>
                  {prd.dependencies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prd.dependencies.map((dep, i) => (
                        <span key={i} className="inline-flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1 text-white text-sm">
                          {dep}
                          <button onClick={() => removeItem('dependencies', i)} className="text-slate-400 hover:text-red-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Timeline</label>
                  <input
                    type="text"
                    value={prd.timeline}
                    onChange={(e) => setPrd(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., MVP: 4 weeks | Full rollout: 6 weeks"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview (Rendered as real HTML for SEO) */}
        {hasContent && (
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
            <article className="prose prose-slate max-w-none">
              <h1 className="text-3xl font-bold text-slate-900 border-b-4 border-blue-500 pb-2 mb-4">{prd.title || 'Untitled PRD'}</h1>

              <div className="bg-slate-100 rounded-lg p-4 mb-6 text-sm text-slate-600">
                <strong>Version:</strong> {prd.version} &nbsp;|&nbsp;
                <strong>Author:</strong> {prd.author || 'Not specified'} &nbsp;|&nbsp;
                <strong>Date:</strong> {prd.date} &nbsp;|&nbsp;
                <strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  prd.status === 'approved' ? 'bg-green-100 text-green-700' :
                  prd.status === 'review' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{prd.status.charAt(0).toUpperCase() + prd.status.slice(1)}</span>
              </div>

              {prd.overview && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Overview</h2>
                  <p className="text-slate-700">{prd.overview}</p>
                </>
              )}

              {prd.problem && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Problem Statement</h2>
                  <p className="text-slate-700">{prd.problem}</p>
                </>
              )}

              {prd.goals.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Goals & Objectives</h2>
                  <ol className="list-decimal pl-5 space-y-1">
                    {prd.goals.map((goal, i) => (
                      <li key={i} className="text-slate-700">{goal}</li>
                    ))}
                  </ol>
                </>
              )}

              {prd.targetUsers.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Target Users</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {prd.targetUsers.map((user, i) => (
                      <li key={i} className="text-slate-700">{user}</li>
                    ))}
                  </ul>
                </>
              )}

              {prd.userStories.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">User Stories (Optional)</h2>
                  {prd.userStories.map((story, i) => (
                    <div key={story.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 my-3 rounded-r-lg">
                      <strong className="text-blue-700">US-{String(i + 1).padStart(3, '0')}</strong>
                      <p className="text-slate-700 mt-1">
                        <strong>As a</strong> {story.persona}, <strong>I want to</strong> {story.action}, <strong>so that</strong> {story.benefit}.
                      </p>
                    </div>
                  ))}
                </>
              )}

              {(prd.functionalRequirements.length > 0 || prd.nonFunctionalRequirements.length > 0) && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Functional & Non-Functional Requirements</h2>

                  {prd.functionalRequirements.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">Functional Requirements</h3>
                      <table className="w-full border-collapse border border-slate-300 text-sm">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-3 py-2 text-left">ID</th>
                            <th className="border border-slate-300 px-3 py-2 text-left">Requirement</th>
                            <th className="border border-slate-300 px-3 py-2 text-left">Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prd.functionalRequirements.map((req, i) => (
                            <tr key={req.id} className="even:bg-slate-50">
                              <td className="border border-slate-300 px-3 py-2 font-mono">FR-{String(i + 1).padStart(3, '0')}</td>
                              <td className="border border-slate-300 px-3 py-2">{req.description}</td>
                              <td className={`border border-slate-300 px-3 py-2 font-medium ${
                                req.priority === 'must' ? 'text-red-600' :
                                req.priority === 'should' ? 'text-orange-600' :
                                req.priority === 'could' ? 'text-yellow-600' :
                                'text-slate-500'
                              }`}>{priorityLabels[req.priority].label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {prd.nonFunctionalRequirements.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">Non-Functional Requirements</h3>
                      <table className="w-full border-collapse border border-slate-300 text-sm">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-3 py-2 text-left">ID</th>
                            <th className="border border-slate-300 px-3 py-2 text-left">Requirement</th>
                            <th className="border border-slate-300 px-3 py-2 text-left">Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prd.nonFunctionalRequirements.map((req, i) => (
                            <tr key={req.id} className="even:bg-slate-50">
                              <td className="border border-slate-300 px-3 py-2 font-mono">NFR-{String(i + 1).padStart(3, '0')}</td>
                              <td className="border border-slate-300 px-3 py-2">{req.description}</td>
                              <td className={`border border-slate-300 px-3 py-2 font-medium ${
                                req.priority === 'must' ? 'text-red-600' :
                                req.priority === 'should' ? 'text-orange-600' :
                                req.priority === 'could' ? 'text-yellow-600' :
                                'text-slate-500'
                              }`}>{priorityLabels[req.priority].label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              )}

              {prd.successMetrics.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Success Metrics & KPIs</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {prd.successMetrics.map((metric, i) => (
                      <li key={i} className="text-slate-700">{metric}</li>
                    ))}
                  </ul>
                </>
              )}

              {prd.outOfScope.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Out of Scope</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {prd.outOfScope.map((item, i) => (
                      <li key={i} className="text-slate-700">{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {(prd.dependencies.length > 0 || prd.timeline) && (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">Dependencies & Timeline</h2>
                  {prd.dependencies.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium text-slate-700 mt-3 mb-2">Dependencies</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {prd.dependencies.map((dep, i) => (
                          <li key={i} className="text-slate-700">{dep}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {prd.timeline && (
                    <>
                      <h3 className="text-lg font-medium text-slate-700 mt-3 mb-2">Timeline</h3>
                      <p className="text-slate-700">{prd.timeline}</p>
                    </>
                  )}
                </>
              )}
            </article>

            {/* Subtle IdeaLift hook - no banner, just contextual text */}
            <p className="text-sm text-slate-500 mt-8 pt-4 border-t border-slate-200">
              This PRD was generated from manual input. <a href="https://idealift.io" className="text-blue-600 hover:text-blue-700">IdeaLift</a> can generate PRDs automatically from meeting discussions.
            </p>
          </div>
        )}

        {/* FAQ Section with Schema Markup */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-4 py-3 bg-slate-900/50 text-slate-300 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improved Footer */}
      <footer className="max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            A free PRD generator by{' '}
            <a href="https://startvest.ai" className="text-blue-400 hover:text-blue-300">
              Startvest
            </a>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Turn meetings into PRDs</span>
            <span className="text-slate-600">&rarr;</span>
            <a href="https://idealift.io" className="text-blue-400 hover:text-blue-300">IdeaLift</a>
            <span className="text-slate-600">|</span>
            <span>Generate release notes</span>
            <span className="text-slate-600">&rarr;</span>
            <a href="https://release-notes.tools.startvest.ai" className="text-blue-400 hover:text-blue-300">Release Notes</a>
            <span className="text-slate-600">|</span>
            <a href="/llms.txt" className="text-slate-600 hover:text-slate-400">AI-readable</a>
          </div>
        </div>
      </footer>

      {/* FAQ Schema Markup (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </main>
  );
}
