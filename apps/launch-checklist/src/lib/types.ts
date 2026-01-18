export type TemplateType = 'saas' | 'mobile-app' | 'open-source' | 'marketplace';

export type CategoryType = 'pre-launch' | 'launch-day' | 'post-launch';

export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  category: CategoryType;
  critical?: boolean;
}

export interface ChecklistTemplate {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  items: ChecklistItem[];
}

export interface ChecklistState {
  template: TemplateType;
  checkedItems: Set<string>;
  notes: Record<string, string>;
}

export interface CategoryProgress {
  category: CategoryType;
  label: string;
  total: number;
  completed: number;
  percentage: number;
}

export const CATEGORY_INFO: Record<CategoryType, { label: string; description: string }> = {
  'pre-launch': { label: 'Pre-Launch', description: 'Prepare everything before you go live' },
  'launch-day': { label: 'Launch Day', description: 'Execute on launch day' },
  'post-launch': { label: 'Post-Launch', description: 'Follow up after launch' },
};
