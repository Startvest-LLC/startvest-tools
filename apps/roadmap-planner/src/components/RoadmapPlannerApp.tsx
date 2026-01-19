'use client';

import { useState, useCallback, useRef } from 'react';
import { trackExport, trackPaidProductClick } from '@/lib/analytics';

type ItemStatus = 'planned' | 'in-progress' | 'completed' | 'at-risk';
type ItemCategory = 'feature' | 'improvement' | 'bug' | 'tech-debt' | 'research';
type TimeFrame = 'Q1' | 'Q2' | 'Q3' | 'Q4';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  status: ItemStatus;
  timeframe: TimeFrame;
  lane: string;
}

interface Lane {
  id: string;
  name: string;
  color: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const defaultLanes: Lane[] = [
  { id: 'product', name: 'Product', color: 'bg-blue-500' },
  { id: 'engineering', name: 'Engineering', color: 'bg-purple-500' },
  { id: 'design', name: 'Design', color: 'bg-pink-500' },
];

const timeframes: TimeFrame[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const statusConfig: Record<ItemStatus, { label: string; color: string; bg: string }> = {
  'planned': { label: 'Planned', color: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/30' },
  'in-progress': { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  'completed': { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  'at-risk': { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
};

const categoryConfig: Record<ItemCategory, { label: string; icon: string; color: string }> = {
  'feature': { label: 'Feature', icon: '✨', color: 'bg-emerald-500' },
  'improvement': { label: 'Improvement', icon: '📈', color: 'bg-blue-500' },
  'bug': { label: 'Bug Fix', icon: '🐛', color: 'bg-red-500' },
  'tech-debt': { label: 'Tech Debt', icon: '🔧', color: 'bg-orange-500' },
  'research': { label: 'Research', icon: '🔬', color: 'bg-purple-500' },
};

const exampleItems: RoadmapItem[] = [
  { id: '1', title: 'User Authentication v2', description: 'Implement OAuth and SSO', category: 'feature', status: 'completed', timeframe: 'Q1', lane: 'engineering' },
  { id: '2', title: 'Dashboard Redesign', description: 'New analytics dashboard UI', category: 'feature', status: 'in-progress', timeframe: 'Q2', lane: 'design' },
  { id: '3', title: 'API Rate Limiting', description: 'Implement rate limiting for public API', category: 'improvement', status: 'in-progress', timeframe: 'Q2', lane: 'engineering' },
  { id: '4', title: 'Mobile App Launch', description: 'iOS and Android app release', category: 'feature', status: 'planned', timeframe: 'Q3', lane: 'product' },
  { id: '5', title: 'Performance Optimization', description: 'Reduce load times by 50%', category: 'tech-debt', status: 'planned', timeframe: 'Q3', lane: 'engineering' },
  { id: '6', title: 'User Research Study', description: 'Interview 50 customers', category: 'research', status: 'planned', timeframe: 'Q2', lane: 'product' },
  { id: '7', title: 'Billing System Update', description: 'Migrate to new payment processor', category: 'improvement', status: 'at-risk', timeframe: 'Q4', lane: 'engineering' },
  { id: '8', title: 'Design System v2', description: 'Component library overhaul', category: 'improvement', status: 'planned', timeframe: 'Q4', lane: 'design' },
];

function generateMarkdown(items: RoadmapItem[], lanes: Lane[], year: number): string {
  let md = `# Product Roadmap ${year}\n\n`;

  timeframes.forEach(tf => {
    const tfItems = items.filter(i => i.timeframe === tf);
    if (tfItems.length === 0) return;

    md += `## ${tf} ${year}\n\n`;

    lanes.forEach(lane => {
      const laneItems = tfItems.filter(i => i.lane === lane.id);
      if (laneItems.length === 0) return;

      md += `### ${lane.name}\n\n`;
      laneItems.forEach(item => {
        const status = statusConfig[item.status];
        const category = categoryConfig[item.category];
        md += `- ${category.icon} **${item.title}** - ${item.description} _(${status.label})_\n`;
      });
      md += '\n';
    });
  });

  md += `---\n\n_Generated with [Roadmap Planner](https://roadmap.tools.startvest.ai)_\n`;
  return md;
}

export default function RoadmapPlannerApp() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [lanes, setLanes] = useState<Lane[]>(defaultLanes);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<RoadmapItem | null>(null);
  const [showLaneModal, setShowLaneModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const roadmapRef = useRef<HTMLDivElement>(null);

  const [newItem, setNewItem] = useState<Omit<RoadmapItem, 'id'>>({
    title: '',
    description: '',
    category: 'feature',
    status: 'planned',
    timeframe: 'Q1',
    lane: lanes[0]?.id || 'product',
  });

  const [newLane, setNewLane] = useState({ name: '', color: 'bg-blue-500' });

  const loadExample = () => {
    setItems(exampleItems);
    setLanes(defaultLanes);
  };

  const addItem = () => {
    if (!newItem.title.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: generateId() }]);
    setNewItem({
      title: '',
      description: '',
      category: 'feature',
      status: 'planned',
      timeframe: 'Q1',
      lane: lanes[0]?.id || 'product',
    });
    setShowAddModal(false);
  };

  const updateItem = () => {
    if (!editingItem) return;
    setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setEditingItem(null);
  };

  const addLane = () => {
    if (!newLane.name.trim()) return;
    setLanes(prev => [...prev, { ...newLane, id: generateId() }]);
    setNewLane({ name: '', color: 'bg-blue-500' });
    setShowLaneModal(false);
  };

  const deleteLane = (id: string) => {
    setLanes(prev => prev.filter(l => l.id !== id));
    setItems(prev => prev.filter(i => i.lane !== id));
  };

  const handleDragStart = (item: RoadmapItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (timeframe: TimeFrame, laneId: string) => {
    if (!draggedItem) return;
    setItems(prev => prev.map(i =>
      i.id === draggedItem.id ? { ...i, timeframe, lane: laneId } : i
    ));
    setDraggedItem(null);
  };

  const copyMarkdown = useCallback(() => {
    trackExport('clipboard_markdown', 'roadmap_planner');
    const md = generateMarkdown(items, lanes, year);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [items, lanes, year]);

  const downloadMarkdown = useCallback(() => {
    trackExport('download_markdown', 'roadmap_planner');
    const md = generateMarkdown(items, lanes, year);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-${year}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items, lanes, year]);

  const laneColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500',
    'bg-orange-500', 'bg-red-500', 'bg-cyan-500', 'bg-yellow-500'
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Roadmap Planner
            </span>
          </h1>
          <p className="text-slate-400">
            Create beautiful product roadmaps. Drag and drop to organize.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-slate-400 text-sm">Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                onClick={() => setShowLaneModal(true)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                Manage Lanes
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadExample}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Roadmap Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden mb-6" ref={roadmapRef}>
          {/* Timeline Header */}
          <div className="grid border-b border-slate-700/50" style={{ gridTemplateColumns: '180px repeat(4, 1fr)' }}>
            <div className="p-4 bg-slate-900/50 border-r border-slate-700/50">
              <span className="text-slate-400 font-medium">{year}</span>
            </div>
            {timeframes.map(tf => (
              <div key={tf} className="p-4 text-center border-r border-slate-700/50 last:border-r-0 bg-slate-900/30">
                <span className="font-semibold text-white">{tf}</span>
              </div>
            ))}
          </div>

          {/* Lanes */}
          {lanes.map(lane => (
            <div
              key={lane.id}
              className="grid border-b border-slate-700/50 last:border-b-0"
              style={{ gridTemplateColumns: '180px repeat(4, 1fr)' }}
            >
              {/* Lane Label */}
              <div className="p-4 bg-slate-900/30 border-r border-slate-700/50 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${lane.color}`}></div>
                <span className="font-medium text-white">{lane.name}</span>
              </div>

              {/* Timeframe Cells */}
              {timeframes.map(tf => {
                const cellItems = items.filter(i => i.lane === lane.id && i.timeframe === tf);
                return (
                  <div
                    key={tf}
                    className="p-3 border-r border-slate-700/50 last:border-r-0 min-h-[120px] transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(tf, lane.id)}
                  >
                    <div className="flex flex-col gap-2">
                      {cellItems.map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(item)}
                          onClick={() => setEditingItem(item)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${statusConfig[item.status].bg}`}
                        >
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-sm">{categoryConfig[item.category].icon}</span>
                            <span className="font-medium text-sm text-white line-clamp-2">{item.title}</span>
                          </div>
                          <div className={`text-xs ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {lanes.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No lanes defined. Add lanes to start building your roadmap.
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Export Roadmap</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyMarkdown}
              disabled={items.length === 0}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy Markdown'}
            </button>
            <button
              onClick={downloadMarkdown}
              disabled={items.length === 0}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
            >
              Download .md
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Legend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Status</h3>
              <div className="space-y-2">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.bg.split(' ')[0].replace('/20', '')}`}></div>
                    <span className="text-sm text-slate-300">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Category</h3>
              <div className="space-y-2">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm">{config.icon}</span>
                    <span className="text-sm text-slate-300">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Need to capture product ideas from your team?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            IdeaLift helps product teams collect, organize, and prioritize feature requests from Slack, Discord, and more.
            Turn scattered feedback into actionable roadmap items.
          </p>
          <a
            href="https://idealift.ai?utm_source=roadmap-planner&utm_medium=free-tool&utm_campaign=cta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
          >
            Try IdeaLift Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm space-y-2">
          <p>
            Built by{' '}
            <a href="https://startvest.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              Startvest
            </a>
            {' '}| Free to use, no sign-up required
          </p>
          <p>
            <a href="/llms.txt" className="text-slate-600 hover:text-slate-400">
              AI-readable version
            </a>
          </p>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Roadmap Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Feature name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none"
                  rows={2}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem(prev => ({ ...prev, status: e.target.value as ItemStatus }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Timeframe</label>
                  <select
                    value={newItem.timeframe}
                    onChange={(e) => setNewItem(prev => ({ ...prev, timeframe: e.target.value as TimeFrame }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {timeframes.map(tf => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Lane</label>
                  <select
                    value={newItem.lane}
                    onChange={(e) => setNewItem(prev => ({ ...prev, lane: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {lanes.map(lane => (
                      <option key={lane.id} value={lane.id}>{lane.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                disabled={!newItem.title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value as ItemCategory } : null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, status: e.target.value as ItemStatus } : null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Timeframe</label>
                  <select
                    value={editingItem.timeframe}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, timeframe: e.target.value as TimeFrame } : null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {timeframes.map(tf => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Lane</label>
                  <select
                    value={editingItem.lane}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, lane: e.target.value } : null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    {lanes.map(lane => (
                      <option key={lane.id} value={lane.id}>{lane.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => deleteItem(editingItem.id)}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateItem}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Lanes Modal */}
      {showLaneModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Manage Lanes</h2>

            {/* Existing Lanes */}
            <div className="space-y-2 mb-6">
              {lanes.map(lane => (
                <div key={lane.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${lane.color}`}></div>
                    <span>{lane.name}</span>
                  </div>
                  <button
                    onClick={() => deleteLane(lane.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {lanes.length === 0 && (
                <p className="text-slate-500 text-center py-4">No lanes yet. Add one below.</p>
              )}
            </div>

            {/* Add New Lane */}
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Add New Lane</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newLane.name}
                  onChange={(e) => setNewLane(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Lane name"
                />
                <select
                  value={newLane.color}
                  onChange={(e) => setNewLane(prev => ({ ...prev, color: e.target.value }))}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {laneColors.map(color => (
                    <option key={color} value={color}>{color.replace('bg-', '').replace('-500', '')}</option>
                  ))}
                </select>
                <button
                  onClick={addLane}
                  disabled={!newLane.name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLaneModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
