import { Feature, PrioritizationResult } from './types';

export function calculateRICEScore(feature: Omit<Feature, 'id' | 'riceScore' | 'priority'>): number {
  // RICE = (Reach * Impact * Confidence) / Effort
  // We invert effort so higher effort = lower score
  const invertedEffort = 11 - feature.effort; // 1 effort (hard) becomes 10, 10 effort (easy) becomes 1
  const score = (feature.reach * feature.impact * (feature.confidence / 10)) / Math.max(invertedEffort, 1);
  return Math.round(score * 10) / 10;
}

export function getPriority(riceScore: number): 'high' | 'medium' | 'low' {
  if (riceScore >= 7) return 'high';
  if (riceScore >= 4) return 'medium';
  return 'low';
}

export function prioritizeFeatures(features: Feature[]): PrioritizationResult {
  // Sort by RICE score descending
  const sorted = [...features].sort((a, b) => b.riceScore - a.riceScore);

  // Quick wins: high impact, low effort (effort >= 7 means easy)
  const quickWins = sorted.filter(f => f.impact >= 7 && f.effort >= 7).slice(0, 3);

  // Big bets: high impact, high effort (effort <= 4 means hard)
  const bigBets = sorted.filter(f => f.impact >= 7 && f.effort <= 4).slice(0, 3);

  return {
    features: sorted,
    summary: {
      highPriority: sorted.filter(f => f.priority === 'high').length,
      mediumPriority: sorted.filter(f => f.priority === 'medium').length,
      lowPriority: sorted.filter(f => f.priority === 'low').length,
      quickWins,
      bigBets,
    },
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function exportToCSV(features: Feature[]): string {
  const headers = ['Name', 'Description', 'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score', 'Priority'];
  const rows = features.map(f => [
    `"${f.name.replace(/"/g, '""')}"`,
    `"${f.description.replace(/"/g, '""')}"`,
    f.reach,
    f.impact,
    f.confidence,
    f.effort,
    f.riceScore,
    f.priority,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportToMarkdown(features: Feature[]): string {
  let md = '# Feature Prioritization Matrix\n\n';
  md += '## Prioritized Features\n\n';
  md += '| # | Feature | RICE Score | Priority | Reach | Impact | Confidence | Effort |\n';
  md += '|---|---------|------------|----------|-------|--------|------------|--------|\n';

  features.forEach((f, i) => {
    const priorityEmoji = f.priority === 'high' ? '🔴' : f.priority === 'medium' ? '🟡' : '🟢';
    md += `| ${i + 1} | ${f.name} | ${f.riceScore} | ${priorityEmoji} ${f.priority} | ${f.reach} | ${f.impact} | ${f.confidence} | ${f.effort} |\n`;
  });

  md += '\n---\n';
  md += '*Generated with [Feature Prioritizer](https://prioritize.tools.startvest.ai) by Startvest*\n';

  return md;
}
