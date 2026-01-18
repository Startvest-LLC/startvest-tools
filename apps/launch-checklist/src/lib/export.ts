import { ChecklistTemplate, ChecklistState, CategoryType, CATEGORY_INFO } from './types';

/**
 * Export checklist as Markdown
 */
export function exportToMarkdown(template: ChecklistTemplate, state: ChecklistState): string {
  const categories: CategoryType[] = ['pre-launch', 'launch-day', 'post-launch'];

  let md = `# ${template.icon} ${template.name} Checklist\n\n`;
  md += `> ${template.description}\n\n`;

  // Overall progress
  const totalItems = template.items.length;
  const completedItems = state.checkedItems.size;
  const percentage = Math.round((completedItems / totalItems) * 100);
  md += `**Overall Progress:** ${completedItems}/${totalItems} (${percentage}%)\n\n`;
  md += `---\n\n`;

  categories.forEach(category => {
    const categoryItems = template.items.filter(item => item.category === category);
    const categoryCompleted = categoryItems.filter(item => state.checkedItems.has(item.id)).length;
    const categoryInfo = CATEGORY_INFO[category];

    md += `## ${categoryInfo.label}\n`;
    md += `*${categoryInfo.description}* | ${categoryCompleted}/${categoryItems.length} completed\n\n`;

    categoryItems.forEach(item => {
      const checked = state.checkedItems.has(item.id);
      const checkbox = checked ? '[x]' : '[ ]';
      const critical = item.critical ? ' ⚠️' : '';
      md += `- ${checkbox} ${item.text}${critical}\n`;

      const note = state.notes[item.id];
      if (note) {
        md += `  - *Note: ${note}*\n`;
      }
    });

    md += '\n';
  });

  md += `---\n`;
  md += `*Generated with [Product Launch Checklist](https://launch.startvest.ai) by Startvest*\n`;

  return md;
}

/**
 * Download markdown as file
 */
export function downloadMarkdown(template: ChecklistTemplate, state: ChecklistState): void {
  const markdown = exportToMarkdown(template, state);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.id}-launch-checklist.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger print dialog (for PDF export via browser)
 */
export function printChecklist(): void {
  window.print();
}
