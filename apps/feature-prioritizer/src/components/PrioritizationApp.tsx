'use client';

import { useState, useCallback } from 'react';
import { Feature } from '@/lib/types';
import {
  calculateRICEScore,
  getPriority,
  prioritizeFeatures,
  generateId,
  exportToCSV,
  exportToMarkdown,
} from '@/lib/prioritize';
import { trackToolUse, trackExport } from '@/lib/analytics';

const exampleFeatures: Omit<Feature, 'id' | 'riceScore' | 'priority'>[] = [
  { name: 'Dark mode', description: 'Add dark theme support', reach: 8, impact: 6, confidence: 9, effort: 7 },
  { name: 'Export to PDF', description: 'Allow exporting reports as PDF', reach: 5, impact: 7, confidence: 8, effort: 4 },
  { name: 'SSO login', description: 'Enterprise single sign-on', reach: 3, impact: 9, confidence: 7, effort: 2 },
  { name: 'Mobile app', description: 'Native iOS and Android apps', reach: 9, impact: 8, confidence: 5, effort: 1 },
  { name: 'Keyboard shortcuts', description: 'Power user keyboard navigation', reach: 4, impact: 5, confidence: 9, effort: 8 },
];

export default function PrioritizationApp() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reach, setReach] = useState(5);
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [effort, setEffort] = useState(5);

  const resetForm = () => {
    setName('');
    setDescription('');
    setReach(5);
    setImpact(5);
    setConfidence(5);
    setEffort(5);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddFeature = () => {
    if (!name.trim()) return;

    const riceScore = calculateRICEScore({ name, description, reach, impact, confidence, effort });
    const priority = getPriority(riceScore);

    if (editingId) {
      setFeatures(features.map(f =>
        f.id === editingId
          ? { ...f, name, description, reach, impact, confidence, effort, riceScore, priority }
          : f
      ));
    } else {
      const newFeature: Feature = {
        id: generateId(),
        name,
        description,
        reach,
        impact,
        confidence,
        effort,
        riceScore,
        priority,
      };
      setFeatures([...features, newFeature]);
    }

    resetForm();
  };

  const handleEdit = (feature: Feature) => {
    setName(feature.name);
    setDescription(feature.description);
    setReach(feature.reach);
    setImpact(feature.impact);
    setConfidence(feature.confidence);
    setEffort(feature.effort);
    setEditingId(feature.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  const loadExamples = () => {
    trackToolUse('feature_prioritizer', 'load_examples');
    const examplesWithScores = exampleFeatures.map(f => {
      const riceScore = calculateRICEScore(f);
      return {
        ...f,
        id: generateId(),
        riceScore,
        priority: getPriority(riceScore),
      };
    });
    setFeatures(examplesWithScores);
  };

  const handleExportCSV = () => {
    trackExport('csv', 'feature_prioritizer');
    const result = prioritizeFeatures(features);
    const csv = exportToCSV(result.features);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-prioritization.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = useCallback(async () => {
    const result = prioritizeFeatures(features);
    const md = exportToMarkdown(result.features);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [features]);

  const result = features.length > 0 ? prioritizeFeatures(features) : null;

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[priority];
  };

  return (
    <main className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-cyan-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Free Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Feature Prioritization Matrix
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Use the RICE framework to score and prioritize your product features.
          Find quick wins and identify your big bets.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Feature
            </button>
            {features.length === 0 && (
              <button
                onClick={loadExamples}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Load Examples
              </button>
            )}
          </div>
          {features.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
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
                    Copy Markdown
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingId ? 'Edit Feature' : 'Add Feature'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Feature Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Dark mode support"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the feature"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* RICE Sliders */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        Reach <span className="text-slate-500 font-normal">- How many users?</span>
                      </label>
                      <span className="text-cyan-400 font-semibold">{reach}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reach}
                      onChange={(e) => setReach(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Few users</span>
                      <span>All users</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        Impact <span className="text-slate-500 font-normal">- How much value?</span>
                      </label>
                      <span className="text-cyan-400 font-semibold">{impact}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={impact}
                      onChange={(e) => setImpact(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Minimal</span>
                      <span>Massive</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        Confidence <span className="text-slate-500 font-normal">- How sure?</span>
                      </label>
                      <span className="text-cyan-400 font-semibold">{confidence}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Uncertain</span>
                      <span>Certain</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        Effort <span className="text-slate-500 font-normal">- How easy?</span>
                      </label>
                      <span className="text-cyan-400 font-semibold">{effort}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={effort}
                      onChange={(e) => setEffort(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Hard (months)</span>
                      <span>Easy (days)</span>
                    </div>
                  </div>
                </div>

                {/* Preview Score */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">RICE Score Preview</span>
                    <span className={`text-2xl font-bold ${getScoreColor(calculateRICEScore({ name, description, reach, impact, confidence, effort }))}`}>
                      {calculateRICEScore({ name, description, reach, impact, confidence, effort })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFeature}
                    disabled={!name.trim()}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                  >
                    {editingId ? 'Update' : 'Add Feature'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Table */}
        {features.length > 0 && result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Total Features</p>
                <p className="text-2xl font-bold text-white">{features.length}</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                <p className="text-red-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-red-400">{result.summary.highPriority}</p>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <p className="text-yellow-400 text-sm">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-400">{result.summary.mediumPriority}</p>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <p className="text-green-400 text-sm">Low Priority</p>
                <p className="text-2xl font-bold text-green-400">{result.summary.lowPriority}</p>
              </div>
            </div>

            {/* Quick Wins & Big Bets */}
            {(result.summary.quickWins.length > 0 || result.summary.bigBets.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4">
                {result.summary.quickWins.length > 0 && (
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Quick Wins
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">High impact, low effort</p>
                    <ul className="space-y-1">
                      {result.summary.quickWins.map(f => (
                        <li key={f.id} className="text-white text-sm">{f.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.summary.bigBets.length > 0 && (
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Big Bets
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">High impact, high effort</p>
                    <ul className="space-y-1">
                      {result.summary.bigBets.map(f => (
                        <li key={f.id} className="text-white text-sm">{f.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Features Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-slate-300">#</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-slate-300">Feature</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">RICE</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">Priority</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">R</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">I</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">C</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">E</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.features.map((feature, index) => (
                      <tr key={feature.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <p className="text-white font-medium">{feature.name}</p>
                          {feature.description && (
                            <p className="text-slate-500 text-sm">{feature.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold text-lg ${getScoreColor(feature.riceScore)}`}>
                            {feature.riceScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(feature.priority)}`}>
                            {feature.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">{feature.reach}</td>
                        <td className="py-3 px-4 text-center text-slate-400">{feature.impact}</td>
                        <td className="py-3 px-4 text-center text-slate-400">{feature.confidence}</td>
                        <td className="py-3 px-4 text-center text-slate-400">{feature.effort}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(feature)}
                              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(feature.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IdeaLift CTA */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Tired of Manual Prioritization?
              </h2>
              <p className="text-cyan-100 mb-6 max-w-lg mx-auto">
                IdeaLift captures feature requests from Slack, Discord, and Teams automatically.
                AI clusters similar ideas and helps you prioritize based on real user demand.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://idealift.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Try IdeaLift Free
                </a>
                <span className="text-cyan-200 text-sm">50 ideas/month free</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {features.length === 0 && (
          <div className="space-y-8">
            {/* How RICE Works */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">How RICE Scoring Works</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-cyan-400">R</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Reach</h3>
                  <p className="text-sm text-slate-400">How many users will this feature affect?</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-cyan-400">I</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Impact</h3>
                  <p className="text-sm text-slate-400">How much will it improve the user experience?</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-cyan-400">C</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Confidence</h3>
                  <p className="text-sm text-slate-400">How confident are you in your estimates?</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-cyan-400">E</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">Effort</h3>
                  <p className="text-sm text-slate-400">How much work is required to build it?</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-900 rounded-xl text-center">
                <p className="text-slate-400 text-sm">
                  <span className="text-cyan-400 font-mono">RICE Score = (Reach x Impact x Confidence) / Effort</span>
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Find Quick Wins</h3>
                <p className="text-sm text-slate-400">
                  Identify high-impact features that require minimal effort to implement.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Data-Driven Decisions</h3>
                <p className="text-sm text-slate-400">
                  Replace gut feelings with objective scoring based on the RICE framework.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Export & Share</h3>
                <p className="text-sm text-slate-400">
                  Export your prioritized list as CSV or Markdown to share with your team.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 text-lg"
              >
                Start Prioritizing Features
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
            <a href="https://startvest.ai" className="text-cyan-400 hover:text-cyan-300">
              Startvest
            </a>
          </p>
          <div className="flex items-center gap-6">
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
