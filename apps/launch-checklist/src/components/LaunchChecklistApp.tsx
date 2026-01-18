'use client';

import { useState, useEffect, useMemo } from 'react';
import { LAUNCH_TEMPLATES, getTemplate } from '@/lib/templates';
import { TemplateType, CategoryType, ChecklistState, CATEGORY_INFO } from '@/lib/types';
import { deserializeState, generateShareUrl } from '@/lib/url-state';
import { downloadMarkdown, printChecklist } from '@/lib/export';
import { trackTemplateSelect, trackItemToggle, trackExport, trackShare } from '@/lib/analytics';
import { TrackedLink } from './TrackedLink';

export default function LaunchChecklistApp() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryType>>(
    new Set<CategoryType>(['pre-launch', 'launch-day', 'post-launch'])
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load state from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('s');

    if (stateParam) {
      const decoded = deserializeState(stateParam);
      if (decoded) {
        if (decoded.template) setSelectedTemplate(decoded.template);
        if (decoded.checkedItems) setCheckedItems(decoded.checkedItems);
        if (decoded.notes) setNotes(decoded.notes);
      }
    }
  }, []);

  const template = selectedTemplate ? getTemplate(selectedTemplate) : null;

  const progress = useMemo(() => {
    const emptyByCategory: Record<CategoryType, { total: number; completed: number; percentage: number }> = {
      'pre-launch': { total: 0, completed: 0, percentage: 0 },
      'launch-day': { total: 0, completed: 0, percentage: 0 },
      'post-launch': { total: 0, completed: 0, percentage: 0 },
    };
    if (!template) return { total: 0, completed: 0, percentage: 0, byCategory: emptyByCategory };

    const total = template.items.length;
    const completed = checkedItems.size;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byCategory: Record<CategoryType, { total: number; completed: number; percentage: number }> = {
      'pre-launch': { total: 0, completed: 0, percentage: 0 },
      'launch-day': { total: 0, completed: 0, percentage: 0 },
      'post-launch': { total: 0, completed: 0, percentage: 0 },
    };

    template.items.forEach(item => {
      byCategory[item.category].total++;
      if (checkedItems.has(item.id)) {
        byCategory[item.category].completed++;
      }
    });

    Object.keys(byCategory).forEach(cat => {
      const c = byCategory[cat as CategoryType];
      c.percentage = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
    });

    return { total, completed, percentage, byCategory };
  }, [template, checkedItems]);

  const handleTemplateSelect = (id: TemplateType) => {
    setSelectedTemplate(id);
    setCheckedItems(new Set());
    setNotes({});
    trackTemplateSelect(id);
  };

  const handleItemToggle = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    const isChecking = !newChecked.has(itemId);

    if (isChecking) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    setCheckedItems(newChecked);

    if (template) {
      const newProgress = Math.round((newChecked.size / template.items.length) * 100);
      trackItemToggle(selectedTemplate!, isChecking, newProgress);
    }
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const toggleCategory = (category: CategoryType) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleExportMarkdown = () => {
    if (!template) return;
    trackExport('markdown');
    downloadMarkdown(template, { template: selectedTemplate!, checkedItems, notes });
  };

  const handlePrint = () => {
    trackExport('print');
    printChecklist();
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareUrl = useMemo(() => {
    if (!selectedTemplate) return '';
    return generateShareUrl({ template: selectedTemplate, checkedItems, notes });
  }, [selectedTemplate, checkedItems, notes]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare('copy_link', selectedTemplate!, progress.percentage);
  };

  const handleShareTwitter = () => {
    trackShare('twitter', selectedTemplate!, progress.percentage);
    const text = `I'm ${progress.percentage}% ready to launch my ${template?.name}! 🚀\n\nUsing the free Product Launch Checklist:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Template Selection Screen
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-500/30">
              <span>📋 Free Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Product Launch Checklist
              </span>
              <span className="block text-2xl md:text-3xl mt-2 text-slate-400 font-medium">
                (Free SaaS Launch Checklist)
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete checklist for launching a SaaS product &mdash; before, during, and after launch.
            </p>
          </div>

          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LAUNCH_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
                className="text-left bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all group"
              >
                <div className="text-4xl mb-4">{t.icon}</div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {t.name}
                </h2>
                <p className="text-slate-400 mb-4">{t.description}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{t.items.length} items</span>
                  <span>•</span>
                  <span>{t.items.filter(i => i.critical).length} critical</span>
                </div>
              </button>
            ))}
          </div>

          {/* Subtle CTA - Seed */}
          <div className="mt-12 text-center text-slate-400 text-sm">
            <p>After launch, the most important work begins: collecting feedback and deciding what to build next.</p>
          </div>

          {/* What's included SEO section */}
          <div className="mt-12 border-t border-slate-700/50 pt-12">
            <h2 className="text-2xl font-bold text-white mb-6">What&apos;s included in this product launch checklist?</h2>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-slate-300">Pre-launch planning and setup</strong> &mdash; branding, legal, technical infrastructure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-slate-300">Pricing and payments</strong> &mdash; billing setup, pricing page, payment testing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-slate-300">Legal and compliance basics</strong> &mdash; terms of service, privacy policy, GDPR</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-slate-300">Launch day execution</strong> &mdash; announcements, monitoring, support readiness</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-slate-300">Post-launch feedback and iteration</strong> &mdash; user feedback collection, prioritization, roadmap</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-slate-500 text-sm">
            <p>
              Built by{' '}
              <a href="https://startvest.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                StartVest
              </a>
              {' '}&mdash; free tools for product teams
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Checklist Screen
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to templates
          </button>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Share
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Export
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        {/* Title & Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{template?.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{template?.name}</h1>
              <p className="text-slate-400">{template?.description}</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Progress</span>
              <span className="text-sm font-medium text-white">
                {progress.completed}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(progress.percentage)} transition-all duration-300`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Category Progress */}
          <div className="grid grid-cols-3 gap-4">
            {(['pre-launch', 'launch-day', 'post-launch'] as CategoryType[]).map(cat => (
              <div key={cat} className="text-center">
                <div className="text-xs text-slate-500 mb-1">{CATEGORY_INFO[cat].label}</div>
                <div className="text-lg font-bold text-white">{progress.byCategory[cat]?.percentage || 0}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reassurance Line */}
        <p className="text-center text-slate-500 text-sm mb-6">
          Don&apos;t worry &mdash; most teams complete this checklist over weeks, not days.
        </p>

        {/* Checklist Categories */}
        {(['pre-launch', 'launch-day', 'post-launch'] as CategoryType[]).map(category => {
          const categoryItems = template?.items.filter(i => i.category === category) || [];
          const isExpanded = expandedCategories.has(category);
          const catProgress = progress.byCategory[category];

          return (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">{CATEGORY_INFO[category].label}</h2>
                    <p className="text-sm text-slate-400">{CATEGORY_INFO[category].description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {catProgress?.completed}/{catProgress?.total}
                  </span>
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(catProgress?.percentage || 0)} transition-all duration-300`}
                      style={{ width: `${catProgress?.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`checklist-item bg-slate-800/30 rounded-xl border ${
                        checkedItems.has(item.id) ? 'border-green-500/30' : 'border-slate-700/30'
                      } p-4 transition-colors`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleItemToggle(item.id)}
                          className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            checkedItems.has(item.id)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-500 hover:border-blue-500'
                          }`}
                        >
                          {checkedItems.has(item.id) && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-white ${checkedItems.has(item.id) ? 'line-through text-slate-500' : ''}`}
                            >
                              {item.text}
                            </span>
                            {item.critical && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                Critical
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                          )}
                          <input
                            type="text"
                            placeholder="Add a note..."
                            value={notes[item.id] || ''}
                            onChange={e => handleNoteChange(item.id, e.target.value)}
                            className="mt-2 w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Post-Launch Next Step CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 no-print">
          <h2 className="text-xl font-bold mb-4 text-slate-200">What comes after launch?</h2>
          <p className="text-slate-300 mb-4 max-w-2xl">
            Once users start using your product, you&apos;ll need a way to capture feedback, track feature requests, and prioritize improvements.
          </p>
          <p className="text-slate-400 mb-6 max-w-2xl text-sm">
            IdeaLift helps teams turn real user conversations into a clear post-launch roadmap.
          </p>
          <TrackedLink
            href="https://idealift.startvest.ai?utm_source=launch-checklist&utm_medium=free-tool&utm_campaign=post-launch-cta"
            trackingType="paid_product"
            trackingSource="launch-checklist"
            trackingProduct="idealift"
            external
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors text-slate-200"
          >
            See how post-launch teams prioritize
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </TrackedLink>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm no-print">
          <p>
            Built by{' '}
            <a href="https://startvest.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              StartVest
            </a>
            {' '}&mdash; free tools for product teams
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Share Your Progress</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-slate-400 mb-4">
              Share this link to let others see your checklist progress:
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShareTwitter}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
