'use client';

import { useState, useCallback, useRef } from 'react';
import { trackExport, trackPaidProductClick } from '@/lib/analytics';

interface Persona {
  name: string;
  avatar: string;
  tagline: string;
  age: string;
  occupation: string;
  location: string;
  education: string;
  income: string;
  bio: string;
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  channels: string[];
  quote: string;
  techSavviness: 'low' | 'medium' | 'high';
  personality: {
    introvert: number;
    analytical: number;
    spontaneous: number;
    traditional: number;
  };
}

const defaultPersona: Persona = {
  name: '',
  avatar: '👤',
  tagline: '',
  age: '',
  occupation: '',
  location: '',
  education: '',
  income: '',
  bio: '',
  goals: [],
  painPoints: [],
  behaviors: [],
  channels: [],
  quote: '',
  techSavviness: 'medium',
  personality: {
    introvert: 50,
    analytical: 50,
    spontaneous: 50,
    traditional: 50,
  },
};

const examplePersona: Persona = {
  name: 'Sarah Chen',
  avatar: '👩‍💼',
  tagline: 'The Ambitious Product Manager',
  age: '32',
  occupation: 'Senior Product Manager at a SaaS startup',
  location: 'San Francisco, CA',
  education: "MBA from Stanford, BS in Computer Science",
  income: '$150,000 - $180,000',
  bio: 'Sarah is a driven product manager with 8 years of experience in B2B SaaS. She transitioned from engineering to product management because she loves understanding user problems and building solutions. She manages a team of 3 PMs and reports directly to the VP of Product.',
  goals: [
    'Ship features that measurably impact key metrics',
    'Build a world-class product team',
    'Stay ahead of market trends and competition',
    'Improve cross-functional collaboration',
  ],
  painPoints: [
    'Too much time spent in meetings instead of strategic work',
    'Difficulty prioritizing between competing stakeholder demands',
    'Lack of reliable user feedback data',
    'Technical debt slowing down feature velocity',
  ],
  behaviors: [
    'Checks Slack and email first thing every morning',
    'Uses data to back up every product decision',
    'Conducts weekly 1:1s with direct reports',
    'Attends 2-3 industry conferences per year',
  ],
  channels: ['Slack', 'LinkedIn', 'Twitter/X', 'Product Hunt', 'Industry newsletters'],
  quote: '"I don\'t want more features, I want the right features that solve real problems."',
  techSavviness: 'high',
  personality: {
    introvert: 35,
    analytical: 75,
    spontaneous: 40,
    traditional: 30,
  },
};

const avatarOptions = ['👤', '👩', '👨', '👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🏫', '👨‍🏫', '🧑‍💼', '🧑‍💻'];

function generateMarkdown(persona: Persona): string {
  let md = `# User Persona: ${persona.name}\n\n`;
  md += `> ${persona.quote}\n\n`;
  md += `**${persona.tagline}**\n\n`;
  md += `---\n\n`;

  md += `## Demographics\n\n`;
  md += `| Attribute | Value |\n|-----------|-------|\n`;
  md += `| Age | ${persona.age} |\n`;
  md += `| Occupation | ${persona.occupation} |\n`;
  md += `| Location | ${persona.location} |\n`;
  md += `| Education | ${persona.education} |\n`;
  md += `| Income | ${persona.income} |\n\n`;

  md += `## Bio\n\n${persona.bio}\n\n`;

  if (persona.goals.length > 0) {
    md += `## Goals\n\n`;
    persona.goals.forEach(g => md += `- ${g}\n`);
    md += '\n';
  }

  if (persona.painPoints.length > 0) {
    md += `## Pain Points\n\n`;
    persona.painPoints.forEach(p => md += `- ${p}\n`);
    md += '\n';
  }

  if (persona.behaviors.length > 0) {
    md += `## Behaviors\n\n`;
    persona.behaviors.forEach(b => md += `- ${b}\n`);
    md += '\n';
  }

  if (persona.channels.length > 0) {
    md += `## Preferred Channels\n\n`;
    md += persona.channels.join(', ') + '\n\n';
  }

  md += `## Tech Savviness\n\n${persona.techSavviness.charAt(0).toUpperCase() + persona.techSavviness.slice(1)}\n\n`;

  md += `## Personality\n\n`;
  md += `- Introvert ←→ Extrovert: ${persona.personality.introvert}% introvert\n`;
  md += `- Analytical ←→ Creative: ${persona.personality.analytical}% analytical\n`;
  md += `- Spontaneous ←→ Planned: ${persona.personality.spontaneous}% spontaneous\n`;
  md += `- Traditional ←→ Innovative: ${persona.personality.traditional}% traditional\n\n`;

  md += `---\n\n_Generated with [User Persona Generator](https://persona.startvest.ai)_\n`;
  return md;
}

export default function PersonaGeneratorApp() {
  const [persona, setPersona] = useState<Persona>(defaultPersona);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [tempGoal, setTempGoal] = useState('');
  const [tempPain, setTempPain] = useState('');
  const [tempBehavior, setTempBehavior] = useState('');
  const [tempChannel, setTempChannel] = useState('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const loadExample = () => setPersona(examplePersona);
  const resetForm = () => setPersona(defaultPersona);

  const addItem = (field: 'goals' | 'painPoints' | 'behaviors' | 'channels', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setPersona(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setter('');
  };

  const removeItem = (field: 'goals' | 'painPoints' | 'behaviors' | 'channels', index: number) => {
    setPersona(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const copyMarkdown = useCallback(() => {
    trackExport('clipboard_markdown', 'persona_generator');
    navigator.clipboard.writeText(generateMarkdown(persona));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [persona]);

  const downloadMarkdown = useCallback(() => {
    trackExport('download_markdown', 'persona_generator');
    const blob = new Blob([generateMarkdown(persona)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persona-${persona.name.toLowerCase().replace(/\s+/g, '-') || 'unnamed'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [persona]);

  const printPersona = () => { trackExport('print', 'persona_generator'); window.print(); };

  const PersonaSlider = ({ label, leftLabel, rightLabel, value, onChange }: { label: string; leftLabel: string; rightLabel: string; value: number; onChange: (v: number) => void }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-20">{leftLabel}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="text-xs text-slate-500 w-20 text-right">{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 no-print">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              User Persona Generator
            </span>
          </h1>
          <p className="text-slate-400">Create detailed user personas for your product</p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 mb-6 no-print">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Preview
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={loadExample} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                Load Example
              </button>
              <button onClick={resetForm} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Avatar</label>
                    <select
                      value={persona.avatar}
                      onChange={(e) => setPersona(prev => ({ ...prev, avatar: e.target.value }))}
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-2xl"
                    >
                      {avatarOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={persona.name}
                      onChange={(e) => setPersona(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      placeholder="e.g., Sarah Chen"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={persona.tagline}
                    onChange={(e) => setPersona(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g., The Ambitious Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Representative Quote</label>
                  <input
                    type="text"
                    value={persona.quote}
                    onChange={(e) => setPersona(prev => ({ ...prev, quote: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="A quote that captures their mindset..."
                  />
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Demographics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                  <input
                    type="text"
                    value={persona.age}
                    onChange={(e) => setPersona(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g., 32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={persona.location}
                    onChange={(e) => setPersona(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={persona.occupation}
                    onChange={(e) => setPersona(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g., Senior Product Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Education</label>
                  <input
                    type="text"
                    value={persona.education}
                    onChange={(e) => setPersona(prev => ({ ...prev, education: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g., MBA, Stanford"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Income Range</label>
                  <input
                    type="text"
                    value={persona.income}
                    onChange={(e) => setPersona(prev => ({ ...prev, income: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g., $150k-$180k"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Bio / Background</h2>
              <textarea
                value={persona.bio}
                onChange={(e) => setPersona(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none"
                rows={3}
                placeholder="A brief background about this persona..."
              />
            </div>

            {/* Goals */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Goals</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('goals', tempGoal, setTempGoal)}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Add a goal..."
                />
                <button onClick={() => addItem('goals', tempGoal, setTempGoal)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg">+</button>
              </div>
              <ul className="space-y-2">
                {persona.goals.map((g, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                    <span className="text-sm">🎯 {g}</span>
                    <button onClick={() => removeItem('goals', i)} className="text-red-400 hover:text-red-300 text-sm">×</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pain Points */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Pain Points</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempPain}
                  onChange={(e) => setTempPain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('painPoints', tempPain, setTempPain)}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Add a pain point..."
                />
                <button onClick={() => addItem('painPoints', tempPain, setTempPain)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg">+</button>
              </div>
              <ul className="space-y-2">
                {persona.painPoints.map((p, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                    <span className="text-sm">😫 {p}</span>
                    <button onClick={() => removeItem('painPoints', i)} className="text-red-400 hover:text-red-300 text-sm">×</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Behaviors */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Behaviors</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempBehavior}
                  onChange={(e) => setTempBehavior(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('behaviors', tempBehavior, setTempBehavior)}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Add a behavior..."
                />
                <button onClick={() => addItem('behaviors', tempBehavior, setTempBehavior)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg">+</button>
              </div>
              <ul className="space-y-2">
                {persona.behaviors.map((b, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                    <span className="text-sm">📋 {b}</span>
                    <button onClick={() => removeItem('behaviors', i)} className="text-red-400 hover:text-red-300 text-sm">×</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Channels */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Preferred Channels</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempChannel}
                  onChange={(e) => setTempChannel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('channels', tempChannel, setTempChannel)}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Add a channel..."
                />
                <button onClick={() => addItem('channels', tempChannel, setTempChannel)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {persona.channels.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700 rounded-full text-sm">
                    {c}
                    <button onClick={() => removeItem('channels', i)} className="text-red-400 hover:text-red-300">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tech & Personality */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Tech Savviness & Personality</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tech Savviness</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setPersona(prev => ({ ...prev, techSavviness: level }))}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${persona.techSavviness === level ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <PersonaSlider label="" leftLabel="Introvert" rightLabel="Extrovert" value={persona.personality.introvert} onChange={(v) => setPersona(prev => ({ ...prev, personality: { ...prev.personality, introvert: v } }))} />
                  <PersonaSlider label="" leftLabel="Analytical" rightLabel="Creative" value={persona.personality.analytical} onChange={(v) => setPersona(prev => ({ ...prev, personality: { ...prev.personality, analytical: v } }))} />
                  <PersonaSlider label="" leftLabel="Spontaneous" rightLabel="Planned" value={persona.personality.spontaneous} onChange={(v) => setPersona(prev => ({ ...prev, personality: { ...prev.personality, spontaneous: v } }))} />
                  <PersonaSlider label="" leftLabel="Traditional" rightLabel="Innovative" value={persona.personality.traditional} onChange={(v) => setPersona(prev => ({ ...prev, personality: { ...prev.personality, traditional: v } }))} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Card */
          <div ref={cardRef} className="persona-card rounded-2xl border border-slate-700/50 p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-6 mb-6">
              <div className="text-6xl">{persona.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold">{persona.name || 'Unnamed Persona'}</h2>
                <p className="text-blue-400 font-medium">{persona.tagline}</p>
                {persona.quote && <p className="text-slate-400 italic mt-2">"{persona.quote}"</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Demographics</h3>
                <div className="space-y-2 text-sm">
                  {persona.age && <p><span className="text-slate-500">Age:</span> {persona.age}</p>}
                  {persona.occupation && <p><span className="text-slate-500">Occupation:</span> {persona.occupation}</p>}
                  {persona.location && <p><span className="text-slate-500">Location:</span> {persona.location}</p>}
                  {persona.education && <p><span className="text-slate-500">Education:</span> {persona.education}</p>}
                  {persona.income && <p><span className="text-slate-500">Income:</span> {persona.income}</p>}
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Personality</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500"><span>Introvert</span><span>Extrovert</span></div>
                  <div className="h-2 bg-slate-700 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${100 - persona.personality.introvert}%` }}></div></div>
                  <div className="flex justify-between text-xs text-slate-500"><span>Analytical</span><span>Creative</span></div>
                  <div className="h-2 bg-slate-700 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${100 - persona.personality.analytical}%` }}></div></div>
                  <p className="text-sm mt-2"><span className="text-slate-500">Tech Savviness:</span> {persona.techSavviness.charAt(0).toUpperCase() + persona.techSavviness.slice(1)}</p>
                </div>
              </div>
            </div>

            {persona.bio && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Bio</h3>
                <p className="text-slate-300">{persona.bio}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {persona.goals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Goals</h3>
                  <ul className="space-y-1">{persona.goals.map((g, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-green-400">✓</span>{g}</li>)}</ul>
                </div>
              )}
              {persona.painPoints.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Pain Points</h3>
                  <ul className="space-y-1">{persona.painPoints.map((p, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-red-400">×</span>{p}</li>)}</ul>
                </div>
              )}
              {persona.behaviors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Behaviors</h3>
                  <ul className="space-y-1">{persona.behaviors.map((b, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-blue-400">•</span>{b}</li>)}</ul>
                </div>
              )}
              {persona.channels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Channels</h3>
                  <div className="flex flex-wrap gap-2">{persona.channels.map((c, i) => <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs">{c}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mt-6 no-print">
          <h2 className="text-lg font-semibold mb-4">Export</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={copyMarkdown} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
              {copied ? '✓ Copied!' : 'Copy Markdown'}
            </button>
            <button onClick={downloadMarkdown} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">Download .md</button>
            <button onClick={printPersona} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">Print / PDF</button>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 text-center mt-6 no-print">
          <h2 className="text-2xl font-bold mb-3">Want to collect real user feedback?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            IdeaLift helps product teams gather feature requests and feedback directly from Slack, Discord, and more.
            Turn real user input into actionable personas and roadmap items.
          </p>
          <a
            href="https://idealift.ai?utm_source=persona-generator&utm_medium=free-tool&utm_campaign=cta"
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

        <div className="mt-8 text-center text-slate-500 text-sm no-print">
          <p>Built by <a href="https://startvest.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Startvest</a> | Free to use, no sign-up required</p>
        </div>
      </div>
    </div>
  );
}
