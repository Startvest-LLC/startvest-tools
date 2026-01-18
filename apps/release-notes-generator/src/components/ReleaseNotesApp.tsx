'use client';

import { useState, useCallback } from 'react';
import { trackToolUse, trackExport } from '@/lib/analytics';

interface ReleaseEntry {
  id: string;
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'deprecated' | 'security' | 'docs' | 'other';
  description: string;
  prNumber?: string;
  author?: string;
}

interface ReleaseNotes {
  version: string;
  date: string;
  title: string;
  entries: ReleaseEntry[];
}

const entryTypes = [
  { value: 'feature', label: 'New Feature', emoji: '✨', color: 'text-green-400 bg-green-500/20 border-green-500/30' },
  { value: 'fix', label: 'Bug Fix', emoji: '🐛', color: 'text-red-400 bg-red-500/20 border-red-500/30' },
  { value: 'improvement', label: 'Improvement', emoji: '💪', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  { value: 'breaking', label: 'Breaking Change', emoji: '💥', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' },
  { value: 'deprecated', label: 'Deprecated', emoji: '⚠️', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
  { value: 'security', label: 'Security', emoji: '🔒', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
  { value: 'docs', label: 'Documentation', emoji: '📚', color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' },
  { value: 'other', label: 'Other', emoji: '📝', color: 'text-slate-400 bg-slate-500/20 border-slate-500/30' },
] as const;

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function groupEntriesByType(entries: ReleaseEntry[]): Record<string, ReleaseEntry[]> {
  const groups: Record<string, ReleaseEntry[]> = {};
  entries.forEach(entry => {
    if (!groups[entry.type]) {
      groups[entry.type] = [];
    }
    groups[entry.type].push(entry);
  });
  return groups;
}

function generateMarkdown(notes: ReleaseNotes): string {
  const grouped = groupEntriesByType(notes.entries);
  let md = `# ${notes.title || `Release ${notes.version}`}\n\n`;
  md += `**Version:** ${notes.version}  \n`;
  md += `**Date:** ${formatDate(notes.date)}\n\n`;

  const typeOrder = ['breaking', 'feature', 'improvement', 'fix', 'security', 'deprecated', 'docs', 'other'];
  const typeLabels: Record<string, string> = {
    feature: '✨ New Features',
    fix: '🐛 Bug Fixes',
    improvement: '💪 Improvements',
    breaking: '💥 Breaking Changes',
    deprecated: '⚠️ Deprecated',
    security: '🔒 Security',
    docs: '📚 Documentation',
    other: '📝 Other Changes',
  };

  typeOrder.forEach(type => {
    if (grouped[type] && grouped[type].length > 0) {
      md += `## ${typeLabels[type]}\n\n`;
      grouped[type].forEach(entry => {
        let line = `- ${entry.description}`;
        if (entry.prNumber) {
          line += ` (#${entry.prNumber})`;
        }
        if (entry.author) {
          line += ` - @${entry.author}`;
        }
        md += line + '\n';
      });
      md += '\n';
    }
  });

  md += '---\n';
  md += '*Generated with [Release Notes Generator](https://release-notes.startvest.ai) by Startvest*\n';

  return md;
}

function generateHTML(notes: ReleaseNotes): string {
  const grouped = groupEntriesByType(notes.entries);
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notes.title || `Release ${notes.version}`}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5rem; }
    h2 { color: #333; margin-top: 2rem; }
    .meta { color: #666; margin-bottom: 2rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    .pr { color: #0066cc; }
    .author { color: #666; font-size: 0.9em; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e5e5; color: #999; font-size: 0.85em; }
  </style>
</head>
<body>
  <h1>${notes.title || `Release ${notes.version}`}</h1>
  <p class="meta"><strong>Version:</strong> ${notes.version} | <strong>Date:</strong> ${formatDate(notes.date)}</p>
`;

  const typeOrder = ['breaking', 'feature', 'improvement', 'fix', 'security', 'deprecated', 'docs', 'other'];
  const typeLabels: Record<string, string> = {
    feature: '✨ New Features',
    fix: '🐛 Bug Fixes',
    improvement: '💪 Improvements',
    breaking: '💥 Breaking Changes',
    deprecated: '⚠️ Deprecated',
    security: '🔒 Security',
    docs: '📚 Documentation',
    other: '📝 Other Changes',
  };

  typeOrder.forEach(type => {
    if (grouped[type] && grouped[type].length > 0) {
      html += `  <h2>${typeLabels[type]}</h2>\n  <ul>\n`;
      grouped[type].forEach(entry => {
        let line = `    <li>${entry.description}`;
        if (entry.prNumber) {
          line += ` <span class="pr">(#${entry.prNumber})</span>`;
        }
        if (entry.author) {
          line += ` <span class="author">- @${entry.author}</span>`;
        }
        html += line + '</li>\n';
      });
      html += '  </ul>\n';
    }
  });

  html += `  <p class="footer">Generated with <a href="https://release-notes.startvest.ai">Release Notes Generator</a> by Startvest</p>
</body>
</html>`;

  return html;
}

const exampleEntries: Omit<ReleaseEntry, 'id'>[] = [
  { type: 'feature', description: 'Add dark mode support across the application', prNumber: '142', author: 'johndoe' },
  { type: 'feature', description: 'Implement real-time collaboration features', prNumber: '138' },
  { type: 'fix', description: 'Fix memory leak in dashboard component', prNumber: '145', author: 'janesmith' },
  { type: 'fix', description: 'Resolve authentication timeout issues', prNumber: '143' },
  { type: 'improvement', description: 'Optimize database queries for faster load times', prNumber: '140' },
  { type: 'breaking', description: 'Remove deprecated v1 API endpoints', prNumber: '136' },
  { type: 'security', description: 'Update dependencies to patch security vulnerabilities', prNumber: '147' },
  { type: 'docs', description: 'Add API documentation for new endpoints', prNumber: '141' },
];

export default function ReleaseNotesApp() {
  const [notes, setNotes] = useState<ReleaseNotes>({
    version: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    entries: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Form state
  const [entryType, setEntryType] = useState<ReleaseEntry['type']>('feature');
  const [description, setDescription] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [author, setAuthor] = useState('');

  const resetForm = () => {
    setEntryType('feature');
    setDescription('');
    setPrNumber('');
    setAuthor('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddEntry = () => {
    if (!description.trim()) return;

    if (editingId) {
      setNotes(prev => ({
        ...prev,
        entries: prev.entries.map(e =>
          e.id === editingId
            ? { ...e, type: entryType, description, prNumber: prNumber || undefined, author: author || undefined }
            : e
        ),
      }));
    } else {
      const newEntry: ReleaseEntry = {
        id: generateId(),
        type: entryType,
        description,
        prNumber: prNumber || undefined,
        author: author || undefined,
      };
      setNotes(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
    }

    resetForm();
  };

  const handleEdit = (entry: ReleaseEntry) => {
    setEntryType(entry.type);
    setDescription(entry.description);
    setPrNumber(entry.prNumber || '');
    setAuthor(entry.author || '');
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setNotes(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  };

  const loadExamples = () => {
    setNotes({
      version: '2.1.0',
      date: new Date().toISOString().split('T')[0],
      title: 'January 2025 Release',
      entries: exampleEntries.map(e => ({ ...e, id: generateId() })),
    });
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split('\n').filter(line => line.trim());
    const newEntries: ReleaseEntry[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Try to detect type from common prefixes
      let type: ReleaseEntry['type'] = 'other';
      let desc = trimmed;

      const prefixMap: Record<string, ReleaseEntry['type']> = {
        'feat:': 'feature',
        'feature:': 'feature',
        'fix:': 'fix',
        'bug:': 'fix',
        'improve:': 'improvement',
        'improvement:': 'improvement',
        'perf:': 'improvement',
        'breaking:': 'breaking',
        'break:': 'breaking',
        'security:': 'security',
        'sec:': 'security',
        'docs:': 'docs',
        'doc:': 'docs',
        'deprecate:': 'deprecated',
        'deprecated:': 'deprecated',
        'chore:': 'other',
        'refactor:': 'improvement',
        'style:': 'other',
        'test:': 'other',
      };

      for (const [prefix, t] of Object.entries(prefixMap)) {
        if (trimmed.toLowerCase().startsWith(prefix)) {
          type = t;
          desc = trimmed.slice(prefix.length).trim();
          break;
        }
      }

      // Extract PR number if present
      const prMatch = desc.match(/\(#(\d+)\)|\s#(\d+)$/);
      let prNumber: string | undefined;
      if (prMatch) {
        prNumber = prMatch[1] || prMatch[2];
        desc = desc.replace(/\s*\(#\d+\)|\s*#\d+$/, '').trim();
      }

      if (desc) {
        newEntries.push({
          id: generateId(),
          type,
          description: desc,
          prNumber,
        });
      }
    });

    if (newEntries.length > 0) {
      setNotes(prev => ({ ...prev, entries: [...prev.entries, ...newEntries] }));
      setBulkInput('');
      setShowBulkImport(false);
    }
  };

  const handleCopyMarkdown = useCallback(async () => {
    const md = generateMarkdown(notes);
    await navigator.clipboard.writeText(md);
    setCopied('md');
    setTimeout(() => setCopied(null), 2000);
  }, [notes]);

  const handleCopyHTML = useCallback(async () => {
    const html = generateHTML(notes);
    await navigator.clipboard.writeText(html);
    setCopied('html');
    setTimeout(() => setCopied(null), 2000);
  }, [notes]);

  const handleDownloadMarkdown = () => {
    trackExport('download_markdown', 'release_notes_generator');
    const md = generateMarkdown(notes);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `release-notes-${notes.version || 'draft'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    trackExport('download_html', 'release_notes_generator');
    const html = generateHTML(notes);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `release-notes-${notes.version || 'draft'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeInfo = (type: string) => {
    return entryTypes.find(t => t.value === type) || entryTypes[7];
  };

  const grouped = groupEntriesByType(notes.entries);

  return (
    <main className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-purple-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Free Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Release Notes Generator
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Create beautiful, professional release notes in seconds.
          Categorize your changes and export to Markdown or HTML.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Version & Date */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Version</label>
              <input
                type="text"
                value={notes.version}
                onChange={(e) => setNotes(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 2.1.0"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Release Date</label>
              <input
                type="date"
                value={notes.date}
                onChange={(e) => setNotes(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Title (optional)</label>
              <input
                type="text"
                value={notes.title}
                onChange={(e) => setNotes(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., January 2025 Release"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Entry
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Import
            </button>
            {notes.entries.length === 0 && (
              <button
                onClick={loadExamples}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Load Examples
              </button>
            )}
          </div>
          {notes.entries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {copied === 'md' ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy MD
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                .md
              </button>
              <button
                onClick={handleCopyHTML}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {copied === 'html' ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Copy HTML
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadHTML}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                .html
              </button>
            </div>
          )}
        </div>

        {/* Add Entry Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 w-full max-w-lg">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingId ? 'Edit Entry' : 'Add Entry'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {entryTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setEntryType(type.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          entryType === type.value
                            ? type.color
                            : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                        }`}
                      >
                        {type.emoji} {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What changed?"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">PR/Issue # (optional)</label>
                    <input
                      type="text"
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                      placeholder="142"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Author (optional)</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="johndoe"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEntry}
                    disabled={!description.trim()}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                  >
                    {editingId ? 'Update' : 'Add Entry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkImport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-white mb-2">Bulk Import</h2>
              <p className="text-slate-400 text-sm mb-4">
                Paste your commit messages, one per line. Use prefixes like <code className="text-purple-400">feat:</code>, <code className="text-purple-400">fix:</code>, <code className="text-purple-400">docs:</code> for auto-categorization.
              </p>

              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={`feat: Add dark mode support (#142)\nfix: Resolve authentication timeout\ndocs: Update API documentation\nimprovement: Optimize database queries`}
                rows={10}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setBulkInput(''); setShowBulkImport(false); }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={!bulkInput.trim()}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  Import {bulkInput.split('\n').filter(l => l.trim()).length} Entries
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {notes.entries.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Total Entries</p>
                <p className="text-2xl font-bold text-white">{notes.entries.length}</p>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <p className="text-green-400 text-sm">Features</p>
                <p className="text-2xl font-bold text-green-400">{grouped['feature']?.length || 0}</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                <p className="text-red-400 text-sm">Bug Fixes</p>
                <p className="text-2xl font-bold text-red-400">{grouped['fix']?.length || 0}</p>
              </div>
              <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                <p className="text-orange-400 text-sm">Breaking</p>
                <p className="text-2xl font-bold text-orange-400">{grouped['breaking']?.length || 0}</p>
              </div>
            </div>

            {/* Entries by Category */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">Release Entries</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {notes.entries.map(entry => {
                  const typeInfo = getTypeInfo(entry.type);
                  return (
                    <div key={entry.id} className="p-4 hover:bg-slate-700/30 transition-colors flex items-start gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border shrink-0 ${typeInfo.color}`}>
                        {typeInfo.emoji} {typeInfo.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white">{entry.description}</p>
                        <div className="flex gap-4 mt-1 text-sm text-slate-500">
                          {entry.prNumber && <span>#{entry.prNumber}</span>}
                          {entry.author && <span>@{entry.author}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 text-slate-400 hover:text-purple-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-white">Preview</h3>
                <span className="text-sm text-slate-400">Markdown output</span>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto font-mono whitespace-pre-wrap">
                {generateMarkdown(notes)}
              </pre>
            </div>

            {/* Changelog AI CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Automate Your Release Notes
              </h2>
              <p className="text-purple-100 mb-6 max-w-lg mx-auto">
                Changelog AI automatically generates beautiful release notes from your GitHub commits and PRs.
                No more manual copying - just connect your repo and publish.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://changelog.startvest.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Try Changelog AI Free
                </a>
                <span className="text-purple-200 text-sm">Connect GitHub in 60 seconds</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.entries.length === 0 && (
          <div className="space-y-8">
            {/* How It Works */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Add Entries</h3>
                  <p className="text-sm text-slate-400">Add your changes manually or bulk import from commits</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Categorize</h3>
                  <p className="text-sm text-slate-400">Organize by type: features, fixes, breaking changes, etc.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Export</h3>
                  <p className="text-sm text-slate-400">Copy or download as Markdown or HTML</p>
                </div>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white">Markdown Export</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Perfect for GitHub releases, documentation sites, and static site generators.
                </p>
                <code className="block bg-slate-900 rounded-lg p-3 text-xs text-slate-300 font-mono">
                  ## ✨ New Features{'\n'}- Add dark mode support (#142)
                </code>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white">HTML Export</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Standalone HTML page ready to publish or embed in your website.
                </p>
                <code className="block bg-slate-900 rounded-lg p-3 text-xs text-slate-300 font-mono">
                  {'<h2>✨ New Features</h2>'}{'\n'}{'<li>Add dark mode...</li>'}
                </code>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/30 text-lg"
              >
                Start Creating Release Notes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            A free tool by{' '}
            <a href="https://startvest.ai" className="text-purple-400 hover:text-purple-300">
              Startvest
            </a>
          </p>
          <div className="flex items-center gap-6">
            <a href="https://changelog.startvest.ai" className="hover:text-white transition-colors">
              Changelog AI
            </a>
            <a href="https://idealift.io" className="hover:text-white transition-colors">
              IdeaLift
            </a>
            <a href="https://startvest.ai" className="hover:text-white transition-colors">
              Startvest
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
