export type ReportStatus = 'draft' | 'ready' | 'published' | 'unpublished' | 'archive';

export interface StatusOption {
  value: ReportStatus;
  label: string;
}

/**
 * Get valid next states for a report template based on current status
 * Transition rules:
 * - Draft → Ready, Published, Archive
 * - Ready → Draft, Published, Archive
 * - Published → Unpublished, Ready, Draft
 * - Unpublished → Draft, Ready, Published, Archive
 * - Archive → (no transitions allowed)
 */
export function getValidNextStates(currentStatus: ReportStatus): StatusOption[] {
  const allOptions: StatusOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'ready', label: 'Ready' },
    { value: 'published', label: 'Published' },
    { value: 'unpublished', label: 'Unpublished' },
    { value: 'archive', label: 'Archive' }
  ];

  switch (currentStatus) {
    case 'draft':
      return allOptions.filter(opt => ['ready', 'published', 'archive'].includes(opt.value));
    case 'ready':
      return allOptions.filter(opt => ['draft', 'published', 'archive'].includes(opt.value));
    case 'published':
      return allOptions.filter(opt => ['unpublished', 'ready', 'draft'].includes(opt.value));
    case 'unpublished':
      return allOptions.filter(opt => ['draft', 'ready', 'published', 'archive'].includes(opt.value));
    case 'archive':
      return []; // Cannot transition out of archive
    default:
      // Fallback for unknown status - show all options
      return allOptions;
  }
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: ReportStatus, to: ReportStatus): boolean {
  if (from === to) return true; // Same status is always allowed
  const validNextStates = getValidNextStates(from);
  return validNextStates.some(opt => opt.value === to);
}

/**
 * Check if a report template can be deleted based on its status
 * Only Draft and Unpublished reports can be deleted
 */
export function canDeleteReport(status: ReportStatus): boolean {
  return status === 'draft' || status === 'unpublished';
}