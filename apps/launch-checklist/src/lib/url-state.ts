import { TemplateType, ChecklistState } from './types';

/**
 * Serialize state to URL-safe string
 * Format: template|item1,item2,item3|note1_id:note1_text,note2_id:note2_text
 * Uses base64 encoding to handle special characters
 */
export function serializeState(state: ChecklistState): string {
  const templatePart = state.template;
  const checkedPart = Array.from(state.checkedItems).join(',');

  // Encode notes as base64 to handle special characters
  const noteEntries = Object.entries(state.notes)
    .filter(([, note]) => note.trim().length > 0)
    .map(([id, note]) => `${id}:${btoa(encodeURIComponent(note))}`)
    .join(',');

  const parts = [templatePart, checkedPart];
  if (noteEntries) {
    parts.push(noteEntries);
  }

  return btoa(parts.join('|'));
}

/**
 * Deserialize state from URL parameter
 */
export function deserializeState(encoded: string): Partial<ChecklistState> | null {
  try {
    const decoded = atob(encoded);
    const [templatePart, checkedPart, notesPart] = decoded.split('|');

    const template = templatePart as TemplateType;
    const checkedItems = new Set(checkedPart?.split(',').filter(Boolean) || []);

    const notes: Record<string, string> = {};
    if (notesPart) {
      notesPart.split(',').forEach(entry => {
        const colonIndex = entry.indexOf(':');
        if (colonIndex > 0) {
          const id = entry.substring(0, colonIndex);
          const encodedNote = entry.substring(colonIndex + 1);
          try {
            notes[id] = decodeURIComponent(atob(encodedNote));
          } catch {
            // Skip invalid notes
          }
        }
      });
    }

    return { template, checkedItems, notes };
  } catch {
    return null;
  }
}

/**
 * Generate shareable URL with state
 */
export function generateShareUrl(state: ChecklistState): string {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://launch.startvest.ai';

  const serialized = serializeState(state);
  return `${baseUrl}?s=${serialized}`;
}
